import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { KYCProvider } from './src/context/KYCContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <KYCProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </KYCProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}