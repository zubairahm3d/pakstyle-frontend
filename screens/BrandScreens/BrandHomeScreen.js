import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack"; // Import Stack Navigator
import BrandProfile from "./BrandProfile";
import ShowOurCollections from "./ShowOurCollections";
import AddNewItem from "./AddNewItem";
import BrandNewItems from "./BrandNewItems";
import BrandPopularItems from "./BrandPopularItems";
import BrandItem from "./BrandItem";
import BrandOrder from "./BrandOrder";
import BrandOrderDetail from "./BrandOrderDetail"; // Import the detail screen
import clothesData from "../../data/clothesData.json";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Create Stack Navigator

const BrandHomeScreen = ({ route }) => {
  const [clothes, setClothes] = useState([]);
  const user = route.params.user;

  useEffect(() => {
    setClothes(clothesData);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Dashboard") {
            iconName = focused
              ? require("../../assets/icons/home_selected.png")
              : require("../../assets/icons/home_unselected.png");
          } else if (route.name === "Show Our Collections") {
            iconName = focused
              ? require("../../assets/icons/browse_selected.png")
              : require("../../assets/icons/browse_unselected.png");
          } else if (route.name === "Add New Item") {
            iconName = focused
              ? require("../../assets/icons/add_selected.png")
              : require("../../assets/icons/add_unselected.png");
          } else if (route.name === "Brand Profile") {
            iconName = focused
              ? require("../../assets/icons/profile_selected.png")
              : require("../../assets/icons/profile_unselected.png");
          } else if (route.name === "Orders") {
            iconName = focused
              ? require("../../assets/icons/order_selected.png")
              : require("../../assets/icons/order_unselected.png");
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
        {() => <HomeScreenContent clothes={clothes} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Show Our Collections" component={ShowOurCollections} />
      <Tab.Screen name="Add New Item" component={AddNewItem} />

      {/* Stack Navigator for Orders */}
      <Tab.Screen name="Orders">
        {() => (
          <Stack.Navigator>
            <Stack.Screen
              name="BrandOrder"
              options={{ headerShown: false }} // Hide header for BrandOrder screen
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
      <Tab.Screen
        name="Brand's Newest Collection"
        component={BrandNewItems}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Brand's Popular Collection"
        component={BrandPopularItems}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Brand Item"
        component={BrandItem}
        options={{ headerShown: false, tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
};

const HomeScreenContent = ({ clothes, user }) => {
  const navigation = useNavigation();
  const topSalesItems = clothes
    .filter((item) => item.brand === user.name)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("Brand's Newest Collection")}
      >
        <Text style={styles.boxText}>Newest Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("Brand's Popular Collection")}
      >
        <Text style={styles.boxText}>Popular Collection</Text>
      </TouchableOpacity>
      <View style={styles.salesContainer}>
        <Text style={styles.salesTitle}>Top Sales</Text>
        {topSalesItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
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

// Add your styles here

// export default BrandHomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    paddingVertical: 20,
  },
  box: {
    width: "80%",
    height: 150,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  boxText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  salesContainer: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  salesTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
    color: "#333",
  },
  itemSales: {
    fontSize: 16,
    color: "#666",
  },
});

export default BrandHomeScreen;
