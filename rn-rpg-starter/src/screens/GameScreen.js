import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import CalmContainer from '../components/CalmContainer';
import { calmTheme } from '../constants/calmTheme';
import { generateRPGClass } from '../services/gemini';
import ChatModal from '../components/ChatModal';
import { playButtonClick, playConfirm } from '../services/calmSoundService';
import BackgroundVideo from '../components/BackgroundVideo';
import { BACKGROUND_VIDEO, BACKGROUND_VIDEO_MUTED } from '../constants/media';

export default function GameScreen({ navigation, route }) {
  const [hasGeneratedClass, setHasGeneratedClass] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  // Initialize database connection
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('🔥 Initializing database connection...');
        const { testFirebaseConnection } = await import('../services/firestore');
        const initResult = await testFirebaseConnection();

        if (initResult.success) {
          setIsInitialized(true);
          console.log('✅ Database initialized successfully');
        } else {
          throw new Error(initResult.error);
        }
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        setDbError(error.message);
      }
    };

    initializeDatabase();
  }, []);

  const rollRandomClass = async () => {
    if (isGenerating || hasGeneratedClass) return;

    setIsGenerating(true);
    setDbError(null);

    try {
      await playButtonClick(0.08);

      if (!isInitialized) {
        throw new Error('Database not yet ready. Please wait and try again.');
      }

      console.log('🎲 Generating your unique class...');
      const { getRandomClass } = await import('../services/firestore');
      const newClass = await getRandomClass();

      if (newClass) {
        setHasGeneratedClass(true);
        await playConfirm(0.12);
        console.log(`✅ Generated class: "${newClass.name}"`);

        setTimeout(() => {
          if (navigation && navigation.navigate) {
            navigation.navigate('ClassDisplay', { classData: newClass });
          }
        }, 500);
      }
    } catch (error) {
      console.error('❌ Failed to generate class:', error);
      setDbError(error.message);
      await playButtonClick(0.06);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <BackgroundVideo source={BACKGROUND_VIDEO} muted={BACKGROUND_VIDEO_MUTED} />
      <CalmContainer scrollable padded>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Class Creation</Text>
          <View style={styles.decorativeLine} />
          <Text style={styles.subtitle}>
            Discover your unique destiny
          </Text>
        </View>

        {/* Status Card */}
        <CalmCard variant="primary" style={styles.cardSection}>
          <View style={styles.statusContent}>
            {isInitialized && !dbError && (
              <>
                <Text style={styles.statusIcon}>✨</Text>
                <Text style={styles.statusTitle}>Ready to Create</Text>
                <Text style={styles.statusText}>
                  Your seeded database contains infinite possibilities. Each generation is unique and personal to you.
                </Text>
              </>
            )}
            {!isInitialized && !dbError && (
              <>
                <ActivityIndicator size="large" color={calmTheme.accent.primary} />
                <Text style={styles.statusTitle}>Awakening Systems</Text>
                <Text style={styles.statusText}>
                  Connecting to the realm of infinite classes...
                </Text>
              </>
            )}
            {dbError && (
              <>
                <Text style={styles.statusIcon}>⚠️</Text>
                <Text style={styles.statusTitle}>Connection Issue</Text>
                <Text style={styles.statusText}>{dbError}</Text>
              </>
            )}
            {hasGeneratedClass && (
              <>
                <Text style={styles.statusIcon}>💫</Text>
                <Text style={styles.statusTitle}>Class Generated!</Text>
                <Text style={styles.statusText}>
                  Your unique class awaits. Proceed to witness your destiny.
                </Text>
              </>
            )}
          </View>
        </CalmCard>

        {/* Generate Button */}
        {!hasGeneratedClass && isInitialized && (
          <View style={styles.buttonContainer}>
            <CalmButton
              onPress={rollRandomClass}
              variant="primary"
              size="lg"
              fullWidth
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Class'}
            </CalmButton>
          </View>
        )}

        {/* Information Card */}
        <CalmCard variant="secondary" style={styles.cardSection}>
          <Text style={styles.infoTitle}>About Class Generation</Text>
          <Text style={styles.infoText}>
            Each class is generated from a carefully curated database of themes, roles, and rarities. Your class is uniquely yours, shaped by the seeds of fate.
          </Text>
        </CalmCard>

        {/* Features Card */}
        <CalmCard variant="tertiary" style={styles.cardSection}>
          <Text style={styles.infoTitle}>Your Journey</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Discover your archetype</Text>
            <Text style={styles.featureItem}>• Explore rarity and power</Text>
            <Text style={styles.featureItem}>• Begin your adventure</Text>
          </View>
        </CalmCard>
      </ScrollView>

      {/* Chat Modal */}
      <ChatModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        contactUsername={route?.params?.contactUsername || null}
      />
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
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 2,
  },
  decorativeLine: {
    width: 60,
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
  statusContent: {
    alignItems: 'center',
    paddingVertical: calmTheme.spacing.lg,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: calmTheme.spacing.md,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '300',
  },
  buttonContainer: {
    marginBottom: calmTheme.spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    lineHeight: 20,
    fontWeight: '300',
  },
  featureList: {
    gap: calmTheme.spacing.sm,
  },
  featureItem: {
    fontSize: 13,
    color: calmTheme.accent.secondary,
    fontWeight: '300',
  },
});
