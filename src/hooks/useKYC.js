import { useContext } from 'react';
import { KYCContext } from '../context/KYCContext';

export const useKYC = () => {
  const context = useContext(KYCContext);
  
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  
  return context;
};