import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';

const UserScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users with the role 'USER'
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://192.168.1.48:3000/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Delete a user by ID
  const deleteUser = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.1.48:3000/users/${id}`);
              setUsers(users.filter((user) => user._id !== id)); // Update the UI
            } catch (err) {
              Alert.alert('Failed to delete the user');
            }
          },
        },
      ]
    );
  };

  // Block a user by ID
  const blockUser = async (id) => {
    try {
      const response = await axios.patch(`http://192.168.1.48:3000/users/${id}/block`);
      setUsers(
        users.map((user) => (user._id === id ? response.data.user : user)) // Update the UI
      );
    } catch (err) {
      Alert.alert('Failed to block the user');
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userText}>Email: <Text style={styles.userValue}>{item.email}</Text></Text>
            <Text style={styles.userText}>First Name: <Text style={styles.userValue}>{item.firstName}</Text></Text>
            <Text style={styles.userText}>Last Name: <Text style={styles.userValue}>{item.lastName}</Text></Text>
            <Text style={styles.userText}>Role: <Text style={styles.userValue}>{item.role}</Text></Text>
            <Text style={styles.userText}>Blocked: <Text style={styles.userValue}>{item.isBlocked ? 'Yes' : 'No'}</Text></Text>

            <View style={styles.buttons}>
              <View style={styles.buttonContainer}>
                <Button
                  title={item.isBlocked ? 'Blocked' : 'Block'}
                  onPress={() => blockUser(item._id)}
                  disabled={item.isBlocked}
                  color={item.isBlocked ? '#888' : '#007bff'}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  title="Delete"
                  onPress={() => deleteUser(item._id)}
                  color="#d9534f"
                />
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f1f1', // Light grey background for a modern feel
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  userText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  userValue: {
    fontWeight: '600',
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});


export default UserScreen;
