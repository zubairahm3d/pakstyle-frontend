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
  Platform,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function VirtualTryOn() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({
    person: false,
    cloth: false,
    result: false
  });

  useEffect(() => {
    requestPermissions();
  }, []);

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
      console.error('Permission request error:', error);
    }
  };

  const getImageDimensions = (uri) => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });
  };

  const selectImage = async (setImage, type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const dimensions = await getImageDimensions(result.assets[0].uri);
        
        setImage({
          uri: result.assets[0].uri,
          type: type,
          width: dimensions.width,
          height: dimensions.height,
        });

        // Reset error state for this image type
        setImageErrors(prev => ({
          ...prev,
          [type === 'personImage' ? 'person' : 'cloth']: false
        }));
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert(
        'Error',
        'Failed to select image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTryOn = async () => {
    if (!personImage?.uri || !clothImage?.uri) {
      Alert.alert('Missing Images', 'Please select both a person image and a clothing image');
      return;
    }

    setLoading(true);
    setResultImage(null);

    try {
      const formData = new FormData();
      
      // Append images with proper type and name
      [
        { field: 'personImage', data: personImage },
        { field: 'clothImage', data: clothImage }
      ].forEach(({ field, data }) => {
        formData.append(field, {
          uri: data.uri,
          type: 'image/jpeg',
          name: `${field}.jpg`,
        });
      });

      const response = await fetch('https://virtual-try-on2.p.rapidapi.com/clothes-virtual-tryon', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '1287701579msheb292cbf852cca7p1bc887jsn79b4c03e2499',
          'x-rapidapi-host': 'virtual-try-on2.p.rapidapi.com',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      if (result.success && result.code === 200 && result.response?.ouput_path_img) {
        setResultImage(result.response.ouput_path_img);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Try-on error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process virtual try-on. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const ImageDisplay = ({ image, type, style }) => {
    if (!image?.uri) return null;

    return (
      <View style={styles.imageDisplayContainer}>
        <Image
          source={{ uri: image.uri }}
          style={[styles.image, style]}
          onError={() => {
            setImageErrors(prev => ({ ...prev, [type]: true }));
            Alert.alert('Error', `Failed to load ${type} image`);
          }}
          resizeMode="contain"
        />
        {imageErrors[type] && (
          <Text style={styles.errorText}>Failed to load image</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Virtual Try-On</Text>

      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Text style={styles.label}>Person Image</Text>
          <ImageDisplay 
            image={personImage} 
            type="person"
            style={styles.image} 
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectImage(setPersonImage, 'personImage')}
          >
            <Text style={styles.buttonText}>Select Person Image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Text style={styles.label}>Clothing Image</Text>
          <ImageDisplay 
            image={clothImage} 
            type="cloth"
            style={styles.image} 
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => selectImage(setClothImage, 'clothImage')}
          >
            <Text style={styles.buttonText}>Select Clothing Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button, 
          styles.tryOnButton,
          (loading || !personImage || !clothImage) && styles.disabledButton
        ]}
        onPress={handleTryOn}
        disabled={loading || !personImage || !clothImage}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Try On'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Processing your request...</Text>
        </View>
      )}

      {resultImage && (
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Result</Text>
          <ImageDisplay 
            image={{ uri: resultImage }} 
            type="result"
            style={styles.resultImage} 
          />
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
  imageDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
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
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#93c5fd',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tryOnButton: {
    marginTop: 20,
    backgroundColor: '#0284c7',
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
    fontSize: 12,
    marginTop: 5,
  },
});