import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { useKYC } from '../../context/KYCContext';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const KYCWelcomeScreen = ({ navigation }) => {
  const { kycData, startKYC, isLoading, error } = useKYC();
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animation d'entrée
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
    ]).start();
  }, []);

  // Safe access to kycData properties with fallbacks
  const completedSteps = kycData?.completedSteps || [];
  const currentStep = kycData?.currentStep || 'profile_setup';
  
  const kycSteps = [
    {
      id: 1,
      title: 'Vérification d\'identité',
      description: 'Téléchargez une photo de votre pièce d\'identité (carte d\'identité, passeport)',
      icon: '📄',
      duration: '2 min',
      status: completedSteps.includes('identity_verification') ? 'completed' : 'pending',
      stepKey: 'identity_verification',
      screenName: 'IdentityVerification',
    },
    {
      id: 2,
      title: 'Prise de selfie',
      description: 'Prenez une photo de votre visage pour vérifier votre identité',
      icon: '🤳',
      duration: '1 min',
      status: completedSteps.includes('selfie_verification') ? 'completed' : 'pending',
      stepKey: 'selfie_verification',
      screenName: 'Selfie',
    },
    {
      id: 3,
      title: 'Vérification du numéro',
      description: 'Confirmez votre numéro de téléphone via SMS',
      icon: '📱',
      duration: '1 min',
      status: completedSteps.includes('phone_verification') ? 'completed' : 'pending',
      stepKey: 'phone_verification',
      screenName: 'PhoneVerification',
    },
    {
      id: 4,
      title: 'Documents additionnels',
      description: 'Téléchargez les documents requis selon votre profil',
      icon: '📋',
      duration: '3 min',
      status: completedSteps.includes('document_upload') ? 'completed' : 'pending',
      stepKey: 'document_upload',
      screenName: 'DocumentUpload',
    },
  ];

  const requirements = [
    {
      title: 'Pièce d\'identité valide',
      description: 'Carte d\'identité, passeport ou permis de conduire',
      icon: '✓',
    },
    {
      title: 'Téléphone mobile',
      description: 'Pour recevoir le code de vérification SMS',
      icon: '✓',
    },
    {
      title: 'Bonne luminosité',
      description: 'Pour des photos claires et lisibles',
      icon: '✓',
    },
    {
      title: '5-10 minutes',
      description: 'Le processus complet prend moins de 10 minutes',
      icon: '✓',
    },
  ];

  const handleStartKYC = async () => {
    try {
      // Start the KYC process
      const result = await startKYC();
      
      if (result.success) {
        Alert.alert(
          'Vérification démarrée',
          'Vous allez être guidé à travers le processus de vérification d\'identité.',
          [
            {
              text: 'Plus tard',
              style: 'cancel',
            },
            {
              text: 'Commencer',
              onPress: () => {
                // Navigate to first step
                navigation.navigate('IdentityVerification');
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de démarrer la vérification');
      }
    } catch (error) {
      console.error('Start KYC error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleContinueKYC = () => {
    // Déterminer la prochaine étape en fonction du statut KYC
    const nextStep = getNextIncompleteStep();
    
    if (nextStep) {
      navigation.navigate(nextStep.screenName);
    } else {
      // All steps completed
      navigation.navigate('KYCCompleted');
    }
  };

  const getNextIncompleteStep = () => {
    return kycSteps.find(step => step.status === 'pending');
  };

  const getProgressPercentage = () => {
    const completedCount = kycSteps.filter(step => step.status === 'completed').length;
    return (completedCount / kycSteps.length) * 100;
  };

  const isKYCStarted = () => {
    return kycSteps.some(step => step.status === 'completed') || kycData?.status === 'in_progress';
  };

  const handleSupportPress = () => {
    // Navigate to support or show contact info
    Alert.alert(
      'Support',
      'Contactez notre équipe de support:\n\nEmail: support@businessekyc.com\nTéléphone: +212 5XX XX XX XX',
      [
        { text: 'Fermer' },
        { 
          text: 'Aller au Support', 
          onPress: () => {
            // Try to navigate to support screen if it exists
            try {
              navigation.navigate('Support');
            } catch (error) {
              // If support screen doesn't exist, just show the alert
              console.log('Support screen not found');
            }
          }
        },
      ]
    );
  };

  const handleStepPress = (step) => {
    console.log('Step pressed:', step.title, 'Status:', step.status);
    
    if (step.status === 'completed') {
      // Allow reviewing completed steps
      navigation.navigate(step.screenName);
      return;
    }

    // For pending steps, check if previous steps are completed or if it's the first available step
    const stepIndex = kycSteps.findIndex(s => s.id === step.id);
    const previousStepsCompleted = kycSteps.slice(0, stepIndex).every(s => s.status === 'completed');
    
    if (stepIndex === 0 || previousStepsCompleted) {
      // Can start this step
      console.log('Navigating to:', step.screenName);
      
      // Special handling for DocumentUpload screen
      if (step.screenName === 'DocumentUpload') {
        navigation.navigate('DocumentUpload');
      } else {
        navigation.navigate(step.screenName);
      }
    } else {
      Alert.alert(
        'Étape non disponible',
        'Veuillez compléter les étapes précédentes avant de continuer.',
        [{ text: 'OK' }]
      );
    }
  };

  const isStepClickable = (step) => {
    if (step.status === 'completed') {
      return true; // Completed steps are always clickable for review
    }
    
    const stepIndex = kycSteps.findIndex(s => s.id === step.id);
    const previousStepsCompleted = kycSteps.slice(0, stepIndex).every(s => s.status === 'completed');
    
    return stepIndex === 0 || previousStepsCompleted;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Vérification KYC</Text>
          <Text style={styles.headerSubtitle}>
            {isKYCStarted() ? 'Continuez votre vérification' : 'Vérifiez votre identité en quelques étapes'}
          </Text>
          
          {isKYCStarted() && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(getProgressPercentage())}% terminé</Text>
            </View>
          )}
        </Animated.View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Steps Overview */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Étapes de vérification</Text>
          {kycSteps.map((step, index) => {
            const clickable = isStepClickable(step);
            
            return (
              <TouchableOpacity 
                key={step.id} 
                style={[
                  styles.stepItem,
                  !clickable && styles.stepItemDisabled,
                  step.stepKey === 'document_upload' && styles.documentsStepHighlight
                ]}
                onPress={() => clickable ? handleStepPress(step) : null}
                activeOpacity={clickable ? 0.7 : 1}
                disabled={!clickable}
              >
                <View style={styles.stepIcon}>
                  <Text style={styles.stepEmoji}>{step.icon}</Text>
                  {step.status === 'completed' && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓</Text>
                    </View>
                  )}
                  {!clickable && step.status === 'pending' && (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>🔒</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text style={[
                      styles.stepTitle,
                      !clickable && styles.stepTitleDisabled
                    ]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepDuration}>{step.duration}</Text>
                  </View>
                  <Text style={[
                    styles.stepDescription,
                    !clickable && styles.stepDescriptionDisabled
                  ]}>
                    {step.description}
                  </Text>
                  {step.status === 'completed' && (
                    <Text style={styles.stepCompleted}>✓ Terminé</Text>
                  )}
                  {clickable && step.status === 'pending' && (
                    <Text style={styles.stepAvailable}>👆 Appuyez pour commencer</Text>
                  )}
                </View>
                
                {clickable && (
                  <View style={styles.stepArrow}>
                    <Text style={styles.arrowText}>▶</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Requirements */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Ce dont vous avez besoin</Text>
          <View style={styles.requirementsContainer}>
            {requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.requirementIcon}>
                  <Text style={styles.checkIcon}>{req.icon}</Text>
                </View>
                <View style={styles.requirementContent}>
                  <Text style={styles.requirementTitle}>{req.title}</Text>
                  <Text style={styles.requirementDescription}>{req.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Security Info */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.securityContainer}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Vos données sont sécurisées</Text>
              <Text style={styles.securityDescription}>
                Toutes vos informations sont chiffrées et protégées selon les normes bancaires. 
                Nous ne stockons jamais vos documents plus longtemps que nécessaire.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Benefits */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Pourquoi vérifier votre identité ?</Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={styles.benefitText}>Accès complet aux services</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🛡️</Text>
              <Text style={styles.benefitText}>Protection contre la fraude</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>Transactions plus rapides</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🏆</Text>
              <Text style={styles.benefitText}>Conformité réglementaire</Text>
            </View>
          </View>
        </Animated.View>

        {/* Support */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.supportContainer}>
            <Text style={styles.supportTitle}>Besoin d'aide ?</Text>
            <Text style={styles.supportDescription}>
              Notre équipe de support est disponible 24/7 pour vous accompagner
            </Text>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={handleSupportPress}
            >
              <Text style={styles.supportButtonText}>Contacter le support</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View style={[styles.actionContainer, { opacity: fadeAnim }]}>
        {isKYCStarted() ? (
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={handleContinueKYC}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Chargement...' : 'Continuer la vérification'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={handleStartKYC}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Démarrage...' : 'Commencer la vérification'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Plus tard</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepItemDisabled: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  documentsStepHighlight: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  stepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  stepEmoji: {
    fontSize: 20,
  },
  completedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  lockedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 10,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stepTitleDisabled: {
    color: '#8E8E93',
  },
  stepDuration: {
    fontSize: 12,
    color: '#999',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepDescriptionDisabled: {
    color: '#B8B8B8',
  },
  stepCompleted: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 5,
  },
  stepAvailable: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 5,
  },
  stepArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  arrowText: {
    fontSize: 16,
    color: '#007AFF',
  },
  requirementsContainer: {
    marginTop: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  requirementIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checkIcon: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  requirementContent: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  requirementDescription: {
    fontSize: 14,
    color: '#666',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  supportContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  supportButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KYCWelcomeScreen;