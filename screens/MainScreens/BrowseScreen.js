import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { API_URL } from "@env";
import { ColorSpace } from "react-native-reanimated";

const Drawer = createDrawerNavigator();

const SidebarContent = ({ setSelectedBrands, selectedBrands, brands }) => {
  const handleBrandSelection = (brand) => {
    setSelectedBrands((prevBrands) => {
      const updatedSelection = prevBrands.includes(brand)
        ? prevBrands.filter((selectedBrand) => selectedBrand !== brand)
        : [...prevBrands, brand];
      return updatedSelection;
    });
  };

  return (
    <View style={styles.sidebarContainer}>
      <Text style={styles.sidebarHeading}>Filter by Brand:</Text>
      {brands.map((brand) => (
        <TouchableOpacity
          key={brand}
          style={[
            styles.checkbox,
            selectedBrands.includes(brand) && styles.selectedCheckbox,
          ]}
          onPress={() => handleBrandSelection(brand)}
        >
          <Text
            style={[
              styles.checkboxText,
              selectedBrands.includes(brand) && styles.selectedCheckboxText,
            ]}
          >
            {brand}
          </Text>
        </TouchableOpacity>
      ))}
      {/* Sorting options */}
      <Text style={styles.sidebarHeading}>Sort by:</Text>
      <TouchableOpacity style={styles.sortOption}>
        <Text style={styles.sortOptionText}>Popularity</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption}>
        <Text style={styles.sortOptionText}>Price: Low to High</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption}>
        <Text style={styles.sortOptionText}>Price: High to Low</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption}>
        <Text style={styles.sortOptionText}>New Arrivals</Text>
      </TouchableOpacity>
    </View>
  );
};

const BrowseScreen = (user) => {
  const [clothes, setClothes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigation = useNavigation();

  const fetchBrandsAndProducts = async () => {
    try {
      const usersResponse = await fetch(`${API_URL}/users/`);
      const usersData = await usersResponse.json();

      // Filter for userType: "brand" and get their names
      const brandUsers = usersData.filter((user) => user.userType === "brand");
      const brandNames = brandUsers.map((user) => user.name);
      setBrands(brandNames);

      // Fetch products
      // console.log(`IP: ${API_URL}/products`);
      const productsResponse = await fetch(`${API_URL}/products`);
      const productsData = await productsResponse.json();
      // console.log(productsData);

      setClothes(productsData); // Store all products initially
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBrandsAndProducts();
    }, [])
  );

  const handleItemPress = (item) => {
    navigation.navigate("ItemScreen", { item, user });
  };

  // Filter clothes based on selected brands
  const filteredClothes =
    selectedBrands.length === 0
      ? clothes
      : clothes.filter((item) => selectedBrands.includes(item.brandName)); // Filter by brandName

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SidebarContent
          {...props}
          setSelectedBrands={setSelectedBrands}
          selectedBrands={selectedBrands}
          brands={brands}
        />
      )}
    >
      <Drawer.Screen name="Browse">
        {() => (
          <ScrollView contentContainerStyle={styles.container}>
            {filteredClothes.length === 0 ? (
              <Text>No products available.</Text>
            ) : (
              filteredClothes.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.itemContainer}
                  onPress={() => handleItemPress(item)}
                >
                  <Image
                    style={styles.image}
                    source={{ uri: item.images[0] }}
                  />
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.price}>Rs. {item.price}</Text>
                  <Text style={styles.brand}>Brand: {item.brandName}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 5,
  },
  brand: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#95a5a6",
  },
  sidebarContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  sidebarHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: "#ecf0f1",
  },
  selectedCheckbox: {
    backgroundColor: "#3498db",
    borderColor: "#2980b9",
  },
  checkboxText: {
    color: "#2c3e50",
  },
  selectedCheckboxText: {
    color: "#fff",
  },
  sortOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: "#ecf0f1",
  },
  sortOptionText: {
    color: "#2c3e50",
  },
});

export default BrowseScreen;
