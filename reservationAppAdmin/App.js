import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminLogin from "./screens/AdminLogin";
import RestaurantManagement from "./screens/RestaurantList";
import ProfileScreen from "./screens/Profile";
import AddRestaurantForm from "./components/AddRestaurantForm";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import UserScreen from "./screens/UserScreen";
import ReservationManager from "./screens/reservationScreen";
import AddRestaurantScreen from "./screens/AddRestaurantScreen";
import RestaurantViewScreen from './screens/RestaurantViewScreen';
import { View, Text, StyleSheet } from "react-native";

// Stack Navigator
const Stack = createStackNavigator();

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Drawer Navigator
const Drawer = createDrawerNavigator();

// Drawer Content
const DrawerContent = ({ navigation }) => {
  return (
    <View style={styles.drawerContainer}>
      <Text style={styles.drawerHeader}>Admin Dashboard</Text>
      <Text style={styles.drawerItem} onPress={() => navigation.navigate("RestaurantManagement")}>
        Manage Restaurants
      </Text>
      <Text style={styles.drawerItem} onPress={() => navigation.navigate("Profile")}>
        Admin Profile
      </Text>
      <Text style={styles.drawerItem} onPress={() => navigation.navigate("Analytics")}>
        Analytics
      </Text>
      <Text style={styles.drawerItem} onPress={() => navigation.navigate("User")}>
        User Management
      </Text>
      <Text style={styles.drawerItem} onPress={() => navigation.navigate("Reservation")}>
        Reservations
      </Text>
    </View>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#000" },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="RestaurantManagement"
        component={RestaurantManagement}
        options={{ title: "Manage Restaurants" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Admin Profile" }}
      />
      <Tab.Screen
        name="AddRestaurantForm"
        component={AddRestaurantScreen}
        options={{ title: "Add Restaurant" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{ title: "User Management" }}
      />
      <Tab.Screen
        name="Reservation"
        component={ReservationManager}
        options={{ title: "Reservations" }}
      />
      <Tab.Screen
        name="RestaurantView"
        component={RestaurantViewScreen}
        options={{ title: "Restaurant View" }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator Wrapper
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Drawer.Screen
        name="Main"
        component={TabNavigator}
        options={{ title: "Admin Dashboard" }}
      />
    </Drawer.Navigator>
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
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  drawerHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  drawerItem: {
    fontSize: 18,
    marginBottom: 15,
    color: "#007BFF",
    fontWeight: "bold",
  },
});

export default App;