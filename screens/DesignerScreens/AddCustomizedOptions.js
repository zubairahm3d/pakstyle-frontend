import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const AddCustomizedOptions = () => {
  const [image, setImage] = useState(null);
  const [options, setOptions] = useState([
    { name: "", choices: [{ name: "", price: "" }] },
  ]);

  const handleAddOption = () => {
    setOptions([...options, { name: "", choices: [{ name: "", price: "" }] }]);
  };

  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index].name = text;
    setOptions(newOptions);
  };

  const handleChoiceChange = (text, index, choiceIndex, field) => {
    const newOptions = [...options];
    newOptions[index].choices[choiceIndex][field] = text;
    setOptions(newOptions);
  };

  const handleAddChoice = (index) => {
    const newOptions = [...options];
    newOptions[index].choices.push({ name: "", price: "" });
    setOptions(newOptions);
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleSave = () => {
    console.log("Image:", image);
    console.log("Options:", options);
    // Add your save logic here
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Customized Options</Text>
      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.imageButtonText}>
          {image ? "Change Image" : "Add Image"}
        </Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
      {options.map((option, index) => (
        <View key={index} style={styles.optionContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Option ${index + 1} Name`}
            value={option.name}
            onChangeText={(text) => handleOptionChange(text, index)}
          />
          {option.choices.map((choice, choiceIndex) => (
            <View key={choiceIndex} style={styles.choiceContainer}>
              <TextInput
                style={styles.input}
                placeholder={`Choice ${choiceIndex + 1} Name`}
                value={choice.name}
                onChangeText={(text) =>
                  handleChoiceChange(text, index, choiceIndex, "name")
                }
              />
              <TextInput
                style={styles.input}
                placeholder={`Choice ${choiceIndex + 1} Price`}
                value={choice.price}
                onChangeText={(text) =>
                  handleChoiceChange(text, index, choiceIndex, "price")
                }
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={() => handleAddChoice(index)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add Choice</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={handleAddOption} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Option</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  input: {
    backgroundColor: "#ecf0f1",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    color: "#2c3e50",
    width: "100%",
  },
  imageButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  optionContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  choiceContainer: {
    width: "100%",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#e67e22",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddCustomizedOptions;
