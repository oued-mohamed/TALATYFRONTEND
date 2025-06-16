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
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  // ✅ FIX: Get updateProfile function from AuthContext
  const { user, logout, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
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
    // ✅ FIX: Load actual user data from AuthContext
    loadProfileData();
  }, [user]);

  const loadProfileData = () => {
    console.log('📱 Loading profile data from user:', user);
    
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        nationality: user.nationality || user.country || '',
      });
      
      // Load notification preferences
      setNotifications({
        email: user.notifications !== undefined ? user.notifications : true,
        sms: user.smsNotifications !== undefined ? user.smsNotifications : false,
        push: user.pushNotifications !== undefined ? user.pushNotifications : true,
      });
    }
  };

  // ✅ FIX: Actually save the data using updateProfile from AuthContext
  const handleSave = async () => {
    try {
      console.log('💾 Saving profile data...', profileData);
      setIsSaving(true);

      // Prepare the data to save
      const dataToSave = {
        ...profileData,
        notifications: notifications.email,
        smsNotifications: notifications.sms,
        pushNotifications: notifications.push,
      };

      console.log('📤 Calling updateProfile with data:', dataToSave);

      // ✅ FIX: Call the actual updateProfile function
      const result = await updateProfile(dataToSave);
      
      console.log('📥 Update result:', result);

      if (result && result.success) {
        Alert.alert(
          'Succès',
          'Votre profil a été mis à jour avec succès',
          [{ text: 'OK', onPress: () => setIsEditing(false) }]
        );
      } else {
        throw new Error(result?.message || 'Échec de la mise à jour');
      }
    } catch (error) {
      console.error('❌ Profile save error:', error);
      Alert.alert(
        'Erreur', 
        'Impossible de sauvegarder les modifications: ' + error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfileData(); // Reload original data
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
            // Account deletion logic would go here
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
        placeholderTextColor="#64748b"
      />
    </View>
  );

  // ✅ FIX: Display actual user name
  const displayName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email 
    : 'Utilisateur';

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
        
        <Text style={styles.headerTitle}>Mon Profil</Text>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Header avec photo de profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Icon name="camera-alt" size={16} color="#67e8f9" />
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
              disabled={isSaving}
            >
              <Icon name={isEditing ? "close" : "edit"} size={20} color="#67e8f9" />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Annuler' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          </View>

          <ProfileField
            label="Prénom"
            value={profileData.firstName}
            onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
          />

          <ProfileField
            label="Nom"
            value={profileData.lastName}
            onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
          />

          <ProfileField
            label="Email"
            value={profileData.email}
            onChangeText={(text) => setProfileData({ ...profileData, email: text })}
          />

          <ProfileField
            label="Téléphone"
            value={profileData.phoneNumber}
            onChangeText={(text) => setProfileData({ ...profileData, phoneNumber: text })}
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
              <TouchableOpacity 
                style={[styles.saveButton, (isSaving || isLoading) && styles.disabledButton]} 
                onPress={handleSave}
                disabled={isSaving || isLoading}
              >
                <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isSaving}
              >
                <Icon name="close" size={20} color="#64748b" style={styles.buttonIcon} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Paramètres de notification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <Icon name="email" size={20} color="#67e8f9" />
              <Text style={styles.notificationLabel}>Notifications par email</Text>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={(value) => setNotifications({ ...notifications, email: value })}
              disabled={!isEditing}
              trackColor={{ false: '#475569', true: '#0ea5e9' }}
              thumbColor={notifications.email ? '#67e8f9' : '#94a3b8'}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <Icon name="message" size={20} color="#67e8f9" />
              <Text style={styles.notificationLabel}>Notifications SMS</Text>
            </View>
            <Switch
              value={notifications.sms}
              onValueChange={(value) => setNotifications({ ...notifications, sms: value })}
              disabled={!isEditing}
              trackColor={{ false: '#475569', true: '#0ea5e9' }}
              thumbColor={notifications.sms ? '#67e8f9' : '#94a3b8'}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <Icon name="notifications" size={20} color="#67e8f9" />
              <Text style={styles.notificationLabel}>Notifications push</Text>
            </View>
            <Switch
              value={notifications.push}
              onValueChange={(value) => setNotifications({ ...notifications, push: value })}
              disabled={!isEditing}
              trackColor={{ false: '#475569', true: '#0ea5e9' }}
              thumbColor={notifications.push ? '#67e8f9' : '#94a3b8'}
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
            <View style={styles.actionLeft}>
              <Icon name="lock" size={20} color="#67e8f9" />
              <Text style={styles.actionText}>Changer le mot de passe</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('KYC')}
          >
            <View style={styles.actionLeft}>
              <Icon name="verified-user" size={20} color="#67e8f9" />
              <Text style={styles.actionText}>Vérification KYC</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <View style={styles.actionLeft}>
              <Icon name="security" size={20} color="#67e8f9" />
              <Text style={styles.actionText}>Paramètres de sécurité</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Icon name="logout" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Icon name="delete" size={20} color="#ef4444" style={styles.buttonIcon} />
            <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#1e293b',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    borderWidth: 3,
    borderColor: '#334155',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  changePhotoText: {
    color: '#67e8f9',
    fontSize: 14,
    marginLeft: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#94a3b8',
  },
  section: {
    backgroundColor: '#1e293b',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#fff',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  editButtonText: {
    color: '#67e8f9',
    fontSize: 14,
    marginLeft: 5,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 5,
    fontWeight: '500',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#334155',
    color: '#fff',
  },
  disabledInput: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
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
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  disabledButton: {
    backgroundColor: '#475569',
    borderColor: '#64748b',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    marginLeft: 5,
  },
  buttonIcon: {
    marginRight: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default ProfileScreen;