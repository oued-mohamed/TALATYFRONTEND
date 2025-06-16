import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useKYC } from '../../context/KYCContext';

const { width, height } = Dimensions.get('window');

const IdentityVerificationScreen = ({ navigation }) => {
  const { uploadDocument, verifyIdentity, isLoading } = useKYC();
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [capturedDocuments, setCapturedDocuments] = useState({});
  const [verificationStep, setVerificationStep] = useState('document_selection');
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Entrance animation
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for interactive elements
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

  const documentTypes = [
    {
      id: 'national_id',
      title: 'Carte d\'Identité Nationale',
      subtitle: 'CIN',
      icon: '🆔',
      gradient: ['#667eea', '#764ba2'],
      description: 'Document officiel d\'identité',
    },
    {
      id: 'passport',
      title: 'Passeport',
      subtitle: 'International',
      icon: '📘',
      gradient: ['#f093fb', '#f5576c'],
      description: 'Document de voyage international',
    },
    {
      id: 'driving_license',
      title: 'Permis de Conduire',
      subtitle: 'Licence',
      icon: '🚗',
      gradient: ['#4facfe', '#00f2fe'],
      description: 'Permis de conduire valide',
    },
  ];

  const handleDocumentTypeSelect = (documentType) => {
    setSelectedDocumentType(documentType);
    setShowDocumentPicker(false);
    launchDocumentCamera(documentType);
  };

  const launchDocumentCamera = (documentType) => {
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      maxWidth: 1500,
      maxHeight: 1500,
      cameraType: 'back',
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        handleDocumentCapture(documentType, response.assets[0]);
      }
    });
  };

  const handleDocumentCapture = async (documentType, imageData) => {
    try {
      const result = await uploadDocument(documentType, imageData);
      
      if (result.success) {
        setCapturedDocuments(prev => ({
          ...prev,
          [documentType]: result.document
        }));
        
        if (documentType === 'national_id' || documentType === 'passport' || documentType === 'driving_license') {
          setVerificationStep('nfc_verification');
        }
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec du téléchargement du document');
    }
  };

  const handleNFCVerification = () => {
    setTimeout(() => {
      setVerificationStep('selfie_capture');
    }, 3000);
  };

  const handleSelfieCapture = () => {
    navigation.navigate('Selfie', {
      onSelfieCapture: (selfieData) => {
        handleIdentityVerification(selfieData);
      }
    });
  };

  const handleIdentityVerification = async (selfieData) => {
    try {
      const idDocument = capturedDocuments[selectedDocumentType];
      const selfieResult = await uploadDocument('selfie', selfieData);
      
      if (selfieResult.success) {
        const verificationResult = await verifyIdentity(
          idDocument._id,
          selfieResult.document._id
        );
        
        if (verificationResult.success) {
          navigation.navigate('PhoneVerification');
        } else {
          Alert.alert('Erreur', verificationResult.message);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la vérification d\'identité');
    }
  };

  const renderDocumentSelection = () => (
    <Animated.View 
      style={[
        styles.content, 
        { 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
        }
      ]}
    >
      <View style={styles.heroSection}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.heroIcon}>📄</Text>
        </Animated.View>
        <Text style={styles.heroTitle}>
          Choisissez votre document
        </Text>
        <Text style={styles.heroSubtitle}>
          Sélectionnez le type de document que vous souhaitez utiliser pour votre vérification
        </Text>
      </View>

      <View style={styles.documentsGrid}>
        {documentTypes.map((docType, index) => (
          <Animated.View
            key={docType.id}
            style={[
              styles.documentCard,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 50 + (index * 20)],
                  })
                }],
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.documentButton, { backgroundColor: docType.gradient[0] }]}
              onPress={() => handleDocumentTypeSelect(docType.id)}
              activeOpacity={0.8}
            >
              <View style={styles.documentIconWrapper}>
                <Text style={styles.documentIcon}>{docType.icon}</Text>
              </View>
              
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{docType.title}</Text>
                <Text style={styles.documentSubtitle}>{docType.subtitle}</Text>
                <Text style={styles.documentDescription}>{docType.description}</Text>
              </View>
              
              <View style={styles.documentArrow}>
                <Icon name="arrow-forward-ios" size={16} color="rgba(255,255,255,0.8)" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Icon name="info" size={20} color="#67e8f9" />
        <Text style={styles.infoText}>
          Assurez-vous que votre document est valide et que toutes les informations sont clairement visibles
        </Text>
      </View>
    </Animated.View>
  );

  const renderNFCVerification = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
      <View style={styles.nfcContainer}>
        <Animated.View style={[styles.nfcAnimation, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.nfcWaves}>
            <View style={[styles.wave, styles.wave1]} />
            <View style={[styles.wave, styles.wave2]} />
            <View style={[styles.wave, styles.wave3]} />
          </View>
          <View style={styles.nfcIcon}>
            <Icon name="nfc" size={40} color="#fff" />
          </View>
        </Animated.View>
        
        <Text style={styles.nfcTitle}>Vérification NFC</Text>
        <Text style={styles.nfcSubtitle}>
          Placez votre téléphone sur la puce de votre document pour une vérification sécurisée
        </Text>
        
        <View style={styles.nfcSteps}>
          <View style={styles.nfcStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Activez le NFC</Text>
          </View>
          <View style={styles.nfcStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Placez le document</Text>
          </View>
          <View style={styles.nfcStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Maintenez contact</Text>
          </View>
        </View>
      </View>

      <View style={styles.nfcActions}>
        <TouchableOpacity
          style={styles.nfcButton}
          onPress={handleNFCVerification}
          disabled={isLoading}
        >
          <Icon name="nfc" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.nfcButtonText}>
            {isLoading ? 'Scan en cours...' : 'Scanner la puce NFC'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => setVerificationStep('selfie_capture')}
        >
          <Text style={styles.skipButtonText}>Continuer sans NFC</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSelfieInstruction = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
      <View style={styles.selfieContainer}>
        <Animated.View style={[styles.selfieIcon, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.selfieEmoji}>🤳</Text>
        </Animated.View>
        
        <Text style={styles.selfieTitle}>Vérification par selfie</Text>
        <Text style={styles.selfieSubtitle}>
          Prenez une photo de votre visage pour confirmer votre identité
        </Text>
      </View>

      <View style={styles.verificationSteps}>
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => {/* Navigate to document photo */}}
        >
          <View style={styles.stepIconContainer}>
            <Icon name="credit-card" size={24} color="#67e8f9" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Photo du document</Text>
            <Text style={styles.stepDescription}>
              Vérifiez que votre document est bien lisible
            </Text>
          </View>
          <View style={styles.stepStatus}>
            <Icon name="check-circle" size={20} color="#10b981" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stepCard}
          onPress={handleSelfieCapture}
        >
          <View style={styles.stepIconContainer}>
            <Icon name="face" size={24} color="#0ea5e9" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Selfie de vérification</Text>
            <Text style={styles.stepDescription}>
              Prenez une photo claire de votre visage
            </Text>
          </View>
          <View style={styles.stepArrow}>
            <Icon name="arrow-forward-ios" size={16} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.securityNote}>
        <Icon name="security" size={20} color="#10b981" />
        <Text style={styles.securityText}>
          Vos données sont protégées et chiffrées selon les normes bancaires
        </Text>
      </View>
    </Animated.View>
  );

  const getCurrentStepContent = () => {
    switch (verificationStep) {
      case 'document_selection':
        return renderDocumentSelection();
      case 'nfc_verification':
        return renderNFCVerification();
      case 'selfie_capture':
        return renderSelfieInstruction();
      default:
        return renderDocumentSelection();
    }
  };

  const getHeaderTitle = () => {
    switch (verificationStep) {
      case 'document_selection':
        return 'Vérification d\'identité';
      case 'nfc_verification':
        return 'Vérification NFC';
      case 'selfie_capture':
        return 'Photo de vérification';
      default:
        return 'Vérification d\'identité';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          
          <View style={styles.headerRight}>
            <View style={styles.progressIndicator}>
              <Text style={styles.progressText}>
                {verificationStep === 'document_selection' ? '1' : 
                 verificationStep === 'nfc_verification' ? '2' : '3'}/3
              </Text>
            </View>
          </View>
        </View>

        {getCurrentStepContent()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  progressIndicator: {
    backgroundColor: 'rgba(6,182,212,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  progressText: {
    fontSize: 12,
    color: '#67e8f9',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  
  // Documents Grid
  documentsGrid: {
    marginBottom: 30,
  },
  documentCard: {
    marginBottom: 15,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  documentIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  documentIcon: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  documentSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  documentArrow: {
    marginLeft: 10,
  },
  
  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
    borderLeftColor: '#67e8f9',
  },
  infoText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  
  // NFC Verification
  nfcContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    flex: 1,
    justifyContent: 'center',
  },
  nfcAnimation: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  nfcWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wave: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(103,232,249,0.3)',
  },
  wave1: {
    width: 60,
    height: 60,
    top: 30,
    left: 30,
  },
  wave2: {
    width: 90,
    height: 90,
    top: 15,
    left: 15,
  },
  wave3: {
    width: 120,
    height: 120,
    top: 0,
    left: 0,
  },
  nfcIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  nfcTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  nfcSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  nfcSteps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  nfcStep: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0ea5e9',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  stepText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  nfcActions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nfcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  buttonIcon: {
    marginRight: 8,
  },
  nfcButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 25,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#67e8f9',
    fontWeight: '600',
  },
  
  // Selfie Section
  selfieContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  selfieIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selfieEmoji: {
    fontSize: 40,
  },
  selfieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  selfieSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  
  // Verification Steps
  verificationSteps: {
    marginBottom: 30,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  stepStatus: {
    marginLeft: 10,
  },
  stepArrow: {
    marginLeft: 10,
  },
  
  // Security Note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  securityText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});

export default IdentityVerificationScreen;