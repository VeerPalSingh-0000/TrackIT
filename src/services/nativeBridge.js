/**
 * Native Bridge — Capacitor integration layer for FocusFlow Android App.
 *
 * This module provides a clean API for native device features.
 * On web, all calls gracefully degrade to no-ops.
 */
import { Capacitor } from "@capacitor/core";

/** Check if we are running inside a native app container */
export const isNative = () => Capacitor.isNativePlatform();

/** ─── Status Bar ─── */
let StatusBar = null;

export const initStatusBar = async () => {
  if (!isNative()) return;
  try {
    const mod = await import("@capacitor/status-bar");
    StatusBar = mod.StatusBar;
    // Make status bar transparent so our UI extends behind it
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: "#020617" });
    await StatusBar.setStyle({ style: "DARK" });
  } catch (e) {
    console.warn("[NativeBridge] StatusBar init failed:", e);
  }
};

export const setStatusBarColor = async (color) => {
  if (!StatusBar) return;
  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (e) {
    /* ignore */
  }
};

/** ─── Splash Screen ─── */
export const hideSplashScreen = async () => {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (e) {
    console.warn("[NativeBridge] SplashScreen hide failed:", e);
  }
};

/** ─── Haptics ─── */
let Haptics = null;
let ImpactStyle = null;

const loadHaptics = async () => {
  if (!isNative() || Haptics) return;
  try {
    const mod = await import("@capacitor/haptics");
    Haptics = mod.Haptics;
    ImpactStyle = mod.ImpactStyle;
  } catch (e) {
    console.warn("[NativeBridge] Haptics load failed:", e);
  }
};

export const preloadNativeFeedback = async () => {
  await loadHaptics();
};

/** Light tap feedback — for general button presses */
export const hapticLight = async () => {
  await loadHaptics();
  if (!Haptics) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {
    /* ignore */
  }
};

/** Medium tap feedback — for starting/stopping timers */
export const hapticMedium = async () => {
  await loadHaptics();
  if (!Haptics) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (e) {
    /* ignore */
  }
};

/** Heavy tap feedback — for critical actions like completing a session */
export const hapticHeavy = async () => {
  await loadHaptics();
  if (!Haptics) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) {
    /* ignore */
  }
};

/** Success notification vibration */
export const hapticSuccess = async () => {
  await loadHaptics();
  if (!Haptics) return;
  try {
    await Haptics.notification({ type: "SUCCESS" });
  } catch (e) {
    /* ignore */
  }
};

/** ─── Keyboard ─── */
export const initKeyboard = async () => {
  if (!isNative()) return;
  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    // Automatically scroll focused input into view
    Keyboard.addListener("keyboardWillShow", () => {
      document.body.classList.add("keyboard-open");
    });
    Keyboard.addListener("keyboardWillHide", () => {
      document.body.classList.remove("keyboard-open");
    });
  } catch (e) {
    console.warn("[NativeBridge] Keyboard init failed:", e);
  }
};

/** ─── Initialize all native features ─── */
export const initNative = async () => {
  if (!isNative()) return;
  console.log("[NativeBridge] Initializing native features...");

  // Add class for performance CSS overrides
  document.body.classList.add("native-app");

  await initStatusBar();
  await initKeyboard();
  // Hide splash after web app is ready
  setTimeout(() => hideSplashScreen(), 500);
  console.log("[NativeBridge] Native features initialized.");
};
