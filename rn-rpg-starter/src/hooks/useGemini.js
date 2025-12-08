import { useState, useCallback } from 'react';
import {
  generateRPGClass,
  generateMultipleRPGClasses,
  testBackendConnection,
  getBackendStatus,
  isBackendConfigured
} from '../services/gemini';

/**
 * Custom hook for secure backend AI class generation
 */
export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  // Check backend status on first use
  const initialize = useCallback(async () => {
    try {
      const status = await getBackendStatus();
      setBackendStatus(status);
      
      if (!status.configured) {
        setError('Backend not configured. Please set up your secure backend first.');
      } else if (status.status === 'Error') {
        setError(`Backend error: ${status.error}`);
      }
    } catch (err) {
      console.error('Error initializing backend connection:', err);
      setError('Failed to connect to backend');
    }
  }, []);

  // Generate a single class via secure backend
  const generateClass = useCallback(async (rarity = null) => {
    if (!backendStatus) {
      await initialize();
    }

    setLoading(true);
    setError(null);

    try {
      const generatedClass = await generateRPGClass(rarity);
      console.log('✅ Class generated successfully:', generatedClass.name);
      return generatedClass;
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate class';
      setError(errorMsg);
      console.error('❌ Error generating class:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [backendStatus, initialize]);

  // Generate multiple classes (for future use)
  const generateMultipleClasses = useCallback(async (count = 5, rarities = null) => {
    const classes = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      try {
        const rarity = rarities && rarities.length > 0 ? 
          rarities[Math.floor(Math.random() * rarities.length)] : null;
        
        const generatedClass = await generateClass(rarity);
        if (generatedClass) {
          classes.push(generatedClass);
        }
        
        // Add delay to avoid overwhelming the backend
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error generating class ${i + 1}:`, error);
        errors.push({ index: i, error: error.message });
      }
    }

    return {
      classes,
      errors,
      successCount: classes.length,
      totalRequested: count
    };
  }, [generateClass]);

  // Test backend connection
  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await testBackendConnection();
      
      if (result.success) {
        console.log('✅ Backend connection successful');
        setBackendStatus(prev => ({ ...prev, status: 'Connected' }));
      } else {
        setError(result.error);
        setBackendStatus(prev => ({ ...prev, status: 'Error', error: result.error }));
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Connection test failed';
      setError(errorMsg);
      console.error('❌ Connection test failed:', err);
      setBackendStatus(prev => ({ ...prev, status: 'Error', error: errorMsg }));
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh backend status
  const refreshStatus = useCallback(async () => {
    try {
      const status = await getBackendStatus();
      setBackendStatus(status);
      return status;
    } catch (err) {
      console.error('Error refreshing backend status:', err);
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    backendStatus,
    isConfigured: isBackendConfigured(),
    isConnected: backendStatus?.status === 'Connected',
    
    // Actions
    initialize,
    generateClass,
    generateMultipleClasses,
    testConnection,
    refreshStatus,
    clearError
  };
}