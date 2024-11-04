import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import clothesData from "../../data/clothesData.json";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "./ProfileScreen";
import SearchScreen from "./SearchScreen";
import BrowseScreen from "./BrowseScreen";
import NewItemsScreen from "./NewItemsScreen";
import MostSearchedItemsScreen from "./MostSearchItemsScreen";
import { useNavigation } from "@react-navigation/native";
import Designers from "./DesignersScreen";
import ItemScreen from "./ItemScreen";
import CartScreen from "./CartScreen";
import { CartProvider } from "../Context/CartContext";
import CheckOutScreen from "./CheckOutScreen";
import DesignerDetailScreen from "./DesignerDetailScreen";
import DesignerOrderScreen from "./DesignerOrderScreen";

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation, route }) => {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    setClothes(clothesData);
  }, []);

  return (
    <CartProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Dashboard") {
              iconName = focused
                ? require("../../assets/icons/home_selected.png")
                : require("../../assets/icons/home_unselected.png");
            } else if (route.name === "Browse") {
              iconName = focused
                ? require("../../assets/icons/browse_selected.png")
                : require("../../assets/icons/browse_unselected.png");
            } else if (route.name === "Search") {
              iconName = focused
                ? require("../../assets/icons/search_selected.png")
                : require("../../assets/icons/search_unselected.png");
            } else if (route.name === "Profile") {
              iconName = focused
                ? require("../../assets/icons/profile_selected.png")
                : require("../../assets/icons/profile_unselected.png");
            } else if (route.name === "Designers") {
              iconName = focused
                ? require("../../assets/icons/designer_selected.png")
                : require("../../assets/icons/designer_unselected.png");
            } else if (route.name === "Cart") {
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
          {() => <HomeScreenContent clothes={clothes} />}
        </Tab.Screen>
        <Tab.Screen name="Browse" options={{ headerShown: false }}>
          {() => <BrowseScreen user={route.params.user} />}
        </Tab.Screen>

        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen
          name="Designers"
          component={Designers}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Cart" options={{ headerShown: false }}>
          {() => (
            <CartScreen user={route.params.user} navigation={navigation} />
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile" options={{ headerShown: false }}>
          {() => (
            <ProfileScreen user={route.params.user} navigation={navigation} />
          )}
        </Tab.Screen>
        {/* <Tab.Screen
          name="Check Out"
          options={{ headerShown: false, tabBarButton: () => null }} // Hide from tab bar
        >
          {() => (
            <CheckOutScreen user={route.params.user} navigation={navigation} />
          )}
        </Tab.Screen> */}

        <Tab.Screen
          name="Designer Order"
          component={DesignerOrderScreen}
          options={{ headerShown: false, tabBarButton: () => null }}
        />

        <Tab.Screen
          name="Designer Detail"
          component={DesignerDetailScreen}
          options={{ headerShown: false, tabBarButton: () => null }}
        />

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
      </Tab.Navigator>
    </CartProvider>
  );
};

const HomeScreenContent = ({ clothes }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("New Collection")}
      >
        <Text style={styles.boxText}>Newest Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("Popular Collection")}
      >
        <Text style={styles.boxText}>Popular Collection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  box: {
    width: "90%",
    height: 150,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3498db",
    borderRadius: 10,
    shadowColor: "#2c3e50",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 10,
  },
  boxText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default HomeScreen;
