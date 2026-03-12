import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AmbientSounds from './AmbientSounds';
import { FaPlus, FaHistory, FaSignOutAlt, FaInfoCircle, FaStar, FaChevronDown, FaMusic } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useTheme, themes } from '../contexts/ThemeContext';
import TrackerLogo from '../../public/clock.png';

/**
 * Premium navigation bar — glassmorphic, floating, Linear/Arc-inspired.
 */
const Navbar = ({ onNewProjectClick, onHistoryClick, onLogout, user, onAboutClick, onFeaturesClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  // Custom theme hook
  const { currentThemeId, setCurrentThemeId } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const userInitial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  // --- Mobile nav link ---
  const MobileLink = ({ onClick, children, icon, variant = 'default', closeMenu = true }) => (
    <button
      onClick={(e) => { if (onClick) onClick(e); if (closeMenu) setMobileOpen(false); }}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-[15px] font-medium rounded-2xl transition-all duration-200 active:scale-[0.98] focus:outline-none ${
        variant === 'danger'
          ? 'text-rose-400 hover:bg-rose-500/10'
          : variant === 'primary'
          ? 'text-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-500)]/10'
          : 'text-[var(--color-slate-300)] hover:bg-[var(--color-slate-700)]/50 hover:text-[var(--color-white)]'
      }`}
    >
      {icon && <span className="text-[16px] opacity-70 w-5 flex justify-center">{icon}</span>}
      {children}
    </button>
  );

  return (
    <>
      {/* ─── Floating Navbar Container ─── */}
      <div className="sticky top-0 z-50 w-full px-3 sm:px-5 pt-3 native-app:pt-0 native-app:safe-mt">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`mx-auto max-w-5xl rounded-2xl transition-all duration-500 motion-safe-gpu ${
            scrolled
              ? 'bg-[var(--color-slate-900)]/70 backdrop-blur-2xl border border-[var(--color-slate-700)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              : 'bg-[var(--color-slate-900)]/50 backdrop-blur-xl border border-[var(--color-slate-700)] shadow-[0_4px_24px_rgba(0,0,0,0.25)]'
          }`}
        >
          <div className="flex items-center justify-between h-[52px] px-3 sm:px-4">
            
            {/* ─── Left: Logo ─── */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={TrackerLogo}
                  alt="FocusFlow"
                  className="relative h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
                  loading="eager"
                />
              </div>
              <span className="hidden sm:block text-[16px] font-bold text-[var(--color-white)] tracking-tight">
                FocusFlow
              </span>
            </button>

            {/* Center is empty to let elements justify between left and right */}
            <div className="flex-1" />

            {/* ─── Right: Actions ─── */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* History Button - Top Right */}
              <button
                onClick={onHistoryClick}
                className="hidden md:flex items-center justify-center w-9 h-9 text-[var(--color-slate-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-white)]/10 rounded-full transition-all duration-200 focus:outline-none"
                title="History"
              >
                <FaHistory className="text-[14px]" />
              </button>

              {/* Ambient Sounds */}
              <div className="hidden sm:block">
                <AmbientSounds />
              </div>

              {/* New Project CTA */}
              <motion.button
                onClick={onNewProjectClick}
                className="hidden md:flex items-center gap-1.5 h-[34px] px-4 text-[13px] font-semibold text-[#ffffff] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-full shadow-[0_2px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all duration-300 focus:outline-none"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaPlus className="text-[10px]" />
                New Project
              </motion.button>

              {/* Profile dropdown */}
              <div className="hidden md:block relative" ref={profileRef}>
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-1.5 h-[34px] pl-1 pr-2.5 rounded-full transition-all duration-200 focus:outline-none border ${
                    profileOpen 
                      ? 'bg-white/[0.1] border-white/[0.12]' 
                      : 'hover:bg-white/[0.06] border-transparent hover:border-white/[0.06]'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-[#ffffff] ring-2 ring-[var(--color-slate-900)]/50">
                    {userInitial}
                  </div>
                  <FaChevronDown className={`text-[9px] text-[var(--color-slate-400)] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2.5 w-72 bg-[var(--color-slate-900)] backdrop-blur-2xl border border-[var(--color-slate-700)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden origin-top-right"
                    >
                      {/* User info card */}
                      <div className="p-4 border-b border-[var(--color-slate-700)]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-[#ffffff] shadow-lg ring-2 ring-[var(--color-slate-700)]">
                            {userInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[var(--color-white)] truncate">{user?.displayName || 'FocusFlow User'}</p>
                            <p className="text-[12px] text-[var(--color-slate-400)] truncate">{user?.email || ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-1.5">
                        {/* Theme Picker */}
                        <div className="px-3 py-2 mb-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Theme</p>
                          <div className="flex items-center gap-2">
                            {themes.map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => setCurrentThemeId(theme.id)}
                                title={theme.name}
                                className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 ${
                                  currentThemeId === theme.id ? 'border-[var(--color-emerald-500)] scale-110 shadow-lg' : 'border-[var(--color-slate-700)] hover:scale-110 hover:border-[var(--color-emerald-500)]/50'
                                }`}
                                style={{ 
                                  background: `linear-gradient(135deg, ${theme.colors['--color-slate-950']} 50%, ${theme.colors['--color-emerald-500']} 50%)`
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-white/[0.06] mx-2 my-1" />

                        {[
                          { icon: <FaInfoCircle />, label: 'About', onClick: onAboutClick },
                          { icon: <FaStar />, label: 'Features', onClick: onFeaturesClick },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { setProfileOpen(false); item.onClick(); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[var(--color-slate-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-slate-700)]/50 rounded-xl transition-all duration-150"
                          >
                            <span className="text-[13px] opacity-50 w-4 flex justify-center">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                        
                        <div className="h-px bg-white/[0.06] mx-2 my-1" />
                        
                        <button
                          onClick={() => { setProfileOpen(false); onLogout(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-150"
                        >
                          <FaSignOutAlt className="text-[13px] w-4 flex justify-center" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hamburger - Mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-[var(--color-slate-300)] hover:text-[var(--color-white)] hover:bg-[var(--color-slate-700)]/50 transition-all duration-200 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <HiX className="text-xl" /> : <HiMenuAlt3 className="text-xl" />}
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* ─── Mobile Menu Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md md:hidden"
            />

            {/* Panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-[var(--color-slate-950)] border-l border-[var(--color-slate-700)] flex flex-col md:hidden motion-safe-gpu"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between h-[60px] px-5 border-b border-[var(--color-slate-700)]/50 safe-pt">
                <div className="flex items-center gap-2.5">
                  <img src={TrackerLogo} alt="FocusFlow" className="h-10 w-10 object-contain" />
                  <span className="text-[16px] font-bold text-[var(--color-white)] tracking-tight">FocusFlow</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-slate-400)] hover:text-[var(--color-white)] hover:bg-[var(--color-slate-700)]/50 transition-colors"
                >
                  <HiX className="text-lg" />
                </button>
              </div>

              {/* User card */}
               {user && (
                <div className="mx-4 mt-5 mb-3 p-4 bg-[var(--color-slate-900)] border border-[var(--color-slate-700)] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-[#ffffff] flex-shrink-0 ring-2 ring-[var(--color-slate-700)]">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--color-white)] truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-[var(--color-slate-400)] truncate">{user.email || ''}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="mb-2 px-4">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">Navigate</span>
                </div>
                <MobileLink onClick={onHistoryClick} icon={<FaHistory />}>History</MobileLink>

                <div className="h-px bg-white/[0.05] mx-4 my-4" />

                <div className="mb-2 px-4">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">Actions</span>
                </div>
                <MobileLink onClick={onNewProjectClick} icon={<FaPlus />} variant="primary">New Project</MobileLink>

                {/* Ambient sounds in mobile */}
                <div className="sm:hidden px-0">
                  <AmbientSounds customTrigger={
                    <MobileLink closeMenu={false} icon={<FaMusic />}>Ambient Sounds</MobileLink>
                  } />
                </div>
              </div>

               {/* Profile Actions & Sign out at bottom */}
              <div className="p-3 border-t border-[var(--color-slate-700)]/50">
                 {/* Theme Picker - Mobile */}
                <div className="px-5 py-4 mb-2 bg-[var(--color-slate-900)]/50 rounded-2xl border border-[var(--color-slate-700)]">
                  <p className="text-[10px] font-bold text-[var(--color-slate-500)] uppercase tracking-widest mb-3">Theme</p>
                  <div className="flex items-center gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setCurrentThemeId(theme.id)}
                        title={theme.name}
                        className={`w-9 h-9 rounded-full border-2 transition-transform duration-200 ${
                          currentThemeId === theme.id ? 'border-[var(--color-emerald-500)] scale-110 shadow-lg' : 'border-[var(--color-slate-700)] hover:scale-110 shadow-md hover:border-[var(--color-emerald-500)]/50'
                        }`}
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.colors['--color-slate-950']} 50%, ${theme.colors['--color-emerald-500']} 50%)`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <MobileLink onClick={onAboutClick} icon={<FaInfoCircle />}>About</MobileLink>
                <MobileLink onClick={onFeaturesClick} icon={<FaStar />}>Features</MobileLink>
                <div className="h-px bg-white/[0.06] mx-4 my-2" />
                <MobileLink onClick={onLogout} icon={<FaSignOutAlt />} variant="danger">Sign out</MobileLink>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
