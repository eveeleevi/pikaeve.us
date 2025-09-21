"use client";

import Image from "next/image";
import DiscordPresence from "./DiscordPresence";
import SteamPresence from "./SteamPresence";
import { FaTimes, FaGlobe, FaPlay, FaPause, FaVolumeUp, FaMusic } from "react-icons/fa";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const [showDiscordPanel, setShowDiscordPanel] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [discordData, setDiscordData] = useState<{
    banner: string | null;
    bio: string | null;
    username: string;
    status: string;
    avatar: string | null;
  } | null>(null);
  
  // Audio control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Get reference to background audio element
  useEffect(() => {
    const getBackgroundAudio = () => {
      const audio = document.querySelector('audio[src*="ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3"]') as HTMLAudioElement;
      if (audio) {
        audioRef.current = audio;
        // Set initial volume
        audio.volume = volume;
        // Set up event listeners
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
      }
    };

    // Try to get audio element after a short delay to ensure it's loaded
    const timer = setTimeout(getBackgroundAudio, 100);
    return () => clearTimeout(timer);
  }, [volume]);

  // Real audio visualizer - automatically enabled when audio panel is open
  useEffect(() => {
    if (!showAudioPanel) return;

    // For now, use random bars to avoid audio context issues
    const interval = setInterval(() => {
      const bars = Array.from({ length: 32 }, () => Math.random() * 80 + 20);
      setVisualizerBars(bars);
    }, 100);

    return () => clearInterval(interval);
  }, [showAudioPanel]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle ESC key to close panel and click outside to close audio panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDiscordPanel) {
        setShowDiscordPanel(false);
      }
      if (event.key === 'Escape' && showAudioPanel) {
        setShowAudioPanel(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Close audio panel if clicking outside of it and the music button
      if (showAudioPanel && !target.closest('[data-audio-panel]') && !target.closest('[data-music-button]')) {
        setShowAudioPanel(false);
      }
    };

    if (showDiscordPanel) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    if (showAudioPanel) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showDiscordPanel, showAudioPanel]);

  // Sync with background audio
  useEffect(() => {
    const backgroundAudio = document.querySelector('audio[src*="ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3"]') as HTMLAudioElement;
    if (backgroundAudio) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = () => setCurrentTime(backgroundAudio.currentTime);
      const handleLoadedMetadata = () => setDuration(backgroundAudio.duration);
      
      backgroundAudio.addEventListener('play', handlePlay);
      backgroundAudio.addEventListener('pause', handlePause);
      backgroundAudio.addEventListener('timeupdate', handleTimeUpdate);
      backgroundAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        backgroundAudio.removeEventListener('play', handlePlay);
        backgroundAudio.removeEventListener('pause', handlePause);
        backgroundAudio.removeEventListener('timeupdate', handleTimeUpdate);
        backgroundAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  // Audio control functions - control background audio
  const togglePlayPause = () => {
    const backgroundAudio = document.querySelector('audio[src*="ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3"]') as HTMLAudioElement;
    if (backgroundAudio) {
      if (isPlaying) {
        backgroundAudio.pause();
      } else {
        backgroundAudio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const backgroundAudio = document.querySelector('audio[src*="ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3"]') as HTMLAudioElement;
    if (backgroundAudio) {
      backgroundAudio.volume = newVolume;
    }
  };

  const handleTimeUpdate = useCallback(() => {
    const backgroundAudio = document.querySelector('audio[src*="ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3"]') as HTMLAudioElement;
    if (backgroundAudio) {
      setCurrentTime(backgroundAudio.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const backgroundAudio = document.querySelector('audio[src*="ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3"]') as HTMLAudioElement;
    if (backgroundAudio) {
      setDuration(backgroundAudio.duration);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="flex items-center gap-6 relative flex-row">
        <main className="w-full max-w-[3800px] flex justify-center">
          <div 
            className="w-full max-w-[2000px] rounded-2xl p-8 transition-transform duration-300 ease-out relative backdrop-blur-md"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              transform: isHovering ? `translate(${typeof window !== 'undefined' ? Math.min(Math.max((mousePosition.x - window.innerWidth / 2) * 0.02, -20), 20) : 0}px, ${typeof window !== 'undefined' ? Math.min(Math.max((mousePosition.y - window.innerHeight / 2) * 0.02, -20), 20) : 0}px)` : 'translate(0px, 0px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '3px solid #3b82f6',
              animation: 'blueOutline 3s linear infinite'
            }}
          >
            <div className="relative z-10 flex items-center gap-12 mb-6 flex-row justify-between">
              <div className="flex-1">
                {/* Integrated Discord Presence */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-200">
                  <DiscordPresence onUsernameClick={(data) => {
                    setDiscordData(data);
                    setShowDiscordPanel(true);
                  }} />
                </div>

                {/* Integrated Steam Presence */}
                <div className="mt-2 opacity-60 hover:opacity-100 transition-opacity duration-200">
                  <SteamPresence onUsernameClick={() => {}} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-1">
                  eveeleevi
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">awesome?</p>
                <Image src="/file_5c7edfd8-ac93-469d-b873-5bb727b0f322.png" alt="Avatar" width={100} height={100} className="rounded-full" />
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">Additional Info</h2>
                <div className="mt-2">
                  <img 
                    src="/e3cd095e4c6c4b3dddd1efe49a0891d8.jpg" 
                    alt="Additional info image" 
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Website section removed */}
          </div>

        </main>

        {/* Music Note Toggle Button - Top Right */}
        <button
          data-music-button
          onClick={() => setShowAudioPanel(!showAudioPanel)}
          className="fixed top-4 right-4 w-12 h-12 rounded-full border-2 border-white bg-white dark:bg-black/20 backdrop-blur flex items-center justify-center hover:bg-gray-100 dark:hover:bg-black/40 transition-colors duration-200 z-50"
        >
          <FaMusic className="text-gray-600 dark:text-gray-300 text-lg" />
        </button>

        {/* Audio Control Panel - Slides down from top right */}
        <div 
          data-audio-panel
          className={`fixed top-16 right-4 w-64 rounded-lg border-2 border-white bg-white dark:bg-black/20 backdrop-blur z-50 transition-all duration-300 ease-in-out ${
            showAudioPanel 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <FaVolumeUp className="text-gray-600 dark:text-gray-300" />
              <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Audio Controls</h3>
            </div>
            
            <div className="space-y-3">
              {/* Time Display */}
              <div className="text-xs text-gray-600 dark:text-gray-300 text-center">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Volume</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualizer - Next to Audio Panel */}
        <div className={`fixed top-16 right-72 w-48 h-32 rounded-lg border-2 border-white bg-black/30 backdrop-blur z-50 transition-all duration-500 ease-in-out ${
          showAudioPanel
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="p-3 h-full flex items-end justify-center gap-1">
            {visualizerBars.map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm transition-all duration-100 ease-out"
                style={{
                  width: '4px',
                  height: `${height}%`,
                  minHeight: '2px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Discord Profile Panel - pops out of background layer */}
        {showDiscordPanel && (
          <>
            {/* Backdrop with smooth fade */}
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out"
              onClick={() => setShowDiscordPanel(false)}
            />
            
            <div className={`w-80 bg-white dark:bg-gray-900 rounded-2xl border border-black/[.08] dark:border-white/[.145] shadow-2xl transform transition-all duration-700 ease-out relative z-50 ${
              showDiscordPanel ? 'translate-x-0 translate-y-0 opacity-100 scale-100' : 'translate-x-12 translate-y-12 opacity-0 scale-75'
            }`}>
            {/* Discord Banner Background */}
            <div
              className="h-24 bg-cover bg-center bg-no-repeat relative rounded-t-2xl"
              style={{
                backgroundImage: 'url("/we-have-no-sappers-dog-accepting-fate.gif")',
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
              
              {/* Close Button */}
              <button
                onClick={() => setShowDiscordPanel(false)}
                className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
              >
                <FaTimes className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 -mt-12 relative">
              {/* Profile Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src={discordData?.avatar || "/vercel.svg"}
                    alt="Discord avatar"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-900"
                  />
                  <div 
                    className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900"
                    style={{
                      backgroundColor: discordData?.status === 'online' ? '#22c55e' :
                                     discordData?.status === 'idle' ? '#f59e0b' :
                                     discordData?.status === 'dnd' ? '#ef4444' : '#6b7280'
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{discordData?.username || "eveeleevi"}</h2>
                  <p className="text-xs text-white/80">eveeleevi1</p>
                </div>
              </div>

              {/* Bio Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3">
                <h3 className="font-semibold mb-1 text-xs text-gray-700 dark:text-gray-300">Bio</h3>
                <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  xdrop where are you?

                  guns.lol/22nd
                  fakecri.me/septic
                  arch-linux.fun/eclipse
                  slat.cc/cute
                  rich.bz/eq
                  biography.gg/eveeleevi
                  femboy.net/eveeleevi
                  linktr.ee/adorable
                    ╱|
                  {'(>.< 7'}
                  、˜〵
                  じしˍ)ノ
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3">
                <h3 className="font-semibold mb-2 text-xs text-gray-700 dark:text-gray-300">Status</h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: discordData?.status === 'online' ? '#22c55e' :
                                     discordData?.status === 'idle' ? '#f59e0b' :
                                     discordData?.status === 'dnd' ? '#ef4444' : '#6b7280'
                    }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{discordData?.status || "Online"}</span>
                </div>
              </div>

              {/* Theme Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3">
                <h3 className="font-semibold mb-2 text-xs text-gray-700 dark:text-gray-300">Theme Colors</h3>
                <div className="flex gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-lg bg-blue-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-lg bg-purple-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Accent</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-lg bg-pink-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Highlight</span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <h3 className="font-semibold mb-2 text-xs text-gray-700 dark:text-gray-300">Current Activity</h3>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p>Status: Online</p>
                  <p>Last seen: Just now</p>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

      </div>
    </div>
  );
}
