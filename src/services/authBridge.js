import { auth } from "../firebase/config";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

/**
 * Service to handle Google Sign-In using the Chrome Identity API.
 * This is the only way to perform OAuth from within a non-dom context
 * like a background service worker or extension popup in MV3.
 */
export const extensionAuth = {
  /**
   * Triggers a sign-in flow using Chrome Identity.
   * @returns {Promise<User>} The signed-in Firebase user.
   */
  signIn: () => {
    return new Promise((resolve, reject) => {
      try {
        // By using launchWebAuthFlow and passing prompt=select_account,
        // we force Chrome to let the user select which Google Account they
        // want to sign in with, instead of defaulting to the synced Chrome profile.
        try {
          const manifest = chrome.runtime.getManifest();
          if (!manifest.oauth2 || !manifest.oauth2.client_id) {
            return reject(
              new Error(
                "OAuth2 client_id not found in manifest. Check extension configuration.",
              ),
            );
          }
          const clientId = manifest.oauth2.client_id;
          const redirectUri = chrome.identity.getRedirectURL();

          // Build traditional Google OAuth URL with prompt=select_account
          const scopes = encodeURIComponent(
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
          );
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
            redirectUri,
          )}&scope=${scopes}&prompt=select_account`;

          chrome.identity.launchWebAuthFlow(
            { url: authUrl, interactive: true },
            async (responseUrl) => {
              if (chrome.runtime.lastError || !responseUrl) {
                const errorMessage = chrome.runtime.lastError?.message
                  ? `Chrome Identity Error: ${chrome.runtime.lastError.message}`
                  : "Auth flow was cancelled or failed.";
                console.error("❌ Auth Flow Failed:", {
                  error: errorMessage,
                  lastError: chrome.runtime.lastError,
                  redirectUri: redirectUri,
                  clientId: clientId,
                });
                return reject(new Error(errorMessage));
              }

              try {
                console.info("✅ Auth flow succeeded, exchanging token...", {
                  redirectUri: redirectUri,
                });
                // The token is returned in the URL hash: https://<id>.chromiumapp.org/#access_token=token...
                const urlObj = new URL(responseUrl.replace("#", "?"));
                const accessToken = urlObj.searchParams.get("access_token");

                if (!accessToken) {
                  console.error("❌ No access token found in response");
                  return reject(
                    new Error(
                      "No access_token found after user selected account.",
                    ),
                  );
                }

                console.info(
                  "✅ Access token received, authenticating with Firebase...",
                );
                // Authenticate with Firebase using the new access token
                const credential = GoogleAuthProvider.credential(
                  null,
                  accessToken,
                );
                const userCredential = await signInWithCredential(
                  auth,
                  credential,
                );

                if (userCredential.user) {
                  console.info("✅ Firebase auth successful:", {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                  });
                  // Success: Store the user info in storage for background access
                  chrome.storage.local.set({
                    currentUser: {
                      uid: userCredential.user.uid,
                      email: userCredential.user.email,
                      displayName:
                        userCredential.user.displayName ||
                        userCredential.user.email,
                    },
                  });
                  resolve(userCredential.user);
                } else {
                  console.error("❌ Firebase auth returned no user object");
                  reject(
                    new Error(
                      "Firebase authentication failed - no user object returned.",
                    ),
                  );
                }
              } catch (error) {
                console.error(
                  "❌ Error during Firebase authentication:",
                  error,
                );
                reject(error);
              }
            },
          );
        } catch (manifestError) {
          console.error(
            "Manifest or OAuth configuration error:",
            manifestError,
          );
          reject(new Error(`Configuration error: ${manifestError.message}`));
        }
      } catch (err) {
        console.error("Sign-in initialization error:", err);
        reject(new Error(`Sign-in error: ${err.message}`));
      }
    });
  },

  /**
   * Logs out the user via Firebase.
   */
  signOut: async () => {
    try {
      await auth.signOut();
      chrome.storage.local.set({ currentUser: null });
      // Remove the cached token to ensure the next sign-in prompts for an account.
      chrome.identity.clearAllCachedAuthTokens(() => {});
    } catch (error) {
      const errorMsg =
        error?.message || String(error) || "Unknown sign-out error";
      console.error("Sign-out Error:", errorMsg);
      throw new Error(`Sign-out failed: ${errorMsg}`);
    }
  },
};

export default extensionAuth;
