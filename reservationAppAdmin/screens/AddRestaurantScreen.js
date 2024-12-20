import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";

const AddRestaurantScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerReservation, setPricePerReservation] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [menu, setMenu] = useState([]);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Function to compress an image
  const compressImage = async (uri) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize the image to a maximum width of 800px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress the image to 70% quality
    );
    return result;
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const compressedImage = await compressImage(result.assets[0].uri);
      setImages([...images, compressedImage.uri]);
    }
  };

  const handleAddMenuItem = () => {
    setMenu([...menu, { name: "", image: null }]);
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

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Append text fields
    formData.append("name", name);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("cuisine", cuisine);
    formData.append("description", description);
    formData.append("pricePerReservation", parseFloat(pricePerReservation));
    formData.append("dressCode", dressCode);
    formData.append("amenities", JSON.stringify(amenities));
    formData.append("location", JSON.stringify(location));
    formData.append("availableTimeSlots", JSON.stringify(availableTimeSlots));

    // Append restaurant images
    for (let i = 0; i < images.length; i++) {
      const imageUri = images[i];
      const compressedImage = await compressImage(imageUri);
      formData.append("images", {
        uri: compressedImage.uri,
        name: `restaurant_image_${i}.jpg`,
        type: "image/jpeg",
      });
    }

    // Append menu items
    menu.forEach((item, index) => {
      formData.append(`menu[${index}][name]`, item.name);
      if (item.image) {
        compressImage(item.image).then((compressedImage) => {
          formData.append(`menu[${index}][image]`, {
            uri: compressedImage.uri,
            name: `menu_image_${index}.jpg`,
            type: "image/jpeg",
          });
        });
      }
    });

    try {
      const response = await axios.post(
        "http://192.168.0.104:3000/api/restaurants", // Replace with your backend URL
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Restaurant added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to add restaurant.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Restaurant</Text>

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
        onChangeText={(value) => setPricePerReservation(value)}
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

      {/* Images */}
      <TouchableOpacity style={styles.button} onPress={handleAddImage}>
        <Text style={styles.buttonText}>Add Restaurant Images</Text>
      </TouchableOpacity>
      {images.map((image, index) => (
        <Text key={index} style={styles.infoText}>
          Image {index + 1} added
        </Text>
      ))}

      {/* Menu */}
      <Text style={styles.sectionTitle}>Menu</Text>
      {menu.map((item, index) => (
        <View key={index} style={styles.menuItemContainer}>
          <TextInput
            style={styles.input}
            placeholder="Menu Item Name"
            value={item.name}
            onChangeText={(value) => handleMenuItemChange(index, "name", value)}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
              });
              if (!result.canceled) {
                const compressedImage = await compressImage(result.assets[0].uri);
                handleMenuItemChange(index, "image", compressedImage.uri);
              }
            }}
          >
            <Text style={styles.buttonText}>Add Menu Item Image</Text>
          </TouchableOpacity>
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
  infoText: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 10,
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

export default AddRestaurantScreen;