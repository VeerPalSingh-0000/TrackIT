import React from 'react';
import TrackerLogo from '../../public/clock.png';

const Loader = () => (
  <div className="flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      <img src={TrackerLogo} alt="FocusFlow" className="relative w-32 h-32 object-contain animate-pulse" />
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

export default Loader;