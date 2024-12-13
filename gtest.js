import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, Image, StyleSheet, TouchableOpacity, 
    FlatList, Modal, TextInput, Platform, Dimensions, Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';

const BACKEND_ADDRESS = 'YOUR_BACKEND_URL';
const DISTANCE_MATRIX_API_KEY = 'SJvsfAsLwymsiRh9mxc5C4KbU4R3hN5aPj9fb3eiPrezkpl8z2cq5ukdqZzH026e';
const PARKING_DATA_URL = 'https://data.lillemetropole.fr/geoserver/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=parking&outputFormat=application/json';

export default function RestoScreen({ route }) {
    const { title, description, rating, image, location } = route.params;
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
    const [nearestParking, setNearestParking] = useState(null);
    const [distances, setDistances] = useState({
        toUser: null,
        toParking: null
    });
    const [parkings, setParkings] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        fetchUserLocation();
        fetchNearbyRestaurants();
        fetchParkings();
    }, []);

    useEffect(() => {
        if (userLocation && location) {
            calculateDistances();
        }
    }, [userLocation, parkings]);

    const fetchUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Location permission denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
    };

    const fetchNearbyRestaurants = async () => {
        try {
            const response = await fetch(`${BACKEND_ADDRESS}/findNearbyRestaurants`);
            const data = await response.json();
            setNearbyRestaurants(data);
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
        }
    };

    const fetchParkings = async () => {
        try {
            const response = await fetch(PARKING_DATA_URL);
            const data = await response.json();
            setParkings(data.features);
        } catch (error) {
            console.error('Erreur lors de la récupération des parkings:', error);
        }
    };

    const calculateDistances = async () => {
        // Distance to user
        const userDistanceResult = await fetchRouteDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: location.latitude, longitude: location.longitude }
        );

        // Find nearest parking
        const nearestParkingLocation = findNearestParking();
        const parkingDistanceResult = nearestParkingLocation 
            ? await fetchRouteDistance(
                { latitude: location.latitude, longitude: location.longitude },
                { latitude: nearestParkingLocation.latitude, longitude: nearestParkingLocation.longitude }
            )
            : null;

        setDistances({
            toUser: userDistanceResult,
            toParking: parkingDistanceResult
        });
        setNearestParking(nearestParkingLocation);
    };

    const fetchRouteDistance = async (origin, destination) => {
        const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${DISTANCE_MATRIX_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.status === 'OK' 
                ? data.rows[0].elements[0].distance.text 
                : null;
        } catch (error) {
            console.error('Distance calculation error:', error);
            return null;
        }
    };

    const findNearestParking = () => {
        if (!userLocation || !parkings.length) return null;

        const nearestParking = parkings.reduce((nearest, parking) => {
            const parkingCoords = {
                latitude: parking.geometry.coordinates[1],
                longitude: parking.geometry.coordinates[0]
            };

            const distance = calculateHaversineDistance(userLocation, parkingCoords);

            return (!nearest || distance < nearest.distance) 
                ? { ...parkingCoords, distance, details: parking.properties }
                : nearest;
        }, null);

        return nearestParking;
    };

    const calculateHaversineDistance = (point1, point2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = toRadians(point2.latitude - point1.latitude);
        const dLon = toRadians(point2.longitude - point1.longitude);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const toRadians = (degrees) => degrees * (Math.PI/180);

    const getParkingProximityColor = (distance) => {
        if (!distance) return 'gray';
        return distance < 0.5 ? 'green' : distance < 1 ? 'orange' : 'red';
    };

    const navigateToMap = () => {
        navigation.navigate('Map', {
            restaurants: [{ 
                id: title, 
                latitude: parseFloat(location.latitude), 
                longitude: parseFloat(location.longitude), 
                title, 
                description 
            }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <View>
                        {/* Existing image and details section */}
                        <View style={styles.mapPreview}>
                            <MapView
                                style={styles.map}
                                region={{
                                    latitude: parseFloat(location.latitude),
                                    longitude: parseFloat(location.longitude),
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                onPress={navigateToMap}
                            >
                                {/* Restaurant Marker */}
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(location.latitude),
                                        longitude: parseFloat(location.longitude),
                                    }}
                                    title={title}
                                />

                                {/* User Location Marker */}
                                {userLocation && (
                                    <Marker
                                        coordinate={{
                                            latitude: userLocation.latitude,
                                            longitude: userLocation.longitude,
                                        }}
                                        pinColor="#4285F4"
                                        title="Votre position"
                                    />
                                )}
                            </MapView>
                        </View>

                        {/* Distance Information */}
                        <View style={styles.distanceContainer}>
                            <Text style={styles.distanceText}>
                                Distance to you: {distances.toUser || 'Calculating...'}
                            </Text>
                            {nearestParking && (
                                <View style={styles.parkingDistanceContainer}>
                                    <Text style={styles.distanceText}>
                                        Distance to nearest parking:
                                    </Text>
                                    <Text 
                                        style={[
                                            styles.distanceText, 
                                            { 
                                                color: getParkingProximityColor(
                                                    parseFloat(distances.toParking)
                                                ) 
                                            }
                                        ]}
                                    >
                                        {distances.toParking || 'Calculating...'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    mapPreview: {
        height: 200,
        marginVertical: 10,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 11,
    },
    distanceContainer: {
        padding: 10,
        backgroundColor: '#F4F4F4',
    },
    distanceText: {
        fontSize: 14,
        marginBottom: 5,
    },
    parkingDistanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});