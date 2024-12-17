// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Modal,
//   Alert,
//   SafeAreaView,
// } from 'react-native';
// import axios from 'axios';
// import AddRestaurantForm from '../components/AddRestaurantForm'; 
// import { Ionicons } from '@expo/vector-icons';
// import LocationMap from '../components/LocationMarker';


// // Star Rating Component
// const StarRating = ({ rating }) => {
//   return (
//     <View style={styles.starContainer}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <Ionicons
//           key={star}
//           name={star <= rating ? 'star' : 'star-outline'}
//           size={20}
//           color={star <= rating ? '#FFD700' : '#CCCCCC'}
//         />
//       ))}
//     </View>
//   );
// };

// // Restaurant Details Modal
// const RestaurantDetailsModal = ({ 
//   restaurant, 
//   visible, 
//   onClose, 
//   onEdit, 
//   onDelete 
// }) => {
//   const [activeTab, setActiveTab] = useState('Menu');
//   if (!restaurant) return null;

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Ionicons name="close" size={24} color="black" />
//           </TouchableOpacity>
          
//           <Text style={styles.modalTitle}>{restaurant.name}</Text>
          
//           {restaurant.images && restaurant.images.length > 0 && (
//             <FlatList
//               horizontal
//               data={restaurant.images}
//               renderItem={({ item }) => (
//                 <Image 
//                   source={{ uri: `http://192.168.18.15:3000/${restaurant.images[0]}` }} 
//                   style={styles.modalImage} 
//                 />
//               )}
//               keyExtractor={(item, index) => index.toString()}
//             />
//           )}
          
//           <View style={styles.tabContainer}>
//             <TouchableOpacity
//               style={[styles.tabButton, activeTab === 'Menu' && styles.activeTab]}
//               onPress={() => setActiveTab('Menu')}
//             >
//               <Text style={[styles.tabButtonText, activeTab === 'Menu' && styles.activeTabText]}>Menu</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.tabButton, activeTab === 'Details' && styles.activeTab]}
//               onPress={() => setActiveTab('Details')}
//             >
//               <Text style={[styles.tabButtonText, activeTab === 'Details' && styles.activeTabText]}>Details</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.tabButton, activeTab === 'Reviews' && styles.activeTab]}
//               onPress={() => setActiveTab('Reviews')}
//             >
//               <Text style={[styles.tabButtonText, activeTab === 'Reviews' && styles.activeTabText]}>Reviews</Text>
//             </TouchableOpacity>
//           </View>

//           {activeTab === 'Menu' && (
//             <View>
//               <Text style={styles.menuTitle}>Menu:</Text>
//               <FlatList
//                 data={restaurant.menu}
//                 renderItem={({ item }) => (
//                   <View style={styles.menuItemContainer}>
//                     <Text style={styles.menuItemName}>{item.name}</Text>
//                     {item.image && (
//                       <Image 
//                         source={{ uri: item.image }} 
//                         style={styles.menuItemImage} 
//                       />
//                     )}
//                   </View>
//                 )}
//                 keyExtractor={(item, index) => index.toString()}
//               />
//             </View>
//           )}

//           {activeTab === 'Details' && (
//             <View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Address:</Text>
//                 <Text>{restaurant.address}</Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Phone:</Text>
//                 <Text>{restaurant.phone}</Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Cuisine:</Text>
//                 <Text>{restaurant.cuisine}</Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Rating:</Text>
//                 <StarRating rating={restaurant.rating} />
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Price:</Text>
//                 <Text>${restaurant.pricePerReservation}</Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Dress Code:</Text>
//                 <Text>{restaurant.dressCode}</Text>
//               </View>
              
//               <Text style={styles.descriptionTitle}>Description:</Text>
//               <Text style={styles.description}>{restaurant.description}</Text>
              
//               <Text style={styles.descriptionTitle}>Available Time Slots:</Text>
//     {restaurant.availableTimeSlots && restaurant.availableTimeSlots.map((daySlot, index) => (
//       <View key={index} style={styles.timeSlotContainer}>
      
//         {daySlot.slots.map((slot, slotIndex) => (
//           <View key={slotIndex} style={styles.timeSlotDetails}>
//             <Text>Time: {slot.time}</Text>
//             <Text>Max Reservations: {slot.maxReservations}</Text>
//           </View>
//         ))}
//       </View>
//     ))}
//     <LocationMap
//                   latitude={restaurant.latitude} 
//                   longitude={restaurant.longitude} 
//                   style={styles.modalMap}
//                 />
//             </View>
            
//           )}

//           {activeTab === 'Reviews' && (
//             <View>
//               {/* Add review content here */}
//               <Text>No reviews for now</Text>
//             </View>
//           )}
          
//           <View style={styles.modalButtonContainer}>
//             <TouchableOpacity 
//               style={[styles.modalButton, styles.editButton]} 
//               onPress={onEdit}
//             >
//               <Ionicons name="create" size={20} color="white" />
//               <Text style={styles.modalButtonText}>Edit</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.modalButton, styles.deleteButton]} 
//               onPress={onDelete}
//             >
//               <Ionicons name="trash" size={20} color="white" />
//               <Text style={styles.modalButtonText}>Delete</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // Main Restaurant Management Screen
// const RestaurantManagement = () => {
//   const [restaurants, setRestaurants] = useState([]);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);
//   const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);

//   const fetchRestaurants = async () => {
//     try {
//       const response = await axios.get('http://192.168.18.15:3000/api/restaurants');
//       setRestaurants(response.data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch restaurants');
//     }
//   };

//   const handleDeleteRestaurant = async (restaurantId) => {
//     try {
//       await axios.delete(`http://192.168.18.15:3000/api/restaurants/${restaurantId}`);
//       fetchRestaurants();
//       setIsDetailsModalVisible(false);
//       Alert.alert('Success', 'Restaurant deleted successfully');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to delete restaurant');
//     }
//   };

//   const confirmDelete = () => {
//     Alert.alert(
//       'Confirm Deletion',
//       `Are you sure you want to delete ${selectedRestaurant.name}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Delete', style: 'destructive', onPress: () => handleDeleteRestaurant(selectedRestaurant._id) }
//       ]
//     );
//   };

//   useEffect(() => {
//     fetchRestaurants();
//   }, []);

//   const renderRestaurantItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.restaurantItem}
//       onPress={() => {
//         setSelectedRestaurant(item);
//         setIsDetailsModalVisible(true);
//       }}
//     >
//       <View style={styles.restaurantItemContent}>
//         <Image 
//           source={{ uri: `http://192.168.18.15:3000/${item.images[0]}` }} 
//           style={styles.restaurantThumbnail} 
//         />
//         <View style={styles.restaurantDetails}>
//           <Text style={styles.restaurantName}>{item.name}</Text>
//           <Text>{item.cuisine}</Text>
//           <StarRating rating={item.rating} />
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Restaurant Management</Text>
//         {/* <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => setIsEditModalVisible(true)}
//         >
//           <Ionicons name="add" size={24} color="white" />
//         </TouchableOpacity> */}
//       </View>

//       <FlatList
//         data={restaurants}
//         renderItem={renderRestaurantItem}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={styles.listContainer}
//       />

//       <RestaurantDetailsModal
//         restaurant={selectedRestaurant}
//         visible={isDetailsModalVisible}
//         onClose={() => setIsDetailsModalVisible(false)}
//         onEdit={() => {
//           setIsDetailsModalVisible(false);
//           setIsEditModalVisible(true);
//         }}
//         onDelete={confirmDelete}
//       />

//       <Modal
//         visible={isEditModalVisible}
//         animationType="slide"
//         onRequestClose={() => setIsEditModalVisible(false)}
//       >
//         <AddRestaurantForm
//           fetchRestaurants={fetchRestaurants}
//           restaurant={selectedRestaurant}
//           onClose={() => {
//             setIsEditModalVisible(false);
//             setSelectedRestaurant(null);
//           }}
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#2C3E50',
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   addButton: {
//     backgroundColor: '#27AE60',
//     borderRadius: 25,
//     width: 50,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContainer: {
//     padding: 16,
//   },
//   restaurantItem: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     marginBottom: 16,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   restaurantItemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//   },
//   restaurantThumbnail: {
//     width: 100,
//     height: 100,
//     borderRadius: 10,
//     marginRight: 16,
//   },
//   restaurantName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   starContainer: {
//     flexDirection: 'row',
//     marginTop: 8,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '90%',
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '90%',
//   },
//   modalImage: {
//     width: 400,
//     height: 150,
//     borderRadius: 10,
//     marginRight: 10,
//     marginBottom: 16,
    
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//     alignItems: 'center',
//   },
//   detailLabel: {
//     fontWeight: 'bold',
//     marginRight: 8,
//     width: 120,
//   },
//   description: {
//     marginBottom: 16,
//     textAlign: 'justify',
//   },
//   descriptionTitle: {
//     fontWeight: 'bold',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   menuTitle: {
//     fontWeight: 'bold',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   menuItemContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//     padding: 8,
//     backgroundColor: '#F9F9F9',
//     borderRadius: 8,
//   },
//   menuItemName: {
//     flex: 1,
//     marginRight: 8,
//   },
//   menuItemImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//   },
//   modalButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   modalButton: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 8,
//     marginHorizontal: 8,
//   },
//   editButton: {
//     backgroundColor: '#2980B9',
//   },
//   deleteButton: {
//     backgroundColor: '#E74C3C',
//   },
//   modalButtonText: {
//     color: 'white',
//     marginLeft: 8,
//     fontWeight: 'bold',
    
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginVertical: 16,
//   },
//   tabButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   activeTab: {
//     backgroundColor: '#2C3E50',
//     borderColor: '#2C3E50',
//   },
//   tabButtonText: {
//     color: '#2C3E50',
//   },
//   activeTabText: {
//     color: 'white',
//   },
//   timeSlotContainer: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#F9F9F9',
//     borderRadius: 8,
//   },
//   timeSlotDay: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   timeSlotDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 5,
//     paddingHorizontal: 10,
//   },
// });

// export default RestaurantManagement;


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AddRestaurantForm from '../components/AddRestaurantForm'; 
import { Ionicons } from '@expo/vector-icons';
import LocationMap from '../components/LocationMarker';

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={20}
          color={star <= rating ? '#FFD700' : '#CCCCCC'}
        />
      ))}
    </View>
  );
};

// Restaurant Details Modal
const RestaurantDetailsModal = ({ 
  restaurant, 
  visible, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  const [activeTab, setActiveTab] = useState('Menu');
  if (!restaurant) return null;

  return (
  <SafeAreaView>
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>{restaurant.name}</Text>
          
          {restaurant.images && restaurant.images.length > 0 && (
            <FlatList
              horizontal
              data={restaurant.images}
              renderItem={({ item }) => (
                <Image 
                  source={{ uri: `http://192.168.0.104:3000/${restaurant.images[0]}` }} 
                  style={styles.modalImage} 
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
          
          <View horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Menu' && styles.activeTab]}
              onPress={() => setActiveTab('Menu')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'Menu' && styles.activeTabText]}>Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Details' && styles.activeTab]}
              onPress={() => setActiveTab('Details')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'Details' && styles.activeTabText]}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Reviews' && styles.activeTab]}
              onPress={() => setActiveTab('Reviews')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'Reviews' && styles.activeTabText]}>Reviews</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Menu' && (
            <View>
              <Text style={styles.menuTitle}>Menu:</Text>
              <FlatList
                data={restaurant.menu}
                renderItem={({ item }) => (
                  <View style={styles.menuItemContainer}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.image && (
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.menuItemImage} 
                      />
                    )}
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          )}

          {activeTab === 'Details' && (
            <ScrollView>
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text>{restaurant.address}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text>{restaurant.phone}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cuisine:</Text>
                  <Text>{restaurant.cuisine}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rating:</Text>
                  <StarRating rating={restaurant.rating} />
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text>${restaurant.pricePerReservation}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dress Code:</Text>
                  <Text>{restaurant.dressCode}</Text>
                </View>
                
                <Text style={styles.descriptionTitle}>Description:</Text>
                <Text style={styles.description}>{restaurant.description}</Text>
                
                <Text style={styles.descriptionTitle}>Available Time Slots:</Text>
                {restaurant.availableTimeSlots && restaurant.availableTimeSlots.map((daySlot, index) => (
                  <View key={index} style={styles.timeSlotContainer}>
                    {daySlot.slots.map((slot, slotIndex) => (
                      <View key={slotIndex} style={styles.timeSlotDetails}>
                        <Text>Time: {slot.time}</Text>
                        <Text>Max Reservations: {slot.maxReservations}</Text>
                      </View>
                    ))}
                  </View>
                ))}
                <LocationMap
                  latitude={restaurant.latitude} 
                  longitude={restaurant.longitude} 
                  style={styles.modalMap}
                />
              </View>
            </ScrollView>
          )}

          {activeTab === 'Reviews' && (
            <View>
              {/* Add review content here */}
              <Text>No reviews for now</Text>
            </View>
          )}
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.editButton]} 
              onPress={onEdit}
            >
              <Ionicons name="create" size={20} color="white" />
              <Text style={styles.modalButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteButton]} 
              onPress={onDelete}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.modalButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      
    </Modal>
    </SafeAreaView>
  );
};

// Main Restaurant Management Screen
const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://192.168.0.104:3000/api/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch restaurants');
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    try {
      await axios.delete(`http://192.168.0.104:3000/api/restaurants/${restaurantId}`);
      fetchRestaurants();
      setIsDetailsModalVisible(false);
      Alert.alert('Success', 'Restaurant deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete restaurant');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedRestaurant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteRestaurant(selectedRestaurant._id) }
      ]
    );
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.restaurantItem}
      onPress={() => {
        setSelectedRestaurant(item);
        setIsDetailsModalVisible(true);
      }}
    >
      <View style={styles.restaurantItemContent}>
        <Image 
          source={{ uri: `http://192.168.0.104:3000/${item.images[0]}` }} 
          style={styles.restaurantThumbnail} 
        />
        <View style={styles.restaurantDetails}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text>{item.cuisine}</Text>
          <StarRating rating={item.rating} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant Management</Text>
        {/* <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsEditModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />

      <RestaurantDetailsModal
        restaurant={selectedRestaurant}
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        onEdit={() => {
          setIsDetailsModalVisible(false);
          setIsEditModalVisible(true);
        }}
        onDelete={confirmDelete}
      />

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <AddRestaurantForm
          fetchRestaurants={fetchRestaurants}
          restaurant={selectedRestaurant}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedRestaurant(null);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C3E50',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#27AE60',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  restaurantItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  restaurantItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  restaurantThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalImage: {
    width: 400,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 16,
    
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 120,
  },
  description: {
    marginBottom: 16,
    textAlign: 'justify',
  },
  descriptionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  menuTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  menuItemName: {
    flex: 1,
    marginRight: 8,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#2980B9',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  modalButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  tabButtonText: {
    color: '#2C3E50',
  },
  activeTabText: {
    color: 'white',
  },
  timeSlotContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  timeSlotDay: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  timeSlotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  modalMap: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default RestaurantManagement;