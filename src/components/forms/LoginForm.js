import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginForm = ({ onSubmit, loading = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <Text style={styles.subtitle}>
        Connectez-vous à votre compte pour continuer
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'L\'email est requis',
            validate: validateEmail,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="Entrez votre email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Le mot de passe est requis',
            validate: validatePassword,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
          )}
        />

        <Button
          title="Se connecter"
          onPress={handleSubmit(onFormSubmit)}
          loading={loading}
          disabled={!isValid || loading}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});

export default LoginForm;