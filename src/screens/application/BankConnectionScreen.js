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
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

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
            onPress: () => navigation.navigate('FinancialAnalysis'),
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
    Alert.alert('Saisie manuelle', 'Cette fonctionnalité sera bientôt disponible.');
  };

  const handleDocumentUpload = () => {
    Alert.alert('Upload de documents', 'Cette fonctionnalité sera bientôt disponible.');
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
          placeholderTextColor={colors.gray}
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
          placeholderTextColor={colors.gray}
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
          placeholderTextColor={colors.gray}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  connectedAccountsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  accountCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  accountInfo: {
    flex: 1,
  },
  accountBank: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  accountType: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.6,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
    marginBottom: 2,
  },
  lastSync: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.6,
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syncButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  syncButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  disconnectButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  disconnectButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  methodsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  methodCardActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    marginBottom: spacing.xs,
  },
  methodTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginRight: spacing.sm,
  },
  recommendedBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  methodSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 3,
  },
  methodDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    opacity: 0.6,
  },
  methodArrow: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.5,
  },
  bankSelectionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bankCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bankCardActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bankLogo: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  bankName: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  credentialsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.white,
    lineHeight: 20,
    opacity: 0.9,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: colors.white,
  },
  connectButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  connectButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  connectButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  benefitsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  securityContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: spacing.xl,
  },
  securityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  securityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default BankConnectionScreen;