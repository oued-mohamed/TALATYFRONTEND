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
} from 'react-native';

const SupportScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportCategories = [
    { id: 1, title: 'Problème de vérification KYC', icon: '🔍' },
    { id: 2, title: 'Problème de connexion', icon: '🔐' },
    { id: 3, title: 'Erreur technique', icon: '⚙️' },
    { id: 4, title: 'Question générale', icon: '❓' },
    { id: 5, title: 'Suggestion d\'amélioration', icon: '💡' },
    { id: 6, title: 'Problème de sécurité', icon: '🛡️' },
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
    const phoneNumber = Platform.OS === 'ios' ? 'tel:+33123456789' : 'tel:+33123456789';
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Centre d'aide</Text>
        <Text style={styles.headerSubtitle}>
          Comment pouvons-nous vous aider aujourd'hui ?
        </Text>
      </View>

      {/* Contact rapide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact rapide</Text>
        <View style={styles.quickContactContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>Appeler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactText}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleChatSupport}>
            <Text style={styles.contactIcon}>💬</Text>
            <Text style={styles.contactText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
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
              <Text style={styles.categoryIcon}>{category.icon}</Text>
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
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Description du problème</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Décrivez votre problème en détail..."
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
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le ticket'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informations de contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Autres moyens de contact</Text>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoTitle}>📞 Téléphone</Text>
          <Text style={styles.contactInfoText}>+33 1 23 45 67 89</Text>
          <Text style={styles.contactInfoHours}>Lun-Ven: 9h00-18h00</Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoTitle}>📧 Email</Text>
          <Text style={styles.contactInfoText}>support@businessekyc.com</Text>
          <Text style={styles.contactInfoHours}>Réponse sous 24h</Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoTitle}>📍 Adresse</Text>
          <Text style={styles.contactInfoText}>
            123 Rue de la Technologie{'\n'}
            75001 Paris, France
          </Text>
        </View>
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
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#f8f8f8',
    flex: 1,
    marginHorizontal: 5,
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
    borderBottomColor: '#f0f0f0',
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  contactInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  contactInfoHours: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SupportScreen;