import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { API_URL } from "@env";

const BrandOrder = ({ user, navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const userId = user._id;

  // Use useFocusEffect to fetch data whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchOrdersAndUsers = async () => {
        setLoading(true); // Start loading
        try {
          console.log(`IP`);
          const ordersResponse = await fetch(`${API_URL}/orders`);
          if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
          const ordersData = await ordersResponse.json();

          const usersResponse = await fetch(`${API_URL}/users`);
          if (!usersResponse.ok) throw new Error("Failed to fetch users");
          const usersData = await usersResponse.json();

          // Filter brand orders to exclude those that are Shipped or Canceled
          const brandOrders = ordersData.filter(
            (order) =>
              order.items.some((item) => item.brandId === userId) &&
              order.status !== "Shipped" &&
              order.status !== "Canceled"
          );

          setOrders(brandOrders);
          setUsers(usersData);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "There was a problem fetching orders or users.");
        } finally {
          setLoading(false); // Stop loading
        }
      };

      fetchOrdersAndUsers();
    }, [userId]) // Dependency array
  );

  const handleOrderPress = (order, userInfo) => {
    navigation.navigate("BrandOrderDetail", { order, userInfo });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Fetching orders...</Text>
      </View>
    );
  }

  const getUserInfo = (userId) => {
    const userInfo = users.find((user) => user._id === userId);
    return userInfo || {};
  };

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          <Ionicons name="cart-outline" size={64} color="#6200ee" />

          <Text style={styles.noOrdersText}>No orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => {
            const userInfo = getUserInfo(item.userId);
            const formattedDate = new Date(item.orderDate).toLocaleDateString(
              undefined,
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <TouchableOpacity
                style={styles.orderContainer}
                onPress={() => handleOrderPress(item, userInfo)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#6200ee"
                  />
                </View>
                <View style={styles.userInfoContainer}>
                  {userInfo.profilePicture && (
                    <Image
                      source={{ uri: userInfo.profilePicture }}
                      style={styles.profilePicture}
                    />
                  )}
                  <View>
                    <Text style={styles.userName}>{userInfo.name}</Text>
                    <Text style={styles.userEmail}>{userInfo.email}</Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color="#6200ee"
                    />
                    <Text style={styles.detailText}>Status: {item.status}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cube-outline" size={20} color="#6200ee" />
                    <Text style={styles.detailText}>
                      Quantity:{" "}
                      {item.items.reduce(
                        (total, itemDetails) => total + itemDetails.quantity,
                        0
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color="#6200ee"
                    />
                    <Text style={styles.detailText}>
                      ${item.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{formattedDate}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6200ee",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noOrdersText: {
    fontSize: 18,
    color: "#6200ee",
    marginTop: 10,
  },
  orderContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: {
    fontWeight: "700",
    fontSize: 20,
    color: "#333",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userName: {
    fontWeight: "600",
    color: "#6200ee",
    fontSize: 16,
  },
  userEmail: {
    color: "#666",
    fontSize: 14,
  },
  orderDetails: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
  orderDate: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    textAlign: "right",
  },
});

export default BrandOrder;
