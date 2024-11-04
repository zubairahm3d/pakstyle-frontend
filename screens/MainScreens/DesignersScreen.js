import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import userData from "../../data/userData.json";

const DesignerScreen = ({ navigation }) => {
  const [designers, setDesigners] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const designerData = userData.filter(
          (user) => user.type === "designer"
        );
        setDesigners(designerData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDesignerPress = (designer) => {
    navigation.navigate("Designer Detail", { designer });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>List of Designers:</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {designers.map((designer) => (
          <TouchableOpacity
            key={designer.id}
            style={styles.designerContainer}
            onPress={() => handleDesignerPress(designer)}
          >
            <Image
              source={{ uri: designer.profile_pic }}
              style={styles.profilePic}
            />
            <Text style={styles.name}>{designer.name}</Text>
            <Text style={styles.email}>{designer.email}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingTop: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  scrollView: {
    width: "100%",
  },
  designerContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
});

export default DesignerScreen;
