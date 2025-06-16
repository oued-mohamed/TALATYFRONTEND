import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const HomeScreen = ({ navigation }) => {
  const navigateToApplication = () => {
    console.log('🚀 Navigating to Application flow...');
    navigation.navigate('Application');
  };

  const navigateToKYC = () => {
    console.log('🔍 Navigating to KYC flow...');
    navigation.navigate('KYC');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.appName}>Business eKYC</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={navigateToApplication}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>💼</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Demande de crédit</Text>
              <Text style={styles.cardSubtitle}>
                Faire une nouvelle demande de crédit professionnel
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={navigateToKYC}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🔍</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Vérification KYC</Text>
              <Text style={styles.cardSubtitle}>
                Compléter votre vérification d'identité
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>📊</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mes crédits</Text>
              <Text style={styles.cardSubtitle}>
                Voir le statut de vos demandes en cours
              </Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Application Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services de crédit</Text>
          
          <TouchableOpacity 
            style={[styles.serviceButton, styles.primaryService]}
            onPress={() => navigation.navigate('Application', { screen: 'CreditApplication' })}
          >
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceEmoji}>📋</Text>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Demande de crédit</Text>
              <Text style={styles.serviceSubtitle}>Nouvelle demande</Text>
            </View>
            <Text style={styles.serviceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.serviceButton, styles.primaryService]}
            onPress={() => navigation.navigate('Application', { screen: 'ApplicationProgress' })}
          >
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceEmoji}>📊</Text>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Suivi de demande</Text>
              <Text style={styles.serviceSubtitle}>Voir le progrès</Text>
            </View>
            <Text style={styles.serviceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.serviceButton, styles.primaryService]}
            onPress={() => navigation.navigate('Application', { screen: 'BankConnection' })}
          >
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceEmoji}>🏦</Text>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Connexion bancaire</Text>
              <Text style={styles.serviceSubtitle}>Lier votre banque</Text>
            </View>
            <Text style={styles.serviceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.serviceButton, styles.primaryService]}
            onPress={() => navigation.navigate('Application', { screen: 'FinancialAnalysis' })}
          >
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceEmoji}>📈</Text>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Analyse financière</Text>
              <Text style={styles.serviceSubtitle}>Évaluation</Text>
            </View>
            <Text style={styles.serviceArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.serviceButton, styles.primaryService]}
            onPress={() => navigation.navigate('Application', { screen: 'ApplicationResult' })}
          >
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceEmoji}>✅</Text>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>Résultats</Text>
              <Text style={styles.serviceSubtitle}>Décision finale</Text>
            </View>
            <Text style={styles.serviceArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut du compte</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>✅ Compte activé</Text>
            <Text style={styles.statusText}>✅ Authentifié</Text>
            <Text style={styles.statusText}>🔄 KYC en cours</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  
  header: {
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.8,
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },

  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  cardIcon: {
    marginRight: spacing.md,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.7,
  },
  cardArrow: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.7,
  },

  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  primaryService: {
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderColor: 'rgba(0,122,255,0.3)',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceEmoji: {
    fontSize: 18,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.7,
  },
  serviceArrow: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.6,
  },

  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 8,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    marginBottom: 4,
  },
});

export default HomeScreen;