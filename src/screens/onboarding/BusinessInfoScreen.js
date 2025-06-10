import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const BusinessInfoScreen = ({ navigation }) => {
  const { user, updateBusinessInfo } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [businessData, setBusinessData] = useState({
    // Informations de l'entreprise
    companyName: '',
    businessType: '',
    industry: '',
    registrationNumber: '',
    taxNumber: '',
    foundedYear: '',
    
    // Adresse de l'entreprise
    businessAddress: '',
    businessCity: '',
    businessPostalCode: '',
    businessCountry: 'France',
    
    // Informations financières
    annualRevenue: '',
    numberOfEmployees: '',
    bankName: '',
    
    // Dirigeants et contacts
    ceoName: '',
    contactPerson: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    
    // Activités et conformité
    businessDescription: '',
    mainActivities: '',
    complianceCertifications: '',
    riskLevel: 'Faible',
  });

  const businessSteps = [
    {
      id: 0,
      title: 'Informations de l\'entreprise',
      subtitle: 'Détails généraux de votre société',
      icon: '🏢',
      fields: ['companyName', 'businessType', 'industry', 'registrationNumber', 'taxNumber', 'foundedYear'],
    },
    {
      id: 1,
      title: 'Adresse d\'activité',
      subtitle: 'Où se situe votre entreprise ?',
      icon: '📍',
      fields: ['businessAddress', 'businessCity', 'businessPostalCode', 'businessCountry'],
    },
    {
      id: 2,
      title: 'Informations financières',
      subtitle: 'Données économiques de l\'entreprise',
      icon: '💰',
      fields: ['annualRevenue', 'numberOfEmployees', 'bankName'],
    },
    {
      id: 3,
      title: 'Dirigeants et contacts',
      subtitle: 'Personnes responsables de l\'entreprise',
      icon: '👔',
      fields: ['ceoName', 'contactPerson', 'businessPhone', 'businessEmail', 'website'],
    },
    {
      id: 4,
      title: 'Activités et conformité',
      subtitle: 'Description de vos activités',
      icon: '📋',
      fields: ['businessDescription', 'mainActivities', 'complianceCertifications', 'riskLevel'],
    },
  ];

  const businessTypes = [
    'SARL', 'SAS', 'SA', 'SNC', 'EURL', 'SASU', 'Auto-entrepreneur', 'Association', 'Autre'
  ];

  const industries = [
    'Technologie', 'Finance', 'Santé', 'Éducation', 'Commerce', 'Industrie', 
    'Services', 'Construction', 'Transport', 'Agriculture', 'Tourisme', 'Autre'
  ];

  const riskLevels = ['Faible', 'Moyen', 'Élevé'];

  const updateField = (field, value) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepIndex) => {
    const step = businessSteps[stepIndex];
    const requiredFields = step.fields.filter(field => 
      !['website', 'complianceCertifications'].includes(field)
    );

    for (let field of requiredFields) {
      if (!businessData[field] || businessData[field].trim() === '') {
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    if (currentStep < businessSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      
      Animated.timing(slideAnim, {
        toValue: -nextStepIndex * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentStep(nextStepIndex);
    } else {
      handleCompleteSetup();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      
      Animated.timing(slideAnim, {
        toValue: -prevStepIndex * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentStep(prevStepIndex);
    }
  };

  const handleCompleteSetup = async () => {
    setIsLoading(true);
    
    try {
      // Simuler la sauvegarde des informations business
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour le contexte utilisateur
      if (updateBusinessInfo) {
        await updateBusinessInfo(businessData);
      }
      
      Alert.alert(
        'Informations enregistrées !',
        'Les informations de votre entreprise ont été configurées avec succès. Vous pouvez maintenant procéder à la vérification KYC business.',
        [
          {
            text: 'Commencer KYC',
            onPress: () => navigation.replace('KYC'),
          },
          {
            text: 'Plus tard',
            style: 'cancel',
            onPress: () => navigation.replace('Main'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBusinessInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informations de l'entreprise</Text>
      <Text style={styles.stepSubtitle}>Détails généraux de votre société</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nom de l'entreprise *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: TechCorp SARL"
          value={businessData.companyName}
          onChangeText={(text) => updateField('companyName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Type d'entreprise *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                businessData.businessType === type && styles.optionButtonActive,
              ]}
              onPress={() => updateField('businessType', type)}
            >
              <Text style={[
                styles.optionText,
                businessData.businessType === type && styles.optionTextActive,
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Secteur d'activité *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {industries.map((industry) => (
            <TouchableOpacity
              key={industry}
              style={[
                styles.optionButton,
                businessData.industry === industry && styles.optionButtonActive,
              ]}
              onPress={() => updateField('industry', industry)}
            >
              <Text style={[
                styles.optionText,
                businessData.industry === industry && styles.optionTextActive,
              ]}>
                {industry}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>N° d'enregistrement *</Text>
          <TextInput
            style={styles.input}
            placeholder="SIRET/SIREN"
            value={businessData.registrationNumber}
            onChangeText={(text) => updateField('registrationNumber', text)}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.inputLabel}>N° TVA *</Text>
          <TextInput
            style={styles.input}
            placeholder="FR12345678901"
            value={businessData.taxNumber}
            onChangeText={(text) => updateField('taxNumber', text)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Année de création *</Text>
        <TextInput
          style={styles.input}
          placeholder="2020"
          value={businessData.foundedYear}
          onChangeText={(text) => updateField('foundedYear', text)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Adresse d'activité</Text>
      <Text style={styles.stepSubtitle}>Où se situe votre entreprise ?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Adresse *</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Avenue des Entrepreneurs"
          value={businessData.businessAddress}
          onChangeText={(text) => updateField('businessAddress', text)}
          multiline
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 2, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Ville *</Text>
          <TextInput
            style={styles.input}
            placeholder="Paris"
            value={businessData.businessCity}
            onChangeText={(text) => updateField('businessCity', text)}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Code postal *</Text>
          <TextInput
            style={styles.input}
            placeholder="75001"
            value={businessData.businessPostalCode}
            onChangeText={(text) => updateField('businessPostalCode', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Pays *</Text>
        <TextInput
          style={styles.input}
          placeholder="France"
          value={businessData.businessCountry}
          onChangeText={(text) => updateField('businessCountry', text)}
        />
      </View>
    </View>
  );

  const renderFinancialStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informations financières</Text>
      <Text style={styles.stepSubtitle}>Données économiques de l'entreprise</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Chiffre d'affaires annuel *</Text>
        <TextInput
          style={styles.input}
          placeholder="500000"
          value={businessData.annualRevenue}
          onChangeText={(text) => updateField('annualRevenue', text)}
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>En euros</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre d'employés *</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          value={businessData.numberOfEmployees}
          onChangeText={(text) => updateField('numberOfEmployees', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Banque principale *</Text>
        <TextInput
          style={styles.input}
          placeholder="BNP Paribas"
          value={businessData.bankName}
          onChangeText={(text) => updateField('bankName', text)}
        />
      </View>
    </View>
  );

  const renderContactsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dirigeants et contacts</Text>
      <Text style={styles.stepSubtitle}>Personnes responsables de l'entreprise</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nom du dirigeant *</Text>
        <TextInput
          style={styles.input}
          placeholder="Jean Dupont"
          value={businessData.ceoName}
          onChangeText={(text) => updateField('ceoName', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Personne de contact *</Text>
        <TextInput
          style={styles.input}
          placeholder="Marie Martin"
          value={businessData.contactPerson}
          onChangeText={(text) => updateField('contactPerson', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Téléphone de l'entreprise *</Text>
        <TextInput
          style={styles.input}
          placeholder="+33 1 23 45 67 89"
          value={businessData.businessPhone}
          onChangeText={(text) => updateField('businessPhone', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email de l'entreprise *</Text>
        <TextInput
          style={styles.input}
          placeholder="contact@entreprise.com"
          value={businessData.businessEmail}
          onChangeText={(text) => updateField('businessEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Site web</Text>
        <TextInput
          style={styles.input}
          placeholder="https://www.entreprise.com"
          value={businessData.website}
          onChangeText={(text) => updateField('website', text)}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderActivitiesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Activités et conformité</Text>
      <Text style={styles.stepSubtitle}>Description de vos activités</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description de l'activité *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez en détail l'activité principale de votre entreprise..."
          value={businessData.businessDescription}
          onChangeText={(text) => updateField('businessDescription', text)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Activités principales *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Développement logiciel, conseil, formation..."
          value={businessData.mainActivities}
          onChangeText={(text) => updateField('mainActivities', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Certifications de conformité</Text>
        <TextInput
          style={styles.input}
          placeholder="ISO 9001, RGPD, etc."
          value={businessData.complianceCertifications}
          onChangeText={(text) => updateField('complianceCertifications', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Niveau de risque évalué *</Text>
        <View style={styles.riskContainer}>
          {riskLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.riskButton,
                businessData.riskLevel === level && styles.riskButtonActive,
                level === 'Faible' && styles.riskLow,
                level === 'Moyen' && styles.riskMedium,
                level === 'Élevé' && styles.riskHigh,
              ]}
              onPress={() => updateField('riskLevel', level)}
            >
              <Text style={[
                styles.riskText,
                businessData.riskLevel === level && styles.riskTextActive,
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Résumé de l'entreprise</Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Nom :</Text> {businessData.companyName}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Type :</Text> {businessData.businessType}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Secteur :</Text> {businessData.industry}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Localisation :</Text> {businessData.businessCity}
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBusinessInfoStep();
      case 1: return renderAddressStep();
      case 2: return renderFinancialStep();
      case 3: return renderContactsStep();
      case 4: return renderActivitiesStep();
      default: return renderBusinessInfoStep();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Informations Business</Text>
        <Text style={styles.headerSubtitle}>Configuration de votre entreprise pour KYC Business</Text>
        <View style={styles.progressContainer}>
          {businessSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
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
          {currentStep + 1} / {businessSteps.length}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={nextStep}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Sauvegarde...' : 
             currentStep === businessSteps.length - 1 ? 'Terminer' : 'Suivant'}
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
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 10,
    height: 10,
    borderRadius: 5,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  optionsScroll: {
    marginVertical: 5,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  riskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    alignItems: 'center',
  },
  riskLow: {
    borderColor: '#34C759',
    backgroundColor: '#f0f9f0',
  },
  riskMedium: {
    borderColor: '#FF9500',
    backgroundColor: '#fff8f0',
  },
  riskHigh: {
    borderColor: '#FF3B30',
    backgroundColor: '#fff0f0',
  },
  riskButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskTextActive: {
    color: '#fff',
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
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#333',
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

export default BusinessInfoScreen;