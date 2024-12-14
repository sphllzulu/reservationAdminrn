// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
  
// } from 'react-native';
// import {Picker} from '@react-native-picker/picker';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';

// const AddRestaurantForm = ({ fetchRestaurants, restaurant, onClose }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     address: '',
//     phone: '',
//     cuisine: '',
//     rating: '',
//     pricePerReservation: '',
//     dressCode: '',
//     description: '',
//     menu: [{ name: '', image: '' }],
//     images: [],
//     location: {
//       latitude: '',
//       longitude: ''
//     },
//     availableTimeSlots: [
//       {
//         day: 'Monday',
//         slots: [{ time: '', maxReservations: '' }]
//       }
//     ]
//   });

//   const cuisines = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'French', 'Other'];
//   const dressCodes = ['Casual', 'Smart Casual', 'Formal', 'Business Casual', 'Other'];
//   const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

//   const validateForm = () => {
//     const requiredFields = ['name', 'cuisine', 'address'];
//     for (let field of requiredFields) {
//       if (!formData[field] || formData[field].trim() === '') {
//         Alert.alert('Validation Error', `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
//         return false;
//       }
//     }
  
//     if (formData.rating && (isNaN(parseFloat(formData.rating)) || parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
//       Alert.alert('Validation Error', 'Rating must be a number between 0 and 5');
//       return false;
//     }
  
//     const latitude = parseFloat(formData.location.latitude);
//     const longitude = parseFloat(formData.location.longitude);
//     if (isNaN(latitude) || isNaN(longitude) || 
//         latitude < -90 || latitude > 90 || 
//         longitude < -180 || longitude > 180) {
//       Alert.alert('Validation Error', 'Please provide valid latitude and longitude');
//       return false;
//     }
  
//     return true;
//   };

//   useEffect(() => {
//     if (restaurant) {
//       setFormData({
//         name: restaurant.name || '',
//         address: restaurant.address || '',
//         phone: restaurant.phone || '',
//         cuisine: restaurant.cuisine || '',
//         rating: restaurant.rating ? restaurant.rating.toString() : '',
//         pricePerReservation: restaurant.pricePerReservation ? restaurant.pricePerReservation.toString() : '',
//         dressCode: restaurant.dressCode || '',
//         description: restaurant.description || '',
//         menu: restaurant.menu && restaurant.menu.length > 0
//           ? restaurant.menu
//           : [{ name: '', image: '' }],
//         images: [],
//         location: {
//           latitude: restaurant.location?.latitude ? restaurant.location.latitude.toString() : '',
//           longitude: restaurant.location?.longitude ? restaurant.location.longitude.toString() : ''
//         },
//         availableTimeSlots: restaurant.availableTimeSlots && restaurant.availableTimeSlots.length > 0
//           ? restaurant.availableTimeSlots
//           : [{ day: 'Monday', slots: [{ time: '', maxReservations: '' }] }]
//       });
//     }
//   }, [restaurant]);

//   const handleLocationChange = (field, value) => {
//     setFormData(prevData => ({
//       ...prevData,
//       location: {
//         ...prevData.location,
//         [field]: value
//       }
//     }));
//   };

//   const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
//     const updatedTimeSlots = [...formData.availableTimeSlots];
//     updatedTimeSlots[dayIndex].slots[slotIndex][field] = value;
//     setFormData(prevData => ({
//       ...prevData,
//       availableTimeSlots: updatedTimeSlots
//     }));
//   };
  
//   const addTimeSlot = (dayIndex) => {
//     const updatedTimeSlots = [...formData.availableTimeSlots];
//     updatedTimeSlots[dayIndex].slots.push({ time: '', maxReservations: '' });
//     setFormData(prevData => ({
//       ...prevData,
//       availableTimeSlots: updatedTimeSlots
//     }));
//   };
  
//   const addDay = () => {
//     setFormData(prevData => ({
//       ...prevData,
//       availableTimeSlots: [
//         ...prevData.availableTimeSlots,
//         { day: 'Monday', slots: [{ time: '', maxReservations: '' }] }
//       ]
//     }));
//   };

//   const handleChange = (name, value) => {
//     setFormData(prevData => ({ ...prevData, [name]: value }));
//   };

//   const handleMenuChange = (index, field, value) => {
//     const updatedMenu = [...formData.menu];
//     updatedMenu[index][field] = value;
//     setFormData(prevData => ({ ...prevData, menu: updatedMenu }));
//   };

//   const addMenuItem = () => {
//     setFormData(prevData => ({
//       ...prevData,
//       menu: [...prevData.menu, { name: '', image: '' }],
//     }));
//   };

//   const removeMenuItem = (index) => {
//     setFormData(prevData => ({
//       ...prevData,
//       menu: prevData.menu.filter((_, i) => i !== index),
//     }));
//   };

//   const handleImagePick = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setFormData(prevData => ({
//         ...prevData,
//         images: [...prevData.images, ...result.assets.map(asset => asset.uri)],
//       }));
//     }
//   };

//   const handleSubmit = async () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }
  
//     // Create FormData
//     const form = new FormData();
  
//     // Append all text fields directly
//     Object.keys(formData).forEach(key => {
//       if (key !== 'menu' && key !== 'images' && key !== 'location' && key !== 'availableTimeSlots') {
//         form.append(key, formData[key]);
//       }
//     });
  
//     // Append location
//     form.append('location[latitude]', formData.location.latitude);
//     form.append('location[longitude]', formData.location.longitude);
  
//     // Prepare and stringify menu
//     const menu = formData.menu
//       .filter(item => item.name.trim() !== '')
//       .map(item => ({
//         name: item.name,
//         image: item.image
//       }));
//     form.append('menu', JSON.stringify(menu));
  
//     // Prepare and stringify available time slots
//     const availableTimeSlots = formData.availableTimeSlots
//       .filter(daySlot => daySlot.day && daySlot.slots.length > 0)
//       .map(daySlot => ({
//         day: daySlot.day,
//         slots: daySlot.slots
//           .filter(slot => 
//             slot.time && 
//             slot.time.trim() !== '' && 
//             !isNaN(parseInt(slot.maxReservations))
//           )
//           .map(slot => ({
//             time: slot.time.trim(),
//             maxReservations: parseInt(slot.maxReservations)
//           }))
//       }));
//     form.append('availableTimeSlots', JSON.stringify(availableTimeSlots));
  
//     // Append images
//     formData.images.forEach((uri, index) => {
//       form.append('images', {
//         uri,
//         name: `image_${index}.jpg`,
//         type: 'image/jpeg',
//       });
//     });
  
//     try {
//       const config = {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         transformRequest: (data) => data,
//       };
  
//       let response;
//       if (restaurant) {
//         // Update existing restaurant
//         response = await axios.put(
//           `http://192.168.18.15:3000/api/restaurants/${restaurant._id}`,
//           form,
//           config
//         );
//       } else {
//         // Create new restaurant
//         response = await axios.post(
//           'http://192.168.18.15:3000/api/restaurants',
//           form,
//           config
//         );
//       }
  
//       // Call fetch restaurants to update the list
//       if (fetchRestaurants) {
//         fetchRestaurants();
//       }
  
//       // Close the form
//       if (onClose) {
//         onClose();
//       }
  
//       // Success alert
//       Alert.alert(
//         'Success',
//         restaurant ? 'Restaurant updated successfully' : 'Restaurant added successfully'
//       );
  
//     } catch (error) {
//       // Detailed error logging
//       console.error('Submission error:', error);
//       console.error('Error response:', error.response?.data);
  
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to save restaurant. Please try again.'
//       );
//     }
//   };

//   return (
//     <ScrollView 
//       contentContainerStyle={styles.container}
//       keyboardShouldPersistTaps="handled"
//     >
//       <Text style={styles.header}>{restaurant ? 'Edit Restaurant' : 'Add a Restaurant'}</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Name *"
//         value={formData.name}
//         onChangeText={(value) => handleChange('name', value)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Address *"
//         value={formData.address}
//         onChangeText={(value) => handleChange('address', value)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone"
//         value={formData.phone}
//         keyboardType="phone-pad"
//         onChangeText={(value) => handleChange('phone', value)}
//       />
//       <Picker
//         selectedValue={formData.cuisine}
//         style={styles.input}
//         onValueChange={(itemValue) => handleChange('cuisine', itemValue)}
//       >
//         <Picker.Item label="Select Cuisine *" value="" />
//         {cuisines.map((cuisine, index) => (
//           <Picker.Item key={index} label={cuisine} value={cuisine} />
//         ))}
//       </Picker>
//       <TextInput
//         style={styles.input}
//         placeholder="Rating (0-5)"
//         value={formData.rating}
//         keyboardType="numeric"
//         onChangeText={(value) => handleChange('rating', value)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Price per Reservation"
//         value={formData.pricePerReservation}
//         keyboardType="numeric"
//         onChangeText={(value) => handleChange('pricePerReservation', value)}
//       />
//       <Picker
//         selectedValue={formData.dressCode}
//         style={styles.input}
//         onValueChange={(itemValue) => handleChange('dressCode', itemValue)}
//       >
//         <Picker.Item label="Select Dress Code" value="" />
//         {dressCodes.map((dressCode, index) => (
//           <Picker.Item key={index} label={dressCode} value={dressCode} />
//         ))}
//       </Picker>
//       <TextInput
//         style={styles.textArea}
//         placeholder="Description"
//         value={formData.description}
//         multiline
//         numberOfLines={4}
//         onChangeText={(value) => handleChange('description', value)}
//       />
      
//       <Text style={styles.subHeader}>Menu</Text>
//       {formData.menu.map((item, index) => (
//         <View key={index} style={styles.menuItem}>
//           <TextInput
//             style={[styles.input, styles.menuInput]}
//             placeholder="Dish Name"
//             value={item.name}
//             onChangeText={(value) => handleMenuChange(index, 'name', value)}
//           />
//           <TextInput
//             style={[styles.input, styles.menuInput]}
//             placeholder="Dish Image URL"
//             value={item.image}
//             onChangeText={(value) => handleMenuChange(index, 'image', value)}
//           />
//           {formData.menu.length > 1 && (
//             <TouchableOpacity onPress={() => removeMenuItem(index)}>
//               <Text style={styles.removeButton}>Remove</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ))}
//       <Button title="Add Dish" onPress={addMenuItem} />

//       <Text style={styles.subHeader}>Images</Text>
//       <Button title="Pick Images" onPress={handleImagePick} />
//       <ScrollView horizontal>
//         {formData.images.map((uri, index) => (
//           <Image key={index} source={{ uri }} style={styles.imagePreview} />
//         ))}
//       </ScrollView>
      
//       <Text style={styles.subHeader}>Location</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Latitude"
//         value={formData.location.latitude}
//         keyboardType="numeric"
//         onChangeText={(value) => handleLocationChange('latitude', value)}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Longitude"
//         value={formData.location.longitude}
//         keyboardType="numeric"
//         onChangeText={(value) => handleLocationChange('longitude', value)}
//       />
    
//       <Text style={styles.subHeader}>Available Time Slots</Text>
//       {formData.availableTimeSlots.map((daySlot, dayIndex) => (
//         <View key={dayIndex} style={styles.daySlotContainer}>
//           <Picker
//             selectedValue={daySlot.day}
//             style={styles.input}
//             onValueChange={(itemValue) => {
//               const updatedTimeSlots = [...formData.availableTimeSlots];
//               updatedTimeSlots[dayIndex].day = itemValue;
//               setFormData(prevData => ({
//                 ...prevData,
//                 availableTimeSlots: updatedTimeSlots
//               }));
//             }}
//           >
//             <Picker.Item label="Select Day" value="" />
//             {daysOfWeek.map((day, index) => (
//               <Picker.Item key={index} label={day} value={day} />
//             ))}
//           </Picker>
//           {daySlot.slots.map((slot, slotIndex) => (
//             <View key={slotIndex} style={styles.slotContainer}>
//               <TextInput
//                 style={[styles.input, styles.halfInput]}
//                 placeholder="Time (HH:MM)"
//                 value={slot.time}
//                 onChangeText={(value) => handleTimeSlotChange(dayIndex, slotIndex, 'time', value)}
//               />
//               <TextInput
//                 style={[styles.input, styles.halfInput]}
//                 placeholder="Max Reservations"
//                 keyboardType="numeric"
//                 value={slot.maxReservations}
//                 onChangeText={(value) => handleTimeSlotChange(dayIndex, slotIndex, 'maxReservations', value)}
//               />
//             </View>
//           ))}
//           <Button 
//             title="Add Time Slot" 
//             onPress={() => addTimeSlot(dayIndex)} 
//           />
//         </View>
//       ))}
//       <Button 
//         title="Add Another Day" 
//         onPress={addDay} 
//       />

//       <Button title="Submit" onPress={handleSubmit} />
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   input: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   textArea: {
//     height: 80,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     textAlignVertical: 'top',
//   },
//   subHeader: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   menuItem: {
//     marginBottom: 10,
//   },
//   menuInput: {
//     marginBottom: 5,
//   },
//   removeButton: {
//     color: 'red',
//     textAlign: 'center',
//   },
//   imagePreview: {
//     width: 100,
//     height: 100,
//     marginRight: 10,
//   },
//   daySlotContainer: {
//     marginBottom: 20,
//   },
//   slotContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   halfInput: {
//     flex: 1,
//     marginRight: 10,
//   },
// });

// export default AddRestaurantForm;

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
import { Picker } from '@react-native-picker/picker';
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
    location: {
      latitude: '',
      longitude: ''
    },
    availableTimeSlots: [
      {
        day: 'Monday',
        slots: [{ time: '', maxReservations: '' }]
      }
    ]
  });

  const cuisines = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'French', 'Other'];
  const dressCodes = ['Casual', 'Smart Casual', 'Formal', 'Business Casual', 'Other'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const validateForm = () => {
    const requiredFields = ['name', 'cuisine', 'address', 'location'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Validation Error', `Missing required field: ${field}`);
        return false;
      }
    }
  
    // Validate latitude and longitude inside location
    if (!formData.location || !formData.location.latitude || !formData.location.longitude) {
      Alert.alert('Validation Error', 'Missing required fields: location[latitude] or location[longitude]');
      return false;
    }
  
    if (formData.rating && (isNaN(parseFloat(formData.rating)) || parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      Alert.alert('Validation Error', 'Rating must be a number between 0 and 5');
      return false;
    }
  
    const latitude = parseFloat(formData.location.latitude);
    const longitude = parseFloat(formData.location.longitude);
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      Alert.alert('Validation Error', 'Please provide valid latitude and longitude');
      return false;
    }
  
    // Validate time slots
    for (let daySlot of formData.availableTimeSlots) {
      for (let slot of daySlot.slots) {
        if (!slot.time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.time)) {
          Alert.alert('Validation Error', 'Time must be in HH:MM format');
          return false;
        }
        if (!slot.maxReservations || isNaN(parseInt(slot.maxReservations)) || parseInt(slot.maxReservations) < 1) {
          Alert.alert('Validation Error', 'Max reservations must be a positive integer');
          return false;
        }
      }
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
        location: {
          latitude: restaurant.location?.latitude ? restaurant.location.latitude.toString() : '',
          longitude: restaurant.location?.longitude ? restaurant.location.longitude.toString() : ''
        },
        availableTimeSlots: restaurant.availableTimeSlots && restaurant.availableTimeSlots.length > 0
          ? restaurant.availableTimeSlots
          : [{ day: 'Monday', slots: [{ time: '', maxReservations: '' }] }]
      });
    }
  }, [restaurant]);

  const handleLocationChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      location: {
        ...prevData.location,
        [field]: value
      }
    }));
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots[dayIndex].slots[slotIndex][field] = value;
    setFormData(prevData => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots
    }));
  };

  const addTimeSlot = (dayIndex) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots[dayIndex].slots.push({ time: '', maxReservations: '' });
    setFormData(prevData => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots
    }));
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots[dayIndex].slots.splice(slotIndex, 1);
    setFormData(prevData => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots
    }));
  };

  const addDay = () => {
    setFormData(prevData => ({
      ...prevData,
      availableTimeSlots: [
        ...prevData.availableTimeSlots,
        { day: 'Monday', slots: [{ time: '', maxReservations: '' }] }
      ]
    }));
  };

  const removeDay = (dayIndex) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots.splice(dayIndex, 1);
    setFormData(prevData => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots
    }));
  };

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
    if (!validateForm()) {
      return;
    }
      console.log('Latitude:', formData.location.latitude);
console.log('Longitude:', formData.location.longitude);
    const form = new FormData();
  
    // Append all text fields directly
    Object.keys(formData).forEach(key => {
      if (key !== 'menu' && key !== 'images' && key !== 'location' && key !== 'availableTimeSlots') {
        form.append(key, formData[key]);
      }
    });
  
    // Append location fields correctly
    form.append('location[latitude]', formData.location.latitude);
    form.append('location[longitude]', formData.location.longitude);
  
    // Prepare and stringify menu
    const menu = formData.menu
      .filter(item => item.name.trim() !== '')
      .map(item => ({
        name: item.name,
        image: item.image
      }));
    form.append('menu', JSON.stringify(menu));
  
    // Prepare and stringify available time slots
    const availableTimeSlots = formData.availableTimeSlots
      .filter(daySlot => daySlot.day && daySlot.slots.length > 0)
      .map(daySlot => ({
        day: daySlot.day,
        slots: daySlot.slots
          .filter(slot => 
            slot.time && 
            slot.time.trim() !== '' && 
            !isNaN(parseInt(slot.maxReservations))
          )
          .map(slot => ({
            time: slot.time.trim(),
            maxReservations: parseInt(slot.maxReservations)
          }))
      }));
      
    form.append('availableTimeSlots', JSON.stringify(availableTimeSlots));
  
    // Append images
    formData.images.forEach((uri, index) => {
      form.append('images', {
        uri,
        name: `image_${index}.jpg`,
        type: 'image/jpeg',
      });
    });
  
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
      };
  
      let response;
      if (restaurant) {
        // Update existing restaurant
        response = await axios.put(
          `http://192.168.18.15:3000/api/restaurants/${restaurant._id}`,
          form,
          config
        );
      } else {
        // Create new restaurant
        response = await axios.post(
          'http://192.168.18.15:3000/api/restaurants',
          form,
          config
        );
      }
  
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
      <Picker
        selectedValue={formData.cuisine}
        style={styles.input}
        onValueChange={(itemValue) => handleChange('cuisine', itemValue)}
      >
        <Picker.Item label="Select Cuisine *" value="" />
        {cuisines.map((cuisine, index) => (
          <Picker.Item key={index} label={cuisine} value={cuisine} />
        ))}
      </Picker>
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
      <Picker
        selectedValue={formData.dressCode}
        style={styles.input}
        onValueChange={(itemValue) => handleChange('dressCode', itemValue)}
      >
        <Picker.Item label="Select Dress Code" value="" />
        {dressCodes.map((dressCode, index) => (
          <Picker.Item key={index} label={dressCode} value={dressCode} />
        ))}
      </Picker>
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
      
      <Text style={styles.subHeader}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={formData.location.latitude}
        keyboardType="numeric"
        onChangeText={(value) => handleLocationChange('latitude', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={formData.location.longitude}
        keyboardType="numeric"
        onChangeText={(value) => handleLocationChange('longitude', value)}
      />
    
      <Text style={styles.subHeader}>Available Time Slots</Text>
      {formData.availableTimeSlots.map((daySlot, dayIndex) => (
        <View key={dayIndex} style={styles.daySlotContainer}>
          <Picker
            selectedValue={daySlot.day}
            style={styles.input}
            onValueChange={(itemValue) => {
              const updatedTimeSlots = [...formData.availableTimeSlots];
              updatedTimeSlots[dayIndex].day = itemValue;
              setFormData(prevData => ({
                ...prevData,
                availableTimeSlots: updatedTimeSlots
              }));
            }}
          >
            <Picker.Item label="Select Day" value="" />
            {daysOfWeek.map((day, index) => (
              <Picker.Item key={index} label={day} value={day} />
            ))}
          </Picker>
          {daySlot.slots.map((slot, slotIndex) => (
            <View key={slotIndex} style={styles.slotContainer}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Time (HH:MM)"
                value={slot.time}
                onChangeText={(value) => handleTimeSlotChange(dayIndex, slotIndex, 'time', value)}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Max Reservations"
                keyboardType="numeric"
                value={slot.maxReservations}
                onChangeText={(value) => handleTimeSlotChange(dayIndex, slotIndex, 'maxReservations', value)}
              />
              {daySlot.slots.length > 1 && (
                <TouchableOpacity onPress={() => removeTimeSlot(dayIndex, slotIndex)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <Button 
            title="Add Time Slot" 
            onPress={() => addTimeSlot(dayIndex)} 
          />
          {formData.availableTimeSlots.length > 1 && (
            <TouchableOpacity onPress={() => removeDay(dayIndex)}>
              <Text style={styles.removeButton}>Remove Day</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Button 
        title="Add Another Day" 
        onPress={addDay} 
      />

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  menuItem: {
    marginBottom: 10,
  },
  menuInput: {
    marginBottom: 5,
  },
  removeButton: {
    color: 'red',
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  daySlotContainer: {
    marginBottom: 20,
  },
  slotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
});

export default AddRestaurantForm;