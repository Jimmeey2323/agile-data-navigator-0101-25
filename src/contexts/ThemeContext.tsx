import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
  isDark: false,
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let newResolvedTheme: 'light' | 'dark' = 'light';
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        newResolvedTheme = systemTheme;
      } else {
        newResolvedTheme = theme;
      }
      
      setResolvedTheme(newResolvedTheme);
      
      root.classList.remove('light', 'dark');
      root.classList.add(newResolvedTheme);
      
      // Update CSS custom properties for theme colors
      if (newResolvedTheme === 'dark') {
        root.style.setProperty('--color-primary', '#60a5fa');
        root.style.setProperty('--color-secondary', '#94a3b8');
        root.style.setProperty('--color-accent', '#34d399');
        root.style.setProperty('--color-background', '#0f172a');
        root.style.setProperty('--color-surface', '#1e293b');
        root.style.setProperty('--color-text', '#f8fafc');
        root.style.setProperty('--color-text-secondary', '#cbd5e1');
        root.style.setProperty('--color-border', '#334155');
      } else {
        root.style.setProperty('--color-primary', '#3b82f6');
        root.style.setProperty('--color-secondary', '#64748b');
        root.style.setProperty('--color-accent', '#10b981');
        root.style.setProperty('--color-background', '#ffffff');
        root.style.setProperty('--color-surface', '#f8fafc');
        root.style.setProperty('--color-text', '#0f172a');
        root.style.setProperty('--color-text-secondary', '#64748b');
        root.style.setProperty('--color-border', '#e2e8f0');
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    isDark: resolvedTheme === 'dark',
    colors: resolvedTheme === 'dark' ? {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#34d399',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    } : {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

// Advanced theme utilities
export const themeVariants = {
  light: {
    primary: {
      gradient: 'from-blue-500 to-teal-600',
      solid: 'bg-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    secondary: {
      gradient: 'from-slate-400 to-slate-600',
      solid: 'bg-slate-500',
      text: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200'
    },
    success: {
      gradient: 'from-green-400 to-emerald-600',
      solid: 'bg-green-500',
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    warning: {
      gradient: 'from-yellow-400 to-orange-500',
      solid: 'bg-yellow-500',
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    error: {
      gradient: 'from-red-400 to-pink-500',
      solid: 'bg-red-500',
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    surface: {
      primary: 'bg-white',
      secondary: 'bg-slate-50',
      tertiary: 'bg-slate-100',
      glass: 'bg-white/80 backdrop-blur-sm',
      border: 'border-slate-200'
    }
  },
  dark: {
    primary: {
      gradient: 'from-blue-400 to-teal-500',
      solid: 'bg-blue-400',
      text: 'text-blue-400',
      bg: 'bg-blue-950',
      border: 'border-blue-800'
    },
    secondary: {
      gradient: 'from-slate-300 to-slate-500',
      solid: 'bg-slate-400',
      text: 'text-slate-400',
      bg: 'bg-slate-900',
      border: 'border-slate-700'
    },
    success: {
      gradient: 'from-green-300 to-emerald-500',
      solid: 'bg-green-400',
      text: 'text-green-400',
      bg: 'bg-green-950',
      border: 'border-green-800'
    },
    warning: {
      gradient: 'from-yellow-300 to-orange-400',
      solid: 'bg-yellow-400',
      text: 'text-yellow-400',
      bg: 'bg-yellow-950',
      border: 'border-yellow-800'
    },
    error: {
      gradient: 'from-red-300 to-pink-400',
      solid: 'bg-red-400',
      text: 'text-red-400',
      bg: 'bg-red-950',
      border: 'border-red-800'
    },
    surface: {
      primary: 'bg-slate-900',
      secondary: 'bg-slate-800',
      tertiary: 'bg-slate-700',
      glass: 'bg-slate-900/80 backdrop-blur-sm',
      border: 'border-slate-700'
    }
  }
};

export function useThemeVariants() {
  const { isDark } = useTheme();
  return isDark ? themeVariants.dark : themeVariants.light;
}

// Animation presets for theme-aware components
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
};

export function useAnimations() {
  return animations;
}