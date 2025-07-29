import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Theme {
  colors: {
    primary: string;
    primaryGradient: string[];
    secondaryGradient: string[];
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    card: string;
    cardShadow: string;
    statusBar: 'light-content' | 'dark-content';
    accent: string;
    overlay: string;
    ripple: string;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
    elevated: object;
  };
  borderRadius: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
    round: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontFamily: string;
    fontWeights: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#6200EE',
    primaryGradient: ['#6200EE', '#BB86FC'],
    secondaryGradient: ['#03DAC6', '#6200EE'],
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#B00020',
    success: '#00C853',
    warning: '#FF6F00',
    info: '#2196F3',
    card: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    statusBar: 'dark-content',
    accent: '#03DAC6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    ripple: 'rgba(98, 0, 238, 0.12)',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  borderRadius: {
    xs: 4,
    small: 8,
    medium: 12,
    large: 16,
    xl: 24,
    round: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: 'System',
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#BB86FC',
    primaryGradient: ['#BB86FC', '#6200EE'],
    secondaryGradient: ['#03DAC6', '#BB86FC'],
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#3D3D3D',
    error: '#CF6679',
    success: '#03DAC6',
    warning: '#FFB74D',
    info: '#81C784',
    card: '#1E1E1E',
    cardShadow: 'rgba(0, 0, 0, 0.8)',
    statusBar: 'light-content',
    accent: '#03DAC6',
    overlay: 'rgba(0, 0, 0, 0.9)',
    ripple: 'rgba(187, 134, 252, 0.2)',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.9,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1.0,
      shadowRadius: 16,
      elevation: 12,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1.0,
      shadowRadius: 24,
      elevation: 20,
    },
  },
  borderRadius: {
    xs: 4,
    small: 8,
    medium: 12,
    large: 16,
    xl: 24,
    round: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily: 'System',
    fontWeights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // If no saved preference, default to dark mode
        setIsDarkMode(true);
        await AsyncStorage.setItem('theme', 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to dark mode on error
      setIsDarkMode(true);
    }
  };

  const toggleTheme = async () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    try {
      await AsyncStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
