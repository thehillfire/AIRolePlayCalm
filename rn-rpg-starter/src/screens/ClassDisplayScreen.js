import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import { calmTheme } from '../constants/calmTheme';
import { playButtonClick } from '../services/calmSoundService';

export default function ClassDisplayScreen({ route, navigation }) {
  const { classData } = route.params || {};

  if (!classData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <CalmCard variant="primary">
            <Text style={styles.errorTitle}>No Class Data</Text>
            <Text style={styles.errorText}>
              Unable to load class information. Please try generating again.
            </Text>
            <CalmButton
              onPress={() => navigation.goBack()}
              variant="secondary"
            >
              Return
            </CalmButton>
          </CalmCard>
        </View>
      </SafeAreaView>
    );
  }

  const handleContinue = async () => {
    await playButtonClick(0.25);
    navigation.navigate('Campaign', { classData });
  };

  const handleReturn = async () => {
    await playButtonClick(0.2);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Your Class</Text>
          <View style={styles.decorativeLine} />
        </View>

        {/* Class Card */}
        <CalmCard variant="primary" style={styles.classCard}>
          <View style={styles.classHeader}>
            <Text style={styles.className}>{classData.name}</Text>
            <Text style={styles.rarity}>{classData.rarity}</Text>
          </View>

          {classData.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{classData.description}</Text>
            </View>
          )}

          {classData.theme && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Theme:</Text>
              <Text style={styles.detailValue}>
                {classData.theme?.name || classData.usedTheme || 'Unknown'}
              </Text>
            </View>
          )}

          {classData.role && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role:</Text>
              <Text style={styles.detailValue}>
                {classData.role?.name || classData.usedRole || 'Unknown'}
              </Text>
            </View>
          )}

          {classData.abilities && (
            <View style={styles.abilitiesSection}>
              <Text style={styles.sectionTitle}>Abilities</Text>
              <Text style={styles.abilitiesText}>{classData.abilities}</Text>
            </View>
          )}
        </CalmCard>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          <CalmButton
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
          >
            Begin Campaign
          </CalmButton>
          <CalmButton
            onPress={handleReturn}
            variant="secondary"
            size="md"
            fullWidth
          >
            Return
          </CalmButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: calmTheme.background.primary,
  },
  scrollContent: {
    padding: calmTheme.spacing.lg,
    paddingBottom: calmTheme.spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: calmTheme.spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: calmTheme.spacing.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 2,
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: calmTheme.accent.tertiary,
    opacity: 0.6,
  },
  classCard: {
    marginBottom: calmTheme.spacing.lg,
  },
  classHeader: {
    alignItems: 'center',
    marginBottom: calmTheme.spacing.lg,
    paddingBottom: calmTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `rgba(139, 157, 195, 0.2)`,
  },
  className: {
    fontSize: 32,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.sm,
    letterSpacing: 1,
  },
  rarity: {
    fontSize: 14,
    fontWeight: '400',
    color: calmTheme.accent.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  descriptionSection: {
    marginBottom: calmTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: calmTheme.text.primary,
    fontWeight: '300',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: calmTheme.spacing.md,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: calmTheme.accent.secondary,
    marginRight: calmTheme.spacing.md,
    minWidth: 70,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: calmTheme.text.primary,
    flex: 1,
    fontWeight: '300',
  },
  abilitiesSection: {
    marginTop: calmTheme.spacing.lg,
    paddingTop: calmTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: `rgba(139, 157, 195, 0.2)`,
  },
  abilitiesText: {
    fontSize: 13,
    lineHeight: 22,
    color: calmTheme.text.secondary,
    fontWeight: '300',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: calmTheme.text.secondary,
    marginBottom: calmTheme.spacing.lg,
    lineHeight: 20,
  },
  buttonsSection: {
    gap: calmTheme.spacing.md,
    marginTop: calmTheme.spacing.xl,
  },
});
