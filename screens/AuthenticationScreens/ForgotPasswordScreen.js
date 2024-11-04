import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@env";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientEmail: email }),
      });

      const result = await response.json();

      if (result.status === "success") {
        Alert.alert(
          "Success",
          "Password reset instructions have been sent to your email.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "User not found. Please check your email and try again."
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again later.");
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.gradient}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            source={require("../../assets/icons/pak-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Animatable.Text
            animation="fadeInUp"
            delay={500}
            style={styles.title}
          >
            Forgot Password
          </Animatable.Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset
            your password.
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={24}
              color="#0ea5e9"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="Email input"
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            accessibilityLabel="Reset Password button"
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.navigate("Login")}
            accessibilityLabel="Back to Login button"
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.1,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: height * 0.03,
  },
  title: {
    color: "#ffffff",
    fontSize: width * 0.08,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.02,
    textShadowColor: "rgba(14, 165, 233, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#ffffff",
    fontSize: width * 0.04,
    textAlign: "center",
    marginBottom: height * 0.03,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.04,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.3)",
  },
  inputIcon: {
    marginRight: width * 0.03,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: width * 0.045,
    paddingVertical: height * 0.02,
  },
  button: {
    backgroundColor: "#0ea5e9",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    borderRadius: 12,
    marginTop: height * 0.03,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: width * 0.05,
    fontWeight: "bold",
    textAlign: "center",
  },
  backToLoginButton: {
    marginTop: height * 0.03,
  },
  backToLoginText: {
    color: "#0ea5e9",
    fontSize: width * 0.04,
    textDecorationLine: "underline",
  },
});
export default ForgotPasswordScreen;
