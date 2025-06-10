import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onboardingSteps = [
    {
      id: 1,
      title: 'Bienvenue dans BusinessEKYC',
      subtitle: 'La solution complète pour votre vérification d\'identité',
      description: 'Vérifiez votre identité en quelques étapes simples et sécurisées.',
      image: '🏢',
      color: '#007AFF',
    },
    {
      id: 2,
      title: 'Vérification Rapide',
      subtitle: 'Processus optimisé en 3 étapes',
      description: 'Téléchargez vos documents, prenez une photo et c\'est terminé !',
      image: '⚡',
      color: '#34C759',
    },
    {
      id: 3,
      title: 'Sécurité Maximale',
      subtitle: 'Vos données sont protégées',
      description: 'Chiffrement de bout en bout et conformité aux normes internationales.',
      image: '🔒',
      color: '#FF3B30',
    },
    {
      id: 4,
      title: 'Support 24/7',
      subtitle: 'Une équipe à votre service',
      description: 'Notre équipe de support est disponible pour vous accompagner.',
      image: '🤝',
      color: '#FF9500',
    },
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -(currentStep + 1) * width,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleGetStarted();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -(currentStep - 1) * width,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const goToStep = (stepIndex) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -stepIndex * width,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(stepIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleGetStarted = () => {
    if (user) {
      navigation.replace('Main');
    } else {
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: currentStepData.color }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentStepData.color} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.emoji}>{currentStepData.image}</Text>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </Animated.View>
      </View>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {onboardingSteps.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.activeDot,
            ]}
            onPress={() => goToStep(index)}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.backButton]}
          onPress={prevStep}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.disabledText
          ]}>
            Retour
          </Text>
        </TouchableOpacity>

        <View style={styles.stepCounter}>
          <Text style={styles.stepText}>
            {currentStep + 1} / {onboardingSteps.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={nextStep}
        >
          <Text style={styles.navButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Features List (shown on last step) */}
      {currentStep === onboardingSteps.length - 1 && (
        <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Vérification en moins de 5 minutes</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Conformité RGPD et sécurité garantie</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Support multilingue disponible</Text>
          </View>
        </Animated.View>
      )}

      {/* Quick Start Button */}
      <TouchableOpacity style={styles.quickStartButton} onPress={handleGetStarted}>
        <Text style={styles.quickStartText}>Accès rapide →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  emoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextButton: {
    backgroundColor: '#fff',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  disabledText: {
    opacity: 0.5,
  },
  stepCounter: {
    paddingHorizontal: 15,
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  featuresContainer: {
    position: 'absolute',
    bottom: 120,
    left: 30,
    right: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  quickStartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickStartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WelcomeScreen;