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
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

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
      case 'completed': return colors.secondary;
      default: return colors.gray;
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
    navigation.navigate('ApplicationResult', { application });
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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.white}
            colors={[colors.secondary]}
          />
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
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  newApplicationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newApplicationText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  applicationsContainer: {
    padding: spacing.md,
  },
  applicationCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  titleInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 2,
  },
  applicationId: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },
  amountValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    fontWeight: typography.fontWeight.semibold,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  currentStepText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.6,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  estimationContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  estimationText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  officerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  officerLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },
  officerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  officerName: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.xs,
  },
  contactIcon: {
    fontSize: 12,
  },
  notesContainer: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  notesLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    opacity: 0.9,
  },
  notesText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    lineHeight: 18,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  createButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.8,
    fontWeight: typography.fontWeight.medium,
  },
});

export default ApplicationProgressScreen;