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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';


const ReservationManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`http://192.168.0.104:3000/reservations`);
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

  const handleApprove = async (reservationId) => {
    try {
      // API call would go here
      // await approveReservation(reservationId);
      
      setReservations(reservations.map(res => 
        res._id === reservationId 
          ? { ...res, status: 'approved' }
          : res
      ));
      
      setNotification({
        type: 'success',
        message: 'Reservation approved successfully'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to approve reservation'
      });
    }
  };

  const handleCancel = async (reservationId) => {
    try {
      // API call would go here
      // await cancelReservation(reservationId);
      
      setReservations(reservations.map(res => 
        res._id === reservationId 
          ? { ...res, status: 'cancelled' }
          : res
      ));
      
      setNotification({
        type: 'success',
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to cancel reservation'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return {
          bg: '#dcfce7',
          text: '#166534'
        };
      case 'cancelled':
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

  const getDisplayName = (object) => {
    if (!object) return 'N/A';
    return object.name || 'N/A';
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
        style={styles.tableContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.restaurantCell]}>Restaurant</Text>
          <Text style={[styles.headerCell, styles.customerCell]}>Customer</Text>
          <Text style={[styles.headerCell, styles.dateTimeCell]}>Date & Time</Text>
          <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
          <Text style={[styles.headerCell, styles.actionsCell]}>Actions</Text>
        </View>

        {reservations.map((reservation) => (
          <View key={reservation._id} style={styles.tableRow}>
            <View style={[styles.cell, styles.restaurantCell]}>
              <Text style={styles.cellText}>
                {getDisplayName(reservation.restaurantId)}
              </Text>
            </View>
            
            <View style={[styles.cell, styles.customerCell]}>
              <Text style={styles.cellText}>
                {getDisplayName(reservation.userId)}
              </Text>
            </View>
            
            <View style={[styles.cell, styles.dateTimeCell]}>
              <View style={styles.dateTimeInfo}>
                <View style={styles.dateContainer}>
                  <FontAwesome5 name="calendar" size={16} color="#666" />
                  <Text style={styles.cellText}>
                    {reservation.date ? formatDate(reservation.date) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.timeContainer}>
                  <FontAwesome5 name="clock" size={16} color="#666" />
                  <Text style={styles.cellText}>
                    {reservation.time || 'N/A'}
                  </Text>
                </View>
                <View style={styles.partySizeContainer}>
                  <FontAwesome5 name="users" size={16} color="#666" />
                  <Text style={styles.cellText}>
                    {reservation.partySize || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.cell, styles.statusCell]}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(reservation.status).bg }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(reservation.status).text }
                ]}>
                  {formatStatus(reservation.status)}
                </Text>
              </View>
            </View>

            <View style={[styles.cell, styles.actionsCell]}>
              {(!reservation.status || reservation.status === 'pending') && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleApprove(reservation._id)}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => handleCancel(reservation._id)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}

        {reservations.length === 0 && (
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
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cell: {
    justifyContent: 'center',
  },
  restaurantCell: {
    flex: 2,
  },
  customerCell: {
    flex: 2,
  },
  dateTimeCell: {
    flex: 3,
  },
  dateTimeInfo: {
    gap: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCell: {
    flex: 1.5,
  },
  actionsCell: {
    flex: 2,
  },
  cellText: {
    fontSize: 14,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#166534',
  },
  approveButtonText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#991b1b',
  },
  cancelButtonText: {
    color: '#991b1b',
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