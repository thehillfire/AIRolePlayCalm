import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTheme, mergeTheme } from '../constants/theme';
import { fetchThemeByApiKey, getUserThemeFromFirestore } from '../services/ui';
import { useAuth } from '../hooks/useAuth';

export const ThemeContext = createContext({ theme: defaultTheme, setApiKey: () => {}, apiKey: null, refreshTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [apiKey, setApiKeyState] = useState(null);
  const { user } = useAuth();

  // Load saved API key (per device/user) on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('ui_api_key');
      if (saved) {
        setApiKeyState(saved);
      }
    })();
  }, []);

  // Whenever apiKey or user changes, try to (1) fetch remote theme by key, else (2) load Firestore per-user theme
  useEffect(() => {
    (async () => {
      try {
        if (apiKey) {
          const remote = await fetchThemeByApiKey(apiKey);
          if (remote) {
            setTheme(mergeTheme(remote));
            return;
          }
        }
        if (user) {
          const fsTheme = await getUserThemeFromFirestore(user.uid);
          if (fsTheme) {
            setTheme(mergeTheme(fsTheme));
            return;
          }
        }
        setTheme(defaultTheme);
      } catch {
        setTheme(defaultTheme);
      }
    })();
  }, [apiKey, user]);

  const setApiKey = async (key) => {
    setApiKeyState(key);
    if (key) await AsyncStorage.setItem('ui_api_key', key);
    else await AsyncStorage.removeItem('ui_api_key');
  };

  const value = useMemo(() => ({ theme, apiKey, setApiKey, refreshTheme: () => setApiKeyState((k) => k) }), [theme, apiKey]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
