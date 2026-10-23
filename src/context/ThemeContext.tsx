import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../theme';

interface ThemeContextType {
  isDark: boolean;
  theme: typeof colors.light | typeof colors.dark;
  toggleTheme: () => void;
  setScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

const THEME_PREF_KEY = 'axiora_pulse_theme_pref';

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: colors.light,
  toggleTheme: () => {},
  setScheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [userScheme, setUserScheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    SecureStore.getItemAsync(THEME_PREF_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setUserScheme(saved);
      }
    });
  }, []);

  const isDark = userScheme === 'system' ? systemScheme === 'dark' : userScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setUserScheme(next);
    SecureStore.setItemAsync(THEME_PREF_KEY, next);
  };

  const setScheme = (scheme: 'light' | 'dark' | 'system') => {
    setUserScheme(scheme);
    SecureStore.setItemAsync(THEME_PREF_KEY, scheme);
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
