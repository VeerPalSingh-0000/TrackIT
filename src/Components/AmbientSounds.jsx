import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// --- Local Audio Imports ---
// This pattern allows Vite/CRA to process the audio files and provide a public URL.
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
const SoundControl = ({ name, icon, audioRef, initialVolume = 0.5 }) => {
  const [volume, setVolume] = useState(initialVolume);
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
      // Autoplay when unmuted
      if (!currentlyMuted && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    }
  };

  return (
    <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg">
      <div className="flex items-center gap-2 w-24">
        {icon}
        <span className="font-semibold text-sm text-slate-200">{name}</span>
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
  
  // Use refs to hold the audio elements, initialized with the imported sound sources.
  const audioRefs = {
    rain: useRef(new Audio(soundSources.rain)),
    forest: useRef(new Audio(soundSources.forest)),
    cafe: useRef(new Audio(soundSources.cafe)),
    lofi: useRef(new Audio(soundSources.lofi)),
  };

  // Set loop for applicable sounds and other properties
  useEffect(() => {
    Object.entries(audioRefs).forEach(([key, ref]) => {
        const audio = ref.current;
        // All local sounds can be looped.
        audio.loop = true;
        audio.preload = 'auto';
    });
    
    // Cleanup on unmount
    return () => {
        Object.values(audioRefs).forEach(ref => ref.current.pause());
    };
  }, [audioRefs]);

  return (
    <div className="relative">
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
            // Retaining the responsive fix for mobile UI
            className="absolute top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-20 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0"
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
