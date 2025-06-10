import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const ApplicationProgressScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const filters = [
    { key: 'all', label: 'Toutes', count: 0 },
    { key: 'pending', label: 'En cours', count: 0 },
    { key: 'approved', label: 'Approuvées', count: 0 },
    { key: 'rejected', label: 'Rejetées', count: 0 },
    { key: 'completed', label: 'Finalisées', count: 0 },
  ];

  useEffect(() => {
    loadApplications();
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadApplications = async () => {
    try {
      // Simuler le chargement des demandes
      const mockApplications = [
        {
          id: 'CR1234567890',
          type: 'credit',
          title: 'Demande de crédit immobilier',
          amount: '250000',
          status: 'pending',
          submittedDate: '2025-01-15',
          lastUpdate: '2025-01-18',
          estimatedCompletion: '2025-01-25',
          currentStep: 'document_review',
          progress: 65,
          officer: 'Marie Dubois',
          notes: 'Documents en cours de vérification. Pièce manquante : justificatif de revenus récent.',
        },
        {
          id: 'KYC9876543210',
          type: 'kyc',
          title: 'Vérification KYC Business',
          amount: null,
          status: 'approved',
          submittedDate: '2025-01-10',
          lastUpdate: '2025-01-12',
          estimatedCompletion: '2025-01-12',
          currentStep: 'completed',
          progress: 100,
          officer: 'Jean Martin',
          notes: 'Vérification terminée avec succès. Accès complet aux services activé.',
        },
        {
          id: 'CR1122334455',
          type: 'credit',
          title: 'Crédit véhicule',
          amount: '35000',
          status: 'rejected',
          submittedDate: '2025-01-05',
          lastUpdate: '2025-01-08',
          estimatedCompletion: null,
          currentStep: 'rejected',
          progress: 30,
          officer: 'Pierre Leroy',
          notes: 'Demande rejetée en raison d\'un taux d\'endettement trop élevé.',
        },
        {
          id: 'AP2233445566',
          type: 'account',
          title: 'Ouverture de compte professionnel',
          amount: null,
          status: 'completed',
          submittedDate: '2024-12-20',
          lastUpdate: '2024-12-22',
          estimatedCompletion: '2024-12-22',
          currentStep: 'completed',
          progress: 100,
          officer: 'Sophie Bernard',
          notes: 'Compte ouvert avec succès. RIB envoyé par email.',
        },
      ];

      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Erreur', 'Impossible de charger vos demandes');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'approved': return '#34C759';
      case 'rejected': return '#FF3B30';
      case 'completed': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En cours';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'completed': return 'Finalisée';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'credit': return '💰';
      case 'kyc': return '🔍';
      case 'account': return '🏦';
      default: return '📄';
    }
  };

  const getProgressSteps = (type, currentStep) => {
    const creditSteps = [
      { key: 'submitted', label: 'Soumise', completed: true },
      { key: 'initial_review', label: 'Examen initial', completed: true },
      { key: 'document_review', label: 'Vérification documents', completed: false },
      { key: 'financial_analysis', label: 'Analyse financière', completed: false },
      { key: 'decision', label: 'Décision', completed: false },
      { key: 'finalization', label: 'Finalisation', completed: false },
    ];

    const kycSteps = [
      { key: 'submitted', label: 'Soumise', completed: true },
      { key: 'identity_check', label: 'Vérification identité', completed: true },
      { key: 'document_validation', label: 'Validation documents', completed: true },
      { key: 'completed', label: 'Terminée', completed: true },
    ];

    const accountSteps = [
      { key: 'submitted', label: 'Soumise', completed: true },
      { key: 'kyc_check', label: 'Vérification KYC', completed: true },
      { key: 'approval', label: 'Approbation', completed: true },
      { key: 'completed', label: 'Compte ouvert', completed: true },
    ];

    const steps = type === 'credit' ? creditSteps : type === 'kyc' ? kycSteps : accountSteps;
    
    // Marquer les étapes comme complétées jusqu'à l'étape actuelle
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex
    }));
  };

  const filteredApplications = applications.filter(app => {
    if (selectedFilter === 'all') return true;
    return app.status === selectedFilter;
  });

  const getFilterCounts = () => {
    return filters.map(filter => ({
      ...filter,
      count: filter.key === 'all' 
        ? applications.length 
        : applications.filter(app => app.status === filter.key).length
    }));
  };

  const handleApplicationPress = (application) => {
    navigation.navigate('ApplicationDetail', { application });
  };

  const handleContactOfficer = (officer) => {
    Alert.alert(
      'Contacter votre conseiller',
      `Souhaitez-vous contacter ${officer} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => Alert.alert('Appel', `Appel en cours vers ${officer}`) },
        { text: 'Message', onPress: () => Alert.alert('Message', `Ouverture de la messagerie avec ${officer}`) },
      ]
    );
  };

  const renderApplicationCard = (application) => (
    <TouchableOpacity 
      key={application.id}
      style={styles.applicationCard}
      onPress={() => handleApplicationPress(application)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(application.type)}</Text>
          <View style={styles.titleInfo}>
            <Text style={styles.applicationTitle}>{application.title}</Text>
            <Text style={styles.applicationId}>#{application.id}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
          <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
        </View>
      </View>

      {application.amount && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Montant :</Text>
          <Text style={styles.amountValue}>{application.amount}€</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progression</Text>
          <Text style={styles.progressPercentage}>{application.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${application.progress}%`,
                backgroundColor: getStatusColor(application.status)
              }
            ]} 
          />
        </View>
        <Text style={styles.currentStepText}>Étape actuelle : {application.currentStep}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Soumise le :</Text>
          <Text style={styles.dateValue}>{application.submittedDate}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Dernière MAJ :</Text>
          <Text style={styles.dateValue}>{application.lastUpdate}</Text>
        </View>
      </View>

      {application.estimatedCompletion && (
        <View style={styles.estimationContainer}>
          <Text style={styles.estimationText}>
            Finalisation estimée : {application.estimatedCompletion}
          </Text>
        </View>
      )}

      <View style={styles.officerContainer}>
        <Text style={styles.officerLabel}>Conseiller assigné :</Text>
        <TouchableOpacity 
          style={styles.officerButton}
          onPress={() => handleContactOfficer(application.officer)}
        >
          <Text style={styles.officerName}>{application.officer}</Text>
          <Text style={styles.contactIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {application.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Dernière note :</Text>
          <Text style={styles.notesText}>{application.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes demandes</Text>
        <TouchableOpacity 
          style={styles.newApplicationButton}
          onPress={() => navigation.navigate('CreditApplication')}
        >
          <Text style={styles.newApplicationText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getFilterCounts().map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Applications List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {filteredApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyTitle}>Aucune demande</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'all' 
                  ? 'Vous n\'avez pas encore de demandes' 
                  : `Aucune demande ${getStatusText(selectedFilter).toLowerCase()}`}
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreditApplication')}
              >
                <Text style={styles.createButtonText}>Créer une demande</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.applicationsContainer}>
              {filteredApplications.map(renderApplicationCard)}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Quick Actions */}
      {applications.length > 0 && (
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.quickActionIcon}>💬</Text>
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CreditApplication')}
          >
            <Text style={styles.quickActionIcon}>➕</Text>
            <Text style={styles.quickActionText}>Nouvelle demande</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={onRefresh}
          >
            <Text style={styles.quickActionIcon}>🔄</Text>
            <Text style={styles.quickActionText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  newApplicationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newApplicationText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  applicationsContainer: {
    padding: 15,
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  applicationId: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  currentStepText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  estimationContainer: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  estimationText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '500',
  },
  officerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  officerLabel: {
    fontSize: 14,
    color: '#666',
  },
  officerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  officerName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 5,
  },
  contactIcon: {
    fontSize: 12,
  },
  notesContainer: {
    backgroundColor: '#fff8f0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  notesLabel: {
    fontSize: 12,
    color: '#cc7a00',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#cc7a00',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default ApplicationProgressScreen;