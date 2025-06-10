import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const { width } = Dimensions.get('window');

const OTPInput = ({ 
  length = 6, 
  onComplete, 
  onResend,
  phoneNumber,
  loading = false,
  error = null,
  resendTimer = 60
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [timer, setTimer] = useState(resendTimer);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    if (canResend && onResend) {
      setTimer(resendTimer);
      setCanResend(false);
      setOtp(new Array(length).fill(''));
      onResend();
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérifiez votre numéro de téléphone...</Text>
      <Text style={styles.subtitle}>
        Veuillez renseigner le code envoyé par SMS au {phoneNumber}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              error && styles.otpInputError,
              digit && styles.otpInputFilled
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            editable={!loading}
            selectTextOnFocus
          />
        ))}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Vous n'avez rien reçu ?{' '}
        </Text>
        {canResend ? (
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Text style={styles.resendLink}>Renvoyer le code.</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>
            Renvoyer dans {formatTimer(timer)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'left',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'left',
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  otpInput: {
    width: (width - spacing.lg * 2 - spacing.sm * 2 - spacing.md * 5) / 6,
    height: 60,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: 'transparent',
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.7,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    textDecorationLine: 'underline',
    fontWeight: typography.fontWeight.medium,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.7,
  },
});

export default OTPInput;