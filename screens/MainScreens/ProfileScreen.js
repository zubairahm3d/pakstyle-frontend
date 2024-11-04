import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ChangePasswordScreen from "./ChangePasswordScreen";

const Drawer = createDrawerNavigator();

const ProfileScreen = ({ navigation, user }) => {
  const userDataFromJson = user;

  const handleLogout = () => {
    navigation.navigate("Main"); // Navigate back to the main screen on logout
  };

  return (
    <Drawer.Navigator initialRouteName="Profile ">
      <Drawer.Screen name="Profile " options={{ title: "Profile " }}>
        {() => (
          <View style={styles.container}>
            <Image
              style={styles.profilePic}
              source={{ uri: userDataFromJson.profilePicture }}
            />
            <Text style={styles.nameText}>{userDataFromJson.name}</Text>
            <Text style={styles.locationText}>{userDataFromJson.location}</Text>
            <Text style={styles.usernameText}>
              Username: {userDataFromJson.username}
            </Text>
            <Text style={styles.emailText}>
              Email: {userDataFromJson.email}
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="ChangePassword"
        options={{ title: "Change Password" }}
      >
        {() => <ChangePasswordScreen user={userDataFromJson} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#2980b9",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
