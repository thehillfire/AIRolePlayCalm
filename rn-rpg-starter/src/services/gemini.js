/**
 * Gemini API Service for generating RPG classes
 * Uses secure backend to protect API keys - NO KEYS STORED IN APP
 */

import { db } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// Your secure backend URL - replace with your actual backend
// For local testing: 'http://localhost:3000'
// For production: 'https://your-project-name.vercel.app'
// Backend configuration
const BACKEND_URL = 'https://loreforge-backend.vercel.app';

/**
 * Check if backend is configured
 */
export function isBackendConfigured() {
  return BACKEND_URL !== 'https://your-project-name.vercel.app';
}

/**
 * Fetch random themes from Firebase database with rarity weighting
 */
async function getRandomThemes(count = 1) {
  try {
    const themesRef = collection(db, 'themes');
    const snapshot = await getDocs(query(themesRef, limit(100))); // Get more to choose from
    
    if (snapshot.empty) {
      // Fallback if no themes in database
      return ['void'];
    }
    
    const themes = snapshot.docs.map(doc => ({
      name: doc.data().name,
      rarity: doc.data().rarity,
      description: doc.data().description || ''
    }));
    
    const randomThemes = [];
    
    for (let i = 0; i < count && themes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * themes.length);
      randomThemes.push(themes[randomIndex].name);
      themes.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return randomThemes;
  } catch (error) {
    console.warn('Failed to fetch themes from Firebase:', error);
    // Fallback themes
    return ['void'];
  }
}

/**
 * Fetch random roles from Firebase database with rarity weighting
 */
async function getRandomRoles(count = 1) {
  try {
    const rolesRef = collection(db, 'roles');
    const snapshot = await getDocs(query(rolesRef, limit(50))); // Get more to choose from
    
    if (snapshot.empty) {
      // Fallback if no roles in database
      return ['hunter'];
    }
    
    const roles = snapshot.docs.map(doc => ({
      name: doc.data().name,
      rarity: doc.data().rarity,
      description: doc.data().description || ''
    }));
    
    const randomRoles = [];
    
    for (let i = 0; i < count && roles.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * roles.length);
      randomRoles.push(roles[randomIndex].name);
      roles.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return randomRoles;
  } catch (error) {
    console.warn('Failed to fetch roles from Firebase:', error);
    // Fallback roles
    return ['hunter'];
  }
}

/**
 * Generate story content for RPG campaigns using secure backend
 */
export async function generateStory(prompt) {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set up your secure backend first.');
  }

  try {
    console.log('📚 Generating story via secure backend...');
    
    const response = await fetch(`${BACKEND_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        requestId: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Story Generation API Error:', response.status, errorData);
      
      if (response.status === 429) {
        const errorJson = JSON.parse(errorData);
        const retryAfter = errorJson.retryAfter || 30;
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds and try again.`);
      }
      
      throw new Error(`Backend Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Backend returned unsuccessful response');
    }

    console.log('✅ Story generated successfully');
    return data.story;

  } catch (error) {
    console.error('❌ Error generating story:', error);
    throw error;
  }
}

/**
 * Generate a single RPG class using secure backend
 */
export async function generateRPGClass(rarity = null) {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set up your secure backend first.');
  }

  const rarityPrompt = rarity ? `with ${rarity} rarity` : 'with a random rarity (Common, Uncommon, Rare, Epic, Legendary, Mythic, Eternal)';
  
  try {
    // Fetch dynamic themes and roles from Firebase
    console.log('🎲 Fetching themes and roles from database...');
    const [themes, roles] = await Promise.all([
      getRandomThemes(1),
      getRandomRoles(1)
    ]);
    
    const theme = themes[0];
    const role = roles[0];
    
    const prompt = `Create unique RPG class ${rarityPrompt}. Theme: ${theme}, Role: ${role}. Avoid weaver/rune/chrono. JSON only:
{"name":"Name","rarity":"Common|Uncommon|Rare|Epic|Legendary|Mythic|Eternal","description":"Brief desc"}`;

    console.log(`🎨 Using theme: ${theme}, role: ${role}`);
    console.log('🤖 Generating RPG class via secure backend...');
    
    const response = await fetch(`${BACKEND_URL}/api/generate-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        rarity: rarity || null,
        requestId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API Error:', response.status, errorData);
      
      // Enhanced error handling for rate limits
      if (response.status === 429) {
        const errorJson = JSON.parse(errorData);
        const retryAfter = errorJson.retryAfter || 30;
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds and try again.`);
      }
      
      throw new Error(`Backend Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Backend returned unsuccessful response');
    }

    const classData = data.class;

    // Validate the response structure
    if (!classData.name || !classData.rarity || !classData.description) {
      throw new Error('Invalid class data structure from backend');
    }

    // Add additional metadata
    const enhancedClass = {
      id: `backend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...classData,
      source: 'backend',
      generatedAt: new Date().toISOString(),
      usedTheme: theme,
      usedRole: role
    };

    console.log('✅ Generated RPG class:', enhancedClass.name, `(${enhancedClass.rarity})`);
    return enhancedClass;

  } catch (error) {
    console.error('❌ Error generating RPG class:', error);
    throw error;
  }
}

/**
 * Generate multiple RPG classes at once
 */
export async function generateMultipleRPGClasses(count = 5, rarities = null) {
  const classes = [];
  const errors = [];

  console.log(`🤖 Generating ${count} RPG classes...`);

  for (let i = 0; i < count; i++) {
    try {
      const rarity = rarities && rarities.length > 0 ? 
        rarities[Math.floor(Math.random() * rarities.length)] : null;
      
      const generatedClass = await generateRPGClass(rarity);
      classes.push(generatedClass);
      
      // Add a small delay to avoid rate limiting
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Error generating class ${i + 1}:`, error);
      errors.push({ index: i, error: error.message });
    }
  }

  console.log(`✅ Generated ${classes.length}/${count} classes successfully`);
  
  return {
    classes,
    errors,
    successCount: classes.length,
    totalRequested: count
  };
}

/**
 * Test the backend connection
 */
export async function testBackendConnection() {
  if (!isBackendConfigured()) {
    return { success: false, error: 'Backend URL not configured' };
  }

  try {
    console.log('🧪 Testing backend connection...');
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful');
      return { success: true, data };
    } else {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get backend status and configuration
 */
export async function getBackendStatus() {
  if (!isBackendConfigured()) {
    return {
      configured: false,
      status: 'Backend URL not set',
      url: BACKEND_URL
    };
  }

  try {
    const healthCheck = await testBackendConnection();
    return {
      configured: true,
      status: healthCheck.success ? 'Connected' : 'Error',
      url: BACKEND_URL,
      error: healthCheck.error || null
    };
  } catch (error) {
    return {
      configured: true,
      status: 'Error',
      url: BACKEND_URL,
      error: error.message
    };
  }
}