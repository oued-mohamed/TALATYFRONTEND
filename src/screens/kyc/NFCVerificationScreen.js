import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { useKYC } from '../../context/KYCContext';

const { width, height } = Dimensions.get('window');

const NFCVerificationScreen = ({ navigation }) => {
  const { kycData, setKycData, setStep } = useKYC();
  const [nfcStatus, setNfcStatus] = useState('idle'); // idle, scanning, reading, success, error
  const [isNFCAvailable, setIsNFCAvailable] = useState(false);
  const [isNFCEnabled, setIsNFCEnabled] = useState(false);
  const [readData, setReadData] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Vérifier la disponibilité NFC
    checkNFCAvailability();
    
    return () => {
      // Nettoyer les listeners NFC
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (nfcStatus === 'scanning') {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [nfcStatus]);

  const checkNFCAvailability = async () => {
    try {
      // Simuler la vérification NFC (remplacer par vraie logique NFC)
      if (Platform.OS === 'android') {
        setIsNFCAvailable(true);
        setIsNFCEnabled(true);
      } else {
        setIsNFCAvailable(false);
      }
    } catch (error) {
      console.log('NFC check error:', error);
      setIsNFCAvailable(false);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const startNFCReading = async () => {
    if (!isNFCAvailable) {
      Alert.alert(
        'NFC non disponible',
        'Votre appareil ne supporte pas la technologie NFC ou elle n\'est pas activée.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isNFCEnabled) {
      Alert.alert(
        'NFC désactivé',
        'Veuillez activer la fonction NFC dans les paramètres de votre appareil.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Paramètres', onPress: openNFCSettings },
        ]
      );
      return;
    }

    setNfcStatus('scanning');
    
    try {
      // Simuler la lecture NFC (remplacer par vraie logique NFC)
      await simulateNFCReading();
    } catch (error) {
      console.log('NFC reading error:', error);
      setNfcStatus('error');
      Alert.alert(
        'Erreur de lecture',
        'Impossible de lire la puce NFC. Assurez-vous que votre document est compatible et réessayez.',
        [
          { text: 'Réessayer', onPress: () => setNfcStatus('idle') },
          { text: 'Passer', onPress: handleSkipNFC },
        ]
      );
    }
  };

  const simulateNFCReading = async () => {
    // Simuler le processus de lecture NFC
    setNfcStatus('reading');
    
    // Simuler un délai de lecture
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simuler des données lues
    const mockData = {
      documentNumber: 'FR123456789',
      firstName: 'Jean',
      lastName: 'Dupont',
      dateOfBirth: '1990-06-15',
      nationality: 'French',
      expiryDate: '2030-12-31',
      verified: true,
    };
    
    setReadData(mockData);
    setNfcStatus('success');
    
    // Mettre à jour les données KYC
    setKycData(prev => ({
      ...prev,
      nfcVerified: true,
      nfcData: mockData,
    }));
  };

  const openNFCSettings = () => {
    // Ouvrir les paramètres NFC (implémentation spécifique à la plateforme)
    Alert.alert('Information', 'Veuillez activer NFC dans : Paramètres > Connexions > NFC');
  };

  const handleSkipNFC = () => {
    Alert.alert(
      'Passer la vérification NFC',
      'Vous pouvez continuer sans la vérification NFC, mais certaines fonctionnalités pourraient être limitées.',
      [
        { text: 'Retour', style: 'cancel' },
        { text: 'Continuer sans NFC', onPress: () => navigation.navigate('PhoneVerification') },
      ]
    );
  };

  const handleContinue = () => {
    setStep(prev => prev + 1);
    navigation.navigate('PhoneVerification');
  };

  const cleanup = () => {
    // Nettoyer les listeners NFC
    setNfcStatus('idle');
  };

  const renderNFCInstructions = () => (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsTitle}>Comment procéder :</Text>
      <View style={styles.instructionItem}>
        <Text style={styles.instructionNumber}>1</Text>
        <Text style={styles.instructionText}>
          Assurez-vous que la fonction NFC est activée sur votre appareil
        </Text>
      </View>
      <View style={styles.instructionItem}>
        <Text style={styles.instructionNumber}>2</Text>
        <Text style={styles.instructionText}>
          Placez votre document d'identité sur le dos de votre téléphone
        </Text>
      </View>
      <View style={styles.instructionItem}>
        <Text style={styles.instructionNumber}>3</Text>
        <Text style={styles.instructionText}>
          Maintenez le document stable pendant la lecture
        </Text>
      </View>
      <View style={styles.instructionItem}>
        <Text style={styles.instructionNumber}>4</Text>
        <Text style={styles.instructionText}>
          Attendez que la lecture soit terminée
        </Text>
      </View>
    </View>
  );

  const renderScanningView = () => (
    <Animated.View style={[styles.scanningContainer, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.nfcIcon}>
        <Text style={styles.nfcIconText}>📡</Text>
      </View>
      <Text style={styles.scanningText}>
        {nfcStatus === 'scanning' ? 'Recherche de la puce NFC...' : 'Lecture en cours...'}
      </Text>
      <Text style={styles.scanningSubtext}>
        Maintenez votre document proche du téléphone
      </Text>
    </Animated.View>
  );

  const renderSuccessView = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✅</Text>
      </View>
      <Text style={styles.successTitle}>Lecture réussie !</Text>
      <Text style={styles.successSubtitle}>
        Les données de votre document ont été vérifiées avec succès
      </Text>
      
      {readData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Informations vérifiées :</Text>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Nom :</Text>
            <Text style={styles.dataValue}>{readData.firstName} {readData.lastName}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Date de naissance :</Text>
            <Text style={styles.dataValue}>{readData.dateOfBirth}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Nationalité :</Text>
            <Text style={styles.dataValue}>{readData.nationality}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>N° de document :</Text>
            <Text style={styles.dataValue}>{readData.documentNumber}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    switch (nfcStatus) {
      case 'scanning':
      case 'reading':
        return renderScanningView();
      case 'success':
        return renderSuccessView();
      default:
        return (
          <>
            <View style={styles.heroContainer}>
              <View style={styles.nfcLogo}>
                <Text style={styles.nfcLogoText}>📱</Text>
              </View>
              <Text style={styles.title}>Vérification NFC</Text>
              <Text style={styles.subtitle}>
                Utilisez la puce NFC de votre document d'identité pour une vérification plus rapide et sécurisée
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Avantages de la vérification NFC :</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⚡</Text>
                <Text style={styles.benefitText}>Vérification instantanée</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🔒</Text>
                <Text style={styles.benefitText}>Sécurité renforcée</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✨</Text>
                <Text style={styles.benefitText}>Données authentifiées</Text>
              </View>
            </View>

            {renderNFCInstructions()}

            {!isNFCAvailable && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  Votre appareil ne supporte pas la technologie NFC. 
                  Vous pouvez continuer sans cette vérification.
                </Text>
              </View>
            )}
          </>
        );
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification NFC</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {nfcStatus === 'success' ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continuer</Text>
          </TouchableOpacity>
        ) : nfcStatus === 'idle' ? (
          <>
            {isNFCAvailable && (
              <TouchableOpacity style={styles.primaryButton} onPress={startNFCReading}>
                <Text style={styles.primaryButtonText}>Commencer la lecture NFC</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipNFC}>
              <Text style={styles.secondaryButtonText}>
                {isNFCAvailable ? 'Passer cette étape' : 'Continuer sans NFC'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setNfcStatus('idle')}
          >
            <Text style={styles.secondaryButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  nfcLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  nfcLogoText: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  nfcIconText: {
    fontSize: 48,
  },
  scanningText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  scanningSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  dataContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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

export default NFCVerificationScreen;