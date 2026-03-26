import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 1,
    title: 'DATA_STREAM_01.WAV',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'CORRUPT_SECTOR_02.WAV',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'VOID_RESONANCE_03.WAV',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("ERR_AUDIO_STREAM:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-black border-2 border-[#ff00ff] p-4 shadow-[4px_4px_0px_#00ffff] relative z-20">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full">
          <h3 className="text-[#ff00ff] text-lg tracking-widest uppercase mb-1">
            &gt;&gt; AUDIO_SUBSYSTEM_ACTIVE
          </h3>
          <p className="text-[#00ffff] text-2xl uppercase tracking-widest truncate glitch" data-text={currentTrack.title}>
            {currentTrack.title}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full h-4 bg-black border border-[#00ffff] mt-3 relative overflow-hidden">
            <div 
              className="h-full bg-[#ff00ff] opacity-80"
              style={{ width: `${progress}%` }}
            />
            {/* Grid overlay for progress bar */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PHBhdGggZD0iTTAgNEw0IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={prevTrack}
            className="px-4 py-2 bg-black border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black uppercase tracking-widest transition-none cursor-pointer"
          >
            [PREV]
          </button>
          
          <button 
            onClick={togglePlay}
            className="px-6 py-2 bg-[#ff00ff] text-black font-bold uppercase tracking-widest hover:bg-white transition-none shadow-[2px_2px_0px_#00ffff] cursor-pointer"
          >
            {isPlaying ? 'HALT' : 'EXECUTE'}
          </button>
          
          <button 
            onClick={nextTrack}
            className="px-4 py-2 bg-black border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black uppercase tracking-widest transition-none cursor-pointer"
          >
            [NEXT]
          </button>
        </div>
      </div>
    </div>
  );
}
