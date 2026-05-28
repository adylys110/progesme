'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useStorage } from './StorageContext';

interface ThemeContextType {
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data, updateSettings } = useStorage();
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (data.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update CSS variables for accent color and font size
    root.style.setProperty('--accent', data.settings.accentColor);
    
    let fontSizeBase = '16px';
    if (data.settings.fontSize === 'small') fontSizeBase = '14px';
    if (data.settings.fontSize === 'large') fontSizeBase = '18px';
    root.style.setProperty('--font-size-base', fontSizeBase);
    
  }, [data.settings.theme, data.settings.accentColor, data.settings.fontSize]);

  const toggleTheme = () => {
    updateSettings({ theme: data.settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
