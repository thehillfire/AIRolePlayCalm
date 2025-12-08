import React from 'react';
import { View, StyleSheet } from 'react-native';
import { calmTheme } from '../constants/calmTheme';

export const CalmCard = ({
  children,
  variant = 'primary',
  style,
  elevation = true,
}) => {
  const getCardStyle = () => {
    const variants = {
      primary: {
        borderColor: `rgba(100, 181, 246, 0.4)`,
        backgroundColor: `rgba(100, 181, 246, 0.08)`,
        shadowColor: 'rgba(100, 181, 246, 0.5)',
      },
      secondary: {
        borderColor: `rgba(129, 199, 132, 0.4)`,
        backgroundColor: `rgba(129, 199, 132, 0.08)`,
        shadowColor: 'rgba(129, 199, 132, 0.5)',
      },
      tertiary: {
        borderColor: `rgba(186, 104, 200, 0.4)`,
        backgroundColor: `rgba(186, 104, 200, 0.08)`,
        shadowColor: 'rgba(186, 104, 200, 0.5)',
      },
    };

    const variantStyle = variants[variant];
    return [
      styles.card,
      {
        borderColor: variantStyle.borderColor,
        backgroundColor: variantStyle.backgroundColor,
      },
      elevation && {
        ...styles.elevated,
        shadowColor: variantStyle.shadowColor,
      },
      style,
    ];
  };

  return <View style={getCardStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: calmTheme.radius.lg,
    padding: calmTheme.spacing.lg,
    borderWidth: 1.5,
    backgroundColor: `rgba(21, 26, 42, 0.6)`,
  },
  elevated: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default CalmCard;
