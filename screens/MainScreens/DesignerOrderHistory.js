import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const DesignerOrderHistory = () => {
  const route = useRoute();
  const user = route.params?.user;
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Value formatting helpers
  const formatPaymentMethod = (method) => {
    const paymentMethods = {
      'cod': 'Cash on Delivery',
      'card': 'Credit/Debit Card',
      'mobileMoney': 'JazzCash/Easypaisa'
    };
    return paymentMethods[method] || method;
  };

  const formatDeliveryPreference = (preference) => {
    const deliveryPreferences = {
      'homeDelivery': 'Home Delivery',
      'pickup': 'Pickup from Store'
    };
    return deliveryPreferences[preference] || preference;
  };

  const formatGarmentType = (type) => {
    const garmentTypes = {
      'shalwarKameez': 'Shalwar Kameez',
      'kurtaPajama': 'Kurta Pajama',
      'sherwani': 'Sherwani',
      'waistcoat': 'Waistcoat'
    };
    return garmentTypes[type] || type;
  };

  const formatOrderData = (orderData) => {
    if (!orderData) return null;
    
    return {
      ...orderData,
      // Format the values
      paymentMethod: formatPaymentMethod(orderData.paymentMethod),
      deliveryPreference: formatDeliveryPreference(orderData.deliveryPreference),
      garmentType: formatGarmentType(orderData.garmentType),
      // Add formatted value for any other fields that need it
    };
  };

  const fetchOrders = async () => {
    if (!user || !user._id) {
      setError('User information is missing');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/custom-orders?userId=${user._id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders. Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const ordersArray = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);
      
      // Format each order's data
      const formattedOrders = ordersArray.map(formatOrderData).filter(Boolean);
      
      console.log(`Fetched ${formattedOrders.length} orders for designer:`, user._id);
      
      setOrders(formattedOrders);
      setError(null);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#FFA500',
      'confirmed': '#4CAF50',
      'inProgress': '#2196F3',
      'completed': '#4CAF50',
      'cancelled': '#F44336'
    };
    return statusColors[status?.toLowerCase()] || '#757575';
  };

  const getStatusText = (status) => {
    if (!status) return 'N/A';
    
    const statusTexts = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'inProgress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusTexts[status] || status;
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('Designer Order Detail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.customOrderId ?? 'N/A'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderBody}>
        <View style={styles.infoRow}>
          <Ionicons name="shirt-outline" size={24} color="#666" style={styles.icon} />
          <Text style={styles.orderDetail}>{item.garmentType ?? 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
          <Text style={styles.customerName}>{item.fullName ?? 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" style={styles.icon} />
          <Text style={styles.orderDate}>
            Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#666" style={styles.icon} />
          <Text style={styles.consultationDate}>
            Consultation: {item.consultationDate ? new Date(item.consultationDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
      </View>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.noOrdersText}>No orders found</Text>
          <Text style={styles.noOrdersSubText}>New orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: width * 0.05,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  orderId: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.005,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: width * 0.03,
    fontWeight: '600',
  },
  orderBody: {
    marginBottom: height * 0.015,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.008,
  },
  orderDetail: {
    fontSize: width * 0.04,
    color: '#666',
    marginLeft: width * 0.02,
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: width * 0.04,
    color: '#666',
    marginLeft: width * 0.02,
    fontWeight: '500',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: height * 0.01,
  },
  orderDate: {
    fontSize: width * 0.035,
    color: '#666',
    marginLeft: width * 0.02,
  },
  consultationDate: {
    fontSize: width * 0.035,
    color: '#666',
    marginLeft: width * 0.02,
  },
  icon: {
    marginRight: width * 0.01,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  noOrdersText: {
    fontSize: width * 0.045,
    color: '#666',
    marginTop: height * 0.02,
    textAlign: 'center',
  },
  noOrdersSubText: {
    fontSize: width * 0.035,
    color: '#999',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  errorText: {
    fontSize: width * 0.04,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.1,
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
});

export default DesignerOrderHistory;