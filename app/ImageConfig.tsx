"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ImageConfig {
  // Main page images
  avatar: string;
  additionalInfoImage: string;
  
  // Discord presence badges
  peakMusicBadge: string;
  notoriousBadge: string;
  touhouBadge: string;
  
  // Background media
  backgroundVideo: string;
  backgroundAudio: string;
  
  // Additional profile images
  discordBanner: string;
  steamPfp: string;
  
  // Custom uploaded files
  customFiles: { name: string; url: string; type: string }[];
  
  // Custom link images (dynamically added when links are created)
  customLinkImages: { [linkId: string]: string };
}

const defaultConfig: ImageConfig = {
  avatar: "/file_5c7edfd8-ac93-469d-b873-5bb727b0f322.png",
  additionalInfoImage: "/e3cd095e4c6c4b3dddd1efe49a0891d8.jpg",
  peakMusicBadge: "/image copy.png",
  notoriousBadge: "/image.png",
  touhouBadge: "/touhou-cirnasdo.gif",
  backgroundVideo: "/ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_1080p.mp4",
  backgroundAudio: "/ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3",
  discordBanner: "/we-have-no-sappers-dog-accepting-fate.gif",
  steamPfp: "/vercel.svg",
  customFiles: [],
  customLinkImages: {},
};

const ImageConfigContext = createContext<{
  config: ImageConfig;
  updateConfig: (updates: Partial<ImageConfig>) => void;
  updateLinkImage: (linkId: string, imageUrl: string) => void;
  resetToDefaults: () => void;
  saveConfig: () => void;
}>({
  config: defaultConfig,
  updateConfig: () => {},
  updateLinkImage: () => {},
  resetToDefaults: () => {},
  saveConfig: () => {},
});

export const useImageConfig = () => useContext(ImageConfigContext);

// Utility function to resize images
const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and convert to data URL
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png', 0.9));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const ImageConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ImageConfig>(defaultConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('imageConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved image config:', error);
      }
    }
  }, []);

  // Auto-save is disabled - only save when save button is pressed

  const updateConfig = (updates: Partial<ImageConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateLinkImage = (linkId: string, imageUrl: string) => {
    setConfig(prev => ({
      ...prev,
      customLinkImages: {
        ...prev.customLinkImages,
        [linkId]: imageUrl
      }
    }));
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
  };

  const saveConfig = () => {
    localStorage.setItem('imageConfig', JSON.stringify(config));
    alert('Image settings saved successfully!');
  };

  return (
    <ImageConfigContext.Provider value={{ config, updateConfig, updateLinkImage, resetToDefaults, saveConfig }}>
      {children}
    </ImageConfigContext.Provider>
  );
};

// Image URL input component
export const ImageUrlInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter image URL..."}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 object-cover rounded border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

// Color picker component
export const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, value, onChange, className = "" }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          placeholder="#000000"
        />
        <div 
          className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
};

// File upload component
export const FileUpload: React.FC<{
  label: string;
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}> = ({ label, onFileSelect, accept = "image/*,video/*,audio/*", className = "" }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
      >
        📁 Choose File
      </button>
    </div>
  );
};

// Image configuration panel component
export const ImageConfigPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { config, updateConfig, updateLinkImage, resetToDefaults, saveConfig } = useImageConfig();
  const [isLocalhost, setIsLocalhost] = React.useState(false);

  React.useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  const handleFileUpload = (file: File, type: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (type === 'custom') {
        updateConfig({
          customFiles: [...config.customFiles, { name: file.name, url, type: file.type }]
        });
      } else {
        updateConfig({ [type]: url });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLinkImageUpload = async (file: File, linkId: string) => {
    try {
      // Resize image to appropriate size for icons (32x32 for mini icons, 48x48 for box mode)
      const resizedImageUrl = await resizeImage(file, 48, 48);
      updateLinkImage(linkId, resizedImageUrl);
    } catch (error) {
      console.error('Error resizing image:', error);
      // Fallback to original file if resizing fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        updateLinkImage(linkId, url);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Image Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Main Page Images</h3>
            <ImageUrlInput
              label="Avatar Image"
              value={config.avatar}
              onChange={(value) => updateConfig({ avatar: value })}
              placeholder="https://example.com/avatar.jpg"
            />
            {isLocalhost && (
              <FileUpload
                label="Upload Avatar Image"
                onFileSelect={(file) => handleFileUpload(file, 'avatar')}
                accept="image/*"
              />
            )}
            <ImageUrlInput
              label="Additional Info Image"
              value={config.additionalInfoImage}
              onChange={(value) => updateConfig({ additionalInfoImage: value })}
              placeholder="https://example.com/info-image.jpg"
            />
            {isLocalhost && (
              <FileUpload
                label="Upload Additional Info Image"
                onFileSelect={(file) => handleFileUpload(file, 'additionalInfoImage')}
                accept="image/*"
              />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Discord Badge Images</h3>
            <ImageUrlInput
              label="Peak Music Badge"
              value={config.peakMusicBadge}
              onChange={(value) => updateConfig({ peakMusicBadge: value })}
              placeholder="https://example.com/peak-music-badge.png"
            />
            <ImageUrlInput
              label="Notorious Badge"
              value={config.notoriousBadge}
              onChange={(value) => updateConfig({ notoriousBadge: value })}
              placeholder="https://example.com/notorious-badge.png"
            />
            <ImageUrlInput
              label="Touhou Badge (GIF)"
              value={config.touhouBadge}
              onChange={(value) => updateConfig({ touhouBadge: value })}
              placeholder="https://example.com/touhou-badge.gif"
            />
          </div>

          {isLocalhost && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Images (Localhost Only)</h3>
              <ImageUrlInput
                label="Discord Banner"
                value={config.discordBanner}
                onChange={(value) => updateConfig({ discordBanner: value })}
                placeholder="https://example.com/discord-banner.gif"
              />
              <FileUpload
                label="Upload Discord Banner"
                onFileSelect={(file) => handleFileUpload(file, 'discordBanner')}
                accept="image/*,video/*"
              />
              <ImageUrlInput
                label="Steam Profile Picture"
                value={config.steamPfp}
                onChange={(value) => updateConfig({ steamPfp: value })}
                placeholder="https://example.com/steam-pfp.png"
              />
              <FileUpload
                label="Upload Steam Profile Picture"
                onFileSelect={(file) => handleFileUpload(file, 'steamPfp')}
                accept="image/*"
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Background Media</h3>
            <ImageUrlInput
              label="Background Video"
              value={config.backgroundVideo}
              onChange={(value) => updateConfig({ backgroundVideo: value })}
              placeholder="https://example.com/background.mp4"
            />
            {isLocalhost && (
              <FileUpload
                label="Upload Background Video"
                onFileSelect={(file) => handleFileUpload(file, 'backgroundVideo')}
                accept="video/*"
              />
            )}
            <ImageUrlInput
              label="Background Audio"
              value={config.backgroundAudio}
              onChange={(value) => updateConfig({ backgroundAudio: value })}
              placeholder="https://example.com/background.mp3"
            />
            {isLocalhost && (
              <FileUpload
                label="Upload Background Audio"
                onFileSelect={(file) => handleFileUpload(file, 'backgroundAudio')}
                accept="audio/*"
              />
            )}
          </div>

          {isLocalhost && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Files (Localhost Only)</h3>
              <FileUpload
                label="Add Custom File"
                onFileSelect={(file) => handleFileUpload(file, 'custom')}
                accept="image/*,video/*,audio/*"
              />
              {config.customFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploaded Files:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {config.customFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{file.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">({file.type})</span>
                        </div>
                        <button
                          onClick={() => {
                            const newFiles = config.customFiles.filter((_, i) => i !== index);
                            updateConfig({ customFiles: newFiles });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Link Images Section */}
          {isLocalhost && Object.keys(config.customLinkImages).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Link Images (Localhost Only)</h3>
              <div className="space-y-4">
                {Object.entries(config.customLinkImages).map(([linkId, imageUrl]) => (
                  <div key={linkId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={`Link ${linkId} icon`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">Link Icon {linkId}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Custom icon for this link</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <FileUpload
                        label="Upload Icon"
                        onFileSelect={(file) => handleLinkImageUpload(file, linkId)}
                        accept="image/*"
                        className="flex-1"
                      />
                      <button
                        onClick={() => updateLinkImage(linkId, '')}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-2">
              {isLocalhost && (
                <button
                  onClick={saveConfig}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Save Images
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
