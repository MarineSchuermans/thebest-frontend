import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';

// Composant principal de l'écran de la carte
export default function MapScreen({ route, navigation }) {
    // Sélectionne l'utilisateur depuis le store Redux
    const user = useSelector((state) => state.user.value);
    // Sélectionne les restaurants depuis le store Redux
    const resto = useSelector((state) => state.resto.value);
    // Sélectionne les restaurants filtrés depuis le store Redux
    const restoFiltre = useSelector((state) => state.restoFiltred.value);
    // État pour stocker la localisation de l'utilisateur
    const [userLocation, setUserLocation] = useState(null);
    // État pour stocker la région de la carte
    const [mapRegion, setMapRegion] = useState(null);
    // État pour stocker le restaurant sélectionné
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    // État pour stocker les parkings
    const [parkings, setParkings] = useState([]);
    // Référence pour la carte
    const mapRef = useRef(null);
    // État pour indiquer si la carte est prête
    const [isMapReady, setIsMapReady] = useState(false);

    // Variable pour vérifier si l'utilisateur est connecté
    let isConnected = false;
    if (user.token?.length > 0) {
        isConnected = true;
    }

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

// Composant pour afficher un marqueur de parking sur la carte
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

    // Création des marqueurs pour les restaurants filtrés
const favoritesOrNotMarkers = restoFiltre.map((data, i) => {
    // Vérifie si le restaurant est dans les favoris
    const isItFavorite = resto?.some(place => place.id === data.place_id);
    // Trouve les données du restaurant favori
    const dataFavorite = resto.find(place => place.id === data.place_id);

    // Si l'utilisateur n'est pas connecté ou si le restaurant n'est pas favori
    if (isConnected === false || isItFavorite === false) {
        return (
            <Marker key={i}
                coordinate={{ latitude: data.address.coordinates[1], longitude: data.address.coordinates[0] }}
                title={data.title}
                description={`Rating: ${data.rating}`}
                onPress={() => handleMarkerPress(data)}
                onCalloutPress={() => handleTextePress(data)}>
                <View style={styles.restaurantMarker}>
                    <Image source={require('../assets/IMG_0029.png')} style={{ width: 70, height: 70 }} />
                </View>
            </Marker>
        );
    } 
    // Si le restaurant est favori
    else if (isItFavorite) {
        return (
            <Marker key={i}
                coordinate={{ latitude: dataFavorite.location.coordinates[1], longitude: dataFavorite.location.coordinates[0] }}
                title={dataFavorite.name}
                description={`Rating: ${resto.rating}`}
                onPress={() => handleMarkerPress(data)}
                onCalloutPress={() => handleTextePress(data)}>
                <View style={styles.restaurantMarker}>
                    <Image
                        source={require('../assets/Icone_Favoris.png')}
                        style={{ width: 50, height: 50 }} />
                </View>
            </Marker>
        );
    }   
});

    // Recuperation des infos via le reduccer resto pour afficher les markers Favoris sur la Map
    const favoriteMarkers = resto.map((data, i) => {
        return (
            <Marker key={i}
                coordinate={{ latitude: data.location.coordinates[1], longitude: data.location.coordinates[0] }}
                title={data.name}
                description={`Rating: ${data.rating}`}
                onPress={() => handleMarkerPress(data)}
                onCalloutPress={() => handleTextePress({
                    title: data.name,
                    place_id: data.id,
                    description: data.reviews[0]?.text || "Description non disponible",
                    rating: data.rating,
                    reviews: data.reviews,
                    image: data.photo, 
                    phoneNumber: data.phoneNumber,
                    location: data.address,
                    address: data.location,
                    openingHours: data.openingHours
                })}>
                <View style={styles.restaurantMarker}>
                    <Image
                        source={require('../assets/Icone_Favoris.png')}
                        style={{ width: 50, height: 50 }} />
                </View>
            </Marker>
        )
    })

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission de localisation refusée');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);

            setMapRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });

            await fetchParkings();
            fetchRestaurants();
        })();
    }, []);

// Fonction pour centrer la carte sur un restaurant spécifique
const centerMapOnRestaurant = (restaurant) => {
    setTimeout(() => {
        if (mapRef.current && restaurant) {
            let latitude, longitude;

            console.log(restaurant.address.coordinates);

            if (restaurant.location && restaurant.address.coordinates) {
                // Format pour les restaurants de la liste initiale
                [longitude, latitude] = restaurant.address.coordinates;
            } else if (restaurant.location && restaurant.location.latitude && restaurant.location.longitude) {
                // Format pour les restaurants sélectionnés depuis RestoScreen
                ({ latitude, longitude } = restaurant.location);
            } else {
                return;
            }

            // Définition de la région à centrer sur la carte
            const region = {
                latitude,
                longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };
            // Animation de la carte pour centrer sur la région définie
            mapRef.current.animateToRegion(region, 1000);
        }
    }, 500); // Délai de 500ms avant de centrer la carte
};

// Fonction pour gérer l'événement lorsqu'un marqueur sur la carte est pressé
    // Elle définit le restaurant sélectionné et centre la carte sur la localisation du restaurant
    const handleMarkerPress = (restaurant) => {
        setSelectedRestaurant(restaurant); // Met à jour l'état avec le restaurant sélectionné
        centerMapOnRestaurant(restaurant); // Centre la carte sur le restaurant sélectionné
    };

// Fonction pour gérer l'événement lorsqu'un texte de restaurant est pressé
// Elle navigue vers l'écran des détails du restaurant avec les informations du restaurant
const handleTextePress = (restaurant, i) => {
    navigation.navigate('Resto', {
        place_id: restaurant.place_id,       // ID du lieu du restaurant
        id: restaurant.id,                   // ID du restaurant
        title: restaurant.title,             // Titre du restaurant
        location: restaurant.location,       // Localisation du restaurant
        address: restaurant.address,         // Adresse du restaurant
        description: restaurant.description, // Description du restaurant
        rating: restaurant.rating,           // Note du restaurant
        reviews: restaurant.reviews,         // Avis sur le restaurant
        image: restaurant.image,             // Image du restaurant
        phoneNumber: restaurant.phoneNumber, // Numéro de téléphone du restaurant
        openingHours: restaurant.openingHours // Heures d'ouverture du restaurant
    });
};

// Utilisation de useEffect pour vérifier si un restaurant est passé en paramètre via la route
// Si un restaurant est passé, il est défini comme restaurant sélectionné
// Si le paramètre centerOnRestaurant est vrai, la carte est centrée sur ce restaurant
useEffect(() => {
    if (route.params?.restaurant) {
        const restaurant = route.params.restaurant;
        setSelectedRestaurant(restaurant); // Met à jour l'état avec le restaurant sélectionné

        if (route.params.centerOnRestaurant) {
            centerMapOnRestaurant(restaurant); // Centre la carte sur le restaurant sélectionné
        }
    }
}, [route.params?.restaurant]);

// Utilisation de useEffect pour centrer la carte sur le restaurant sélectionné lorsque la carte est prête
useEffect(() => {
    if (isMapReady && selectedRestaurant) {
        centerMapOnRestaurant(selectedRestaurant); // Centre la carte sur le restaurant sélectionné
    }
}, [isMapReady, selectedRestaurant]);

    return (
        <View style={styles.container}>
            {mapRegion && (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={true}
                    onMapReady={() => setIsMapReady(true)}
                >
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="Votre position"
                            pinColor="#4285F4"
                        />
                    )}
                    {parkings.map((parking, index) => (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: parking.properties.latitude,
                                longitude: parking.properties.longitude,
                            }}
                            title={parking.properties.nom}
                            description={`Places libres: ${parking.properties.nbr_libre}/${parking.properties.nbr_total}`}
                        >
                            <Image
                                source={require('../assets/IMG_0028.jpeg')}
                                style={{ width: 15, height: 15 }}
                            />
                            <ParkingMarker
                                freeSpaces={parking.properties.nbr_libre}
                                totalSpaces={parking.properties.nbr_total}
                            />
                        </Marker>
                    ))}
                    {favoritesOrNotMarkers} 
                    {favoriteMarkers}
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
