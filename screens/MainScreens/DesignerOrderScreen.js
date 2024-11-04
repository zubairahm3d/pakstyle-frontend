import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const DesignerOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedOptions, totalPrice } = route.params;

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const renderSelectedOptions = () => {
    return Object.keys(selectedOptions).map((option, index) => (
      <View key={index} style={styles.optionSection}>
        <Text style={styles.optionTitle}>{option}:</Text>
        <Text style={styles.optionValue}>
          {selectedOptions[option].name} - Rs. {selectedOptions[option].price}
        </Text>
      </View>
    ));
  };

  const handleConfirmOrder = () => {
    if (
      paymentMethod === "Credit Card" &&
      (!cardNumber || !expiryDate || !cvv)
    ) {
      Alert.alert("Error", "Please fill out all credit card fields.");
      return;
    }

    Alert.alert(
      "Confirm Order",
      `You have selected ${paymentMethod} as your payment method. Are you sure you want to place this order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert(
              "Order Confirmed",
              "Your order has been placed successfully!"
            );
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Confirmation</Text>
      {renderSelectedOptions()}
      <Text style={styles.totalPrice}>Total Price: Rs. {totalPrice}</Text>

      <Text style={styles.paymentTitle}>Payment Method:</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setPaymentMethod("Credit Card")}
        >
          <View style={styles.radioCircle}>
            {paymentMethod === "Credit Card" && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Credit Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => setPaymentMethod("Cash on Delivery")}
        >
          <View style={styles.radioCircle}>
            {paymentMethod === "Cash on Delivery" && (
              <View style={styles.selectedRb} />
            )}
          </View>
          <Text style={styles.radioText}>Cash on Delivery</Text>
        </TouchableOpacity>
      </View>

      {paymentMethod === "Credit Card" && (
        <View style={styles.creditCardForm}>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry Date (MM/YY)"
            value={expiryDate}
            onChangeText={setExpiryDate}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            secureTextEntry
          />
        </View>
      )}

      <Button title="Confirm Order" onPress={handleConfirmOrder} />
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionSection: {
    marginBottom: 15,
    width: "100%",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  optionValue: {
    fontSize: 16,
    color: "#666",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000",
  },
  radioText: {
    fontSize: 16,
  },
  creditCardForm: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
});

export default DesignerOrderScreen;
