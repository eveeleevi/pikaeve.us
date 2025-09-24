"use client";

import Image from "next/image";
import DiscordPresence from "./DiscordPresence";
import SteamPresence from "./SteamPresence";
import { FaTimes, FaGlobe, FaEye, FaCog, FaPalette, FaLink, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useImageConfig, ImageConfigPanel } from "./ImageConfig";
import { useColorConfig, ColorConfigPanel } from "./ColorConfig";
import { useLinksConfig, LinksConfigPanel, CustomLink } from "./LinksConfig";
import { useProfileConfig, ProfileConfigPanel } from "./ProfileConfig";

export default function Home() {
  const [showDiscordPanel, setShowDiscordPanel] = useState(false);
  const [showImageConfig, setShowImageConfig] = useState(false);
  const [showColorConfig, setShowColorConfig] = useState(false);
  const [showLinksConfig, setShowLinksConfig] = useState(false);
  const [showProfileConfig, setShowProfileConfig] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [views, setViews] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [hasPlayedHoverSound, setHasPlayedHoverSound] = useState(false);
  const [discordData, setDiscordData] = useState<{
    banner: string | null;
    bio: string | null;
    username: string;
    status: string;
    avatar: string | null;
  } | null>(null);
  
  const { config: imageConfig } = useImageConfig();
  const { config: colorConfig } = useColorConfig();
  const { config: linksConfig } = useLinksConfig();
  const { config: profileConfig } = useProfileConfig();
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Check if running on localhost
  useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  // Handle mouse movement
  useEffect(() => {
    let mouseMoveTimeout: NodeJS.Timeout;

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      setIsMouseMoving(true);
      
      // Clear existing timeout
      clearTimeout(mouseMoveTimeout);
      
      // Set timeout to stop motion blur after mouse stops moving
      mouseMoveTimeout = setTimeout(() => {
        setIsMouseMoving(false);
      }, 200); // 200ms delay after mouse stops moving
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseMoveTimeout);
    };
  }, []);

  // Handle ESC key to close panels
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDiscordPanel) setShowDiscordPanel(false);
        if (showImageConfig) setShowImageConfig(false);
        if (showColorConfig) setShowColorConfig(false);
        if (showLinksConfig) setShowLinksConfig(false);
        if (showSettingsMenu) setShowSettingsMenu(false);
      }
    };

    const isAnyPanelOpen = showDiscordPanel || showImageConfig || showColorConfig || showLinksConfig;
    
    if (isAnyPanelOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDiscordPanel, showImageConfig, showColorConfig, showLinksConfig]);

  // View counter logic
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      // First visit
      const visitorId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
      localStorage.setItem('hasVisited', 'true');
      setViews(1);
    } else {
      // Returning visitor
      const storedViews = localStorage.getItem('views');
      const currentViews = storedViews ? parseInt(storedViews) + 1 : 1;
      localStorage.setItem('views', currentViews.toString());
      setViews(currentViews);
    }
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="flex items-center gap-6 relative flex-row">
        <main className="w-full max-w-[3800px] flex justify-center">
          <div 
            className="w-full max-w-[2000px] rounded-2xl border-2 border-white p-8 bg-white dark:bg-black/20 backdrop-blur transition-transform duration-300 ease-out"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              transform: isHovering ? `translate(${typeof window !== 'undefined' ? Math.min(Math.max((mousePosition.x - window.innerWidth / 2) * 0.02, -20), 20) : 0}px, ${typeof window !== 'undefined' ? Math.min(Math.max((mousePosition.y - window.innerHeight / 2) * 0.02, -20), 20) : 0}px)` : 'translate(0px, 0px)',
              filter: profileConfig.motionBlurEnabled && isMouseMoving && (!profileConfig.motionBlurOnHoverOnly || isHovering) ? 
                `blur(${profileConfig.motionBlurIntensity / 100}px)` : 'blur(0px)',
              boxShadow: colorConfig.hoverEffectsEnabled && isHovering ? 
                `0 0 20px ${colorConfig.hoverGlowColor}40, 0 0 40px ${colorConfig.hoverGlowColor}20` : 
                `0 0 10px ${colorConfig.normalGlowColor}20`,
              borderColor: colorConfig.hoverEffectsEnabled && isHovering ? 
                `${colorConfig.hoverBorderColor}80` : 
                colorConfig.normalOutlineColor
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
              <div className="flex flex-col items-center relative">
                <h1 
                  className="text-2xl font-bold mb-1"
                  style={{ color: colorConfig.profileText }}
                >
                  eveeleevi
                </h1>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colorConfig.bioText }}
                >
                  awesome?
                </p>
                <div className="relative">
                  <Image 
                    src={imageConfig.avatar} 
                    alt="Avatar" 
                    width={100} 
                    height={100} 
                    className="rounded-full" 
                  />
                  
                  {/* Views Counter Overlay */}
                  <div 
                    className="absolute -bottom-2 -right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-lg"
                    style={{ color: colorConfig.viewsText }}
                  >
                    <FaEye className="w-3 h-3" style={{ color: colorConfig.viewsIcon }} />
                    <span className="text-xs font-bold">{views.toLocaleString()}</span>
                  </div>
                  
                  {/* Mini icons around PFP */}
                  {linksConfig.links.filter(link => link.displayMode === 'mini-icons' || link.displayMode === 'both').slice(0, 8).map((link, index) => {
                    // Position icons around PFP, but create a gap where views counter is (bottom-right)
                    const miniIconLinks = linksConfig.links.filter(link => link.displayMode === 'mini-icons' || link.displayMode === 'both');
                    const totalLinks = Math.min(miniIconLinks.length, 8);
                    const radius = 55;
                    const linkImage = imageConfig.customLinkImages[link.id];
                    
                    // Create a gap in the bottom-right area (around 315 degrees) for views counter
                    // Distribute icons in a circle but skip the bottom-right quadrant
                    const gapStart = 300; // Start of gap (bottom-right area)
                    const gapEnd = 360; // End of gap
                    const availableAngle = 360 - (gapEnd - gapStart); // Total available angle
                    
                    // Calculate angle, but if it would be in the gap, move it to after the gap
                    let angle = (index * availableAngle) / totalLinks;
                    if (angle >= gapStart) {
                        angle = angle + (gapEnd - gapStart); // Move past the gap
                    }
                    
                    // Rotate the entire distribution so the gap is at bottom-right (315 degrees)
                    // Add 90 degrees to shift the gap further down to bottom-right
                    angle = angle + 90;
                    
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;
                    
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform duration-200 overflow-hidden z-10"
                        style={{
                          backgroundColor: link.color,
                          left: `calc(50% + ${x}px - 16px)`,
                          top: `calc(50% + ${y}px - 16px)`,
                        }}
                        title={link.name}
                      >
                        {linkImage ? (
                          <img 
                            src={linkImage} 
                            alt={link.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          link.icon || '🔗'
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: colorConfig.websiteText }}
                >
                  Additional Info
                </h2>
                <div className="mt-2">
                  <img 
                    src={imageConfig.additionalInfoImage} 
                    alt="Additional info image" 
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Default Website Link */}
              <a 
                href="https://pikaeve.us" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 rounded-lg border border-black/[.08] dark:border-white/[.145] p-4 hover:bg-[#f8f8f8] dark:hover:bg-[#111] transition-colors"
              >
                <FaGlobe style={{ color: colorConfig.websiteIcon }} />
                <div className="flex flex-col">
                  <span 
                    className="font-semibold"
                    style={{ color: colorConfig.websiteText }}
                  >
                    Website
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: colorConfig.websiteText }}
                  >
                    pikaeve.us
                  </span>
                </div>
              </a>

              {/* Custom Links - Box Mode */}
              {linksConfig.links.filter(link => link.displayMode === 'box' || link.displayMode === 'both').map((link) => {
                const linkImage = imageConfig.customLinkImages[link.id];
                
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-black/[.08] dark:border-white/[.145] p-4 hover:bg-[#f8f8f8] dark:hover:bg-[#111] transition-colors"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {linkImage ? (
                        <img 
                          src={linkImage} 
                          alt={link.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span 
                          className="text-lg"
                          style={{ color: link.color }}
                        >
                          {link.icon || '🔗'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span 
                        className="font-semibold"
                        style={{ color: link.color }}
                      >
                        {link.name}
                      </span>
                      <span 
                        className="text-xs"
                        style={{ color: colorConfig.websiteText }}
                      >
                        {(() => {
                          try {
                            return new URL(link.url).hostname;
                          } catch (error) {
                            return link.url; // Fallback to original URL if invalid
                          }
                        })()}
                      </span>
                    </div>
                  </a>
                );
              })}

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
                backgroundImage: `url("${imageConfig.discordBanner}")`,
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

        {/* Settings Panels */}
        <ImageConfigPanel 
          isOpen={showImageConfig} 
          onClose={() => setShowImageConfig(false)} 
        />
        
        <ColorConfigPanel 
          isOpen={showColorConfig} 
          onClose={() => setShowColorConfig(false)} 
        />
        
        <LinksConfigPanel 
          isOpen={showLinksConfig} 
          onClose={() => setShowLinksConfig(false)} 
        />
        
        <ProfileConfigPanel 
          isOpen={showProfileConfig} 
          onClose={() => setShowProfileConfig(false)} 
        />

        {/* Floating Settings Button with Popup Menu - Bottom Right (Localhost Only) */}
        {isLocalhost && (
          <div className="fixed bottom-6 right-6 z-40" data-settings-menu>
            {/* Settings Popup Menu */}
            {showSettingsMenu && (
              <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] animate-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={() => {
                    setShowImageConfig(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <FaCog className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Image Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Change images & media</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowColorConfig(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <FaPalette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Color Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Customize colors</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowLinksConfig(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <FaLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Links Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Manage custom links</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowProfileConfig(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <FaUser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Profile Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Motion blur & effects</div>
                  </div>
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    // Reset views for testing
                    localStorage.removeItem('hasVisited');
                    localStorage.removeItem('visitorId');
                    localStorage.removeItem('views');
                    window.location.reload();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <FaEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Reset Views</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Reset view counter</div>
                  </div>
                </button>
              </div>
            )}

            {/* Main Settings Button */}
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
              title="Settings"
            >
              <FaCog className={`w-5 h-5 transition-transform duration-300 ${showSettingsMenu ? 'rotate-180' : 'group-hover:rotate-90'}`} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
