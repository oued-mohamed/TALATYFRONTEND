import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RegisterForm from '../../components/forms/RegisterForm';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading, clearError } = useAuth();

  const handleRegister = async (formData) => {
    clearError();
    
    const result = await register(formData);
    
    if (!result.success) {
      Alert.alert('Erreur d\'inscription', result.message);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title=""
        showBackButton={true}
        onLeftPress={handleBackPress}
        backgroundColor={colors.primary}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <RegisterForm onSubmit={handleRegister} loading={isLoading} />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Vous avez déjà un compte ?{' '}
            </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  loginText: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
  },
  loginLink: {
    fontSize: typography.fontSize.base,
    color: colors.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default RegisterScreen;