import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ClassDisplayScreen from '../screens/ClassDisplayScreen';
import CampaignScreen from '../screens/CampaignScreen';
import ImagineScreen from '../screens/ImagineScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ContactsScreen from '../screens/ContactsScreen';
import { useAuth } from '../hooks/useAuth';
import { getRandomClass } from '../services/firestore';
import ChatModal from '../components/ChatModal';
import MenuModal from '../components/MenuModal';
import CalmContainer from '../components/CalmContainer';
import CalmCard from '../components/CalmCard';
import CalmButton from '../components/CalmButton';
import { calmTheme } from '../constants/calmTheme';

const Stack = createNativeStackNavigator();

// Main Class Generation Screen Component
function MainGameScreen({ navigation }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { signOut } = useAuth();

  const handleGenerateClass = async (specificRarity = null) => {
    if (isGenerating) return;
    console.log('handleGenerateClass starting', { specificRarity });
    setIsGenerating(true);
    try {
      // Use the statically imported getRandomClass for reliability (avoid dynamic import edge-cases)
      let newClass = await getRandomClass();
      if (specificRarity) newClass = { ...newClass, rarity: specificRarity };
      console.log('Generated class', newClass);
      navigation.navigate('ClassDisplay', { classData: newClass });
    } catch (error) {
      console.error('Generate class failed', error);
      Alert.alert('Generation Error', error.message || 'Try again');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <CalmContainer centered>
      <CalmCard variant="primary" style={styles.heroCard} elevation>
        <Text style={styles.heroTitle}>LOREFORGE</Text>
        <Text style={styles.heroSubtitle}>A Realm of Infinite Stories</Text>

        <CalmButton onPress={() => handleGenerateClass()} variant="primary" size="lg" fullWidth style={{ marginTop: calmTheme.spacing.lg }}>
          {isGenerating ? 'Generating...' : 'Generate Class'}
        </CalmButton>

        <CalmButton onPress={() => navigation.navigate('Imagine')} variant="secondary" size="lg" fullWidth style={{ marginTop: calmTheme.spacing.md }}>
          Imagine Story
        </CalmButton>
      </CalmCard>

      <View style={styles.footerActions}>
        <CalmButton onPress={() => setMenuVisible(true)} variant="tertiary" style={{ marginHorizontal: calmTheme.spacing.sm }}>
          Menu
        </CalmButton>
        <CalmButton onPress={() => { signOut(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }} variant="tertiary" style={{ marginHorizontal: calmTheme.spacing.sm }}>
          Sign Out
        </CalmButton>
      </View>

      <ChatModal visible={chatVisible} onClose={() => setChatVisible(false)} />

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onChatPress={() => setChatVisible(true)}
        onContactsPress={() => navigation.navigate('Contacts')}
        onInventoryPress={() => Alert.alert('Inventory', 'Coming soon')}
        onLogoutPress={async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      />
    </CalmContainer>
  );
}

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{ 
        headerStyle: { 
          backgroundColor: calmTheme.background.primary,
          borderBottomWidth: 2,
          borderBottomColor: calmTheme.accent.primary,
          elevation: 0,
          shadowOpacity: 0,
        }, 
        headerTintColor: calmTheme.accent.primary,
        headerTitleStyle: { 
          fontWeight: '600',
          fontSize: 18,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: calmTheme.accent.primary,
        },
        headerBackTitleVisible: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen 
            name="Home" 
            component={MainGameScreen} 
            options={{ title: 'LoreForge RPG', headerShown: false }} 
          />

          <Stack.Screen 
            name="ClassDisplay" 
            component={ClassDisplayScreen} 
            options={{ title: 'Your Class' }} 
          />

          <Stack.Screen 
            name="Campaign" 
            component={CampaignScreen} 
            options={{ 
              title: 'Campaign',
              headerTintColor: calmTheme.accent.primary,
            }} 
          />

          <Stack.Screen 
            name="Imagine" 
            component={ImagineScreen} 
            options={{ 
              title: 'Imagine',
              headerTintColor: calmTheme.accent.secondary,
              headerStyle: {
                backgroundColor: calmTheme.background.primary,
                borderBottomWidth: 2,
                borderBottomColor: calmTheme.accent.secondary,
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: calmTheme.accent.secondary,
              },
            }} 
          />

          <Stack.Screen 
            name="ChatList" 
            component={ChatListScreen} 
            options={{ 
              title: 'Messages', 
              headerTintColor: calmTheme.accent.secondary,
              headerStyle: {
                backgroundColor: calmTheme.background.primary,
                borderBottomWidth: 2,
                borderBottomColor: calmTheme.accent.secondary,
                elevation: 0,
                shadowOpacity: 0,
              },
            }} 
          />

          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ 
              title: 'Chat', 
              headerTintColor: calmTheme.accent.secondary,
              headerStyle: {
                backgroundColor: calmTheme.background.primary,
                borderBottomWidth: 2,
                borderBottomColor: calmTheme.accent.secondary,
                elevation: 0,
                shadowOpacity: 0,
              },
            }} 
          />

          <Stack.Screen 
            name="Contacts" 
            component={ContactsScreen} 
            options={{ 
              title: 'Contacts', 
              headerTintColor: calmTheme.accent.tertiary,
              headerStyle: {
                backgroundColor: calmTheme.background.primary,
                borderBottomWidth: 2,
                borderBottomColor: calmTheme.accent.tertiary,
                elevation: 0,
                shadowOpacity: 0,
              },
            }} 
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b0d', // keep dark for contrast
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  backgroundGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,255,102,0.2)',
    borderStyle: 'solid',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 15,
    zIndex: 10,
  },
  menuLine: {
    width: 25,
    height: 3,
    backgroundColor: '#ffb000',
    marginVertical: 2,
    borderRadius: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#00ff66',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#00ff66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#00ff66',
    marginBottom: 50,
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.8,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: 'rgba(0,255,102,0.1)',
    borderWidth: 2,
    borderColor: '#00ff66',
    padding: 20,
    borderRadius: 8,
    width: 320,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
    position: 'relative',
    transform: [{ skewX: '0deg' }],
    overflow: 'hidden',
  },
  buttonPressed: {
    backgroundColor: 'rgba(255, 176, 0, 0.3)',
    borderColor: '#ffcc33',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    transform: [{ skewX: '-5deg' }, { scale: 0.98 }],
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 176, 0, 0.05)',
  },
  buttonGlowPressed: {
    backgroundColor: 'rgba(255, 176, 0, 0.15)',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderColor: '#666',
    shadowColor: '#666',
    opacity: 0.6,
  },
  buttonText: {
    color: '#00ff66',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: '#00ff66',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonTextPressed: {
    color: '#ffcc33',
    textShadowColor: '#ff8800',
  },
  statusText: {
    color: '#ffd966',
    fontSize: 14,
    marginTop: 30,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  testingTitle: {
    color: '#ffb000',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 40,
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  rarityContainer: {
    marginTop: 10,
    maxHeight: 60,
  },
  rarityButton: {
    backgroundColor: 'rgba(255, 176, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ffb000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 0,
    transform: [{ skewX: '-2deg' }],
  },
  rainbowButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#0a0b0d',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ skewX: '-2deg' }],
    position: 'relative',
    overflow: 'hidden',
  },
  rainbowButtonSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '9.09%', // 100% / 11 segments
    opacity: 0.7,
  },
  rainbowButtonTextContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  rainbowButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rarityButtonText: {
    color: '#ffb000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  /* Calm screen overrides */
  heroCard: {
    width: '100%',
    maxWidth: 720,
    alignItems: 'center',
    padding: calmTheme.spacing.xl,
    borderRadius: calmTheme.radius.xl,
    marginTop: calmTheme.spacing.xxl,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '300',
    color: calmTheme.accent.primary,
    letterSpacing: 3,
    marginBottom: calmTheme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: calmTheme.accent.secondary,
    marginBottom: calmTheme.spacing.lg,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: calmTheme.spacing.lg,
  },
});
