import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
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

const SignupScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    userType: "customer",
    website: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phoneNumber
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return false;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return false;
    }
    if (formData.phoneNumber.length < 11) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.confirmPassword,
          userType: formData.userType,
          phone: formData.phoneNumber,
          website: formData.website,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (formData.userType === "brand") {
          Alert.alert(
            "Brand Account",
            "Your brand account will be reviewed, and an email will be sent to you within 24-48 hours.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
        } else {
          Alert.alert("Success", "User registered successfully");
          navigation.navigate("Login");
        }
      } else {
        Alert.alert("Error", result.message || "Signup failed");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server.");
      console.error(error);
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const renderInput = (
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
    icon
  ) => (
    <View style={styles.inputContainer}>
      <Ionicons
        name={icon}
        size={24}
        color="#0ea5e9"
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {(placeholder === "Password" || placeholder === "Confirm Password") && (
        <TouchableOpacity
          onPress={() =>
            placeholder === "Password"
              ? setShowPassword(!showPassword)
              : setShowConfirmPassword(!showConfirmPassword)
          }
        >
          <Ionicons
            name={
              (placeholder === "Password" && showPassword) ||
              (placeholder === "Confirm Password" && showConfirmPassword)
                ? "eye-outline"
                : "eye-off-outline"
            }
            size={24}
            color="#0ea5e9"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={["#1a1a2e", "#16213e"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollView}>
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
              Create Account
            </Animatable.Text>

            {renderInput(
              "Name",
              formData.name,
              (text) => handleInputChange("name", text),
              false,
              "default",
              "person-outline"
            )}
            {renderInput(
              "Username",
              formData.username,
              (text) => handleInputChange("username", text),
              false,
              "default",
              "at-outline"
            )}
            {renderInput(
              "Email",
              formData.email,
              (text) => handleInputChange("email", text),
              false,
              "email-address",
              "mail-outline"
            )}
            {renderInput(
              "Password",
              formData.password,
              (text) => handleInputChange("password", text),
              !showPassword,
              "default",
              "lock-closed-outline"
            )}
            {renderInput(
              "Confirm Password",
              formData.confirmPassword,
              (text) => handleInputChange("confirmPassword", text),
              !showConfirmPassword,
              "default",
              "lock-closed-outline"
            )}
            {renderInput(
              "Phone Number",
              formData.phoneNumber,
              (text) => handleInputChange("phoneNumber", text),
              false,
              "phone-pad",
              "call-outline"
            )}

            <Text style={styles.pickerLabel}>User Type:</Text>
            <View style={styles.radioGroup}>
              {["customer", "designer", "brand"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.radioButton}
                  onPress={() => handleInputChange("userType", type)}
                >
                  <View style={styles.radioCircle}>
                    {formData.userType === type && (
                      <View style={styles.selectedRb} />
                    )}
                  </View>
                  <Text style={styles.radioText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.userType === "brand" &&
              renderInput(
                "Website/Page URL",
                formData.website,
                (text) => handleInputChange("website", text),
                false,
                "url",
                "globe-outline"
              )}

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>
                Already have an account? Log In
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
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
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.1,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: height * 0.03,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: height * 0.05,
    textShadowColor: "rgba(14, 165, 233, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.04,
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
  pickerLabel: {
    color: "#0ea5e9",
    fontSize: width * 0.045,
    alignSelf: "flex-start",
    marginBottom: height * 0.01,
    marginTop: height * 0.02,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.03,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: width * 0.06,
    width: width * 0.06,
    borderRadius: width * 0.03,
    borderWidth: 2,
    borderColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: width * 0.02,
  },
  selectedRb: {
    width: width * 0.03,
    height: width * 0.03,
    borderRadius: width * 0.015,
    backgroundColor: "#0ea5e9",
  },
  radioText: {
    color: "#ffffff",
    fontSize: width * 0.04,
  },
  signupButton: {
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
  signupButtonText: {
    color: "#ffffff",
    fontSize: width * 0.05,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginLink: {
    color: "#0ea5e9",
    fontSize: width * 0.04,
    marginTop: height * 0.03,
    textDecorationLine: "underline",
  },
});

export default SignupScreen;
