import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// KYC screens
import KYCWelcomeScreen from '../screens/kyc/KYCWelcomeScreen';
import DocumentUploadScreen from '../screens/kyc/DocumentUploadScreen';
import IdentityVerificationScreen from '../screens/kyc/IdentityVerificationScreen';
import SelfieScreen from '../screens/kyc/SelfieScreen';
import NFCVerificationScreen from '../screens/kyc/NFCVerificationScreen';
import PhoneVerificationScreen from '../screens/kyc/PhoneVerificationScreen';
import KYCCompletedScreen from '../screens/kyc/KYCCompletedScreen';

const Stack = createStackNavigator();

const KYCNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a3a52' },
      }}
    >
      <Stack.Screen name="KYCWelcome" component={KYCWelcomeScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
      <Stack.Screen name="Selfie" component={SelfieScreen} />
      <Stack.Screen name="NFCVerification" component={NFCVerificationScreen} />
      <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
      <Stack.Screen name="KYCCompleted" component={KYCCompletedScreen} />
    </Stack.Navigator>
  );
};

export default KYCNavigator;