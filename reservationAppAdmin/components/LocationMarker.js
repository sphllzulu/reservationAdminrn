// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// export default function LocationMap({ 
//   latitude = 40.7128, 
//   longitude = -74.0060 
// }) {
//   const initialRegion = {
//     latitude,
//     longitude,
//     latitudeDelta: 0.01,  
//     longitudeDelta: 0.01
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//       >
//         <Marker
//           coordinate={{ latitude, longitude }}
//           title="Current Location"
//           description={`Lat: ${latitude}, Lon: ${longitude}`}
//         >
          
//           <View style={styles.markerContainer}>
//             <View style={styles.markerDot} />
//           </View>
//         </Marker>
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   markerContainer: {
//     width: 50,
//     height: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent'
//   },
//   markerDot: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: 'blue',
//     borderWidth: 3,
//     borderColor: 'white'
//   }
// });

// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// export default function LocationMap({ 
//   latitude = 40.7128, 
//   longitude = -74.0060 
// }) {
//   const initialRegion = {
//     latitude,
//     longitude,
//     latitudeDelta: 0.01,  
//     longitudeDelta: 0.01
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.map}
//         initialRegion={initialRegion}
//       >
//         <Marker
//           coordinate={{ latitude, longitude }}
//           title="Current Location"
//           description={`Lat: ${latitude}, Lon: ${longitude}`}
//         >
//           <View style={styles.markerContainer}>
//             <View style={styles.markerDot} />
//           </View>
//         </Marker>
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     width: '100%', 
//     height: 200,   
//     borderRadius: 8,
//     overflow: 'hidden', 
//     marginTop: 16, 
//   },
//   map: {
//     flex: 1, 
//   },
//   markerContainer: {
//     width: 50,
//     height: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent'
//   },
//   markerDot: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: 'blue',
//     borderWidth: 3,
//     borderColor: 'white'
//   }
// });

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

export default function LocationMap({
  latitude = 40.7128,
  longitude = -74.0060,
  markerColor = 'blue',
  markerSize = 20,
  markerTitle = 'Current Location',
  markerDescription = `Lat: ${latitude}, Lon: ${longitude}`,
}) {
  const [markerPosition, setMarkerPosition] = React.useState({
    latitude,
    longitude,
  });

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Update marker position when latitude or longitude props change
  useEffect(() => {
    setMarkerPosition({ latitude, longitude });
  }, [latitude, longitude]);

  const resetMarker = () => {
    setMarkerPosition({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(e) => {
          setMarkerPosition(e.nativeEvent.coordinate);
        }}
        showsZoomControls={true}
      >
        <Marker
          coordinate={markerPosition}
          title={markerTitle}
          description={`Lat: ${markerPosition.latitude.toFixed(4)}, Lon: ${markerPosition.longitude.toFixed(4)}`}
          draggable
          onDragEnd={(e) => {
            setMarkerPosition(e.nativeEvent.coordinate);
          }}
        >
          <View style={styles.markerContainer}>
            <View
              style={[
                styles.markerDot,
                {
                  width: markerSize,
                  height: markerSize,
                  borderRadius: markerSize / 2,
                  backgroundColor: markerColor,
                },
              ]}
            />
          </View>
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{markerTitle}</Text>
              <Text style={styles.calloutDescription}>
                {`Lat: ${markerPosition.latitude.toFixed(4)}, Lon: ${markerPosition.longitude.toFixed(4)}`}
              </Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
      <Button title="Reset Marker" onPress={resetMarker} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    borderWidth: 3,
    borderColor: 'white',
  },
  calloutContainer: {
    width: 150,
    padding: 8,
    alignItems: 'center',
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
  },
});