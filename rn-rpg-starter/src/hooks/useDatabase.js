import { useState, useEffect } from 'react';
import {
  getAllClasses,
  getRandomClass,
  getClassesByRarity,
  initializeClassesDatabase,
  saveUserRolledClass,
  getUserRolledClasses,
  checkDatabaseStatus
} from '../services/firestore';
import { useAuth } from './useAuth';

/**
 * Custom hook for database operations
 */
export function useDatabase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, classesCount: 0 });

  // Check database status on mount
  useEffect(() => {
    checkDbStatus();
  }, []);

  const checkDbStatus = async () => {
    try {
      const status = await checkDatabaseStatus();
      setDbStatus(status);
    } catch (err) {
      console.error('Database status check failed:', err);
      setDbStatus({ connected: false, error: err.message });
    }
  };

  const initializeDatabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await initializeClassesDatabase();
      if (result.success) {
        console.log('✅ Database initialized successfully');
        await checkDbStatus(); // Refresh status
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Failed to initialize database';
      setError(errorMsg);
      console.error('❌ Database initialization failed:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClasses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const classes = await getAllClasses();
      console.log(`✅ Fetched ${classes.length} classes from database`);
      return classes;
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch classes';
      setError(errorMsg);
      console.error('❌ Failed to fetch classes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const rollRandomClass = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const randomClass = await getRandomClass();
      console.log('🎲 Rolled random class:', randomClass.name);
      
      // Save to user's roll history if logged in
      if (user && user.uid) {
        await saveUserRolledClass(user.uid, randomClass, {
          timestamp: new Date(),
          method: 'random_roll'
        });
      }
      
      return randomClass;
    } catch (err) {
      const errorMsg = err.message || 'Failed to roll random class';
      setError(errorMsg);
      console.error('❌ Failed to roll random class:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesByRarity = async (rarity) => {
    setLoading(true);
    setError(null);
    
    try {
      const classes = await getClassesByRarity(rarity);
      console.log(`✅ Fetched ${classes.length} ${rarity} classes`);
      return classes;
    } catch (err) {
      const errorMsg = err.message || `Failed to fetch ${rarity} classes`;
      setError(errorMsg);
      console.error(`❌ Failed to fetch ${rarity} classes:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (limitCount = 50) => {
    if (!user || !user.uid) {
      console.log('⚠️ No user logged in, cannot fetch history');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const history = await getUserRolledClasses(user.uid, limitCount);
      console.log(`✅ Fetched ${history.length} roll history items`);
      return history;
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch user history';
      setError(errorMsg);
      console.error('❌ Failed to fetch user history:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    // State
    loading,
    error,
    dbStatus,
    
    // Actions
    initializeDatabase,
    fetchAllClasses,
    rollRandomClass,
    fetchClassesByRarity,
    fetchUserHistory,
    checkDbStatus,
    clearError
  };
}

/**
 * Hook for managing RPG classes state
 */
export function useRPGClasses() {
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const { 
    loading, 
    error, 
    fetchAllClasses, 
    rollRandomClass, 
    fetchUserHistory,
    clearError 
  } = useDatabase();

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const fetchedClasses = await fetchAllClasses();
    setClasses(fetchedClasses);
  };

  const handleRandomRoll = async () => {
    const rolledClass = await rollRandomClass();
    if (rolledClass) {
      setCurrentClass(rolledClass);
      // Refresh user history after rolling
      if (userHistory.length > 0) {
        await refreshUserHistory();
      }
    }
    return rolledClass;
  };

  const refreshUserHistory = async () => {
    const history = await fetchUserHistory();
    setUserHistory(history);
  };

  const loadUserHistory = async () => {
    const history = await fetchUserHistory();
    setUserHistory(history);
  };

  return {
    // State
    classes,
    currentClass,
    userHistory,
    loading,
    error,
    
    // Actions
    loadClasses,
    handleRandomRoll,
    loadUserHistory,
    refreshUserHistory,
    setCurrentClass,
    clearError
  };
}