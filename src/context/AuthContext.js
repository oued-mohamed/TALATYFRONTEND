import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

const AuthContext = createContext({});

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ Found stored auth data for:', user.email);
        
        // Verify token is still valid by calling /me endpoint
        try {
          const response = await apiService.auth.getMe();
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: response.data, token },
            });
            console.log('✅ Auth state restored successfully');
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.log('❌ Token validation failed, clearing auth data');
          await AsyncStorage.multiRemove(['token', 'user']);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        console.log('ℹ️ No stored auth data found');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('❌ Auth state check error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiService.auth.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        console.log('✅ Login successful for:', user.email);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        return { success: true };
      } else {
        const message = response.message || 'Login failed';
        console.log('❌ Login failed:', message);
        dispatch({
          type: 'SET_ERROR',
          payload: message,
        });
        return { success: false, message };
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      console.error('❌ Login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: message,
      });
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiService.auth.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        console.log('✅ Registration successful for:', user.email);
        
        // Store in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        return { success: true };
      } else {
        const message = response.message || 'Registration failed';
        console.log('❌ Registration failed:', message);
        dispatch({
          type: 'SET_ERROR',
          payload: message,
        });
        return { success: false, message };
      }
    } catch (error) {
      const message = error.message || 'Registration failed';
      console.error('❌ Registration error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: message,
      });
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out user:', state.user?.email);
      
      // Call logout endpoint (optional, for server-side cleanup)
      try {
        await apiService.auth.logout();
      } catch (error) {
        // Don't fail logout if server call fails
        console.log('⚠️ Server logout failed, continuing with local logout');
      }
      
      // Clear local storage
      await AsyncStorage.multiRemove(['token', 'user']);
      
      // Update state
      dispatch({ type: 'LOGOUT' });
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      dispatch({ type: 'LOGOUT' });
    }
  };

  // ✅ FIXED: Profile update function that works with your server
  const updateProfile = async (profileData) => {
    try {
      console.log('📝 Updating user profile with:', profileData);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // 1. Update on server first
      const response = await apiService.users.updateProfile(profileData);
      
      if (response.success) {
        // 2. Update local state only if server succeeds
        const updatedUser = { 
          ...state.user, 
          ...profileData,
          profileCompletion: 100 // Server sets this to 100
        };
        
        // 3. Save to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 4. Update state
        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser,
        });
        
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('✅ Profile updated successfully on server and locally');
        return { success: true };
      } else {
        console.error('❌ Server update failed:', response.message);
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({
          type: 'SET_ERROR',
          payload: response.message || 'Failed to update profile',
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update profile',
      });
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  };

  // ✅ NEW: Business info update function
  const updateBusinessInfo = async (businessData) => {
    try {
      console.log('🏢 Updating business info with:', businessData);
      
      // For now, store business data locally
      // In future, you can create /api/user/business endpoint
      const updatedUser = { 
        ...state.user, 
        businessInfo: businessData,
        businessCompletion: 100 
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch({
        type: 'UPDATE_USER',
        payload: { businessInfo: businessData, businessCompletion: 100 },
      });
      
      console.log('✅ Business info updated successfully locally');
      return { success: true };
    } catch (error) {
      console.error('❌ Update business info error:', error);
      return { success: false, message: error.message || 'Failed to update business info' };
    }
  };

  // ✅ FIXED: Refresh user data from server
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data from server...');
      const response = await apiService.auth.getMe();
      
      if (response.success) {
        const updatedUser = response.data;
        
        // Update AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update state
        dispatch({
          type: 'UPDATE_USER',
          payload: updatedUser,
        });
        
        console.log('✅ User data refreshed successfully');
        return { success: true, user: updatedUser };
      } else {
        console.error('❌ Failed to refresh user data:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('❌ Refresh user error:', error);
      return { success: false, message: error.message || 'Failed to refresh user data' };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,        // ✅ Main profile update function
    updateBusinessInfo,   // ✅ Business info update function
    refreshUser,          // ✅ Refresh user from server
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};