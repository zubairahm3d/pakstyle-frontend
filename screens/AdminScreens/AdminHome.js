import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminProfile from "./AdminProfile";
import AdminUsers from "./AdminUsers";
import AdminUsersDetail from "./AdminUsersDetail"; // Import your UsersDetails component
import AdminBrandApproval from "./AdminBrandApproval";
import AdminBrandDetail from "./AdminBrandDetail";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const AdminHome = ({ navigation, route }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused
              ? require("../../assets/icons/home_selected.png")
              : require("../../assets/icons/home_unselected.png");
          } else if (route.name === "Users" || route.name === "Brands") {
            iconName = focused
              ? require("../../assets/icons/users_selected.png")
              : require("../../assets/icons/users_unselected.png");
          } else if (route.name === "Profile") {
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
      <Tab.Screen name="Dashboard" component={HomeScreenContent} />
      <Tab.Screen
        name="Users"
        component={AdminUsers}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Brands"
        component={AdminBrandApproval}
        options={{ headerShown: false }}
      />

      <Tab.Screen name="Profile" options={{ headerShown: false }}>
        {({ navigation }) => (
          <AdminProfile user={route.params.user} navigation={navigation} />
        )}
      </Tab.Screen>

      {/* UsersDetails tab that won't show in the tab bar */}
      <Tab.Screen
        name="Users Detail"
        component={AdminUsersDetail}
        options={{ tabBarButton: () => null }} // This hides the tab from the tab bar
      />

      <Tab.Screen
        name="Brands Detail"
        component={AdminBrandDetail}
        options={{ tabBarButton: () => null }} // This hides the tab from the tab bar
      />
    </Tab.Navigator>
  );
};

const HomeScreenContent = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("UsersDetails")} // Navigate to UsersDetails
      >
        <Text style={styles.boxText}>Newest Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("UsersDetails")} // Navigate to UsersDetails
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

export default AdminHome;
