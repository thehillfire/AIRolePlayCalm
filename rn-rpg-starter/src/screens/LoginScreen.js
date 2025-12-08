import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import CalmContainer from '../components/CalmContainer';
import { calmTheme } from '../constants/calmTheme';
import { useAuth } from '../hooks/useAuth';
import { Alert } from 'react-native';
import { playButtonClick } from '../services/calmSoundService';
import { saveUserProfile, checkUsernameAvailable } from '../services/userService';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInAnonymously } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    await playButtonClick(0.08);
    
    if (mode === 'login') {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!username.trim()) {
        Alert.alert('Required', 'Please choose a username');
        return;
      }
      setLoading(true);
      try {
        const available = await checkUsernameAvailable(username.toLowerCase().trim());
        if (!available) {
          Alert.alert('Unavailable', 'This username is taken. Please choose another.');
          setLoading(false);
          return;
        }
        const result = await signUpWithEmail(email, password);
        await saveUserProfile(result.user.uid, {
          username: username.toLowerCase().trim(),
          email: email,
          displayName: username,
        });
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGuestLogin = async () => {
    await playButtonClick(0.08);
    signInAnonymously();
  };

  return (
    <CalmContainer scrollable padded>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>LOREFORGE</Text>
          <View style={styles.decorativeLine} />
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Welcome Back' : 'Join the Realm'}
          </Text>
        </View>

        {/* Form Card */}
        <CalmCard variant="primary" style={styles.formCard}>
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary }]}
                placeholder="Choose your name..."
                placeholderTextColor={calmTheme.text.secondary}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary }]}
            placeholder="your@email.com"
            placeholderTextColor={calmTheme.text.secondary}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary }]}
            placeholder="••••••••"
            placeholderTextColor={calmTheme.text.secondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <View style={styles.buttonGroup}>
            <CalmButton
              onPress={onSubmit}
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading
                ? mode === 'login'
                  ? 'Signing In...'
                  : 'Creating Account...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </CalmButton>

            <CalmButton
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              variant="secondary"
              size="md"
              fullWidth
              disabled={loading}
            >
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </CalmButton>
          </View>
        </CalmCard>

        {/* Guest Option */}
        <CalmCard variant="secondary" style={styles.guestCard}>
          <Text style={styles.guestTitle}>Explore as Guest</Text>
          <Text style={styles.guestDescription}>
            Experience the realm without creating an account. Your journey will be ephemeral but magical.
          </Text>
          <CalmButton
            onPress={handleGuestLogin}
            variant="tertiary"
            size="md"
            fullWidth
          >
            Continue as Guest
          </CalmButton>
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
    fontSize: 48,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 3,
  },
  decorativeLine: {
    width: 60,
    height: 1,
    backgroundColor: calmTheme.accent.tertiary,
    marginVertical: calmTheme.spacing.md,
    opacity: 0.6,
  },
  subtitle: {
    fontSize: 16,
    color: calmTheme.text.secondary,
    fontWeight: '300',
  },
  formCard: {
    marginBottom: calmTheme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: calmTheme.text.secondary,
    marginBottom: calmTheme.spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    marginTop: calmTheme.spacing.lg,
  },
  guestCard: {
    alignItems: 'center',
    textAlign: 'center',
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.md,
    letterSpacing: 1,
  },
  guestDescription: {
    fontSize: 13,
    color: calmTheme.text.secondary,
    textAlign: 'center',
    marginBottom: calmTheme.spacing.lg,
    lineHeight: 20,
    fontWeight: '300',
  },
});
