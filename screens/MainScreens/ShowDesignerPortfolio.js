import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '@env';

const ShowDesignerPortfolio = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchDesignerPortfolio();
  }, []);

  const fetchDesignerPortfolio = async () => {
    try {
      const designerId = route?.params?.designerId;
      if (!designerId) {
        throw new Error("Designer ID is required");
      }

      const response = await fetch(`${API_URL}/users/portfolio/${designerId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPortfolioImages(data.portfolioImages || []);
      } else {
        throw new Error(data.message || "Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setError(error.message || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const handlePreviousImage = () => {
    const newIndex = (selectedImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
    setSelectedImageIndex(newIndex);
    setSelectedImage(portfolioImages[newIndex]);
  };

  const handleNextImage = () => {
    const newIndex = (selectedImageIndex + 1) % portfolioImages.length;
    setSelectedImageIndex(newIndex);
    setSelectedImage(portfolioImages[newIndex]);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchDesignerPortfolio();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Designer Portfolio</Text>
      </View>

      <View style={styles.portfolioContainer}>
        {portfolioImages.map((imageUrl, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.imageContainer}
            onPress={() => handleImagePress(imageUrl, index)}
          >
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image}
            />
          </TouchableOpacity>
        ))}
      </View>

      {portfolioImages.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#cbd5e1" />
          <Text style={styles.messageText}>No portfolio images available</Text>
        </View>
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

          {portfolioImages.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navigationButton, styles.leftButton]}
                onPress={handlePreviousImage}
              >
                <Ionicons name="chevron-back" size={40} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navigationButton, styles.rightButton]}
                onPress={handleNextImage}
              >
                <Ionicons name="chevron-forward" size={40} color="white" />
              </TouchableOpacity>
            </>
          )}

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {`${selectedImageIndex + 1} / ${portfolioImages.length}`}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8fafc",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ef4444",
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginLeft: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#64748b",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  messageText: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 16,
  },
  portfolioContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  imageContainer: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 200,
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
  navigationButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
    transform: [{ translateY: -25 }],
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 15,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ShowDesignerPortfolio;