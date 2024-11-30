import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const DesignerCard = ({ designer, onPress }) => {
  const scale = new Animated.Value(1);

  const animateScale = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  return (
    <AnimatedTouchable
      style={[styles.designerContainer, { transform: [{ scale }] }]}
      onPress={() => {
        animateScale();
        onPress();
      }}
    >
      <Image
        source={{ uri: designer.profilePicture }}
        style={styles.profilePic}
      />
      <View style={styles.designerInfo}>
        <Text style={styles.name}>{designer.name || 'Unknown Designer'}</Text>
        <Text style={styles.email}>{designer.email || 'No email provided'}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{(Math.random() * 2 + 3).toFixed(1)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#0ea5e9" style={styles.chevron} />
    </AnimatedTouchable>
  );
};

function DesignerScreen({ user }) {
  const navigation = useNavigation();
  const [designers, setDesigners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        if (response.ok) {
          const designerData = data.filter(user => user.userType === "designer");
          setDesigners(designerData);
        } else {
          setError('Failed to fetch designers');
        }
      } catch (error) {
        console.error('Error fetching designers:', error);
        setError('An error occurred while fetching designers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigners();
  }, []);

  const handleDesignerPress = (designer) => {
    navigation.navigate('Designer Detail', { 
      designer: designer,
      user: user
    });
  };

  const handleOrderHistoryPress = () => {
    navigation.navigate('Designer Order History', { user: user });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setIsLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <View style={styles.header}>
        <Text style={styles.heading}>Designers</Text>
        <TouchableOpacity
          style={styles.orderHistoryButton}
          onPress={handleOrderHistoryPress}
        >
          <MaterialIcons name="history" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={designers}
        renderItem={({ item }) => (
          <DesignerCard
            designer={item}
            onPress={() => handleDesignerPress(item)}
          />
        )}
        keyExtractor={(item, index) => item.id ? item.id.toString() : `designer-${index}`}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  orderHistoryButton: {
    padding: 10,
  },
  listContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
  },
  designerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profilePic: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    marginRight: width * 0.04,
  },
  designerInfo: {
    flex: 1,
  },
  name: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.005,
  },
  email: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: height * 0.005,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: width * 0.035,
    color: '#666',
    marginLeft: width * 0.01,
  },
  chevron: {
    marginLeft: width * 0.02,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
  },
  errorText: {
    fontSize: width * 0.045,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: height * 0.02,
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

export default DesignerScreen;