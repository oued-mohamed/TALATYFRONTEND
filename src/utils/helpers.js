import { Alert, Linking, Platform } from 'react-native';
import { CONSTANTS } from './constants';

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  if (phone.startsWith('+212')) {
    const number = phone.substring(4);
    return `+212 ${number.charAt(0)} ${number.substring(1, 3)} ${number.substring(3, 5)} ${number.substring(5, 7)} ${number.substring(7, 9)}`;
  }
  return phone;
};

// Format RIB for display
export const formatRIB = (rib) => {
  if (!rib) return '';
  
  // Remove existing formatting
  const cleanRib = rib.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXXXXXXXXXXXXXX-XX
  if (cleanRib.length === 24) {
    return `${cleanRib.substring(0, 3)}-${cleanRib.substring(3, 6)}-${cleanRib.substring(6, 22)}-${cleanRib.substring(22, 24)}`;
  }
  
  return rib;
};

// Format currency (Moroccan Dirham)
export const formatCurrency = (amount, currency = 'MAD') => {
  if (typeof amount !== 'number') return '0 MAD';
  
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('fr-MA', { ...defaultOptions, ...options })
    .format(new Date(date));
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('fr-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file size
export const isValidFileSize = (fileSize, maxSize = CONSTANTS.MAX_FILE_SIZE) => {
  return fileSize <= maxSize;
};

// Validate file type
export const isValidFileType = (fileType, allowedTypes = CONSTANTS.ALLOWED_IMAGE_TYPES) => {
  return allowedTypes.includes(fileType.toLowerCase());
};

// Generate random string
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Show alert with options
export const showAlert = (title, message, buttons = []) => {
  const defaultButtons = [{ text: 'OK', style: 'default' }];
  Alert.alert(title, message, buttons.length > 0 ? buttons : defaultButtons);
};

// Show confirmation dialog
export const showConfirmDialog = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Annuler', style: 'cancel', onPress: onCancel },
      { text: 'Confirmer', style: 'destructive', onPress: onConfirm },
    ]
  );
};

// Open URL in browser
export const openURL = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      showAlert('Erreur', 'Impossible d\'ouvrir le lien');
    }
  } catch (error) {
    showAlert('Erreur', 'Impossible d\'ouvrir le lien');
  }
};

// Make phone call
export const makePhoneCall = async (phoneNumber) => {
  try {
    const url = `tel:${phoneNumber}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      showAlert('Erreur', 'Impossible de passer l\'appel');
    }
  } catch (error) {
    showAlert('Erreur', 'Impossible de passer l\'appel');
  }
};

// Send email
export const sendEmail = async (email, subject = '', body = '') => {
  try {
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      showAlert('Erreur', 'Impossible d\'envoyer l\'email');
    }
  } catch (error) {
    showAlert('Erreur', 'Impossible d\'envoyer l\'email');
  }
};

// Get platform-specific value
export const getPlatformValue = (ios, android) => {
  return Platform.OS === 'ios' ? ios : android;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Sleep function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Get progress color based on percentage
export const getProgressColor = (percentage) => {
  if (percentage < 30) return '#dc3545'; // Red
  if (percentage < 60) return '#ffc107'; // Orange
  if (percentage < 80) return '#17a2b8'; // Blue
  return '#28a745'; // Green
};

// Get KYC status color
export const getKYCStatusColor = (status) => {
  const colors = {
    pending: '#ffc107',
    in_progress: '#17a2b8',
    completed: '#28a745',
    rejected: '#dc3545',
  };
  return colors[status] || '#6c757d';
};

// Get KYC status text
export const getKYCStatusText = (status) => {
  const texts = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
    rejected: 'Rejeté',
  };
  return texts[status] || status;
};

// Format business sector for display
export const formatBusinessSector = (sector) => {
  const sectorTranslations = {
    'Technology': 'Technologie',
    'Commerce': 'Commerce',
    'Services': 'Services',
    'Manufacturing': 'Industrie',
    'Healthcare': 'Santé',
    'Education': 'Éducation',
    'Finance': 'Finance',
    'Real Estate': 'Immobilier',
    'Agriculture': 'Agriculture',
    'Construction': 'Construction',
    'Tourism': 'Tourisme',
    'Transport': 'Transport',
    'Other': 'Autre',
  };
  return sectorTranslations[sector] || sector;
};