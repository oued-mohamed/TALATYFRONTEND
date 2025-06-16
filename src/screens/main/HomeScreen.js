import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useKYC } from '../../context/KYCContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { progress: kycProgress } = useKYC();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh user data and KYC status
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateToKYC = () => {
    navigation.navigate('KYC', { screen: 'KYCWelcome' });
  };

  const navigateToCreditApplication = () => {
    if (user?.kycStatus === 'completed') {
      navigation.navigate('Application', { screen: 'CreditApplication' });
    } else {
      navigation.navigate('KYC', { screen: 'KYCWelcome' });
    }
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderProfileCard = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {getGreeting()} {user?.firstName},
          </Text>
          <Text style={styles.subtitle}>prêt à booster votre activité ?</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={navigateToProfile}
        >
          <Icon name="person" size={32} color="#67e8f9" />
        </TouchableOpacity>
      </View>

      {(user?.profileCompletion || 0) < 100 && (
        <View style={styles.profileCompletion}>
          <Text style={styles.completionTitle}>
            Votre profil est incomplet.
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${user?.profileCompletion || 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{user?.profileCompletion || 0}%</Text>
          </View>
          
          <View style={styles.completionSteps}>
            <View style={styles.stepItem}>
              <Icon 
                name={user?.isEmailVerified ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={user?.isEmailVerified ? "#10b981" : "#64748b"} 
              />
              <Text style={[
                styles.stepText,
                user?.isEmailVerified && styles.completedStep
              ]}>
                Vérification de votre adresse e-mail
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <Icon 
                name={user?.isPhoneVerified ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={user?.isPhoneVerified ? "#10b981" : "#64748b"} 
              />
              <Text style={[
                styles.stepText,
                user?.isPhoneVerified && styles.completedStep
              ]}>
                Vérification de votre numéro de téléphone
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <Icon 
                name={user?.businessInfo?.companyName ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={user?.businessInfo?.companyName ? "#10b981" : "#64748b"} 
              />
              <Text style={[
                styles.stepText,
                user?.businessInfo?.companyName && styles.completedStep
              ]}>
                Informations sur votre entreprise
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.completeButton}
            onPress={navigateToProfile}
          >
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.completeButtonText}>Compléter mes informations</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderApplicationCard = () => (
    <View style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <Icon name="description" size={24} color="#67e8f9" />
        <Text style={styles.cardTitle}>Mes demandes</Text>
      </View>
      
      <View style={styles.applicationStatus}>
        <Text style={styles.applicationText}>
          Vous avez 1 demande de crédit en cours.
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '90%' }]} />
          </View>
          <Text style={styles.progressText}>90%</Text>
        </View>
        
        <View style={styles.applicationSteps}>
          <View style={styles.stepItem}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={[styles.stepText, styles.completedStep]}>
              Connexion avec votre banque
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={[styles.stepText, styles.completedStep]}>
              Analyse de vos données financières
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <Icon name="check-circle" size={16} color="#10b981" />
            <Text style={[styles.stepText, styles.completedStep]}>
              Vérification de votre identité (KYC)
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <Icon name="radio-button-unchecked" size={16} color="#64748b" />
            <Text style={styles.stepText}>
              Ajout de documents additionnels
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={navigateToCreditApplication}
        >
          <Icon name="play-arrow" size={20} color="#fff" />
          <Text style={styles.continueButtonText}>Poursuivre la demande</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToKYC}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(103,232,249,0.2)' }]}>
            <Icon name="verified-user" size={24} color="#67e8f9" />
          </View>
          <Text style={styles.actionText}>Vérification KYC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToCreditApplication}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
            <Icon name="account-balance" size={24} color="#10b981" />
          </View>
          <Text style={styles.actionText}>Demande de crédit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('DocumentUpload')}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(14,165,233,0.2)' }]}>
            <Icon name="cloud-upload" size={24} color="#0ea5e9" />
          </View>
          <Text style={styles.actionText}>Documents</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Support')}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(251,191,36,0.2)' }]}>
            <Icon name="help" size={24} color="#fbbf24" />
          </View>
          <Text style={styles.actionText}>Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      <SafeAreaView style={styles.safeArea}>
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
          {renderProfileCard()}
          {renderApplicationCard()}
          {renderQuickActions()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(103,232,249,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.3)',
  },
  profileCompletion: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 15,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    backgroundColor: '#0ea5e9',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#67e8f9',
    fontWeight: '600',
    minWidth: 35,
  },
  completionSteps: {
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
  },
  completedStep: {
    color: '#10b981',
  },
  completeButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  applicationCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
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
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  applicationStatus: {
    // Application status styles
  },
  applicationText: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 15,
  },
  applicationSteps: {
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;