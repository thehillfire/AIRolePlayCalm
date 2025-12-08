import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../services/firebase';
import { collection, addDoc, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import CalmContainer from '../components/CalmContainer';
import CalmButton from '../components/CalmButton';
import CalmCard from '../components/CalmCard';
import { calmTheme } from '../constants/calmTheme';
import { playButtonClick } from '../services/calmSoundService';

export default function ContactsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = collection(db, `users/${user.uid}/contacts`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const addContact = async () => {
    if (!email.trim() || !user) return;
    await playButtonClick(0.08);
    await setDoc(doc(db, `users/${user.uid}/contacts/${email}`), {
      email,
      addedAt: Date.now(),
    });
    setEmail('');
  };

  const handleContactPress = async (contactEmail) => {
    await playButtonClick(0.08);
    navigation.navigate('Game', { contactUsername: contactEmail });
  };

  return (
    <CalmContainer padded>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>Connect with fellow travelers</Text>
      </View>

      <CalmCard variant="primary" style={styles.addSection}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: calmTheme.text.primary, backgroundColor: calmTheme.background.tertiary }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Add contact by email..."
            placeholderTextColor={calmTheme.text.secondary}
            autoCapitalize="none"
          />
        </View>
        <CalmButton
          onPress={addContact}
          variant="primary"
          size="md"
          fullWidth
        >
          Add Contact
        </CalmButton>
      </CalmCard>

      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleContactPress(item.email)}
            activeOpacity={0.7}
          >
            <CalmCard variant="secondary" style={styles.contactCard}>
              <Text style={styles.contactEmail}>{item.email}</Text>
              <Text style={styles.contactTime}>
                Added {new Date(item.addedAt).toLocaleDateString()}
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
  addSection: {
    marginBottom: calmTheme.spacing.lg,
  },
  inputRow: {
    marginBottom: calmTheme.spacing.md,
  },
  input: {
    padding: calmTheme.spacing.md,
    borderRadius: calmTheme.radius.lg,
    borderWidth: 1,
    borderColor: calmTheme.accent.primary,
    fontSize: 14,
    marginBottom: calmTheme.spacing.md,
  },
  listContent: {
    gap: calmTheme.spacing.md,
  },
  contactCard: {
    padding: calmTheme.spacing.lg,
  },
  contactEmail: {
    fontSize: 15,
    fontWeight: '400',
    color: calmTheme.accent.primary,
    marginBottom: calmTheme.spacing.xs,
  },
  contactTime: {
    fontSize: 12,
    color: calmTheme.text.secondary,
    fontWeight: '300',
  },
});
