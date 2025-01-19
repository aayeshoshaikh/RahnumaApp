import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, Switch, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';

const masjidIcon = require('./../../assets/small-masjid-icon.png'); // Ensure the icon path is correct

export default function HomeScreen() {
  const [region, setRegion] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [masjids, setMasjids] = useState<any[]>([]);
  const [radius, setRadius] = useState<number>(10);
  const [showMasjids, setShowMasjids] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLocations = async (latitude: number, longitude: number, radiusInMiles: number) => {
    try {
      console.log(`Fetching masjids: lat=${latitude}, long=${longitude}, radius=${radiusInMiles}`);
      const response = await fetch(
        `http://192.168.12.206:8080/api/fetchMasjids?latitude=${latitude}&longitude=${longitude}&radiusInMiles=${radiusInMiles}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching masjids: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched masjids:', data);
      setMasjids(data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const updatedRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      console.log('Setting region:', updatedRegion);
      setRegion(updatedRegion);
      await fetchLocations(latitude, longitude, radius); // Fetch masjids after setting region
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Failed to fetch location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial load: fetching location');
    getCurrentLocation(); // Fetch location and masjids on initial load
  }, []);

  useEffect(() => {
    if (region) {
      console.log('Region updated, refetching masjids...');
      fetchLocations(region.latitude, region.longitude, radius); // Fetch masjids whenever region or radius changes
    }
  }, [radius, region]);

  const handleShowMasjidsToggle = () => {
    setShowMasjids((prev) => !prev);

    if (!showMasjids) {
      // Re-center the map and fetch masjids when re-enabling
      console.log('Re-enabling masjid markers');
      getCurrentLocation();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
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
        <Circle
          center={region}
          radius={radius * 1609.34} // Convert miles to meters
          strokeColor="blue"
          fillColor="rgba(0, 0, 255, 0.1)"
        />

        {showMasjids &&
          masjids.map((masjid, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: masjid.latitude,
                longitude: masjid.longitude,
              }}
              title={masjid.name}
              description={`${masjid.address}, ${masjid.city}, ${masjid.state}`}
            >
              <View style={{ width: 45, height: 45 }}>
                <Image
                  source={masjidIcon}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Header Section */}
      <View style={styles.header}>
        <Button title="Locate me" onPress={getCurrentLocation} />
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Show Masjids</Text>
          <Switch
            value={showMasjids}
            onValueChange={handleShowMasjidsToggle}
          />
        </View>
      </View>
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
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    marginRight: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
