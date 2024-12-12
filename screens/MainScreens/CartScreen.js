import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { CartContext } from "../Context/CartContext";
import { createStackNavigator } from "@react-navigation/stack";
import CheckOutScreen from "./CheckOutScreen";
import OrderHistoryScreen from "./OrderHistoryScreen";
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

const CartScreen = ({ user, navigation }) => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total +
      (typeof item.price === "string"
        ? parseFloat(item.price.replace("₨", "").replace(",", ""))
        : item.price) *
        item.quantity,
    0
  );

  const CartContent = () => (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/icons/empty_cart.png")}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Image
                source={{ uri: item.images[0] }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.selectedDetails}>
                  Size: {item.selectedSize} | Color: {item.selectedColor}{" "}
                  | Quantity: {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: ₨ {totalAmount.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() =>
              navigation.navigate("CheckOut", {
                user: user,
                cartItems: cartItems,
              })
            }
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Cart " 
        component={CartContent}
        options={{
          headerShown: true,
          headerLeft: () => null, // This removes the back button
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate("OrderHistory", { userId: user._id })}
            >
              <Ionicons name="receipt-outline" size={24} color="#3498db" />
            </TouchableOpacity>
          ),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#2c3e50',
          },
          gestureEnabled: false // Disables the iOS swipe-back gesture
        }}
      />

      <Stack.Screen 
        name="CheckOut"
        options={{ 
          headerShown: true,
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#2c3e50',
          },
        }}
      >
        {(props) => (
          <CheckOutScreen
            {...props}
            user={user}
            cartItems={cartItems}
          />
        )}
      </Stack.Screen>

      <Stack.Screen 
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ 
          title: 'Order History',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#2c3e50',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  headerIcon: {
    marginRight: 15,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyIcon: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: "#7f8c8d",
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 10,
  },
  selectedDetails: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  removeButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  totalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34495e",
  },
  checkoutButton: {
    backgroundColor: "#2980b9",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CartScreen;