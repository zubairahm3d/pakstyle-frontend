import React, { useEffect, useState } from "react";
import {
  StatusBar,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

const MainScreen = () => {
  const navigation = useNavigation();
  const [showLogo, setShowLogo] = useState(true);

  const fadeAnim = new Animated.Value(0); // Opacity starts from 0
  const slideAnim = new Animated.Value(50); // Initial translateY offset

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false); // Hides logo after 3 seconds
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, // Fade in to full opacity
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, // Slide up to position
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      {showLogo ? (
        <Animatable.Image
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          source={require("../pak-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim, // Animating opacity
              transform: [{ translateY: slideAnim }], // Animating slide effect
            },
          ]}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            source={require("../pak-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              accessibilityLabel="Sign Up button"
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <Text style={styles.orText}>Already have an account?</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              accessibilityLabel="Login button"
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: height * 0.05,
  },
  buttonContainer: {
    marginTop: height * 0.05,
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 12,
    marginBottom: height * 0.02,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: width * 0.7,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: width * 0.7,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  orText: {
    color: "#ffffff",
    marginVertical: height * 0.02,
    fontSize: width * 0.04,
  },
});

export default MainScreen;
