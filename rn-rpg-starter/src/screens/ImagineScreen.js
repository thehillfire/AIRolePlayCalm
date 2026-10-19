import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import CalmContainer from '../components/CalmContainer';
import { calmTheme } from '../constants/calmTheme';
import { generateStoryTurn } from '../services/gemini';
import ChatModal from '../components/ChatModal';
import MenuModal from '../components/MenuModal';
import { playButtonClick, playConfirm } from '../services/calmSoundService';
import BackgroundVideo from '../components/BackgroundVideo';
import { BACKGROUND_VIDEO, BACKGROUND_VIDEO_MUTED } from '../constants/media';

export default function ImagineScreen() {
  const [identity, setIdentity] = useState('');
  const [currentStory, setCurrentStory] = useState('');
  const [userAction, setUserAction] = useState('');
  const [storyHistory, setStoryHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const handleStart = async () => {
    if (!identity.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      await playButtonClick(0.08);
      const text = await generateStoryTurn({ mode: 'intro', identity });
      setCurrentStory(text);
      setStoryHistory([{ role: 'narrator', text }]);
      await playConfirm(0.12);
    } catch (err) {
      // Stay on the start screen so the player can retry without retyping.
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUserAction = async () => {
    const action = userAction.trim();
    if (!action || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      await playButtonClick(0.08);
      const text = await generateStoryTurn({ mode: 'continue', identity, history: storyHistory, action });
      setStoryHistory([...storyHistory, { role: 'player', text: action }, { role: 'narrator', text }]);
      setCurrentStory(text);
      setUserAction('');
      await playConfirm(0.12);
    } catch (err) {
      // Keep the current story and the typed action so the player can just press Continue again.
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <BackgroundVideo source={BACKGROUND_VIDEO} muted={BACKGROUND_VIDEO_MUTED} />
      <CalmContainer padded>
        {/* Header */}
        <View style={styles.header}>
        <Text style={styles.title}>Imagine</Text>
        <Text style={styles.subtitle}>Create your story</Text>
      </View>

      {/* Menu Modal */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onChatPress={() => {
          setMenuVisible(false);
          setChatVisible(true);
        }}
      />

      {/* Chat Modal */}
      <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} />

      {!currentStory ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Identity Input */}
          <CalmCard variant="primary" style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Who are you?</Text>
            <TextInput
              style={[
                styles.input,
                { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary },
              ]}
              placeholder="Describe yourself..."
              placeholderTextColor={calmTheme.text.secondary}
              value={identity}
              onChangeText={setIdentity}
              editable={!isGenerating}
              multiline
              numberOfLines={3}
            />
            <CalmButton
              onPress={handleStart}
              variant="primary"
              size="lg"
              fullWidth
              disabled={isGenerating || !identity.trim()}
            >
              {isGenerating ? 'Creating...' : 'Begin Story'}
            </CalmButton>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </CalmCard>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Story Display */}
          <CalmCard variant="secondary" style={styles.storyCard}>
            <Text style={styles.storyText}>{currentStory}</Text>
          </CalmCard>

          {/* Action Input */}
          <CalmCard variant="primary">
            <Text style={styles.sectionTitle}>What happens next?</Text>
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
            {error && <Text style={styles.errorText}>{error}</Text>}
          </CalmCard>

          {/* Story History */}
          {storyHistory.length > 0 && (
            <CalmCard variant="tertiary" style={styles.historyCard}>
              <Text style={styles.historyTitle}>Your Journey</Text>
              <View style={styles.historyEntry}>
                <Text style={styles.historyText}>Identity: {identity}</Text>
              </View>
              {storyHistory.map((entry, idx) => (
                <View key={idx} style={styles.historyEntry}>
                  <Text style={styles.historyText}>
                    {entry.role === 'player' ? `You: ${entry.text}` : entry.text}
                  </Text>
                </View>
              ))}
            </CalmCard>
          )}
        </ScrollView>
      )}
      </CalmContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    position: 'relative',
  },
  header: {
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
  subtitle: {
    fontSize: 14,
    color: calmTheme.text.secondary,
    fontWeight: '300',
  },
  scrollContent: {
    paddingBottom: calmTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  input: {
    padding: calmTheme.spacing.md,
    borderRadius: calmTheme.radius.lg,
    marginBottom: calmTheme.spacing.lg,
    borderWidth: 1,
    borderColor: calmTheme.accent.primary,
    fontSize: 14,
    minHeight: 80,
  },
  actionCard: {
    marginBottom: calmTheme.spacing.xl,
  },
  storyCard: {
    marginBottom: calmTheme.spacing.lg,
  },
  historyCard: {
    marginTop: calmTheme.spacing.lg,
  },
  storyText: {
    fontSize: 15,
    lineHeight: 24,
    color: calmTheme.text.primary,
    fontWeight: '300',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  errorText: {
    marginTop: calmTheme.spacing.md,
    fontSize: 13,
    lineHeight: 20,
    color: calmTheme.accent.primary,
    textAlign: 'center',
  },
  historyEntry: {
    paddingVertical: calmTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `rgba(139, 157, 195, 0.1)`,
  },
  historyText: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    lineHeight: 20,
    fontWeight: '300',
  },
});
