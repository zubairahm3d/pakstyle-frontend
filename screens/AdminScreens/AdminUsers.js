import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@env";

const UserScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const apiUrl = `${API_URL}/users/`;
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const fetchUsers = async () => {
        try {
          console.log(`IP: ${apiUrl}`);
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          // Filter out admin users and users whose status is not active
          const filtered = data.filter(
            (user) => user.userType !== "admin" && user.status === "active"
          );
          setUsers(filtered);
          setFilteredUsers(filtered);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      fetchUsers();
    }, [])
  );

  useEffect(() => {
    if (selectedType === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.userType === selectedType));
    }
  }, [selectedType, users]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Users List</Text>
        <Picker
          selectedValue={selectedType}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedType(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Brand" value="brand" />
          <Picker.Item label="Customer" value="customer" />
          <Picker.Item label="Designer" value="designer" />
        </Picker>
      </View>
      <View style={styles.userList}>
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user._id}
            style={styles.userCard}
            onPress={() => navigation.navigate("Users Detail", { user })}
          >
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profilePicture}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.userType}>Type: {user.userType}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#34495e",
    textAlign: "center",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  userList: {
    marginTop: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  profilePicture: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    fontSize: 18,
    color: "#2c3e50",
    marginBottom: 4,
  },
  userType: {
    fontSize: 15,
    color: "#7f8c8d",
  },
});

export default UserScreen;
