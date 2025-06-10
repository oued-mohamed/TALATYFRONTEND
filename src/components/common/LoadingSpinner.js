import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const LoadingSpinner = ({
  visible = true,
  text = 'Chargement...',
  overlay = true,
  size = 'large',
  color = colors.primary,
  style = {},
}) => {
  if (overlay) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  if (!visible) return null;

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, styles.inlineText]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  text: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textDark,
    textAlign: 'center',
  },
  inlineText: {
    marginTop: 0,
    marginLeft: spacing.md,
    color: colors.primary,
  },
});

export default LoadingSpinner;