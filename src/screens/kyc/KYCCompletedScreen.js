import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const KYCCompletedScreen = ({ navigation }) => {
  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.checkmarkContainer}>
            <Icon name="check" size={60} color={colors.white} />
          </View>
          
          <Text style={styles.title}>
            Identité vérifiée{'\n'}avec succès !
          </Text>
          
          <Text style={styles.subtitle}>
            Votre vérification d'identité a été completée avec succès. 
            Vous pouvez maintenant procéder à votre demande de crédit.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUER"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  continueButton: {
    // Button styles
  },
});

export default KYCCompletedScreen;