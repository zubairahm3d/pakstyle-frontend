import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  BackHandler, 
  Alert
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from "@env";

// Screen imports remain the same...
import ProfileScreen from "./ProfileScreen";
import SearchScreen from "./SearchScreen";
import BrowseScreen from "./BrowseScreen";
import NewItemsScreen from "./NewItemsScreen";
import MostSearchedItemsScreen from "./MostSearchItemsScreen";
import Designers from "./DesignersScreen";
import DesignerDetailScreen from "./DesignerDetailScreen";
import ItemScreen from "./ItemScreen";
import CartScreen from "./CartScreen";
import ChatScreen from './ChatScreen';
import ConversationDetailScreen from './ConversationDetailScreen';
import ShowDesignerPortfolio from "./ShowDesignerPortfolio";
import DesignerOrderScreen from "./DesignerOrderScreen";
import DesignerOrderHistory from "./DesignerOrderHistory";
import DesignerOrderDetail from "./DesignerOrderDetail";
import VirtualTryOn from './VirtualTryOn';

// Context imports
import { CartProvider } from "../Context/CartContext";

const Tab = createBottomTabNavigator();

// Separate component for the main home content
const MainHomeScreen = ({ user }) => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() }
          ],
          { cancelable: false }
        );
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('An error occurred while fetching products. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate("ItemScreen", { item })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Rs. {item.price}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user.name}!</Text>
        <Text style={styles.subGreeting}>Check out our latest products</Text>
      </View>

      <View style={styles.collectionsContainer}>
        <TouchableOpacity
          style={styles.collectionBox}
          onPress={() => navigation.navigate("New Collection")}
        >
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            style={styles.gradient}
          >
            <Text style={styles.collectionText}>Newest Collection</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.collectionBox}
          onPress={() => navigation.navigate("Popular Collection")}
        >
          <LinearGradient
            colors={['#e74c3c', '#c0392b']}
            style={styles.gradient}
          >
            <Text style={styles.collectionText}>Popular Collection</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

// Main component that sets up the tab navigator
const HomeScreen = ({ navigation, route }) => {
  const { user } = route.params;

  return (
    <CartProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Main") {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === "Browse") {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === "Search") {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === "Profile") {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === "Designers") {
              iconName = focused ? 'brush' : 'brush-outline';
            } else if (route.name === "Cart") {
              iconName = focused ? 'cart' : 'cart-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.1,
            shadowRadius: 20,
          },
        })}
      >
        {/* Tab screens configuration remains the same... */}
        <Tab.Screen 
          name="Main" 
          options={{
            title: "Home",
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerChatIcon}
                onPress={() => navigation.navigate('Chat', { userId: user._id })}
              >
                <Ionicons name="chatbubble-ellipses" size={24} color="#3498db" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        >
          {() => <MainHomeScreen user={user} />}
        </Tab.Screen>

        <Tab.Screen name="Browse" options={{ headerShown: false }}>
          {() => <BrowseScreen user={user} />}
        </Tab.Screen>
        
        <Tab.Screen name="Search" component={SearchScreen} />
        
        <Tab.Screen name="Designers" options={{ headerShown: false }}>
          {() => <Designers user={user} />}
        </Tab.Screen>

        <Tab.Screen 
          name="ShowDesignerPortfolio" 
          component={ShowDesignerPortfolio} 
          options={{ headerShown: false, tabBarButton: () => null }} 
        />

        <Tab.Screen 
          name="Designer Order" 
          component={DesignerOrderScreen}
          options={{ headerShown: false, tabBarButton: () => null }} 
        />

        <Tab.Screen 
          name="Designer Order History" 
          component={DesignerOrderHistory}
          options={{ headerShown: false, tabBarButton: () => null }} 
        />

        <Tab.Screen 
          name="Designer Order Detail" 
          component={DesignerOrderDetail}
          options={{ headerShown: false, tabBarButton: () => null }} 
        />

        <Tab.Screen name="Cart" options={{ headerShown: false }}>
          {() => <CartScreen user={user} navigation={navigation} />}
        </Tab.Screen>
        
        <Tab.Screen name="Profile" options={{ headerShown: false }}>
          {() => <ProfileScreen user={user} navigation={navigation} />}
        </Tab.Screen>

        <Tab.Screen 
          name="New Collection" 
          component={NewItemsScreen} 
          options={{ headerShown: false, tabBarButton: () => null }} 
        />
        
        <Tab.Screen 
          name="Popular Collection" 
          component={MostSearchedItemsScreen} 
          options={{ headerShown: false, tabBarButton: () => null }} 
        />
        
        <Tab.Screen 
          name="ItemScreen" 
          component={ItemScreen} 
          options={{ headerShown: false, tabBarButton: () => null }} 
        />
        
        <Tab.Screen 
          name="Designer Detail" 
          component={DesignerDetailScreen} 
          options={{ headerShown: false, tabBarButton: () => null }} 
        />
        
        <Tab.Screen 
          name="Chat" 
          options={{ headerShown: false, tabBarButton: () => null }}
        >
          {(props) => <ChatScreen {...props} user={user} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="ConversationDetail" 
          options={{ headerShown: false, tabBarButton: () => null }}
        >
          {(props) => <ConversationDetailScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen 
          name="Virtual Try-On" 
          component={VirtualTryOn}
          options={{ headerShown: false, tabBarButton: () => null }}
        />
      </Tab.Navigator>
    </CartProvider>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subGreeting: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  collectionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  collectionBox: {
    width: '48%',
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  collectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  productList: {
    paddingHorizontal: 10,
  },
  productItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  headerChatIcon: {
    marginRight: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;