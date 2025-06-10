import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  style,
  prefix,
  suffix,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  maxLength,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        !editable && styles.inputContainerDisabled,
      ]}>
        {prefix && (
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            prefix && styles.inputWithPrefix,
            suffix && styles.inputWithSuffix,
            multiline && styles.inputMultiline,
            style,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          maxLength={maxLength}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color={colors.gray}
            />
          </TouchableOpacity>
        )}

        {suffix && (
          <View style={styles.suffixContainer}>
            {typeof suffix === 'string' ? (
              <Text style={styles.suffixText}>{suffix}</Text>
            ) : (
              suffix
            )}
          </View>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    marginBottom: spacing.xs,
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.white,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: typography.fontFamily.regular,
  },
  inputWithPrefix: {
    paddingLeft: 0,
  },
  inputWithSuffix: {
    paddingRight: spacing.xs,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  prefixContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: typography.fontSize.base,
    color: colors.textDark,
    fontWeight: typography.fontWeight.medium,
  },
  suffixContainer: {
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
    justifyContent: 'center',
  },
  suffixText: {
    fontSize: typography.fontSize.base,
    color: colors.gray,
  },
  eyeIcon: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;