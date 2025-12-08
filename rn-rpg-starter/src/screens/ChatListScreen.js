import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import CalmContainer from '../components/CalmContainer';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import { calmTheme } from '../constants/calmTheme';
import { playButtonClick } from '../services/calmSoundService';

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('members', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const startGroupChat = async () => {
    if (!user) return;
    await playButtonClick(0.08);
    const newChat = await addDoc(collection(db, 'chats'), {
      members: [user.uid],
      name: 'New Conversation',
      createdAt: Date.now(),
    });
    navigation.navigate('Chat', { chatId: newChat.id, chatName: 'New Conversation' });
  };

  const handleChatPress = async (chatId, chatName) => {
    await playButtonClick(0.08);
    navigation.navigate('Chat', { chatId, chatName });
  };

  return (
    <CalmContainer padded>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Connect with fellow wanderers</Text>
      </View>

      <View style={styles.buttonContainer}>
        <CalmButton
          onPress={startGroupChat}
          variant="primary"
          size="lg"
          fullWidth
        >
          Start New Conversation
        </CalmButton>
      </View>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleChatPress(item.id, item.name)}
            activeOpacity={0.7}
          >
            <CalmCard variant="secondary" style={styles.chatCard}>
              <Text style={styles.chatName}>{item.name || 'Conversation'}</Text>
              <Text style={styles.members}>
                {item.members?.length || 0} participant{item.members?.length !== 1 ? 's' : ''}
              </Text>
            </CalmCard>
          </TouchableOpacity>
        )}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </CalmContainer>
  );
}

const styles = StyleSheet.create({
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
  buttonContainer: {
    marginBottom: calmTheme.spacing.lg,
  },
  listContent: {
    gap: calmTheme.spacing.md,
  },
  chatCard: {
    padding: calmTheme.spacing.lg,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.sm,
  },
  members: {
    fontSize: 12,
    color: calmTheme.text.secondary,
    fontWeight: '300',
  },
});
