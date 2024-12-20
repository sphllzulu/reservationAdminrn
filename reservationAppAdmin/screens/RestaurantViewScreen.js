import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RestaurantViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
//   const { id } = route.params;

  const [restaurant, setRestaurant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`http://192.168.0.104:3000/api/restaurants`);
      const data = await response.json();
      setRestaurant(data);
      setEditedData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load restaurant details');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setNewImages([...newImages, ...result.assets]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Append text fields
      Object.keys(editedData).forEach(key => {
        if (key !== 'images' && key !== '_id') {
          if (typeof editedData[key] === 'object') {
            formData.append(key, JSON.stringify(editedData[key]));
          } else {
            formData.append(key, editedData[key]);
          }
        }
      });

      // Append new images
      newImages.forEach((image, index) => {
        const imageUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        });
      });

      const response = await fetch(`http://192.168.0.104:3000/api/restaurants/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        setIsEditing(false);
        fetchRestaurant();
        Alert.alert('Success', 'Restaurant updated successfully');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      Alert.alert('Error', 'Failed to update restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this restaurant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`http://192.168.0.104:3000/api/restaurants/${id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting restaurant:', error);
              Alert.alert('Error', 'Failed to delete restaurant');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{restaurant.name}</Text>
          <View style={styles.headerButtons}>
            {!isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <Icon name="pencil" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Icon name="delete" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Icon name="content-save" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    setEditedData(restaurant);
                    setNewImages([]);
                  }}
                >
                  <Icon name="close" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Image Gallery */}
        <ScrollView
          horizontal
          style={styles.imageGallery}
          showsHorizontalScrollIndicator={false}
        >
          {restaurant.images.map((image, index) => (
            <Image
              key={`existing_${index}`}
              source={{ uri: image }}
              style={styles.image}
            />
          ))}
          {newImages.map((image, index) => (
            <Image
              key={`new_${index}`}
              source={{ uri: image.uri }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {isEditing && (
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Icon name="image-plus" size={24} color="#0000ff" />
            <Text style={styles.addImageText}>Add Images</Text>
          </TouchableOpacity>
        )}

        {/* Restaurant Details Form */}
        <View style={styles.detailsContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.name}
                onChangeText={(text) =>
                  setEditedData((prev) => ({ ...prev, name: text }))
                }
              />
            ) : (
              <Text style={styles.value}>{restaurant.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cuisine</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.cuisine}
                onChangeText={(text) =>
                  setEditedData((prev) => ({ ...prev, cuisine: text }))
                }
              />
            ) : (
              <Text style={styles.value}>{restaurant.cuisine}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.address}
                onChangeText={(text) =>
                  setEditedData((prev) => ({ ...prev, address: text }))
                }
              />
            ) : (
              <Text style={styles.value}>{restaurant.address}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedData.phone}
                onChangeText={(text) =>
                  setEditedData((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{restaurant.phone}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedData.description}
                onChangeText={(text) =>
                  setEditedData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.value}>{restaurant.description}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  imageGallery: {
    padding: 16,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addImageText: {
    color: '#0000ff',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default RestaurantViewScreen;