import { Audio } from 'expo-av';

let soundCache = {};

/**
 * Peaceful sound effects for UI interactions
 * These are simple sine wave tones that create a calming experience
 */
const calmSounds = {
  // Soft chime for button clicks
  buttonClick: {
    frequency: 528, // Love frequency / healing frequency
    duration: 100,
    waveform: 'sine',
  },
  // Gentle bell for confirmations
  confirm: {
    frequency: 639, // Healing frequency
    duration: 200,
    waveform: 'sine',
  },
  // Soft tone for screen transitions
  transition: {
    frequency: 741, // Intuition frequency
    duration: 300,
    waveform: 'sine',
  },
  // Gentle alert sound
  alert: {
    frequency: 852, // Awakening frequency
    duration: 250,
    waveform: 'sine',
  },
};

/**
 * Generate a simple sound using Web Audio API (for web platform)
 */
const generateToneWeb = async (frequency, duration, volume = 0.1) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error generating tone:', error);
  }
};

/**
 * Play a calm sound effect
 */
export const playCalmSound = async (soundName = 'buttonClick', volume = 0.1) => {
  try {
    const sound = calmSounds[soundName];
    if (!sound) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    // For web platform, use Web Audio API
    if (typeof window !== 'undefined' && window.AudioContext) {
      await generateToneWeb(sound.frequency, sound.duration, volume);
    } else {
      // For native platforms, you would need to use actual audio files
      console.log(`Playing sound: ${soundName} at ${sound.frequency}Hz`);
    }
  } catch (error) {
    console.error('Error playing calm sound:', error);
  }
};

/**
 * Play button click sound - VERY QUIET
 */
export const playButtonClick = async (volume = 0.08) => {
  await playCalmSound('buttonClick', volume);
};

/**
 * Play confirmation sound - VERY QUIET
 */
export const playConfirm = async (volume = 0.12) => {
  await playCalmSound('confirm', volume);
};

/**
 * Play transition sound
 */
export const playTransition = async (volume = 0.2) => {
  await playCalmSound('transition', volume);
};

/**
 * Play alert sound
 */
export const playAlert = async (volume = 0.25) => {
  await playCalmSound('alert', volume);
};

/**
 * Play a deeper/lower version of the button click (for back/navigation)
 */
export const playDeepClick = async (volume = 0.12) => {
  try {
    // lower frequency for a deeper sound
    const frequency = 300;
    const duration = 140;
    if (typeof window !== 'undefined' && window.AudioContext) {
      await generateToneWeb(frequency, duration, volume);
    } else {
      console.log(`Playing deep click at ${frequency}Hz`);
    }
  } catch (error) {
    console.error('Error playing deep click:', error);
  }
};

/**
 * Mute/unmute all sounds
 */
let isMuted = false;
export const setMuted = (muted) => {
  isMuted = muted;
};

export const isSoundMuted = () => isMuted;

export default {
  playButtonClick,
  playConfirm,
  playTransition,
  playAlert,
  setMuted,
  isSoundMuted,
};
