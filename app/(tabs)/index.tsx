import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import MapView from 'react-native-maps'; // Corrected import
import { Marker } from 'react-native-maps';

export default function HomeScreen() {
  const [region, setRegion] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    };

    getLocation();
  }, []);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!region) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <Text style={styles.webText}>Map is not supported on Web</Text>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomControlEnabled={true}
        >
          <Marker coordinate={region} />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
});
