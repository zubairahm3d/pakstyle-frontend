import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Image,
} from 'react-native';
import { API_URL } from "@env";

const OrderHistoryScreen = ({ route }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = route.params;

  useEffect(() => {
    fetchOrdersWithProducts();
  }, []);

  const fetchOrdersWithProducts = async () => {
    try {
      const ordersResponse = await fetch(`${API_URL}/orders`);
      const ordersData = await ordersResponse.json();
      const userOrders = ordersData.filter(order => order.userId === userId);

      const ordersWithProducts = await Promise.all(
        userOrders.map(async (order) => {
          const productDetails = await Promise.all(
            order.items.map(async (item) => {
              try {
                const productResponse = await fetch(`${API_URL}/products/${item.productId}`);
                const productData = await productResponse.json();
                return {
                  ...item,
                  productDetails: productData
                };
              } catch (error) {
                console.error('Error fetching product:', error);
                return {
                  ...item,
                  productDetails: null
                };
              }
            })
          );

          return {
            ...order,
            items: productDetails
          };
        })
      );

      setOrders(ordersWithProducts);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleContainer}>
          <Text style={styles.orderNumber}>Order #{item.orderId}</Text>
          <Text style={styles.orderDate}>
            {formatDate(item.orderDate)}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          Status: {item.status}
        </Text>
        <Text style={[styles.orderStatus, { color: getPaymentStatusColor(item.paymentStatus) }]}>
          Payment: {item.paymentStatus}
        </Text>
      </View>

      <FlatList
        data={item.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: orderItem }) => (
          <View style={styles.productContainer}>
            {orderItem.productDetails && orderItem.productDetails.images && (
              <Image 
                source={{ uri: orderItem.productDetails.images[0] }}
                style={styles.productImage}
              />
            )}
            <View style={styles.productDetails}>
              <Text style={styles.productName}>
                {orderItem.productDetails ? orderItem.productDetails.name : 'Product Unavailable'}
              </Text>
              <Text style={styles.productSpecs}>
                Quantity: {orderItem.quantity}
              </Text>
              {orderItem.productDetails && (
                <Text style={styles.productPrice}>
                  ₨ {(orderItem.productDetails.price * orderItem.quantity).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        )}
        scrollEnabled={false}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Order Total:</Text>
        <Text style={styles.orderTotal}>₨ {item.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f39c12';
      case 'Processing': return '#3498db';
      case 'Shipped': return '#27ae60';
      case 'Canceled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'failed': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderTitleContainer: {
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  productContainer: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginVertical: 5,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productSpecs: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27ae60',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;