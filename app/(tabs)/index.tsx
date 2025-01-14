import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Button } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps'; // Ensure correct import for react-native-maps

// Icons for masjid and halal restaurant markers
const masjidIcon = require('./../../assets/small-masjid-icon.png'); // Add icon image to your assets
const halalRestaurantIcon = require('./../../assets/halal-restaurant-icon.png'); // Add icon image to your assets

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

  useEffect(() => {
    const getLocation = async () => {
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

    getLocation();
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
        {/* Marker's for user and locations */}
        <Marker coordinate={region}>
          <Text>You are here</Text>
        </Marker>

        {/* Example of showing Masjids */}
        {masjids.map((masjid, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: masjid.latitude,
              longitude: masjid.longitude,
            }}
            title={masjid.name}
            description="Masjid"
            image={masjidIcon} // Custom marker icon
          />
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
            description="Halal Restaurant"
            image={halalRestaurantIcon} // Custom marker icon
          />
        ))}

        {/* Circle to show the search radius */}
        <Circle
          center={region}
          radius={radius * 1609.34} // Convert miles to meters
          strokeColor="blue"
          fillColor="rgba(0, 0, 255, 0.1)"
        />
      </MapView>

      {/* Controls */}
      <Button title="Increase Radius" onPress={() => setRadius(radius + 5)} />
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
});
