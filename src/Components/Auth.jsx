import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthComponent } from "./ui/sign-up";
import TrackerLogo from "/clock.png?url";
import { Gem } from "lucide-react";

const FocusFlowLogo = () => (
  <div className="flex items-center gap-2">
    <img src={TrackerLogo} alt="FocusFlow" className="h-6 w-6 object-contain" />
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { signup, login, loginWithGoogle } = useAuth();

  const handleSignUp = async (email, password) => {
    await signup(email, password);
  };

  const handleLogin = async (email, password) => {
    await login(email, password);
  };

  const handleGoogleSignIn = async () => {
    await loginWithGoogle();
  };

  return (
    <AuthComponent
      logo={<FocusFlowLogo />}
      brandName="FocusFlow"
      isLoginMode={isLogin}
      onToggleMode={() => setIsLogin(!isLogin)}
      onSignUp={handleSignUp}
      onLogin={handleLogin}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
};

export default Auth;
