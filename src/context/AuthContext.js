// src/context/AuthContext.js - FIXED VERSION
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
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        console.log('✅ Auth state restored successfully');
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
      
      try {
        await apiService.auth.logout();
      } catch (error) {
        console.log('⚠️ Server logout failed, continuing with local logout');
      }
      
      await AsyncStorage.multiRemove(['token', 'user']);
      dispatch({ type: 'LOGOUT' });
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // ✅ FIXED: Enhanced updateProfile with better error handling and fallback
  const updateProfile = async (profileData) => {
    console.log('🚨🚨🚨 UPDATE PROFILE CALLED 🚨🚨🚨');
    console.log('📤 Profile data to update:', JSON.stringify(profileData, null, 2));
    console.log('👤 Current user:', state.user);
    console.log('🔧 API service available:', !!apiService);
    console.log('🔧 Users API available:', !!apiService.users);
    console.log('🔧 UpdateProfile API available:', !!apiService.users?.updateProfile);
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Check if backend is available first
      console.log('🏥 Testing backend connectivity...');
      let backendAvailable = false;
      
      try {
        await apiService.healthCheck();
        backendAvailable = true;
        console.log('✅ Backend is available');
      } catch (healthError) {
        console.log('⚠️ Backend health check failed:', healthError.message);
        console.log('📱 Proceeding with local-only update');
      }
      
      if (backendAvailable) {
        // Try to update on server
        console.log('🌐 Attempting server update...');
        
        try {
          const response = await apiService.users.updateProfile(profileData);
          console.log('📥 Server response:', response);
          
          if (response && response.success) {
            console.log('✅ Server update successful');
            
            const updatedUser = { 
              ...state.user, 
              ...profileData,
              profileCompletion: 100,
              lastServerSync: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            dispatch({
              type: 'UPDATE_USER',
              payload: updatedUser,
            });
            
            dispatch({ type: 'SET_LOADING', payload: false });
            console.log('✅ Profile updated successfully on server and locally');
            return { success: true, synced: true };
          } else {
            throw new Error(response?.message || 'Server update failed');
          }
        } catch (serverError) {
          console.log('⚠️ Server update failed:', serverError.message);
          // Don't fall back to local-only, let it continue to local update below
        }
      }
      
      // Fallback: Update locally (always works)
      console.log('💾 Updating profile locally...');
      const updatedUser = { 
        ...state.user, 
        ...profileData,
        profileCompletion: 100,
        lastLocalUpdate: new Date().toISOString(),
        needsServerSync: !backendAvailable
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('✅ Profile updated locally');
      return { 
        success: true, 
        synced: backendAvailable,
        message: backendAvailable ? 'Profile updated on server' : 'Profile saved locally (will sync when server is available)'
      };
      
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

  const updateBusinessInfo = async (businessData) => {
    try {
      console.log('🏢 Updating business info with:', businessData);
      
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

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data from server...');
      const response = await apiService.auth.getMe();
      
      if (response.success) {
        const updatedUser = response.data;
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
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
    updateProfile,        // ✅ Make sure this is included
    updateBusinessInfo,   
    refreshUser,          
    clearError,
  };

  console.log('🔧 AuthProvider value object:', Object.keys(value));
  console.log('🔧 updateProfile function type:', typeof value.updateProfile);

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