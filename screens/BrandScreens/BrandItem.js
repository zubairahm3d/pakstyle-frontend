import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { API_URL } from '@env';

const colorMap = {
  'Red': '#FF0000',
  'Blue': '#0000FF',
  'Green': '#00FF00',
  'Yellow': '#FFFF00',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Purple': '#800080',
  'Orange': '#FFA500',
  'Pink': '#FFC0CB',
  'Brown': '#A52A2A',
  'Gray': '#808080',
  'Cyan': '#00FFFF',
  'Magenta': '#FF00FF',
  'Lime': '#00FF00',
  'Olive': '#808000',
  'Maroon': '#800000',
  'Navy': '#000080',
  'Teal': '#008080',
};

const getContrastColor = (colorName) => {
  const hexColor = colorMap[colorName] || '#000000';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const BrandItem = ({ route }) => {
  const navigation = useNavigation();
  const { item } = route.params;

  const [itemName, setItemName] = useState(item?.name || '');
  const [itemDescription, setItemDescription] = useState(item?.description || '');
  const [itemPrice, setItemPrice] = useState(item?.price?.toString() || '');
  const [itemSizes, setItemSizes] = useState(item?.sizes || []);
  const [itemColors, setItemColors] = useState(item?.colors || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  const handleEditItem = () => {
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedItem = {
        ...item,
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        sizes: itemSizes,
        colors: itemColors,
      };

      const response = await axios.put(`${API_URL}/products/${item._id}`, updatedItem);

      if (response.status === 200) {
        Alert.alert('Success', 'Item updated successfully');
        setModalVisible(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: deleteItem, style: 'destructive' },
      ]
    );
  };

  const deleteItem = async () => {
    try {
      const response = await axios.delete(`${API_URL}/products/${item._id}`);
      if (response.status === 200) {
        Alert.alert('Success', 'Item deleted successfully');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const addSize = () => {
    if (newSize && !itemSizes.includes(newSize)) {
      setItemSizes([...itemSizes, newSize]);
      setNewSize('');
    }
  };

  const removeSize = (size) => {
    setItemSizes(itemSizes.filter((s) => s !== size));
  };

  const addColor = () => {
    if (newColor && !itemColors.includes(newColor)) {
      setItemColors([...itemColors, newColor]);
      setNewColor('');
    }
  };

  const removeColor = (color) => {
    setItemColors(itemColors.filter((c) => c !== color));
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{itemName}</Text>
        <Text style={styles.price}>Rs. {itemPrice}</Text>
        <Text style={styles.description}>{itemDescription}</Text>
        
        <Text style={styles.sectionTitle}>Sizes:</Text>
        <View style={styles.tagsContainer}>
          {itemSizes.map((size) => (
            <View key={size} style={styles.tag}>
              <Text style={styles.tagText}>{size}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Colors:</Text>
        <View style={styles.tagsContainer}>
          {itemColors.map((color) => (
            <View key={color} style={[styles.tag, { backgroundColor: colorMap[color] || color }]}>
              <Text style={[styles.tagText, { color: getContrastColor(color) }]}>{color}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditItem}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteItem}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={itemName}
                onChangeText={setItemName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={itemDescription}
                onChangeText={setItemDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={itemPrice}
                onChangeText={setItemPrice}
                keyboardType="numeric"
              />

              <Text style={styles.sectionTitle}>Sizes:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Add size"
                  value={newSize}
                  onChangeText={setNewSize}
                />
                <TouchableOpacity style={styles.addButton} onPress={addSize}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsContainer}>
                {itemSizes.map((size) => (
                  <TouchableOpacity key={size} style={styles.tag} onPress={() => removeSize(size)}>
                    <Text style={styles.tagText}>{size}</Text>
                    <Icon name="times" size={12} color="#fff" style={styles.removeIcon} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Colors:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Add color"
                  value={newColor}
                  onChangeText={setNewColor}
                />
                <TouchableOpacity style={styles.addButton} onPress={addColor}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsContainer}>
                {itemColors.map((color) => (
                  <TouchableOpacity 
                    key={color} 
                    style={[styles.tag, { backgroundColor: colorMap[color] || color }]} 
                    onPress={() => removeColor(color)}
                  >
                    <Text style={[styles.tagText, { color: getContrastColor(color) }]}>{color}</Text>
                    <Icon name="times" size={12} color={getContrastColor(color)} style={styles.removeIcon} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  removeIcon: {
    marginLeft: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
});

export default BrandItem;

