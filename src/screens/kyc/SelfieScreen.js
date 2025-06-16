import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useKYC } from '../../context/KYCContext';

const SelfieScreen = ({ navigation, route }) => {
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Get KYC context
  const { uploadDocument, completeStep, isLoading } = useKYC();
  
  // Get callback from route params (if provided)
  const onSelfieCapture = route?.params?.onSelfieCapture;

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (Platform.OS === 'web') {
      try {
        console.log('🎥 Starting camera...');
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        setStream(mediaStream);
        setIsStreaming(true);

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

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const takePicture = async () => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) {
      Alert.alert('Erreur', 'Caméra non disponible');
      return;
    }

    try {
      console.log('📸 Taking picture...');
      setIsProcessing(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('✅ Picture taken successfully');
      console.log('📷 Image data length:', imageData.length);

      // Process the selfie
      await processSelfie(imageData);

    } catch (error) {
      console.error('❌ Picture error:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
      setIsProcessing(false);
    }
  };

  const processSelfie = async (imageData) => {
    try {
      console.log('📤 Processing selfie...');
      
      // Convert base64 to blob
      const blob = dataURLToBlob(imageData);
      console.log('📦 Blob created:', {
        size: blob.size,
        type: blob.type
      });
      
      // Create file data for upload
      const fileData = {
        uri: imageData,
        type: 'image/jpeg',
        fileName: `selfie_${Date.now()}.jpg`,
        fileSize: blob.size,
        name: `selfie_${Date.now()}.jpg`,
        blob: blob
      };
      
      console.log('📁 File data structure:', {
        fileName: fileData.fileName,
        type: fileData.type,
        fileSize: fileData.fileSize,
        hasUri: !!fileData.uri,
        uriLength: fileData.uri.length,
      });

      // Upload the document
      console.log('📤 Uploading selfie...');
      const uploadResult = await uploadDocument('selfie', fileData);
      
      if (uploadResult.success) {
        console.log('✅ Upload successful:', uploadResult.data);
        
        // Complete the KYC step
        try {
          const stepResult = await completeStep('identity_verification', {
            selfieDocumentId: uploadResult.data._id || uploadResult.data.id,
            capturedAt: new Date().toISOString(),
          });
          console.log('📋 Step completion result:', stepResult);
        } catch (stepError) {
          console.warn('⚠️ Step completion failed but upload succeeded:', stepError);
        }

        // Handle callback - pass the UPLOADED document data, not the original file data
        if (onSelfieCapture) {
          console.log('📞 Calling callback with UPLOADED document data...');
          
          // IMPORTANT: Pass the uploaded document, not the file data
          onSelfieCapture(uploadResult.data);
          console.log('✅ Callback executed with uploaded document');
        }
        
        // Navigate to next step
        await handleSuccessNavigation(uploadResult.data);
        
      } else {
        console.error('❌ Upload failed:', uploadResult);
        throw new Error(uploadResult.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Process selfie error:', error);
      
      // Show error with options
      Alert.alert(
        'Erreur de traitement',
        `Impossible de traiter votre selfie: ${error.message}`,
        [
          {
            text: 'Réessayer',
            onPress: () => setIsProcessing(false)
          },
          {
            text: 'Continuer quand même',
            onPress: () => handleSkipAndContinue()
          },
          {
            text: 'Retour',
            style: 'cancel',
            onPress: () => handleGoBack()
          }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessNavigation = async (documentData) => {
    console.log('🎉 Handle success navigation called');
    
    // Stop camera first
    stopCamera();
    
    // Force navigation to next step regardless of callback
    setTimeout(() => {
      console.log('🚀 Auto-navigating to PhoneVerification...');
      navigateToNextStep();
    }, 1000); // Small delay to ensure callback completes
  };

  const navigateToNextStep = () => {
    try {
      console.log('🚀 Attempting navigation to PhoneVerification...');
      
      // Try different navigation methods
      if (navigation.navigate) {
        navigation.navigate('PhoneVerification');
        console.log('✅ Navigation successful with navigate()');
      } else if (navigation.push) {
        navigation.push('PhoneVerification');
        console.log('✅ Navigation successful with push()');
      } else {
        throw new Error('No navigation method available');
      }
      
    } catch (navError) {
      console.error('❌ Navigation error:', navError);
      
      // Show success message with manual navigation
      Alert.alert(
        'Selfie Uploadé!',
        'Votre selfie a été uploadé avec succès. Cliquez pour continuer vers la vérification téléphonique.',
        [
          {
            text: 'Continuer',
            onPress: () => {
              try {
                // Try fallback navigation
                navigation.navigate('KYC', { screen: 'PhoneVerification' });
                console.log('✅ Fallback navigation successful');
              } catch (fallbackError) {
                console.error('❌ Fallback navigation failed:', fallbackError);
                navigation.goBack(); // Go back to KYC welcome
              }
            }
          }
        ]
      );
    }
  };

  const handleSkipAndContinue = () => {
    console.log('⏭️ Skip upload and continue...');
    stopCamera();
    
    // If we have a callback, call it with mock uploaded document data
    if (onSelfieCapture) {
      const mockUploadedDoc = {
        _id: `mock_selfie_${Date.now()}`,
        type: 'selfie',
        filename: `selfie_${Date.now()}.jpg`,
        status: 'uploaded',
        verificationStatus: 'pending',
        uploadedAt: new Date()
      };
      onSelfieCapture(mockUploadedDoc);
      console.log('✅ Mock callback executed with uploaded document format');
    }
    
    // Navigate to next step
    navigateToNextStep();
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

          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={handleSkipAndContinue}
          >
            <Text style={styles.captureButtonText}>Continuer (Test)</Text>
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
              style={[
                styles.captureButtonLarge,
                (isProcessing || isLoading || !isStreaming) && styles.captureButtonDisabled
              ]} 
              onPress={takePicture}
              disabled={!isStreaming || isProcessing || isLoading}
            >
              <div style={styles.captureButtonInner}>
                <Text style={styles.captureIcon}>
                  {isProcessing || isLoading ? '⏳' : '📸'}
                </Text>
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
      
      {/* Processing overlay */}
      {(isProcessing || isLoading) && (
        <div style={styles.processingOverlay}>
          <div style={styles.processingContainer}>
            <Text style={styles.processingText}>
              {isProcessing ? 'Upload en cours...' : 'Traitement...'}
            </Text>
            <Text style={styles.processingSubtext}>Veuillez patienter</Text>
          </div>
        </div>
      )}
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
  
  // Header styles for fallback
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
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
  captureButtonDisabled: {
    opacity: 0.6,
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

  // Processing overlay
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  processingContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
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