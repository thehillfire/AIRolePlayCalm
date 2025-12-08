import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { calmTheme } from '../constants/calmTheme';

export const CalmContainer = ({
  children,
  scrollable = false,
  padded = true,
  centered = false,
  style,
}) => {
  const containerStyle = [
    styles.container,
    padded && styles.padded,
    centered && styles.centered,
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView 
        style={containerStyle}
        contentContainerStyle={centered && styles.scrollCentered}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: calmTheme.background.primary,
  },
  padded: {
    padding: calmTheme.spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CalmContainer;
