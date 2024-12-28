// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
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
//     menu: [{ name: "", imageUrl: "" }],
//     photos: [], // Array of photo URLs
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
//             : [{ name: "", imageUrl: "" }],
//         photos: restaurant.photos || [], // Updated to photos
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
//       menu: [...prevData.menu, { name: "", imageUrl: "" }],
//     }));
//   };

//   const removeMenuItem = (index) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       menu: prevData.menu.filter((_, i) => i !== index),
//     }));
//   };

//   const handleAddPhoto = () => {
//     setFormData((prevData) => ({
//       ...prevData,
//       photos: [...prevData.photos, ""],
//     }));
//   };

//   const handlePhotoUrlChange = (index, value) => {
//     const updatedPhotos = [...formData.photos];
//     updatedPhotos[index] = value;
//     setFormData((prevData) => ({
//       ...prevData,
//       photos: updatedPhotos,
//     }));
//   };


//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }
  
//     const payload = {
//       name: formData.name || "",
//       address: formData.address || "",
//       phone: formData.phone || "",
//       cuisine: formData.cuisine || "",
//       description: formData.description || "",
//       pricePerReservation: parseFloat(formData.pricePerReservation) || 0,
//       rating: parseFloat(formData.rating) || 0,
//       dressCode: formData.dressCode || "",
//       location: {
//         latitude: parseFloat(formData.location.latitude) || 0,
//         longitude: parseFloat(formData.location.longitude) || 0,
//       },
//       menu: formData.menu
//         .filter((item) => item.name.trim() !== "" && item.imageUrl.trim() !== "") // Ensure both fields are present
//         .map((item) => ({
//           name: item.name,
//           imageUrl: item.imageUrl,
//         })),
//       photos: formData.photos.filter((url) => url.trim() !== ""), // Ensure photos is an array of non-empty strings
//       availableTimeSlots: formData.availableTimeSlots
//         .filter((daySlot) => daySlot.day && daySlot.slots.length > 0) // Ensure day and slots are present
//         .map((daySlot) => ({
//           day: daySlot.day,
//           slots: daySlot.slots
//             .filter(
//               (slot) =>
//                 slot.time &&
//                 slot.time.trim() !== "" &&
//                 !isNaN(parseInt(slot.maxReservations))
//             )
//             .map((slot) => ({
//               time: slot.time.trim(),
//               maxReservations: parseInt(slot.maxReservations),
//             })),
//         })),
//     };
  
//     console.log("Payload being sent:", JSON.stringify(payload, null, 2)); // Log the payload
  
//     try {
//       let response;
//       if (restaurant) {
//         // Update existing restaurant
//         response = await axios.put(
//           `http://192.168.18.15:3000/api/restaurants/${restaurant._id}`,
//           payload,
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//       } else {
//         // Create new restaurant
//         response = await axios.post(
//           `http://192.168.18.15:3000/api/restaurants`,
//           payload,
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//       }
  
//       console.log("Response from server:", response.data); // Log the response
  
//       if (fetchRestaurants) {
//         fetchRestaurants();
//       }
  
//       if (onClose) {
//         onClose();
//       }
  
//       Alert.alert(
//         "Success",
//         restaurant
//           ? "Restaurant updated successfully"
//           : "Restaurant added successfully"
//       );
//     } catch (error) {
//       console.error("Submission error:", error); // Log the error
//       console.error("Error response:", error.response?.data); // Log the error response
//       Alert.alert(
//         "Error",
//         error.response?.data?.message ||
//           "Failed to save restaurant. Please try again."
//       );
//     }
//   };
//   // const handleSubmit = async () => {
//   //   if (!validateForm()) {
//   //     return;
//   //   }
  
//   //   const payload = {
//   //     name: formData.name || "",
//   //     address: formData.address || "",
//   //     phone: formData.phone || "",
//   //     cuisine: formData.cuisine || "",
//   //     description: formData.description || "",
//   //     pricePerReservation: parseFloat(formData.pricePerReservation) || 0,
//   //     rating: parseFloat(formData.rating) || 0,
//   //     dressCode: formData.dressCode || "",
//   //     location: {
//   //       latitude: parseFloat(formData.location.latitude) || 0,
//   //       longitude: parseFloat(formData.location.longitude) || 0,
//   //     },
//   //     menu: formData.menu
//   //       .filter((item) => item.name.trim() !== "")
//   //       .map((item) => ({
//   //         name: item.name,
//   //         imageUrl: item.imageUrl,
//   //       })),
//   //     images: formData.images.filter((url) => url.trim() !== ""),
//   //     availableTimeSlots: formData.availableTimeSlots
//   //       .filter((daySlot) => daySlot.day && daySlot.slots.length > 0)
//   //       .map((daySlot) => ({
//   //         day: daySlot.day,
//   //         slots: daySlot.slots
//   //           .filter(
//   //             (slot) =>
//   //               slot.time &&
//   //               slot.time.trim() !== "" &&
//   //               !isNaN(parseInt(slot.maxReservations))
//   //           )
//   //           .map((slot) => ({
//   //             time: slot.time.trim(),
//   //             maxReservations: parseInt(slot.maxReservations),
//   //           })),
//   //       })),
//   //   };
  
//   //   console.log("Payload being sent:", JSON.stringify(payload, null, 2)); // Log the payload
  
//   //   try {
//   //     let response;
//   //     if (restaurant) {
//   //       // Update existing restaurant
//   //       response = await axios.put(
//   //         `https://reservationadminrn-1.onrender.com/api/restaurants/${restaurant._id}`,
//   //         payload,
//   //         {
//   //           headers: {
//   //             "Content-Type": "application/json",
//   //           },
//   //         }
//   //       );
//   //     } else {
//   //       // Create new restaurant
//   //       response = await axios.post(
//   //         `https://reservationadminrn-1.onrender.com/api/restaurants`,
//   //         payload,
//   //         {
//   //           headers: {
//   //             "Content-Type": "application/json",
//   //           },
//   //         }
//   //       );
//   //     }
  
//   //     console.log("Response from server:", response.data); // Log the response
  
//   //     if (fetchRestaurants) {
//   //       fetchRestaurants();
//   //     }
  
//   //     if (onClose) {
//   //       onClose();
//   //     }
  
//   //     Alert.alert(
//   //       "Success",
//   //       restaurant
//   //         ? "Restaurant updated successfully"
//   //         : "Restaurant added successfully"
//   //     );
//   //   } catch (error) {
//   //     console.error("Submission error:", error); // Log the error
//   //     console.error("Error response:", error.response?.data); // Log the error response
//   //     Alert.alert(
//   //       "Error",
//   //       error.response?.data?.message ||
//   //         "Failed to save restaurant. Please try again."
//   //     );
//   //   }
//   // };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.header}>
//           {restaurant ? "Edit Restaurant" : "Add a Restaurant"}
//         </Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Name *"
//           value={formData.name}
//           onChangeText={(value) => handleChange("name", value)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Address *"
//           value={formData.address}
//           onChangeText={(value) => handleChange("address", value)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Phone"
//           value={formData.phone}
//           keyboardType="phone-pad"
//           onChangeText={(value) => handleChange("phone", value)}
//         />
//         <Picker
//           selectedValue={formData.cuisine}
//           style={styles.input}
//           onValueChange={(itemValue) => handleChange("cuisine", itemValue)}
//         >
//           <Picker.Item label="Select Cuisine *" value="" />
//           {cuisines.map((cuisine, index) => (
//             <Picker.Item key={index} label={cuisine} value={cuisine} />
//           ))}
//         </Picker>
//         <TextInput
//           style={styles.input}
//           placeholder="Rating (0-5)"
//           value={formData.rating}
//           keyboardType="numeric"
//           onChangeText={(value) => handleChange("rating", value)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Price per Reservation"
//           value={formData.pricePerReservation}
//           keyboardType="numeric"
//           onChangeText={(value) => handleChange("pricePerReservation", value)}
//         />
//         <Picker
//           selectedValue={formData.dressCode}
//           style={styles.input}
//           onValueChange={(itemValue) => handleChange("dressCode", itemValue)}
//         >
//           <Picker.Item label="Select Dress Code" value="" />
//           {dressCodes.map((dressCode, index) => (
//             <Picker.Item key={index} label={dressCode} value={dressCode} />
//           ))}
//         </Picker>
//         <TextInput
//           style={styles.textArea}
//           placeholder="Description"
//           value={formData.description}
//           multiline
//           numberOfLines={4}
//           onChangeText={(value) => handleChange("description", value)}
//         />

//         <Text style={styles.subHeader}>Menu</Text>
//         {formData.menu.map((item, index) => (
//           <View key={index} style={styles.menuItem}>
//             <TextInput
//               style={[styles.input, styles.menuInput]}
//               placeholder="Dish Name"
//               value={item.name}
//               onChangeText={(value) => handleMenuChange(index, "name", value)}
//             />
//             <TextInput
//               style={[styles.input, styles.menuInput]}
//               placeholder="Dish Image URL"
//               value={item.imageUrl}
//               onChangeText={(value) =>
//                 handleMenuChange(index, "imageUrl", value)
//               }
//             />
//             {formData.menu.length > 1 && (
//               <TouchableOpacity onPress={() => removeMenuItem(index)}>
//                 <Text style={styles.removeButton}>Remove</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ))}
//         <Button title="Add Dish" onPress={addMenuItem} />

//         <Text style={styles.subHeader}>Photos</Text>
//         {formData.photos.map((photoUrl, index) => (
//           <TextInput
//             key={index}
//             style={styles.input}
//             placeholder="Photo URL"
//             value={photoUrl}
//             onChangeText={(value) => handlePhotoUrlChange(index, value)}
//           />
//         ))}
//         <Button title="Add Photo URL" onPress={handleAddPhoto} />

//         <Text style={styles.subHeader}>Location</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Latitude"
//           value={formData.location.latitude}
//           keyboardType="numeric"
//           onChangeText={(value) => handleLocationChange("latitude", value)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Longitude"
//           value={formData.location.longitude}
//           keyboardType="numeric"
//           onChangeText={(value) => handleLocationChange("longitude", value)}
//         />

//         <Text style={styles.subHeader}>Available Time Slots</Text>
//         {formData.availableTimeSlots.map((daySlot, dayIndex) => (
//           <View key={dayIndex} style={styles.daySlotContainer}>
//             <Picker
//               selectedValue={daySlot.day}
//               style={styles.input}
//               onValueChange={(itemValue) => {
//                 const updatedTimeSlots = [...formData.availableTimeSlots];
//                 updatedTimeSlots[dayIndex].day = itemValue;
//                 setFormData((prevData) => ({
//                   ...prevData,
//                   availableTimeSlots: updatedTimeSlots,
//                 }));
//               }}
//             >
//               <Picker.Item label="Select Day" value="" />
//               {daysOfWeek.map((day, index) => (
//                 <Picker.Item key={index} label={day} value={day} />
//               ))}
//             </Picker>
//             {daySlot.slots.map((slot, slotIndex) => (
//               <View key={slotIndex} style={styles.slotContainer}>
//                 <TextInput
//                   style={[styles.input, styles.halfInput]}
//                   placeholder="Time (HH:MM)"
//                   value={slot.time}
//                   onChangeText={(value) =>
//                     handleTimeSlotChange(dayIndex, slotIndex, "time", value)
//                   }
//                 />
//                 <TextInput
//                   style={[styles.input, styles.halfInput]}
//                   placeholder="Max Reservations"
//                   keyboardType="numeric"
//                   value={slot.maxReservations}
//                   onChangeText={(value) =>
//                     handleTimeSlotChange(
//                       dayIndex,
//                       slotIndex,
//                       "maxReservations",
//                       value
//                     )
//                   }
//                 />
//                 {daySlot.slots.length > 1 && (
//                   <TouchableOpacity
//                     onPress={() => removeTimeSlot(dayIndex, slotIndex)}
//                   >
//                     <Text style={styles.removeButton}>Remove</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}
//             <Button
//               title="Add Time Slot"
//               onPress={() => addTimeSlot(dayIndex)}
//             />
//             {formData.availableTimeSlots.length > 1 && (
//               <TouchableOpacity onPress={() => removeDay(dayIndex)}>
//                 <Text style={styles.removeButton}>Remove Day</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ))}
//         <Button title="Add Another Day" onPress={addDay} />

//         <Button title="Submit" onPress={handleSubmit} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 20,
//   },
//   formContainer: {
//     flex: 1,
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     right: 0,
//     backgroundColor: "#1e90ff",
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     shadowColor: "#000",
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
//   closeButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   closeButtonText: {
//     fontSize: 24,
//     color: "#fff",
//   },
// });

// export default AddRestaurantForm;


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";

const AddRestaurantForm = ({ fetchRestaurants, restaurant, onClose }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerReservation, setPricePerReservation] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [menu, setMenu] = useState([]);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const amenitiesOptions = [
    "WiFi",
    "Parking",
    "Outdoor Seating",
    "Delivery",
    "Takeout",
    "Wheelchair Accessible",
    "Vegetarian Options",
    "Vegan Options",
  ];

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setAddress(restaurant.address || "");
      setPhone(restaurant.phone || "");
      setCuisine(restaurant.cuisine || "");
      setDescription(restaurant.description || "");
      setPricePerReservation(restaurant.pricePerReservation?.toString() || "");
      setDressCode(restaurant.dressCode || "");
      setAmenities(restaurant.amenities || []);
      setPhotos(restaurant.photos || []);
      setMenu(
        restaurant.menu?.map((item) => ({
          name: item.name,
          image: item.image || "", // Changed from imageUrl to image
        })) || []
      
      );
      setLocation({
        latitude: restaurant.location?.latitude?.toString() || "",
        longitude: restaurant.location?.longitude?.toString() || "",
      });
      setAvailableTimeSlots(restaurant.availableTimeSlots || []);
    }
  }, [restaurant]);

  const handleAddPhoto = () => {
    setPhotos([...photos, ""]);
  };

  const handlePhotoUrlChange = (index, value) => {
    const updatedPhotos = [...photos];
    updatedPhotos[index] = value;
    setPhotos(updatedPhotos);
  };

  const handleAddMenuItem = () => {
    setMenu([...menu, { name: "", image: "" }]); // Changed from imageUrl to image
  };

  const handleMenuItemChange = (index, key, value) => {
    const updatedMenu = [...menu];
    updatedMenu[index][key] = value;
    setMenu(updatedMenu);
  };

  const handleAddTimeSlot = () => {
    setAvailableTimeSlots([
      ...availableTimeSlots,
      { day: "", slots: [{ time: "", maxReservations: "" }] },
    ]);
  };

  const handleTimeSlotChange = (index, key, value) => {
    const updatedSlots = [...availableTimeSlots];
    updatedSlots[index][key] = value;
    setAvailableTimeSlots(updatedSlots);
  };

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async () => {
    try {
      const restaurantData = {
        name,
        address,
        phone,
        cuisine,
        description,
        pricePerReservation: parseFloat(pricePerReservation),
        dressCode,
        amenities,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        },
        availableTimeSlots,
        photos: photos.filter((url) => url.trim() !== ""),
        menu: menu.map((item) => ({
          name: item.name,
          image: item.image, // Changed from imageUrl to image
        })),
      };

      console.log("Sending data:", restaurantData); // For debugging

      let response;
      if (restaurant) {
        // Update existing restaurant
        response = await axios.put(
          `http://192.168.18.15:3000/api/restaurants/${restaurant._id}`,
          restaurantData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Create new restaurant
        response = await axios.post(
          `http://192.168.18.15:3000/api/restaurants`,
          restaurantData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success",
          restaurant ? "Restaurant updated successfully!" : "Restaurant added successfully!"
        );
        if (fetchRestaurants) fetchRestaurants();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "An error occurred."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {restaurant ? "Edit Restaurant" : "Add Restaurant"}
      </Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Restaurant Name"
        value={name}
        onChangeText={setName}
      />

      {/* Address */}
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Cuisine */}
      <TextInput
        style={styles.input}
        placeholder="Cuisine Type (e.g., Italian, Indian)"
        value={cuisine}
        onChangeText={setCuisine}
      />

      {/* Description */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Price Per Reservation */}
      <TextInput
        style={styles.input}
        placeholder="Price Per Reservation (e.g., 50)"
        value={pricePerReservation}
        onChangeText={setPricePerReservation}
        keyboardType="numeric"
      />

      {/* Dress Code */}
      <TextInput
        style={styles.input}
        placeholder="Dress Code (e.g., Casual, Formal)"
        value={dressCode}
        onChangeText={setDressCode}
      />

      {/* Amenities */}
      <Text style={styles.sectionTitle}>Amenities</Text>
      {amenitiesOptions.map((amenity, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.amenityButton,
            amenities.includes(amenity) && styles.amenityButtonSelected,
          ]}
          onPress={() => toggleAmenity(amenity)}
        >
          <Text style={styles.amenityText}>{amenity}</Text>
        </TouchableOpacity>
      ))}
        <Text>To generate image urls please navigate to the image tab</Text>

      {/* Photos */}
      <Text style={styles.sectionTitle}>Add Photos</Text>
      {photos.map((photoUrl, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder="Photo URL"
          value={photoUrl}
          onChangeText={(value) => handlePhotoUrlChange(index, value)}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleAddPhoto}>
        <Text style={styles.buttonText}>Add Photo URL</Text>
      </TouchableOpacity>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Menu</Text>
      {menu.map((item, index) => (
        <View key={index} style={styles.menuItemContainer}>
          <TextInput
            style={styles.input}
            placeholder="Dish Name"
            value={item.name}
            onChangeText={(value) => handleMenuItemChange(index, "name", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Dish Image URL"
            value={item.image}
            onChangeText={(value) => handleMenuItemChange(index, "image", value)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleAddMenuItem}>
        <Text style={styles.buttonText}>Add Menu Item</Text>
      </TouchableOpacity>

      {/* Location */}
      <Text style={styles.sectionTitle}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={location.latitude}
        onChangeText={(value) => setLocation({ ...location, latitude: value })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={location.longitude}
        onChangeText={(value) => setLocation({ ...location, longitude: value })}
        keyboardType="numeric"
      />

      {/* Available Time Slots */}
      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      {availableTimeSlots.map((slot, index) => (
        <View key={index} style={styles.slotContainer}>
          <TextInput
            style={styles.input}
            placeholder="Day (e.g., Monday)"
            value={slot.day}
            onChangeText={(value) => handleTimeSlotChange(index, "day", value)}
          />
          {slot.slots.map((subSlot, subIndex) => (
            <View key={subIndex} style={styles.slotSubContainer}>
              <TextInput
                style={styles.input}
                placeholder="Time (e.g., 12:00 PM)"
                value={subSlot.time}
                onChangeText={(value) => {
                  const updatedSlots = [...slot.slots];
                  updatedSlots[subIndex].time = value;
                  handleTimeSlotChange(index, "slots", updatedSlots);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Max Reservations"
                value={subSlot.maxReservations}
                onChangeText={(value) => {
                  const updatedSlots = [...slot.slots];
                  updatedSlots[subIndex].maxReservations = value;
                  handleTimeSlotChange(index, "slots", updatedSlots);
                }}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleAddTimeSlot}>
        <Text style={styles.buttonText}>Add Time Slot</Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#495057",
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
    paddingBottom: 5,
    marginTop: 20,
  },
  menuItemContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    backgroundColor: "#fdfdfe",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  slotContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    backgroundColor: "#fdfdfe",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  slotSubContainer: {
    marginBottom: 10,
  },
  amenityButton: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  amenityButtonSelected: {
    backgroundColor: "#007BFF",
    borderColor: "#0056b3",
  },
  amenityText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AddRestaurantForm;