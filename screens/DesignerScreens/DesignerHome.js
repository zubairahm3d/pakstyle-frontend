import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  BackHandler,
  Alert
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import DesginerProfile from "./DesignerProfile";
import DesignerPortfolio from "./DesignerPortfolio";
import DesignerOrder from "./DesignerOrder";
import ChatScreen from './ChatScreen';
import ConversationDetailScreen from './ConversationDetailScreen';
import DesignerOrderDetail from "./DesignerOrderDetail";


const Tab = createBottomTabNavigator();

const HomeScreenContent = () => {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() }
          ],
          { cancelable: false }
        );
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.box}>
        <Text style={styles.boxText}>Newest Collection</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.box}>
        <Text style={styles.boxText}>Popular Collection</Text>
      </TouchableOpacity>
    </View>
  );
};

const BrandHomeScreen = ({ navigation, route }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused
              ? require("../../assets/icons/home_selected.png")
              : require("../../assets/icons/home_unselected.png");
          } else if (route.name === "Portfolio") {
            iconName = focused
              ? require("../../assets/icons/browse_selected.png")
              : require("../../assets/icons/browse_unselected.png");
          } else if (route.name === "Profile") {
            iconName = focused
              ? require("../../assets/icons/designer_selected.png")
              : require("../../assets/icons/designer_unselected.png");
          } else if (route.name === "Orders") {
            iconName = focused
              ? require("../../assets/icons/order_selected.png")
              : require("../../assets/icons/order_unselected.png");
          }

          return (
            <Image
              source={iconName}
              style={{ width: 25, height: 25, tintColor: color }}
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerChatIcon}
              onPress={() => navigation.navigate('Chat', { userId: route.params.user._id })}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="#3498db" />
            </TouchableOpacity>
          ),
        }}
      >
        {() => <HomeScreenContent />}
      </Tab.Screen>

      <Tab.Screen 
        name="Portfolio" 
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <DesignerPortfolio user={route.params.user} navigation={navigation} />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="Orders" 
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <DesignerOrder user={route.params.user} navigation={navigation} />
        )}
      </Tab.Screen>

      <Tab.Screen 
        name="Profile" 
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <DesginerProfile user={route.params.user} navigation={navigation} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Chat"
        options={{ headerShown: false, tabBarButton: () => null }}
      >
        {(props) => <ChatScreen {...props} user={route.params.user} />}
      </Tab.Screen>

      <Tab.Screen
        name="ConversationDetail"
        options={{ headerShown: false, tabBarButton: () => null }}
      >
        {(props) => <ConversationDetailScreen {...props} user={route.params.user} />}
      </Tab.Screen>

      <Tab.Screen
        name="DesignerOrderDetail"
        options={{ 
          headerShown: true,
          title: 'Order Details',
          tabBarButton: () => null 
        }}
        component={DesignerOrderDetail}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  box: {
    width: "80%",
    height: 150,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  boxText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerChatIcon: {
    marginRight: 15,
  },
});

export default BrandHomeScreen;