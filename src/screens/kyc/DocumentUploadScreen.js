import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useKYC } from '../../context/KYCContext';

const { width, height } = Dimensions.get('window');

const DocumentUploadScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { updateKYCStep } = useKYC();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    legal: true,
    fiscal: true,
    financial: true,
    business: false,
    additional: false
  });
  const [ribNumber, setRibNumber] = useState('000 - 000 - 00000000000000000 - 00');
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [progressAnim] = useState(new Animated.Value(0));

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
    ]).start();

    // Progress animation
    const progress = getRequiredDocumentsCount();
    Animated.timing(progressAnim, {
      toValue: progress.total > 0 ? progress.uploaded / progress.total : 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [uploadedFiles]);

  const documentTypes = [
    {
      id: 'business_registration',
      title: 'Registre de Commerce (Modèle J)',
      description: 'Document officiel d\'enregistrement de votre entreprise',
      icon: '🏢',
      required: true,
      maxSize: '5 MB',
      formats: ['.pdf', '.jpg', '.png'],
      gradient: ['#667eea', '#764ba2'],
      category: 'legal',
    },
    {
      id: 'tax_certificate',
      title: 'Certificat fiscal',
      description: 'Attestation fiscale de votre entreprise',
      icon: '🧾',
      required: true,
      maxSize: '5 MB',
      formats: ['.pdf', '.jpg', '.png'],
      gradient: ['#f093fb', '#f5576c'],
      category: 'fiscal',
    },
    {
      id: 'bank_statements',
      title: 'Relevés bancaires',
      description: 'Derniers relevés bancaires (3 derniers mois)',
      icon: '💳',
      required: true,
      maxSize: '10 MB',
      formats: ['.pdf', '.jpg', '.png'],
      gradient: ['#4facfe', '#00f2fe'],
      category: 'financial',
      multipleFiles: ['file1', 'file2', 'file3']
    },
    {
      id: 'financial_statements',
      title: 'États financiers',
      description: 'Bilans comptables et comptes de résultat',
      icon: '📈',
      required: false,
      maxSize: '10 MB',
      formats: ['.pdf', '.xlsx', '.xls', '.doc', '.docx'],
      gradient: ['#43e97b', '#38f9d7'],
      category: 'financial',
    },
    {
      id: 'business_plan',
      title: 'Plan d\'affaires',
      description: 'Document présentant votre projet (optionnel)',
      icon: '📊',
      required: false,
      maxSize: '15 MB',
      formats: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
      gradient: ['#fa709a', '#fee140'],
      category: 'business',
    },
    {
      id: 'other_documents',
      title: 'Autres documents',
      description: 'Tout autre document justificatif',
      icon: '📄',
      required: false,
      maxSize: '10 MB',
      formats: ['.pdf', '.jpg', '.png', '.doc', '.docx', '.xlsx'],
      gradient: ['#a8edea', '#fed6e3'],
      category: 'additional',
    }
  ];

  const isValidFileType = (fileName, allowedFormats) => {
    const fileExtension = '.' + fileName.split('.').pop().toLowerCase();
    return allowedFormats.includes(fileExtension);
  };

  const isValidFileSize = (fileSize, maxSizeStr) => {
    const maxSizeBytes = parseFloat(maxSizeStr) * 1024 * 1024;
    return fileSize <= maxSizeBytes;
  };

  const handleFileSelect = (documentType, specificFile = null) => {
    if (Platform.OS === 'web') {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = documentType.formats.join(',');
        input.multiple = !specificFile;

        input.onchange = (event) => {
          const files = Array.from(event.target.files);
          handleFilesSelected(files, documentType, specificFile);
        };

        input.click();
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le sélecteur de fichiers');
      }
    } else {
      Alert.alert(
        'Mobile Upload',
        'File upload for mobile needs react-native-document-picker implementation',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFilesSelected = async (files, documentType, specificFile = null) => {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (!isValidFileType(file.name, documentType.formats)) {
        const error = `${file.name}: Format non supporté. Formats acceptés: ${documentType.formats.join(', ')}`;
        errors.push(error);
        continue;
      }

      if (!isValidFileSize(file.size, documentType.maxSize)) {
        const error = `${file.name}: Fichier trop volumineux. Taille max: ${documentType.maxSize}`;
        errors.push(error);
        continue;
      }

      const validFile = {
        id: `${documentType.id}_${Date.now()}_${Math.random()}`,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        documentType: documentType.id,
        documentTitle: documentType.title,
        specificFile: specificFile,
        uploadedAt: new Date(),
        status: 'pending',
        uploadProgress: 0,
      };
      
      validFiles.push(validFile);
    }

    if (errors.length > 0) {
      Alert.alert(
        'Erreurs de validation',
        errors.join('\n\n'),
        [{ text: 'OK' }]
      );
    }

    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        file.status = 'uploading';
        setUploadedFiles(prev => [...prev, file]);

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, uploadProgress: progress }
                : f
            )
          );
        }

        // Complete upload
        file.status = 'completed';
        file.uploadProgress = 100;
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', uploadProgress: 100 }
              : f
          )
        );
      }

      Alert.alert(
        'Upload réussi',
        `${files.length} fichier(s) téléchargé(s) avec succès`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du téléchargement des fichiers');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId) => {
    Alert.alert(
      'Supprimer le fichier',
      'Êtes-vous sûr de vouloir supprimer ce fichier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadedFilesForType = (docType, specificFile = null) => {
    return uploadedFiles.filter(file => 
      file.documentType === docType && 
      (!specificFile || file.specificFile === specificFile)
    );
  };

  const getRequiredDocumentsCount = () => {
    const requiredTypes = documentTypes.filter(doc => doc.required);
    const uploadedRequiredTypes = new Set();
    
    requiredTypes.forEach(docType => {
      if (docType.multipleFiles) {
        // For bank statements, check if all 3 files are uploaded
        const allFilesUploaded = docType.multipleFiles.every(fileName => 
          uploadedFiles.some(file => 
            file.documentType === docType.id && 
            file.specificFile === fileName && 
            file.status === 'completed'
          )
        );
        if (allFilesUploaded) {
          uploadedRequiredTypes.add(docType.id);
        }
      } else {
        // For other documents, check if at least one file is uploaded
        const hasFile = uploadedFiles.some(file => 
          file.documentType === docType.id && file.status === 'completed'
        );
        if (hasFile) {
          uploadedRequiredTypes.add(docType.id);
        }
      }
    });
    
    return { uploaded: uploadedRequiredTypes.size, total: requiredTypes.length };
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleContinue = async () => {
    const { uploaded, total } = getRequiredDocumentsCount();
    
    if (uploaded < total) {
      Alert.alert(
        'Documents requis manquants',
        `Veuillez télécharger tous les documents requis (${uploaded}/${total} complétés)`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await updateKYCStep('document_upload', {
        documents: uploadedFiles.filter(f => f.status === 'completed'),
        completedAt: new Date()
      });

      Alert.alert(
        'Documents téléchargés',
        'Vos documents ont été téléchargés avec succès !',
        [
          {
            text: 'Continuer',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les documents');
    }
  };

  const requiredProgress = getRequiredDocumentsCount();
  const progressPercentage = requiredProgress.total > 0 ? (requiredProgress.uploaded / requiredProgress.total) * 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Téléchargez vos documents</Text>
        
        <View style={styles.headerRight}>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {requiredProgress.uploaded}/{requiredProgress.total}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
        <Text style={styles.progressTitle}>
          Progression des documents requis
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
        </View>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.description}>
            📁 Téléchargez vos documents professionnels pour finaliser votre vérification. 
            Les documents marqués d'une étoile (*) sont obligatoires.
          </Text>

          {/* Document Categories */}
          {['legal', 'fiscal', 'financial', 'business', 'additional'].map((category, categoryIndex) => {
            const categoryDocs = documentTypes.filter(doc => doc.category === category);
            if (categoryDocs.length === 0) return null;

            const categoryTitles = {
              legal: '⚖️ Documents légaux',
              fiscal: '💰 Documents fiscaux', 
              financial: '📊 Documents financiers',
              business: '🚀 Plan d\'affaires',
              additional: '📄 Documents supplémentaires'
            };

            return (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity 
                  style={styles.categoryHeader}
                  onPress={() => toggleSection(category)}
                >
                  <Text style={styles.categoryTitle}>{categoryTitles[category]}</Text>
                  <Icon 
                    name={expandedSections[category] ? "expand-less" : "expand-more"} 
                    size={24} 
                    color="#94a3b8" 
                  />
                </TouchableOpacity>

                {(expandedSections[category] !== false) && categoryDocs.map((docType, index) => {
                  const uploadedForType = getUploadedFilesForType(docType.id);
                  const hasUploaded = uploadedForType.length > 0;
                  
                  return (
                    <Animated.View
                      key={docType.id}
                      style={[
                        styles.documentCard,
                        {
                          transform: [{
                            translateX: slideAnim.interpolate({
                              inputRange: [0, 30],
                              outputRange: [0, 30 + (index * 10)],
                            })
                          }],
                        }
                      ]}
                    >
                      {/* Document Header */}
                      <View style={[styles.documentHeader, { backgroundColor: docType.gradient[0] }]}>
                        <View style={styles.documentIconContainer}>
                          <Text style={styles.documentIcon}>{docType.icon}</Text>
                        </View>
                        
                        <View style={styles.documentInfo}>
                          <View style={styles.documentTitleRow}>
                            <Text style={styles.documentTitle}>
                              {docType.title}
                            </Text>
                            {docType.required && <Text style={styles.requiredStar}>*</Text>}
                            {hasUploaded && (
                              <View style={styles.uploadedBadge}>
                                <Icon name="check-circle" size={16} color="#fff" />
                              </View>
                            )}
                          </View>
                          <Text style={styles.documentDescription}>
                            {docType.description}
                          </Text>
                          <Text style={styles.documentSpecs}>
                            📏 Max: {docType.maxSize} • 📋 {docType.formats.join(', ')}
                          </Text>
                        </View>
                      </View>

                      {/* Special handling for bank statements */}
                      {docType.multipleFiles ? (
                        <View style={styles.bankStatementsContainer}>
                          {docType.multipleFiles.map((fileName, fileIndex) => {
                            const fileUploaded = getUploadedFilesForType(docType.id, fileName);
                            const hasFile = fileUploaded.length > 0;
                            
                            return (
                              <View key={fileName} style={styles.bankFileCard}>
                                <View style={styles.bankFileHeader}>
                                  <Text style={styles.bankFileIcon}>💳</Text>
                                  <Text style={styles.bankFileName}>{fileName}</Text>
                                </View>
                                
                                {hasFile ? (
                                  <View>
                                    {fileUploaded.map(file => (
                                      <View key={file.id} style={styles.uploadedFileContainer}>
                                        <View style={styles.uploadedFileInfo}>
                                          <Text style={styles.uploadedFileName}>{file.name}</Text>
                                          <Text style={styles.uploadedFileSize}>{formatFileSize(file.size)}</Text>
                                          
                                          {file.status === 'uploading' && (
                                            <View style={styles.uploadProgressBank}>
                                              <View style={styles.progressBarSmallBank}>
                                                <View 
                                                  style={[
                                                    styles.progressFillSmallBank,
                                                    { width: `${file.uploadProgress || 0}%` }
                                                  ]} 
                                                />
                                              </View>
                                              <Text style={styles.uploadProgressTextBank}>
                                                {file.uploadProgress || 0}%
                                              </Text>
                                            </View>
                                          )}
                                          
                                          {file.status === 'completed' && (
                                            <View style={styles.fileStatusContainerBank}>
                                              <Icon name="check-circle" size={14} color="#10b981" />
                                              <Text style={styles.fileStatusCompletedBank}>Téléchargé</Text>
                                            </View>
                                          )}
                                        </View>
                                        
                                        {file.status === 'completed' && (
                                          <TouchableOpacity
                                            style={styles.removeButtonBank}
                                            onPress={() => removeFile(file.id)}
                                          >
                                            <Icon name="delete" size={18} color="#ef4444" />
                                          </TouchableOpacity>
                                        )}
                                      </View>
                                    ))}
                                    
                                    <TouchableOpacity
                                      style={styles.replaceButton}
                                      onPress={() => handleFileSelect(docType, fileName)}
                                      disabled={isUploading}
                                    >
                                      <Icon name="add" size={16} color="#06b6d4" />
                                      <Text style={styles.replaceButtonText}>Remplacer</Text>
                                    </TouchableOpacity>
                                  </View>
                                ) : (
                                  <TouchableOpacity
                                    style={styles.bankUploadButton}
                                    onPress={() => handleFileSelect(docType, fileName)}
                                    disabled={isUploading}
                                  >
                                    {isUploading ? (
                                      <View style={styles.uploadingContainer}>
                                        <Icon name="hourglass-empty" size={16} color="#fff" />
                                        <Text style={styles.bankUploadButtonText}>Upload...</Text>
                                      </View>
                                    ) : (
                                      <View style={styles.uploadingContainer}>
                                        <Icon name="cloud-upload" size={16} color="#fff" />
                                        <Text style={styles.bankUploadButtonText}>Sélectionner</Text>
                                      </View>
                                    )}
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        /* Regular document upload */
                        <View>
                          <TouchableOpacity
                            style={[
                              styles.uploadButton,
                              isUploading && styles.uploadButtonDisabled,
                              hasUploaded && styles.uploadButtonSuccess
                            ]}
                            onPress={() => handleFileSelect(docType)}
                            disabled={isUploading}
                          >
                            <Icon 
                              name={hasUploaded ? "add-circle" : "cloud-upload"} 
                              size={20} 
                              color="#fff" 
                              style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadButtonText}>
                              {isUploading ? '⏳ Upload en cours...' : 
                               hasUploaded ? '➕ Ajouter d\'autres fichiers' : 
                               '📎 Sélectionner fichier(s)'}
                            </Text>
                          </TouchableOpacity>

                          {/* Uploaded Files */}
                          {uploadedForType.map((file) => (
                            <View key={file.id} style={styles.fileItem}>
                              <View style={styles.fileIcon}>
                                <Icon name="description" size={20} color="#64748b" />
                              </View>
                              
                              <View style={styles.fileDetails}>
                                <Text style={styles.fileName}>{file.name}</Text>
                                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                                
                                {file.status === 'uploading' && (
                                  <View style={styles.uploadProgress}>
                                    <View style={styles.progressBarSmall}>
                                      <View 
                                        style={[
                                          styles.progressFillSmall,
                                          { width: `${file.uploadProgress || 0}%` }
                                        ]} 
                                      />
                                    </View>
                                    <Text style={styles.uploadProgressText}>
                                      {file.uploadProgress || 0}%
                                    </Text>
                                  </View>
                                )}
                                
                                {file.status === 'completed' && (
                                  <View style={styles.fileStatusContainer}>
                                    <Icon name="check-circle" size={16} color="#10b981" />
                                    <Text style={styles.fileStatusCompleted}>Téléchargé</Text>
                                  </View>
                                )}
                              </View>
                              
                              {file.status === 'completed' && (
                                <TouchableOpacity
                                  style={styles.removeButton}
                                  onPress={() => removeFile(file.id)}
                                >
                                  <Icon name="delete" size={20} color="#ef4444" />
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                    </Animated.View>
                  );
                })}
              </View>
            );
          })}

          {/* RIB Section */}
          <View style={styles.ribSection}>
            <Text style={styles.ribTitle}>Votre RIB (24 caractères)</Text>
            <TextInput
              style={styles.ribInput}
              value={ribNumber}
              onChangeText={setRibNumber}
              placeholder="000 - 000 - 00000000000000000 - 00"
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Upload Summary */}
          {uploadedFiles.length > 0 && (
            <Animated.View style={[styles.summarySection, { opacity: fadeAnim }]}>
              <Text style={styles.summaryTitle}>📊 Résumé</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {uploadedFiles.filter(f => f.status === 'completed').length}
                  </Text>
                  <Text style={styles.statLabel}>Fichiers téléchargés</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {requiredProgress.uploaded}/{requiredProgress.total}
                  </Text>
                  <Text style={styles.statLabel}>Documents requis</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View style={[styles.actionContainer, { opacity: fadeAnim }]}>
        {requiredProgress.uploaded === requiredProgress.total ? (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Icon name="check-circle" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.continueButtonText}>Finaliser l'upload</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.continueButtonDisabled}>
            <Icon name="hourglass-empty" size={20} color="#64748b" style={styles.buttonIcon} />
            <Text style={styles.continueButtonTextDisabled}>
              Complétez les documents requis ({requiredProgress.uploaded}/{requiredProgress.total})
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.laterButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.laterButtonText}>⏰ Continuer plus tard</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  progressBadge: {
    backgroundColor: 'rgba(6,182,212,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  progressBadgeText: {
    fontSize: 12,
    color: '#67e8f9',
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: '#1e293b',
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#67e8f9',
    minWidth: 35,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 25,
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#06b6d4',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  documentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  documentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  requiredStar: {
    fontSize: 16,
    color: '#fde047',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  uploadedBadge: {
    marginLeft: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    lineHeight: 18,
  },
  documentSpecs: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  // Bank statements specific styles
  bankStatementsContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bankFileCard: {
    width: width > 600 ? '30%' : '100%',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'dashed',
  },
  bankFileHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  bankFileIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  bankFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  uploadedFileContainer: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadedFileInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 2,
  },
  uploadedFileSize: {
    fontSize: 12,
    color: '#34d399',
    marginBottom: 5,
  },
  uploadProgressBank: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBarSmallBank: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(16,185,129,0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFillSmallBank: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  uploadProgressTextBank: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    minWidth: 30,
  },
  fileStatusContainerBank: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileStatusCompletedBank: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButtonBank: {
    padding: 4,
    marginLeft: 8,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,182,212,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  replaceButtonText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '600',
    marginLeft: 4,
  },
  bankUploadButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankUploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Regular upload styles
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  uploadButtonDisabled: {
    backgroundColor: '#475569',
    borderColor: '#64748b',
  },
  uploadButtonSuccess: {
    backgroundColor: '#10b981',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  fileIcon: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 5,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarSmall: {
    flex: 1,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 2,
  },
  uploadProgressText: {
    fontSize: 10,
    color: '#67e8f9',
    fontWeight: '600',
    minWidth: 30,
  },
  fileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileStatusCompleted: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButton: {
    padding: 8,
  },
  // RIB Section
  ribSection: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ribTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  ribInput: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  summarySection: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#67e8f9',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  buttonIcon: {
    marginRight: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  continueButtonTextDisabled: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  laterButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  laterButtonText: {
    color: '#67e8f9',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentUploadScreen;