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
import LoginForm from '../../components/forms/LoginForm';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (formData) => {
    clearError();
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      Alert.alert('Erreur de connexion', result.message);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <LoginForm onSubmit={handleLogin} loading={isLoading} />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Vous n'avez pas de compte ?{' '}
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>S'inscrire</Text>
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
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.base,
    color: colors.secondary,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
  },
  registerLink: {
    fontSize: typography.fontSize.base,
    color: colors.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default LoginScreen;