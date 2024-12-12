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

const SCREEN_WIDTH = Dimensions.get('window').width;
const API_URL = 'https://api.fashn.ai/v1';
const API_KEY = 'fa-MS2KGDDYer7s-nmbXJSsLHwgEhOB0vxMSWsLq';

export default function VirtualTryOn() {
  const [modelImage, setModelImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
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

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    let intervalId;

    if (isGenerating && status === 'processing') {
      intervalId = setInterval(checkStatus, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGenerating, status]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant camera roll permissions to use this feature.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  const selectImage = async (setImage, type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
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

    try {
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
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Failed to start generation');
      } else {
        setPredictionId(data.id);
        setStatus('processing');
      }
    } catch (error) {
      setError(error.message);
      setStatus(null);
      setIsGenerating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!predictionId) return;

    try {
      const response = await fetch(`${API_URL}/status/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        }
      });

      const data = await response.json();
      setStatus(data.status);
      if (data.status === 'completed') {
        setResult(data.output[0]);
        setIsGenerating(false);
      } else if (data.status === 'failed') {
        setError(data.error?.message || 'Generation failed');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('Failed to check status');
      setIsGenerating(false);
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
      Alert.alert('Error', 'Failed to download image. Please try again.');
    }
  };

  const CategoryButton = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.categoryButton, category === value && styles.selectedCategory]}
      onPress={() => setCategory(value)}
    >
      <Text style={[styles.categoryButtonText, category === value && styles.selectedCategoryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const OptionSwitch = ({ label, value, onValueChange }) => (
    <View style={styles.optionContainer}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Virtual Try-On</Text>

      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Text style={styles.label}>Model Image</Text>
          {modelImage ? (
            <Image source={{ uri: modelImage }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.placeholderImage]} />
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectImage(setModelImage, 'modelImage')}
          >
            <Text style={styles.buttonText}>Select Model Image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Text style={styles.label}>Garment Image</Text>
          {garmentImage ? (
            <Image source={{ uri: garmentImage }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.placeholderImage]} />
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectImage(setGarmentImage, 'garmentImage')}
          >
            <Text style={styles.buttonText}>Select Garment Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <CategoryButton title="Top" value="tops" />
        <CategoryButton title="Bottom" value="bottoms" />
        <CategoryButton title="Full-body" value="one-pieces" />
      </View>

      <View style={styles.optionsContainer}>
        <OptionSwitch label="Cover Feet" value={coverFeet} onValueChange={setCoverFeet} />
        <OptionSwitch label="Adjust Hands" value={adjustHands} onValueChange={setAdjustHands} />
        <OptionSwitch label="Restore Background" value={restoreBackground} onValueChange={setRestoreBackground} />
        <OptionSwitch label="Restore Clothes" value={restoreClothes} onValueChange={setRestoreClothes} />
        <OptionSwitch label="Flat Lay" value={flatLay} onValueChange={setFlatLay} />
        <OptionSwitch label="Long Top" value={longTop} onValueChange={setLongTop} />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          styles.generateButton,
          (isLoading || isGenerating || !modelImage || !garmentImage) && styles.disabledButton
        ]}
        onPress={handleGenerate}
        disabled={isLoading || isGenerating || !modelImage || !garmentImage}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Starting...' : isGenerating ? 'Generating...' : 'Generate Try-On'}
        </Text>
      </TouchableOpacity>

      {(isLoading || isGenerating) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>
            {isLoading ? 'Starting generation...' : 'Processing your request...'}
          </Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Result</Text>
          <Image source={{ uri: result }} style={styles.resultImage} resizeMode="contain" />
          <TouchableOpacity
            style={[styles.button, styles.downloadButton]}
            onPress={downloadImage}
          >
            <Text style={styles.buttonText}>Download Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: (SCREEN_WIDTH - 60) / 2,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: '#0284c7',
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#10b981',
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
    opacity: 0.7,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedCategory: {
    backgroundColor: '#0ea5e9',
  },
  categoryButtonText: {
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    color: 'white',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultImage: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * 1.33,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

