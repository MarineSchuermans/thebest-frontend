import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';

export default function MapScreen({ route, navigation }) {
    const user = useSelector((state) => state.user.value);
    const { restaurantLocation } = route.params || {};
    const [userLocation, setUserLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    // Récupérer les restaurants depuis la HomeScreen
    const restaurants = [
        {
            id: 1,
            title: "Le Gourmet",
            description: "Fine dining experience",
            rating: 4.5,
            image: [
                "https://www.aixenprovencetourism.com/wp-content/uploads/2013/07/ou_manger-1920x1080.jpg",
                "https://placeholder.com/150x100"
            ],
            phoneNumber: "123-456-7890",
            location: "123 Main St",
            latitude: 48.8566,
            longitude: 2.3522
        },
        {
            id: 2,
            title: "Saveurs d'Asie",
            description: 'Description duis aute irure dolor in reprehenderit in volup...',
            rating: 4.9,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33987654321',
            location: '456 Rue de la Concorde, Paris, France',
            latitude: 43.7102,
            longitude: 7.2620
        },
        {
            id: 3,
            title: 'Pizza Roma',
            description: 'Description duis aute irure dolor in reprehenderit in v...',
            rating: 4.9,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33987654321',
            location: '789 Rue de la Ferme, Paris, France',
            latitude: 45.7640,
            longitude: 4.8357
        },
        {
            id: 4,
            title: 'Le Bistrot',
            description: 'Description duis aute irure dolor in reprehenderit in v...',
            rating: 4.8,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33123456789',
            location: '123 Rue de la Paix, Paris, France',
            latitude : 44.8378,
            longitude : -0.5792
        },
        {
            id: 5,
            title: 'Sushi Master',
            description: 'Description duis aute irure dolor in reprehenderit in v...',
            rating: 4.0,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33123456789',
            location: '456 Rue de la Concorde, Paris, France',
            latitude: 48.3904,
            longitude: -4.4861
        }
    ];

    const fetchRoute = async (origin, destination) => {
      const apiKey = 'SJvsfAsLwymsiRh9mxc5C4KbU4R3hN5aPj9fb3eiPrezkpl8z2cq5ukdqZzH026e';
      const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${apiKey}`;

      try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.status === 'OK') {
              // Pour cet exemple, nous utilisons simplement une ligne droite entre les points
              // Dans une implémentation réelle, vous devriez utiliser les données de l'API pour tracer un itinéraire précis
              setRouteCoordinates([origin, destination]);
              Alert.alert('Distance', `La distance est de ${data.rows[0].elements[0].distance.text}`);
          } else {
              console.error('Erreur lors de la récupération');
          }
      } catch (error) {
          console.error('Erreur', error);
      }
  };

  useEffect(() => {
      (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              console.error('Permission to access location was denied');
              return;
          }

          let location = await Location.getCurrentPositionAsync({});
          setUserLocation(location.coords);

          if (restaurantLocation) {
              setSelectedRestaurant(restaurantLocation);
              fetchRoute(location.coords, restaurantLocation);
          }

          setMapRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
          });
      })();
  }, [restaurantLocation]);

  const handleMarkerPress = (restaurant) => {
      setSelectedRestaurant(restaurant);
      if (userLocation) {
          fetchRoute(userLocation, { latitude: restaurant.latitude, longitude: restaurant.longitude });
      }
  };

  const favoriteMarkers = user.favorites.map((data, i) => {
    return <Marker
    key={i}
    coordinate={{ latitude: data.latitude, longitude: data.longitude }}
    title={data.title}>
        <Image source={require('../assets/Icone_Favoris.png')} style={styles.favoriteMarker}/>
    </Marker>
  })

  return (
      <View style={styles.container}>
          {mapRegion && (
              <MapView
                  style={styles.map}
                  region={mapRegion}
              >
                  {userLocation && (
                      <Marker
                          coordinate={userLocation}
                          title="Votre position"
                          pinColor="#4285F4"
                      />
                  )}
                  {favoriteMarkers}
                  {restaurants.map((restaurant) => (
                      <Marker
                          key={restaurant.id}
                          coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
                          title={restaurant.title}
                          pinColor="#C44949"
                          onPress={() => handleMarkerPress(restaurant)}
                      />
                  ))}
                  {routeCoordinates.length > 0 && (
                      <Polyline
                          coordinates={routeCoordinates}
                          strokeColor="#000"
                          strokeWidth={2}
                      />
                  )}
              </MapView>
          )}
          <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
          >
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    favoriteMarker: {
        height: 60,
        width: 60
    },
    map: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: '#C44949',
        padding: 10,
        borderRadius: 30,
    },
});