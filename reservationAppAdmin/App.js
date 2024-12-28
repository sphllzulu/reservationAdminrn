import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // For icons
import AdminLogin from "./screens/AdminLogin";
import RestaurantManagement from "./screens/RestaurantList";
import ProfileScreen from "./screens/Profile";
import AddRestaurantForm from "./components/AddRestaurantForm";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import UserScreen from "./screens/UserScreen";
import ReservationManager from "./screens/reservationScreen";
import AddRestaurantScreen from "./screens/AddRestaurantScreen";
import RestaurantViewScreen from "./screens/RestaurantViewScreen";
import ImgurUploadPage from "./screens/RestaurantViewScreen";

// Stack Navigator
const Stack = createStackNavigator();

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff" }, // White background for the tab bar
        tabBarActiveTintColor: "green", // Green for active tab
        tabBarInactiveTintColor: "gray", // Gray for inactive tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Set icons based on the route name
          if (route.name === "RestaurantManagement") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "AddRestaurantForm") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "User") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Reservation") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "ImageUpload") {
            iconName = focused ? "image" : "image-outline";
          }

          // Return the appropriate icon
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="RestaurantManagement"
        component={RestaurantManagement}
        options={{ title: "Restaurants" }} // Title for the tab
      />
      
      <Tab.Screen
        name="AddRestaurantForm"
        component={AddRestaurantScreen}
        options={{ title: "Add" }}
      />
      <Tab.Screen
        name="ImageUpload"
        component={ImgurUploadPage}
        options={{ title: "Image" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{ title: "Users" }}
      />
      <Tab.Screen
        name="Reservation"
        component={ReservationManager}
        options={{ title: "Reservations" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      
    </Tab.Navigator>
  );
};

// Main App with Stack Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AdminLogin">
        <Stack.Screen
          name="AdminLogin"
          component={AdminLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;