import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { CartContext } from "../Context/CartContext";
import { API_URL } from "@env";

const CheckOutScreen = ({ user, navigation, cartItems }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Credit Card");
  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const { removeAllItems } = useContext(CartContext);

  const handlePayment = () => {
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = {
      userId: user._id,
      totalPrice: totalPrice,
      orderDate: new Date(),
      status: "Pending",
      shippingAddress: shippingAddress,
      paymentMethod: selectedPaymentMethod,
      items: cartItems.map((item) => ({
        productId: item._id,
        brandId: item.brandId,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize,
      })),
    };

    console.log("Order Data: ", order);

    Alert.alert(
      "Confirm Payment",
      "Are you sure you want to proceed with the payment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: async () => {
            try {
              console.log(`IP: ${API_URL}/orders`);
              const response = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
              });

              if (!response.ok) {
                throw new Error("Network response was not ok");
              }

              const data = await response.json();
              console.log("Order successfully created:", data);
              removeAllItems();
              navigation.navigate("Cart");
            } catch (error) {
              console.error("Error:", error);
              Alert.alert(
                "Error",
                "There was a problem processing your order. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.navigate("Cart");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Checkout</Text>

      {/* Payment Method Selection */}
      <RadioButton.Group
        onValueChange={(value) => setSelectedPaymentMethod(value)}
        value={selectedPaymentMethod}
      >
        <View style={styles.optionContainer}>
          <RadioButton.Item label="Credit Card" value="Credit Card" />
        </View>
        <View style={styles.optionContainer}>
          <RadioButton.Item label="Cash on Delivery" value="Cash on Delivery" />
        </View>
        <View style={styles.optionContainer}>
          <RadioButton.Item label="JazzCash" value="JazzCash" />
        </View>
        <View style={styles.optionContainer}>
          <RadioButton.Item label="EasyPaisa" value="EasyPaisa" />
        </View>
      </RadioButton.Group>

      {/* Credit Card Details */}
      {selectedPaymentMethod === "Credit Card" && (
        <View style={styles.cardDetailsContainer}>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            keyboardType="numeric"
            onChangeText={(text) =>
              setCreditCardDetails({ ...creditCardDetails, cardNumber: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry Date (MM/YY)"
            keyboardType="numeric"
            onChangeText={(text) =>
              setCreditCardDetails({ ...creditCardDetails, expiryDate: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            keyboardType="numeric"
            onChangeText={(text) =>
              setCreditCardDetails({ ...creditCardDetails, cvv: text })
            }
          />
        </View>
      )}

      {/* Shipping Address Inputs */}
      <Text style={styles.label}>Shipping Address:</Text>
      <TextInput
        style={styles.input}
        placeholder="Street"
        onChangeText={(text) =>
          setShippingAddress({ ...shippingAddress, street: text })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        onChangeText={(text) =>
          setShippingAddress({ ...shippingAddress, city: text })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        onChangeText={(text) =>
          setShippingAddress({ ...shippingAddress, state: text })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        onChangeText={(text) =>
          setShippingAddress({ ...shippingAddress, country: text })
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        keyboardType="numeric"
        onChangeText={(text) =>
          setShippingAddress({ ...shippingAddress, zipCode: text })
        }
      />

      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  optionContainer: {
    marginVertical: 10,
  },
  cardDetailsContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007bff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#555",
  },
});

export default CheckOutScreen;
