import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMusic,
  FaVolumeUp,
  FaVolumeMute,
  FaWind,
  FaTree,
  FaCoffee,
  FaHeadphones,
} from "react-icons/fa";

// Sound files imports
import rainSound from "/sounds/rain.ogg?url";
import forestSound from "/sounds/forest.ogg?url";
import cafeSound from "/sounds/cafe.ogg?url";
import lofiSound from "/sounds/lofi.ogg?url";

// 1. CREATE AUDIO INSTANCES GLOBALLY
// Moving this outside ensures the audio survives when the mobile menu closes
const audioInstances = {
  rain: typeof Audio !== "undefined" ? new Audio(rainSound) : null,
  forest: typeof Audio !== "undefined" ? new Audio(forestSound) : null,
  cafe: typeof Audio !== "undefined" ? new Audio(cafeSound) : null,
  lofi: typeof Audio !== "undefined" ? new Audio(lofiSound) : null,
};

// Configure looping for all instances
Object.values(audioInstances).forEach((audio) => {
  if (audio) {
    audio.loop = true;
    audio.preload = "auto";
  }
});

// 2. CREATE A GLOBAL STATE STORE
// This remembers your volume and mute settings when you reopen the menu
const globalAudioState = {
  rain: { volume: 0.5, isMuted: true },
  forest: { volume: 0.5, isMuted: true },
  cafe: { volume: 0.5, isMuted: true },
  lofi: { volume: 0.5, isMuted: true },
};

// --- Individual Sound Control Component ---
const SoundControl = ({ name, icon, soundKey }) => {
  // Initialize state from the global store
  const [volume, setVolume] = useState(globalAudioState[soundKey].volume);
  const [isMuted, setIsMuted] = useState(globalAudioState[soundKey].isMuted);

  const audio = audioInstances[soundKey];

  useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
      // Sync changes back to the global store so they aren't lost on close
      globalAudioState[soundKey].volume = volume;
      globalAudioState[soundKey].isMuted = isMuted;
    }
  }, [volume, isMuted, audio, soundKey]);

  const toggleMute = () => {
    const currentlyMuted = !isMuted;
    setIsMuted(currentlyMuted);

    if (audio) {
      if (currentlyMuted) {
        audio.pause();
      } else {
        audio.play().catch((e) => console.error("Error playing audio:", e));
      }
    }
  };

  return (
    <div
      className={`group flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 border ${
        !isMuted
          ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl transition-colors ${
              !isMuted
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {icon}
          </div>
          <span
            className={`font-bold text-sm ${
              !isMuted ? "text-emerald-400" : "text-slate-300"
            }`}
          >
            {name}
          </span>
        </div>
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg transition-all active:scale-90 ${
            isMuted
              ? "text-slate-500 hover:bg-slate-700"
              : "text-emerald-400 bg-emerald-500/20"
          }`}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="ambient-slider"
          disabled={isMuted}
        />
        <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};

const AmbientSounds = ({ customTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {customTrigger ? (
        React.cloneElement(customTrigger, { onClick: () => setIsOpen(!isOpen) })
      ) : (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 h-10 px-4 rounded-full text-sm font-bold transition-all border ${
            isOpen
              ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-slate-900/40 hover:bg-slate-800 border-slate-700/50 text-slate-300 hover:text-white"
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <FaMusic className={isOpen ? "text-slate-950" : "text-emerald-400"} />
          <span>Ambient</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-4 top-24 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 sm:w-[320px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] p-6 overflow-hidden"
          >
            {/* Header decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <FaHeadphones className="text-emerald-400 text-sm" /> Focus
                Sounds
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Notice we pass the soundKey instead of audioRef */}
              <SoundControl name="Rainfall" icon={<FaWind />} soundKey="rain" />
              <SoundControl
                name="Deep Forest"
                icon={<FaTree />}
                soundKey="forest"
              />
              <SoundControl
                name="Cozy Cafe"
                icon={<FaCoffee />}
                soundKey="cafe"
              />
              <SoundControl
                name="Lofi Beats"
                icon={<FaMusic />}
                soundKey="lofi"
              />
            </div>

            <p className="mt-4 text-[10px] text-center text-slate-500 font-medium tracking-widest uppercase">
              Mix and match for deep work
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmbientSounds;
