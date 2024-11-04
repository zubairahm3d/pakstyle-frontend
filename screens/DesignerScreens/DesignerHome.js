import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
// import clothesData from "../../data/clothesData.json"; // Import the JSON file
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DesginerProfile from "./DesignerProfile";
import DesignerPortfolio from "./DesignerPortfolio";
import DesignerOrder from "./DesignerOrder";

import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const BrandHomeScreen = ({ navigation, route }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused
              ? require("../../assets/icons/home_selected.png")
              : require("../../assets/icons/home_unselected.png");
          } else if (route.name === "Portfolio") {
            iconName = focused
              ? require("../../assets/icons/browse_selected.png")
              : require("../../assets/icons/browse_unselected.png");
          } else if (route.name === "Profile") {
            iconName = focused
              ? require("../../assets/icons/designer_selected.png")
              : require("../../assets/icons/designer_unselected.png");
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
      <Tab.Screen name="Dashboard">{() => <HomeScreenContent />}</Tab.Screen>
      {/* <Tab.Screen
        name="Portfolio"
        component={DesignerPortfolio}
        options={{ headerShown: false }} // Hide header for Browse screen
      /> */}

      <Tab.Screen name="Portfolio" options={{ headerShown: false }}>
        {({ navigation }) => (
          <DesignerPortfolio user={route.params.user} navigation={navigation} />
        )}
      </Tab.Screen>

      <Tab.Screen name="Orders" component={DesignerOrder} />

      <Tab.Screen name="Profile" options={{ headerShown: false }}>
        {({ navigation }) => (
          <DesginerProfile user={route.params.user} navigation={navigation} />
        )}
      </Tab.Screen>

      {/* <Tab.Screen
        name="Profile"
        component={DesginerProfile}
        options={{ headerShown: false }} // Hide header for Profile screen
      /> */}
      {/* since we are hiding buttons of below screens from the tab bar
    thats why we are moving to these below screens using navigations */}
      {/* <Tab.Screen
        name="Brand's Newest Collection"
        // component={BrandNewItems}
        options={({ headerShown: false }, { tabBarButton: () => null })} // Hide from tab bar
      />
      <Tab.Screen
        name="Brand's Popular Collection"
        component={BrandPopularItems}
        options={({ headerShown: false }, { tabBarButton: () => null })}
        // Hide from tab bar
      />
      <Tab.Screen
        name="Brand Item"
        component={BrandItem}
        options={({ headerShown: false }, { tabBarButton: () => null })}
        // Hide from tab bar
      /> */}
    </Tab.Navigator>
  );
};

const HomeScreenContent = ({}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.box}
        // onPress={() => navigation.navigate("Brand's Newest Collection")} // Navigate to NewItems screen
      >
        <Text style={styles.boxText}>Newest Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        // onPress={() => navigation.navigate("Brand's Popular Collection")} // Navigate to MostSearchedItems screen
      >
        <Text style={styles.boxText}>Popular Collection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
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
    width: "80%",
    height: 150,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  boxText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default BrandHomeScreen;
