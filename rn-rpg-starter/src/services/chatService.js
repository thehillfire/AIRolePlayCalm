import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where
} from 'firebase/firestore';

// Send a message to a chat between two users
export async function sendMessage(conversationId, message) {
  await addDoc(collection(db, 'chats', conversationId, 'messages'), {
    ...message,
    timestamp: Date.now(),
  });
}

// Listen for new messages in a chat
export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'chats', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

// Get a unique conversation ID for two users (sorted)
export function getConversationId(userA, userB) {
  return [userA, userB].sort().join('_');
}
