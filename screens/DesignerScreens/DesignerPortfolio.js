import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  Dimensions
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';

const DesignerPortfolio = ({ user }) => {
  const [portfolioImages, setPortfolioImages] = useState(user.portfolioImages || []);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to add portfolio images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      uploadImages(result.assets.map(asset => asset.uri));
    }
  };

  const uploadImages = async (imageUris) => {
    setUploading(true);
    const formData = new FormData();
    
    imageUris.forEach((uri, index) => {
      formData.append('portfolioImages', {
        uri: uri,
        type: 'image/jpeg',
        name: `portfolio-image-${index}.jpg`,
      });
    });
    
    formData.append('email', user.email);

    try {
      const response = await fetch(`${API_URL}/users/upload-portfolio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setPortfolioImages(prev => [...prev, ...result.urls]);
        Alert.alert("Success", "Portfolio images uploaded successfully");
      } else {
        Alert.alert("Error", result.message || "Failed to upload images");
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert("Error", "An error occurred while uploading your images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl) => {
    try {
      const response = await fetch(`${API_URL}/users/remove-portfolio-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          imageUrl: imageUrl
        }),
      });

      if (response.ok) {
        setPortfolioImages(prev => prev.filter(url => url !== imageUrl));
        Alert.alert("Success", "Image removed successfully");
      } else {
        Alert.alert("Error", "Failed to remove image");
      }
    } catch (error) {
      console.error('Error removing image:', error);
      Alert.alert("Error", "An error occurred while removing the image");
    }
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Portfolio</Text>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleImagePicker}
        disabled={uploading}
      >
        <Ionicons name="add-circle-outline" size={24} color="#0ea5e9" />
        <Text style={styles.addButtonText}>
          {uploading ? "Uploading..." : "Add Images"}
        </Text>
      </TouchableOpacity>

      <View style={styles.portfolioContainer}>
        {portfolioImages.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <TouchableOpacity onPress={() => handleImagePress(imageUrl)}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(imageUrl)}
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {portfolioImages.length === 0 && (
        <Text style={styles.messageText}>No portfolio images available</Text>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#0ea5e9',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 20,
  },
  portfolioContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  imageContainer: {
    position: 'relative',
    margin: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
});

export default DesignerPortfolio;