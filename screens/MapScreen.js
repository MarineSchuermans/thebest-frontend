import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function MapScreen({ route, navigation }) {
    const user = useSelector((state) => state.user.value);
    const { restaurantLocation } = route.params || {};
    const [userLocation, setUserLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [parkings, setParkings] = useState([]);
    const mapRef = useRef(null);

    // Récupération des données des parkings
    const fetchParkings = async () => {
        try {
            // Remplace l'URL avec une source valide si nécessaire
            const response = await fetch(
                'https://data.lillemetropole.fr/geoserver/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=parking&outputFormat=application/json'
            );
            const data = await response.json();
            setParkings(data.features);
        } catch (error) {
            console.error('Erreur lors de la récupération des parkings:', error);
        }
    };

    // Gestion de la couleur des marqueurs de parkings
    const getParkingColor = (freeSpaces, totalSpaces) => {
        const percentage = (freeSpaces / totalSpaces) * 100;
        if (percentage <= 33) {
            return '#FF0000'; // Rouge : parking presque plein
        } else if (percentage <= 66) {
            return '#FFA500'; // Orange : parking moyennement occupé
        } else {
            return '#00FF00'; // Vert : parking peu occupé
        }
    };

    // Composant pour le marqueur de parking
    const ParkingMarker = ({ freeSpaces, totalSpaces }) => {
        const percentage = (freeSpaces / totalSpaces) * 100;
        const gaugeColor = getParkingColor(freeSpaces, totalSpaces);

        return (
            <View style={styles.parkingMarkerContainer}>
                <View style={styles.gaugeContainer}>
                    <View style={[styles.gauge, { width: `${percentage}%`, backgroundColor: gaugeColor }]} />
                </View>
            </View>
        );
    };

    // Gestion de l'itinéraire
    // const fetchRoute = async (origin, destination) => {
    //     const apiKey = 'SJvsfAsLwymsiRh9mxc5C4KbU4R3hN5aPj9fb3eiPrezkpl8z2cq5ukdqZzH026e';
    //     const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${apiKey}`;

    //     try {
    //         const response = await fetch(url);
    //         const data = await response.json();
    //         if (data.status === 'OK') {
    //             setRouteCoordinates([origin, destination]);
    //             Alert.alert('Distance', `La distance est de ${data.rows[0].elements[0].distance.text}`);
    //         } else {
    //             console.error('Erreur lors de la récupération de l’itinéraire');
    //         }
    //     } catch (error) {
    //         console.error('Erreur', error);
    //     }
    // };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission de localisation refusée');
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
            fetchParkings();
        })();
    }, [restaurantLocation]);

    const handleMarkerPress = (restaurant) => {
        setSelectedRestaurant(restaurant);
        if (userLocation) {
            fetchRoute(userLocation, { latitude: restaurant.latitude, longitude: restaurant.longitude });
        }
    };

    return (
        <View style={styles.container}>
            {mapRegion && (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={true}
                >
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="Votre position"
                            pinColor="#4285F4"
                        />
                    )}
                    {parkings && parkings.map((parking, index) => (
                        <Marker
                        coordinate={{
                                latitude: parking.properties.latitude,
                                longitude: parking.properties.longitude,
                            }}
                            image={require('../assets/favicon.png')}
                         title={parking.properties.nom}
                         description={`Places libres: ${parking.properties.nbr_libre}/${parking.properties.nbr_total}`}
                        >
                            <ParkingMarker
                                freeSpaces={parking.properties.nbr_libre}
                                totalSpaces={parking.properties.nbr_total}
                            />
                        </Marker>
                    ))}
                    <Marker
                        coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
                        image={require("../assets/favicon.png")}
                    >
                        <View style={{ height: 30, width: 30, position: "relative" }}>
                            <View style={{ position: "absolute", top: 35, width: 100 }}>
                                <Text>hahahahahah</Text>
                            </View>
                        </View>
                    </Marker>
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
    parkingMarkerContainer: {
        height: 30,
        width: 30,
        position: 'relative',
    },
    gaugeContainer: {
        width: 30,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 5,
        position: 'absolute',
    },
    gauge: {
        height: '100%',
    },
});