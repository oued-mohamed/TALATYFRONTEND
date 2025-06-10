import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
} from '../../utils/validation';

const RegisterForm = ({ onSubmit, loading = false }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onFormSubmit = (data) => {
    const { confirmPassword, ...submitData } = data;
    onSubmit(submitData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>
        Rejoignez-nous pour accéder à nos services
      </Text>

      <View style={styles.form}>
        <View style={styles.nameContainer}>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: 'Le prénom est requis',
              validate: validateName,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.nameField}>
                <Input
                  label="Prénom"
                  placeholder="Prénom"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  autoCapitalize="words"
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="lastName"
            rules={{
              required: 'Le nom est requis',
              validate: validateName,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.nameField}>
                <Input
                  label="Nom"
                  placeholder="Nom"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  autoCapitalize="words"
                />
              </View>
            )}
          />
        </View>

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
          name="phone"
          rules={{
            required: 'Le numéro de téléphone est requis',
            validate: validatePhone,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Numéro de téléphone"
              placeholder="+212 6 XX XX XX XX"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              autoComplete="tel"
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
              secureTextEntry={true}
              autoComplete="new-password"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'La confirmation est requise',
            validate: (value) =>
              value === password || 'Les mots de passe ne correspondent pas',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirmer le mot de passe"
              placeholder="Confirmez votre mot de passe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry={true}
              autoComplete="new-password"
            />
          )}
        />

        <Button
          title="Créer le compte"
          onPress={handleSubmit(onFormSubmit)}
          loading={loading}
          disabled={!isValid || loading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});

export default RegisterForm;