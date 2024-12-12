import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CartContext } from "../Context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const ItemScreen = ({ route }) => {
  const navigation = useNavigation();
  const { item, user } = route.params;
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(item.colors[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 5,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      selectedSize,
      selectedColor,
      quantity: selectedQuantity,
    };
    
    addToCart(cartItem);
    Alert.alert(
      "Success",
      "Item added to cart successfully!",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  const handleTryOn = () => {
    if (!item.images || item.images.length === 0) {
      Alert.alert("Error", "No image available for virtual try-on");
      return;
    }

    navigation.navigate("Virtual Try-On", {
      garmentImage: item.images[0],
      garmentName: item.name,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image 
            style={styles.image} 
            source={{ uri: item.images[0] }}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tryOnButton}
            onPress={handleTryOn}
          >
            <Text style={styles.tryOnButtonText}>Try On</Text>
            <Ionicons name="camera-outline" size={20} color="#fff" style={styles.tryOnIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>Rs. {item.price.toLocaleString()}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.optionsContainer}>
            <OptionPicker
              label="Size"
              selectedValue={selectedSize}
              onValueChange={setSelectedSize}
              items={item.sizes}
            />
            <OptionPicker
              label="Color"
              selectedValue={selectedColor}
              onValueChange={setSelectedColor}
              items={item.colors}
            />
            <OptionPicker
              label="Quantity"
              selectedValue={selectedQuantity}
              onValueChange={setSelectedQuantity}
              items={[...Array(10)].map((_, i) => ({
                label: (i + 1).toString(),
                value: i + 1,
              }))}
            />
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const OptionPicker = ({ label, selectedValue, onValueChange, items }) => (
  <View style={styles.optionRow}>
    <Text style={styles.optionLabel}>{label}:</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        style={styles.picker}
        onValueChange={onValueChange}
      >
        {items.map((item) => (
          <Picker.Item
            key={item.value || item}
            label={item.label || item.toString()}
            value={item.value || item}
          />
        ))}
      </Picker>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 400,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tryOnButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#0ea5e9",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tryOnButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  tryOnIcon: {
    marginLeft: 4,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0ea5e9",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: 16,
    color: "#475569",
    marginRight: 10,
    width: 80,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  addToCartButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ItemScreen;