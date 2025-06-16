import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useKYC } from '../../context/KYCContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const { width, height } = Dimensions.get('window');

const KYCCompletedScreen = ({ navigation }) => {
  const { kycData } = useKYC();
  const { user } = useAuth();
  
  // Animation values
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [confettiAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Success animation sequence
    Animated.sequence([
      // Scale in the success icon
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      // Fade in content with slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Confetti effect
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse for the success icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const completedSteps = [
    {
      id: 1,
      title: 'Vérification d\'identité',
      icon: '✅',
      description: 'Document d\'identité vérifié',
      completedAt: new Date().toLocaleDateString('fr-FR'),
    },
    {
      id: 2,
      title: 'Vérification téléphone',
      icon: '✅',
      description: 'Numéro de téléphone confirmé',
      completedAt: new Date().toLocaleDateString('fr-FR'),
    },
    {
      id: 3,
      title: 'Documents professionnels',
      icon: '✅',
      description: 'Documents d\'entreprise validés',
      completedAt: new Date().toLocaleDateString('fr-FR'),
    },
  ];

  const nextSteps = [
    {
      id: 1,
      title: 'Tableau de bord',
      description: 'Explorez votre espace personnel',
      icon: '📊',
      action: () => navigation.navigate('Dashboard'),
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: 2,
      title: 'Demande de crédit',
      description: 'Lancez votre première demande',
      icon: '💰',
      action: () => navigation.navigate('CreditApplication'),
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      id: 3,
      title: 'Support client',
      description: 'Contactez notre équipe',
      icon: '🎧',
      action: () => navigation.navigate('Support'),
      gradient: ['#4facfe', '#00f2fe'],
    },
  ];

  const benefits = [
    {
      icon: '🚀',
      title: 'Accès complet',
      description: 'Tous nos services sont maintenant disponibles',
    },
    {
      icon: '⚡',
      title: 'Traitement rapide',
      description: 'Vos demandes seront traitées en priorité',
    },
    {
      icon: '🛡️',
      title: 'Sécurité renforcée',
      description: 'Votre compte bénéficie d\'une protection maximale',
    },
    {
      icon: '💎',
      title: 'Services premium',
      description: 'Accès aux fonctionnalités avancées',
    },
  ];

  const handleGetStarted = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const renderConfetti = () => {
    const confettiPieces = Array.from({ length: 20 }, (_, i) => i);
    
    return (
      <View style={styles.confettiContainer}>
        {confettiPieces.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confettiPiece,
              {
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][Math.floor(Math.random() * 5)],
                transform: [
                  {
                    translateY: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, height + 100],
                    }),
                  },
                  {
                    rotate: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: confettiAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#48bb78" />
      {renderConfetti()}
      
      <SafeAreaView style={styles.safeArea}>
        {/* Success Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View 
            style={[
              styles.successIconContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <View style={styles.successIcon}>
              <Icon name="check" size={60} color="#fff" />
            </View>
            <View style={styles.successRing} />
            <View style={styles.successRingOuter} />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.successTitle}>
              Identité vérifiée avec succès ! 🎉
            </Text>
            <Text style={styles.successSubtitle}>
              Félicitations {user?.firstName || 'cher client'} ! Votre processus de vérification KYC est maintenant terminé.
            </Text>
            
            <View style={styles.completionBadge}>
              <Icon name="verified" size={20} color="#48bb78" />
              <Text style={styles.completionText}>Compte vérifié</Text>
            </View>
          </Animated.View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Completed Steps */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>✅ Étapes accomplies</Text>
            {completedSteps.map((step, index) => (
              <Animated.View
                key={step.id}
                style={[
                  styles.stepCard,
                  {
                    transform: [{
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }],
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <Text style={styles.stepDate}>Complété le {step.completedAt}</Text>
                </View>
                <View style={styles.stepSuccess}>
                  <Icon name="check-circle" size={24} color="#48bb78" />
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Benefits */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>🎁 Vos avantages</Text>
            <View style={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.benefitCard,
                    {
                      transform: [{
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      }],
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Next Steps */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>🚀 Prochaines étapes</Text>
            {nextSteps.map((step, index) => (
              <Animated.View
                key={step.id}
                style={[
                  styles.nextStepCard,
                  {
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30 + (index * 10), 0],
                      }),
                    }],
                    opacity: fadeAnim,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.nextStepButton, { backgroundColor: step.gradient[0] }]}
                  onPress={step.action}
                  activeOpacity={0.8}
                >
                  <View style={styles.nextStepIconContainer}>
                    <Text style={styles.nextStepIcon}>{step.icon}</Text>
                  </View>
                  
                  <View style={styles.nextStepContent}>
                    <Text style={styles.nextStepTitle}>{step.title}</Text>
                    <Text style={styles.nextStepDescription}>{step.description}</Text>
                  </View>
                  
                  <View style={styles.nextStepArrow}>
                    <Icon name="arrow-forward-ios" size={16} color="rgba(255,255,255,0.8)" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Security Reminder */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.securityCard}>
              <Icon name="security" size={24} color="#4facfe" />
              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>Vos données sont protégées</Text>
                <Text style={styles.securityDescription}>
                  Toutes vos informations sont chiffrées et stockées de manière sécurisée. 
                  Nous respectons les normes de sécurité bancaire les plus strictes.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.actionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGetStarted}
          >
            <Icon name="dashboard" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Accéder au tableau de bord</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.secondaryButtonText}>👤 Voir mon profil</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#48bb78',
  },
  safeArea: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#38a169',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 3,
  },
  successRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    zIndex: 2,
  },
  successRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 1,
  },
  heroContent: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
  },
  completionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#48bb78',
    marginLeft: spacing.xs,
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  
  // Step Cards
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fff4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  stepDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  stepSuccess: {
    marginLeft: spacing.sm,
  },
  
  // Benefits Grid
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  benefitTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Next Steps
  nextStepCard: {
    marginBottom: spacing.md,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextStepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nextStepIcon: {
    fontSize: 24,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: 2,
  },
  nextStepDescription: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  nextStepArrow: {
    marginLeft: spacing.sm,
  },
  
  // Security Card
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#4facfe',
  },
  securityContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  securityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  securityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  
  // Action Buttons
  actionContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4facfe',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.full,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: '#4facfe',
  },
});

export default KYCCompletedScreen;