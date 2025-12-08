import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import CalmContainer from '../components/CalmContainer';
import { calmTheme } from '../constants/calmTheme';
import { useAuth } from '../hooks/useAuth';
import { playButtonClick } from '../services/calmSoundService';
import BackgroundVideo from '../components/BackgroundVideo';
import { BACKGROUND_VIDEO, BACKGROUND_VIDEO_MUTED } from '../constants/media';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const handleNavigation = async (screen) => {
    await playButtonClick(0.08);
    navigation.navigate(screen);
  };

  const handleSignOut = async () => {
    await playButtonClick(0.08);
    signOut();
  };

  return (
    <View style={styles.screenWrapper}>
      <BackgroundVideo source={BACKGROUND_VIDEO} muted={BACKGROUND_VIDEO_MUTED} />
      <CalmContainer scrollable padded>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Welcome Home</Text>
          <Text style={styles.subtitle}>{user?.email || 'Traveler'}</Text>
          <View style={styles.decorativeLine} />
          <Text style={styles.description}>
            Your realm awaits. Choose your next adventure.
          </Text>
        </View>

        {/* Adventure Section */}
        <CalmCard variant="primary" style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Begin Your Journey</Text>
          <View style={styles.buttonGroup}>
            <CalmButton
              onPress={() => handleNavigation('Game')}
              variant="primary"
              size="lg"
              fullWidth
            >
              Generate Class
            </CalmButton>
            <CalmButton
              onPress={() => handleNavigation('Imagine')}
              variant="secondary"
              size="lg"
              fullWidth
            >
              Imagine Story
            </CalmButton>
          </View>
        </CalmCard>

        {/* Communication Section */}
        <CalmCard variant="secondary" style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.buttonGroup}>
            <CalmButton
              onPress={() => handleNavigation('ChatList')}
              variant="primary"
              size="md"
              fullWidth
            >
              Messages
            </CalmButton>
            <CalmButton
              onPress={() => handleNavigation('Contacts')}
              variant="secondary"
              size="md"
              fullWidth
            >
              Contacts
            </CalmButton>
          </View>
        </CalmCard>

        {/* Settings Section */}
        <CalmCard variant="tertiary" style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.buttonGroup}>
            <CalmButton
              onPress={() => handleNavigation('Inventory')}
              variant="primary"
              size="md"
              fullWidth
            >
              Inventory
            </CalmButton>
            <CalmButton
              onPress={() => handleNavigation('Settings')}
              variant="secondary"
              size="md"
              fullWidth
            >
              Settings
            </CalmButton>
          </View>
        </CalmCard>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <CalmButton
            onPress={handleSignOut}
            variant="tertiary"
            size="lg"
            fullWidth
          >
            Depart
          </CalmButton>
        </View>
      </ScrollView>
    </CalmContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    position: 'relative',
  },
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
    marginBottom: calmTheme.spacing.sm,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: calmTheme.accent.secondary,
    marginBottom: calmTheme.spacing.lg,
    fontWeight: '300',
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: calmTheme.accent.tertiary,
    marginVertical: calmTheme.spacing.md,
    opacity: 0.6,
  },
  description: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
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
  buttonGroup: {
    gap: calmTheme.spacing.md,
  },
  signOutSection: {
    marginTop: calmTheme.spacing.lg,
  },
});
