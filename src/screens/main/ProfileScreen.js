import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationality: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  useEffect(() => {
    // Charger les données du profil
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    // Simuler le chargement des données du profil
    setProfileData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+33 6 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      dateOfBirth: '15/06/1990',
      nationality: 'Française',
    });
  };

  const handleSave = async () => {
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Succès',
        'Votre profil a été mis à jour avec succès',
        [{ text: 'OK', onPress: () => setIsEditing(false) }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfileData(); // Recharger les données originales
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // Logique de suppression du compte
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé');
            logout();
          },
        },
      ]
    );
  };

  const ProfileField = ({ label, value, onChangeText, editable = true, multiline = false }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          !editable && styles.disabledInput,
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={isEditing && editable}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header avec photo de profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Changer la photo</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{profileData.name}</Text>
        <Text style={styles.userEmail}>{profileData.email}</Text>
      </View>

      {/* Informations personnelles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Annuler' : 'Modifier'}
            </Text>
          </TouchableOpacity>
        </View>

        <ProfileField
          label="Nom complet"
          value={profileData.name}
          onChangeText={(text) => setProfileData({ ...profileData, name: text })}
        />

        <ProfileField
          label="Email"
          value={profileData.email}
          onChangeText={(text) => setProfileData({ ...profileData, email: text })}
        />

        <ProfileField
          label="Téléphone"
          value={profileData.phone}
          onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
        />

        <ProfileField
          label="Adresse"
          value={profileData.address}
          onChangeText={(text) => setProfileData({ ...profileData, address: text })}
          multiline
        />

        <ProfileField
          label="Date de naissance"
          value={profileData.dateOfBirth}
          onChangeText={(text) => setProfileData({ ...profileData, dateOfBirth: text })}
        />

        <ProfileField
          label="Nationalité"
          value={profileData.nationality}
          onChangeText={(text) => setProfileData({ ...profileData, nationality: text })}
        />

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Paramètres de notification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.notificationItem}>
          <Text style={styles.notificationLabel}>Notifications par email</Text>
          <Switch
            value={notifications.email}
            onValueChange={(value) => setNotifications({ ...notifications, email: value })}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationLabel}>Notifications SMS</Text>
          <Switch
            value={notifications.sms}
            onValueChange={(value) => setNotifications({ ...notifications, sms: value })}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationLabel}>Notifications push</Text>
          <Switch
            value={notifications.push}
            onValueChange={(value) => setNotifications({ ...notifications, push: value })}
          />
        </View>
      </View>

      {/* Actions du compte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.actionText}>Changer le mot de passe</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('KYC')}
        >
          <Text style={styles.actionText}>Vérification KYC</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate('SecuritySettings')}
        >
          <Text style={styles.actionText}>Paramètres de sécurité</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
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
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationLabel: {
    fontSize: 16,
    color: '#333',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  actionArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;