import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import CalmContainer from '../components/CalmContainer';
import { calmTheme } from '../constants/calmTheme';
import { playButtonClick } from '../services/calmSoundService';

export default function ChatScreen({ route }) {
  const { chatId, chatName } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId || !user) return;
    await playButtonClick(0.08);
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text: input,
      sender: user.email,
      timestamp: Date.now(),
    });
    setInput('');
  };

  const isMyMessage = (senderEmail) => senderEmail === user?.email;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.chatName}>{chatName || 'Conversation'}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              isMyMessage(item.sender) ? styles.myMessageContainer : styles.otherMessageContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                isMyMessage(item.sender) ? styles.myMessage : styles.otherMessage,
              ]}
            >
              {!isMyMessage(item.sender) && (
                <Text style={styles.sender}>{item.sender}</Text>
              )}
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.messageList}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Share your thoughts..."
          placeholderTextColor={calmTheme.text.secondary}
          multiline
          maxHeight={80}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: calmTheme.background.primary,
  },
  header: {
    paddingVertical: calmTheme.spacing.md,
    paddingHorizontal: calmTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `rgba(139, 157, 195, 0.2)`,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    letterSpacing: 1,
  },
  messageList: {
    paddingVertical: calmTheme.spacing.md,
    paddingHorizontal: calmTheme.spacing.lg,
  },
  messageContainer: {
    marginVertical: calmTheme.spacing.sm,
    flexDirection: 'row',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: calmTheme.spacing.md,
    paddingVertical: calmTheme.spacing.sm,
    borderRadius: calmTheme.radius.lg,
  },
  myMessage: {
    backgroundColor: `rgba(139, 157, 195, 0.25)`,
    borderColor: calmTheme.accent.primary,
    borderWidth: 1,
  },
  otherMessage: {
    backgroundColor: `rgba(123, 163, 163, 0.15)`,
    borderColor: calmTheme.accent.secondary,
    borderWidth: 1,
  },
  sender: {
    fontSize: 11,
    color: calmTheme.text.secondary,
    marginBottom: calmTheme.spacing.xs,
    fontWeight: '400',
  },
  messageText: {
    fontSize: 14,
    color: calmTheme.text.primary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: calmTheme.spacing.md,
    paddingHorizontal: calmTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: `rgba(139, 157, 195, 0.2)`,
    gap: calmTheme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: calmTheme.background.tertiary,
    color: calmTheme.text.primary,
    borderRadius: calmTheme.radius.lg,
    paddingHorizontal: calmTheme.spacing.md,
    paddingVertical: calmTheme.spacing.md,
    borderWidth: 1,
    borderColor: calmTheme.accent.primary,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: `rgba(139, 157, 195, 0.2)`,
    borderColor: calmTheme.accent.primary,
    borderWidth: 2,
    paddingHorizontal: calmTheme.spacing.md,
    paddingVertical: calmTheme.spacing.sm,
    borderRadius: calmTheme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: calmTheme.accent.primary,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
