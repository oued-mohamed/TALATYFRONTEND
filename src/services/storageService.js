import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Store data
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`✅ Storage set: ${key}`);
    } catch (error) {
      console.error(`❌ Error storing data for key ${key}:`, error);
      throw error;
    }
  }

  // Get data with improved error handling
  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      
      if (jsonValue === null) {
        console.log(`ℹ️ Storage get: ${key} - not found`);
        return null;
      }

      // Special handling for JWT tokens - they're plain strings, not JSON
      if (key === 'token' && typeof jsonValue === 'string' && jsonValue.startsWith('eyJ')) {
        console.log(`✅ Storage get: ${key} - JWT token retrieved`);
        return jsonValue;
      }

      // Try to parse as JSON for other data
      try {
        const parsed = JSON.parse(jsonValue);
        console.log(`✅ Storage get: ${key} - parsed successfully`);
        return parsed;
      } catch (parseError) {
        // Only log parse errors for non-token keys to reduce noise
        if (key !== 'token') {
          console.error(`❌ JSON parse error for key ${key}:`, parseError);
          console.log(`🔧 Raw value that failed to parse:`, jsonValue);
        }
        
        // If it's a token and looks like a JWT, return it as-is
        if (key === 'token' && typeof jsonValue === 'string' && jsonValue.length > 0) {
          console.log(`✅ Storage get: ${key} - returned as plain string`);
          return jsonValue;
        }
        
        // For other corrupted data, clear it and return null
        if (key !== 'token') {
          console.log(`🧹 Clearing corrupted data for key: ${key}`);
          await this.removeItem(key);
        }
        return null;
      }
    } catch (error) {
      console.error(`❌ Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  // Remove data
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Storage removed: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  // Remove multiple items
  async removeItems(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
      console.log(`🗑️ Storage removed multiple keys:`, keys);
    } catch (error) {
      console.error('❌ Error removing multiple items:', error);
      throw error;
    }
  }

  // Clear all data
  async clear() {
    try {
      await AsyncStorage.clear();
      console.log('🧹 Storage cleared completely');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      throw error;
    }
  }

  // Get all keys
  async getAllKeys() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error('❌ Error getting all keys:', error);
      return [];
    }
  }

  // Store user session data with better error handling
  async setUserSession(user, token) {
    try {
      // Store each item individually with validation
      await this.setItem('user', user);
      await this.setItem('token', token);
      await this.setItem('lastLoginTime', new Date().toISOString());
      console.log('✅ User session stored successfully');
    } catch (error) {
      console.error('❌ Error storing user session:', error);
      throw error;
    }
  }

  // Get user session data with improved parsing
  async getUserSession() {
    try {
      const user = await this.getItem('user');
      const token = await this.getItem('token');
      const lastLoginTime = await this.getItem('lastLoginTime');
      
      console.log('📱 User session retrieved:', { 
        hasUser: !!user, 
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        lastLoginTime 
      });
      
      return {
        user,
        token,
        lastLoginTime,
      };
    } catch (error) {
      console.error('❌ Error getting user session:', error);
      return { user: null, token: null, lastLoginTime: null };
    }
  }

  // Store KYC progress
  async setKYCProgress(progress) {
    try {
      await this.setItem('kycProgress', progress);
    } catch (error) {
      console.error('❌ Error storing KYC progress:', error);
      throw error;
    }
  }

  // Get KYC progress
  async getKYCProgress() {
    try {
      return await this.getItem('kycProgress');
    } catch (error) {
      console.error('❌ Error getting KYC progress:', error);
      return null;
    }
  }

  // Store app settings
  async setAppSettings(settings) {
    try {
      await this.setItem('appSettings', settings);
    } catch (error) {
      console.error('❌ Error storing app settings:', error);
      throw error;
    }
  }

  // Get app settings
  async getAppSettings() {
    try {
      const defaultSettings = {
        notifications: true,
        biometricAuth: false,
        language: 'fr',
        theme: 'light',
      };
      
      const settings = await this.getItem('appSettings');
      return { ...defaultSettings, ...settings };
    } catch (error) {
      console.error('❌ Error getting app settings:', error);
      return {
        notifications: true,
        biometricAuth: false,
        language: 'fr',
        theme: 'light',
      };
    }
  }

  // Debug method to inspect storage contents
  async debugStorage() {
    try {
      const keys = await this.getAllKeys();
      console.log('🔍 Storage debug - All keys:', keys);
      
      for (const key of keys) {
        const rawValue = await AsyncStorage.getItem(key);
        console.log(`🔍 Storage debug - ${key}:`, rawValue ? rawValue.substring(0, 100) + '...' : null);
      }
    } catch (error) {
      console.error('❌ Storage debug error:', error);
    }
  }

  // Clean corrupted data
  async cleanCorruptedData() {
    try {
      const keys = await this.getAllKeys();
      const corruptedKeys = [];
      
      for (const key of keys) {
        try {
          await this.getItem(key); // This will clean corrupted data automatically
        } catch (error) {
          corruptedKeys.push(key);
        }
      }
      
      if (corruptedKeys.length > 0) {
        console.log('🧹 Cleaned corrupted keys:', corruptedKeys);
      } else {
        console.log('✅ No corrupted data found');
      }
    } catch (error) {
      console.error('❌ Error cleaning corrupted data:', error);
    }
  }
}

export const storageService = new StorageService();