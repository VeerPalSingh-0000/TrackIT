import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AmbientSounds from "./AmbientSounds";
import {
  FaPlus,
  FaHistory,
  FaSignOutAlt,
  FaInfoCircle,
  FaStar,
  FaChevronDown,
  FaMusic,
  FaTrash,
  FaCog,
} from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useTheme, themes } from "../contexts/ThemeContext";
import TrackerLogo from "/clock.png?url";

// 1. EXTRACTED FOR PERFORMANCE: Prevents lag during animations
const MobileLink = React.memo(
  ({ onClick, children, icon, variant = "default" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 text-[15px] font-medium rounded-2xl transition-all duration-300 ease-in-out focus:outline-none select-none active:scale-[0.98] ${
        variant === "danger"
          ? "text-rose-400 hover:bg-rose-500/10"
          : variant === "primary"
          ? "text-[var(--color-emerald-400)] bg-[var(--color-emerald-500)]/10 hover:bg-[var(--color-emerald-500)]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          : "text-[var(--color-slate-300)] hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon && (
        <span
          className={`text-[18px] flex justify-center ${
            variant === "primary" ? "opacity-100" : "opacity-50"
          }`}
        >
          {icon}
        </span>
      )}
      {children}
    </button>
  ),
);

const Navbar = React.memo(({
  onNewProjectClick,
  onHistoryClick,
  onSettingsClick,
  onLogout,
  user,
  onAboutClick,
  onFeaturesClick,
  onDeleteHistoryClick,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const { currentThemeId, setCurrentThemeId } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Wrap actions to automatically close the mobile menu smoothly
  const handleMobileAction = useCallback((action) => {
    return (e) => {
      if (action) action(e);
      setMobileOpen(false);
    };
  }, []);

  const userInitial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      {/* DESKTOP NAVBAR (Kept your existing styling here) */}
      <div
        className={`home-navbar-wrap sticky top-0 w-full px-3 sm:px-5 pt-[calc(0.95rem+var(--sat))] max-[700px]:pt-[calc(0.7rem+var(--sat))] native-app:pt-0 native-app:safe-mt transition-all duration-300 z-40 ${
          mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
          className={`mx-auto max-w-5xl rounded-2xl transition-all duration-500 motion-safe-gpu ${
            scrolled
              ? "bg-[var(--color-slate-900)]/70 backdrop-blur-2xl border border-[var(--color-slate-700)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "bg-[var(--color-slate-900)]/50 backdrop-blur-xl border border-[var(--color-slate-700)] shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
          }`}
        >
          <div className="home-navbar-inner flex items-center justify-between h-[56px] max-[700px]:h-[50px] px-3 sm:px-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 group focus:outline-none select-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={TrackerLogo}
                  alt="FocusFlow"
                  className="home-navbar-logo relative h-10 w-10 object-contain transition-transform duration-300"
                  loading="eager"
                />
              </div>
              <span className="hidden sm:block text-[16px] font-bold text-[var(--color-white)] tracking-tight">
                FocusFlow
              </span>
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onHistoryClick}
                className="hidden md:flex items-center justify-center w-9 h-9 text-[var(--color-slate-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-white)]/10 rounded-full transition-all duration-300 focus:outline-none select-none"
                title="History"
              >
                <FaHistory className="text-[14px]" />
              </button>

              <div className="hidden sm:block">
                <AmbientSounds />
              </div>

              <motion.button
                onClick={onNewProjectClick}
                className="hidden md:flex items-center gap-1.5 h-[34px] px-4 text-[13px] font-semibold text-[#000000] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-full shadow-[0_2px_12px_rgba(16,185,129,0.25)] transition-all duration-300 focus:outline-none select-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <FaPlus className="text-[10px]" /> New Project
              </motion.button>

              <div className="hidden md:block relative" ref={profileRef}>
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-1.5 h-[34px] pl-1 pr-2.5 rounded-full transition-all duration-300 focus:outline-none select-none border ${
                    profileOpen
                      ? "bg-white/[0.1] border-white/[0.12]"
                      : "hover:bg-white/[0.06] border-transparent"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-[#ffffff] ring-2 ring-[var(--color-slate-900)]/50">
                    {userInitial}
                  </div>
                  <motion.div
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center justify-center"
                  >
                    <FaChevronDown className="text-[9px] text-[var(--color-slate-400)]" />
                  </motion.div>
                </motion.button>

                {/* Profile Dropdown Logic Kept Identical for Desktop */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 250,
                      }}
                      className="absolute right-0 mt-2.5 w-72 bg-[var(--color-slate-900)] backdrop-blur-2xl border border-[var(--color-slate-700)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden origin-top-right"
                    >
                      {/* Dropdown Content */}
                      <div className="p-4 border-b border-[var(--color-slate-700)]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-[#ffffff] shadow-lg ring-2 ring-[var(--color-slate-700)]">
                            {userInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[var(--color-white)] truncate">
                              {user?.displayName || "FocusFlow User"}
                            </p>
                            <p className="text-[12px] text-[var(--color-slate-400)] truncate">
                              {user?.email || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <div className="px-3 py-1 mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setThemeDropdownOpen(!themeDropdownOpen);
                            }}
                            className="flex items-center justify-between w-full text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider mb-1 py-1 focus:outline-none transition-colors"
                          >
                            <span>Theme</span>
                            <motion.div
                              animate={{ rotate: themeDropdownOpen ? 180 : 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                              }}
                            >
                              <FaChevronDown className="text[10px]" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {themeDropdownOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                  scale: 1,
                                }}
                                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                                transition={{
                                  type: "spring",
                                  damping: 25,
                                  stiffness: 250,
                                }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center justify-between gap-1 py-2">
                                  {themes.map((theme) => (
                                    <motion.button
                                      key={theme.id}
                                      onClick={() => {
                                        setCurrentThemeId(theme.id);
                                        setProfileOpen(false);
                                      }}
                                      title={theme.name}
                                      className={`w-8 h-8 rounded-full border-2 transition-transform duration-300 ease-in-out ${
                                        currentThemeId === theme.id
                                          ? "border-[var(--color-emerald-500)] scale-110 shadow-lg"
                                          : "border-[var(--color-slate-700)] hover:border-[var(--color-emerald-500)]/50"
                                      }`}
                                      style={{
                                        background: `linear-gradient(135deg, ${theme.colors["--color-slate-950"]} 50%, ${theme.colors["--color-emerald-500"]} 50%)`,
                                      }}
                                      whileHover={{ scale: 1.15 }}
                                      whileTap={{ scale: 0.9 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                      }}
                                    />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="h-px bg-white/[0.06] mx-2 my-1" />
                        {[
                          {
                            icon: <FaInfoCircle />,
                            label: "About",
                            onClick: onAboutClick,
                          },
                          {
                            icon: <FaStar />,
                            label: "Features",
                            onClick: onFeaturesClick,
                          },
                          {
                            icon: <FaCog />,
                            label: "Settings",
                            onClick: onSettingsClick,
                          },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              setProfileOpen(false);
                              item.onClick();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[var(--color-slate-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-slate-700)]/50 rounded-xl transition-all duration-200 ease-in-out select-none"
                          >
                            <span className="text-[13px] opacity-50 w-4 flex justify-center">
                              {item.icon}
                            </span>
                            {item.label}
                          </button>
                        ))}
                        <div className="h-px bg-white/[0.06] mx-2 my-1" />
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onDeleteHistoryClick();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-xl transition-all duration-200 ease-in-out select-none"
                        >
                          <FaTrash className="text-[13px] w-4 flex justify-center" />
                          Delete History
                        </button>
                        <div className="h-px bg-white/[0.06] mx-2 my-1" />
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-200 ease-in-out select-none"
                        >
                          <FaSignOutAlt className="text-[13px] w-4 flex justify-center" />{" "}
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MOBILE HAMBURGER ICON */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-slate-300)] hover:text-white hover:bg-white/10 transition-all duration-300 focus:outline-none select-none"
              >
                <HiMenuAlt3 className="text-[22px]" />
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* --- REFINED MOBILE MENU --- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop: Solid color instead of blur to prevent massive GPU lag on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-[var(--color-slate-950)]/80 md:hidden motion-safe-gpu"
            />

            {/* Side Drawer: Clean and high performance mapping */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[320px] bg-[var(--color-slate-950)]/95 border-l border-white/[0.05] flex flex-col md:hidden shadow-2xl motion-safe-gpu"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-[68px] px-6 safe-pt">
                <div className="flex items-center gap-3">
                  <img
                    src={TrackerLogo}
                    alt="FocusFlow"
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-[17px] font-semibold text-white tracking-tight">
                    FocusFlow
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-[var(--color-slate-400)] hover:text-white hover:bg-white/10 transition-colors select-none"
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              {/* User Profile - Minimalist without the harsh box */}
              {user && (
                <div className="px-6 py-5 flex items-center gap-4 border-b border-white/[0.05]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg ring-4 ring-[var(--color-slate-950)]">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-white truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-[13px] text-[var(--color-slate-400)] truncate">
                      {user.email || ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Links - Pure whitespace, no headers */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
                <MobileLink
                  onClick={handleMobileAction(onNewProjectClick)}
                  icon={<FaPlus />}
                  variant="primary"
                >
                  New Project
                </MobileLink>
                <MobileLink
                  onClick={handleMobileAction(onHistoryClick)}
                  icon={<FaHistory />}
                >
                  Session History
                </MobileLink>

                <div className="sm:hidden px-0">
                  <AmbientSounds
                    customTrigger={
                      <button className="w-full flex items-center gap-4 px-4 py-3.5 text-[15px] font-medium rounded-2xl transition-all text-[var(--color-slate-300)] hover:bg-white/5 hover:text-white active:scale-[0.98]">
                        <span className="text-[18px] opacity-50 flex justify-center w-5">
                          <FaMusic />
                        </span>
                        Ambient Sounds
                      </button>
                    }
                  />
                </div>

                <div className="h-px bg-white/[0.05] mx-4 my-4" />

                <MobileLink
                  onClick={handleMobileAction(onAboutClick)}
                  icon={<FaInfoCircle />}
                >
                  About FocusFlow
                </MobileLink>
                <MobileLink
                  onClick={handleMobileAction(onFeaturesClick)}
                  icon={<FaStar />}
                >
                  Features
                </MobileLink>
                <MobileLink
                  onClick={handleMobileAction(onSettingsClick)}
                  icon={<FaCog />}
                >
                  Settings
                </MobileLink>
                <MobileLink
                  onClick={handleMobileAction(onDeleteHistoryClick)}
                  icon={<FaTrash />}
                  variant="default"
                >
                  Delete History
                </MobileLink>
              </div>

              {/* Footer: Themes & Logout */}
              <div className="px-4 pb-8 pt-4 border-t border-white/[0.05] bg-white/[0.01]">
                <div className="px-4 mb-4">
                  <button
                    onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                    className="flex items-center justify-between w-full text-[11px] font-semibold text-[var(--color-slate-500)] uppercase tracking-widest mb-1 py-2 focus:outline-none transition-colors"
                  >
                    <span>Theme</span>
                    <motion.div
                      animate={{ rotate: themeDropdownOpen ? 180 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      <FaChevronDown />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {themeDropdownOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, scale: 0.95 }}
                        animate={{ height: "auto", opacity: 1, scale: 1 }}
                        exit={{ height: 0, opacity: 0, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          damping: 25,
                          stiffness: 250,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-4 py-3">
                          {themes.map((theme) => (
                            <motion.button
                              key={theme.id}
                              onClick={() => {
                                setCurrentThemeId(theme.id);
                                setMobileOpen(false);
                              }}
                              className={`w-10 h-10 rounded-full border-[3px] transition-all duration-300 ease-in-out ${
                                currentThemeId === theme.id
                                  ? "border-[var(--color-emerald-500)] scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                  : "border-transparent hover:border-white/20"
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${theme.colors["--color-slate-900"]} 0%, ${theme.colors["--color-emerald-600"]} 100%)`,
                              }}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileLink
                  onClick={handleMobileAction(onLogout)}
                  icon={<FaSignOutAlt />}
                  variant="danger"
                >
                  Sign out
                </MobileLink>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

export default Navbar;
