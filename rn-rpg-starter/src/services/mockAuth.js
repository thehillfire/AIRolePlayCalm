// Mock authentication for testing when Firebase is not available
let currentUser = null;
let authStateListeners = [];

// Mock user object
const createMockUser = (username = null) => ({
  uid: Math.random().toString(36).substring(7),
  email: username ? `${username}@loreforge.local` : null, // Create fake email for compatibility
  displayName: username,
  username: username,
  emailVerified: !!username,
  isAnonymous: !username,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
});

// Mock Firebase Auth methods
export const mockAuth = {
  currentUser: null,
  
  // Sign in with username and password
  signInWithEmailAndPassword: async (username, password) => {
    console.log('Mock: signInWithEmailAndPassword', username);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    if (username.includes('error')) {
      throw new Error('Invalid username or password');
    }
    
    const user = createMockUser(username);
    currentUser = user;
    mockAuth.currentUser = user;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(user));
    
    return { user };
  },

  // Create user with username and password
  createUserWithEmailAndPassword: async (username, password) => {
    console.log('Mock: createUserWithEmailAndPassword', username);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate some common errors
    if (username.includes('existing') || username === 'admin' || username === 'test') {
      throw new Error('This username is already taken.');
    }
    
    if (username.includes('invalid')) {
      throw new Error('Username contains invalid characters.');
    }
    
    const user = createMockUser(username);
    currentUser = user;
    mockAuth.currentUser = user;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(user));
    
    return { user };
  },

  // Sign in anonymously
  signInAnonymously: async () => {
    console.log('🟡 Mock: signInAnonymously started');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const user = createMockUser();
    console.log('🟡 Mock: Created user:', user);
    currentUser = user;
    mockAuth.currentUser = user;
    
    // Notify listeners
    console.log('🟡 Mock: Notifying', authStateListeners.length, 'listeners');
    authStateListeners.forEach(listener => {
      console.log('🟡 Mock: Calling listener with user');
      listener(user);
    });
    
    console.log('🟡 Mock: signInAnonymously completed');
    return { user };
  },

  // Sign out
  signOut: async () => {
    console.log('Mock: signOut');
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    currentUser = null;
    mockAuth.currentUser = null;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(null));
  },

  // Auth state listener
  onAuthStateChanged: (callback) => {
    console.log('Mock: onAuthStateChanged listener added');
    authStateListeners.push(callback);
    
    // Immediately call with current user
    setTimeout(() => callback(currentUser), 100);
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
};