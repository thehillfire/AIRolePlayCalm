import React, { useState, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, Platform } from 'react-native';
import { playButtonClick, playDeepClick } from '../services/calmSoundService';
import { calmTheme } from '../constants/calmTheme';

export const CalmButton = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  style,
  sound = 'default', // 'default' | 'deep'
  hitSlop = { top: 20, bottom: 20, left: 20, right: 20 },
}) => {
  const [pressed, setPressed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current; // 0..1
  const translateAnim = useRef(new Animated.Value(0)).current; // for lift effect

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
    Animated.spring(translateAnim, {
      toValue: -3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    Animated.spring(translateAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverIn = () => {
    setHovering(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleHoverOut = () => {
    setHovering(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const baseStyles = {
    primary: {
      backgroundColor: 'rgba(100, 181, 246, 0.15)',
      borderColor: calmTheme.accent.primary,
      borderWidth: 2,
    },
    secondary: {
      backgroundColor: 'rgba(129, 199, 132, 0.15)',
      borderColor: calmTheme.accent.secondary,
      borderWidth: 2,
    },
    tertiary: {
      backgroundColor: 'rgba(186, 104, 200, 0.15)',
      borderColor: calmTheme.accent.tertiary,
      borderWidth: 2,
    },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: calmTheme.spacing.sm,
      paddingHorizontal: calmTheme.spacing.md,
      minHeight: 32,
    },
    md: {
      paddingVertical: calmTheme.spacing.md,
      paddingHorizontal: calmTheme.spacing.lg,
      minHeight: 48,
    },
    lg: {
      paddingVertical: calmTheme.spacing.lg,
      paddingHorizontal: calmTheme.spacing.xl,
      minHeight: 56,
    },
  };

  const glowColorMap = {
    primary: calmTheme.accent.primary,
    secondary: calmTheme.accent.secondary,
    tertiary: calmTheme.accent.tertiary,
  };

  const glowColor = glowColorMap[variant] || calmTheme.accent.primary;

  const animatedStyle = {
    transform: [
      { translateY: hovering ? -5 : translateAnim },
      { scale: scaleAnim }
    ],
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.9] }),
    shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 24] }),
    // Elevation cannot be animated with native driver; set based on state for Android
    elevation: pressed || hovering ? 20 : 15,
  };

  const glowLayerStyle = {
    backgroundColor: glowColor,
    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
    transform: [
      {
        scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.35] }),
      },
    ],
  };

  const getTextColor = () => {
    if (variant === 'primary') return calmTheme.accent.primary;
    if (variant === 'secondary') return calmTheme.accent.secondary;
    return calmTheme.accent.tertiary;
  };

  return (
    <Animated.View style={[styles.button, baseStyles[variant], sizeStyles[size], fullWidth && styles.fullWidth, pressed && styles.buttonPressed, disabled && styles.buttonDisabled, animatedStyle, style]}>
      {/* Glow layer placed behind content */}
      <Animated.View pointerEvents="none" style={[styles.glowLayer, glowLayerStyle]} />
      <Pressable
        onPress={async () => {
          console.log('CalmButton pressed', { label: children?.toString?.() });
          try {
            if (sound === 'deep') {
              playDeepClick(0.12);
            } else {
              playButtonClick(0.08);
            }
          } catch (err) {
            console.error('Sound play error', err);
          }
          if (onPress) onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        disabled={disabled}
        style={styles.pressable}
        hitSlop={hitSlop}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: disabled ? calmTheme.text.secondary : getTextColor(),
            },
          ]}
        >
          {children}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: calmTheme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  pressable: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default CalmButton;
