import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, I18nManager } from 'react-native';
import { calmTheme } from '../constants/calmTheme';
import { setMusicVolume, getMusicVolume, setMusicMuted, isMusicMuted } from '../services/musicService';
import { playButtonClick } from '../services/calmSoundService';

export default function MusicControls() {
  const [muted, setMuted] = useState(isMusicMuted());
  const [volume, setVolume] = useState(getMusicVolume());
  const pan = useRef(new Animated.Value(0)).current;
  const trackWidth = 120; // px width of slider
  const thumbSize = 14;

  useEffect(() => {
    // position thumb according to volume
    const x = (volume || 0) * (trackWidth - thumbSize);
    pan.setValue(x);
  }, [volume]);

  const updateVolumeFromPos = async (x) => {
    const clamped = Math.max(0, Math.min(trackWidth - thumbSize, x));
    const newVol = clamped / (trackWidth - thumbSize);
    setVolume(newVol);
    await setMusicVolume(newVol);
  };

  // maintain numeric refs so we don't rely on Animated internals
  const panValueRef = useRef(0);
  const panStartRef = useRef(0);
  useEffect(() => {
    const id = pan.addListener(({ value }) => {
      panValueRef.current = value;
    });
    return () => {
      pan.removeListener(id);
    };
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStartRef.current = panValueRef.current || 0;
      },
      onPanResponderMove: (_, gestureState) => {
        const x = panStartRef.current + gestureState.dx;
        const clamped = Math.max(0, Math.min(trackWidth - thumbSize, x));
        pan.setValue(clamped);
      },
      onPanResponderRelease: async () => {
        const x = panValueRef.current || 0;
        await updateVolumeFromPos(x);
        // tiny feedback when volume set
        playButtonClick(0.06);
      },
    })
  ).current;

  const handleMuteToggle = async () => {
    const newMuted = !muted;
    // feedback click
    playButtonClick(0.08);
    setMuted(newMuted);
    await setMusicMuted(newMuted);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.controls}>
        <Animated.View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: (volume || 0) * (trackWidth - thumbSize) + thumbSize / 2 }]} />
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.thumb, { transform: [{ translateX: pan }] }]}
          />
        </Animated.View>
        <TouchableOpacity onPress={handleMuteToggle} style={styles.muteButton}>
          <Text style={styles.muteText}>{muted ? '🔇' : volume > 0.5 ? '🔊' : '🔈'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: calmTheme.spacing.md,
    bottom: calmTheme.spacing.md,
    zIndex: 999,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: calmTheme.background.secondary,
    padding: 8,
    borderRadius: calmTheme.radius.full,
    shadowColor: calmTheme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  sliderTrack: {
    width: 120,
    height: 8,
    backgroundColor: calmTheme.background.tertiary,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: calmTheme.accent.primary,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: calmTheme.background.light,
    borderWidth: 2,
    borderColor: calmTheme.accent.primary,
    top: -3,
  },
  muteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteText: {
    fontSize: 18,
  },
});
