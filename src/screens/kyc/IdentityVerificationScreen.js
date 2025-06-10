import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useKYC } from '../../context/KYCContext';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const IdentityVerificationScreen = ({ navigation }) => {
  const { uploadDocument, verifyIdentity, isLoading } = useKYC();
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [capturedDocuments, setCapturedDocuments] = useState({});
  const [verificationStep, setVerificationStep] = useState('document_selection');

  const documentTypes = [
    {
      id: 'national_id',
      title: 'Carte d\'Identité Nationale (CIN)',
      icon: 'credit-card',
    },
    {
      id: 'passport',
      title: 'Passeport',
      icon: 'book',
    },
    {
      id: 'driving_license',
      title: 'Permis de conduire',
      icon: 'drive-eta',
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
    // Simulate NFC verification process
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
    <View style={styles.content}>
      <View style={styles.instructionContainer}>
        <Icon name="credit-card" size={80} color={colors.secondary} />
        <Text style={styles.title}>
          Choisissez le document à renseigner.
        </Text>
      </View>

      <View style={styles.documentOptions}>
        {documentTypes.map((docType) => (
          <TouchableOpacity
            key={docType.id}
            style={styles.documentOption}
            onPress={() => handleDocumentTypeSelect(docType.id)}
          >
            <Icon name={docType.icon} size={24} color={colors.primary} />
            <Text style={styles.documentOptionText}>{docType.title}</Text>
            <Icon name="chevron-right" size={24} color={colors.gray} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNFCVerification = () => (
    <View style={styles.content}>
      <View style={styles.instructionContainer}>
        <Icon name="nfc" size={80} color={colors.secondary} />
        <Text style={styles.title}>Scannez votre puce NFC.</Text>
        <Text style={styles.subtitle}>
          Collez votre téléphone au dessus de votre pièce d'identité pour vérifier votre document.
        </Text>
      </View>

      <View style={styles.nfcAnimation}>
        {/* Add NFC animation component here */}
        <View style={styles.nfcIndicator}>
          <Icon name="wifi" size={40} color={colors.secondary} />
        </View>
      </View>

      <Button
        title="Continuer sans NFC"
        variant="outline"
        onPress={() => setVerificationStep('selfie_capture')}
        style={styles.skipButton}
      />
    </View>
  );

  const renderSelfieInstruction = () => (
    <View style={styles.content}>
      <View style={styles.instructionContainer}>
        <Icon name="camera-alt" size={80} color={colors.secondary} />
        <Text style={styles.title}>
          Pour protéger votre sécurité et celle de votre entreprise, vérifions votre identité.
        </Text>
        <Text style={styles.subtitle}>
          Vos données sont sécurisées et jamais partagées sans consentement.
        </Text>
      </View>

      <View style={styles.verificationSteps}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={() => {/* Navigate to document photo */}}
        >
          <Icon name="credit-card" size={24} color={colors.primary} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Photographiez votre pièce d'identité</Text>
            <Text style={styles.stepSubtitle}>Pour vérifier que vos informations sont correctes.</Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stepButton}
          onPress={handleSelfieCapture}
        >
          <Icon name="face" size={24} color={colors.primary} />
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>Prenez un selfie de vous-même</Text>
            <Text style={styles.stepSubtitle}>
              Pour vérifier que vous correspondez bien à la photo de votre pièce d'identité.
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.gray} />
        </TouchableOpacity>
      </View>
    </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={
          verificationStep === 'document_selection' 
            ? 'Choisissez le document'
            : verificationStep === 'nfc_verification'
            ? 'Vérification NFC'
            : 'Vérification d\'identité'
        }
        onLeftPress={() => navigation.goBack()}
        backgroundColor={colors.primary}
      />

      {getCurrentStepContent()}

      {verificationStep === 'nfc_verification' && (
        <View style={styles.footer}>
          <Button
            title="Scanner la puce NFC"
            onPress={handleNFCVerification}
            loading={isLoading}
            style={styles.nfcButton}
          />
        </View>
      )}
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
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  documentOptions: {
    marginTop: spacing.xl,
  },
  documentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  documentOptionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textDark,
    marginLeft: spacing.md,
  },
  nfcAnimation: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  nfcIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(135, 206, 235, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationSteps: {
    marginTop: spacing.xl,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  stepInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textDark,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  nfcButton: {
    // Button styles
  },
  skipButton: {
    marginTop: spacing.xl,
  },
});

export default IdentityVerificationScreen;