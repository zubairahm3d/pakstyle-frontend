import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';

import BrandProfile from './BrandProfile';
import ShowOurCollections from './ShowOurCollections';
import AddNewItem from './AddNewItem';
import BrandNewItems from './BrandNewItems';
import BrandPopularItems from './BrandPopularItems';
import BrandItem from './BrandItem';
import BrandOrder from './BrandOrder';
import BrandOrderDetail from './BrandOrderDetail';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CollectionsStack = ({ brandId }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Collections" 
      component={ShowOurCollections}
      initialParams={{ brandId }}
    />
    <Stack.Screen name="Brand Item" component={BrandItem} />
  </Stack.Navigator>
);

const HomeScreenContent = ({ user }) => {
  const [topSalesItems, setTopSalesItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigation = useNavigation();

  React.useEffect(() => {
    fetchTopSalesItems();
  }, []);

  const fetchTopSalesItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/top-sales?brandId=${user._id}`);
      setTopSalesItems(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate('Our Collections')}
      >
        <Text style={styles.boxText}>Our Collections</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate('BrandPopularItems', { brandId: user._id })}
      >
        <Text style={styles.boxText}>Popular Collection</Text>
      </TouchableOpacity>
      <View style={styles.salesContainer}>
        <Text style={styles.salesTitle}>Top Sales</Text>
        {topSalesItems.map((item) => (
          <View key={item._id} style={styles.itemContainer}>
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSales}>Sales: {item.sales}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const BrandHomeScreen = ({ route }) => {
  const user = route.params.user;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused
              ? require('../../assets/icons/home_selected.png')
              : require('../../assets/icons/home_unselected.png');
          } else if (route.name === 'Our Collections') {
            iconName = focused
              ? require('../../assets/icons/browse_selected.png')
              : require('../../assets/icons/browse_unselected.png');
          } else if (route.name === 'Add New Item') {
            iconName = focused
              ? require('../../assets/icons/add_selected.png')
              : require('../../assets/icons/add_unselected.png');
          } else if (route.name === 'Brand Profile') {
            iconName = focused
              ? require('../../assets/icons/profile_selected.png')
              : require('../../assets/icons/profile_unselected.png');
          } else if (route.name === 'Orders') {
            iconName = focused
              ? require('../../assets/icons/order_selected.png')
              : require('../../assets/icons/order_unselected.png');
          }
          return (
            <Image
              source={iconName}
              style={{ width: 25, height: 25, tintColor: color }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard">
        {() => <HomeScreenContent user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Our Collections" options={{ headerShown: false }}>
        {() => <CollectionsStack brandId={user._id} />}
      </Tab.Screen>
      <Tab.Screen name="Add New Item">
        {() => <AddNewItem brandId={user._id} brandName={user.name} />}
      </Tab.Screen>
      <Tab.Screen name="Orders">
        {() => (
          <Stack.Navigator>
            <Stack.Screen
              name="BrandOrder"
              options={{ headerShown: false }}
            >
              {({ navigation }) => (
                <BrandOrder user={user} navigation={navigation} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="BrandOrderDetail"
              component={BrandOrderDetail}
            />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen name="Brand Profile" options={{ headerShown: false }}>
        {({ navigation }) => (
          <BrandProfile user={user} navigation={navigation} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    height: 150,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  boxText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  salesContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  salesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSales: {
    fontSize: 16,
    color: '#666',
  },
});

export default BrandHomeScreen;