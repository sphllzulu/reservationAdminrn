import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://192.168.0.104:3000/analytics');
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
        <ActivityIndicator size="large" color="#007bff" />
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
      color: '#007bff',
      legendFontColor: '#007bff',
      legendFontSize: 12,
    },
    {
      name: 'Users',
      population: totalUsers,
      color: '#28a745',
      legendFontColor: '#28a745',
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Analytics</Text>

      <Text style={styles.subHeader}>Reservations Per Restaurant</Text>
      <BarChart
        data={barChartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
        verticalLabelRotation={30}
      />

      <Text style={styles.subHeader}>Overview</Text>
      <PieChart
        data={pieChartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default AnalyticsScreen;
