import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Video } from 'expo-av';

export default function BackgroundVideo({ source, muted = true, loop = true, style }) {
  if (!source) return null;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Video
        source={source}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={loop}
        isMuted={muted}
        rate={1.0}
        volume={1.0}
        useNativeControls={false}
        progressUpdateIntervalMillis={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
