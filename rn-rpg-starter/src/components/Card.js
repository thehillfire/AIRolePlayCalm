import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function Card({ children, style }) {
  const { theme } = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14 }
});