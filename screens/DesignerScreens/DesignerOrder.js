import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@env";

const DesignerOrder = ({ user, navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user ? user._id : null;

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch custom orders for the designer
      const response = await fetch(`${API_URL}/custom-orders?designerId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch custom orders");
      const data = await response.json();
      setOrders(data.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was a problem fetching custom orders.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleOrderPress = (order) => {
    navigation.navigate("DesignerOrderDetail", { order });
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: User information not available</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Fetching custom orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          <Ionicons name="cart-outline" size={64} color="#6200ee" />
          <Text style={styles.noOrdersText}>No custom orders found.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.customOrderId}
          renderItem={({ item }) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString(
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
                onPress={() => handleOrderPress(item)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order ID: {item.customOrderId}</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#6200ee"
                  />
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
                    <Ionicons name="shirt-outline" size={20} color="#6200ee" />
                    <Text style={styles.detailText}>
                      Type: {item.garmentType}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default DesignerOrder;

