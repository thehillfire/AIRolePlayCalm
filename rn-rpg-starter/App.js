import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { useAuth } from './src/hooks/useAuth';
import RootNavigator from './src/navigation';
import MusicControls from './src/components/MusicControls';
import { useRef } from 'react';
import { playDeepClick } from './src/services/calmSoundService';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { initializeMusic, stopMusic } from './src/services/musicService';
import { playButtonClick } from './src/services/calmSoundService';
import { calmTheme } from './src/constants/calmTheme';
import CalmButton from './src/components/CalmButton';

function LoadingScreen() {
  const [fadeAnim] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        LOREFORGE
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        Awakening...
      </Animated.Text>
    </View>
  );
}

function SimpleLoginScreen() {
  const { signInAnonymously } = useAuth();

  const handleLogin = async () => {
    await playButtonClick(0.25);
    signInAnonymously();
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>LOREFORGE</Text>
        <Text style={styles.subtitle}>A Realm of Infinite Stories</Text>
        <View style={styles.decorativeLine} />
        <Text style={styles.description}>
          Step into a world of endless imagination, where tales unfold at your touch
        </Text>
        
        <View style={styles.buttonContainer}>
          <CalmButton
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
          >
            Begin Journey
          </CalmButton>
        </View>
      </View>
    </View>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  console.log('AppContent: loading =', loading, 'user =', user);

  if (loading) {
    console.log('AppContent: Showing LoadingScreen');
    return <LoadingScreen />;
  }
  if (!user) {
    console.log('AppContent: Showing SimpleLoginScreen');
    return <SimpleLoginScreen />;
  }
  console.log('AppContent: Showing NavigationContainer');
  const navStateRef = useRef();

  return (
    <NavigationContainer
      onStateChange={(state) => {
        try {
          const prev = navStateRef.current;
          const prevLen = prev?.routes?.length || 0;
          const nextLen = state?.routes?.length || 0;
          // if route count decreased, assume a 'back' navigation happened
          if (nextLen < prevLen) {
            playDeepClick(0.12);
          }
        } catch (e) {
          // ignore
        }
        navStateRef.current = state;
      }}
    >
      <>
        <RootNavigator />
        <MusicControls />
      </>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize background music when app starts
    const loadMusic = async () => {
      try {
        console.log('App: Starting to load music');
        await initializeMusic(require('./assets/background-music.mp3'));
      } catch (error) {
        console.error('App: Failed to load music:', error);
      }
    };

    loadMusic();

    return () => {
      stopMusic();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: calmTheme.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: calmTheme.spacing.lg,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    textAlign: 'center',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 18,
    color: calmTheme.accent.secondary,
    marginBottom: calmTheme.spacing.lg,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: calmTheme.accent.tertiary,
    marginVertical: calmTheme.spacing.lg,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    marginBottom: calmTheme.spacing.xl,
    lineHeight: 22,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    marginTop: calmTheme.spacing.lg,
  },
});
