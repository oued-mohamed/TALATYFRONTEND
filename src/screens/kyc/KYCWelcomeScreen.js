import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useKYC } from '../../context/KYCContext';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const KYCWelcomeScreen = ({ navigation }) => {
  const { kycData, startKYC, isLoading, error } = useKYC();
  const { user } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [progressAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    // Professional entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    const progress = getProgressPercentage();
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  // Safe access to kycData properties with fallbacks
  const completedSteps = (kycData && kycData.completedSteps) ? kycData.completedSteps : [];
  const currentStep = (kycData && kycData.currentStep) ? kycData.currentStep : 'profile_setup';
  
  const kycSteps = [
    {
      id: 1,
      title: 'Identity Verification',
      subtitle: 'Document validation',
      description: 'Upload a clear photo of your government-issued ID',
      icon: 'verified_user',
      iconBg: '#334155',
      iconColor: '#67e8f9',
      duration: '2 min',
      status: completedSteps.includes('identity_verification') ? 'completed' : 'pending',
      stepKey: 'identity_verification',
      screenName: 'IdentityVerification',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Phone Verification',
      subtitle: 'SMS confirmation',
      description: 'Verify your mobile number with a secure code',
      icon: 'phone_android',
      iconBg: '#334155',
      iconColor: '#67e8f9',
      duration: '1 min',
      status: completedSteps.includes('phone_verification') ? 'completed' : 'pending',
      stepKey: 'phone_verification',
      screenName: 'PhoneVerification',
      priority: 'high',
    },
    {
      id: 3,
      title: 'Business Documents',
      subtitle: 'Corporate verification',
      description: 'Upload required business documentation',
      icon: 'business_center',
      iconBg: '#334155',
      iconColor: '#67e8f9',
      duration: '5 min',
      status: completedSteps.includes('document_upload') ? 'completed' : 'pending',
      stepKey: 'document_upload',
      screenName: 'DocumentUpload',
      priority: 'medium',
    },
  ];

  const securityFeatures = [
    {
      icon: 'security',
      title: 'Bank-grade Security',
      description: '256-bit SSL encryption',
    },
    {
      icon: 'verified',
      title: 'Regulatory Compliance',
      description: 'GDPR & KYC compliant',
    },
    {
      icon: 'lock',
      title: 'Data Protection',
      description: 'Zero data retention policy',
    },
    {
      icon: 'speed',
      title: 'Fast Processing',
      description: 'Instant verification',
    },
  ];

  const handleStartKYC = async () => {
    try {
      const result = await startKYC();
      
      if (result && result.success) {
        navigation.navigate('IdentityVerification');
      } else {
        Alert.alert('Verification Error', (result && result.message) || 'Unable to start verification process');
      }
    } catch (error) {
      console.error('Start KYC error:', error);
      Alert.alert('System Error', 'A technical error occurred. Please try again.');
    }
  };

  const handleContinueKYC = () => {
    const nextStep = getNextIncompleteStep();
    
    if (nextStep) {
      navigation.navigate(nextStep.screenName);
    } else {
      navigation.navigate('KYCCompleted');
    }
  };

  const getNextIncompleteStep = () => {
    return kycSteps.find(step => step.status === 'pending') || null;
  };

  const getProgressPercentage = () => {
    const completedCount = kycSteps.filter(step => step.status === 'completed').length;
    return (completedCount / kycSteps.length) * 100;
  };

  const isKYCStarted = () => {
    return kycSteps.some(step => step.status === 'completed') || (kycData && kycData.status === 'in_progress');
  };

  const handleStepPress = (step) => {
    console.log('🚨 STEP PRESSED:', step.title);
    console.log('🎯 Navigating to:', step.screenName);
    
    try {
      if (step.screenName === 'DocumentUpload') {
        console.log('📄 Navigating to Documents screen...');
        navigation.navigate('DocumentUpload');
        return;
      }
      
      navigation.navigate(step.screenName);
      console.log('✅ Navigation successful to:', step.screenName);
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      Alert.alert(
        'Navigation Error', 
        `Unable to access ${step.title}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  const isStepClickable = (step) => {
    // Make DocumentUpload always clickable for testing
    if (step.stepKey === 'document_upload') {
      console.log('📋 Documents step - always clickable for testing');
      return true;
    }
    
    if (step.status === 'completed') {
      return true;
    }
    
    const stepIndex = kycSteps.findIndex(s => s.id === step.id);
    if (stepIndex === -1) return false;
    
    const previousStepsCompleted = kycSteps.slice(0, stepIndex).every(s => s.status === 'completed');
    
    return stepIndex === 0 || previousStepsCompleted;
  };

  const getStepStatusText = (step) => {
    if (step.status === 'completed') return 'Completed';
    if (isStepClickable(step)) return 'Available';
    return 'Pending';
  };

  const getStepStatusColor = (step) => {
    if (step.status === 'completed') return '#10b981';
    if (isStepClickable(step)) return '#0ea5e9';
    return '#64748b';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Professional Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Identity Verification</Text>
              <Text style={styles.headerSubtitle}>
                Secure • Compliant • Professional
              </Text>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.helpButton}>
                <Icon name="help-outline" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
          
          {isKYCStarted() && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Verification Progress</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(getProgressPercentage())}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressDescription}>
                {getNextIncompleteStep() 
                  ? `Next: ${getNextIncompleteStep().title}`
                  : 'Verification Complete'
                }
              </Text>
            </View>
          )}
        </Animated.View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Verification Steps */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Verification Steps</Text>
            <Text style={styles.sectionDescription}>
              Complete these steps to verify your business account
            </Text>
            
            {kycSteps.map((step, index) => {
              const clickable = isStepClickable(step);
              const statusColor = getStepStatusColor(step);
              
              return (
                <Animated.View
                  key={step.id}
                  style={[
                    styles.stepCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 30],
                          outputRange: [0, 30 + (index * 10)],
                        }),
                      }],
                    },
                  ]}
                >
                  <TouchableOpacity 
                    style={[
                      styles.stepButton,
                      !clickable && styles.stepButtonDisabled,
                      step.status === 'completed' && styles.stepButtonCompleted,
                    ]}
                    onPress={() => clickable ? handleStepPress(step) : null}
                    activeOpacity={clickable ? 0.7 : 1}
                    disabled={!clickable}
                  >
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepIconContainer, { backgroundColor: step.iconBg }]}>
                        <Icon 
                          name={step.icon} 
                          size={24} 
                          color={step.iconColor} 
                        />
                        {step.status === 'completed' && (
                          <View style={styles.completedOverlay}>
                            <Icon name="check" size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.stepInfo}>
                        <View style={styles.stepTitleRow}>
                          <Text style={styles.stepTitle}>{step.title}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>
                              {getStepStatusText(step)}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                        <Text style={styles.stepDescription}>{step.description}</Text>
                        
                        <View style={styles.stepMeta}>
                          <View style={styles.durationBadge}>
                            <Icon name="schedule" size={14} color="#94a3b8" />
                            <Text style={styles.durationText}>{step.duration}</Text>
                          </View>
                          
                          {step.priority === 'high' && (
                            <View style={styles.priorityBadge}>
                              <Text style={styles.priorityText}>Required</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {clickable && (
                      <View style={styles.stepRight}>
                        <Icon 
                          name="chevron-right" 
                          size={24} 
                          color={step.status === 'completed' ? '#10b981' : '#0ea5e9'} 
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Security Features */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Security & Compliance</Text>
            <Text style={styles.sectionDescription}>
              Your data is protected by enterprise-grade security
            </Text>
            
            <View style={styles.securityGrid}>
              {securityFeatures.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.securityCard,
                    {
                      transform: [{
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      }],
                    },
                  ]}
                >
                  <View style={styles.securityIconContainer}>
                    <Icon name={feature.icon} size={20} color="#67e8f9" />
                  </View>
                  <Text style={styles.securityTitle}>{feature.title}</Text>
                  <Text style={styles.securityDescription}>{feature.description}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Trust Indicators */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.trustCard}>
              <View style={styles.trustHeader}>
                <Icon name="verified" size={28} color="#10b981" />
                <View style={styles.trustContent}>
                  <Text style={styles.trustTitle}>Trusted by 10,000+ businesses</Text>
                  <Text style={styles.trustDescription}>
                    Secure verification process used by leading companies worldwide
                  </Text>
                </View>
              </View>
              
              <View style={styles.trustStats}>
                <View style={styles.trustStat}>
                  <Text style={styles.trustStatNumber}>99.9%</Text>
                  <Text style={styles.trustStatLabel}>Success Rate</Text>
                </View>
                <View style={styles.trustStat}>
                  <Text style={styles.trustStatNumber}> 5min</Text>
                  <Text style={styles.trustStatLabel}>Average Time</Text>
                </View>
                <View style={styles.trustStat}>
                  <Text style={styles.trustStatNumber}>24/7</Text>
                  <Text style={styles.trustStatLabel}>Support</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Professional Action Bar */}
        <Animated.View 
          style={[
            styles.actionBar,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {isKYCStarted() ? (
            <TouchableOpacity 
              style={[styles.primaryAction, isLoading && styles.actionDisabled]} 
              onPress={handleContinueKYC}
              disabled={isLoading}
            >
              <Icon name="play-arrow" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>
                {isLoading ? 'Loading...' : 'Continue Verification'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryAction, isLoading && styles.actionDisabled]} 
              onPress={handleStartKYC}
              disabled={isLoading}
            >
              <Icon name="security" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>
                {isLoading ? 'Starting...' : 'Start Verification'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.secondaryAction} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryActionText}>Complete Later</Text>
          </TouchableOpacity>
        </Animated.View>
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
  
  // Professional Header
  header: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 40,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  
  // Progress Section
  progressSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#475569',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#67e8f9',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#475569',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 3,
  },
  progressDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  
  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  // Professional Step Cards
  stepCard: {
    marginBottom: 12,
  },
  stepButton: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepButtonDisabled: {
    opacity: 0.5,
  },
  stepButtonCompleted: {
    borderColor: '#10b981',
    borderWidth: 1.5,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  stepLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#475569',
  },
  completedOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  durationText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
    fontWeight: '500',
  },
  priorityBadge: {
    backgroundColor: 'rgba(251,191,36,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  priorityText: {
    fontSize: 10,
    color: '#fbbf24',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stepRight: {
    marginLeft: 12,
  },
  
  // Security Grid
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  securityCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
  
  // Trust Card
  trustCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustContent: {
    marginLeft: 12,
    flex: 1,
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  trustDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  trustStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  trustStat: {
    alignItems: 'center',
  },
  trustStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#67e8f9',
    marginBottom: 4,
  },
  trustStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  
  // Professional Action Bar
  actionBar: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  primaryAction: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  actionDisabled: {
    backgroundColor: '#475569',
    borderColor: '#64748b',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#67e8f9',
    letterSpacing: 0.3,
  },
});

export default KYCWelcomeScreen;