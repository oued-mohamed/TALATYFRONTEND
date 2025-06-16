import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

const SelfieScreen = ({ navigation }) => {
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    
    // Cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (Platform.OS === 'web') {
      try {
        console.log('🎥 Starting camera...');
        
        // Request camera permission and get stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // Front camera for selfies
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        setStream(mediaStream);
        setIsStreaming(true);

        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }

        console.log('✅ Camera started successfully');
      } catch (error) {
        console.error('❌ Camera error:', error);
        Alert.alert(
          'Erreur Caméra',
          'Impossible d\'accéder à la caméra. Vérifiez les permissions.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } else {
      // For mobile, you would use react-native-camera or expo-camera
      Alert.alert(
        'Mobile Camera',
        'Camera functionality needs to be implemented for mobile platforms',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      console.log('🛑 Stopping camera...');
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const takePicture = () => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) {
      Alert.alert('Erreur', 'Caméra non disponible');
      return;
    }

    try {
      console.log('📸 Taking picture...');
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('✅ Picture taken successfully');
      console.log('📷 Image data length:', imageData.length);

      // Here you would typically:
      // 1. Save the image
      // 2. Upload to server
      // 3. Navigate to next screen

      Alert.alert(
        'Selfie Capturé!',
        'Votre selfie a été pris avec succès.',
        [
          {
            text: 'Retake',
            style: 'cancel'
          },
          {
            text: 'Continuer',
            onPress: () => {
              stopCamera();
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Picture error:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const handleGoBack = () => {
    console.log('⬅️ Going back...');
    stopCamera();
    navigation.goBack();
  };

  // For non-web platforms, show fallback
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prise de selfie</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraIcon}>📱</Text>
            <Text style={styles.cameraText}>Camera non disponible</Text>
            <Text style={styles.cameraSubtext}>
              Implémentation requise pour mobile
            </Text>
          </View>

          <TouchableOpacity style={styles.captureButton} onPress={handleGoBack}>
            <Text style={styles.captureButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Stream */}
      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          style={styles.video}
          autoPlay
          playsInline
          muted
        />
        
        {/* Camera Overlay */}
        <div style={styles.overlay}>
          {/* Header */}
          <div style={styles.headerOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prise de selfie</Text>
            <div style={styles.placeholder} />
          </div>

          {/* Camera Controls */}
          <div style={styles.controlsOverlay}>
            <TouchableOpacity 
              style={styles.captureButtonLarge} 
              onPress={takePicture}
              disabled={!isStreaming}
            >
              <div style={styles.captureButtonInner}>
                <Text style={styles.captureIcon}>📸</Text>
              </div>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={handleGoBack}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </div>
        </div>
      </div>

      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Instructions (overlay on video) */}
      <div style={styles.instructionsOverlay}>
        <Text style={styles.instructionTitle}>Instructions :</Text>
        <Text style={styles.instructionText}>• Regardez directement la caméra</Text>
        <Text style={styles.instructionText}>• Assurez-vous d'avoir un bon éclairage</Text>
        <Text style={styles.instructionText}>• Retirez lunettes et chapeau</Text>
        <Text style={styles.instructionText}>• Gardez une expression neutre</Text>
      </div>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  
  // Video styles (web only)
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  
  // Overlay styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  controlsOverlay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 30,
    position: 'relative',
  },
  
  // Button styles
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  
  captureButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: {
    fontSize: 24,
  },
  
  closeButton: {
    position: 'absolute',
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Instructions overlay
  instructionsOverlay: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 8,
    zIndex: 5,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
    opacity: 0.9,
  },

  // Fallback styles
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 30,
  },
  cameraIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  cameraText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SelfieScreen;