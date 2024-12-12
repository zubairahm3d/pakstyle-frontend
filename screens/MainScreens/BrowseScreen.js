import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { API_URL } from "@env";

const Drawer = createDrawerNavigator();

const SidebarContent = ({ setSelectedBrands, selectedBrands, brands, setSortOption, sortOption, setSortOrder, sortOrder }) => {
  const handleBrandSelection = (brand) => {
    setSelectedBrands((prevBrands) => {
      const updatedSelection = prevBrands.includes(brand)
        ? prevBrands.filter((selectedBrand) => selectedBrand !== brand)
        : [...prevBrands, brand];
      return updatedSelection;
    });
  };

  const handleSortOptionChange = (option) => {
    if (sortOption === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortOrder('desc');
    }
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
      <Text style={styles.sidebarHeading}>Sort by:</Text>
      <TouchableOpacity 
        style={[styles.sortOption, sortOption === 'popularity' && styles.selectedSortOption]} 
        onPress={() => handleSortOptionChange('popularity')}
      >
        <Text style={styles.sortOptionText}>
          Popularity {sortOption === 'popularity' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.sortOption, sortOption === 'price' && styles.selectedSortOption]} 
        onPress={() => handleSortOptionChange('price')}
      >
        <Text style={styles.sortOptionText}>
          Price {sortOption === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.sortOption, sortOption === 'newest' && styles.selectedSortOption]} 
        onPress={() => handleSortOptionChange('newest')}
      >
        <Text style={styles.sortOptionText}>
          Newest {sortOption === 'newest' && (sortOrder === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const BrowseScreen = ({ user }) => {
  const [clothes, setClothes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigation = useNavigation();

  const fetchBrandsAndProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersResponse = await fetch(`${API_URL}/users/`);
      const usersData = await usersResponse.json();

      const brandUsers = usersData.filter((user) => user.userType === "brand");
      const brandNames = brandUsers.map((user) => user.name);
      setBrands(brandNames);

      const productsResponse = await fetch(`${API_URL}/products`);
      const productsData = await productsResponse.json();

      setClothes(productsData);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
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

  const filteredClothes = React.useMemo(() => {
    if (!Array.isArray(clothes)) return [];
    let filtered = selectedBrands.length === 0
      ? clothes
      : clothes.filter((item) => selectedBrands.includes(item.brandName));

    return filtered.sort((a, b) => {
      if (sortOption === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortOption === 'popularity') {
        return sortOrder === 'asc' ? a.popularity - b.popularity : b.popularity - a.popularity;
      } else if (sortOption === 'newest') {
        return sortOrder === 'asc' 
          ? new Date(a.updatedAt) - new Date(b.updatedAt) 
          : new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      return 0;
    });
  }, [clothes, selectedBrands, sortOption, sortOrder]);

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (filteredClothes.length === 0) {
      return <Text style={styles.noProductsText}>No products available.</Text>;
    }

    return filteredClothes.map((item) => (
      <TouchableOpacity
        key={item._id}
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
      >
        <Image style={styles.image} source={{ uri: item.images[0] }} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
        <Text style={styles.brand}>Brand: {item.brandName}</Text>
        <Text style={styles.updatedAt}>Updated: {new Date(item.updatedAt).toLocaleDateString()}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SidebarContent
          {...props}
          setSelectedBrands={setSelectedBrands}
          selectedBrands={selectedBrands}
          brands={brands}
          setSortOption={setSortOption}
          sortOption={sortOption}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      )}
    >
      <Drawer.Screen name="Browse ">
        {() => (
          <ScrollView contentContainerStyle={styles.container}>
            {renderContent()}
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
    marginBottom: 5,
  },
  updatedAt: {
    fontSize: 12,
    color: "#bdc3c7",
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
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  noProductsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  selectedSortOption: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
});

export default BrowseScreen;

