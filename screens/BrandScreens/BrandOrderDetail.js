import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";

const BrandOrderDetail = ({ route }) => {
  const navigation = useNavigation();
  const { order, userInfo } = route.params;

  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [shippingStatus, setShippingStatus] = useState(order.status);
  const [showButtons, setShowButtons] = useState(true); // New state variable

  const fetchProductDetails = async (productId) => {
    console.log(userInfo);
    try {
      const response = await fetch(`${API_URL}/products/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAllProductDetails = async () => {
      const details = {};
      for (const item of order.items) {
        const productDetail = await fetchProductDetails(item.productId);
        if (productDetail) {
          details[item.productId] = productDetail;
        }
      }
      setProductDetails(details);
      setLoading(false);
    };

    fetchAllProductDetails();
  }, [order.items]);

  const markAsShipped = async () => {
    try {
      console.log(`IP`);
      const response = await fetch(`${API_URL}/orders/${order._id}`, {
        method: "POST", // Change to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Shipped",
          recipientEmail: userInfo.email,
        }), // Status in body
      });

      if (response.ok) {
        setShippingStatus("Shipped");
        setShowButtons(false); // Hide buttons
      } else {
        console.error("Failed to mark as shipped");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const cancelOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${order._id}`, {
        method: "POST", // Change to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Canceled",
          recipientEmail: userInfo.email,
        }), // Status in body
      });

      if (response.ok) {
        setShippingStatus("Canceled");
        setShowButtons(false); // Hide buttons
      } else {
        console.error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.orderSummary}>
        <Text style={styles.orderTitle}>Order Overview</Text>
        <Text style={styles.orderDetail}>Order ID: {order.orderId}</Text>
        <Text style={styles.orderDetail}>
          Total Amount: ${order.totalPrice.toFixed(2)}
        </Text>
        <Text style={styles.orderDetail}>Order Date: {order.date}</Text>
        <Text style={styles.orderDetail}>
          Estimated Delivery: {order.estimatedDelivery}
        </Text>
        <Text style={styles.status(shippingStatus)}>{shippingStatus}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.orderDetail}>Name: {userInfo.name}</Text>
        <Text style={styles.orderDetail}>Email: {userInfo.email}</Text>
        <Text style={styles.orderDetail}>Phone: {userInfo.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text style={styles.shippingAddress}>
          {`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}, ${order.shippingAddress.zipCode}`}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Order Items</Text>
      {order.items.map((itemDetails, index) => {
        const productDetail = productDetails[itemDetails.productId];
        return (
          <View key={index} style={styles.itemCard}>
            <Image
              source={{
                uri:
                  productDetail?.images[0] || "https://via.placeholder.com/100",
              }}
              style={styles.productImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>
                {productDetail?.name || "N/A"}
              </Text>
              <View style={styles.itemDetailRow}>
                <Text style={styles.label}>Quantity:</Text>
                <Text style={styles.itemDetail}>{itemDetails.quantity}</Text>
              </View>
              <View style={styles.itemDetailRow}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.itemDetail}>
                  ${(order.totalPrice / itemDetails.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Text style={styles.orderDetail}>{order.paymentMethod}</Text>
      </View>

      {showButtons && shippingStatus !== "Shipped" && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.shippedButton}
            onPress={markAsShipped}
          >
            <Text style={styles.buttonText}>Mark as Shipped</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
            <Text style={styles.buttonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Orders</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f9fc",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  orderSummary: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  orderDetail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  status: (status) => ({
    fontSize: 18,
    fontWeight: "600",
    color:
      status === "Shipped"
        ? "#27ae60"
        : status === "Canceled"
        ? "#e74c3c"
        : "#555",
    marginTop: 10,
  }),
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  shippingAddress: {
    fontSize: 16,
    color: "#555",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  itemInfo: {
    marginLeft: 15,
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 16,
    color: "#777",
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  loader: {
    marginTop: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  shippedButton: {
    backgroundColor: "#27ae60", // Green color for "Mark as Shipped"
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    height: 50, // Set height for uniformity
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#e74c3c", // Red color for "Cancel Order"
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    height: 50, // Set height for uniformity
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: "#6200ee", // Purple color for "Back to Orders"
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    height: 50, // Set height for uniformity
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BrandOrderDetail;
