/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-[#00ffff] font-mono overflow-hidden relative flex flex-col items-center py-8 px-4">
      {/* Glitch Art Overlays */}
      <div className="static-noise"></div>
      <div className="scanlines"></div>
      
      {/* Header */}
      <header className="relative z-10 flex flex-col items-center gap-2 mb-8">
        <h1 
          className="text-5xl md:text-7xl font-black uppercase tracking-widest glitch" 
          data-text="SYS.SNAKE_PROTOCOL"
        >
          SYS.SNAKE_PROTOCOL
        </h1>
        <p className="text-[#ff00ff] text-xl tracking-widest uppercase animate-pulse mt-2">
          &gt;&gt; INITIALIZING NEURAL LINK...
        </p>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-5xl gap-12">
        <div className="w-full flex justify-center">
          <SnakeGame />
        </div>
        
        <div className="w-full mt-auto pb-4">
          <MusicPlayer />
        </div>
      </main>
    </div>
  );
}
