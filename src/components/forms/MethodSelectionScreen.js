// src/components/forms/MethodSelectionScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const MethodSelectionScreen = ({ onSelect, loading = false, phoneNumber }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choisissez votre méthode</Text>
        <Text style={styles.subtitle}>
          Comment souhaitez-vous recevoir votre code de vérification ?
        </Text>
        {phoneNumber && (
          <Text style={styles.phoneNumber}>
            📞 {phoneNumber}
          </Text>
        )}
      </View>

      <View style={styles.methodsContainer}>
        <TouchableOpacity 
          style={[styles.methodButton, loading && styles.disabledButton]}
          onPress={() => onSelect('whatsapp')}
          disabled={loading}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.iconText}>📱</Text>
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>WhatsApp</Text>
            <Text style={styles.methodDescription}>
              Recevez le code directement sur WhatsApp
            </Text>
            <Text style={styles.methodBenefit}>
              ✓ Plus rapide et fiable
            </Text>
          </View>
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.methodButton, loading && styles.disabledButton]}
          onPress={() => onSelect('sms')}
          disabled={loading}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.iconText}>💬</Text>
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>SMS</Text>
            <Text style={styles.methodDescription}>
              Recevez le code par message texte
            </Text>
            <Text style={styles.methodBenefit}>
              ✓ Fonctionne sur tous les téléphones
            </Text>
          </View>
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.secondary} />
          <Text style={styles.loadingText}>Envoi en cours...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Un code à 6 chiffres sera envoyé à votre numéro
        </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  phoneNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
  },
  methodsContainer: {
    marginBottom: spacing.xl,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButton: {
    opacity: 0.6,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  methodDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  methodBenefit: {
    fontSize: typography.fontSize.xs,
    color: colors.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  arrow: {
    marginLeft: spacing.md,
  },
  arrowText: {
    fontSize: 20,
    color: colors.white,
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default MethodSelectionScreen;