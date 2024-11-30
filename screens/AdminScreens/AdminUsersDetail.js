import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For Icons
import { API_URL } from "@env";

const AdminUsersDetail = ({ route, navigation }) => {
  const { user } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleDelete = async () => {
    try {
      console.log(`IP: ${API_URL}/users/brand-approval`);
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      setModalVisible(false);
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.navigate("Users");
      }, 2000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setModalVisible(false);
      Alert.alert("Error", "Failed to delete user. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profilePicture}
        />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.userId}>User ID: {user.userId}</Text>
        <Text style={styles.name}>Name: {user.name}</Text>
        <Text style={styles.userType}>Type: {user.userType}</Text>
        <Text style={styles.email}>Email: {user.email}</Text>
        <Text style={styles.website}>Website: {user.website || "N/A"}</Text>
        <Text style={styles.phone}>Phone: {user.phone || "N/A"}</Text>
      </View>

      <TouchableOpacity
        style={styles.mainDeleteButton} // Changed style here
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Delete User</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this user?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.modalDeleteButton} // Changed style here
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={50} color="#28a745" />
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              User deleted successfully!
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: "#3498db",
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginVertical: 5,
  },
  userType: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2980b9",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 10,
    textAlign: "center",
  },
  website: {
    fontSize: 16,
    color: "#34495e",
    marginVertical: 5,
  },
  phone: {
    fontSize: 16,
    color: "#34495e",
    marginVertical: 5,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#e74c3c",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#34495e",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
  },
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 128, 0, 0.5)",
  },
  successContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  mainDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  modalDeleteButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    alignItems: "center",
  },
});

export default AdminUsersDetail;
