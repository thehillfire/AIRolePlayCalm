import { db } from './firebase';
// REMOVED: No more sample classes import
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';

// Collections - Updated to match your actual Firebase collections
const METADATA_COLLECTION = 'metadata';
const ROLES_COLLECTION = 'roles';
const THEMES_COLLECTION = 'themes';
const USERS_COLLECTION = 'users';
const USER_CLASSES_COLLECTION = 'user_classes';

// ==================== RPG CLASSES DATABASE ====================

/**
 * Check if database is already seeded (you've already seeded it)
 */
export async function initializeClassesDatabase() {
  try {
    console.log('🔥 Checking your seeded Firebase collections...');
    
    // Check your actual collections
    const [metadataSnap, rolesSnap, themesSnap] = await Promise.all([
      getDocs(collection(db, METADATA_COLLECTION)),
      getDocs(collection(db, ROLES_COLLECTION)),
      getDocs(collection(db, THEMES_COLLECTION))
    ]);
    
    const metadataCount = metadataSnap.size;
    const rolesCount = rolesSnap.size;
    const themesCount = themesSnap.size;
    
    console.log(`� Themes: ${themesCount} | ⚔️ Roles: ${rolesCount} | 🧭 Metadata: ${metadataCount}`);
    
    // Check if we have the essential collections
    if (rolesCount > 0 && themesCount > 0) {
      // Try to get rarity weights from metadata
      let rarityInfo = '';
      try {
        const configDoc = await getDoc(doc(db, METADATA_COLLECTION, 'config'));
        if (configDoc.exists()) {
          const weights = configDoc.data().rarityWeights;
          const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
          rarityInfo = ` | Weighted rarity system active`;
        }
      } catch (e) {
        rarityInfo = ' | Using default rarity weights';
      }
      
      return { 
        success: true, 
        message: `🎲 Theme + Role system ready: ${themesCount} themes × ${rolesCount} roles = ${themesCount * rolesCount} possible combinations!${rarityInfo}` 
      };
    } else {
      return { 
        success: false, 
        message: `Missing essential collections. Found: themes(${themesCount}), roles(${rolesCount})` 
      };
    }
  } catch (error) {
    console.error('🔴 Error checking your seeded collections:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get summary of your seeded collections (for display purposes)
 */
export async function getAllClasses() {
  try {
    console.log('🔥 Fetching summary from your theme + role system...');
    
    // Get counts from all collections
    const [themesSnap, rolesSnap, metadataSnap] = await Promise.all([
      getDocs(collection(db, THEMES_COLLECTION)),
      getDocs(collection(db, ROLES_COLLECTION)),
      getDocs(collection(db, METADATA_COLLECTION))
    ]);
    
    const themes = themesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'theme' }));
    const roles = rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'role' }));
    
    // For display, show some sample combinations
    const sampleClasses = [];
    if (themes.length > 0 && roles.length > 0) {
      // Generate a few sample combinations for the list
      for (let i = 0; i < Math.min(10, themes.length, roles.length); i++) {
        const theme = themes[i % themes.length];
        const role = roles[i % roles.length];
        sampleClasses.push({
          id: `sample_${theme.id}_${role.id}`,
          name: `${theme.name} ${role.name}`,
          description: `${role.description} with ${theme.name} powers`,
          rarity: theme.rarity || role.rarity || 'Common',
          type: 'generated_sample'
        });
      }
    }
    
    console.log(`� Database summary: ${themes.length} themes, ${roles.length} roles`);
    console.log(`🎲 Generated ${sampleClasses.length} sample combinations for display`);
    
    return sampleClasses;
  } catch (error) {
    console.error('🔴 Error fetching collection summary:', error);
    return [];
  }
}

/**
 * Get themes and roles separately for advanced features
 */
export async function getThemesAndRoles() {
  try {
    const [themesSnap, rolesSnap] = await Promise.all([
      getDocs(collection(db, THEMES_COLLECTION)),
      getDocs(collection(db, ROLES_COLLECTION))
    ]);
    
    const themes = themesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const roles = rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return { themes, roles };
  } catch (error) {
    console.error('🔴 Error fetching themes and roles:', error);
    return { themes: [], roles: [] };
  }
}

/**
 * Get rarity weights from metadata collection
 */
export async function getRarityWeights() {
  try {
    const configDoc = await getDoc(doc(db, METADATA_COLLECTION, 'config'));
    if (configDoc.exists()) {
      return configDoc.data().rarityWeights || {
        "Common": 45,
        "Uncommon": 25,
        "Rare": 14,
        "Epic": 8,
        "Legendary": 4,
        "Mythical": 2,
        "Celestial": 1.5,
        "Eternal": 0.5
      };
    }
    // Fallback weights if metadata doesn't exist
    return {
      "Common": 45,
      "Uncommon": 25,
      "Rare": 14,
      "Epic": 8,
      "Legendary": 4,
      "Mythical": 2,
      "Celestial": 1.5,
      "Eternal": 0.5
    };
  } catch (error) {
    console.error('🔴 Error getting rarity weights:', error);
    return { "Common": 100 }; // Safe fallback
  }
}

/**
 * Generate a random RPG class using your theme + role system with weighted rarities
 */
export async function getRandomClass() {
  try {
    console.log('🎲 Generating random class from your theme + role system...');
    
    // Get rarity weights from metadata
    const rarityWeights = await getRarityWeights();
    
    // Roll for rarity based on weights
    const selectedRarity = rollWeightedRarity(rarityWeights);
    console.log(`🎯 Rolled rarity: ${selectedRarity}`);
    
    // Get themes and roles with the selected rarity (or fallback to any rarity)
    const [themesSnap, rolesSnap] = await Promise.all([
      getDocs(query(collection(db, THEMES_COLLECTION), where('rarity', '==', selectedRarity))),
      getDocs(query(collection(db, ROLES_COLLECTION), where('rarity', '==', selectedRarity)))
    ]);
    
    // If no exact rarity match, get all themes/roles
    let themes, roles;
    if (themesSnap.empty) {
      console.log('🔄 No themes found for rarity, getting all themes...');
      const allThemesSnap = await getDocs(collection(db, THEMES_COLLECTION));
      themes = allThemesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      themes = themesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (rolesSnap.empty) {
      console.log('🔄 No roles found for rarity, getting all roles...');
      const allRolesSnap = await getDocs(collection(db, ROLES_COLLECTION));
      roles = allRolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      roles = rolesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    if (themes.length === 0 || roles.length === 0) {
      throw new Error('No themes or roles available in database');
    }
    
    // Pick random theme and role
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    // Generate class using your system: Theme + Role = Class
    const generatedClass = {
      id: `${randomTheme.id}_${randomRole.id}_${Date.now()}`,
      name: `${randomTheme.name} ${randomRole.name}`,
      description: `${randomRole.description} infused with ${randomTheme.name} essence. ${randomTheme.description}`,
      rarity: selectedRarity,
      theme: {
        name: randomTheme.name,
        rarity: randomTheme.rarity,
        description: randomTheme.description
      },
      role: {
        name: randomRole.name,
        rarity: randomRole.rarity,
        description: randomRole.description
      },
      generatedAt: new Date().toISOString()
    };
    
    console.log(`🎲 Generated: ${generatedClass.name} (${generatedClass.rarity})`);
    console.log(`🔮 Theme: ${randomTheme.name} | ⚔️ Role: ${randomRole.name}`);
    
    return generatedClass;
  } catch (error) {
    console.error('🔴 Error generating random class:', error);
    throw error;
  }
}

/**
 * Roll a weighted random rarity based on your metadata weights
 */
function rollWeightedRarity(weights) {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return rarity;
    }
  }
  
  // Fallback to Common if something goes wrong
  return 'Common';
}

/**
 * Get classes by rarity
 */
export async function getClassesByRarity(rarity) {
  try {
    console.log(`🔥 Fetching ${rarity} classes from Firebase...`);
    const classesSnap = await getDocs(
      query(
        collection(db, CLASSES_COLLECTION),
        where('rarity', '==', rarity),
        where('isActive', '==', true)
      )
    );
    
    const classes = classesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`🔥 Retrieved ${classes.length} ${rarity} classes`);
    return classes;
  } catch (error) {
    console.error(`🔴 Error fetching ${rarity} classes:`, error);
    return [];
  }
}

/**
 * Add a new RPG class to Firebase
 */
export async function addNewClass(classData) {
  try {
    console.log('🔥 Adding new class to Firebase:', classData.name);
    const docRef = await addDoc(collection(db, CLASSES_COLLECTION), {
      ...classData,
      createdAt: new Date(),
      isActive: true
    });
    
    console.log('🔥 Successfully added new class with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('🔴 Error adding new class:', error);
    return { success: false, error: error.message };
  }
}

// ==================== USER DATA MANAGEMENT ====================

/**
 * Save user's rolled class to their collection
 */
export async function saveUserRolledClass(userId, classData, rollResult) {
  try {
    console.log(`🔥 Saving rolled class for user ${userId}:`, classData.name);
    await addDoc(collection(db, USER_CLASSES_COLLECTION), {
      userId,
      classData,
      rollResult,
      rolledAt: new Date(),
      isFavorite: false
    });
    
    console.log('🔥 Successfully saved user rolled class');
    return { success: true };
  } catch (error) {
    console.error('🔴 Error saving user rolled class:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's rolled class history
 */
export async function getUserRolledClasses(userId, limitCount = 50) {
  try {
    console.log(`🔥 Fetching rolled classes for user ${userId}...`);
    const classesSnap = await getDocs(
      query(
        collection(db, USER_CLASSES_COLLECTION),
        where('userId', '==', userId),
        orderBy('rolledAt', 'desc'),
        limit(limitCount)
      )
    );
    
    const rolledClasses = classesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`🔥 Retrieved ${rolledClasses.length} rolled classes for user`);
    return rolledClasses;
  } catch (error) {
    console.error('🔴 Error fetching user rolled classes:', error);
    return [];
  }
}

/**
 * Save user preferences/theme
 */
export async function saveUserPreferences(userId, preferences) {
  try {
    console.log(`🔥 Saving preferences for user ${userId}`);
    await setDoc(doc(db, USERS_COLLECTION, userId), {
      preferences,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('🔥 Successfully saved user preferences');
    return { success: true };
  } catch (error) {
    console.error('🔴 Error saving user preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user preferences/theme
 */
export async function getUserPreferences(userId) {
  try {
    console.log(`🔥 Fetching preferences for user ${userId}`);
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('🔥 Retrieved user preferences');
      return userData.preferences || {};
    } else {
      console.log('🔥 No user preferences found, returning defaults');
      return {};
    }
  } catch (error) {
    console.error('🔴 Error fetching user preferences:', error);
    return {};
  }
}

// ==================== DATABASE UTILITIES ====================

/**
 * Check database connection and status
 */
export async function checkDatabaseStatus() {
  try {
    console.log('🔥 Checking database status...');
    const testDoc = await getDoc(doc(db, 'system', 'status'));
    
    // Try to get classes count
    const classesSnap = await getDocs(collection(db, CLASSES_COLLECTION));
    const classesCount = classesSnap.size;
    
    console.log('🔥 Database status: Connected');
    return {
      connected: true,
      classesCount,
      message: 'Database is connected and operational'
    };
  } catch (error) {
    console.error('🔴 Database status check failed:', error);
    return {
      connected: false,
      error: error.message,
      message: 'Database connection failed'
    };
  }
}

/**
 * DIAGNOSTIC: Test Firebase connection
 */
export async function testFirebaseConnection() {
  try {
    console.log('🔍 TESTING: Firebase connection...');
    
    // Test basic Firebase connection
    const testSnap = await getDocs(collection(db, 'metadata'));
    console.log('✅ Firebase connected! Metadata docs:', testSnap.size);
    
    if (testSnap.size > 0) {
      testSnap.docs.forEach((doc, index) => {
        console.log(`📄 Metadata doc ${index}:`, doc.id, doc.data());
      });
    }
    
    const rolesSnap = await getDocs(collection(db, 'roles'));
    console.log('✅ Roles collection docs:', rolesSnap.size);
    
    if (rolesSnap.size > 0) {
      const firstRole = rolesSnap.docs[0];
      console.log('📄 First role:', firstRole.id, firstRole.data());
    }
    
    const themesSnap = await getDocs(collection(db, 'themes'));
    console.log('✅ Themes collection docs:', themesSnap.size);
    
    if (themesSnap.size > 0) {
      const firstTheme = themesSnap.docs[0];
      console.log('📄 First theme:', firstTheme.id, firstTheme.data());
    }
    
    return { themes: themesSnap.size, roles: rolesSnap.size, metadata: testSnap.size };
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function getSampleClasses() {
  console.log('🔄 getSampleClasses called - testing Firebase first...');
  await testFirebaseConnection();
  return await getAllClasses();
}
