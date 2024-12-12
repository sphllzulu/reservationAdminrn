

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminLogin from './screens/AdminLogin';
import RestaurantManagement from './screens/RestaurantList';
import Profile from './screens/Profile'; // Example additional screen
import AddRestaurantForm from './components/AddRestaurantForm';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="RestaurantManagement" 
        component={RestaurantManagement} 
        options={{ title: 'Manage Restaurants' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{ title: 'Admin Profile' }}
      />
      <Tab.Screen 
        name="AddRestaurantForm" 
        component={AddRestaurantForm} 
        options={{ title: 'Add Restaurant' }}
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
          options={{ headerShown: true }} 
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
