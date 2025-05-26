
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'default' | 'sunset' | 'ocean' | 'forest' | 'midnight';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: Array<{
    id: ThemeType;
    name: string;
    description: string;
    primaryColor: string;
    accentColor: string;
  }>;
}

const themes = [
  {
    id: 'default' as ThemeType,
    name: 'Professional Blue',
    description: 'Clean and professional blue theme',
    primaryColor: 'hsl(221, 83%, 53%)',
    accentColor: 'hsl(221, 83%, 63%)',
  },
  {
    id: 'sunset' as ThemeType,
    name: 'Sunset Orange',
    description: 'Warm orange and red gradients',
    primaryColor: 'hsl(25, 95%, 53%)',
    accentColor: 'hsl(10, 87%, 57%)',
  },
  {
    id: 'ocean' as ThemeType,
    name: 'Ocean Teal',
    description: 'Cool teal and cyan colors',
    primaryColor: 'hsl(173, 80%, 40%)',
    accentColor: 'hsl(180, 100%, 50%)',
  },
  {
    id: 'forest' as ThemeType,
    name: 'Forest Green',
    description: 'Natural green theme',
    primaryColor: 'hsl(142, 76%, 36%)',
    accentColor: 'hsl(120, 100%, 25%)',
  },
  {
    id: 'midnight' as ThemeType,
    name: 'Midnight Purple',
    description: 'Dark purple and violet theme',
    primaryColor: 'hsl(271, 81%, 56%)',
    accentColor: 'hsl(260, 100%, 65%)',
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') as ThemeType;
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme);
    
    // Apply theme to CSS custom properties
    const root = document.documentElement;
    const selectedTheme = themes.find(t => t.id === theme);
    
    if (selectedTheme) {
      root.style.setProperty('--primary', selectedTheme.primaryColor);
      root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 98%)');
      
      // Apply theme-specific classes
      root.className = root.className.replace(/theme-\w+/g, '');
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
