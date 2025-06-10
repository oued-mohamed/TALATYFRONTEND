import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const BankConnectionScreen = ({ navigation }) => {
  const { user, updateBankConnection } = useAuth();
  const [connectionMethod, setConnectionMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, success, error
  const [bankCredentials, setBankCredentials] = useState({
    username: '',
    password: '',
    customerId: '',
  });
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const connectionMethods = [
    {
      id: 'automatic',
      title: 'Connexion automatique',
      subtitle: 'Via votre banque en ligne',
      icon: '🔗',
      description: 'Connexion sécurisée avec vos identifiants bancaires',
      recommended: true,
    },
    {
      id: 'manual',
      title: 'Saisie manuelle',
      subtitle: 'Informations bancaires',
      icon: '✍️',
      description: 'Saisir manuellement vos informations de compte',
      recommended: false,
    },
    {
      id: 'document',
      title: 'Upload de documents',
      subtitle: 'RIB et relevés',
      icon: '📄',
      description: 'Télécharger vos documents bancaires',
      recommended: false,
    },
  ];

  const popularBanks = [
    { id: 'bnp', name: 'BNP Paribas', logo: '🏛️', color: '#00B050' },
    { id: 'ca', name: 'Crédit Agricole', logo: '🌾', color: '#52B553' },
    { id: 'sg', name: 'Société Générale', logo: '🔴', color: '#E60012' },
    { id: 'lcl', name: 'LCL', logo: '🏦', color: '#1E3A8A' },
    { id: 'cm', name: 'Crédit Mutuel', logo: '🤝', color: '#003366' },
    { id: 'banque_postale', name: 'La Banque Postale', logo: '📮', color: '#FFD700' },
    { id: 'hsbc', name: 'HSBC', logo: '🏰', color: '#DB0011' },
    { id: 'ing', name: 'ING', logo: '🦁', color: '#FF6200' },
    { id: 'revolut', name: 'Revolut', logo: '💳', color: '#0075EB' },
    { id: 'n26', name: 'N26', logo: '⚡', color: '#36A9AE' },
    { id: 'boursorama', name: 'Boursorama', logo: '📈', color: '#FF6600' },
    { id: 'fortuneo', name: 'Fortuneo', logo: '🎯', color: '#E20613' },
  ];

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Charger les comptes connectés existants
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      // Simuler le chargement des comptes connectés
      const mockAccounts = [
        {
          id: 'acc1',
          bankName: 'BNP Paribas',
          accountNumber: '****1234',
          accountType: 'Compte courant',
          balance: '2,450.67',
          currency: '€',
          lastSync: '2025-01-18 14:30',
          status: 'connected',
        },
      ];
      setConnectedAccounts(mockAccounts);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const handleMethodSelection = (method) => {
    setConnectionMethod(method);
    if (method === 'automatic') {
      // Continuer vers la sélection de banque
    } else if (method === 'manual') {
      handleManualConnection();
    } else if (method === 'document') {
      handleDocumentUpload();
    }
  };

  const handleBankSelection = (bank) => {
    setSelectedBank(bank);
  };

  const handleAutomaticConnection = async () => {
    if (!selectedBank) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre banque');
      return;
    }

    if (!bankCredentials.username || !bankCredentials.password) {
      Alert.alert('Erreur', 'Veuillez saisir vos identifiants');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // Simuler la connexion bancaire
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simuler une connexion réussie
      const newAccount = {
        id: `acc${Date.now()}`,
        bankName: selectedBank.name,
        accountNumber: '****5678',
        accountType: 'Compte courant',
        balance: '5,847.32',
        currency: '€',
        lastSync: new Date().toLocaleString('fr-FR'),
        status: 'connected',
      };

      setConnectedAccounts(prev => [...prev, newAccount]);
      setConnectionStatus('success');

      // Mettre à jour le contexte utilisateur
      if (updateBankConnection) {
        await updateBankConnection(newAccount);
      }

      Alert.alert(
        'Connexion réussie !',
        `Votre compte ${selectedBank.name} a été connecté avec succès.`,
        [
          {
            text: 'Voir mes comptes',
            onPress: () => navigation.navigate('ConnectedAccounts'),
          },
          {
            text: 'Continuer',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      setConnectionStatus('error');
      Alert.alert(
        'Erreur de connexion',
        'Impossible de se connecter à votre banque. Vérifiez vos identifiants et réessayez.',
        [
          { text: 'Réessayer', onPress: () => setConnectionStatus('idle') },
          { text: 'Annuler', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualConnection = () => {
    navigation.navigate('ManualBankEntry');
  };

  const handleDocumentUpload = () => {
    navigation.navigate('BankDocumentUpload');
  };

  const handleDisconnectAccount = (accountId) => {
    Alert.alert(
      'Déconnecter le compte',
      'Êtes-vous sûr de vouloir déconnecter ce compte bancaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            setConnectedAccounts(prev => 
              prev.filter(account => account.id !== accountId)
            );
          },
        },
      ]
    );
  };

  const renderConnectionMethods = () => (
    <View style={styles.methodsContainer}>
      <Text style={styles.sectionTitle}>Comment souhaitez-vous connecter votre banque ?</Text>
      {connectionMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            connectionMethod === method.id && styles.methodCardActive,
          ]}
          onPress={() => handleMethodSelection(method.id)}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.methodEmoji}>{method.icon}</Text>
          </View>
          <View style={styles.methodContent}>
            <View style={styles.methodHeader}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              {method.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              )}
            </View>
            <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
          </View>
          <View style={styles.methodArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBankSelection = () => (
    <View style={styles.bankSelectionContainer}>
      <Text style={styles.sectionTitle}>Sélectionnez votre banque</Text>
      <View style={styles.banksGrid}>
        {popularBanks.map((bank) => (
          <TouchableOpacity
            key={bank.id}
            style={[
              styles.bankCard,
              selectedBank?.id === bank.id && styles.bankCardActive,
            ]}
            onPress={() => handleBankSelection(bank)}
          >
            <Text style={styles.bankLogo}>{bank.logo}</Text>
            <Text style={styles.bankName}>{bank.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCredentialsForm = () => (
    <View style={styles.credentialsContainer}>
      <Text style={styles.sectionTitle}>Identifiants {selectedBank?.name}</Text>
      
      <View style={styles.securityNotice}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Vos identifiants sont chiffrés et sécurisés. Nous ne stockons jamais vos mots de passe.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Identifiant / Numéro client</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre identifiant bancaire"
          value={bankCredentials.username}
          onChangeText={(text) => setBankCredentials(prev => ({ ...prev, username: text }))}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          value={bankCredentials.password}
          onChangeText={(text) => setBankCredentials(prev => ({ ...prev, password: text }))}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Numéro client (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Si demandé par votre banque"
          value={bankCredentials.customerId}
          onChangeText={(text) => setBankCredentials(prev => ({ ...prev, customerId: text }))}
        />
      </View>

      <TouchableOpacity
        style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
        onPress={handleAutomaticConnection}
        disabled={isConnecting}
      >
        <Text style={styles.connectButtonText}>
          {isConnecting ? 'Connexion en cours...' : 'Connecter mon compte'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderConnectedAccounts = () => (
    <View style={styles.connectedAccountsContainer}>
      <Text style={styles.sectionTitle}>Comptes connectés</Text>
      {connectedAccounts.map((account) => (
        <View key={account.id} style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountBank}>{account.bankName}</Text>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
              <Text style={styles.accountType}>{account.accountType}</Text>
            </View>
            <View style={styles.accountBalance}>
              <Text style={styles.balanceAmount}>{account.balance} {account.currency}</Text>
              <Text style={styles.lastSync}>Sync: {account.lastSync}</Text>
            </View>
          </View>
          <View style={styles.accountActions}>
            <TouchableOpacity style={styles.syncButton}>
              <Text style={styles.syncButtonText}>🔄 Synchroniser</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.disconnectButton}
              onPress={() => handleDisconnectAccount(account.id)}
            >
              <Text style={styles.disconnectButtonText}>Déconnecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    if (connectionMethod === '' || connectionMethod === 'manual' || connectionMethod === 'document') {
      return renderConnectionMethods();
    }

    if (connectionMethod === 'automatic' && !selectedBank) {
      return (
        <>
          {renderConnectionMethods()}
          {renderBankSelection()}
        </>
      );
    }

    if (connectionMethod === 'automatic' && selectedBank) {
      return (
        <>
          {renderConnectionMethods()}
          {renderBankSelection()}
          {renderCredentialsForm()}
        </>
      );
    }

    return renderConnectionMethods();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion bancaire</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connected Accounts */}
        {connectedAccounts.length > 0 && renderConnectedAccounts()}

        {/* Main Content */}
        {renderContent()}

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Pourquoi connecter votre banque ?</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Vérification automatique de vos revenus</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📊</Text>
            <Text style={styles.benefitText}>Analyse de votre capacité d'emprunt</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🚀</Text>
            <Text style={styles.benefitText}>Traitement accéléré de vos demandes</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={styles.benefitText}>Sécurité bancaire renforcée</Text>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityContainer}>
          <Text style={styles.securityTitle}>🛡️ Votre sécurité, notre priorité</Text>
          <Text style={styles.securityDescription}>
            • Chiffrement de niveau bancaire (256-bit SSL){'\n'}
            • Aucun stockage de vos mots de passe{'\n'}
            • Conformité PSD2 et RGPD{'\n'}
            • Audits de sécurité réguliers{'\n'}
            • Accès lecture seule à vos comptes
          </Text>
        </View>
      </ScrollView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  connectedAccountsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  accountCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  accountInfo: {
    flex: 1,
  },
  accountBank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: '#999',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 11,
    color: '#999',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syncButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  syncButtonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  disconnectButtonText: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: '600',
  },
  methodsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  methodCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  methodEmoji: {
    fontSize: 24,
  },
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  recommendedBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  methodDescription: {
    fontSize: 12,
    color: '#999',
  },
  methodArrow: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#ccc',
  },
  bankSelectionContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bankCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  bankCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  bankLogo: {
    fontSize: 24,
    marginBottom: 5,
  },
  bankName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  credentialsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
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
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  connectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  securityContainer: {
    backgroundColor: '#f8f9fa',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default BankConnectionScreen;