import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileSetupScreen = ({ navigation }) => {
  const { user, updateProfile, isLoading: authLoading, error } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: user?.dateOfBirth || '',
    phoneNumber: user?.phoneNumber || '',
    
    // Adresse
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    country: user?.country || 'France',
    
    // Informations professionnelles
    profession: user?.profession || '',
    company: user?.company || '',
    monthlyIncome: user?.monthlyIncome || '',
    
    // Préférences
    notifications: user?.notifications !== undefined ? user.notifications : true,
    newsletter: user?.newsletter !== undefined ? user.newsletter : false,
    language: user?.language || 'Français',
  });

  // ✅ DEBUG: Add component mount logging
  useEffect(() => {
    console.log('🚀 ProfileSetupScreen mounted');
    console.log('👤 Current user:', user);
    console.log('🔧 updateProfile function:', typeof updateProfile);
    console.log('📱 Platform:', Platform.OS);
    console.log('📊 Auth context state:', { 
      user: !!user, 
      updateProfile: typeof updateProfile, 
      authLoading, 
      error 
    });
  }, []);

  // ✅ Update profileData when user data changes
  useEffect(() => {
    console.log('👤 User data changed:', user);
    if (user) {
      setProfileData(prevData => ({
        ...prevData,
        firstName: user.firstName || prevData.firstName,
        lastName: user.lastName || prevData.lastName,
        dateOfBirth: user.dateOfBirth || prevData.dateOfBirth,
        phoneNumber: user.phoneNumber || prevData.phoneNumber,
        address: user.address || prevData.address,
        city: user.city || prevData.city,
        postalCode: user.postalCode || prevData.postalCode,
        country: user.country || prevData.country,
        profession: user.profession || prevData.profession,
        company: user.company || prevData.company,
        monthlyIncome: user.monthlyIncome || prevData.monthlyIncome,
        notifications: user.notifications !== undefined ? user.notifications : prevData.notifications,
        newsletter: user.newsletter !== undefined ? user.newsletter : prevData.newsletter,
        language: user.language || prevData.language,
      }));
      console.log('✅ Profile data updated from user data');
    }
  }, [user]);

  const setupSteps = [
    {
      id: 0,
      title: 'Informations personnelles',
      subtitle: 'Dites-nous en plus sur vous',
      icon: '👤',
      fields: ['firstName', 'lastName', 'dateOfBirth', 'phoneNumber'],
    },
    {
      id: 1,
      title: 'Votre adresse',
      subtitle: 'Où habitez-vous ?',
      icon: '🏠',
      fields: ['address', 'city', 'postalCode', 'country'],
    },
    {
      id: 2,
      title: 'Informations professionnelles',
      subtitle: 'Votre situation professionnelle',
      icon: '💼',
      fields: ['profession', 'company', 'monthlyIncome'],
    },
    {
      id: 3,
      title: 'Préférences',
      subtitle: 'Personnalisez votre expérience',
      icon: '⚙️',
      fields: ['notifications', 'newsletter', 'language'],
    },
  ];

  const updateField = (field, value) => {
    console.log(`📝 Updating field ${field} with value:`, value);
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepIndex) => {
    const step = setupSteps[stepIndex];
    const requiredFields = step.fields.filter(field => 
      !['newsletter', 'notifications'].includes(field)
    );

    for (let field of requiredFields) {
      if (!profileData[field] || profileData[field].trim() === '') {
        console.log(`❌ Validation failed for field: ${field}`);
        return false;
      }
    }
    console.log(`✅ Step ${stepIndex} validation passed`);
    return true;
  };

  const nextStep = () => {
    console.log(`➡️ Next step requested from step ${currentStep}`);
    
    if (!validateStep(currentStep)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    if (currentStep < setupSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      console.log(`Moving to step ${nextStepIndex}`);
      
      Animated.timing(slideAnim, {
        toValue: -nextStepIndex * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentStep(nextStepIndex);
    } else {
      console.log('🎯 Final step reached, calling handleCompleteSetup');
      handleCompleteSetup();
    }
  };

  const prevStep = () => {
    console.log(`⬅️ Previous step requested from step ${currentStep}`);
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      console.log(`Moving back to step ${prevStepIndex}`);
      
      Animated.timing(slideAnim, {
        toValue: -prevStepIndex * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentStep(prevStepIndex);
    }
  };

  // ✅ ENHANCED DEBUG VERSION of handleCompleteSetup
  const handleCompleteSetup = async () => {
    console.log('🚨🚨🚨 HANDLE COMPLETE SETUP CALLED 🚨🚨🚨');
    console.log('📊 Function entry state:');
    console.log('   - updateProfile type:', typeof updateProfile);
    console.log('   - updateProfile function:', updateProfile);
    console.log('   - profileData:', JSON.stringify(profileData, null, 2));
    console.log('   - user:', user);
    console.log('   - authLoading:', authLoading);
    console.log('   - error:', error);
    
    if (!updateProfile) {
      console.error('❌ CRITICAL: updateProfile function is not available!');
      console.error('❌ This means the AuthContext is not providing updateProfile');
      Alert.alert('Erreur', 'La fonction updateProfile n\'est pas disponible. Vérifiez AuthContext.');
      return;
    }

    console.log('⏳ Setting loading to true...');
    setIsLoading(true);
    
    try {
      console.log('🚀 About to call updateProfile...');
      console.log('📤 Data being sent to updateProfile:', profileData);
      
      const result = await updateProfile(profileData);
      
      console.log('📥 updateProfile returned:', result);
      console.log('📥 Result type:', typeof result);
      console.log('📥 Result success:', result?.success);
      console.log('📥 Result message:', result?.message);
      
      if (result && result.success) {
        console.log('✅ SUCCESS: Profile saved successfully!');
        Alert.alert(
          'Profil créé !',
          'Votre profil a été configuré avec succès. Vous pouvez maintenant commencer votre vérification KYC.',
          [
            {
              text: 'Continuer',
              onPress: () => {
                console.log('🎯 Navigating to Main screen...');
                navigation.replace('Main');
              },
            },
          ]
        );
      } else {
        console.error('❌ FAILURE: Profile save failed');
        console.error('❌ Result object:', result);
        Alert.alert(
          'Erreur', 
          result?.message || 'Impossible de sauvegarder votre profil. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('💥 EXCEPTION in handleCompleteSetup:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      Alert.alert(
        'Erreur', 
        'Une erreur est survenue lors de la sauvegarde: ' + error.message
      );
    } finally {
      console.log('⏳ Setting loading to false...');
      setIsLoading(false);
    }
  };

  // ✅ ADD: Save individual step data as user progresses
  const saveStepData = async () => {
    try {
      console.log('💾 Auto-saving step data...');
      const stepData = {};
      const currentStepFields = setupSteps[currentStep].fields;
      
      currentStepFields.forEach(field => {
        stepData[field] = profileData[field];
      });
      
      // Only save if we have some data to save
      const hasData = Object.values(stepData).some(value => 
        value !== '' && value !== null && value !== undefined
      );
      
      if (hasData) {
        await updateProfile(stepData);
        console.log('✅ Step data auto-saved');
      }
    } catch (error) {
      console.log('⚠️ Auto-save failed (non-critical):', error.message);
    }
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informations personnelles</Text>
      <Text style={styles.stepSubtitle}>Dites-nous en plus sur vous</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Prénom *</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre prénom"
          value={profileData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nom *</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre nom"
          value={profileData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date de naissance *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          value={profileData.dateOfBirth}
          onChangeText={(text) => updateField('dateOfBirth', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
        <TextInput
          style={styles.input}
          placeholder="+33 6 12 34 56 78"
          value={profileData.phoneNumber}
          onChangeText={(text) => updateField('phoneNumber', text)}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Votre adresse</Text>
      <Text style={styles.stepSubtitle}>Où habitez-vous ?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Adresse *</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Rue de la Paix"
          value={profileData.address}
          onChangeText={(text) => updateField('address', text)}
          multiline
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 2, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Ville *</Text>
          <TextInput
            style={styles.input}
            placeholder="Paris"
            value={profileData.city}
            onChangeText={(text) => updateField('city', text)}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Code postal *</Text>
          <TextInput
            style={styles.input}
            placeholder="75001"
            value={profileData.postalCode}
            onChangeText={(text) => updateField('postalCode', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Pays *</Text>
        <TextInput
          style={styles.input}
          placeholder="France"
          value={profileData.country}
          onChangeText={(text) => updateField('country', text)}
        />
      </View>
    </View>
  );

  const renderProfessionalStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informations professionnelles</Text>
      <Text style={styles.stepSubtitle}>Votre situation professionnelle</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Profession *</Text>
        <TextInput
          style={styles.input}
          placeholder="Développeur, Médecin, Étudiant..."
          value={profileData.profession}
          onChangeText={(text) => updateField('profession', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Entreprise / Organisation</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de votre entreprise"
          value={profileData.company}
          onChangeText={(text) => updateField('company', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Revenus mensuels approximatifs *</Text>
        <TextInput
          style={styles.input}
          placeholder="2000€"
          value={profileData.monthlyIncome}
          onChangeText={(text) => updateField('monthlyIncome', text)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Préférences</Text>
      <Text style={styles.stepSubtitle}>Personnalisez votre expérience</Text>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceTextContainer}>
          <Text style={styles.preferenceTitle}>Notifications push</Text>
          <Text style={styles.preferenceDescription}>
            Recevoir des notifications sur l'état de votre vérification
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.switch, profileData.notifications && styles.switchActive]}
          onPress={() => updateField('notifications', !profileData.notifications)}
        >
          <View style={[styles.switchThumb, profileData.notifications && styles.switchThumbActive]} />
        </TouchableOpacity>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceTextContainer}>
          <Text style={styles.preferenceTitle}>Newsletter</Text>
          <Text style={styles.preferenceDescription}>
            Recevoir des informations sur nos nouveaux services
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.switch, profileData.newsletter && styles.switchActive]}
          onPress={() => updateField('newsletter', !profileData.newsletter)}
        >
          <View style={[styles.switchThumb, profileData.newsletter && styles.switchThumbActive]} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Langue préférée</Text>
        <TouchableOpacity style={styles.input}>
          <Text style={styles.inputText}>{profileData.language}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Résumé de votre profil</Text>
        <Text style={styles.summaryText}>
          {profileData.firstName} {profileData.lastName}
        </Text>
        <Text style={styles.summaryText}>
          {profileData.city}, {profileData.country}
        </Text>
        <Text style={styles.summaryText}>
          {profileData.profession}
        </Text>
      </View>

      {/* ✅ Add debug button on final step */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={() => {
          console.log('🔍 DEBUG BUTTON PRESSED');
          console.log('Current updateProfile:', typeof updateProfile);
          console.log('Current profileData:', profileData);
          console.log('Current user:', user);
          Alert.alert('Debug Info', `updateProfile: ${typeof updateProfile}\nHas user: ${!!user}`);
        }}
      >
        <Text style={styles.debugButtonText}>🔍 Debug Info</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPersonalInfoStep();
      case 1: return renderAddressStep();
      case 2: return renderProfessionalStep();
      case 3: return renderPreferencesStep();
      default: return renderPersonalInfoStep();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuration du profil (DEBUG)</Text>
        <View style={styles.progressContainer}>
          {setupSteps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
              onPress={() => {
                console.log(`🎯 Progress dot ${index} clicked, moving to step ${index}`);
                setCurrentStep(index);
                Animated.timing(slideAnim, {
                  toValue: -index * width,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.stepsContainer, { transform: [{ translateX: slideAnim }] }]}>
          {renderCurrentStep()}
        </Animated.View>
      </ScrollView>

      {/* ✅ Display error if present */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backButton]}
          onPress={prevStep}
          disabled={currentStep === 0}
        >
          <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
            Retour
          </Text>
        </TouchableOpacity>

        <Text style={styles.stepCounter}>
          {currentStep + 1} / {setupSteps.length}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={() => {
            console.log(`🎯 Navigation button pressed on step ${currentStep}`);
            nextStep();
          }}
          disabled={isLoading || authLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading || authLoading ? 'Sauvegarde...' : 
             currentStep === setupSteps.length - 1 ? 'SAUVEGARDER' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  stepsContainer: {
    padding: 20,
  },
  stepContainer: {
    width: width - 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#007AFF',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  summaryContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  debugButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#d63384',
    textAlign: 'center',
    fontSize: 14,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 80,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#666',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  disabledText: {
    opacity: 0.5,
  },
  stepCounter: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileSetupScreen;