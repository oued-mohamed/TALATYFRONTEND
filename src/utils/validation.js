// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Format d\'email invalide';
  }
  return true;
};

// Password validation
export const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Le mot de passe doit contenir au moins une minuscule';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Le mot de passe doit contenir au moins une majuscule';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre';
  }
  
  return true;
};

// Phone validation (Moroccan format)
export const validatePhone = (phone) => {
  const phoneRegex = /^\+212[5-7][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return 'Numéro de téléphone marocain invalide (+212 6XXXXXXXX)';
  }
  return true;
};

// Name validation
export const validateName = (name) => {
  if (name.length < 2) {
    return 'Le nom doit contenir au moins 2 caractères';
  }
  
  if (name.length > 50) {
    return 'Le nom ne peut pas dépasser 50 caractères';
  }
  
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return 'Le nom contient des caractères invalides';
  }
  
  return true;
};

// RIB validation (Moroccan format)
export const validateRIB = (rib) => {
  const ribRegex = /^\d{3}-\d{3}-\d{16}-\d{2}$/;
  if (!ribRegex.test(rib)) {
    return 'Format RIB invalide (XXX-XXX-XXXXXXXXXXXXXXXX-XX)';
  }
  return true;
};

// Company name validation
export const validateCompanyName = (name) => {
  if (name.length < 2) {
    return 'Le nom de l\'entreprise doit contenir au moins 2 caractères';
  }
  
  if (name.length > 100) {
    return 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères';
  }
  
  return true;
};