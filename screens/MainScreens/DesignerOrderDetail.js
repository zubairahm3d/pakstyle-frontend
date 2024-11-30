import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const DesignerOrderDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { order } = route.params;

  const renderDetailItem = (label, value, icon) => (
    <View style={styles.detailItem}>
      <View style={styles.detailLabelContainer}>
        {icon && <Ionicons name={icon} size={20} color="#666" style={styles.icon} />}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'inProgress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>{order.customOrderId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            {renderDetailItem('Garment Type', order.garmentType, 'shirt-outline')}
            {renderDetailItem('Occasion', order.occasion, 'calendar-outline')}
            {renderDetailItem('Fabric', order.fabric, 'color-palette-outline')}
            {renderDetailItem('Color', order.color, 'color-fill-outline')}
            {renderDetailItem('Pattern', order.pattern, 'grid-outline')}
            {renderDetailItem('Fitting', order.fitting, 'resize-outline')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            {renderDetailItem('Full Name', order.fullName, 'person-outline')}
            {renderDetailItem('Email', order.email, 'mail-outline')}
            {renderDetailItem('Phone', order.phone, 'call-outline')}
            {renderDetailItem('Address', order.address, 'location-outline')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurements</Text>
            {renderDetailItem('Chest', `${order.measurements.chest} cm`, 'resize-outline')}
            {renderDetailItem('Shoulder', `${order.measurements.shoulder} cm`, 'resize-outline')}
            {renderDetailItem('Waist', `${order.measurements.waist} cm`, 'resize-outline')}
            {renderDetailItem('Inseam', `${order.measurements.inseam} cm`, 'resize-outline')}
            {renderDetailItem('Arm Length', `${order.measurements.armLength} cm`, 'resize-outline')}
            {renderDetailItem('Leg Length', `${order.measurements.legLength} cm`, 'resize-outline')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            {renderDetailItem('Special Instructions', order.specialInstructions || 'None', 'create-outline')}
            {renderDetailItem('Delivery Preference', order.deliveryPreference, 'car-outline')}
            {renderDetailItem('Payment Method', order.paymentMethod, 'card-outline')}
            {renderDetailItem('Rush Order', order.rushOrder ? 'Yes' : 'No', 'flash-outline')}
            {renderDetailItem('Consultation Date', new Date(order.consultationDate).toLocaleDateString(), 'calendar-outline')}
            {renderDetailItem('Order Date', new Date(order.createdAt).toLocaleDateString(), 'today-outline')}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: width * 0.03,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: width * 0.05,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  orderId: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: width * 0.035,
    fontWeight: '600',
  },
  section: {
    marginBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: height * 0.01,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: width * 0.02,
  },
  detailLabel: {
    fontSize: width * 0.04,
    color: '#666',
  },
  detailValue: {
    fontSize: width * 0.04,
    color: '#333',
    fontWeight: '500',
  },
});

export default DesignerOrderDetail;