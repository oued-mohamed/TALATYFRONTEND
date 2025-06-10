import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
// Remove this if you don't have react-native-vector-icons installed
// import Icon from 'react-native-vector-icons/MaterialIcons';

// Instead, let's use simple Text or emojis for icons
const Icon = ({ name, size, color, style }) => {
  const iconMap = {
    'check-circle': '✅',
    'upload-file': '📄',
    'camera-alt': '📷',
    'photo-library': '🖼️',
    'arrow-back': '←',
  };
  return (
    <Text style={[{ fontSize: size, color }, style]}>
      {iconMap[name] || '•'}
    </Text>
  );
};
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import { useKYC } from '../../context/KYCContext';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const DocumentUploadScreen = ({ navigation }) => {
  const { uploadDocument, isLoading } = useKYC();
  const [uploadProgress, setUploadProgress] = useState({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [ribNumber, setRibNumber] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState(new Set());

  const documents = [
    {
      type: 'business_registration',
      title: 'Registre de Commerce (Modèle J)',
      required: true,
      uploaded: false,
      fileName: 'RC.pdf',
    },
    {
      type: 'bank_statement',
      title: 'Relevés bancaires',
      subtitle: 'janvier 2025, février 2025, mars 2025',
      required: true,
      uploaded: false,
      multiple: true,
      months: ['janvier 2025', 'février 2025', 'mars 2025'],
      uploadedFiles: [],
    },
  ];

  const [documentsState, setDocumentsState] = useState(documents);

  useEffect(() => {
    // Initialize RIB with placeholder or existing value
    if (!ribNumber) {
      setRibNumber('000 - 000 - 0000000000000000 - 00');
    }
  }, []);

  const handleDocumentPress = (documentType) => {
    setSelectedDocumentType(documentType);
    setShowImagePicker(true);
  };

  const handleImagePicker = (option) => {
    setShowImagePicker(false);
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    const callback = (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        uploadDocumentFile(selectedDocumentType, response.assets[0]);
      }
    };

    if (option === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const uploadDocumentFile = async (documentType, fileData) => {
    try {
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      
      const result = await uploadDocument(documentType, fileData, (progress) => {
        setUploadProgress(prev => ({ ...prev, [documentType]: progress }));
      });
      
      if (result.success) {
        setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
        setUploadedDocuments(prev => new Set([...prev, documentType]));
        
        // Update documents state
        setDocumentsState(prev => prev.map(doc => {
          if (doc.type === documentType) {
            if (doc.multiple) {
              return {
                ...doc,
                uploadedFiles: [...(doc.uploadedFiles || []), fileData.fileName || 'document.pdf']
              };
            } else {
              return { ...doc, uploaded: true };
            }
          }
          return doc;
        }));
        
        Alert.alert('Succès', 'Document téléchargé avec succès');
      } else {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      Alert.alert('Erreur', 'Échec du téléchargement du document');
    }
  };

  const formatRIB = (text) => {
    // Remove all non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    // Limit to 24 digits
    const limited = numbers.substring(0, 24);
    
    // Format as XXX - XXX - XXXXXXXXXXXXXXXX - XX
    let formatted = '';
    if (limited.length > 0) {
      formatted += limited.substring(0, 3);
      if (limited.length > 3) {
        formatted += ' - ' + limited.substring(3, 6);
        if (limited.length > 6) {
          formatted += ' - ' + limited.substring(6, 22);
          if (limited.length > 22) {
            formatted += ' - ' + limited.substring(22, 24);
          }
        }
      }
    }
    
    return formatted;
  };

  const handleRIBChange = (text) => {
    const formatted = formatRIB(text);
    setRibNumber(formatted);
  };

  const isRIBValid = () => {
    const numbers = ribNumber.replace(/\D/g, '');
    return numbers.length === 24;
  };

  const areDocumentsUploaded = () => {
    return documentsState.every(doc => {
      if (doc.multiple) {
        return doc.uploadedFiles && doc.uploadedFiles.length > 0;
      }
      return doc.uploaded;
    });
  };

  const handleContinue = () => {
    if (!areDocumentsUploaded()) {
      Alert.alert('Documents manquants', 'Veuillez télécharger tous les documents requis avant de continuer.');
      return;
    }
    
    if (!isRIBValid()) {
      Alert.alert('RIB invalide', 'Veuillez saisir un RIB valide de 24 caractères.');
      return;
    }
    
    // Save RIB and continue to next step
    navigation.navigate('IdentityVerification');
  };

  const renderDocument = (document) => {
    const isUploaded = document.uploaded || (document.uploadedFiles && document.uploadedFiles.length > 0);
    const progressKey = document.type;
    const currentProgress = uploadProgress[progressKey] || 0;
    
    return (
      <View key={document.type} style={styles.documentSection}>
        <Text style={styles.documentTitle}>{document.title}</Text>
        
        {document.multiple ? (
          <View style={styles.multipleDocumentsContainer}>
            {document.months.map((month, index) => {
              const monthUploaded = document.uploadedFiles && document.uploadedFiles.length > index;
              return (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthUploadCard,
                    monthUploaded && styles.monthUploadCardUploaded
                  ]}
                  onPress={() => handleDocumentPress(document.type)}
                >
                  <View style={styles.monthUploadContent}>
                    <View style={styles.uploadIcon}>
                      <Icon
                        name={monthUploaded ? "check-circle" : "upload-file"}
                        size={24}
                        color={monthUploaded ? colors.success : colors.gray}
                      />
                    </View>
                    <Text style={[
                      styles.monthText,
                      monthUploaded && styles.monthTextUploaded
                    ]}>
                      {month}
                    </Text>
                    {monthUploaded && (
                      <View style={styles.uploadSuccessIndicator}>
                        <Text style={styles.successPercentage}>100%</Text>
                        <View style={styles.progressBarSmall}>
                          <View style={[styles.progressFillSmall, { width: '100%' }]} />
                        </View>
                        <Text style={styles.uploadedFileName}>
                          {document.uploadedFiles[index] || 'releve-janvier.pdf'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.singleDocumentCard,
              isUploaded && styles.singleDocumentCardUploaded
            ]}
            onPress={() => handleDocumentPress(document.type)}
          >
            <View style={styles.singleDocumentContent}>
              <View style={styles.uploadIcon}>
                <Icon
                  name={isUploaded ? "check-circle" : "upload-file"}
                  size={24}
                  color={isUploaded ? colors.success : colors.gray}
                />
              </View>
              {isUploaded ? (
                <View style={styles.uploadedInfo}>
                  <Text style={styles.successPercentage}>100%</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: '100%' }]} />
                  </View>
                  <Text style={styles.uploadedFileName}>{document.fileName}</Text>
                </View>
              ) : (
                <Text style={styles.uploadPlaceholder}>Appuyez pour télécharger</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        
        {currentProgress > 0 && currentProgress < 100 && (
          <View style={styles.uploadProgress}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${currentProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{currentProgress}%</Text>
          </View>
        )}
      </View>
    );
  };

  const renderRIBSection = () => (
    <View style={styles.ribSection}>
      <Text style={styles.ribTitle}>Votre RIB (24 caractères)</Text>
      <View style={styles.ribInputContainer}>
        <TextInput
          style={[
            styles.ribInput,
            !isRIBValid() && ribNumber.replace(/\D/g, '').length > 0 && styles.ribInputError
          ]}
          value={ribNumber}
          onChangeText={handleRIBChange}
          placeholder="000 - 000 - 0000000000000000 - 00"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
          maxLength={29} // Account for dashes and spaces
        />
        {isRIBValid() && (
          <View style={styles.ribValidIcon}>
            <Icon name="check-circle" size={20} color={colors.success} />
          </View>
        )}
      </View>
      {!isRIBValid() && ribNumber.replace(/\D/g, '').length > 0 && (
        <Text style={styles.ribErrorText}>
          Le RIB doit contenir exactement 24 chiffres
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Téléchargez vos documents."
        onLeftPress={() => navigation.goBack()}
        backgroundColor={colors.primary}
        // Remove leftIcon and titleStyle if your Header doesn't support them
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.documentsSection}>
          {documentsState.map(renderDocument)}
        </View>

        {renderRIBSection()}
        
        <View style={styles.spacing} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="CONTINUER"
          onPress={handleContinue}
          disabled={isLoading || !areDocumentsUploaded() || !isRIBValid()}
          loading={isLoading}
          style={[
            styles.continueButton,
            (!areDocumentsUploaded() || !isRIBValid()) && styles.continueButtonDisabled
          ]}
        />
      </View>

      <Modal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        title="Choisir une option"
      >
        <View style={styles.imagePickerOptions}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleImagePicker('camera')}
          >
            <Icon name="camera-alt" size={24} color={colors.primary} />
            <Text style={styles.optionText}>Prendre une photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleImagePicker('gallery')}
          >
            <Icon name="photo-library" size={24} color={colors.primary} />
            <Text style={styles.optionText}>Choisir dans la galerie</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  documentsSection: {
    marginTop: spacing.lg,
  },
  documentSection: {
    marginBottom: spacing.xl,
  },
  documentTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    marginBottom: spacing.md,
  },
  singleDocumentCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  singleDocumentCardUploaded: {
    borderColor: colors.success,
    backgroundColor: '#f0fff4',
  },
  singleDocumentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  multipleDocumentsContainer: {
    gap: spacing.md,
  },
  monthUploadCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.base,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  monthUploadCardUploaded: {
    borderColor: colors.success,
    borderStyle: 'solid',
    backgroundColor: '#f0fff4',
  },
  monthUploadContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadIcon: {
    marginRight: spacing.md,
  },
  monthText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    textAlign: 'center',
  },
  monthTextUploaded: {
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  uploadSuccessIndicator: {
    alignItems: 'center',
    width: '100%',
  },
  uploadedInfo: {
    flex: 1,
    alignItems: 'center',
  },
  successPercentage: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarSmall: {
    width: '80%',
    height: 4,
    backgroundColor: colors.progressBackground,
    borderRadius: 2,
    marginVertical: spacing.xs,
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  uploadedFileName: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  uploadPlaceholder: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textDark,
    textAlign: 'center',
  },
  uploadProgress: {
    marginTop: spacing.md,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    textAlign: 'center',
  },
  ribSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  ribTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    marginBottom: spacing.md,
  },
  ribInputContainer: {
    position: 'relative',
  },
  ribInput: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.base,
    padding: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.textDark,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ribInputError: {
    borderColor: colors.error,
  },
  ribValidIcon: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  ribErrorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  spacing: {
    height: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  continueButton: {
    backgroundColor: colors.buttonPrimary,
  },
  continueButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },
  imagePickerOptions: {
    paddingVertical: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.base,
    marginBottom: spacing.md,
    backgroundColor: colors.lightGray,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.textDark,
    marginLeft: spacing.md,
  },
});

export default DocumentUploadScreen;