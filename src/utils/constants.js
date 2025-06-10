export const CONSTANTS = {
  // App info
  APP_NAME: 'Business eKYC',
  VERSION: '1.0.0',
  
  // API
  API_TIMEOUT: 30000,
  
  // Storage keys
  STORAGE_KEYS: {
    USER: 'user',
    TOKEN: 'token',
    KYC_PROGRESS: 'kycProgress',
    APP_SETTINGS: 'appSettings',
  },
  
  // Document types
  DOCUMENT_TYPES: {
    NATIONAL_ID: 'national_id',
    PASSPORT: 'passport',
    DRIVING_LICENSE: 'driving_license',
    BUSINESS_REGISTRATION: 'business_registration',
    BANK_STATEMENT: 'bank_statement',
    SELFIE: 'selfie',
  },
  
  // KYC steps
  KYC_STEPS: {
    PROFILE_SETUP: 'profile_setup',
    DOCUMENT_UPLOAD: 'document_upload',
    IDENTITY_VERIFICATION: 'identity_verification',
    PHONE_VERIFICATION: 'phone_verification',
    FINAL_REVIEW: 'final_review',
  },
  
  // Phone number format
  PHONE_PREFIX: '+212',
  
  // File constraints
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  
  // Validation
  MIN_PASSWORD_LENGTH: 8,
  OTP_LENGTH: 6,
  OTP_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  
  // Business sectors
  BUSINESS_SECTORS: [
    'Technology',
    'Commerce',
    'Services',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Finance',
    'Real Estate',
    'Agriculture',
    'Construction',
    'Tourism',
    'Transport',
    'Other',
  ],
  
  // Moroccan banks
  MOROCCAN_BANKS: [
    'Attijariwafa Bank',
    'Banque Populaire',
    'BMCE Bank',
    'BMCI',
    'CIH Bank',
    'Crédit Agricole du Maroc',
    'Société Générale Maroc',
    'Bank of Africa',
    'CFG Bank',
    'Crédit du Maroc',
    'Al Barid Bank',
    'Bank Al-Maghrib',
    'Autre',
  ],
  
  // Error messages
  ERRORS: {
    NETWORK: 'Erreur de connexion réseau',
    UNAUTHORIZED: 'Session expirée, veuillez vous reconnecter',
    SERVER_ERROR: 'Erreur serveur, veuillez réessayer',
    FILE_TOO_LARGE: 'Fichier trop volumineux',
    INVALID_FILE_TYPE: 'Type de fichier non supporté',
    CAMERA_PERMISSION: 'Permission d\'accès à la caméra requise',
    STORAGE_PERMISSION: 'Permission d\'accès au stockage requise',
  },
  
  // Success messages
  SUCCESS: {
    LOGIN: 'Connexion réussie',
    REGISTER: 'Compte créé avec succès',
    PROFILE_UPDATED: 'Profil mis à jour',
    DOCUMENT_UPLOADED: 'Document téléchargé avec succès',
    PHONE_VERIFIED: 'Numéro de téléphone vérifié',
    KYC_COMPLETED: 'Vérification KYC terminée',
  },
};