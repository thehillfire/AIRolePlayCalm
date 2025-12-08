import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import { calmTheme } from '../constants/calmTheme';
import { generateStory } from '../services/gemini';
import { playButtonClick, playConfirm } from '../services/calmSoundService';

export default function CampaignScreen({ route, navigation }) {
  const { classData } = route.params || {};
  const [currentStory, setCurrentStory] = useState('');
  const [userAction, setUserAction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameState, setGameState] = useState({
    chapter: 1,
    companions: [],
    playerStats: {
      health: 100,
      experience: 0,
      level: 1,
    },
    storyHistory: [],
  });

  useEffect(() => {
    if (classData) {
      initializeCampaign();
    }
  }, [classData]);

  const initializeCampaign = async () => {
    console.log('🎮 Starting campaign for:', classData.name);
    setIsGenerating(true);

    try {
      const introPrompt = `
        Create an immersive RPG story introduction for a ${classData.rarity} class character named "${classData.name}".
        Character: ${classData.name} (${classData.rarity})
        Theme: ${classData.theme?.name || 'Unknown'}
        Role: ${classData.role?.name || 'Unknown'}
        
        Generate an engaging story introduction (max 75 words) that sets the scene.
        Format as JSON: { "story": "The story text..." }
      `;

      const response = await generateStory(introPrompt);
      const storyData = JSON.parse(response);
      setCurrentStory(storyData.story);
      setGameState(prev => ({
        ...prev,
        storyHistory: [storyData.story],
      }));
      await playConfirm(0.12);
    } catch (error) {
      console.error('❌ Error generating story:', error);
      Alert.alert('Story Generation Failed', error.message);
      setCurrentStory('The realm is quiet. Try continuing the adventure...');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUserAction = async () => {
    if (!userAction.trim()) return;
    setIsGenerating(true);
    await playButtonClick(0.08);

    try {
      const continuePrompt = `
        Continue an RPG story based on user input.
        Previous: ${currentStory.slice(-300)}
        User: "${userAction}"
        Character: ${classData.name}
        Chapter: ${gameState.chapter}
        
        Generate a continuation (max 75 words) in JSON: { "story": "..." }
      `;

      const response = await generateStory(continuePrompt);
      const storyData = JSON.parse(response);
      setCurrentStory(storyData.story);
      setUserAction('');

      setGameState(prev => ({
        ...prev,
        chapter: prev.chapter + 1,
        playerStats: {
          ...prev.playerStats,
          experience: prev.playerStats.experience + 10,
          level: Math.floor((prev.playerStats.experience + 10) / 100) + 1,
        },
        storyHistory: [...prev.storyHistory, storyData.story],
      }));

      await playConfirm(0.12);
    } catch (error) {
      console.error('Error continuing story:', error);
      Alert.alert('Story Generation Failed', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!classData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No character selected</Text>
          <CalmButton onPress={() => navigation.goBack()} variant="secondary">
            Return
          </CalmButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Campaign</Text>
          <Text style={styles.characterName}>{classData.name}</Text>
          <View style={styles.decorativeLine} />
        </View>

        {/* Stats Card */}
        <CalmCard variant="secondary" style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Chapter</Text>
              <Text style={styles.statValue}>{gameState.chapter}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{gameState.playerStats.level}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>{gameState.playerStats.experience}</Text>
            </View>
          </View>
        </CalmCard>

        {/* Story Display */}
        {currentStory && !isGenerating && (
          <CalmCard variant="primary" style={styles.storyCard}>
            <Text style={styles.storyText}>{currentStory}</Text>
          </CalmCard>
        )}

        {isGenerating && (
          <CalmCard variant="primary" style={styles.loadingCard}>
            <ActivityIndicator size="large" color={calmTheme.accent.primary} />
            <Text style={styles.loadingText}>The story unfolds...</Text>
          </CalmCard>
        )}

        {/* Action Input */}
        {currentStory && (
          <CalmCard variant="secondary">
            <Text style={styles.actionTitle}>What do you do?</Text>
            <TextInput
              style={[
                styles.input,
                { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary },
              ]}
              placeholder="Describe your action..."
              placeholderTextColor={calmTheme.text.secondary}
              value={userAction}
              onChangeText={setUserAction}
              editable={!isGenerating}
              multiline
              numberOfLines={2}
            />
            <CalmButton
              onPress={handleUserAction}
              variant="primary"
              size="lg"
              fullWidth
              disabled={isGenerating || !userAction.trim()}
            >
              {isGenerating ? 'Continuing...' : 'Continue'}
            </CalmButton>
          </CalmCard>
        )}

        {/* Back Button */}
        <View style={styles.bottomButtons}>
          <CalmButton
            onPress={() => navigation.goBack()}
            variant="tertiary"
            size="md"
            fullWidth
          >
            Return to Home
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
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: calmTheme.spacing.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.sm,
    letterSpacing: 2,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '300',
    color: calmTheme.accent.secondary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: calmTheme.accent.tertiary,
    opacity: 0.6,
  },
  statsCard: {
    marginBottom: calmTheme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: calmTheme.spacing.md,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: calmTheme.text.secondary,
    marginBottom: calmTheme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: calmTheme.accent.primary,
  },
  storyCard: {
    marginBottom: calmTheme.spacing.lg,
  },
  storyText: {
    fontSize: 15,
    lineHeight: 24,
    color: calmTheme.text.primary,
    fontWeight: '300',
  },
  loadingCard: {
    marginBottom: calmTheme.spacing.lg,
    paddingVertical: calmTheme.spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    marginTop: calmTheme.spacing.md,
    fontWeight: '300',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    padding: calmTheme.spacing.md,
    borderRadius: calmTheme.radius.lg,
    marginBottom: calmTheme.spacing.lg,
    borderWidth: 1,
    borderColor: calmTheme.accent.primary,
    fontSize: 14,
    minHeight: 70,
  },
  errorText: {
    fontSize: 16,
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.lg,
  },
  bottomButtons: {
    marginTop: calmTheme.spacing.xl,
  },
});
