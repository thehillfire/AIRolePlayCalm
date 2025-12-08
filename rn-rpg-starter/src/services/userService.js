import { db } from '../services/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Check if username is unique
export const checkUsernameAvailable = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty; // Returns true if username is available
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Save or update user profile with username
export const saveUserProfile = async (userId, userData) => {
  try {
    // Check if username is available (skip for updates of same user)
    const isAvailable = await checkUsernameAvailable(userData.username);
    
    if (!isAvailable) {
      throw new Error('Username is already taken. Please choose another one.');
    }

    await setDoc(doc(db, 'users', userId), {
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName || '',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      ...userData
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};
