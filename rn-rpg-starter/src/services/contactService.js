import { db } from '../services/firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

// Find user by username
export const findUserByUsername = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null; // User not found
    }
    
    const userDoc = querySnapshot.docs[0];
    return {
      uid: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
};

// Add contact by username
export const addContactByUsername = async (currentUserId, username) => {
  try {
    // Find the user by username
    const foundUser = await findUserByUsername(username);
    
    if (!foundUser) {
      throw new Error('User not found. Please check the username and try again.');
    }
    
    if (foundUser.uid === currentUserId) {
      throw new Error('You cannot add yourself as a contact.');
    }
    
    // Add to current user's contacts
    const contactRef = doc(db, 'users', currentUserId, 'contacts', foundUser.uid);
    await setDoc(contactRef, {
      userId: foundUser.uid,
      username: foundUser.username,
      displayName: foundUser.displayName || foundUser.username,
      email: foundUser.email,
      addedAt: new Date().toISOString()
    });
    
    return { success: true, user: foundUser };
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

// Get user's contacts
export const getUserContacts = (userId, callback) => {
  const contactsRef = collection(db, 'users', userId, 'contacts');
  
  return onSnapshot(contactsRef, (snapshot) => {
    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(contacts);
  });
};

// Remove contact
export const removeContact = async (currentUserId, contactId) => {
  try {
    await deleteDoc(doc(db, 'users', currentUserId, 'contacts', contactId));
    return { success: true };
  } catch (error) {
    console.error('Error removing contact:', error);
    throw error;
  }
};
