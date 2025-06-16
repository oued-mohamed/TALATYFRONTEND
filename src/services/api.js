import axios from 'axios';
import { Platform } from 'react-native';
import { storageService } from './storageService';

// ✅ UNIVERSAL BASE URL CONFIGURATION - Works on ALL devices
const getBaseURL = () => {
  if (__DEV__) {
    // Development URLs for different platforms
    switch (Platform.OS) {
      case 'web':
        // Web browser (Expo web)
        return 'http://localhost:8082';
        
      case 'ios':
        // iOS Simulator
        return 'http://localhost:8082';
        
      case 'android':
        // Android Emulator
        return 'http://10.0.2.2:8082';
        
      default:
        // Fallback for any other platform
        return 'http://localhost:8082';
    }
  } else {
    // Production URL
    return 'https://your-api-gateway.com';
  }
};

// ✅ FOR PHYSICAL DEVICES: Uncomment and update this section
// If testing on physical devices, you need your computer's IP address
// const getBaseURL = () => {
//   if (__DEV__) {
//     // Replace 192.168.1.100 with your computer's actual IP address
//     // To find your IP: run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
//     const YOUR_COMPUTER_IP = '192.168.1.100'; // ⚠️ UPDATE THIS!
//     
//     switch (Platform.OS) {
//       case 'web':
//         return 'http://localhost:8080';
//       case 'ios':
//       case 'android':
//         return `http://${YOUR_COMPUTER_IP}:8080`;
//       default:
//         return 'http://localhost:8080';
//     }
//   } else {
//     return 'https://your-api-gateway.com';
//   }
// };

const API_BASE_URL = getBaseURL();

// ✅ Debug logging to see which URL is being used
console.log('🌐 API Configuration:');
console.log('   Platform:', Platform.OS);
console.log('   Environment:', __DEV__ ? 'Development' : 'Production');
console.log('   Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Enhanced request interceptor with better debugging
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getItem('token');
      const userStr = await storageService.getItem('user');
      
      let userId = null;
      if (userStr) {
        try {
          const user = typeof userStr === 'string' ? JSON.parse(userStr) : userStr;
          userId = user.id;
        } catch (parseError) {
          console.error('❌ Error parsing user data:', parseError);
          await storageService.removeItem('user');
        }
      }
      
      // ✅ Enhanced debug logging
      console.log('🔑 API Request Details:');
      console.log('   URL:', config.baseURL + config.url);
      console.log('   Method:', config.method?.toUpperCase());
      console.log('   Has Token:', !!token);
      console.log('   User ID:', userId);
      if (config.data) {
        console.log('   Data:', config.data);
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (userId) {
        config.headers['x-user-id'] = userId;
      }
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  async (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle unauthorized
    if (error.response?.status === 401) {
      await storageService.removeItem('token');
      await storageService.removeItem('user');
    }
    
    // Return structured error
    return Promise.reject({
      success: false,
      message: error.response?.data?.message || error.message || 'Network error',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// ✅ Auth endpoints with enhanced logging
const authAPI = {
  login: (email, password) => {
    const credentials = typeof email === 'object' ? email : { email, password };
    console.log('🔐 Login attempt for:', credentials.email);
    return apiClient.post('/api/auth/login', credentials);
  },
  register: (userData) => {
    console.log('📝 Registration attempt for:', userData.email);
    return apiClient.post('/api/auth/register', userData);
  },
  logout: () => {
    console.log('👋 Logout request');
    return apiClient.post('/api/auth/logout');
  },
  getMe: () => {
    console.log('👤 Get current user request');
    return apiClient.get('/api/auth/me');
  },
  refreshToken: () => apiClient.post('/api/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/api/auth/reset-password', { token, password }),
  verifyEmail: (token) => apiClient.post('/api/auth/verify-email', { token }),
};

// ✅ User endpoints with enhanced logging
const userAPI = {
  getProfile: () => {
    console.log('👤 Get profile request');
    return apiClient.get('/api/auth/me');
  },
  updateProfile: (data) => {
    console.log('📝 Update profile request with data:', data);
    return apiClient.put('/api/user/profile', data);
  },
  updatePassword: (passwords) => apiClient.put('/api/users/password', passwords),
  deleteAccount: () => apiClient.delete('/api/users/account'),
  getSettings: () => apiClient.get('/api/users/settings'),
  updateSettings: (settings) => apiClient.put('/api/users/settings', settings),
};

// ✅ Document endpoints - Mock implementation with logging
const documentsAPI = {
  upload: (formData, onProgress) => {
    console.log('📄 Document upload started');
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          console.log('✅ Document upload completed');
          resolve({
            success: true,
            data: {
              document: {
                _id: `doc_${Date.now()}`,
                type: formData.get ? formData.get('type') : 'unknown',
                filename: `document_${Date.now()}.jpg`,
                uploadedAt: new Date(),
                status: 'uploaded',
                verificationStatus: 'pending'
              }
            }
          });
        }
      }, 200);
    });
  },
  
  getAll: (params = {}) => {
    console.log('📄 Get all documents request');
    return Promise.resolve({
      success: true,
      data: { documents: [] }
    });
  },
  
  getById: (id) => {
    console.log('📄 Get document by ID:', id);
    return Promise.resolve({
      success: true,
      data: {
        document: {
          _id: id,
          type: 'business_registration',
          filename: 'document.pdf',
          status: 'uploaded'
        }
      }
    });
  },
  
  updateStatus: (id, status, notes) => {
    console.log('📄 Update document status:', { id, status, notes });
    return Promise.resolve({
      success: true,
      message: 'Document status updated'
    });
  },
  
  delete: (id) => {
    console.log('📄 Delete document:', id);
    return Promise.resolve({
      success: true,
      message: 'Document deleted'
    });
  },
  
  download: (id) => {
    console.log('📄 Download document:', id);
    return Promise.resolve({
      success: true,
      data: 'mock-file-data'
    });
  },
  
  getStats: () => {
    console.log('📄 Get document stats');
    return Promise.resolve({
      success: true,
      data: {
        total: 0,
        byStatus: [],
        byType: []
      }
    });
  },
};

// ✅ KYC endpoints with enhanced logging
const kycAPI = {
  start: (data = {}) => {
    console.log('🔍 KYC start request with data:', data);
    return apiClient.post('/api/kyc/start', data);
  },
  getStatus: () => {
    console.log('🔍 KYC status request');
    return apiClient.get('/api/kyc/status');
  },
  
  completeStep: (step, data) => {
    console.log('🔍 KYC complete step:', { step, data });
    return Promise.resolve({
      success: true,
      data: {
        step,
        completedAt: new Date(),
        nextStep: getNextStep(step)
      }
    });
  },
  
  verifyIdentity: (idDocumentId, selfieId) => {
    console.log('🔍 KYC verify identity:', { idDocumentId, selfieId });
    return Promise.resolve({
      success: true,
      data: {
        verified: true,
        confidence: 95,
        faceMatchScore: 0.95
      }
    });
  },
  
  sendPhoneCode: (phoneNumber) => {
    console.log('📱 Send phone code to:', phoneNumber);
    return apiClient.post('/api/kyc/send-phone-code', { phoneNumber });
  },
  verifyPhone: (code) => {
    console.log('📱 Verify phone code:', code);
    return apiClient.post('/api/kyc/verify-phone', { code });
  },
  
  calculateScore: () => {
    console.log('🔍 Calculate KYC score');
    return Promise.resolve({
      success: true,
      data: {
        riskAssessment: {
          score: 85,
          level: 'medium',
          recommendation: 'approved'
        }
      }
    });
  },
};

// Helper function for KYC steps
function getNextStep(currentStep) {
  const stepOrder = [
    'profile_setup',
    'document_upload',
    'identity_verification', 
    'phone_verification',
    'final_review'
  ];
  
  const currentIndex = stepOrder.indexOf(currentStep);
  return currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : 'completed';
}

// ✅ Scoring endpoints with logging
const scoringAPI = {
  getApplications: () => {
    console.log('💰 Get applications request');
    return Promise.resolve({ success: true, data: [] });
  },
  createApplication: (data) => {
    console.log('💰 Create application:', data);
    return Promise.resolve({ success: true, data });
  },
  getApplicationById: (id) => {
    console.log('💰 Get application by ID:', id);
    return Promise.resolve({ success: true, data: { id } });
  },
  updateApplication: (id, data) => {
    console.log('💰 Update application:', { id, data });
    return Promise.resolve({ success: true, data });
  },
  calculateScore: (applicationId) => {
    console.log('💰 Calculate score for application:', applicationId);
    return Promise.resolve({ success: true, data: { score: 85 } });
  },
  connectBank: (bankData) => {
    console.log('🏦 Connect bank:', bankData);
    return Promise.resolve({ success: true, data: bankData });
  },
  getFinancialAnalysis: (applicationId) => {
    console.log('💰 Get financial analysis for:', applicationId);
    return Promise.resolve({ success: true, data: {} });
  },
};

// ✅ Notification endpoints with logging
const notificationAPI = {
  getAll: (params = {}) => {
    console.log('🔔 Get all notifications:', params);
    return Promise.resolve({ success: true, data: [] });
  },
  markAsRead: (id) => {
    console.log('🔔 Mark notification as read:', id);
    return Promise.resolve({ success: true });
  },
  markAllAsRead: () => {
    console.log('🔔 Mark all notifications as read');
    return Promise.resolve({ success: true });
  },
  delete: (id) => {
    console.log('🔔 Delete notification:', id);
    return Promise.resolve({ success: true });
  },
  getUnreadCount: () => {
    console.log('🔔 Get unread count');
    return Promise.resolve({ success: true, data: { count: 0 } });
  },
  updatePreferences: (preferences) => {
    console.log('🔔 Update notification preferences:', preferences);
    return Promise.resolve({ success: true, data: preferences });
  },
};

// ✅ File upload helper with validation
const uploadHelper = {
  createFormData: (documentType, fileData, additionalData = {}) => {
    const formData = new FormData();
    
    formData.append('document', {
      uri: fileData.uri,
      type: fileData.type || 'image/jpeg',
      name: fileData.fileName || `${documentType}_${Date.now()}.jpg`,
    });
    
    formData.append('type', documentType);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    return formData;
  },
  
  validateFile: (fileData, maxSize = 10 * 1024 * 1024) => {
    const errors = [];
    
    if (!fileData.uri) {
      errors.push('File URI is required');
    }
    
    if (fileData.fileSize && fileData.fileSize > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (fileData.type && !allowedTypes.includes(fileData.type)) {
      errors.push('File type not supported. Please use JPEG, PNG, or PDF');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ✅ Enhanced error handling helper
const errorHandler = {
  handleApiError: (error) => {
    console.error('❌ API Error Details:', error);
    
    if (!error.response) {
      return {
        success: false,
        message: 'Network error. Please check your connection and ensure the API server is running.',
        type: 'network'
      };
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          success: false,
          message: data?.message || 'Invalid request',
          type: 'validation',
          errors: data?.errors
        };
      case 401:
        return {
          success: false,
          message: 'Authentication required. Please log in again.',
          type: 'auth'
        };
      case 403:
        return {
          success: false,
          message: 'Access denied',
          type: 'permission'
        };
      case 404:
        return {
          success: false,
          message: 'Resource not found',
          type: 'notfound'
        };
      case 413:
        return {
          success: false,
          message: 'File too large',
          type: 'filesize'
        };
      case 429:
        return {
          success: false,
          message: 'Too many requests. Please try again later.',
          type: 'ratelimit'
        };
      case 500:
        return {
          success: false,
          message: 'Server error. Please try again later.',
          type: 'server'
        };
      default:
        return {
          success: false,
          message: data?.message || 'An unexpected error occurred',
          type: 'unknown'
        };
    }
  }
};

// ✅ Main API service object with comprehensive logging
export const apiService = {
  // Core APIs
  auth: authAPI,
  users: userAPI,
  documents: documentsAPI,
  kyc: kycAPI,
  scoring: scoringAPI,
  notifications: notificationAPI,
  
  // Helpers
  upload: uploadHelper,
  error: errorHandler,
  
  // Direct axios client for custom requests
  client: apiClient,
  
  // ✅ Enhanced health check with detailed logging
  healthCheck: () => {
    console.log('🏥 Health check request to:', API_BASE_URL + '/health');
    return apiClient.get('/health');
  },
  
  // ✅ Configuration utilities
  setBaseURL: (url) => {
    console.log('🔧 Setting base URL to:', url);
    apiClient.defaults.baseURL = url;
  },
  
  setTimeout: (timeout) => {
    console.log('⏱️ Setting timeout to:', timeout);
    apiClient.defaults.timeout = timeout;
  },

  // ✅ Get current configuration
  getConfig: () => {
    return {
      baseURL: API_BASE_URL,
      platform: Platform.OS,
      isDev: __DEV__,
      timeout: apiClient.defaults.timeout
    };
  }
};

export default apiService;