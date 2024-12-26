// import React, { useState, useEffect } from "react";
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
//   SafeAreaView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import * as ImagePicker from "expo-image-picker";
// import axios from "axios";

// const AddRestaurantForm = ({ fetchRestaurants, restaurant, onClose }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     address: "",
//     phone: "",
//     cuisine: "",
//     rating: "",
//     pricePerReservation: "",
//     dressCode: "",
//     description: "",
//     menu: [{ name: "", image: "" }],
//     images: [],
//     location: {
//       latitude: "",
//       longitude: "",
//     },
//     availableTimeSlots: [
//       {
//         day: "Monday",
//         slots: [{ time: "", maxReservations: "" }],
//       },
//     ],
//   });

//   const cuisines = [
//     "Italian",
//     "Chinese",
//     "Mexican",
//     "Indian",
//     "Japanese",
//     "French",
//     "Other",
//   ];
//   const dressCodes = [
//     "Casual",
//     "Smart Casual",
//     "Formal",
//     "Business Casual",
//     "Other",
//   ];
//   const daysOfWeek = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];

//   const [showForm, setShowForm] = useState(false);

//   const toggleForm = () => {
//     setShowForm(!showForm);
//   };

//   const validateForm = () => {
//     const requiredFields = ["name", "cuisine", "address", "location"];
//     for (let field of requiredFields) {
//       if (!formData[field]) {
//         Alert.alert("Validation Error", `Missing required field: ${field}`);
//         return false;
//       }
//     }

//     // Validate latitude and longitude inside location
//     if (
//       !formData.location ||
//       !formData.location.latitude ||
//       !formData.location.longitude
//     ) {
//       Alert.alert(
//         "Validation Error",
//         "Missing required fields: location[latitude] or location[longitude]"
//       );
//       return false;
//     }

//     if (
//       formData.rating &&
//       (isNaN(parseFloat(formData.rating)) ||
//         parseFloat(formData.rating) < 0 ||
//         parseFloat(formData.rating) > 5)
//     ) {
//       Alert.alert(
//         "Validation Error",
//         "Rating must be a number between 0 and 5"
//       );
//       return false;
//     }

//     const latitude = parseFloat(formData.location.latitude);
//     const longitude = parseFloat(formData.location.longitude);
//     if (
//       isNaN(latitude) ||
//       isNaN(longitude) ||
//       latitude < -90 ||
//       latitude > 90 ||
//       longitude < -180 ||
//       longitude > 180
//     ) {
//       Alert.alert(
//         "Validation Error",
//         "Please provide valid latitude and longitude"
//       );
//       return false;
//     }

//     // Validate time slots
//     for (let daySlot of formData.availableTimeSlots) {
//       for (let slot of daySlot.slots) {
//         if (
//           !slot.time ||
//           !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.time)
//         ) {
//           Alert.alert("Validation Error", "Time must be in HH:MM format");
//           return false;
//         }
//         if (
//           !slot.maxReservations ||
//           isNaN(parseInt(slot.maxReservations)) ||
//           parseInt(slot.maxReservations) < 1
//         ) {
//           Alert.alert(
//             "Validation Error",
//             "Max reservations must be a positive integer"
//           );
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   useEffect(() => {
//     if (restaurant) {
//       setFormData({
//         name: restaurant.name || "",
//         address: restaurant.address || "",
//         phone: restaurant.phone || "",
//         cuisine: restaurant.cuisine || "",
//         rating: restaurant.rating ? restaurant.rating.toString() : "",
//         pricePerReservation: restaurant.pricePerReservation
//           ? restaurant.pricePerReservation.toString()
//           : "",
//         dressCode: restaurant.dressCode || "",
//         description: restaurant.description || "",
//         menu:
//           restaurant.menu && restaurant.menu.length > 0
//             ? restaurant.menu
//             : [{ name: "", image: "" }],
//         images: [],
//         location: {
//           latitude: restaurant.location?.latitude
//             ? restaurant.location.latitude.toString()
//             : "",
//           longitude: restaurant.location?.longitude
//             ? restaurant.location.longitude.toString()
//             : "",
//         },
//         availableTimeSlots:
//           restaurant.availableTimeSlots &&
//           restaurant.availableTimeSlots.length > 0
//             ? restaurant.availableTimeSlots
//             : [{ day: "Monday", slots: [{ time: "", maxReservations: "" }] }],
//       });
//     }
//   }, [restaurant]);

//   const handleLocationChange = (field, value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       location: {
//         ...prevData.location,
//         [field]: value,
//       },
//     }));
//   };

//   const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
//     const updatedTimeSlots = [...formData.availableTimeSlots];
//     updatedTimeSlots[dayIndex].slots[slotIndex][field] = value;
//     setFormData((prevData) => ({
//       ...prevData,
//       availableTimeSlots: updatedTimeSlots,
//     }));
//   };

//   const addTimeSlot = (dayIndex) => {
//     const updatedTimeSlots = [...formData.availableTimeSlots];
//     updatedTimeSlots[dayIndex].slots.push({ time: "", maxReservations: "" });
//     setFormData((prevData) => ({
//       ...prevData,
//       availableTimeSlots: updatedTimeSlots,
//     }));
//   };

//   const removeTimeSlot = (dayIndex, slotIndex) => {
//     const updatedTimeSlots = [...formData.availableTimeSlots];
//     updatedTimeSlots[dayIndex].slots.splice(slotIndex, 1);
//     setFormData((prevData) => ({
//       ...prevData,
//       availableTimeSlots: updatedTimeSlots,
//     }));
//   };

//   const addDay = () => {
//     setFormData((prevData) => ({
//       ...prevData,
//       availableTimeSlots: [
//         ...prevData.availableTimeSlots,
//         { day: "Monday", slots: [{ time: "", maxReservations: "" }] },
//       ],
//     }));
//   };

//   const removeDay = (dayIndex) => {
//     const updatedTimeSlots = [...formData.availableTimeSlots];
//     updatedTimeSlots.splice(dayIndex, 1);
//     setFormData((prevData) => ({
//       ...prevData,
//       availableTimeSlots: updatedTimeSlots,
//     }));
//   };

//   const handleChange = (name, value) => {
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleMenuChange = (index, field, value) => {
//     const updatedMenu = [...formData.menu];
//     updatedMenu[index][field] = value;
//     setFormData((prevData) => ({ ...prevData, menu: updatedMenu }));
//   };

//   const addMenuItem = () => {
//     setFormData((prevData) => ({
//       ...prevData,
//       menu: [...prevData.menu, { name: "", image: "" }],
//     }));
//   };

//   const removeMenuItem = (index) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       menu: prevData.menu.filter((_, i) => i !== index),
//     }));
//   };

//   const handleImagePick = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Sorry",
//         "We need camera roll permissions to make this work!"
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setFormData((prevData) => ({
//         ...prevData,
//         images: [
//           ...prevData.images,
//           ...result.assets.map((asset) => asset.uri),
//         ],
//       }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }
//     console.log("Latitude:", formData.location.latitude);
//     console.log("Longitude:", formData.location.longitude);
//     const form = new FormData();

//     // Append all text fields directly
//     Object.keys(formData).forEach((key) => {
//       if (
//         key !== "menu" &&
//         key !== "images" &&
//         key !== "location" &&
//         key !== "availableTimeSlots"
//       ) {
//         form.append(key, formData[key]);
//       }
//     });

//     // Append location fields correctly
//     form.append("location[latitude]", formData.location.latitude);
//     form.append("location[longitude]", formData.location.longitude);

//     // Prepare and stringify menu
//     const menu = formData.menu
//       .filter((item) => item.name.trim() !== "")
//       .map((item) => ({
//         name: item.name,
//         image: item.image,
//       }));
//     form.append("menu", JSON.stringify(menu));

//     // Prepare and stringify available time slots
//     const availableTimeSlots = formData.availableTimeSlots
//       .filter((daySlot) => daySlot.day && daySlot.slots.length > 0)
//       .map((daySlot) => ({
//         day: daySlot.day,
//         slots: daySlot.slots
//           .filter(
//             (slot) =>
//               slot.time &&
//               slot.time.trim() !== "" &&
//               !isNaN(parseInt(slot.maxReservations))
//           )
//           .map((slot) => ({
//             time: slot.time.trim(),
//             maxReservations: parseInt(slot.maxReservations),
//           })),
//       }));

//     form.append("availableTimeSlots", JSON.stringify(availableTimeSlots));

//     // Append images
//     formData.images.forEach((uri, index) => {
//       form.append("images", {
//         uri,
//         name: `image_${index}.jpg`,
//         type: "image/jpeg",
//       });
//     });

//     try {
//       const config = {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         transformRequest: (data) => data,
//       };

//       let response;
//       if (restaurant) {
//         // Update existing restaurant
//         response = await axios.put(
//           `https://reservationadminrn-pdla.onrender.com/api/restaurants/${restaurant._id}`,
//           form,
//           config
//         );
//       } else {
//         // Create new restaurant
//         response = await axios.post(
//           "http://192.168.0.104:3000/api/restaurants",
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
//         "Success",
//         restaurant
//           ? "Restaurant updated successfully"
//           : "Restaurant added successfully"
//       );
//     } catch (error) {
//       // Detailed error logging
//       console.error("Submission error:", error);
//       console.error("Error response:", error.response?.data);

//       Alert.alert(
//         "Error",
//         error.response?.data?.message ||
//           "Failed to save restaurant. Please try again."
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {/* Floating Action Button */}
//       <TouchableOpacity style={styles.floatingButton} onPress={toggleForm}>
//         <Text style={styles.floatingButtonText}>+</Text>
//       </TouchableOpacity>

//       {showForm && (
//         <View style={styles.formContainer}>
//         {/* Close Button */}
//         <TouchableOpacity 
//           style={styles.closeButton} 
//           onPress={toggleForm}
//         >
//           <Text style={styles.closeButtonText}>×</Text>
//         </TouchableOpacity>

//         <ScrollView
//           contentContainerStyle={styles.container}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Text style={styles.header}>
//             {restaurant ? "Edit Restaurant" : "Add a Restaurant"}
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Name *"
//             value={formData.name}
//             onChangeText={(value) => handleChange("name", value)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Address *"
//             value={formData.address}
//             onChangeText={(value) => handleChange("address", value)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Phone"
//             value={formData.phone}
//             keyboardType="phone-pad"
//             onChangeText={(value) => handleChange("phone", value)}
//           />
//           <Picker
//             selectedValue={formData.cuisine}
//             style={styles.input}
//             onValueChange={(itemValue) => handleChange("cuisine", itemValue)}
//           >
//             <Picker.Item label="Select Cuisine *" value="" />
//             {cuisines.map((cuisine, index) => (
//               <Picker.Item key={index} label={cuisine} value={cuisine} />
//             ))}
//           </Picker>
//           <TextInput
//             style={styles.input}
//             placeholder="Rating (0-5)"
//             value={formData.rating}
//             keyboardType="numeric"
//             onChangeText={(value) => handleChange("rating", value)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Price per Reservation"
//             value={formData.pricePerReservation}
//             keyboardType="numeric"
//             onChangeText={(value) => handleChange("pricePerReservation", value)}
//           />
//           <Picker
//             selectedValue={formData.dressCode}
//             style={styles.input}
//             onValueChange={(itemValue) => handleChange("dressCode", itemValue)}
//           >
//             <Picker.Item label="Select Dress Code" value="" />
//             {dressCodes.map((dressCode, index) => (
//               <Picker.Item key={index} label={dressCode} value={dressCode} />
//             ))}
//           </Picker>
//           <TextInput
//             style={styles.textArea}
//             placeholder="Description"
//             value={formData.description}
//             multiline
//             numberOfLines={4}
//             onChangeText={(value) => handleChange("description", value)}
//           />

//           <Text style={styles.subHeader}>Menu</Text>
//           {formData.menu.map((item, index) => (
//             <View key={index} style={styles.menuItem}>
//               <TextInput
//                 style={[styles.input, styles.menuInput]}
//                 placeholder="Dish Name"
//                 value={item.name}
//                 onChangeText={(value) => handleMenuChange(index, "name", value)}
//               />
//               <TextInput
//                 style={[styles.input, styles.menuInput]}
//                 placeholder="Dish Image URL"
//                 value={item.image}
//                 onChangeText={(value) =>
//                   handleMenuChange(index, "image", value)
//                 }
//               />
//               {formData.menu.length > 1 && (
//                 <TouchableOpacity onPress={() => removeMenuItem(index)}>
//                   <Text style={styles.removeButton}>Remove</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))}
//           <Button title="Add Dish" onPress={addMenuItem} />

//           <Text style={styles.subHeader}>Images</Text>
//           <Button title="Pick Images" onPress={handleImagePick} />
//           <ScrollView horizontal>
//             {formData.images.map((uri, index) => (
//               <Image key={index} source={{ uri }} style={styles.imagePreview} />
//             ))}
//           </ScrollView>

//           <Text style={styles.subHeader}>Location</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Latitude"
//             value={formData.location.latitude}
//             keyboardType="numeric"
//             onChangeText={(value) => handleLocationChange("latitude", value)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Longitude"
//             value={formData.location.longitude}
//             keyboardType="numeric"
//             onChangeText={(value) => handleLocationChange("longitude", value)}
//           />

//           <Text style={styles.subHeader}>Available Time Slots</Text>
//           {formData.availableTimeSlots.map((daySlot, dayIndex) => (
//             <View key={dayIndex} style={styles.daySlotContainer}>
//               <Picker
//                 selectedValue={daySlot.day}
//                 style={styles.input}
//                 onValueChange={(itemValue) => {
//                   const updatedTimeSlots = [...formData.availableTimeSlots];
//                   updatedTimeSlots[dayIndex].day = itemValue;
//                   setFormData((prevData) => ({
//                     ...prevData,
//                     availableTimeSlots: updatedTimeSlots,
//                   }));
//                 }}
//               >
//                 <Picker.Item label="Select Day" value="" />
//                 {daysOfWeek.map((day, index) => (
//                   <Picker.Item key={index} label={day} value={day} />
//                 ))}
//               </Picker>
//               {daySlot.slots.map((slot, slotIndex) => (
//                 <View key={slotIndex} style={styles.slotContainer}>
//                   <TextInput
//                     style={[styles.input, styles.halfInput]}
//                     placeholder="Time (HH:MM)"
//                     value={slot.time}
//                     onChangeText={(value) =>
//                       handleTimeSlotChange(dayIndex, slotIndex, "time", value)
//                     }
//                   />
//                   <TextInput
//                     style={[styles.input, styles.halfInput]}
//                     placeholder="Max Reservations"
//                     keyboardType="numeric"
//                     value={slot.maxReservations}
//                     onChangeText={(value) =>
//                       handleTimeSlotChange(
//                         dayIndex,
//                         slotIndex,
//                         "maxReservations",
//                         value
//                       )
//                     }
//                   />
//                   {daySlot.slots.length > 1 && (
//                     <TouchableOpacity
//                       onPress={() => removeTimeSlot(dayIndex, slotIndex)}
//                     >
//                       <Text style={styles.removeButton}>Remove</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               ))}
//               <Button
//                 title="Add Time Slot"
//                 onPress={() => addTimeSlot(dayIndex)}
//               />
//               {formData.availableTimeSlots.length > 1 && (
//                 <TouchableOpacity onPress={() => removeDay(dayIndex)}>
//                   <Text style={styles.removeButton}>Remove Day</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))}
//           <Button title="Add Another Day" onPress={addDay} />

//           <Button title="Submit" onPress={handleSubmit} />
//         </ScrollView>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#f9f9f9",
//     borderRadius:20,
//   },
//   formContainer: {
//     flex: 1,
//     position: 'absolute',
//     top: 0,
//     bottom: 0,
//     right: 0,
//     // width: '80%',
//     backgroundColor: '#1e90ff',
//     // borderTopLeftRadius: 20,
//     // borderBottomLeftRadius: 20,
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: -2, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 6,
//   },
  
//   header: {
//     fontSize: 28,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 20,
//   },
//   input: {
//     height: 50,
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 8,
//     backgroundColor: "#fff",
//     paddingHorizontal: 15,
//     fontSize: 16,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   textArea: {
//     height: 100,
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 8,
//     backgroundColor: "#fff",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     fontSize: 16,
//     textAlignVertical: "top",
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   subHeader: {
//     fontSize: 20,
//     fontWeight: "500",
//     color: "#555",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   menuItem: {
//     marginBottom: 15,
//   },
//   menuInput: {
//     marginBottom: 8,
//   },
//   removeButton: {
//     color: "#d9534f",
//     textAlign: "center",
//     fontWeight: "500",
//   },
//   imagePreview: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginRight: 10,
//     borderColor: "#ddd",
//     borderWidth: 1,
//   },
//   daySlotContainer: {
//     marginBottom: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   slotContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   halfInput: {
//     flex: 1,
//     marginRight: 10,
//   },
//   button: {
//     backgroundColor: "#007bff",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   floatingButton: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     backgroundColor: "#007bff",
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 4,
//   },
//   floatingButtonText: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//   },
// });

// export default AddRestaurantForm;


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

const AddRestaurantForm = ({ fetchRestaurants, restaurant, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    cuisine: "",
    rating: "",
    pricePerReservation: "",
    dressCode: "",
    description: "",
    menu: [{ name: "", imageUrl: "" }],
    photos: [], // Array of photo URLs
    location: {
      latitude: "",
      longitude: "",
    },
    availableTimeSlots: [
      {
        day: "Monday",
        slots: [{ time: "", maxReservations: "" }],
      },
    ],
  });

  const cuisines = [
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "Japanese",
    "French",
    "Other",
  ];
  const dressCodes = [
    "Casual",
    "Smart Casual",
    "Formal",
    "Business Casual",
    "Other",
  ];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const validateForm = () => {
    const requiredFields = ["name", "cuisine", "address", "location"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        Alert.alert("Validation Error", `Missing required field: ${field}`);
        return false;
      }
    }

    // Validate latitude and longitude inside location
    if (
      !formData.location ||
      !formData.location.latitude ||
      !formData.location.longitude
    ) {
      Alert.alert(
        "Validation Error",
        "Missing required fields: location[latitude] or location[longitude]"
      );
      return false;
    }

    if (
      formData.rating &&
      (isNaN(parseFloat(formData.rating)) ||
        parseFloat(formData.rating) < 0 ||
        parseFloat(formData.rating) > 5)
    ) {
      Alert.alert(
        "Validation Error",
        "Rating must be a number between 0 and 5"
      );
      return false;
    }

    const latitude = parseFloat(formData.location.latitude);
    const longitude = parseFloat(formData.location.longitude);
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      Alert.alert(
        "Validation Error",
        "Please provide valid latitude and longitude"
      );
      return false;
    }

    // Validate time slots
    for (let daySlot of formData.availableTimeSlots) {
      for (let slot of daySlot.slots) {
        if (
          !slot.time ||
          !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.time)
        ) {
          Alert.alert("Validation Error", "Time must be in HH:MM format");
          return false;
        }
        if (
          !slot.maxReservations ||
          isNaN(parseInt(slot.maxReservations)) ||
          parseInt(slot.maxReservations) < 1
        ) {
          Alert.alert(
            "Validation Error",
            "Max reservations must be a positive integer"
          );
          return false;
        }
      }
    }

    return true;
  };

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        cuisine: restaurant.cuisine || "",
        rating: restaurant.rating ? restaurant.rating.toString() : "",
        pricePerReservation: restaurant.pricePerReservation
          ? restaurant.pricePerReservation.toString()
          : "",
        dressCode: restaurant.dressCode || "",
        description: restaurant.description || "",
        menu:
          restaurant.menu && restaurant.menu.length > 0
            ? restaurant.menu
            : [{ name: "", imageUrl: "" }],
        photos: restaurant.photos || [], // Updated to photos
        location: {
          latitude: restaurant.location?.latitude
            ? restaurant.location.latitude.toString()
            : "",
          longitude: restaurant.location?.longitude
            ? restaurant.location.longitude.toString()
            : "",
        },
        availableTimeSlots:
          restaurant.availableTimeSlots &&
          restaurant.availableTimeSlots.length > 0
            ? restaurant.availableTimeSlots
            : [{ day: "Monday", slots: [{ time: "", maxReservations: "" }] }],
      });
    }
  }, [restaurant]);

  const handleLocationChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      location: {
        ...prevData.location,
        [field]: value,
      },
    }));
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots[dayIndex].slots[slotIndex][field] = value;
    setFormData((prevData) => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots,
    }));
  };

  const addTimeSlot = (dayIndex) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots[dayIndex].slots.push({ time: "", maxReservations: "" });
    setFormData((prevData) => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots,
    }));
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots[dayIndex].slots.splice(slotIndex, 1);
    setFormData((prevData) => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots,
    }));
  };

  const addDay = () => {
    setFormData((prevData) => ({
      ...prevData,
      availableTimeSlots: [
        ...prevData.availableTimeSlots,
        { day: "Monday", slots: [{ time: "", maxReservations: "" }] },
      ],
    }));
  };

  const removeDay = (dayIndex) => {
    const updatedTimeSlots = [...formData.availableTimeSlots];
    updatedTimeSlots.splice(dayIndex, 1);
    setFormData((prevData) => ({
      ...prevData,
      availableTimeSlots: updatedTimeSlots,
    }));
  };

  const handleChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMenuChange = (index, field, value) => {
    const updatedMenu = [...formData.menu];
    updatedMenu[index][field] = value;
    setFormData((prevData) => ({ ...prevData, menu: updatedMenu }));
  };

  const addMenuItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      menu: [...prevData.menu, { name: "", imageUrl: "" }],
    }));
  };

  const removeMenuItem = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      menu: prevData.menu.filter((_, i) => i !== index),
    }));
  };

  const handleAddPhoto = () => {
    setFormData((prevData) => ({
      ...prevData,
      photos: [...prevData.photos, ""],
    }));
  };

  const handlePhotoUrlChange = (index, value) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      photos: updatedPhotos,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      location: {
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude),
      },
      pricePerReservation: parseFloat(formData.pricePerReservation),
      rating: parseFloat(formData.rating),
      menu: formData.menu.filter((item) => item.name.trim() !== ""),
      photos: formData.photos.filter((url) => url.trim() !== ""),
      availableTimeSlots: formData.availableTimeSlots
        .filter((daySlot) => daySlot.day && daySlot.slots.length > 0)
        .map((daySlot) => ({
          day: daySlot.day,
          slots: daySlot.slots
            .filter(
              (slot) =>
                slot.time &&
                slot.time.trim() !== "" &&
                !isNaN(parseInt(slot.maxReservations))
            )
            .map((slot) => ({
              time: slot.time.trim(),
              maxReservations: parseInt(slot.maxReservations),
            })),
        })),
    };

    try {
      let response;
      if (restaurant) {
        // Update existing restaurant
        response = await axios.put(
          `https://reservationadminrn-pdla.onrender.com/api/restaurants/${restaurant._id}`,
          payload
        );
      } else {
        // Create new restaurant
        response = await axios.post(
          "https://reservationadminrn-pdla.onrender.com/api/restaurants",
          payload
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
        "Success",
        restaurant
          ? "Restaurant updated successfully"
          : "Restaurant added successfully"
      );
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to save restaurant. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleForm}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={toggleForm}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.header}>
              {restaurant ? "Edit Restaurant" : "Add a Restaurant"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Name *"
              value={formData.name}
              onChangeText={(value) => handleChange("name", value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Address *"
              value={formData.address}
              onChangeText={(value) => handleChange("address", value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={formData.phone}
              keyboardType="phone-pad"
              onChangeText={(value) => handleChange("phone", value)}
            />
            <Picker
              selectedValue={formData.cuisine}
              style={styles.input}
              onValueChange={(itemValue) => handleChange("cuisine", itemValue)}
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
              onChangeText={(value) => handleChange("rating", value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Price per Reservation"
              value={formData.pricePerReservation}
              keyboardType="numeric"
              onChangeText={(value) => handleChange("pricePerReservation", value)}
            />
            <Picker
              selectedValue={formData.dressCode}
              style={styles.input}
              onValueChange={(itemValue) => handleChange("dressCode", itemValue)}
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
              onChangeText={(value) => handleChange("description", value)}
            />

            <Text style={styles.subHeader}>Menu</Text>
            {formData.menu.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <TextInput
                  style={[styles.input, styles.menuInput]}
                  placeholder="Dish Name"
                  value={item.name}
                  onChangeText={(value) => handleMenuChange(index, "name", value)}
                />
                <TextInput
                  style={[styles.input, styles.menuInput]}
                  placeholder="Dish Image URL"
                  value={item.imageUrl}
                  onChangeText={(value) =>
                    handleMenuChange(index, "imageUrl", value)
                  }
                />
                {formData.menu.length > 1 && (
                  <TouchableOpacity onPress={() => removeMenuItem(index)}>
                    <Text style={styles.removeButton}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <Button title="Add Dish" onPress={addMenuItem} />

            <Text style={styles.subHeader}>Photos</Text>
            {formData.photos.map((photoUrl, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder="Photo URL"
                value={photoUrl}
                onChangeText={(value) => handlePhotoUrlChange(index, value)}
              />
            ))}
            <Button title="Add Photo URL" onPress={handleAddPhoto} />

            <Text style={styles.subHeader}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              value={formData.location.latitude}
              keyboardType="numeric"
              onChangeText={(value) => handleLocationChange("latitude", value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              value={formData.location.longitude}
              keyboardType="numeric"
              onChangeText={(value) => handleLocationChange("longitude", value)}
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
                    setFormData((prevData) => ({
                      ...prevData,
                      availableTimeSlots: updatedTimeSlots,
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
                      onChangeText={(value) =>
                        handleTimeSlotChange(dayIndex, slotIndex, "time", value)
                      }
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Max Reservations"
                      keyboardType="numeric"
                      value={slot.maxReservations}
                      onChangeText={(value) =>
                        handleTimeSlotChange(
                          dayIndex,
                          slotIndex,
                          "maxReservations",
                          value
                        )
                      }
                    />
                    {daySlot.slots.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeTimeSlot(dayIndex, slotIndex)}
                      >
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
            <Button title="Add Another Day" onPress={addDay} />

            <Button title="Submit" onPress={handleSubmit} />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
  },
  formContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#1e90ff",
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  textArea: {
    height: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "500",
    color: "#555",
    marginTop: 20,
    marginBottom: 10,
  },
  menuItem: {
    marginBottom: 15,
  },
  menuInput: {
    marginBottom: 8,
  },
  removeButton: {
    color: "#d9534f",
    textAlign: "center",
    fontWeight: "500",
  },
  daySlotContainer: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  slotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#fff",
  },
});

export default AddRestaurantForm;