import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reservation`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const renderLoading = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#1E88E5" />
    </View>
  );

  const renderError = () => (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderCharts = () => {
    const { totalRestaurants, totalUsers, reservationsPerRestaurant } = analyticsData;

    const lineChartData = {
      labels: reservationsPerRestaurant.map((item) => item.restaurantName),
      datasets: [
        {
          data: reservationsPerRestaurant.map((item) => item.totalReservations),
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Line color
          strokeWidth: 2, // Line thickness
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Analytics Dashboard</Text>

        <Text style={styles.subHeader}>Reservations Over Time</Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - 40}
          height={300}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Axis and label color
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 10 },
            propsForDots: {
              r: '5', // Dot radius
              strokeWidth: '2',
              stroke: '#1E88E5', // Dot border color
            },
          }}
          style={styles.chart}
          bezier // Smooth line
          fromZero // Start Y-axis from zero
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
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? renderLoading() : error ? renderError() : renderCharts()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    textAlign: 'center',
    marginHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 20,
    color: '#1E88E5',
    textAlign: 'center',

  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
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