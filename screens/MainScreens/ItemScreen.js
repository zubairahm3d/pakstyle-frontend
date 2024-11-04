"use client";

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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CartContext } from "../Context/CartContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ItemScreen = ({ route, navigation }) => {
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
    addToCart({
      ...item,
      selectedSize,
      selectedColor,
      quantity: selectedQuantity,
    });
    // Show a confirmation message or navigate to cart
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
          <Image style={styles.image} source={{ uri: item.images[0] }} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
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
              items={[...Array(10).keys()].map((num) => ({
                label: `${num + 1}`,
                value: num + 1,
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
            label={item.label || item}
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
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
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
    fontSize: 18,
    color: "#2c3e50",
    marginRight: 10,
    width: 80,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  addToCartButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ItemScreen;
