"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProfileConfig {
  motionBlurEnabled: boolean;
  motionBlurIntensity: number; // 0-100
  motionBlurOnHoverOnly: boolean;
}

const defaultProfileConfig: ProfileConfig = {
  motionBlurEnabled: true,
  motionBlurIntensity: 50,
  motionBlurOnHoverOnly: true,
};

const ProfileConfigContext = createContext<{
  config: ProfileConfig;
  updateConfig: (updates: Partial<ProfileConfig>) => void;
  resetToDefaults: () => void;
  saveConfig: () => void;
}>({
  config: defaultProfileConfig,
  updateConfig: () => {},
  resetToDefaults: () => {},
  saveConfig: () => {},
});

export const useProfileConfig = () => useContext(ProfileConfigContext);

export const ProfileConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ProfileConfig>(defaultProfileConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('profileConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultProfileConfig, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved profile config:', error);
      }
    }
  }, []);

  const updateConfig = (updates: Partial<ProfileConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setConfig(defaultProfileConfig);
  };

  const saveConfig = () => {
    localStorage.setItem('profileConfig', JSON.stringify(config));
    alert('Profile settings saved successfully!');
  };

  return (
    <ProfileConfigContext.Provider value={{ config, updateConfig, resetToDefaults, saveConfig }}>
      {children}
    </ProfileConfigContext.Provider>
  );
};

// Profile configuration panel component
export const ProfileConfigPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetToDefaults, saveConfig } = useProfileConfig();
  const [isLocalhost, setIsLocalhost] = React.useState(false);

  React.useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Motion Blur Settings (Localhost Only)</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="motionBlurEnabled"
                      checked={config.motionBlurEnabled}
                      onChange={(e) => updateConfig({ motionBlurEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="motionBlurEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Motion Blur
                    </label>
                  </div>
                  
                  {config.motionBlurEnabled && (
                    <>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="motionBlurOnHoverOnly"
                          checked={config.motionBlurOnHoverOnly}
                          onChange={(e) => updateConfig({ motionBlurOnHoverOnly: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="motionBlurOnHoverOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Motion Blur Only on Hover
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Motion Blur Intensity: {config.motionBlurIntensity}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.motionBlurIntensity}
                          onChange={(e) => updateConfig({ motionBlurIntensity: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </>
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
                  <p className="text-lg font-medium mb-2">Profile Settings Unavailable</p>
                  <p className="text-sm">Profile customization is only available on localhost for development purposes.</p>
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
                  Save Profile Settings
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
