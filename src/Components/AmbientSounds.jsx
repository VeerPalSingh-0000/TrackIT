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

  const fillPercent = Math.round(volume * 100);
  const trackGradient = isMuted
    ? `linear-gradient(to right, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) ${fillPercent}%, rgba(255,255,255,0.05) ${fillPercent}%, rgba(255,255,255,0.05) 100%)`
    : `linear-gradient(to right, #10b981 0%, #10b981 ${fillPercent}%, rgba(255,255,255,0.1) ${fillPercent}%, rgba(255,255,255,0.1) 100%)`;

  return (
    <div
      className={`group flex flex-col gap-3 p-3.5 rounded-2xl transition-all duration-300 border ${
        !isMuted
          ? "bg-slate-900/90 border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              !isMuted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner"
                : "bg-white/[0.04] text-slate-500 border border-white/[0.05] group-hover:text-slate-400"
            }`}
          >
            {icon}
          </div>
          <span
            className={`font-medium text-sm tracking-tight transition-colors ${
              !isMuted ? "text-white font-semibold" : "text-slate-400 group-hover:text-slate-300"
            }`}
          >
            {name}
          </span>
        </div>

        <button
          onClick={toggleMute}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1.5 border ${
            !isMuted
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
              : "bg-white/[0.04] text-slate-500 border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-400"
          }`}
        >
          {isMuted ? (
            <>
              <FaVolumeMute className="text-[11px]" />
              <span>OFF</span>
            </>
          ) : (
            <>
              <FaVolumeUp className="text-[11px]" />
              <span>ON</span>
            </>
          )}
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
          style={{ background: trackGradient }}
          disabled={isMuted}
        />
        <span
          className={`text-[11px] font-mono w-9 text-right font-medium transition-colors ${
            !isMuted ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          {fillPercent}%
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

  if (customTrigger) {
    return (
      <div className="w-full" ref={dropdownRef}>
        {React.cloneElement(customTrigger, { onClick: () => setIsOpen(!isOpen) })}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mt-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3"
            >
              <div className="grid grid-cols-1 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all border ${
          isOpen
            ? "bg-slate-800 border-slate-700 text-white shadow-sm"
            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <FaMusic className={isOpen ? "text-slate-400" : "text-slate-500"} />
        <span>Sounds</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full mt-2.5 w-[340px] z-50 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl ring-1 ring-white/5 p-5 overflow-hidden"
          >
            {/* Header decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 opacity-50" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-white flex items-center gap-2 tracking-tight">
                <FaHeadphones className="text-slate-400 text-sm" /> Focus
                Sounds
              </h3>
              <div className="flex items-center gap-1.5 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
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

            <p className="mt-3 text-[10px] text-center text-slate-500 font-medium tracking-widest uppercase">
              Mix and match for deep work
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmbientSounds;
