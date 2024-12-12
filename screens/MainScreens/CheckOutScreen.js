import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { CartContext } from '../Context/CartContext';
import { API_URL } from '@env';

const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery' },
];

const CheckOutScreen = ({ navigation, route }) => {
  const stripe = useStripe();
  const { user, cartItems } = route.params || {};
  const { removeAllItems } = useContext(CartContext);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState({});
  const [cardDetails, setCardDetails] = useState(null);

  if (!user || !cartItems) {
    return (
      <View style={styles.container}>
        <Text>Error: Missing user or cart data</Text>
      </View>
    );
  }

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const validateForm = () => {
    const newErrors = {};

    // Only validate shipping address
    Object.keys(shippingAddress).forEach(key => {
      if (!shippingAddress[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the processPayment function in CheckOutScreen.js
// Update the processPayment function in CheckOutScreen.js
const processPayment = async () => {
  if (!validateForm()) {
    return;
  }

  if (!user?._id) {
    Alert.alert(
      'Error',
      'User information is missing. Please try logging in again.',
      [{ text: 'OK' }]
    );
    return;
  }

  if (totalPrice < 150) {
    Alert.alert(
      'Invalid Amount',
      'Order total must be at least 150 PKR',
      [{ text: 'OK' }]
    );
    return;
  }

  // For credit card payment, ensure card details are complete
  if (selectedPaymentMethod === 'credit_card' && !cardComplete) {
    Alert.alert(
      'Invalid Card',
      'Please enter valid card details',
      [{ text: 'OK' }]
    );
    return;
  }

  setIsLoading(true);
  try {
    // Create the order first
    const orderResponse = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        totalPrice,
        paymentMethod: selectedPaymentMethod,
        shippingAddress,
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const orderData = await orderResponse.json();

    // Handle payment confirmation for credit card
    if (selectedPaymentMethod === 'credit_card' && orderData.paymentIntent) {
      const { error: paymentError } = await stripe.confirmPayment(
        orderData.paymentIntent.clientSecret,
        {
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails: {
              address: {
                city: shippingAddress.city,
                country: shippingAddress.country,
                line1: shippingAddress.street,
                postalCode: shippingAddress.zipCode,
                state: shippingAddress.state,
              },
            },
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message);
      }
    }

    // Success handling
    removeAllItems();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Cart' }],
    });

    Alert.alert(
      'Order Placed Successfully',
      'Thank you for your purchase! You can track your order in the Profile section.',
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Payment Error:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to process order. Please try again.',
      [{ text: 'OK' }]
    );
  } finally {
    setIsLoading(false);
  }
};

  const handlePayment = () => {
    Alert.alert(
      'Confirm Order',
      `Total Amount: Rs. ${totalPrice.toLocaleString()}\nPayment Method: ${
        PAYMENT_METHODS.find(method => method.id === selectedPaymentMethod)?.label
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Place Order', onPress: processPayment }
      ]
    );
  };

  const renderShippingForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>
      <View style={styles.inputContainer}>
        {Object.keys(shippingAddress).map((field) => (
          <View key={field}>
            <TextInput
              style={[styles.input, errors[field] && styles.inputError]}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              value={shippingAddress[field]}
              onChangeText={(text) => {
                setShippingAddress({...shippingAddress, [field]: text});
                if (errors[field]) {
                  setErrors({...errors, [field]: null});
                }
              }}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
          </View>
        ))}
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentMethodContainer}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodItem,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethod
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Text style={styles.paymentMethodLabel}>{method.label}</Text>
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCardForm = () => selectedPaymentMethod === 'credit_card' && (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Card Details</Text>
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={styles.cardField}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
          setCardDetails(cardDetails);
          if (errors.card) {
            setErrors({...errors, card: null});
          }
        }}
      />
      {!cardComplete && (
        <Text style={styles.helperText}>
          Test Card: 4242 4242 4242 4242, Any future date, Any 3 digits
        </Text>
      )}
      {errors.card && <Text style={styles.errorText}>{errors.card}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView bounces={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
        </View>

        <View style={styles.content}>
          {renderShippingForm()}
          {renderPaymentMethods()}
          {renderCardForm()}

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: Rs. {totalPrice.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  paymentMethodContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  totalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  paymentMethodLabel: {
    fontSize: 16,
  },
});

export default CheckOutScreen;