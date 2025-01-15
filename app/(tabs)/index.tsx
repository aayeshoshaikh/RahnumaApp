import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps'; // Ensure correct import for react-native-maps

// Adjust the custom icon with appropriate size
const masjidIcon = require('./../../assets/small-masjid-icon.png'); // Ensure the icon path is correct
const halalRestaurantIcon = require('./../../assets/halal-restaurant-icon.png'); // Ensure the icon path is correct

export default function HomeScreen() {
  const [region, setRegion] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [masjids, setMasjids] = useState<any[]>([]); // Example placeholder for masjids
  const [restaurants, setRestaurants] = useState<any[]>([]); // Example placeholder for restaurants
  const [radius, setRadius] = useState<number>(10); // Default radius for search

  // Function to fetch masjids and restaurants
  const fetchLocations = async (latitude: number, longitude: number, radiusInMiles: number) => {
    // Replace this with your API calls or mock data
    setMasjids([{ name: 'Masjid Al-Noor', latitude: 42.3611, longitude: -71.0575 }]); // Example data
    setRestaurants([{ name: 'Halal Restaurant A', latitude: 42.3621, longitude: -71.0585 }]); // Example data
  };

  // Function to get the current location
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    fetchLocations(location.coords.latitude, location.coords.longitude, radius);
  };

  useEffect(() => {
    getCurrentLocation();
  }, [radius]);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!region) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomControlEnabled={true}
      >
        {/* Marker for the user's current location */}
        <Marker coordinate={region}>
          <Text>You are here</Text>
        </Marker>
        <Circle center={region} radius={500} fillColor="blue" />

        {/* Example of showing Masjids */}
        {masjids.map((masjid, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: masjid.latitude,
              longitude: masjid.longitude,
            }}
            title={masjid.name}
            description="Masjid">
            <View style={{ width: 45, height: 45 }}>
    <Image
      source={masjidIcon}
      style={{ width: '100%', height: '100%' }}
    />
  </View>
              
              </Marker>
        ))}

        {/* Example of showing Halal Restaurants */}
        {restaurants.map((restaurant, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
            title={restaurant.name}
            description="Halal Restaurant">
                 <View style={{ width: 45, height: 45 }}>
    <Image
      source={halalRestaurantIcon}
      style={{ width: '100%', height: '100%' }}
    />
  </View>
            </Marker>
        ))}

        {/* Circle to show the search radius */}
        <Circle
          center={region}
          radius={radius * 1609.34} // Convert miles to meters
          strokeColor="blue"
          fillColor="rgba(0, 0, 255, 0.1)"
        />
      </MapView>

      {/* Header with Locate Me Button */}
      <View style={styles.header}>
        <Button title="Locate me" onPress={getCurrentLocation} />
      </View>

      {/* Controls */}
      <Button title="Increase Radiu" onPress={() => setRadius(radius + 5)} />
      <Button title="Decrease Radius" onPress={() => setRadius(radius - 5)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '80%',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
  },
});
