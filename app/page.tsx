"use client";

import Image from "next/image";
import DiscordPresence from "./DiscordPresence";
import SteamPresence from "./SteamPresence";
import { FaTimes, FaGlobe } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Home() {
  const [showDiscordPanel, setShowDiscordPanel] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [discordData, setDiscordData] = useState<{
    banner: string | null;
    bio: string | null;
    username: string;
    status: string;
    avatar: string | null;
  } | null>(null);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDiscordPanel) {
        setShowDiscordPanel(false);
      }
    };

    if (showDiscordPanel) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDiscordPanel]);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="flex items-center gap-6 relative flex-row">
        <main className="w-full max-w-[3800px] flex justify-center">
          <div 
            className="w-full max-w-[2000px] rounded-2xl border-2 border-white p-8 bg-white dark:bg-black/20 backdrop-blur transition-transform duration-300 ease-out"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              transform: isHovering ? `translate(${typeof window !== 'undefined' ? Math.min(Math.max((mousePosition.x - window.innerWidth / 2) * 0.02, -20), 20) : 0}px, ${typeof window !== 'undefined' ? Math.min(Math.max((mousePosition.y - window.innerHeight / 2) * 0.02, -20), 20) : 0}px)` : 'translate(0px, 0px)'
            }}
          >
            <div className="flex items-center gap-12 mb-6 flex-row justify-between">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="https://pikaeve.net" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-black/[.08] dark:border-white/[.145] p-4 hover:bg-[#f8f8f8] dark:hover:bg-[#111] transition-colors">
                <FaGlobe />
                <div className="flex flex-col">
                  <span className="font-semibold">Website</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">pikaeve.net</span>
                </div>
              </a>
            </div>
          </div>
        </main>

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
