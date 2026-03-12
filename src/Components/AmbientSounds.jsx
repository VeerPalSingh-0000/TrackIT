import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// Assuming local sound files are set up correctly in your project
import rainSound from '../../public/sounds/rain.mp3';
import forestSound from '../../public/sounds/forest.mp3';
import cafeSound from '../../public/sounds/cafe.mp3';
import lofiSound from '../../public/sounds/lofi.mp3';

const soundSources = {
  rain: rainSound,
  forest: forestSound,
  cafe: cafeSound,
  lofi: lofiSound, 
};

// --- Individual Sound Control Component ---
const SoundControl = ({ name, icon, audioRef }) => {
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  const toggleMute = () => {
    const currentlyMuted = !isMuted;
    setIsMuted(currentlyMuted);
    if (audioRef.current) {
      audioRef.current.muted = currentlyMuted;
      if (!currentlyMuted && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-[var(--color-slate-900)]/40 border border-[var(--color-slate-700)]/50 p-2 rounded-xl transition-colors">
      <div className="flex items-center gap-2 w-20 flex-shrink-0">
        {icon}
        <span className="font-bold text-[13px] text-[var(--color-white)] truncate transition-colors">{name}</span>
      </div>
      <button onClick={toggleMute} className="text-[var(--color-slate-400)] hover:text-[var(--color-white)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-slate-700)]">
        {isMuted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm text-[var(--color-emerald-400)]" />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[var(--color-slate-700)] rounded-lg appearance-none cursor-pointer accent-[var(--color-emerald-500)]"
        disabled={isMuted}
      />
    </div>
  );
};


// --- Main Ambient Sounds Component ---
const AmbientSounds = ({ customTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const audioRefs = {
    rain: useRef(new Audio(soundSources.rain)),
    forest: useRef(new Audio(soundSources.forest)),
    cafe: useRef(new Audio(soundSources.cafe)),
    lofi: useRef(new Audio(soundSources.lofi)),
  };

  useEffect(() => {
    Object.values(audioRefs).forEach(ref => {
        ref.current.loop = true;
        ref.current.preload = 'auto';
    });
    return () => {
        Object.values(audioRefs).forEach(ref => ref.current.pause());
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      // Close if clicked outside of the component
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {customTrigger ? (
        React.cloneElement(customTrigger, { onClick: () => setIsOpen(!isOpen) })
      ) : (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 h-[34px] px-3.5 rounded-full text-[13px] font-bold transition-all duration-200 border ${
            isOpen 
              ? 'bg-[var(--color-slate-700)] border-[var(--color-slate-700)] text-[var(--color-white)]'
              : 'bg-[var(--color-slate-900)]/40 hover:bg-[var(--color-slate-800)] border-[var(--color-slate-700)]/50 text-[var(--color-slate-400)] hover:text-[var(--color-white)]'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <FaMusic className="text-[10px] text-amber-400" />
          <span className="hidden sm:inline">Sounds</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 w-64 left-1/2 -translate-x-1/2 bg-[var(--color-slate-900)]/95 backdrop-blur-2xl border border-[var(--color-slate-700)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 z-20 sm:absolute sm:w-72 sm:top-full sm:mt-2 sm:left-auto sm:right-0 sm:-translate-x-0"
          >
            <h3 className="font-bold text-[15px] text-[var(--color-white)] mb-3.5">🎧 Ambient Sounds</h3>
            <div className="space-y-2">
              <SoundControl name="Rain" icon={<span className="text-lg">🌧️</span>} audioRef={audioRefs.rain} />
              <SoundControl name="Forest" icon={<span className="text-lg">🌲</span>} audioRef={audioRefs.forest} />
              <SoundControl name="Cafe" icon={<span className="text-lg">☕</span>} audioRef={audioRefs.cafe} />
              <SoundControl name="Lofi" icon={<span className="text-lg">🎵</span>} audioRef={audioRefs.lofi} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmbientSounds;
