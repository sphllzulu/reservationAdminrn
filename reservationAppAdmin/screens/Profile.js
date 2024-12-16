// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Profile = () => {
//   return (
//     <View>
//       <Text>Profile</Text>
//     </View>
//   )
// }

// export default Profile

// const styles = StyleSheet.create({})

// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   ActivityIndicator, 
//   Alert 
// } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ProfileScreen = ({ navigation }) => {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAdminProfile();
//   }, []);

//   const fetchAdminProfile = async () => {
//     try {
//       // Get the session token from AsyncStorage
//       const token = await AsyncStorage.getItem('sessionToken');
      
//       const response = await axios.get('/api/admin/me', {
//         withCredentials: true,
//         headers: {
//           'Cookie': `connect.sid=${token}`
//         }
//       });

//       setProfile(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Profile fetch error:', error);
//       setLoading(false);
      
//       // Handle unauthorized or token expired
//       if (error.response && error.response.status === 401) {
//         Alert.alert(
//           'Session Expired', 
//           'Please log in again.',
//           [{ 
//             text: 'OK', 
//             onPress: () => navigation.replace('Login') 
//           }]
//         );
//       }
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post('/signout', {}, { withCredentials: true });
      
//       // Clear AsyncStorage
//       await AsyncStorage.removeItem('sessionToken');
      
//       // Navigate to login screen
//       navigation.replace('Login');
//     } catch (error) {
//       console.error('Logout error:', error);
//       Alert.alert('Logout Failed', 'Unable to log out. Please try again.');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.profileHeader}>
//         <Text style={styles.profileTitle}>Admin Profile</Text>
//       </View>

//       <View style={styles.profileDetails}>
//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Name:</Text>
//           <Text style={styles.value}>
//             {profile.firstName} {profile.lastName}
//           </Text>
//         </View>

//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Email:</Text>
//           <Text style={styles.value}>{profile.email}</Text>
//         </View>

//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Role:</Text>
//           <Text style={styles.value}>{profile.role}</Text>
//         </View>
//       </View>

//       <TouchableOpacity 
//         style={styles.logoutButton} 
//         onPress={handleLogout}
//       >
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f4f4',
//     padding: 20,
//   },
//   profileHeader: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   profileTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   profileDetails: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     marginBottom: 20,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 15,
//   },
//   label: {
//     fontWeight: 'bold',
//     marginRight: 10,
//     width: 100,
//   },
//   value: {
//     flex: 1,
//   },
//   logoutButton: {
//     backgroundColor: '#ff4d4d',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   logoutButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   }
// });

// export default ProfileScreen;


import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
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
        'http://192.168.0.104:3000/signout', 
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
    <View style={styles.container}>
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