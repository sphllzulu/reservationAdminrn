

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminLogin from './screens/AdminLogin';
import RestaurantManagement from './screens/RestaurantList';
import ProfileScreen from './screens/Profile'; // Example additional screen
import AddRestaurantForm from './components/AddRestaurantForm';
import AnalyticsScreen from './screens/AnalyticsScreen';
import UserScreen from './screens/UserScreen';
import ReservationManager from './screens/reservationScreen';

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
        component={ProfileScreen} 
        options={{ title: 'Admin Profile' }}
      />
      <Tab.Screen 
        name="AddRestaurantForm" 
        component={AddRestaurantForm} 
        options={{ title: 'Add Restaurant' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'Restaurant a' }}
      />
      <Tab.Screen 
        name="User " 
        component={UserScreen} 
        options={{ title: 'User manage' }}
      />
      <Tab.Screen 
        name="Reservation " 
        component={ReservationManager} 
        options={{ title: 'Reservation' }}
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
