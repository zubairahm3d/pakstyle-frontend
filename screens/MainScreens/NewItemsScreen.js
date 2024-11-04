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

const NewItemsScreen = () => {
  const [sortedClothes, setSortedClothes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const dataCopy = [...clothesData];

    const sortedData = dataCopy.sort((a, b) => b.id - a.id);
    setSortedClothes(sortedData);
  }, []);

  const navigateToItemScreen = (item) => {
    navigation.navigate("ItemScreen", { item });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigateToItemScreen(item)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.price}>{item.price}</Text>
      <Text style={styles.brand}>Brand: {item.brand}</Text>
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
    padding: 10,
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  description: {
    fontSize: 14,
    marginVertical: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    marginVertical: 5,
  },
  brand: {
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default NewItemsScreen;
