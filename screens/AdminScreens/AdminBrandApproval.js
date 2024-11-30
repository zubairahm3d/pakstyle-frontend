import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@env";

const AdminBrandApproval = () => {
  const [brands, setBrands] = useState([]);
  const apiUrl = `${API_URL}/users/`;
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const fetchBrands = async () => {
        try {
          console.log(`IP: ${apiUrl}`);
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          // Filter for users with status: pending and userType: brand
          const filteredBrands = data.filter(
            (user) => user.status === "pending" && user.userType === "brand"
          );
          setBrands(filteredBrands);
        } catch (error) {
          console.error("Error fetching brands:", error);
        }
      };

      fetchBrands();
    }, [])
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.header}>Brands</Text>
        <View style={styles.brandList}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand._id}
              style={styles.brandCard}
              onPress={() =>
                navigation.navigate("Brands Detail", { user: brand })
              }
            >
              <Image
                source={{ uri: brand.profilePicture }}
                style={styles.profilePicture}
              />
              <View style={styles.brandInfo}>
                <Text style={styles.username}>{brand.username}</Text>
                <Text style={styles.userType}>Status: {brand.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  brandList: {
    marginTop: 10,
  },
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 6,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  brandInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#2c3e50",
  },
  userType: {
    color: "#7f8c8d",
    fontSize: 16,
  },
});

export default AdminBrandApproval;
