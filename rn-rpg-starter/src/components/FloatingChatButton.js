import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { calmTheme } from '../constants/calmTheme';
import { playButtonClick } from '../services/calmSoundService';

export default function FloatingChatButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => { playButtonClick(0.08); if (onPress) onPress(); }}
    >
      <Text style={styles.buttonText}>💬</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: calmTheme.spacing.lg,
    right: calmTheme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: calmTheme.radius.md,
    backgroundColor: calmTheme.background.secondary,
    borderWidth: 1,
    borderColor: calmTheme.glow.soft,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: calmTheme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  buttonText: {
    fontSize: 24,
    color: calmTheme.accent.primary,
    fontWeight: '700',
  },
});