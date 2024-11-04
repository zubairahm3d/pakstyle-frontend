import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import clothesData from "../../data/clothesData.json";
import { useNavigation } from "@react-navigation/native";

const BrandNewItems = () => {
  const [sortedClothes, setSortedClothes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const dataCopy = [...clothesData];

    const filteredData = dataCopy.filter((item) => item.brand === "Gul Ahmed");

    const sortedData = filteredData.sort((a, b) => b.id - a.id);
    setSortedClothes(sortedData);
  }, []);

  const navigateToItemScreen = (item) => {
    navigation.navigate("Brand Item", { item });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigateToItemScreen(item)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.brand}>Brand: {item.brand}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={sortedClothes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 250,
  },
  textContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    lineHeight: 22,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 5,
  },
  brand: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#888",
  },
});

export default BrandNewItems;
