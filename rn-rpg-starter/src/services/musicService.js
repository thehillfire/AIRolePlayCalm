import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

let soundObject = null;
let isMusicInitialized = false;
let hasUserInteracted = false;
let musicVolume = 0.7;
let musicMuted = false;
let previousVolumeBeforeMute = musicVolume;

const attemptPlay = async () => {
  if (soundObject && isMusicInitialized && !hasUserInteracted) {
    try {
      console.log('Attempting to play music');
      await soundObject.playAsync();
      hasUserInteracted = true;
      console.log('Music started playing');
      // Remove listeners after first successful play
      if (Platform.OS === 'web') {
        document.removeEventListener('click', attemptPlay);
        document.removeEventListener('touchstart', attemptPlay);
        document.removeEventListener('keydown', attemptPlay);
      }
    } catch (error) {
      console.error('Error playing music:', error);
    }
  }
};

export const initializeMusic = async (musicSource) => {
  try {
    console.log('Initialize Music called');
    console.log('Platform:', Platform.OS);
    
    // Set audio mode to allow playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      allowsRecordingIOS: false,
    });

    if (soundObject) {
      await soundObject.unloadAsync();
    }

    soundObject = new Audio.Sound();
    
    console.log('Loading music from:', musicSource);
    
    // Load the music file - handle both require() objects and strings
    const source = typeof musicSource === 'string' ? { uri: musicSource } : musicSource;
    
    await soundObject.loadAsync(source, { shouldPlay: false });
    
    console.log('Music loaded successfully');
    
    // Set it to loop
    await soundObject.setIsLoopingAsync(true);
    
    // Set volume to a reasonable level
  await soundObject.setVolumeAsync(musicVolume);
    
    isMusicInitialized = true;
    
    // On web, set up listeners for user interaction
    if (Platform.OS === 'web') {
      console.log('Running on web - setting up interaction listeners');
      document.addEventListener('click', attemptPlay);
      document.addEventListener('touchstart', attemptPlay);
      document.addEventListener('keydown', attemptPlay);
    } else {
      // On native platforms, play immediately
      console.log('Running on native platform - playing music immediately');
      await soundObject.playAsync();
      hasUserInteracted = true;
    }
    
    console.log('Music initialized successfully');
    return soundObject;
  } catch (error) {
    console.error('Error initializing music:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

export const stopMusic = async () => {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    }
  } catch (error) {
    console.error('Error stopping music:', error);
  }
};

export const pauseMusic = async () => {
  try {
    if (soundObject) {
      await soundObject.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing music:', error);
  }
};

export const resumeMusic = async () => {
  try {
    if (soundObject) {
      await soundObject.playAsync();
    }
  } catch (error) {
    console.error('Error resuming music:', error);
  }
};

export const setMusicVolume = async (volume) => {
  try {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (soundObject && !musicMuted) {
      await soundObject.setVolumeAsync(musicVolume);
    }
  } catch (error) {
    console.error('Error setting music volume:', error);
  }
};

export const getMusicVolume = () => musicVolume;

export const setMusicMuted = async (muted) => {
  try {
    musicMuted = !!muted;
    if (musicMuted) {
      // store previous volume and mute
      previousVolumeBeforeMute = musicVolume;
      if (soundObject) await soundObject.setVolumeAsync(0);
    } else {
      if (soundObject) await soundObject.setVolumeAsync(musicVolume ?? previousVolumeBeforeMute ?? 0.7);
    }
  } catch (error) {
    console.error('Error toggling music mute:', error);
  }
};

export const isMusicMuted = () => musicMuted;

// Custom hook for using background music
export const useBackgroundMusic = (musicSource) => {
  useEffect(() => {
    initializeMusic(musicSource);

    return () => {
      stopMusic();
    };
  }, [musicSource]);
};
