import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Check camera permission
export const checkCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const permission = PERMISSIONS.ANDROID.CAMERA;
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } else {
      const permission = PERMISSIONS.IOS.CAMERA;
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
};

// Request camera permission
export const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const permission = PERMISSIONS.ANDROID.CAMERA;
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } else {
      const permission = PERMISSIONS.IOS.CAMERA;
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

// Check storage permission
export const checkStoragePermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const permission = Platform.Version >= 33 
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } else {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
};

// Request storage permission
export const requestStoragePermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const permission = Platform.Version >= 33 
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } else {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
};

// Check and request camera permission with user feedback
export const ensureCameraPermission = async () => {
  const hasPermission = await checkCameraPermission();
  
  if (hasPermission) {
    return true;
  }
  
  const granted = await requestCameraPermission();
  
  if (!granted) {
    Alert.alert(
      'Permission requise',
      'L\'accès à la caméra est nécessaire pour prendre des photos de vos documents.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Paramètres', onPress: () => openAppSettings() },
      ]
    );
  }
  
  return granted;
};

// Check and request storage permission with user feedback
export const ensureStoragePermission = async () => {
  const hasPermission = await checkStoragePermission();
  
  if (hasPermission) {
    return true;
  }
  
  const granted = await requestStoragePermission();
  
  if (!granted) {
    Alert.alert(
      'Permission requise',
      'L\'accès au stockage est nécessaire pour sélectionner des images.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Paramètres', onPress: () => openAppSettings() },
      ]
    );
  }
  
  return granted;
};

// Open app settings
export const openAppSettings = async () => {
  try {
    const { openSettings } = require('react-native-permissions');
    await openSettings();
  } catch (error) {
    console.error('Error opening app settings:', error);
  }
};

// Check all required permissions
export const checkAllPermissions = async () => {
  const cameraPermission = await checkCameraPermission();
  const storagePermission = await checkStoragePermission();
  
  return {
    camera: cameraPermission,
    storage: storagePermission,
    all: cameraPermission && storagePermission,
  };
};

// Request all required permissions
export const requestAllPermissions = async () => {
  const cameraGranted = await ensureCameraPermission();
  const storageGranted = await ensureStoragePermission();
  
  return {
    camera: cameraGranted,
    storage: storageGranted,
    all: cameraGranted && storageGranted,
  };
};