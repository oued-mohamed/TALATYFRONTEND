import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OTPInput from '../../components/forms/OTPInput';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { apiService } from '../../services/api';

const PhoneVerificationScreen = ({ navigation, route }) => {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validatePhoneNumber = (phone) => {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    
    // Check if it's a valid Moroccan number
    const moroccanRegex = /^(\+212|0)(6|7)[0-9]{8}$/;
    return moroccanRegex.test(cleanPhone);
  };

  const formatPhoneNumber = (phone) => {
    // Clean the phone number
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
      cleaned = '+212' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+212')) {
      cleaned = '+212' + cleaned;
    }
    
    return cleaned;
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Veuillez saisir votre numéro de téléphone');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Veuillez saisir un numéro de téléphone marocain valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Call API to send SMS code
      const response = await apiService.kyc.sendPhoneCode(formattedPhone);
      
      if (response.success) {
        setStep('otp');
      } else {
        setError(response.message || 'Erreur lors de l\'envoi du code');
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
      console.error('Send code error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setLoading(true);
    setOtpError('');

    try {
      // Call API to verify OTP
      const response = await apiService.kyc.verifyPhone(otpCode);
      
      if (response.success) {
        setStep('success');
        // Auto-navigate after showing success
        setTimeout(() => {
          navigation.goBack();
          // Or navigate to next step in KYC process
          // navigation.navigate('NextKYCStep');
        }, 2000);
      } else {
        setOtpError(response.message || 'Code invalide. Veuillez réessayer.');
      }
    } catch (err) {
      setOtpError('Code invalide. Veuillez réessayer.');
      console.error('Verify OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setOtpError('');
    await handleSendCode();
  };

  const handleGoBack = () => {
    console.log('⬅️ Going back from PhoneVerification...');
    
    if (step === 'otp') {
      // If on OTP step, go back to phone input
      setStep('phone');
      setOtpError('');
    } else {
      // If on phone step or success, go back to previous screen
      navigation.goBack();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {step === 'phone' ? 'Vérification téléphone' : 
         step === 'otp' ? 'Code de vérification' : 
         'Vérification réussie'}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderPhoneInput = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Vérifiez votre numéro de téléphone...</Text>
      <Text style={styles.subtitle}>
        Nous vous enverrons un code de sécurité pour confirmer que c'est bien vous.
      </Text>

      <View style={styles.inputContainer}>
        <Input
          label=""
          placeholder="6 65 85 85 85"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoComplete="tel"
          error={error}
          prefix="+212"
          style={styles.phoneInput}
        />
      </View>

      <Button
        title="RECEVOIR LE CODE"
        onPress={handleSendCode}
        loading={loading}
        disabled={loading || !phoneNumber.trim()}
        style={styles.sendButton}
      />
    </View>
  );

  const renderOTPInput = () => (
    <View style={styles.content}>
      <OTPInput
        length={6}
        onComplete={handleVerifyOTP}
        onResend={handleResendCode}
        phoneNumber={formatPhoneNumber(phoneNumber)}
        loading={loading}
        error={otpError}
        resendTimer={60}
      />
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      <Text style={styles.successTitle}>
        Numéro de téléphone vérifié avec succès !
      </Text>
      <Button
        title="CONTINUER"
        onPress={() => {
          navigation.goBack();
          // Or navigate to next step
        }}
        style={styles.continueButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'phone' && renderPhoneInput()}
          {step === 'otp' && renderOTPInput()}
          {step === 'success' && renderSuccess()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'left',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'left',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  phoneInput: {
    fontSize: typography.fontSize.lg,
  },
  sendButton: {
    marginTop: spacing.lg,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkmark: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  continueButton: {
    width: '100%',
    marginTop: spacing.lg,
  },
});

export default PhoneVerificationScreen;