import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import CalmContainer from '../components/CalmContainer';
import { calmTheme } from '../constants/calmTheme';
import { useTheme } from '../hooks/useTheme';
import { playButtonClick } from '../services/calmSoundService';

export default function SettingsScreen() {
  const { apiKey, setApiKey, refreshTheme } = useTheme();
  const [value, setValue] = useState(apiKey || '');

  useEffect(() => {
    setValue(apiKey || '');
  }, [apiKey]);

  const handleSave = async () => {
    await playButtonClick(0.08);
    setApiKey(value.trim() || null);
  };

  const handleRefresh = async () => {
    await playButtonClick(0.08);
    refreshTheme();
  };

  const handleClear = async () => {
    await playButtonClick(0.08);
    setValue('');
    setApiKey(null);
  };

  return (
    <CalmContainer scrollable padded>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.decorativeLine} />
          <Text style={styles.subtitle}>
            Customize your experience
          </Text>
        </View>

        {/* API Key Section */}
        <CalmCard variant="primary" style={styles.cardSection}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.description}>
            Enter your API key to load personalized theme settings.
          </Text>
          <TextInput
            style={[styles.input, { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary }]}
            placeholder="Enter API key (e.g., DEMO_DARK_TEAL)"
            placeholderTextColor={calmTheme.text.secondary}
            autoCapitalize="none"
            value={value}
            onChangeText={setValue}
          />
          <View style={styles.buttonGroup}>
            <CalmButton
              onPress={handleSave}
              variant="primary"
              size="md"
              fullWidth
            >
              Save Key
            </CalmButton>
            <CalmButton
              onPress={handleRefresh}
              variant="secondary"
              size="md"
              fullWidth
            >
              Refresh Theme
            </CalmButton>
            <CalmButton
              onPress={handleClear}
              variant="tertiary"
              size="md"
              fullWidth
            >
              Clear Key
            </CalmButton>
          </View>
        </CalmCard>

        {/* Information Section */}
        <CalmCard variant="secondary" style={styles.cardSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.infoText}>
            LoreForge is a peaceful, surreal RPG experience designed to inspire creativity and imagination.
          </Text>
          <Text style={styles.infoText}>
            All your journeys are woven into the fabric of our realm, creating a unique and personal narrative.
          </Text>
        </CalmCard>
      </ScrollView>
    </CalmContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: calmTheme.spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: calmTheme.spacing.xxl,
  },
  title: {
    fontSize: 42,
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
  subtitle: {
    fontSize: 14,
    color: calmTheme.text.secondary,
    fontWeight: '300',
  },
  cardSection: {
    marginBottom: calmTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  description: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    marginBottom: calmTheme.spacing.md,
    lineHeight: 20,
  },
  input: {
    padding: calmTheme.spacing.md,
    borderRadius: calmTheme.radius.lg,
    marginBottom: calmTheme.spacing.lg,
    borderWidth: 1,
    borderColor: calmTheme.accent.primary,
    fontSize: 14,
  },
  buttonGroup: {
    gap: calmTheme.spacing.md,
  },
  infoText: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    lineHeight: 20,
    marginBottom: calmTheme.spacing.md,
    fontWeight: '300',
  },
});
