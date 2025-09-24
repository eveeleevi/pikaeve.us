"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ColorConfig {
  websiteText: string;
  websiteIcon: string;
  profileText: string;
  bioText: string;
  discordProfile: string;
  discordUserText: string;
  discordBioText: string;
  steamUserText: string;
  viewsText: string;
  viewsIcon: string;
  // Normal outline colors
  normalOutlineColor: string;
  normalGlowColor: string;
  // Hover effects
  hoverGlowColor: string;
  hoverBorderColor: string;
  hoverEffectsEnabled: boolean;
  // Dynamic colors for custom links will be added here
  customLinkColors: { [linkId: string]: string };
}

const defaultColorConfig: ColorConfig = {
  websiteText: "#374151",
  websiteIcon: "#6b7280",
  profileText: "#1f2937",
  bioText: "#6b7280",
  discordProfile: "#6b7280",
  discordUserText: "#1f2937",
  discordBioText: "#6b7280",
  steamUserText: "#6b7280",
  viewsText: "#ffffff",
  viewsIcon: "#ffffff",
  normalOutlineColor: "#e5e7eb",
  normalGlowColor: "#f3f4f6",
  hoverGlowColor: "#3b82f6",
  hoverBorderColor: "#3b82f6",
  hoverEffectsEnabled: true,
  customLinkColors: {},
};

const ColorConfigContext = createContext<{
  config: ColorConfig;
  updateConfig: (updates: Partial<ColorConfig>) => void;
  resetToDefaults: () => void;
  saveConfig: () => void;
}>({
  config: defaultColorConfig,
  updateConfig: () => {},
  resetToDefaults: () => {},
  saveConfig: () => {},
});

export const useColorConfig = () => useContext(ColorConfigContext);

export const ColorConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ColorConfig>(defaultColorConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('colorConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultColorConfig, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved color config:', error);
      }
    }
  }, []);

  // Auto-save is disabled - only save when save button is pressed

  const updateConfig = (updates: Partial<ColorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setConfig(defaultColorConfig);
  };

  const saveConfig = () => {
    localStorage.setItem('colorConfig', JSON.stringify(config));
    // Show a brief confirmation
    alert('Color settings saved successfully!');
  };

  return (
    <ColorConfigContext.Provider value={{ config, updateConfig, resetToDefaults, saveConfig }}>
      {children}
    </ColorConfigContext.Provider>
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

// Color configuration panel component
export const ColorConfigPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetToDefaults, saveConfig } = useColorConfig();
  const [isLocalhost, setIsLocalhost] = React.useState(false);

  React.useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Color Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {isLocalhost && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Customization (Localhost Only)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Website Text"
                    value={config.websiteText}
                    onChange={(value) => updateConfig({ websiteText: value })}
                  />
                  <ColorPicker
                    label="Website Icon"
                    value={config.websiteIcon}
                    onChange={(value) => updateConfig({ websiteIcon: value })}
                  />
                  <ColorPicker
                    label="Profile Text (Name)"
                    value={config.profileText}
                    onChange={(value) => updateConfig({ profileText: value })}
                  />
                  <ColorPicker
                    label="Bio Text"
                    value={config.bioText}
                    onChange={(value) => updateConfig({ bioText: value })}
                  />
                  <ColorPicker
                    label="Discord Profile Text"
                    value={config.discordProfile}
                    onChange={(value) => updateConfig({ discordProfile: value })}
                  />
                  <ColorPicker
                    label="Discord Username"
                    value={config.discordUserText}
                    onChange={(value) => updateConfig({ discordUserText: value })}
                  />
                  <ColorPicker
                    label="Discord Bio Text"
                    value={config.discordBioText}
                    onChange={(value) => updateConfig({ discordBioText: value })}
                  />
                  <ColorPicker
                    label="Steam Username"
                    value={config.steamUserText}
                    onChange={(value) => updateConfig({ steamUserText: value })}
                  />
                  <ColorPicker
                    label="Views Text"
                    value={config.viewsText}
                    onChange={(value) => updateConfig({ viewsText: value })}
                  />
                  <ColorPicker
                    label="Views Icon"
                    value={config.viewsIcon}
                    onChange={(value) => updateConfig({ viewsIcon: value })}
                  />
                </div>
              </div>
            )}

            {isLocalhost && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Normal Outline (Localhost Only)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Normal Outline Color"
                    value={config.normalOutlineColor}
                    onChange={(value) => updateConfig({ normalOutlineColor: value })}
                  />
                  <ColorPicker
                    label="Normal Glow Color"
                    value={config.normalGlowColor}
                    onChange={(value) => updateConfig({ normalGlowColor: value })}
                  />
                </div>
              </div>
            )}

            {isLocalhost && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hover Effects (Localhost Only)</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hoverEffectsEnabled"
                      checked={config.hoverEffectsEnabled}
                      onChange={(e) => updateConfig({ hoverEffectsEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="hoverEffectsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Hover Effects
                    </label>
                  </div>
                  
                  {config.hoverEffectsEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ColorPicker
                        label="Hover Glow Color"
                        value={config.hoverGlowColor}
                        onChange={(value) => updateConfig({ hoverGlowColor: value })}
                      />
                      <ColorPicker
                        label="Hover Border Color"
                        value={config.hoverBorderColor}
                        onChange={(value) => updateConfig({ hoverBorderColor: value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLocalhost && (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Color Settings Unavailable</p>
                  <p className="text-sm">Color customization is only available on localhost for development purposes.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Reset to Defaults
              </button>
              {isLocalhost && (
                <button
                  onClick={saveConfig}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Save Colors
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
