import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
export default function RNButton({ label, onPress, variant = 'primary', style, textStyle, disabled }) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Interactive styles for web
  const interactiveStyle = Platform.OS === 'web' ? {
    transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
    boxShadow: isHovered ? '0 0 16px 2px #13790fff' : '0 0 0px 0px #ffb00000',
    transform: isPressed ? 'scale(0.97) skewX(-2deg)' : isHovered ? 'scale(1.04) skewX(-2deg)' : 'scale(1) skewX(0deg)',
    borderColor: isHovered ? '#13790fff' : theme.colors.border,
    backgroundColor: isPressed ? '#13790fff' : isHovered ? '#13790fff' : variantStyles(theme)[variant].backgroundColor,
    color: isPressed ? '#0a0b0d' : isHovered ? '#0a0b0d' : variantText(theme)[variant].color,
    cursor: disabled ? 'not-allowed' : 'pointer',
  } : {};

  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled}
      style={({ hovered, pressed }) => [
        styles.btn,
        { borderColor: theme.colors.border },
        variantStyles(theme)[variant],
        disabled && styles.disabled,
        Platform.OS === 'web' ? interactiveStyle : null,
        style
      ]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Text style={[ 
        styles.label, 
        variantText(theme)[variant],
        disabled && styles.disabledText,
        Platform.OS === 'web' ? { color: interactiveStyle.color, transition: 'color 0.2s cubic-bezier(.4,0,.2,1)' } : null,
        textStyle
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    // For web, allow transition only
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s cubic-bezier(.4,0,.2,1)'
    } : {})
  },
  label: { fontWeight: '700' },
  disabled: { opacity: 0.5 },
  disabledText: { opacity: 0.7 }
});

const variantStyles = (t) => ({
  primary: { backgroundColor: '#149614ff' },
  secondary: { backgroundColor: t.colors.surface },
  ghost: { backgroundColor: 'transparent' },
  pink: { backgroundColor: t.colors.pink }
});

const variantText = (t) => ({
  primary: { color: t.colors.onPrimary },
  secondary: { color: t.colors.onSurface },
  ghost: { color: t.colors.muted },
  pink: { color: '#fff' }
});
