import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
                // Mode navigation vers un restaurant spécifique
                setMapRegion({
                    latitude: (location.coords.latitude + restaurantLocation.latitude) / 2,
                    longitude: (location.coords.longitude + restaurantLocation.longitude) / 2,
                    latitudeDelta: Math.abs(location.coords.latitude - restaurantLocation.latitude) * 2,
                    longitudeDelta: Math.abs(location.coords.longitude - restaurantLocation.longitude) * 2,
                });
                setRouteCoordinates([
                    { latitude: location.coords.latitude, longitude: location.coords.longitude },
                    restaurantLocation
                ]);
            } else {
                // Mode affichage de tous les restaurants
                setMapRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        })();
    }, [restaurantLocation]);

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
                    {restaurantLocation ? (
                        <>
                            <Marker
                                coordinate={restaurantLocation}
                                title="Restaurant"
                                pinColor="#C44949"
                            />
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeColor="#000"
                                strokeWidth={2}
                            />
                        </>
                    ) : (
                        restaurants.map((restaurant) => (
                            <Marker
                                key={restaurant.id}
                                coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
                                title={restaurant.title}
                                pinColor="#C44949"
                            />
                        ))
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