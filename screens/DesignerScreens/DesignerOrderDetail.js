import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from "@env";

const DesignerOrderDetail = ({ route, navigation }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [orderStatus, setOrderStatus] = useState(initialOrder.status);
  const [showButtons, setShowButtons] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/custom-orders/${initialOrder._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();
      if (result.success) {
        setOrder(result.data);
        setOrderStatus(result.data.status);
        setShowButtons(result.data.status !== 'completed' && result.data.status !== 'cancelled');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to fetch latest order details');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrderData();
    }, [initialOrder._id])
  );

  const updateOrderStatus = async (newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/custom-orders/${order._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const result = await response.json();
      if (result.success) {
        setOrderStatus(newStatus);
        setShowButtons(false);
        Alert.alert('Success', `Order has been marked as ${newStatus}`);
        fetchOrderData();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = () => {
    Alert.alert(
      'Complete Order',
      'Are you sure you want to mark this order as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => updateOrderStatus('completed') }
      ]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => updateOrderStatus('cancelled') }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      case 'inProgress':
        return '#f39c12';
      default:
        return '#555';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.orderSummary}>
        <Text style={styles.orderTitle}>Order Overview</Text>
        <Text style={styles.detail}>Order ID: {order.customOrderId}</Text>
        <Text style={[styles.detail, { color: getStatusColor(orderStatus), fontWeight: 'bold' }]}>
          Status: {orderStatus}
        </Text>
        <Text style={styles.detail}>Created At: {new Date(order.createdAt).toLocaleString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.detail}>Name: {order.fullName}</Text>
        <Text style={styles.detail}>Email: {order.email}</Text>
        <Text style={styles.detail}>Phone: {order.phone}</Text>
        <Text style={styles.detail}>Address: {order.address}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Garment Details</Text>
        <Text style={styles.detail}>Type: {order.garmentType}</Text>
        <Text style={styles.detail}>Occasion: {order.occasion}</Text>
        <Text style={styles.detail}>Pattern: {order.pattern}</Text>
        <Text style={styles.detail}>Fitting: {order.fitting}</Text>
        <Text style={styles.detail}>Neckline: {order.neckline}</Text>
        <Text style={styles.detail}>Sleeves: {order.sleeves}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        <Text style={styles.detail}>Chest: {order.measurements.chest} cm</Text>
        <Text style={styles.detail}>Shoulder: {order.measurements.shoulder} cm</Text>
        <Text style={styles.detail}>Waist: {order.measurements.waist} cm</Text>
        <Text style={styles.detail}>Inseam: {order.measurements.inseam} cm</Text>
        <Text style={styles.detail}>Arm Length: {order.measurements.armLength} cm</Text>
        <Text style={styles.detail}>Leg Length: {order.measurements.legLength} cm</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <Text style={styles.detail}>Special Instructions: {order.specialInstructions || 'None'}</Text>
        <Text style={styles.detail}>Delivery Preference: {order.deliveryPreference}</Text>
        <Text style={styles.detail}>Payment Method: {order.paymentMethod}</Text>
        <Text style={styles.detail}>Rush Order: {order.rushOrder ? 'Yes' : 'No'}</Text>
      </View>

      {showButtons && orderStatus !== 'completed' && orderStatus !== 'cancelled' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
          >
            <Text style={styles.buttonText}>Mark as Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
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
    marginBottom: 10,
  },
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
  detail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: "#27ae60",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    height: 65,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    height: 65,
    marginLeft: 5,
  },
  backButton: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    height: 50,
    marginBottom: 20,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DesignerOrderDetail;