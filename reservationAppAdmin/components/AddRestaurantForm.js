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
import CloudinaryUploadPage from "../screens/RestaurantViewScreen";

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
          `${process.env.EXPO_PUBLIC_API_URL}/api/restaurants/${restaurant._id}`,
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
          `${process.env.EXPO_PUBLIC_API_URL}/api/restaurants`,
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
        <CloudinaryUploadPage/>

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