import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'available':
        return ['#4CAF50', '#45a049'];
      case 'busy':
        return ['#FFA000', '#FF8F00'];
      default:
        return ['#757575', '#616161'];
    }
  };

  return (
    <LinearGradient
      colors={getStatusColor()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.statusBadge}
    >
      <Text style={styles.statusText}>{status || 'Unknown'}</Text>
    </LinearGradient>
  );
};

const DesignerDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [showOrderScreen, setShowOrderScreen] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  const { designer = {}, user = {} } = route.params || {};

  const handleCheckDesigns = () => {
    navigation.navigate('ShowDesignerPortfolio', { 
      designerId: designer._id 
    });
  };

  const handlePlaceOrder = () => {
    navigation.navigate('Designer Order', {
      designerId: designer._id,
      user: user,
    });
  };

  if (showOrderScreen) {
    return <DesignerOrderScreen designerId={designer._id} user={user} />;
  }

  if (!designer._id) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>Designer information not available.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [height * 0.4, height * 0.2],
    extrapolate: 'clamp',
  });

  const imageSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [width * 0.35, width * 0.25],
    extrapolate: 'clamp',
  });

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <AnimatedLinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={[styles.header, { height: headerHeight }]}
      >
        <Animated.Image
          source={{ uri: designer.profilePicture || 'https://via.placeholder.com/150' }}
          style={[styles.profilePic, { width: imageSize, height: imageSize }]}
        />
        <Animated.View style={{ opacity: headerTextOpacity }}>
          <Text style={styles.name}>{designer.name || 'Unknown Designer'}</Text>
          <Text style={styles.username}>@{designer.username || 'username'}</Text>
          <StatusBadge status={designer.status} />
        </Animated.View>
      </AnimatedLinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color="#6a11cb" />
              <Text style={styles.infoText}>{designer.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color="#6a11cb" />
              <Text style={styles.infoText}>{designer.email || 'N/A'}</Text>
            </View>
            {designer.website && (
              <View style={styles.infoRow}>
                <MaterialIcons name="language" size={20} color="#6a11cb" />
                <Text style={styles.infoText}>{designer.website}</Text>
              </View>
            )}
          </View>

          {designer.address && (
            <View style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="location-on" size={24} color="#6a11cb" />
                <Text style={styles.cardTitle}>Address</Text>
              </View>
              <Text style={styles.addressText}>{designer.address.street || 'N/A'}</Text>
              <Text style={styles.addressText}>
                {designer.address.city || 'N/A'}, {designer.address.state || 'N/A'} {designer.address.zipCode || 'N/A'}
              </Text>
              <Text style={styles.addressText}>{designer.address.country || 'N/A'}</Text>
            </View>
          )}

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{designer.completedOrders || 0}</Text>
              <Text style={styles.statLabel}>Completed Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{designer.rating || '0.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{designer.experience || '0'} yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>About Me</Text>
            <Text style={styles.aboutText}>
              {designer.about || 'This designer hasnt provided any information yet.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCheckDesigns}>
          <FontAwesome5 name="tshirt" size={20} color="#fff" />
          <Text style={styles.buttonText}>Check Designs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handlePlaceOrder}>
          <FontAwesome5 name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.buttonText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6a11cb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profilePic: {
    borderRadius: width * 0.175,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 15,
  },
  name: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  username: {
    fontSize: width * 0.04,
    color: '#e0e0e0',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  infoContainer: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  addressText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a11cb',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  primaryButton: {
    backgroundColor: '#6a11cb',
  },
  buttonText: {
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DesignerDetailScreen;