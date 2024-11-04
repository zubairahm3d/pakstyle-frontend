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
import { API_URL } from "@env";

const AdminBrandsDetail = ({ route, navigation }) => {
  const { user } = route.params;
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleApproval = async (status) => {
    try {
      console.log(`IP: ${API_URL}/users/brand-approval`);
      const response = await fetch(`${API_URL}/users/brand-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user._id,
          status: status,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update brand status");
      }
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.navigate("Users"); // Navigate to Users screen
      }, 2000);
    } catch (error) {
      console.error("Error updating brand status:", error);
      Alert.alert("Error", "Failed to update brand status. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: user.profilePicture }}
        style={styles.profilePicture}
      />
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.userId}>User ID: {user.userId}</Text>
      <Text style={styles.name}>Name: {user.name}</Text>
      <Text style={styles.userType}>Type: {user.userType}</Text>
      <Text style={styles.email}>Email: {user.email}</Text>
      <Text style={styles.phone}>Phone: {user.phone}</Text>
      <Text style={styles.website}>Website: {user.website}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleApproval("accept")}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleApproval("reject")}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Brand status updated successfully!
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
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#007BFF",
    backgroundColor: "#fff",
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
  },
  userId: {
    fontSize: 16,
    color: "#6c757d",
    marginVertical: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2c3e50",
    marginVertical: 5,
  },
  userType: {
    fontSize: 18,
    fontWeight: "500",
    color: "#7f8c8d",
    marginVertical: 5,
  },
  email: {
    fontSize: 16,
    color: "#34495e",
    marginVertical: 10,
  },
  phone: {
    fontSize: 16,
    color: "#34495e",
    marginVertical: 5,
  },
  website: {
    fontSize: 16,
    color: "#34495e",
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  acceptButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#28a745", // Green for accept
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    elevation: 3,
  },
  rejectButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#FF6347", // Red for reject
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 128, 0, 0.5)", // Green overlay
  },
  successContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#28a745", // Green color for success
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});

export default AdminBrandsDetail;
