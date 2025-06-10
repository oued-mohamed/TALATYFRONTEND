import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useKYC } from '../../context/KYCContext';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { progress: kycProgress } = useKYC();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh user data and KYC status
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateToKYC = () => {
    navigation.navigate('KYC', { screen: 'KYCWelcome' });
  };

  const navigateToCreditApplication = () => {
    if (user?.kycStatus === 'completed') {
      navigation.navigate('Application', { screen: 'CreditApplication' });
    } else {
      navigation.navigate('KYC', { screen: 'KYCWelcome' });
    }
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderProfileCard = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()} {user?.firstName},
          </Text>
          <Text style={styles.subtitle}>prêt à booster votre activité ?</Text>
        </View>
        <TouchableOpacity onPress={navigateToProfile}>
          <Icon name="person" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {user?.profileCompletion < 100 && (
        <View style={styles.profileCompletion}>
          <Text style={styles.completionTitle}>
            Votre profil est incomplet.
          </Text>
          <ProgressBar
            progress={user?.profileCompletion || 0}
            showPercentage={true}
            style={styles.progressBar}
          />
          <View style={styles.completionSteps}>
            <Text style={[
              styles.stepText,
              user?.isEmailVerified && styles.completedStep
            ]}>
              ✓ Vérification de votre adresse e-mail
            </Text>
            <Text style={[
              styles.stepText,
              user?.isPhoneVerified && styles.completedStep
            ]}>
              ✓ Vérification de votre numéro de téléphone
            </Text>
            <Text style={[
              styles.stepText,
              user?.businessInfo?.companyName && styles.completedStep
            ]}>
              ✓ Informations sur votre entreprise
            </Text>
          </View>
          <Button
            title="Compléter mes informations"
            onPress={navigateToProfile}
            size="small"
            style={styles.completeButton}
          />
        </View>
      )}
    </View>
  );

  const renderApplicationCard = () => (
    <View style={styles.applicationCard}>
      <Text style={styles.cardTitle}>Mes demandes</Text>
      
      <View style={styles.applicationStatus}>
        <Text style={styles.applicationText}>
          Vous avez 1 demande de crédit en cours.
        </Text>
        <ProgressBar
          progress={90}
          showPercentage={true}
          style={styles.applicationProgress}
        />
        
        <View style={styles.applicationSteps}>
          <Text style={[styles.stepText, styles.completedStep]}>
            ✓ Connexion avec votre banque
          </Text>
          <Text style={[styles.stepText, styles.completedStep]}>
            ✓ Analyse de vos données financières
          </Text>
          <Text style={[styles.stepText, styles.completedStep]}>
            ✓ Vérification de votre identité (KYC)
          </Text>
          <Text style={styles.stepText}>
            ○ Ajout de documents additionnels
          </Text>
        </View>
        
        <Button
          title="Poursuivre la demande"
          onPress={navigateToCreditApplication}
          style={styles.continueButton}
        />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={navigateToKYC}
      >
        <Icon name="verified-user" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Vérification KYC</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={navigateToCreditApplication}
      >
        <Icon name="account-balance" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Demande de crédit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('Support')}
      >
        <Icon name="help" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Support</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderProfileCard()}
        {renderApplicationCard()}
        {renderQuickActions()}
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  profileCompletion: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  completionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  progressBar: {
    marginBottom: spacing.md,
  },
  completionSteps: {
    marginBottom: spacing.md,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  completedStep: {
    color: colors.success,
  },
  completeButton: {
    alignSelf: 'flex-start',
  },
  applicationCard: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  applicationStatus: {
    // Application status styles
  },
  applicationText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    marginBottom: spacing.md,
  },
  applicationProgress: {
    marginBottom: spacing.md,
  },
  applicationSteps: {
    marginBottom: spacing.md,
  },
  continueButton: {
    backgroundColor: colors.white,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 80,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default HomeScreen;