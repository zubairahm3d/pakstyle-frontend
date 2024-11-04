import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import designerData from "./../../data/designerData.json";

const DesignerDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { designer } = route.params;

  const designerCustomData = designerData.find(
    (data) => data.userId === designer.id
  );

  const [selectedOptions, setSelectedOptions] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOptionSelect = (option, choice, price) => {
    setSelectedOptions((prevSelectedOptions) => {
      const currentOption = prevSelectedOptions[option];
      // Toggle the selection
      if (currentOption && currentOption.name === choice) {
        const { [option]: removed, ...rest } = prevSelectedOptions;
        return rest;
      } else {
        return {
          ...prevSelectedOptions,
          [option]: { name: choice, price: price },
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total =
      designerCustomData && designerCustomData.startPrice
        ? designerCustomData.startPrice
        : 0;
    for (const option in selectedOptions) {
      if (selectedOptions[option] && selectedOptions[option].price) {
        total += selectedOptions[option].price;
      }
    }
    return total;
  };

  const renderCustomizationChoices = (customizations) => {
    return customizations.map((customization, index) => (
      <View key={index} style={styles.customizationSection}>
        <Text style={styles.customizationOption}>{customization.option}:</Text>
        {customization.choices.map((choice, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.choiceButton,
              selectedOptions[customization.option]?.name === choice.name &&
                styles.selectedChoiceButton,
            ]}
            onPress={() =>
              handleOptionSelect(
                customization.option,
                choice.name,
                choice.price
              )
            }
          >
            <Text style={styles.choiceText}>
              {choice.name} - Rs. {choice.price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  const handleOrderPress = () => {
    navigation.navigate("Designer Order", {
      selectedOptions: selectedOptions,
      totalPrice: calculateTotalPrice(),
    });
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => setSelectedOptions({});
    }, [])
  );

  return (
    <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: designer.profile_pic }}
          style={styles.profilePic}
        />
        <Text style={styles.name}>{designer.name}</Text>
        <Text style={styles.email}>{designer.email}</Text>
        <Text style={styles.phone}>{designer.phone}</Text>

        {designerCustomData ? (
          <>
            <View style={styles.portfolioContainer}>
              <Text style={styles.portfolioTitle}>Portfolio:</Text>
              <ScrollView horizontal>
                {designerCustomData.pictures.map((picture, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openImageModal(picture)}
                  >
                    <Image
                      key={index}
                      source={{ uri: picture }}
                      style={styles.portfolioImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.customizationContainer}>
              <Text style={styles.customizationTitle}>
                Customization Options:
              </Text>
              {renderCustomizationChoices(designerCustomData.customizations)}
              <Text style={styles.totalPrice}>
                Total Price: Rs. {calculateTotalPrice()}
              </Text>
              <Button title="Place Order" onPress={handleOrderPress} />
            </View>
          </>
        ) : (
          <Text>No customization data available for this designer.</Text>
        )}

        <Modal visible={isModalVisible} transparent={true}>
          <TouchableWithoutFeedback onPress={closeImageModal}>
            <View style={styles.modalBackground}>
              <Image source={{ uri: selectedImage }} style={styles.fullImage} />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  profilePic: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  phone: {
    fontSize: 18,
    color: "#666",
  },
  portfolioContainer: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  portfolioImage: {
    width: 150,
    height: 150,
    marginRight: 10,
  },
  customizationContainer: {
    marginTop: 20,
    width: "100%",
  },
  customizationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  customizationSection: {
    marginBottom: 15,
  },
  customizationOption: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  choiceButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  selectedChoiceButton: {
    backgroundColor: "#c0c0c0",
  },
  choiceText: {
    fontSize: 16,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
  },
});

export default DesignerDetailScreen;
