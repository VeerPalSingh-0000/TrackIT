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
    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg">
      <div className="flex items-center gap-2 w-20 flex-shrink-0">
        {icon}
        <span className="font-semibold text-sm text-slate-200 truncate">{name}</span>
      </div>
      <button onClick={toggleMute} className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700">
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        disabled={isMuted}
      />
    </div>
  );
};


// --- Main Ambient Sounds Component ---
const AmbientSounds = () => {
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
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaMusic />
        <span className="hidden sm:inline">Sounds</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // ✨ FINAL FIX: Positions the menu in the middle of the screen on mobile
            // and reverts to being attached to the button on larger screens.
            className="fixed top-20 w-64 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-20 sm:absolute sm:w-72 sm:top-full sm:left-auto sm:right-0 sm:-translate-x-0"
          >
            <h3 className="font-bold text-lg text-white mb-4 text-center">Ambient Sounds</h3>
            <div className="space-y-3">
              <SoundControl name="Rain" icon={<span className="text-xl">🌧️</span>} audioRef={audioRefs.rain} />
              <SoundControl name="Forest" icon={<span className="text-xl">🌲</span>} audioRef={audioRefs.forest} />
              <SoundControl name="Cafe" icon={<span className="text-xl">☕</span>} audioRef={audioRefs.cafe} />
              <SoundControl name="Lofi" icon={<span className="text-xl">🎵</span>} audioRef={audioRefs.lofi} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmbientSounds;
