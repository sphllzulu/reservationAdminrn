import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';

const ReservationManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);


  const fetchReservations = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reservations`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to fetch reservations'
      });
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchReservations();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusUpdate = async (reservationId, status, userEmail) => {
    if (updatingId) return;
    setUpdatingId(reservationId);
  
    try {
      const endpoint = status === 'Confirmed' ? 'confirm' : 'cancel';
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reservations/${reservationId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${status.toLowerCase()} reservation`);
      }
  
      const updatedReservation = await response.json();
      
      // Update local state with the response from the server
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res._id === reservationId
            ? { ...res, paymentStatus: status } // Changed from status to paymentStatus
            : res
        )
      );
  
      // Send email notification
      try {
        await MailComposer.composeAsync({
          recipients: [userEmail],
          subject: `Reservation ${status}`,
          body: `Your reservation has been ${status.toLowerCase()}.`,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
  
      showNotification('success', `Reservation ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error ${status.toLowerCase()} reservation:`, error);
      showNotification('error', error.message);
    } finally {
      setUpdatingId(null);
    }
  };
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return {
          bg: '#dcfce7',
          text: '#166534'
        };
      case 'Cancelled':
        return {
          bg: '#fee2e2',
          text: '#991b1b'
        };
      default:
        return {
          bg: '#fef9c3',
          text: '#854d0e'
        };
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleSearch = (searchQuery) => {
    setSearchQuery(searchQuery);
  };

  const filteredReservations = reservations.filter(res => {
    const restaurantId = res.restaurantId ? (typeof res.restaurantId === 'object' ? res.restaurantId._id : res.restaurantId) : null;
    return (
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.emailAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurantId && restaurantId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservation Management</Text>
        <Text style={styles.description}>View and manage restaurant reservations</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Customer Name or Email or Restaurant ID"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {notification && (
        <View style={[
          styles.notification,
          { backgroundColor: notification.type === 'error' ? '#fee2e2' : '#dcfce7' }
        ]}>
          <Text style={styles.notificationTitle}>
            {notification.type === 'error' ? 'Error' : 'Success'}
          </Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
      )}

      <ScrollView
        style={styles.cardContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredReservations.map((reservation) => (
          <View key={reservation._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Reservation Details</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(reservation.paymentStatus).bg }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(reservation.paymentStatus).text }
                ]}>
                  {formatStatus(reservation.paymentStatus)}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Customer Name:</Text> {reservation.customerName}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Email:</Text> {reservation.emailAddress}
              </Text>
              <Text style={styles.cardText}>
  <Text style={styles.label}>Restaurant ID:</Text> {reservation.restaurantId ? (typeof reservation.restaurantId === 'object' ? reservation.restaurantId._id : reservation.restaurantId) : 'N/A'}
</Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Date:</Text> {formatDate(reservation.date)}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Time:</Text> {reservation.time}
              </Text>
              <Text style={styles.cardText}>
                <Text style={styles.label}>Party Size:</Text> {reservation.partySize}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              {reservation.paymentStatus !== 'Confirmed' && (
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => handleStatusUpdate(reservation._id, 'Confirmed', reservation.emailAddress)}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              )}
              {reservation.paymentStatus !== 'Cancelled' && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => handleStatusUpdate(reservation._id, 'Cancelled', reservation.emailAddress)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {filteredReservations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reservations found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    margin:17,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchInput: {
    height: 40,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  notification: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#111',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  confirmButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#166534',
  },
  cancelButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#991b1b',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ReservationManager;