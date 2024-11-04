import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import designerData from "../../data/designerData.json";

const DesignerPortfolio = ({ user }) => {
  // const { user } = route.params;

  const designerPortfolio = designerData.find(
    (designer) => designer.userId === user.id
  );

  if (!designerPortfolio) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>No portfolio data available</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Portfolio</Text>
      <View style={styles.portfolioContainer}>
        {designerPortfolio.pictures.map((picture, index) => (
          <Image key={index} source={{ uri: picture }} style={styles.image} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 20,
  },
  messageText: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  portfolioContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default DesignerPortfolio;
