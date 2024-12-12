import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const AddRestaurantForm = ({ fetchRestaurants, restaurant, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    cuisine: '',
    rating: '',
    pricePerReservation: '',
    dressCode: '',
    description: '',
    menu: [{ name: '', image: '' }],
    images: [],
  });

  // Validation function
  const validateForm = () => {
    const requiredFields = ['name', 'cuisine', 'address'];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        Alert.alert('Validation Error', `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    // Validate rating if provided
    if (formData.rating && (isNaN(parseFloat(formData.rating)) || parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      Alert.alert('Validation Error', 'Rating must be a number between 0 and 5');
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        cuisine: restaurant.cuisine || '',
        rating: restaurant.rating ? restaurant.rating.toString() : '',
        pricePerReservation: restaurant.pricePerReservation ? restaurant.pricePerReservation.toString() : '',
        dressCode: restaurant.dressCode || '',
        description: restaurant.description || '',
        menu: restaurant.menu && restaurant.menu.length > 0
          ? restaurant.menu
          : [{ name: '', image: '' }],
        images: [],
      });
    }
  }, [restaurant]);

  const handleChange = (name, value) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleMenuChange = (index, field, value) => {
    const updatedMenu = [...formData.menu];
    updatedMenu[index][field] = value;
    setFormData(prevData => ({ ...prevData, menu: updatedMenu }));
  };

  const addMenuItem = () => {
    setFormData(prevData => ({
      ...prevData,
      menu: [...prevData.menu, { name: '', image: '' }],
    }));
  };

  const removeMenuItem = (index) => {
    setFormData(prevData => ({
      ...prevData,
      menu: prevData.menu.filter((_, i) => i !== index),
    }));
  };

  const handleImagePick = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prevData => ({
        ...prevData,
        images: [...prevData.images, ...result.assets.map(asset => asset.uri)],
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Create FormData
    const form = new FormData();

    // Append text fields
    Object.keys(formData).forEach(key => {
      if (key !== 'menu' && key !== 'images') {
        form.append(key, formData[key]);
      }
    });

    // Append menu as JSON string
    form.append('menu', JSON.stringify(formData.menu.filter(item => item.name.trim() !== '')));

    // Append images
    formData.images.forEach((uri, index) => {
      form.append('images', {
        uri,
        name: `image_${index}.jpg`,
        type: 'image/jpeg',
      });
    });

    try {
      // Detailed logging for debugging
      console.log('Submitting form:', form);
      console.log('Form data keys:', Object.keys(form));

      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data, // Ensure axios doesn't modify the form data
      };

      let response;
      if (restaurant) {
        // Update existing restaurant
        response = await axios.put(
          `http://192.168.1.49:3000/api/restaurants/${restaurant._id}`, 
          form, 
          config
        );
      } else {
        // Create new restaurant
        response = await axios.post(
          'http://192.168.1.49:3000/api/restaurants', 
          form, 
          config
        );
      }

      // Log the full response for debugging
      console.log('Server response:', response.data);

      // Call fetch restaurants to update the list
      if (fetchRestaurants) {
        fetchRestaurants();
      }

      // Close the form
      if (onClose) {
        onClose();
      }

      // Success alert
      Alert.alert(
        'Success', 
        restaurant ? 'Restaurant updated successfully' : 'Restaurant added successfully'
      );

    } catch (error) {
      // Detailed error logging
      console.error('Submission error:', error);
      console.error('Error response:', error.response?.data);
      
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to save restaurant. Please try again.'
      );
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>{restaurant ? 'Edit Restaurant' : 'Add a Restaurant'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name *"
        value={formData.name}
        onChangeText={(value) => handleChange('name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Address *"
        value={formData.address}
        onChangeText={(value) => handleChange('address', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        keyboardType="phone-pad"
        onChangeText={(value) => handleChange('phone', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine *"
        value={formData.cuisine}
        onChangeText={(value) => handleChange('cuisine', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (0-5)"
        value={formData.rating}
        keyboardType="numeric"
        onChangeText={(value) => handleChange('rating', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Price per Reservation"
        value={formData.pricePerReservation}
        keyboardType="numeric"
        onChangeText={(value) => handleChange('pricePerReservation', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Dress Code"
        value={formData.dressCode}
        onChangeText={(value) => handleChange('dressCode', value)}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Description"
        value={formData.description}
        multiline
        numberOfLines={4}
        onChangeText={(value) => handleChange('description', value)}
      />
      
      <Text style={styles.subHeader}>Menu</Text>
      {formData.menu.map((item, index) => (
        <View key={index} style={styles.menuItem}>
          <TextInput
            style={[styles.input, styles.menuInput]}
            placeholder="Dish Name"
            value={item.name}
            onChangeText={(value) => handleMenuChange(index, 'name', value)}
          />
          <TextInput
            style={[styles.input, styles.menuInput]}
            placeholder="Dish Image URL"
            value={item.image}
            onChangeText={(value) => handleMenuChange(index, 'image', value)}
          />
          {formData.menu.length > 1 && (
            <TouchableOpacity onPress={() => removeMenuItem(index)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Button title="Add Dish" onPress={addMenuItem} />

      <Text style={styles.subHeader}>Images</Text>
      <Button title="Pick Images" onPress={handleImagePick} />
      <ScrollView horizontal>
        {formData.images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.imagePreview} />
        ))}
      </ScrollView>

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100, 
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuItem: {
    marginBottom: 16,
  },
  menuInput: {
    marginBottom: 8,
  },
  removeButton: {
    color: 'red',
    marginTop: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
});

export default AddRestaurantForm;