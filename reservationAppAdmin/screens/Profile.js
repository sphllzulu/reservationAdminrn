import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfileFromStorage();
  }, []);

  const fetchProfileFromStorage = async () => {
    try {
      // Retrieve session data from local storage
      const sessionData = await AsyncStorage.getItem('session');
      
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        setProfile(userData);
      } else {
        // If no session data, redirect to login
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Profile retrieval error:', error);
      navigation.replace('Login');
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await axios.post(
        '${process.env.EXPO_PUBLIC_API_URL}/signout', 
        {}, 
        { withCredentials: true }
      );
      
      // Clear local storage
      await AsyncStorage.removeItem('session');
      
      // Navigate to login screen
      navigation.replace('AdminLogin');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Unable to log out. Please try again.');
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View >
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Admin Profile</Text>
      </View>

      <View style={styles.profileDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {profile.firstName} {profile.lastName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{profile.role}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileDetails: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  value: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ProfileScreen;