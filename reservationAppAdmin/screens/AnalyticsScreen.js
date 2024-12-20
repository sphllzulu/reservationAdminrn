import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('https://reservationadminrn-pdla.onrender.com/reservation');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load analytics data.</Text>
      </View>
    );
  }

  const { totalRestaurants, totalUsers, reservationsPerRestaurant } = analyticsData;

  const barChartData = {
    labels: reservationsPerRestaurant.map((item) => item.restaurantName),
    datasets: [
      {
        data: reservationsPerRestaurant.map((item) => item.totalReservations),
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Restaurants',
      population: totalRestaurants,
      color: '#42A5F5',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Users',
      population: totalUsers,
      color: '#66BB6A',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Analytics</Text>

      <Text style={styles.subHeader}>Reservations Per Restaurant</Text>
      <BarChart
        data={barChartData}
        width={screenWidth - 40}
        height={250}
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 10 },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#1E88E5',
          },
        }}
        style={styles.chart}
        verticalLabelRotation={30}
      />

      <Text style={styles.subHeader}>Overview</Text>
      <PieChart
        data={pieChartData}
        width={screenWidth - 40}
        height={250}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E88E5',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    marginVertical: 15,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default AnalyticsScreen;
