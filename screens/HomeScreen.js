import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocationToStore, addFavoritesToStore, removeFavoritesToStore } from "../reducers/user";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome6 from "react-native-vector-icons/FontAwesome";
import { backendAdress } from "../config";
import LikeIcon from "../components/LikeIcon";

export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch();
    const [favorites, setFavorites] = useState(new Set());
    const [restaurants, setRestaurants] = useState([]);
    const [isFavorite, setIsFavorite] = useState([]);
    const [isFilter, setIsFilter] = useState(false);
    const [dataFilter, setDataFilter] = useState([]);
    const categories = ['Fast food', 'Italien', 'Asiatique', 'Gastronomique'];
    const user = useSelector((state) => state.user.value);
    const [currentLocation, setCurrentLocation] = useState("Rechercher un lieu...");
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        getCurrentLocation();
        setIsFavorite([...user.favorites]);
    }, [user.favorites.length]);

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }
    
        let location = await Location.getCurrentPositionAsync({});
        let address = await Location.reverseGeocodeAsync(location.coords);
        if (address[0]) {
            const fullAddress = [
                address[0].name,
                address[0].street,
                address[0].city,
            ].filter(Boolean).join(', ');
            setCurrentLocation(fullAddress);
            setSearchText(fullAddress);
        }
    };

    useEffect(() => {
        const getRestaurants = async () => {
            try {
                const response = await fetch(backendAdress + "/findNearbyRestaurants");
                const restaurantData = await response.json();
                
                const formattedRestaurants = restaurantData.map((place) => ({
                    _id: place._id,
                    place_id: place.place_id,
                    id: place.id,
                    title: place.name,
                    location: place.address,
                    address: place.location,
                    description: place.reviews ? place.reviews[0]?.text : "Ici, bientôt une description",
                    rating: place.rating,
                    image: place.photo,
                    phoneNumber: place.phoneNumber,
                    openingHours: place.openingHours,
                    reviews : place.reviews
                }));
                setRestaurants(formattedRestaurants);
            } catch (error) {
                console.error("Error fetching restaurants:", error);
            }
        };
        getRestaurants();
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                Location.watchPositionAsync({ distanceInterval: 10 }, (location) => {
                    dispatch(addLocationToStore({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }));
                });
            }
        })();
    }, []);

    let isConnected = false;
    if (user.token?.length > 0) {
        isConnected = true;
    }

    const handleSearch = async (text) => {
        setSearchText(text);
        if (text.length > 2) {
            try {
                const generalResponse = await Location.geocodeAsync(text);
                if (generalResponse.length > 0) {
                    const detailedResults = await Promise.all(generalResponse.map(async (item) => {
                        return await Location.reverseGeocodeAsync({
                            latitude: item.latitude,
                            longitude: item.longitude
                        });
                    }));

                    const suggestions = detailedResults
                        .flat()
                        .map(address => ({
                            fullAddress: address.city,

                        }))
                        .filter(item => item.fullAddress !== 'Adresse inconnue')
                        .slice(0, 10);

                    setSearchResults(suggestions);
                }
            } catch (error) {
                console.error('Erreur lors de la recherche d\'adresses:', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const clearSearch = () => {
        setSearchText('');
        setSearchResults([]);
    };

    const handleFilterByType = (type) => {
        fetch(`${backendAdress}/findRestaurantsByCategory?category=${type}`)
            .then(response => response.json())
            .then(data => {
                if (data.message === `Pas de best dans cette Categorie ! ${type}`) {
                    setIsFilter(false);
                } else {
                    setIsFilter(true);
                    const dataRestaurantsFiltred = data.map((place, index) => ({
                        place_id: place.place_id,
                        id: index + 1,
                        title: place.name,
                        location: place.address,
                        address: place.location,
                        description: place.reviews[0]?.text || "Description non disponible",
                        rating: place.rating,
                        reviews: place.reviews,
                        image: place.photo,
                        phoneNumber: place.phoneNumber,
                        openingHours: place.openingHours
                    }));
                    setDataFilter(dataRestaurantsFiltred);
                }
            });
    };

    const handleFavorite = (item) => {
        if (!isConnected) return navigation.navigate('User');

        const infos = {
            token: user.token,
            obj_id: item.place_id
        };

        fetch('https://the-best-backend.vercel.app/users/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(infos)
        })
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    dispatch(addFavoritesToStore(item.place_id));
                } else {
                    dispatch(removeFavoritesToStore(item.place_id));
                }
            });
    };

    const isOpen = (hoursArray) => {
        if (!hoursArray || !hoursArray.length) return false;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const todayHours = hoursArray.find(day => day.startsWith(today));
        return todayHours && !todayHours.includes('Closed');
    };

    const RenderRestaurantItem = ({ item }) => {
        const displayRestaurants = isFilter ? dataFilter : restaurants;

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate("Resto", {
                    title: item.title,
                    place_id: item.place_id,
                    description: item.description,
                    rating: item.rating,
                    reviews: item.reviews,
                    image: item.image,
                    phoneNumber: item.phoneNumber,
                    location: item.location,
                    address: item.address,
                    openingHours: item.openingHours,
                })}
                style={styles.restaurantCard}
            >
                {item.image && item.image !== "placeholder_url" ? (
                    <Image source={{ uri: item.image }} style={styles.restaurantImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <View style={styles.placeholderInner} />
                    </View>
                )}

                <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantHeader}>
                        <Text style={styles.restaurantTitle}>{item.title}</Text>
                        <LikeIcon
                            onClickIcon={() => handleFavorite(item)}
                            color={isConnected && isFavorite.some(data => item.place_id === data) ? "#FF0000" : "#9CA3AF"}
                        />
                    </View>

                    <Text style={styles.description}>
                        {item.description && item.description.length > 35 
                            ? `${item.description.slice(0, 35)}...` 
                            : 'Service rapide, plats délicieux, ambiance agréable !'}
                    </Text>

                    <View style={styles.restaurantFooter}>
                        <Feather name="phone" size={16} />
                        <Feather name="map-pin" size={16} style={styles.footerIcon} />
                        <View style={styles.rating}>
                            <Text>{"★".repeat(Math.floor(item.rating))}</Text>
                            <Text>{"☆".repeat(5 - Math.floor(item.rating))}</Text>
                            <Text style={styles.ratingText}>({item.rating})</Text>
                        </View>
                        <View style={[styles.statusBadge, {
                            backgroundColor: isOpen(item.openingHours) ? '#34D399' : '#EF4444'
                        }]}>
                            <Text style={styles.statusText}>
                                {isOpen(item.openingHours) ? 'Ouvert' : 'Fermé'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
    <Feather name="map-pin" size={24} style={styles.bar} />
    <View style={styles.searchContainer}>
        <TextInput
            placeholder={currentLocation}
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
        />
        {searchText !== '' && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Feather name="x" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        )}
    </View>
    <FontAwesome6 name="bars" size={24} style={styles.bar} />
</View>
            {searchResults.length > 0 && (
                <ScrollView style={styles.suggestionList}>
                    {searchResults.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => {
                                setSearchText(item.fullAddress);
                                setCurrentLocation(item.fullAddress);
                                setSearchResults([]);
                            }}
                        >
                            <Text>{item.fullAddress}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <View style={{ height: 50 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity 
                            key={category} 
                            style={styles.categoryButton}
                            onPress={() => handleFilterByType(category)}
                        >
                            <Text style={styles.categoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.restaurantList}>
                {(isFilter ? dataFilter : restaurants).map((restaurant) => (
                    <RenderRestaurantItem key={restaurant.id} item={restaurant} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    statusBadge: {
        marginLeft: 'auto',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        justifyContent: "space-between",
        backgroundColor: "#C44949",
    },
    bar: {
        color: "#FFFFFF",
    },
    searchContainer: {
        flex: 1,
        marginHorizontal: 16,
        position: "relative",
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingHorizontal: 40,
        paddingVertical: 8,
    },
    clearButton: {
        position: 'absolute',
        right: 12,
    },
    suggestionList: {
        maxHeight: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        marginHorizontal: 16,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchIcon: {
        position: "absolute",
        left: 14,
        top: 10,
        color: "#9CA3AF",
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    heart: {
        height: 50,
        width: 50,
    },
    categoryButton: {
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        height: 35,
    },
    categoryText: {
        fontSize: 14,
    },
    restaurantList: {
        flex: 1,
        marginTop: 0,
    },
    restaurantCard: {
        flex: 1,
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    restaurantImage: {
        width: 96,
        height: 80,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 96,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderInner: {
        width: 48,
        height: 48,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
    },
    restaurantInfo: {
        flex: 1,
        marginLeft: 16,
    },
    restaurantHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    restaurantTitle: {
        fontSize: 16,
        fontWeight: "500",
    },
    description: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    restaurantFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    footerIcon: {
        marginLeft: 8,
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 8,
    },
    ratingText: {
        marginLeft: 4,
        color: "#6B7280",
    },
});
