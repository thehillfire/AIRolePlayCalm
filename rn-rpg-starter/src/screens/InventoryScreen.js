import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CalmCard from '../components/CalmCard';
import CalmContainer from '../components/CalmContainer';
import CalmButton from '../components/CalmButton';
import { calmTheme } from '../constants/calmTheme';

export default function InventoryScreen({ navigation }) {
  return (
    <CalmContainer padded centered>
      <CalmCard variant="primary">
        <View style={styles.content}>
          <Text style={styles.title}>Inventory</Text>
          <View style={styles.decorativeLine} />
          <Text style={styles.description}>
            Your treasures and belongings await organization.
          </Text>
          <Text style={styles.featureText}>
            Coming soon: Connect your inventory to persistent storage and view your collected items.
          </Text>
          <CalmButton
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="md"
          >
            Return
          </CalmButton>
        </View>
      </CalmCard>
    </CalmContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 2,
  },
  decorativeLine: {
    width: 40,
    height: 1,
    backgroundColor: calmTheme.accent.tertiary,
    marginVertical: calmTheme.spacing.md,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    marginBottom: calmTheme.spacing.lg,
    lineHeight: 20,
  },
  featureText: {
    fontSize: 12,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    marginBottom: calmTheme.spacing.xl,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
