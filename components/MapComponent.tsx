import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapComponent = () => {
  const [weather, setWeather] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const OPENWEATHERMAP_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?lat=${region.latitude}&lon=${region.longitude}&appid=${OPENWEATHERMAP_API_KEY}`
        );
        setWeather(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, [region]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsTraffic={true}
        onRegionChangeComplete={region => setRegion(region)}
      >
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title="Shipment Location"
          description="Current location of the shipment"
        />
      </MapView>
      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>Temperature: {weather.main.temp}°K</Text>
          <Text style={styles.weatherText}>Weather: {weather.weather[0].description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  weatherContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 16,
  },
});

export default MapComponent;
