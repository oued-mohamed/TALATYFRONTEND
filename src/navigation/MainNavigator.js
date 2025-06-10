import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screen imports
import HomeScreen from '../screens/main/HomeScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SupportScreen from '../screens/main/SupportScreen';
import KYCNavigator from './KYCNavigator';
import ApplicationNavigator from './ApplicationNavigator';

// Onboarding screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import BusinessInfoScreen from '../screens/onboarding/BusinessInfoScreen';

import { colors } from '../styles/colors';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Support':
              iconName = 'help';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.primaryLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Mes crédits' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
      <Tab.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ tabBarLabel: 'Support' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useAuth();

  // For development/testing, always show main tabs
  // You can modify this condition later for production
  const shouldShowOnboarding = false; // Change to: user?.profileCompletion < 100 when needed

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="MainTabs"
    >
      {/* Main app tabs - shown first */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Onboarding screens - accessible via navigation but not initial */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="BusinessInfo" component={BusinessInfoScreen} />
      
      {/* Other navigators */}
      <Stack.Screen name="KYC" component={KYCNavigator} />
      <Stack.Screen name="Application" component={ApplicationNavigator} />
    </Stack.Navigator>
  );
};

export default MainNavigator;