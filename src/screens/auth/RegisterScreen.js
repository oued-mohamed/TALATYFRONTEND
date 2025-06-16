import React, { useState } from 'react';
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
import OTPInput from '../../components/forms/OTPInput';
import MethodSelectionScreen from '../../components/forms/MethodSelectionScreen';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { sendSMSOTP, sendWhatsAppOTP, verifyOTP } from '../../services/authService';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading, clearError } = useAuth();
  
  // ✅ State management for WhatsApp OTP flow
  const [currentStep, setCurrentStep] = useState('register'); // 'register', 'method-selection', 'otp'
  const [userData, setUserData] = useState(null);
  const [otpMethod, setOtpMethod] = useState('sms'); // 'sms' or 'whatsapp'
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // ✅ Main OTP sending function using imported services
  const sendOTP = async (phoneNumber, method = 'sms') => {
    setIsOtpLoading(true);
    try {
      console.log(`📤 Sending ${method.toUpperCase()} OTP to:`, phoneNumber);
      
      // ✅ Input validation
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Numéro de téléphone invalide');
      }

      // ✅ Check network connectivity
      if (!navigator.onLine) {
        throw new Error('Pas de connexion internet');
      }
      
      if (method === 'whatsapp') {
        const result = await sendWhatsAppOTP(phoneNumber);
        console.log('✅ WhatsApp OTP sent:', result);
        Alert.alert(
          'Code envoyé',
          'Un code de vérification a été envoyé par WhatsApp'
        );
      } else {
        const result = await sendSMSOTP(phoneNumber);
        console.log('✅ SMS OTP sent:', result);
        Alert.alert(
          'Code envoyé',
          'Un code de vérification a été envoyé par SMS'
        );
      }
      
      setCurrentStep('otp');
    } catch (error) {
      console.error('❌ OTP send error:', error);
      
      // ✅ Better error messages
      const errorMessage = error.message === 'Pas de connexion internet' 
        ? 'Vérifiez votre connexion internet'
        : error.message === 'Numéro de téléphone invalide'
        ? 'Numéro de téléphone invalide'
        : 'Impossible d\'envoyer le code. Réessayez.';
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ✅ Handle registration form submission
  const handleRegister = async (formData) => {
    clearError();
    console.log('📝 Registration form submitted:', formData);
    
    // Store user data and proceed to method selection
    setUserData(formData);
    setCurrentStep('method-selection');
  };

  // ✅ Handle method selection (SMS or WhatsApp)
  const handleMethodSelection = (method) => {
    console.log('📱 Method selected:', method);
    
    // ✅ Validate phone number before sending
    if (!userData?.phone || userData.phone.length < 10) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide');
      return;
    }
    
    setOtpMethod(method);
    sendOTP(userData.phone, method);
  };

  // ✅ Handle OTP verification using imported service
  const handleOTPVerification = async (otp) => {
    setIsOtpLoading(true);
    try {
      console.log('🔐 Verifying OTP:', otp, 'via', otpMethod);
      
      // ✅ Use imported verifyOTP function
      const verifyResult = await verifyOTP(userData.phone, otp, otpMethod);
      
      if (verifyResult.success) {
        // OTP verified, complete registration
        console.log('✅ OTP verified, completing registration...');
        
        const result = await register({
          ...userData,
          phoneVerified: true,
          verificationMethod: otpMethod
        });
        
        if (result.success) {
          Alert.alert(
            'Inscription réussie!',
            'Votre compte a été créé avec succès.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
        } else {
          Alert.alert('Erreur d\'inscription', result.message);
        }
      } else {
        Alert.alert('Code invalide', 'Le code que vous avez saisi est incorrect.');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le code. Réessayez.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // ✅ Handle OTP resend
  const handleResendOTP = () => {
    console.log('🔄 Resending OTP via:', otpMethod);
    sendOTP(userData.phone, otpMethod);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // ✅ Enhanced back press handler with loading check
  const handleBackPress = () => {
    if (isOtpLoading) return; // Prevent navigation during loading
    
    if (currentStep === 'otp' || currentStep === 'method-selection') {
      // Go back to previous step
      if (currentStep === 'otp') {
        setCurrentStep('method-selection');
      } else {
        setCurrentStep('register');
      }
    } else {
      navigation.goBack();
    }
  };

  // ✅ Get screen title based on current step
  const getScreenTitle = () => {
    switch (currentStep) {
      case 'method-selection':
        return 'Vérification';
      case 'otp':
        return 'Code de vérification';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={getScreenTitle()}
        showBackButton={true}
        onLeftPress={handleBackPress}
        backgroundColor={colors.primary}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* ✅ STEP 1: Registration Form */}
          {currentStep === 'register' && (
            <>
              <RegisterForm onSubmit={handleRegister} loading={isLoading} />
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Vous avez déjà un compte ?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ✅ STEP 2: Method Selection */}
          {currentStep === 'method-selection' && (
            <MethodSelectionScreen 
              onSelect={handleMethodSelection}
              loading={isOtpLoading}
              phoneNumber={userData?.phone}
            />
          )}

          {/* ✅ STEP 3: OTP Verification */}
          {currentStep === 'otp' && (
            <OTPInput
              phoneNumber={userData?.phone}
              onComplete={handleOTPVerification}
              onResend={handleResendOTP}
              loading={isOtpLoading}
              method={otpMethod}
            />
          )}
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