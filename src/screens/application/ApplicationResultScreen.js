import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  Share,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const ApplicationResultScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { applicationId, result } = route.params || {};
  const [applicationData, setApplicationData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadApplicationResult();
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadApplicationResult = () => {
    // Simuler le chargement du résultat de la demande
    const mockResult = result || {
      status: 'approved', // approved, rejected, pending, conditional
      applicationId: applicationId || 'CR2025001234',
      type: 'credit',
      submittedDate: '2025-01-15',
      processedDate: '2025-01-18',
      amount: 250000,
      purpose: 'Achat immobilier',
      decision: {
        approvedAmount: 250000,
        interestRate: 2.8,
        loanTerm: 20,
        monthlyPayment: 1344,
        conditions: [
          'Apport minimum de 10% requis',
          'Assurance emprunteur obligatoire',
          'Justificatifs de revenus à jour',
        ],
      },
      officer: {
        name: 'Marie Dubois',
        phone: '+33 1 23 45 67 89',
        email: 'marie.dubois@businessekyc.com',
      },
      nextSteps: [
        'Signer l\'offre de prêt',
        'Souscrire l\'assurance emprunteur',
        'Fournir les justificatifs finaux',
        'Rendez-vous notaire programmé',
      ],
      documents: [
        { name: 'Offre de prêt', status: 'ready', downloadUrl: '#' },
        { name: 'Conditions générales', status: 'ready', downloadUrl: '#' },
        { name: 'Fiche d\'information standardisée', status: 'ready', downloadUrl: '#' },
      ],
      timeline: [
        { date: '2025-01-15', event: 'Demande soumise', completed: true },
        { date: '2025-01-16', event: 'Vérification documents', completed: true },
        { date: '2025-01-17', event: 'Analyse financière', completed: true },
        { date: '2025-01-18', event: 'Décision prise', completed: true },
        { date: '2025-01-22', event: 'Signature offre', completed: false },
        { date: '2025-01-25', event: 'Déblocage fonds', completed: false },
      ],
    };

    setApplicationData(mockResult);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      case 'conditional': return '⚠️';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#34C759';
      case 'rejected': return '#FF3B30';
      case 'pending': return '#FF9500';
      case 'conditional': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusTitle = (status) => {
    switch (status) {
      case 'approved': return 'Demande approuvée !';
      case 'rejected': return 'Demande refusée';
      case 'pending': return 'Demande en cours';
      case 'conditional': return 'Approbation conditionnelle';
      default: return 'Résultat de la demande';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'approved': 
        return 'Félicitations ! Votre demande de crédit a été approuvée. Vous pouvez maintenant procéder aux étapes suivantes.';
      case 'rejected': 
        return 'Nous regrettons de ne pas pouvoir donner suite favorable à votre demande. Vous trouverez ci-dessous les raisons et alternatives.';
      case 'pending': 
        return 'Votre demande est en cours de traitement. Nous vous tiendrons informé de l\'évolution.';
      case 'conditional': 
        return 'Votre demande est approuvée sous certaines conditions. Veuillez consulter les détails ci-dessous.';
      default: 
        return 'Résultat de votre demande de crédit.';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleContactOfficer = () => {
    Alert.alert(
      'Contacter votre conseiller',
      `Souhaitez-vous contacter ${applicationData.officer.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => Alert.alert('Appel', `Appel vers ${applicationData.officer.phone}`) },
        { text: 'Email', onPress: () => Alert.alert('Email', `Email vers ${applicationData.officer.email}`) },
      ]
    );
  };

  const handleDownloadDocument = (document) => {
    Alert.alert('Téléchargement', `Téléchargement de "${document.name}" en cours...`);
  };

  const handleShareResult = async () => {
    try {
      await Share.share({
        message: `Ma demande de crédit ${applicationData.applicationId} a été ${applicationData.status === 'approved' ? 'approuvée' : 'traitée'} !`,
        title: 'Résultat de demande de crédit',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNewApplication = () => {
    Alert.alert(
      'Nouvelle demande',
      'Souhaitez-vous faire une nouvelle demande de crédit ?',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Commencer', onPress: () => navigation.navigate('CreditApplication') },
      ]
    );
  };

  const renderResultHeader = () => (
    <Animated.View style={[styles.resultHeader, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(applicationData.status) }]}>
        <Text style={styles.statusIcon}>{getStatusIcon(applicationData.status)}</Text>
      </View>
      <Text style={styles.statusTitle}>{getStatusTitle(applicationData.status)}</Text>
      <Text style={styles.statusMessage}>{getStatusMessage(applicationData.status)}</Text>
      <View style={styles.applicationInfo}>
        <Text style={styles.applicationId}>#{applicationData.applicationId}</Text>
        <Text style={styles.processedDate}>Traité le {applicationData.processedDate}</Text>
      </View>
    </Animated.View>
  );

  const renderDecisionDetails = () => {
    if (applicationData.status === 'rejected') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motifs du refus</Text>
          <View style={styles.rejectionReasons}>
            <Text style={styles.rejectionReason}>• Taux d'endettement trop élevé (38%)</Text>
            <Text style={styles.rejectionReason}>• Revenus insuffisants pour le montant demandé</Text>
            <Text style={styles.rejectionReason}>• Historique de crédit à améliorer</Text>
          </View>
          
          <Text style={styles.sectionSubtitle}>Alternatives proposées</Text>
          <TouchableOpacity style={styles.alternativeCard}>
            <Text style={styles.alternativeTitle}>Montant réduit</Text>
            <Text style={styles.alternativeDescription}>
              Nous pouvons vous proposer un prêt de {formatCurrency(150000)} aux mêmes conditions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.alternativeCard}>
            <Text style={styles.alternativeTitle}>Améliorer votre dossier</Text>
            <Text style={styles.alternativeDescription}>
              Conseils personnalisés pour renforcer votre profil emprunteur
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (applicationData.status === 'approved' || applicationData.status === 'conditional') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de l'offre</Text>
          <View style={styles.offerDetails}>
            <View style={styles.offerRow}>
              <Text style={styles.offerLabel}>Montant approuvé</Text>
              <Text style={styles.offerValue}>{formatCurrency(applicationData.decision.approvedAmount)}</Text>
            </View>
            
            <View style={styles.offerRow}>
              <Text style={styles.offerLabel}>Taux d'intérêt</Text>
              <Text style={styles.offerValue}>{applicationData.decision.interestRate}% fixe</Text>
            </View>
            
            <View style={styles.offerRow}>
              <Text style={styles.offerLabel}>Durée</Text>
              <Text style={styles.offerValue}>{applicationData.decision.loanTerm} ans</Text>
            </View>
            
            <View style={[styles.offerRow, styles.highlightRow]}>
              <Text style={styles.offerLabel}>Mensualité</Text>
              <Text style={[styles.offerValue, styles.highlightValue]}>
                {formatCurrency(applicationData.decision.monthlyPayment)}/mois
              </Text>
            </View>
          </View>

          {applicationData.decision.conditions && (
            <>
              <Text style={styles.sectionSubtitle}>Conditions</Text>
              <View style={styles.conditionsList}>
                {applicationData.decision.conditions.map((condition, index) => (
                  <Text key={index} style={styles.conditionItem}>• {condition}</Text>
                ))}
              </View>
            </>
          )}
        </View>
      );
    }

    return null;
  };

  const renderNextSteps = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prochaines étapes</Text>
      {applicationData.nextSteps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Suivi de la demande</Text>
      {applicationData.timeline.map((item, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={[styles.timelineDot, item.completed && styles.timelineDotCompleted]} />
          <View style={styles.timelineContent}>
            <Text style={[styles.timelineEvent, item.completed && styles.timelineEventCompleted]}>
              {item.event}
            </Text>
            <Text style={styles.timelineDate}>{item.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Documents</Text>
      {applicationData.documents.map((doc, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.documentItem}
          onPress={() => handleDownloadDocument(doc)}
        >
          <View style={styles.documentInfo}>
            <Text style={styles.documentIcon}>📄</Text>
            <Text style={styles.documentName}>{doc.name}</Text>
          </View>
          <View style={styles.documentActions}>
            <View style={[styles.statusBadge, styles[`${doc.status}Badge`]]}>
              <Text style={styles.statusBadgeText}>
                {doc.status === 'ready' ? 'Prêt' : 'En attente'}
              </Text>
            </View>
            <Text style={styles.downloadIcon}>⬇️</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContactSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Votre conseiller</Text>
      <TouchableOpacity style={styles.officerCard} onPress={handleContactOfficer}>
        <View style={styles.officerInfo}>
          <Text style={styles.officerIcon}>👤</Text>
          <View style={styles.officerDetails}>
            <Text style={styles.officerName}>{applicationData.officer.name}</Text>
            <Text style={styles.officerRole}>Conseiller crédit</Text>
            <Text style={styles.officerContact}>{applicationData.officer.phone}</Text>
          </View>
        </View>
        <Text style={styles.contactArrow}>💬</Text>
      </TouchableOpacity>
    </View>
  );

  if (!applicationData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement du résultat...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Résultat de demande</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareResult}>
          <Text style={styles.shareButtonText}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {renderResultHeader()}
          {renderDecisionDetails()}
          
          {(applicationData.status === 'approved' || applicationData.status === 'conditional') && (
            <>
              {renderNextSteps()}
              {renderDocuments()}
            </>
          )}
          
          {showDetails && renderTimeline()}
          {renderContactSection()}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {applicationData.status === 'approved' ? (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignContract')}>
              <Text style={styles.primaryButtonText}>Signer l'offre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowDetails(!showDetails)}>
              <Text style={styles.secondaryButtonText}>
                {showDetails ? 'Masquer détails' : 'Voir détails'}
              </Text>
            </TouchableOpacity>
          </>
        ) : applicationData.status === 'rejected' ? (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleNewApplication}>
              <Text style={styles.primaryButtonText}>Nouvelle demande</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleContactOfficer}>
              <Text style={styles.secondaryButtonText}>Contacter conseiller</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ApplicationProgress')}>
              <Text style={styles.primaryButtonText}>Suivre ma demande</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleContactOfficer}>
              <Text style={styles.secondaryButtonText}>Contacter conseiller</Text>
            </TouchableOpacity>
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  resultHeader: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    fontSize: 36,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  applicationInfo: {
    alignItems: 'center',
  },
  applicationId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  processedDate: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  offerDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  offerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  highlightRow: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: -15,
    paddingHorizontal: 15,
    borderBottomWidth: 0,
    borderRadius: 8,
    marginTop: 10,
  },
  offerLabel: {
    fontSize: 16,
    color: '#666',
  },
  offerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  highlightValue: {
    fontSize: 18,
    color: '#007AFF',
  },
  conditionsList: {
    backgroundColor: '#fff8f0',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  conditionItem: {
    fontSize: 14,
    color: '#cc7a00',
    marginBottom: 5,
    lineHeight: 20,
  },
  rejectionReasons: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    marginBottom: 20,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 5,
    lineHeight: 20,
  },
  alternativeCard: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  alternativeDescription: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 18,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
    marginTop: 5,
  },
  timelineDotCompleted: {
    backgroundColor: '#34C759',
  },
  timelineContent: {
    flex: 1,
  },
  timelineEvent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  timelineEventCompleted: {
    color: '#333',
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  documentName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  readyBadge: {
    backgroundColor: '#e8f5e8',
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  downloadIcon: {
    fontSize: 16,
  },
  officerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  officerIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  officerDetails: {
    flex: 1,
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  officerRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  officerContact: {
    fontSize: 12,
    color: '#007AFF',
  },
  contactArrow: {
    fontSize: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApplicationResultScreen;