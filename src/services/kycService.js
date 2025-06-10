import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext'; // Import useAuth

// Initial state
const initialState = {
  kycData: null,
  isLoading: false,
  error: null,
  currentStep: 'profile_setup',
  completedSteps: [],
  documents: {},
  uploadProgress: {},
  phoneVerification: {
    phoneNumber: '',
    isVerified: false,
    codeSent: false,
  },
  identityVerification: {
    isVerified: false,
    faceMatchScore: null,
    nfcVerified: false,
  },
  riskAssessment: null,
};

// Action types
const KYC_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_KYC_DATA: 'SET_KYC_DATA',
  UPDATE_STEP: 'UPDATE_STEP',
  COMPLETE_STEP: 'COMPLETE_STEP',
  SET_DOCUMENT: 'SET_DOCUMENT',
  UPDATE_UPLOAD_PROGRESS: 'UPDATE_UPLOAD_PROGRESS',
  SET_PHONE_VERIFICATION: 'SET_PHONE_VERIFICATION',
  SET_IDENTITY_VERIFICATION: 'SET_IDENTITY_VERIFICATION',
  SET_RISK_ASSESSMENT: 'SET_RISK_ASSESSMENT',
  RESET_KYC: 'RESET_KYC',
};

// Reducer
const kycReducer = (state, action) => {
  switch (action.type) {
    case KYC_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };

    case KYC_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case KYC_ACTIONS.SET_KYC_DATA:
      return {
        ...state,
        kycData: action.payload,
        currentStep: action.payload?.currentStep || state.currentStep,
        completedSteps: action.payload?.completedSteps || state.completedSteps,
        isLoading: false,
        error: null,
      };

    case KYC_ACTIONS.UPDATE_STEP:
      return {
        ...state,
        currentStep: action.payload,
      };

    case KYC_ACTIONS.COMPLETE_STEP:
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.payload])],
        currentStep: getNextStep(action.payload),
      };

    case KYC_ACTIONS.SET_DOCUMENT:
      return {
        ...state,
        documents: {
          ...state.documents,
          [action.payload.type]: action.payload.document,
        },
      };

    case KYC_ACTIONS.UPDATE_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          [action.payload.type]: action.payload.progress,
        },
      };

    case KYC_ACTIONS.SET_PHONE_VERIFICATION:
      return {
        ...state,
        phoneVerification: {
          ...state.phoneVerification,
          ...action.payload,
        },
      };

    case KYC_ACTIONS.SET_IDENTITY_VERIFICATION:
      return {
        ...state,
        identityVerification: {
          ...state.identityVerification,
          ...action.payload,
        },
      };

    case KYC_ACTIONS.SET_RISK_ASSESSMENT:
      return {
        ...state,
        riskAssessment: action.payload,
      };

    case KYC_ACTIONS.RESET_KYC:
      return initialState;

    default:
      return state;
  }
};

// Helper function to get next step
const getNextStep = (completedStep) => {
  const stepOrder = [
    'profile_setup',
    'document_upload',
    'identity_verification',
    'phone_verification',
    'final_review'
  ];
  
  const currentIndex = stepOrder.indexOf(completedStep);
  const nextIndex = currentIndex + 1;
  
  return nextIndex < stepOrder.length ? stepOrder[nextIndex] : 'completed';
};

// Create context
const KYCContext = createContext();

// KYC Provider component
export const KYCProvider = ({ children }) => {
  const [state, dispatch] = useReducer(kycReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Get auth status

  // Load KYC data only when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('🔐 User is authenticated, loading KYC data...');
      loadKYCData();
    } else if (!authLoading) {
      console.log('ℹ️ User not authenticated, skipping KYC data load');
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: false });
    }
  }, [isAuthenticated, authLoading]); // Run when auth status changes

  // Load KYC data from storage and API
  const loadKYCData = async () => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      // Try to load from local storage first
      const cachedData = await storageService.getItem('kycData');
      if (cachedData) {
        dispatch({ type: KYC_ACTIONS.SET_KYC_DATA, payload: cachedData });
      }

      // Test connection first
      try {
        await apiService.healthCheck();
        console.log('✅ Backend connection successful');
      } catch (connectionError) {
        console.error('❌ Backend connection failed:', connectionError);
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: 'Backend server is not running' });
        return;
      }

      // Then fetch from API
      const response = await apiService.kyc.getStatus();
      if (response.success) {
        // Your server returns data directly, not wrapped in kycVerification
        const kycData = response.data;
        dispatch({ type: KYC_ACTIONS.SET_KYC_DATA, payload: kycData });
        
        // Cache the data
        await storageService.setItem('kycData', kycData);
        console.log('✅ KYC data loaded successfully');
      }
    } catch (error) {
      console.error('Load KYC data error:', error);
      // Don't show error for 401 when user isn't authenticated
      if (error.status === 401) {
        console.log('ℹ️ User not authenticated for KYC data');
        dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: false });
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      }
    }
  };

  // Start KYC process
  const startKYC = async (initialData = {}) => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.kyc.start({
        ipAddress: initialData.ipAddress,
        userAgent: initialData.userAgent,
        geolocation: initialData.geolocation,
      });

      if (response.success) {
        const kycData = response.data;
        dispatch({ type: KYC_ACTIONS.SET_KYC_DATA, payload: kycData });
        
        // Cache the data
        await storageService.setItem('kycData', kycData);

        return { success: true, data: kycData };
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Start KYC error:', error);
      dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Upload document
  const uploadDocument = async (documentType, fileData, onProgress) => {
    try {
      dispatch({ type: KYC_ACTIONS.UPDATE_UPLOAD_PROGRESS, payload: { type: documentType, progress: 0 } });

      // Validate file
      const validation = apiService.upload.validateFile(fileData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Create form data
      const formData = apiService.upload.createFormData(documentType, fileData);

      // Upload document
      const response = await apiService.documents.upload(formData, (progress) => {
        dispatch({ type: KYC_ACTIONS.UPDATE_UPLOAD_PROGRESS, payload: { type: documentType, progress } });
        if (onProgress) onProgress(progress);
      });

      if (response.success) {
        const document = response.data.document;
        dispatch({ type: KYC_ACTIONS.SET_DOCUMENT, payload: { type: documentType, document } });
        
        // Update cached documents
        const cachedDocs = await storageService.getItem('uploadedDocuments') || {};
        cachedDocs[documentType] = document;
        await storageService.setItem('uploadedDocuments', cachedDocs);

        return { success: true, data: document };
      } else {
        dispatch({ type: KYC_ACTIONS.UPDATE_UPLOAD_PROGRESS, payload: { type: documentType, progress: 0 } });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Upload document error:', error);
      dispatch({ type: KYC_ACTIONS.UPDATE_UPLOAD_PROGRESS, payload: { type: documentType, progress: 0 } });
      return { success: false, message: error.message };
    }
  };

  // Complete KYC step
  const completeStep = async (step, data = {}) => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.kyc.completeStep(step, data);

      if (response.success) {
        dispatch({ type: KYC_ACTIONS.COMPLETE_STEP, payload: step });
        
        // Update cached data
        const updatedKycData = response.data.kycVerification;
        dispatch({ type: KYC_ACTIONS.SET_KYC_DATA, payload: updatedKycData });
        await storageService.setItem('kycData', updatedKycData);

        return { success: true, data: updatedKycData };
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Complete step error:', error);
      dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Verify identity documents
  const verifyIdentity = async (idDocumentId, selfieId) => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.kyc.verifyIdentity(idDocumentId, selfieId);

      if (response.success) {
        const verificationData = response.data;
        dispatch({ 
          type: KYC_ACTIONS.SET_IDENTITY_VERIFICATION, 
          payload: {
            isVerified: true,
            faceMatchScore: verificationData.faceMatchScore,
            nfcVerified: verificationData.nfcVerified,
            extractedInfo: verificationData.extractedInfo,
          }
        });

        return { success: true, data: verificationData };
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Verify identity error:', error);
      dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Send phone verification code
  const sendPhoneVerificationCode = async (phoneNumber) => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.kyc.sendPhoneCode(phoneNumber);

      if (response.success) {
        dispatch({ 
          type: KYC_ACTIONS.SET_PHONE_VERIFICATION, 
          payload: {
            phoneNumber,
            codeSent: true,
            isVerified: false,
          }
        });

        return { success: true };
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Send phone code error:', error);
      dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Verify phone number
  const verifyPhoneNumber = async (code) => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.kyc.verifyPhone(code);

      if (response.success) {
        dispatch({ 
          type: KYC_ACTIONS.SET_PHONE_VERIFICATION, 
          payload: {
            isVerified: true,
          }
        });

        // Complete phone verification step
        dispatch({ type: KYC_ACTIONS.COMPLETE_STEP, payload: 'phone_verification' });

        return { success: true };
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Verify phone error:', error);
      dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Calculate KYC score
  const calculateKYCScore = async () => {
    try {
      dispatch({ type: KYC_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.kyc.calculateScore();

      if (response.success) {
        const riskAssessment = response.data.riskAssessment;
        dispatch({ type: KYC_ACTIONS.SET_RISK_ASSESSMENT, payload: riskAssessment });

        return { success: true, data: riskAssessment };
      } else {
        dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Calculate KYC score error:', error);
      dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Get documents
  const getDocuments = async (type = null) => {
    try {
      const response = await apiService.documents.getAll(type ? { type } : {});

      if (response.success) {
        return { success: true, data: response.data.documents };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Get documents error:', error);
      return { success: false, message: error.message };
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    try {
      const response = await apiService.documents.delete(documentId);

      if (response.success) {
        // Update local state to remove the document
        // This would need to be implemented based on your state structure
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Delete document error:', error);
      return { success: false, message: error.message };
    }
  };

  // Reset KYC data
  const resetKYC = async () => {
    dispatch({ type: KYC_ACTIONS.RESET_KYC });
    await storageService.removeItem('kycData');
    await storageService.removeItem('uploadedDocuments');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: KYC_ACTIONS.SET_ERROR, payload: null });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    startKYC,
    uploadDocument,
    completeStep,
    verifyIdentity,
    sendPhoneVerificationCode,
    verifyPhoneNumber,
    calculateKYCScore,
    getDocuments,
    deleteDocument,
    resetKYC,
    clearError,
    loadKYCData,
  };

  return (
    <KYCContext.Provider value={value}>
      {children}
    </KYCContext.Provider>
  );
};

// Custom hook to use KYC context
export const useKYC = () => {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};

export default KYCContext;