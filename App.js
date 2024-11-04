import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/AuthenticationScreens/LoginScreen";
import SignupScreen from "./screens/AuthenticationScreens/SignUpScreen";
import MainScreen from "./screens/MainScreen";
import ForgotPasswordScreen from "./screens/AuthenticationScreens/ForgotPasswordScreen";
import HomeScreen from "./screens/MainScreens/HomeScreen";
import ProfileScreen from "./screens/MainScreens/ProfileScreen";
import ItemScreen from "./screens/MainScreens/ItemScreen";
import BrandHomeScreen from "./screens/BrandScreens/BrandHomeScreen";
import DesignerHome from "./screens/DesignerScreens/DesignerHome";
import CartScreen from "./screens/MainScreens/CartScreen";
import AdminHome from "./screens/AdminScreens/AdminHome";

import { CartProvider } from "./screens/Context/CartContext";

const Stack = createStackNavigator();

const App = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ItemScreen" component={ItemScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="BrandHomeScreen" component={BrandHomeScreen} />
          <Stack.Screen name="DesignerHome" component={DesignerHome} />
          <Stack.Screen name="AdminHome" component={AdminHome} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;
