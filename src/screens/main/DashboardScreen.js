import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
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
    if (step === 0) return { status: 'Non commencé', color: '#FF6B6B' };
    if (step < 4) return { status: 'En cours', color: '#FFD93D' };
    return { status: 'Terminé', color: '#6BCF7F' };
  };

  const kycStatus = getKYCStatus();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* KYC Status Card */}
      <View style={styles.kycCard}>
        <Text style={styles.cardTitle}>Statut de vérification KYC</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: kycStatus.color }]} />
          <Text style={styles.statusText}>{kycStatus.status}</Text>
        </View>
        {step < 4 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('KYC')}
          >
            <Text style={styles.continueButtonText}>
              {step === 0 ? 'Commencer la vérification' : 'Continuer la vérification'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statNumber}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Total Demandes</Text>
          </View>
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statNumber}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.successCard]}>
            <Text style={styles.statNumber}>{stats.approvedApplications}</Text>
            <Text style={styles.statLabel}>Approuvées</Text>
          </View>
          <View style={[styles.statCard, styles.dangerCard]}>
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
          <Text style={styles.actionTitle}>Nouvelle vérification KYC</Text>
          <Text style={styles.actionDescription}>
            Commencer un nouveau processus de vérification d'identité
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionTitle}>Gérer le profil</Text>
          <Text style={styles.actionDescription}>
            Modifier vos informations personnelles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.actionTitle}>Historique des demandes</Text>
          <Text style={styles.actionDescription}>
            Consulter l'historique de vos vérifications
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  kycCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
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
  },
  primaryCard: {
    backgroundColor: '#007AFF',
  },
  warningCard: {
    backgroundColor: '#FFD93D',
  },
  successCard: {
    backgroundColor: '#6BCF7F',
  },
  dangerCard: {
    backgroundColor: '#FF6B6B',
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
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default DashboardScreen;