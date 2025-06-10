import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { KYCProvider } from './src/context/KYCContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/styles/colors';
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006'], // Add your Expo dev server URLs
  credentials: true
}));

const App = () => {
  return (
    <AuthProvider>
      <KYCProvider>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={colors.primary}
          />
          <AppNavigator />
        </NavigationContainer>
      </KYCProvider>
    </AuthProvider>
  );
};

export default App;