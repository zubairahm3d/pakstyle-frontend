import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ChangePasswordScreen from "../MainScreens/ChangePasswordScreen";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';

const Drawer = createDrawerNavigator();

const ProfileScreen = ({ navigation, user }) => {
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);

  const handleLogout = () => {
    navigation.navigate("Main");
  };

  const handleChangeProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      uploadImage(imageUri);
    }
  };

  const uploadImage = async (imageUri) => {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile-picture.jpg',
    });
    formData.append('email', user.email);

    try {
      const response = await fetch(`${API_URL}/users/change-profile-pic`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setProfilePicture(result.url);
        Alert.alert("Success", "Profile picture updated successfully");
      } else {
        Alert.alert("Error", result.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert("Error", "An error occurred while updating your profile picture");
    }
  };

  return (
    <Drawer.Navigator initialRouteName="Profile ">
      <Drawer.Screen name="Profile " options={{ title: "Profile " }}>
        {() => (
          <View style={styles.container}>
            <View style={styles.profilePicContainer}>
              <Image
                style={styles.profilePic}
                source={{ uri: profilePicture }}
              />
              <TouchableOpacity
                style={styles.changeProfilePicButton}
                onPress={handleChangeProfilePicture}
              >
                <Ionicons name="camera" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.nameText}>{user.name}</Text>
            <Text style={styles.locationText}>{user.location}</Text>
            <Text style={styles.usernameText}>
              Username: {user.username}
            </Text>
            <Text style={styles.emailText}>
              Email: {user.email}
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
        {() => <ChangePasswordScreen user={user} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  changeProfilePicButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
    padding: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 20,
  },
  usernameText: {
    fontSize: 16,
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;