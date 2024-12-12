import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL } from "@env";

const AddNewItem = ({ brandId, brandName }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: "",
    colors: "",
  });
  const [imageUri, setImageUri] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    requestImagePickerPermission();
  }, []);

  const requestImagePickerPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Please enter a valid price";
    }
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.sizes.trim()) newErrors.sizes = "Sizes are required";
    if (!formData.colors.trim()) newErrors.colors = "Colors are required";
    if (!imageUri) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        if (errors.image) {
          setErrors(prev => ({
            ...prev,
            image: null
          }));
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleAddItem = () => {
    if (validateForm()) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmAddItem = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formDataToSend.append(
            key,
            JSON.stringify(formData[key].split(',').map(item => item.trim()))
          );
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append brand information
      formDataToSend.append('brandId', brandId);
      formDataToSend.append('brandName', brandName);

      // Append image
      const imageFileName = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(imageFileName);
      const imageType = match ? `image/${match[1]}` : 'image';
      formDataToSend.append('image', {
        uri: imageUri,
        name: imageFileName,
        type: imageType,
      });

      const response = await axios.post(`${API_URL}/products`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("New item added:", response.data);
      setSuccessMessage("Item added successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        sizes: "",
        colors: "",
      });
      setImageUri(null);
      setShowConfirmationModal(false);

      // Show success alert
      Alert.alert("Success", "Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add item. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (label, name, placeholder, keyboardType = "default", multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}:</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          errors[name] && styles.inputError
        ]}
        value={formData[name]}
        onChangeText={(text) => handleInputChange(name, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]}</Text>
      )}
    </View>
  );

  const renderConfirmationModal = () => (
    <Modal
      visible={showConfirmationModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Add to Collection</Text>
          
          <ScrollView style={styles.modalScrollView}>
            {Object.entries(formData).map(([key, value]) => (
              <View key={key} style={styles.modalField}>
                <Text style={styles.modalLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                <Text style={styles.modalValue}>{value}</Text>
              </View>
            ))}
            
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.modalImage} />
            )}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirmAddItem}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Adding..." : "Confirm"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowConfirmationModal(false)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {successMessage ? (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {renderFormField("Name", "name", "Enter product name")}
        {renderFormField("Description", "description", "Enter product description", "default", true)}
        {renderFormField("Price", "price", "Enter price", "decimal-pad")}
        {renderFormField("Category", "category", "Enter category")}
        {renderFormField("Sizes", "sizes", "e.g. S, M, L, XL")}
        {renderFormField("Colors", "colors", "e.g. Red, Blue, Green")}

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        )}
        {errors.image && (
          <Text style={styles.errorText}>{errors.image}</Text>
        )}

        <TouchableOpacity 
          style={[styles.addButton, isLoading && styles.disabledButton]}
          onPress={handleAddItem}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Add to Collection</Text>
        </TouchableOpacity>

        {renderConfirmationModal()}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  imageButton: {
    backgroundColor: '#17a2b8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalValue: {
    fontSize: 16,
    marginTop: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginVertical: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 0.48,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  successText: {
    color: '#155724',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AddNewItem;