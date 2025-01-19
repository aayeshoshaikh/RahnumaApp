import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';

const masjidIcon = require('./../../assets/small-masjid-icon.png'); // Ensure the icon path is correct

export default function HomeScreen() {
  const [region, setRegion] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [masjids, setMasjids] = useState<any[]>([]);
  const [radius, setRadius] = useState<number>(10);

  const fetchLocations = async (latitude: number, longitude: number, radiusInMiles: number) => {
    try {
      const response = await fetch(
        `http://192.168.12.206:8080/api/fetchMasjids?latitude=${latitude}&longitude=${longitude}&radiusInMiles=${radiusInMiles}`
      );
  
      if (!response.ok) {
        throw new Error(`Error fetching masjids: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Fetched masjids:', data); 
      setMasjids(data || []); // Assuming the response is an array of masjids
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
      console.error(errorMessage);
    }
  };
  

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    fetchLocations(latitude, longitude, radius);
  };

  useEffect(() => {
    if (region) {
      fetchLocations(region.latitude, region.longitude, radius);
    } else {
      getCurrentLocation();
    }
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
        <Circle
          center={region}
          radius={radius * 1609.34} // Convert miles to meters
          strokeColor="blue"
          fillColor="rgba(0, 0, 255, 0.1)"
        />

        {masjids.map((masjid, index) => (
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

      <View style={styles.header}>
        <Button title="Locate me" onPress={getCurrentLocation} />
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
    zIndex: 10,
  },
});
