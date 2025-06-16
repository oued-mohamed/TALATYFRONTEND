import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useKYC } from '../../context/KYCContext';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { kycData, step } = useKYC();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReviews: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simuler le chargement des données du dashboard
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalApplications: 15,
        pendingReviews: 3,
        approvedApplications: 10,
        rejectedApplications: 2,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getKYCStatus = () => {
    if (step === 0) return { status: 'Non commencé', color: '#ef4444', icon: 'error' };
    if (step < 4) return { status: 'En cours', color: '#f59e0b', icon: 'hourglass-empty' };
    return { status: 'Terminé', color: '#10b981', icon: 'check-circle' };
  };

  const kycStatus = getKYCStatus();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.userName}>{user?.firstName || user?.name || 'Utilisateur'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person" size={24} color="#67e8f9" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={logout}
          >
            <Icon name="logout" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#67e8f9"
            colors={['#67e8f9']}
          />
        }
      >
        {/* KYC Status Card */}
        <View style={styles.kycCard}>
          <View style={styles.cardHeader}>
            <Icon name={kycStatus.icon} size={24} color={kycStatus.color} />
            <Text style={styles.cardTitle}>Statut de vérification KYC</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: kycStatus.color }]} />
            <Text style={styles.statusText}>{kycStatus.status}</Text>
          </View>
          
          {step < 4 && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('KYC')}
            >
              <Icon name="play-arrow" size={20} color="#fff" />
              <Text style={styles.continueButtonText}>
                {step === 0 ? 'Commencer la vérification' : 'Continuer la vérification'}
              </Text>
            </TouchableOpacity>
          )}
          
          {step >= 4 && (
            <View style={styles.completedBadge}>
              <Icon name="verified" size={20} color="#10b981" />
              <Text style={styles.completedText}>Vérification terminée</Text>
            </View>
          )}
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.primaryCard]}>
              <Icon name="description" size={32} color="#fff" style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.totalApplications}</Text>
              <Text style={styles.statLabel}>Total Demandes</Text>
            </View>
            <View style={[styles.statCard, styles.warningCard]}>
              <Icon name="schedule" size={32} color="#fff" style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.pendingReviews}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.successCard]}>
              <Icon name="check-circle" size={32} color="#fff" style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.approvedApplications}</Text>
              <Text style={styles.statLabel}>Approuvées</Text>
            </View>
            <View style={[styles.statCard, styles.dangerCard]}>
              <Icon name="cancel" size={32} color="#fff" style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.rejectedApplications}</Text>
              <Text style={styles.statLabel}>Rejetées</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('KYC')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(103,232,249,0.2)' }]}>
                <Icon name="verified-user" size={24} color="#67e8f9" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Nouvelle vérification KYC</Text>
                <Text style={styles.actionDescription}>
                  Commencer un nouveau processus de vérification d'identité
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                <Icon name="person" size={24} color="#10b981" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Gérer le profil</Text>
                <Text style={styles.actionDescription}>
                  Modifier vos informations personnelles
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('DocumentUpload')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(14,165,233,0.2)' }]}>
                <Icon name="cloud-upload" size={24} color="#0ea5e9" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Documents professionnels</Text>
                <Text style={styles.actionDescription}>
                  Télécharger vos documents d'entreprise
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(251,191,36,0.2)' }]}>
                <Icon name="support-agent" size={24} color="#fbbf24" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Support client</Text>
                <Text style={styles.actionDescription}>
                  Contactez notre équipe d'assistance
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(103,232,249,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.3)',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  kycCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  completedText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    position: 'relative',
  },
  primaryCard: {
    backgroundColor: '#0ea5e9',
    borderColor: 'rgba(14,165,233,0.3)',
  },
  warningCard: {
    backgroundColor: '#f59e0b',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  successCard: {
    backgroundColor: '#10b981',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  dangerCard: {
    backgroundColor: '#ef4444',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  statIcon: {
    marginBottom: 10,
    opacity: 0.8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  actionDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});

export default DashboardScreen;