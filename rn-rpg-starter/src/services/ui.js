import { db } from './firebase';
// Uncomment if you want Firestore fallback enabled right now
// import { doc, getDoc } from 'firebase/firestore';

export async function fetchThemeByApiKey(apiKey) {
  // ⚠️ Replace with your actual endpoint that returns a theme JSON
  // Expected shape: { colors: {...}, typography: {...} }
  // Example (pseudo): GET https://your-api.com/theme?key=<apiKey>
  try {
    // In Expo client, use fetch to your HTTPS endpoint:
    // const res = await fetch(`https://your-api.com/theme?key=${encodeURIComponent(apiKey)}`);
    // if (!res.ok) return null;
    // return await res.json();

    // Temporary mock response so you can see it work now:
    if (apiKey === 'DEMO_DARK_TEAL') {
      return {
        colors: {
          bg: '#070B12',
          primary: '#00E5C1',
          accent: '#7CC2FF'
        }
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getUserThemeFromFirestore(uid) {
  // Uncomment when you’re ready to use Firestore-based theme storage
  // try {
  //   const ref = doc(db, 'users', uid);
  //   const snap = await getDoc(ref);
  //   if (snap.exists()) {
  //     const data = snap.data();
  //     return data?.theme || null;
  //   }
  //   return null;
  // } catch {
  //   return null;
  // }
  return null;
}