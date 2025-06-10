import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Application screens
import CreditApplicationScreen from '../screens/application/CreditApplicationScreen';
import ApplicationProgressScreen from '../screens/application/ApplicationProgressScreen';
import BankConnectionScreen from '../screens/application/BankConnectionScreen';
import FinancialAnalysisScreen from '../screens/application/FinancialAnalysisScreen';
import ApplicationResultScreen from '../screens/application/ApplicationResultScreen';

const Stack = createStackNavigator();

const ApplicationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a3a52' },
      }}
    >
      <Stack.Screen name="CreditApplication" component={CreditApplicationScreen} />
      <Stack.Screen name="ApplicationProgress" component={ApplicationProgressScreen} />
      <Stack.Screen name="BankConnection" component={BankConnectionScreen} />
      <Stack.Screen name="FinancialAnalysis" component={FinancialAnalysisScreen} />
      <Stack.Screen name="ApplicationResult" component={ApplicationResultScreen} />
    </Stack.Navigator>
  );
};

export default ApplicationNavigator;