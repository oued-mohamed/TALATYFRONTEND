import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SupportScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportCategories = [
    { id: 1, title: 'Problème de vérification KYC', icon: 'verified-user', color: '#67e8f9' },
    { id: 2, title: 'Problème de connexion', icon: 'lock', color: '#ef4444' },
    { id: 3, title: 'Erreur technique', icon: 'settings', color: '#f59e0b' },
    { id: 4, title: 'Question générale', icon: 'help', color: '#10b981' },
    { id: 5, title: 'Suggestion d\'amélioration', icon: 'lightbulb', color: '#8b5cf6' },
    { id: 6, title: 'Problème de sécurité', icon: 'security', color: '#06b6d4' },
  ];

  const faqItems = [
    {
      question: 'Comment puis-je compléter ma vérification KYC ?',
      answer: 'Pour compléter votre vérification KYC, allez dans la section KYC de l\'application et suivez les étapes : téléchargement de documents, vérification d\'identité, et prise de selfie.'
    },
    {
      question: 'Quels documents sont acceptés ?',
      answer: 'Nous acceptons les cartes d\'identité nationales, passeports, et permis de conduire valides. Les documents doivent être lisibles et non expirés.'
    },
    {
      question: 'Combien de temps prend la vérification ?',
      answer: 'La vérification prend généralement 1-3 jours ouvrables. Vous recevrez une notification une fois le processus terminé.'
    },
    {
      question: 'Que faire si ma vérification est rejetée ?',
      answer: 'Si votre vérification est rejetée, vous pouvez recommencer le processus en vous assurant que vos documents sont clairs, lisibles et correspondent à vos informations personnelles.'
    },
  ];

  const handleSubmitTicket = async () => {
    if (!selectedCategory) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire votre problème');
      return;
    }

    if (!userEmail.trim() || !userEmail.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler l'envoi du ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Ticket créé',
        'Votre demande de support a été envoyée. Notre équipe vous répondra dans les 24 heures.',
        [{ text: 'OK', onPress: () => {
          setMessage('');
          setSelectedCategory(null);
          setUserEmail('');
        }}]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer votre demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallSupport = () => {
    const phoneNumber = Platform.OS === 'ios' ? 'tel:+212682645795' : 'tel:+212682645795';
    Linking.openURL(phoneNumber);
  };

  const handleEmailSupport = () => {
    const email = 'mailto:support@businessekyc.com?subject=Demande de support';
    Linking.openURL(email);
  };

  const handleChatSupport = () => {
    Alert.alert(
      'Chat en direct',
      'Le chat en direct sera bientôt disponible. En attendant, vous pouvez nous contacter par email ou téléphone.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Centre d'aide</Text>
          <Text style={styles.headerSubtitle}>
            Comment pouvons-nous vous aider ?
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact rapide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact rapide</Text>
          <View style={styles.quickContactContainer}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
              <View style={[styles.contactIcon, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                <Icon name="phone" size={24} color="#10b981" />
              </View>
              <Text style={styles.contactText}>Appeler</Text>
            </TouchableOpacity>
            
            
            <TouchableOpacity style={styles.contactButton} onPress={handleChatSupport}>
              <View style={[styles.contactIcon, { backgroundColor: 'rgba(251,191,36,0.2)' }]}>
                <Icon name="chat" size={24} color="#fbbf24" />
              </View>
              <Text style={styles.contactText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Icon name="help-outline" size={20} color="#67e8f9" />
                <Text style={styles.faqQuestion}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Créer un ticket */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créer un ticket de support</Text>
          
          <Text style={styles.inputLabel}>Catégorie du problème</Text>
          <View style={styles.categoriesContainer}>
            {supportCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? '#fff' : category.color} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Votre email</Text>
          <TextInput
            style={styles.input}
            placeholder="votre.email@example.com"
            placeholderTextColor="#64748b"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Description du problème</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Décrivez votre problème en détail..."
            placeholderTextColor="#64748b"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmitTicket}
            disabled={isSubmitting}
          >
            <Icon 
              name={isSubmitting ? "hourglass-empty" : "send"} 
              size={20} 
              color="#fff" 
              style={styles.buttonIcon}
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le ticket'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informations de contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactInfoHeader}>
              <Icon name="phone" size={20} color="#10b981" />
              <Text style={styles.contactInfoTitle}>Téléphone</Text>
            </View>
            <Text style={styles.contactInfoText}>+212 682 64 57 95</Text>
            <Text style={styles.contactInfoHours}>Lun-Ven: 9h00-18h00</Text>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactInfoHeader}>
              <Icon name="email" size={20} color="#0ea5e9" />
              <Text style={styles.contactInfoTitle}>Email</Text>
            </View>
            <Text style={styles.contactInfoText}>support@businessekyc.com</Text>
            <Text style={styles.contactInfoHours}>Réponse sous 24h</Text>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactInfoHeader}>
              <Icon name="location-on" size={20} color="#67e8f9" />
              <Text style={styles.contactInfoTitle}>Adresse</Text>
            </View>
            <Text style={styles.contactInfoText}>
              123 Rue de la Technologie{'\n'}
              75001 Casablanca, Maroc
            </Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: '#1e293b',
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  quickContactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#334155',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginLeft: 28,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    marginTop: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  selectedCategory: {
    backgroundColor: '#0ea5e9',
    borderColor: 'rgba(14,165,233,0.3)',
  },
  categoryText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginLeft: 6,
    flexShrink: 1,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#334155',
    color: '#fff',
    marginBottom: 15,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  disabledButton: {
    backgroundColor: '#475569',
    borderColor: '#64748b',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  contactInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  contactInfoText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
    marginLeft: 28,
  },
  contactInfoHours: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginLeft: 28,
  },
});

export default SupportScreen;