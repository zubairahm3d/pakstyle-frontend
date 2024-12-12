import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const API_URL = 'https://api.fashn.ai/v1';
const API_KEY = 'fa-MS2KGDDYer7s-nmbXJSsLHwgEhOB0vxMSWsLq';
const CHECK_INTERVAL = 500; // Check status every 500ms
const GENERATION_TIMEOUT = 30000; // 30 second timeout for initial request
const STATUS_TIMEOUT = 60000; // 1 minute timeout for entire process
const MAX_RETRIES = 3;

export default function VirtualTryOn() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const routeParams = route.params || {};
  const initialGarmentImage = routeParams.garmentImage;
  const garmentName = routeParams.garmentName;

  // State management
  const [modelImage, setModelImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(initialGarmentImage || null);
  const [category, setCategory] = useState('tops');
  const [coverFeet, setCoverFeet] = useState(false);
  const [adjustHands, setAdjustHands] = useState(false);
  const [restoreBackground, setRestoreBackground] = useState(false);
  const [restoreClothes, setRestoreClothes] = useState(false);
  const [flatLay, setFlatLay] = useState(false);
  const [longTop, setLongTop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictionId, setPredictionId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    if (isGenerating && status === 'processing' && retryCount < MAX_RETRIES) {
      // Set overall timeout
      timeoutId = setTimeout(() => {
        setError('Generation timed out. Please try again.');
        setIsGenerating(false);
        setStatus(null);
      }, STATUS_TIMEOUT);

      // Check status more frequently
      intervalId = setInterval(checkStatus, CHECK_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isGenerating, status, retryCount]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant camera roll permissions to use this feature.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'Failed to request permissions');
      }
    }
  };

  const selectImage = async (setImage, type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8, // Reduced quality for better performance
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        setError(null);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleGenerate = async () => {
    if (!modelImage || !garmentImage) {
      Alert.alert('Missing Images', 'Please select both a model image and a garment image');
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setRetryCount(0);
    setStartTime(Date.now());

    console.log('Starting generation request:', new Date().toISOString());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT);

      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_image: modelImage,
          garment_image: garmentImage,
          category: category.toLowerCase(),
          cover_feet: coverFeet,
          adjust_hands: adjustHands,
          restore_background: restoreBackground,
          restore_clothes: restoreClothes,
          flat_lay: flatLay,
          long_top: longTop,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Received initial response:', new Date().toISOString());

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }
      
      if (data.error) {
        throw new Error(data.error.message || 'Generation failed');
      }
      
      setPredictionId(data.id);
      setStatus('processing');

    } catch (error) {
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(`Failed to start generation: ${error.message}`);
      }
      setStatus(null);
      setIsGenerating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!predictionId) return;

    console.log('Checking status:', new Date().toISOString());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/status/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Status response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (!data || typeof data.status === 'undefined') {
        throw new Error('Invalid response format');
      }

      setStatus(data.status);
      
      if (data.status === 'completed') {
        if (Array.isArray(data.output) && data.output.length > 0) {
          const endTime = Date.now();
          const totalTime = (endTime - startTime) / 1000;
          console.log(`Generation completed in ${totalTime} seconds`);
          
          setResult(data.output[0]);
          setIsGenerating(false);
          setRetryCount(0);
        } else {
          throw new Error('No output received');
        }
      } else if (data.status === 'failed') {
        const errorMessage = data.error?.message || 'Generation failed';
        setError(errorMessage);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Status check error:', error);
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(checkStatus, 1000);
      } else {
        setError(`Failed to check status: ${error.message}`);
        setIsGenerating(false);
      }
    }
  };

  const downloadImage = async () => {
    if (!result) {
      Alert.alert('Error', 'No image to download');
      return;
    }

    try {
      const fileName = `VirtualTryOn_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const downloadResult = await FileSystem.downloadAsync(result, fileUri);
      
      if (downloadResult.status === 200) {
        Alert.alert('Success', `Image saved to ${fileUri}`);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download image');
    }
  };

  const resetGeneration = () => {
    setIsGenerating(false);
    setIsLoading(false);
    setError(null);
    setResult(null);
    setPredictionId(null);
    setStatus(null);
    setRetryCount(0);
    setStartTime(null);
  };

  const getLoadingText = () => {
    if (isLoading) return 'Starting generation...';
    if (isGenerating) {
      const timeElapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      return `Processing your request... (${timeElapsed}s)${retryCount > 0 ? ` Attempt ${retryCount}/${MAX_RETRIES}` : ''}`;
    }
    return '';
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
        </TouchableOpacity>
        <Text style={styles.title}>Virtual Try-On</Text>
        {garmentName && (
          <Text style={styles.subtitle}>{garmentName}</Text>
        )}
      </View>

      <View style={styles.imageSection}>
        <View style={styles.imageWrapper}>
          <Text style={styles.label}>Model Image</Text>
          {modelImage ? (
            <Image source={{ uri: modelImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="person-outline" size={40} color="#94a3b8" />
            </View>
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => selectImage(setModelImage, 'model')}
          >
            <Text style={styles.buttonText}>
              {modelImage ? 'Change Model Image' : 'Select Model Image'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Text style={styles.label}>Garment Image</Text>
          {garmentImage ? (
            <Image source={{ uri: garmentImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="shirt-outline" size={40} color="#94a3b8" />
            </View>
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => selectImage(setGarmentImage, 'garment')}
          >
            <Text style={styles.buttonText}>
              {garmentImage ? 'Change Garment Image' : 'Select Garment Image'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionsSection}>
        <View style={styles.categoryButtons}>
          {['tops', 'bottoms', 'one-pieces'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryButtonText,
                category === cat && styles.selectedCategoryText
              ]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switches}>
          <SwitchOption 
            label="Cover Feet"
            value={coverFeet}
            onValueChange={setCoverFeet}
          />
          <SwitchOption 
            label="Adjust Hands"
            value={adjustHands}
            onValueChange={setAdjustHands}
          />
          <SwitchOption 
            label="Restore Background"
            value={restoreBackground}
            onValueChange={setRestoreBackground}
          />
          <SwitchOption 
            label="Restore Clothes"
            value={restoreClothes}
            onValueChange={setRestoreClothes}
          />
          <SwitchOption 
            label="Flat Lay"
            value={flatLay}
            onValueChange={setFlatLay}
          />
          <SwitchOption 
            label="Long Top"
            value={longTop}
            onValueChange={setLongTop}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.generateButton,
          (!modelImage || !garmentImage || isLoading || isGenerating) && styles.disabledButton
        ]}
        onPress={handleGenerate}
        disabled={!modelImage || !garmentImage || isLoading || isGenerating}
      >
        <Text style={styles.generateButtonText}>
          {isLoading ? 'Starting...' : isGenerating ? 'Generating...' : 'Generate Try-On'}
        </Text>
      </TouchableOpacity>

      {(isLoading || isGenerating) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.loadingText}>{getLoadingText()}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetGeneration}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Result</Text>
              <Image 
                source={{ uri: result }} 
                style={styles.resultImage} 
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={downloadImage}
              >
                <Text style={styles.buttonText}>Download Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      );
    }

    const SwitchOption = ({ label, value, onValueChange }) => (
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
          ios_backgroundColor="#cbd5e1"
        />
      </View>
    );

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#f8fafc',
      },
      contentContainer: {
        padding: 16,
        paddingBottom: 32,
      },
      header: {
        marginBottom: 24,
      },
      backButton: {
        marginBottom: 16,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
      },
      subtitle: {
        fontSize: 16,
        color: '#64748b',
      },
      imageSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
      },
      imageWrapper: {
        flex: 1,
      },
      label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
      },
      image: {
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        marginBottom: 8,
      },
      placeholderImage: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
      },
      selectButton: {
        backgroundColor: '#0ea5e9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
      },
      buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
      },
      optionsSection: {
        marginBottom: 24,
      },
      categoryButtons: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
      },
      categoryButton: {
        flex: 1,
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#0ea5e9',
        alignItems: 'center',
      },
      selectedCategory: {
        backgroundColor: '#0ea5e9',
      },
      categoryButtonText: {
        color: '#0ea5e9',
        fontSize: 14,
        fontWeight: '600',
      },
      selectedCategoryText: {
        color: '#fff',
      },
      switches: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
      },
      switchLabel: {
        fontSize: 14,
        color: '#475569',
      },
      generateButton: {
        backgroundColor: '#0ea5e9',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      disabledButton: {
        backgroundColor: '#94a3b8',
        opacity: 0.7,
      },
      loadingContainer: {
        alignItems: 'center',
        marginBottom: 24,
      },
      loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
      },
      errorContainer: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
      },
      errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
      },
      retryButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
      },
      retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
      },
      resultContainer: {
        marginBottom: 24,
      },
      resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
      },
      resultImage: {
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 8,
        marginBottom: 16,
      },
      downloadButton: {
        backgroundColor: '#10b981',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }
    });

    // export default VirtualTryOn;