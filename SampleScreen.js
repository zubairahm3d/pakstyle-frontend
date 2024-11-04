import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const SampleScreen = () => {
  const [count, setCount] = useState(0);

  const handlePress = () => {
    setCount(count + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Sample Screen</Text>
      <Text style={styles.text}>You have pressed the button {count} times</Text>
      <Button title="Press me" onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5fcff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default SampleScreen;
