// src/services/authService.js - FIXED OTP functions to use apiService
import { apiService } from './api';
import { storageService } from './storageService';

class AuthService {
  async login(email, password) {
    try {
      const response = await apiService.auth.login({ email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store auth data
        await storageService.setItem('authToken', token);
        await storageService.setItem('userId', user.id.toString());
        await storageService.setItem('userProfile', user);
        
        return { success: true, data: { user, token } };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  }

  async register(userData) {
    try {
      const response = await apiService.auth.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store auth data
        await storageService.setItem('authToken', token);
        await storageService.setItem('userId', user.id.toString());
        await storageService.setItem('userProfile', user);
        
        return { success: true, data: { user, token } };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    }
  }

  // ✅ FIXED: WhatsApp OTP using apiService
  async sendWhatsAppOTP(phoneNumber) {
    try {
      console.log('📱 Sending WhatsApp OTP to:', phoneNumber);
      
      const response = await apiService.client.post('/api/auth/send-whatsapp-otp', {
        phoneNumber
      });
      
      console.log('✅ WhatsApp OTP response:', response);
      return response;
    } catch (error) {
      console.error('❌ WhatsApp OTP error:', error);
      throw error;
    }
  }

  // ✅ FIXED: SMS OTP using apiService
  async sendSMSOTP(phoneNumber) {
    try {
      console.log('📱 Sending SMS OTP to:', phoneNumber);
      
      const response = await apiService.client.post('/api/auth/send-sms-otp', {
        phoneNumber
      });
      
      console.log('✅ SMS OTP response:', response);
      return response;
    } catch (error) {
      console.error('❌ SMS OTP error:', error);
      throw error;
    }
  }

  // ✅ FIXED: OTP verification using apiService
  async verifyOTP(phoneNumber, otp, method = 'sms') {
    try {
      console.log('🔐 Verifying OTP:', { phoneNumber, otp: '***', method });
      
      const response = await apiService.client.post('/api/auth/verify-otp', {
        phoneNumber,
        otp,
        method
      });
      
      console.log('✅ OTP verification response:', response);
      return response;
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    }
    
    // Clear local storage
    await storageService.removeItem('authToken');
    await storageService.removeItem('userId');
    await storageService.removeItem('userProfile');
    
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const response = await apiService.auth.getMe();
      
      if (response.success) {
        await storageService.setItem('userProfile', response.data);
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Get current user error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to get user data' 
      };
    }
  }

  async isAuthenticated() {
    try {
      const token = await storageService.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async getStoredUser() {
    try {
      const user = await storageService.getItem('userProfile');
      return user;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiService.users.updateProfile(profileData);
      
      if (response.success) {
        // Update stored user profile
        const currentUser = await this.getStoredUser();
        const updatedUser = { ...currentUser, ...profileData };
        await storageService.setItem('userProfile', updatedUser);
        
        return { success: true, data: updatedUser };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update profile' 
      };
    }
  }
}

export const authService = new AuthService();

// ✅ Export individual OTP functions for easy import
export const sendSMSOTP = (phoneNumber) => authService.sendSMSOTP(phoneNumber);
export const sendWhatsAppOTP = (phoneNumber) => authService.sendWhatsAppOTP(phoneNumber);
export const verifyOTP = (phoneNumber, otp, method) => authService.verifyOTP(phoneNumber, otp, method);

export default authService;