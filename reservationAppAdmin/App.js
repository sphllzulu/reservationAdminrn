import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import RestaurantManagement from './screens/RestaurantList';

const Stack = createStackNavigator();

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
          name="RestaurantManagement" 
          component={RestaurantManagement} 
          options={{ headerShown: true }} 
        />

        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ title: 'Admin Dashboard' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
