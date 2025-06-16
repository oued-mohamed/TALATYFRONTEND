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

const CreditApplicationScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [applicationData, setApplicationData] = useState({
    // Informations personnelles
    employmentStatus: '',
    monthlyIncome: '',
    workExperience: '',
    employer: '',
    position: '',
    
    // Demande de crédit
    loanAmount: '',
    loanPurpose: '',
    loanDuration: '',
    collateral: '',
    
    // Informations financières
    bankAccount: '',
    existingLoans: '',
    monthlyExpenses: '',
    creditHistory: '',
    
    // Documents requis
    paySlips: false,
    bankStatements: false,
    employmentLetter: false,
    taxReturns: false,
    
    // Références
    personalReference1: '',
    personalReference2: '',
    bankReference: '',
  });

  const applicationSteps = [
    {
      id: 0,
      title: 'Informations d\'emploi',
      subtitle: 'Votre situation professionnelle',
      icon: '💼',
      fields: ['employmentStatus', 'monthlyIncome', 'workExperience', 'employer', 'position'],
    },
    {
      id: 1,
      title: 'Demande de crédit',
      subtitle: 'Détails de votre demande',
      icon: '💰',
      fields: ['loanAmount', 'loanPurpose', 'loanDuration', 'collateral'],
    },
    {
      id: 2,
      title: 'Situation financière',
      subtitle: 'Vos finances actuelles',
      icon: '📊',
      fields: ['bankAccount', 'existingLoans', 'monthlyExpenses', 'creditHistory'],
    },
    {
      id: 3,
      title: 'Documents requis',
      subtitle: 'Pièces justificatives',
      icon: '📄',
      fields: ['paySlips', 'bankStatements', 'employmentLetter', 'taxReturns'],
    },
    {
      id: 4,
      title: 'Références',
      subtitle: 'Contacts de référence',
      icon: '👥',
      fields: ['personalReference1', 'personalReference2', 'bankReference'],
    },
  ];

  const employmentStatuses = [
    'CDI', 'CDD', 'Freelance', 'Fonctionnaire', 'Retraité', 'Étudiant', 'Entrepreneur', 'Autre'
  ];

  const loanPurposes = [
    'Achat immobilier', 'Véhicule', 'Travaux', 'Consolidation de dettes', 
    'Investissement', 'Éducation', 'Voyage', 'Urgence médicale', 'Autre'
  ];

  const loanDurations = ['6 mois', '1 an', '2 ans', '3 ans', '5 ans', '7 ans', '10 ans', '15 ans', '20 ans'];

  const updateField = (field, value) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepIndex) => {
    const step = applicationSteps[stepIndex];
    const requiredFields = step.fields.filter(field => 
      !['collateral', 'existingLoans'].includes(field)
    );

    for (let field of requiredFields) {
      if (typeof applicationData[field] === 'boolean') {
        continue; // Skip validation for checkboxes
      }
      if (!applicationData[field] || applicationData[field].trim() === '') {
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

    if (currentStep < applicationSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      
      Animated.timing(slideAnim, {
        toValue: -nextStepIndex * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentStep(nextStepIndex);
    } else {
      handleSubmitApplication();
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

  const calculateLoanEligibility = () => {
    const income = parseFloat(applicationData.monthlyIncome) || 0;
    const expenses = parseFloat(applicationData.monthlyExpenses) || 0;
    const loanAmount = parseFloat(applicationData.loanAmount) || 0;
    
    const availableIncome = income - expenses;
    const maxLoanCapacity = availableIncome * 0.33; // Taux d'endettement de 33%
    
    return {
      eligibleAmount: Math.min(loanAmount, maxLoanCapacity * 12 * 5), // 5 ans max
      monthlyPayment: loanAmount / (parseInt(applicationData.loanDuration) * 12),
      debtRatio: (loanAmount / (parseInt(applicationData.loanDuration) * 12)) / income,
    };
  };

  const handleSubmitApplication = async () => {
    setIsLoading(true);
    
    try {
      // Calculer l'éligibilité
      const eligibility = calculateLoanEligibility();
      
      // Simuler la soumission de la demande
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        'Demande soumise !',
        `Votre demande de crédit de ${applicationData.loanAmount}€ a été soumise avec succès. Vous recevrez une réponse sous 48-72 heures.`,
        [
          {
            text: 'Voir le statut',
            onPress: () => navigation.navigate('ApplicationStatus', { 
              applicationData, 
              eligibility,
              applicationId: `CR${Date.now()}` 
            }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre votre demande. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmploymentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informations d'emploi</Text>
      <Text style={styles.stepSubtitle}>Votre situation professionnelle</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Statut d'emploi *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {employmentStatuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.optionButton,
                applicationData.employmentStatus === status && styles.optionButtonActive,
              ]}
              onPress={() => updateField('employmentStatus', status)}
            >
              <Text style={[
                styles.optionText,
                applicationData.employmentStatus === status && styles.optionTextActive,
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.inputLabel}>Revenus mensuels (€) *</Text>
          <TextInput
            style={styles.input}
            placeholder="3000"
            placeholderTextColor="#8FA8B8"
            value={applicationData.monthlyIncome}
            onChangeText={(text) => updateField('monthlyIncome', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Expérience (années) *</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            placeholderTextColor="#8FA8B8"
            value={applicationData.workExperience}
            onChangeText={(text) => updateField('workExperience', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Employeur *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de votre entreprise"
          placeholderTextColor="#8FA8B8"
          value={applicationData.employer}
          onChangeText={(text) => updateField('employer', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Poste occupé *</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre fonction"
          placeholderTextColor="#8FA8B8"
          value={applicationData.position}
          onChangeText={(text) => updateField('position', text)}
        />
      </View>
    </View>
  );

  const renderLoanRequestStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Demande de crédit</Text>
      <Text style={styles.stepSubtitle}>Détails de votre demande</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Montant souhaité (€) *</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          placeholderTextColor="#8FA8B8"
          value={applicationData.loanAmount}
          onChangeText={(text) => updateField('loanAmount', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Objet du crédit *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {loanPurposes.map((purpose) => (
            <TouchableOpacity
              key={purpose}
              style={[
                styles.optionButton,
                applicationData.loanPurpose === purpose && styles.optionButtonActive,
              ]}
              onPress={() => updateField('loanPurpose', purpose)}
            >
              <Text style={[
                styles.optionText,
                applicationData.loanPurpose === purpose && styles.optionTextActive,
              ]}>
                {purpose}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Durée de remboursement *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {loanDurations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.optionButton,
                applicationData.loanDuration === duration && styles.optionButtonActive,
              ]}
              onPress={() => updateField('loanDuration', duration)}
            >
              <Text style={[
                styles.optionText,
                applicationData.loanDuration === duration && styles.optionTextActive,
              ]}>
                {duration}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Garantie/Collatéral</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez les garanties que vous pouvez offrir (optionnel)"
          placeholderTextColor="#8FA8B8"
          value={applicationData.collateral}
          onChangeText={(text) => updateField('collateral', text)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {applicationData.loanAmount && applicationData.monthlyIncome && (
        <View style={styles.calculatorContainer}>
          <Text style={styles.calculatorTitle}>Estimation mensuelle :</Text>
          <Text style={styles.calculatorAmount}>
            ~{Math.round(parseFloat(applicationData.loanAmount) / (parseInt(applicationData.loanDuration || '1') * 12))}€/mois
          </Text>
        </View>
      )}
    </View>
  );

  const renderFinancialStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Situation financière</Text>
      <Text style={styles.stepSubtitle}>Vos finances actuelles</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Banque principale *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de votre banque"
          placeholderTextColor="#8FA8B8"
          value={applicationData.bankAccount}
          onChangeText={(text) => updateField('bankAccount', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Crédits existants (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="Montant total de vos crédits actuels"
          placeholderTextColor="#8FA8B8"
          value={applicationData.existingLoans}
          onChangeText={(text) => updateField('existingLoans', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Charges mensuelles (€) *</Text>
        <TextInput
          style={styles.input}
          placeholder="1500"
          placeholderTextColor="#8FA8B8"
          value={applicationData.monthlyExpenses}
          onChangeText={(text) => updateField('monthlyExpenses', text)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Historique de crédit *</Text>
        <View style={styles.creditHistoryContainer}>
          {['Excellent', 'Bon', 'Correct', 'À améliorer'].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.creditButton,
                applicationData.creditHistory === rating && styles.creditButtonActive,
              ]}
              onPress={() => updateField('creditHistory', rating)}
            >
              <Text style={[
                styles.creditText,
                applicationData.creditHistory === rating && styles.creditTextActive,
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {applicationData.monthlyIncome && applicationData.monthlyExpenses && (
        <View style={styles.ratioContainer}>
          <Text style={styles.ratioTitle}>Capacité d'endettement :</Text>
          <Text style={styles.ratioValue}>
            {Math.round(((parseFloat(applicationData.monthlyIncome) - parseFloat(applicationData.monthlyExpenses)) / parseFloat(applicationData.monthlyIncome)) * 100)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderDocumentsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documents requis</Text>
      <Text style={styles.stepSubtitle}>Pièces justificatives à fournir</Text>

      <View style={styles.documentsContainer}>
        <TouchableOpacity
          style={styles.documentItem}
          onPress={() => updateField('paySlips', !applicationData.paySlips)}
        >
          <View style={[styles.checkbox, applicationData.paySlips && styles.checkboxActive]}>
            {applicationData.paySlips && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Fiches de paie</Text>
            <Text style={styles.documentDescription}>3 dernières fiches de paie</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.documentItem}
          onPress={() => updateField('bankStatements', !applicationData.bankStatements)}
        >
          <View style={[styles.checkbox, applicationData.bankStatements && styles.checkboxActive]}>
            {applicationData.bankStatements && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Relevés bancaires</Text>
            <Text style={styles.documentDescription}>3 derniers mois</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.documentItem}
          onPress={() => updateField('employmentLetter', !applicationData.employmentLetter)}
        >
          <View style={[styles.checkbox, applicationData.employmentLetter && styles.checkboxActive]}>
            {applicationData.employmentLetter && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Attestation d'emploi</Text>
            <Text style={styles.documentDescription}>Lettre de votre employeur</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.documentItem}
          onPress={() => updateField('taxReturns', !applicationData.taxReturns)}
        >
          <View style={[styles.checkbox, applicationData.taxReturns && styles.checkboxActive]}>
            {applicationData.taxReturns && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Avis d'imposition</Text>
            <Text style={styles.documentDescription}>Dernier avis disponible</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.noteIcon}>ℹ️</Text>
        <Text style={styles.noteText}>
          Vous pourrez télécharger ces documents après validation de votre demande initiale.
        </Text>
      </View>
    </View>
  );

  const renderReferencesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Références</Text>
      <Text style={styles.stepSubtitle}>Contacts de référence</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Référence personnelle 1 *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom et téléphone d'un proche"
          placeholderTextColor="#8FA8B8"
          value={applicationData.personalReference1}
          onChangeText={(text) => updateField('personalReference1', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Référence personnelle 2 *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom et téléphone d'un proche"
          placeholderTextColor="#8FA8B8"
          value={applicationData.personalReference2}
          onChangeText={(text) => updateField('personalReference2', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Référence bancaire *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de votre conseiller bancaire"
          placeholderTextColor="#8FA8B8"
          value={applicationData.bankReference}
          onChangeText={(text) => updateField('bankReference', text)}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Résumé de votre demande</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Montant :</Text>
          <Text style={styles.summaryValue}>{applicationData.loanAmount}€</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Durée :</Text>
          <Text style={styles.summaryValue}>{applicationData.loanDuration}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Objet :</Text>
          <Text style={styles.summaryValue}>{applicationData.loanPurpose}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Revenus :</Text>
          <Text style={styles.summaryValue}>{applicationData.monthlyIncome}€/mois</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderEmploymentStep();
      case 1: return renderLoanRequestStep();
      case 2: return renderFinancialStep();
      case 3: return renderDocumentsStep();
      case 4: return renderReferencesStep();
      default: return renderEmploymentStep();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de crédit</Text>
        <View style={styles.progressContainer}>
          {applicationSteps.map((_, index) => (
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
          style={[styles.navButton, styles.backNavButton]}
          onPress={prevStep}
          disabled={currentStep === 0}
        >
          <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
            Retour
          </Text>
        </TouchableOpacity>

        <Text style={styles.stepCounter}>
          {currentStep + 1} / {applicationSteps.length}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={nextStep}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Envoi...' : 
             currentStep === applicationSteps.length - 1 ? 'Soumettre' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a52', // Main dark blue background
  },
  header: {
    backgroundColor: '#2c4e68', // Darker blue for header
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3d5b77',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3d5b77',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5a7b94',
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: '#4CAF50', // Green for active progress
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#B0C4DE', // Light blue-gray for subtitles
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8F4FD', // Very light blue for labels
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4A6B85',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#2C4E68', // Darker blue for input background
    color: '#FFFFFF', // White text
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: '#3D5B77',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50', // Green for active state
    borderColor: '#45A049',
  },
  optionText: {
    fontSize: 14,
    color: '#B0C4DE',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calculatorContainer: {
    backgroundColor: '#2C4E68',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  calculatorTitle: {
    fontSize: 14,
    color: '#B0C4DE',
    marginBottom: 5,
  },
  calculatorAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50', // Green for amounts
  },
  creditHistoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  creditButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#3D5B77',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  creditButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
  },
  creditText: {
    fontSize: 14,
    color: '#B0C4DE',
  },
  creditTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ratioContainer: {
    backgroundColor: '#2C4E68',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  ratioTitle: {
    fontSize: 14,
    color: '#B0C4DE',
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C4E68',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#5A7B94',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D5B77',
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  documentDescription: {
    fontSize: 14,
    color: '#B0C4DE',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A3B5C', // Darker blue for note
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E5A7D',
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#87CEEB', // Sky blue for note text
  },
  summaryContainer: {
    backgroundColor: '#2C4E68',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A6B85',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#B0C4DE',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2C4E68',
    borderTopWidth: 1,
    borderTopColor: '#4A6B85',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backNavButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5A7B94',
  },
  nextButton: {
    backgroundColor: '#4CAF50', // Green for next/submit button
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#B0C4DE',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  disabledText: {
    opacity: 0.5,
  },
  stepCounter: {
    fontSize: 14,
    color: '#B0C4DE',
    fontWeight: '500',
  },
});

export default CreditApplicationScreen;