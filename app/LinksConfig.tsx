"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useImageConfig } from './ImageConfig';

export interface CustomLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  displayMode: 'box' | 'mini-icons' | 'both';
}

interface LinksConfig {
  links: CustomLink[];
  displayMode: 'box' | 'mini-icons'; // 'box' for profile box, 'mini-icons' for around pfp
}

const defaultLinksConfig: LinksConfig = {
  links: [],
  displayMode: 'box',
};

const LinksConfigContext = createContext<{
  config: LinksConfig;
  updateConfig: (updates: Partial<LinksConfig>) => void;
  addLink: (link: Omit<CustomLink, 'id'>) => void;
  updateLink: (id: string, updates: Partial<CustomLink>) => void;
  removeLink: (id: string) => void;
  resetToDefaults: () => void;
  saveConfig: () => void;
}>({
  config: defaultLinksConfig,
  updateConfig: () => {},
  addLink: () => {},
  updateLink: () => {},
  removeLink: () => {},
  resetToDefaults: () => {},
  saveConfig: () => {},
});

export const useLinksConfig = () => useContext(LinksConfigContext);

export const LinksConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<LinksConfig>(defaultLinksConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('linksConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultLinksConfig, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved links config:', error);
      }
    }
  }, []);

  // Auto-save is disabled - only save when save button is pressed

  const updateConfig = (updates: Partial<LinksConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addLink = (link: Omit<CustomLink, 'id'>) => {
    const newLink: CustomLink = {
      ...link,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setConfig(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const updateLink = (id: string, updates: Partial<CustomLink>) => {
    setConfig(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    }));
  };

  const removeLink = (id: string) => {
    setConfig(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const resetToDefaults = () => {
    setConfig(defaultLinksConfig);
  };

  const saveConfig = () => {
    localStorage.setItem('linksConfig', JSON.stringify(config));
    alert('Links settings saved successfully!');
  };

  return (
    <LinksConfigContext.Provider value={{ config, updateConfig, addLink, updateLink, removeLink, resetToDefaults, saveConfig }}>
      {children}
    </LinksConfigContext.Provider>
  );
};

// Color picker component for link colors
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

// Links configuration panel component
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

// File upload component
const FileUpload: React.FC<{
  label: string;
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
  uniqueId?: string;
}> = ({ label, onFileSelect, accept = "image/*", className = "", uniqueId }) => {
  const fileId = uniqueId || `file-upload-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
        id={fileId}
      />
      <button
        type="button"
        onClick={() => document.getElementById(fileId)?.click()}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        📁 Choose File
      </button>
    </div>
  );
};

export const LinksConfigPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { config, addLink, updateLink, removeLink, updateConfig, resetToDefaults, saveConfig } = useLinksConfig();
  const { config: imageConfig, updateLinkImage } = useImageConfig();
  const [isLocalhost, setIsLocalhost] = React.useState(false);
  const [newLink, setNewLink] = React.useState({
    name: '',
    url: '',
    icon: '',
    color: '#3b82f6',
    displayMode: 'both' as 'box' | 'mini-icons' | 'both'
  });

  React.useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  const handleAddLink = () => {
    console.log('handleAddLink called with:', newLink);
    if (newLink.name && newLink.url) {
      // Check around PFP limit (7)
      const aroundPfpCount = config.links.filter(link => link.displayMode === 'mini-icons' || link.displayMode === 'both').length;
      const boxCount = config.links.filter(link => link.displayMode === 'box' || link.displayMode === 'both').length;
      
      if (newLink.displayMode === 'mini-icons' || newLink.displayMode === 'both') {
        if (aroundPfpCount >= 8) {
          alert('Too many around PFP links! Remove one fuckwit ^^');
          return;
        }
      }
      
      if (newLink.displayMode === 'box' || newLink.displayMode === 'both') {
        if (boxCount >= 10) {
          alert('Too many box links! Remove one fuckwit ^^');
          return;
        }
      }
      
      console.log('Adding link:', newLink);
      // Generate ID here so we can use it for the image entry
      const linkId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const linkWithId = { ...newLink, id: linkId };
      
      addLink(newLink);
      // Automatically create an empty image entry for this link
      updateLinkImage(linkId, '');
      setNewLink({ name: '', url: '', icon: '', color: '#3b82f6', displayMode: 'both' });
      console.log('Link added successfully');
    } else {
      console.log('Validation failed - name:', newLink.name, 'url:', newLink.url);
    }
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Links Settings</h2>
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
              <>

                {/* Add New Link */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Link</h3>
                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        Around PFP: {config.links.filter(link => link.displayMode === 'mini-icons' || link.displayMode === 'both').length}/8
                      </div>
                      <div>
                        Box: {config.links.filter(link => link.displayMode === 'box' || link.displayMode === 'both').length}/10
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Link Name
                      </label>
                      <input
                        type="text"
                        value={newLink.name}
                        onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., GitHub, Twitter"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL
                      </label>
                      <input
                        type="url"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icon (emoji or text)
                      </label>
                      <input
                        type="text"
                        value={newLink.icon}
                        onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="🔗 or any emoji"
                      />
                    </div>
                    <div>
                      <ColorPicker
                        label="Link Color"
                        value={newLink.color}
                        onChange={(value) => setNewLink({ ...newLink, color: value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Mode
                      </label>
                      <select
                        value={newLink.displayMode}
                        onChange={(e) => setNewLink({ ...newLink, displayMode: e.target.value as 'box' | 'mini-icons' | 'both' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="both">Both (Box + Around PFP)</option>
                        <option value="box">Box Only</option>
                        <option value="mini-icons">Around PFP Only</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddLink}
                    disabled={(() => {
                      if (!newLink.name || !newLink.url) return true;
                      const aroundPfpCount = config.links.filter(link => link.displayMode === 'mini-icons' || link.displayMode === 'both').length;
                      const boxCount = config.links.filter(link => link.displayMode === 'box' || link.displayMode === 'both').length;
                      
                      if (newLink.displayMode === 'mini-icons' || newLink.displayMode === 'both') {
                        if (aroundPfpCount >= 8) return true;
                      }
                      if (newLink.displayMode === 'box' || newLink.displayMode === 'both') {
                        if (boxCount >= 10) return true;
                      }
                      return false;
                    })()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                  >
                    {(() => {
                      if (!newLink.name || !newLink.url) return 'Fill in Name and URL';
                      const aroundPfpCount = config.links.filter(link => link.displayMode === 'mini-icons' || link.displayMode === 'both').length;
                      const boxCount = config.links.filter(link => link.displayMode === 'box' || link.displayMode === 'both').length;
                      
                      if (newLink.displayMode === 'mini-icons' || newLink.displayMode === 'both') {
                        if (aroundPfpCount >= 8) return 'Too Many Around PFP Links';
                      }
                      if (newLink.displayMode === 'box' || newLink.displayMode === 'both') {
                        if (boxCount >= 10) return 'Too Many Box Links';
                      }
                      return 'Add Link';
                    })()}
                  </button>
                  {(!newLink.name || !newLink.url) && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                      Please fill in both Link Name and URL to add a link.
                    </p>
                  )}
                </div>

                {/* Existing Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Existing Links</h3>
                  {config.links.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No links added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {config.links.map((link) => {
                        const linkImage = imageConfig.customLinkImages[link.id];
                        return (
                          <div key={link.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                {linkImage ? (
                                  <img 
                                    src={linkImage} 
                                    alt={`${link.name} icon`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-sm">No image</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">{link.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{link.url}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Display:</span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    link.displayMode === 'both' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    link.displayMode === 'box' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  }`}>
                                    {link.displayMode === 'both' ? 'Both' : 
                                     link.displayMode === 'box' ? 'Box Only' : 'Around PFP Only'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                  type="text"
                                  value={link.name}
                                  onChange={(e) => updateLink(link.id, { name: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
                                <input
                                  type="text"
                                  value={link.icon}
                                  onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                  placeholder="🔗"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={link.color}
                                    onChange={(e) => updateLink(link.id, { color: e.target.value })}
                                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                                  />
                                  <div 
                                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                    style={{ backgroundColor: link.color }}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Mode</label>
                                <select
                                  value={link.displayMode}
                                  onChange={(e) => updateLink(link.id, { displayMode: e.target.value as 'box' | 'mini-icons' | 'both' })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                >
                                  <option value="both">Both</option>
                                  <option value="box">Box Only</option>
                                  <option value="mini-icons">Around PFP Only</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <FileUpload
                                label="Upload Icon Image"
                                onFileSelect={(file) => handleLinkImageUpload(file, link.id)}
                                accept="image/*"
                                className="flex-1"
                                uniqueId={`file-upload-link-${link.id}`}
                              />
                              <button
                                onClick={() => updateLinkImage(link.id, '')}
                                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                Remove Image
                              </button>
                              <button
                                onClick={() => removeLink(link.id)}
                                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                Remove Link
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {!isLocalhost && (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Links Settings Unavailable</p>
                  <p className="text-sm">Link customization is only available on localhost for development purposes.</p>
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
                  Save Links
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
