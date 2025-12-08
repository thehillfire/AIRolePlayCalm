import React, { useState, useRef, useEffect } from 'react';
import { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { playButtonClick } from '../services/calmSoundService';
import { calmTheme } from '../constants/calmTheme';
import { sendMessage, subscribeToMessages, getConversationId } from '../services/chatService';
import { AuthContext } from '../context/AuthContext';

export default function ChatModal({ visible, onClose, contactUsername = null }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

    // Subscribe to Firestore chat messages
    useEffect(() => {
      if (!user || !contactUsername) return;
      const conversationId = getConversationId(user.username, contactUsername);
      const unsubscribe = subscribeToMessages(conversationId, setMessages);
      return unsubscribe;
    }, [user, contactUsername]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      if (messages.length > 0 && flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user && contactUsername) {
      const conversationId = getConversationId(user.username, contactUsername);
      await sendMessage(conversationId, {
        text: newMessage.trim(),
        sender: user.username,
        timestamp: Date.now(),
      });
      setNewMessage('');
    }
  };

  // Removed auto-responses. All messages are now real-time between users.

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === user?.username ? styles.userMessage : styles.otherMessage]}>
      <Text style={[styles.messageText, item.sender === user?.username ? styles.userMessageText : styles.otherMessageText]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.chatContainer, visible ? styles.slideInRight : null]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LoreForge Chat</Text>
            <TouchableOpacity onPress={() => { playButtonClick(0.08); onClose(); }} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              multiline={false}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={() => { playButtonClick(0.08); handleSendMessage(); }} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  slideInRight: {
    transform: [{ translateX: 0 }],
    opacity: 1,
    transitionProperty: 'transform, opacity',
    transitionDuration: '400ms',
    transitionTimingFunction: 'ease',
  },
  chatContainer: {
    width: '85%',
    height: '90%',
    backgroundColor: calmTheme.background.primary,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: calmTheme.glow.soft,
    paddingTop: 10,
    shadowColor: calmTheme.accent.primary,
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    position: 'absolute',
    right: 0,
    top: '5%',
    opacity: 0,
    transform: [{ translateX: 500 }],
    transitionProperty: 'transform, opacity',
    transitionDuration: '400ms',
    transitionTimingFunction: 'ease',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: calmTheme.glow.soft,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: calmTheme.accent.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  closeButtonText: {
    color: calmTheme.text.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: calmTheme.accent.primary,
    padding: 10,
    borderRadius: 12,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: calmTheme.background.tertiary,
    borderWidth: 0,
    padding: 10,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: calmTheme.glow.soft,
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    backgroundColor: calmTheme.background.tertiary,
    borderWidth: 0,
    color: calmTheme.text.primary,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: calmTheme.radius.sm,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: calmTheme.accent.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: calmTheme.radius.sm,
    borderWidth: 0,
  },
  sendButtonText: {
    color: calmTheme.background.primary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});