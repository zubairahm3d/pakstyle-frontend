import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, SafeAreaView, Linking } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ChangePasswordScreen from "./ChangePasswordScreen";
import EditProfileScreen from './EditProfileScreen';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';

const Drawer = createDrawerNavigator();

const ProfileContent = ({ user, navigation }) => {
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);

  const handleLogout = () => {
    // Add logout logic here
    navigation.navigate("Main");
  };

  const handleChangeProfilePicture = async () => {
    // Request permission for both camera and media library
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
      Alert.alert(
        "Permissions Required",
        "You need to allow access to your camera and photo library to change your profile picture.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() }
        ]
      );
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profilePicContainer}>
            <Image
              style={styles.profilePic}
              source={{ uri: profilePicture }}
            />
            <TouchableOpacity
              style={styles.changeProfilePicButton}
              onPress={handleChangeProfilePicture}
            >
              <Ionicons name="camera" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{user.name}</Text>
          <Text style={styles.usernameText}>@{user.username}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color="#6B7280" style={styles.infoIcon} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={24} color="#6B7280" style={styles.infoIcon} />
            <Text style={styles.infoText}>{user.address?.country || 'Country not set'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={24} color="#6B7280" style={styles.infoIcon} />
            <Text style={styles.infoText}>{user.phone || 'Phone not set'}</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="key-outline" size={24} color="#4F46E5" style={styles.actionIcon} />
            <Text style={styles.actionText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProfile', { user })}
          >
            <Ionicons name="create-outline" size={24} color="#4F46E5" style={styles.actionIcon} />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" style={styles.actionIcon} />
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileScreen = ({ navigation, user }) => {
  return (
    <Drawer.Navigator 
      initialRouteName="Profile " 
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 240,
        },
        drawerLabelStyle: {
          color: '#4B5563',
        },
      }}
    >
      <Drawer.Screen 
        name="Profile " 
        options={{
          title: "My Profile",
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {() => <ProfileContent user={user} navigation={navigation} />}
      </Drawer.Screen>

      <Drawer.Screen
        name="ChangePassword"
        options={{
          title: "Change Password",
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {() => <ChangePasswordScreen user={user} />}
      </Drawer.Screen>
      <Drawer.Screen
        name="EditProfile"
        options={{
          title: "Edit Profile",
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {(props) => <EditProfileScreen {...props} user={user} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  changeProfilePicButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
  },
  actionsSection: {
    padding: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
  },
});

export default ProfileScreen;

