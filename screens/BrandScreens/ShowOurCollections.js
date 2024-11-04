import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ShowOurCollections = ({ navigation }) => {
  const clothesData = require("../../data/clothesData.json");

  const gulAhmedItems = clothesData.filter(
    (item) => item.brand === "Gul Ahmed"
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate("Brand Item", { item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceBrandContainer}>
          <Text style={styles.price}>Rs. {item.price}</Text>
          <Text style={styles.brand}>Brand: {item.brand}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={gulAhmedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  textContainer: {
    padding: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#7f8c8d",
    marginBottom: 12,
    lineHeight: 20,
  },
  priceBrandContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#27ae60",
  },
  brand: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#95a5a6",
  },
});

export default ShowOurCollections;
