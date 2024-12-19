import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocationToStore, addFavoritesToStore, removeFavoritesToStore } from "../reducers/user";
import { initializeFiltreToStore, addRestoFiltredToStore } from "../reducers/restoFiltred";
import Feather from "react-native-vector-icons/Feather";
import { backendAdress } from "../config";
import LikeIcon from "../components/LikeIcon";
import { MarqueeText } from '../components/marquee-text';

export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch();
    const [restaurants, setRestaurants] = useState([]);
    const [isFavorite, setIsFavorite] = useState([]);
    const [isFilter, setIsFilter] = useState(false);
    const [dataFilter, setDataFilter] = useState([]);
    const categories = ['Fast food', 'Italien', 'Asiatique', 'Gastronomique'];
    const user = useSelector((state) => state.user.value);
    const restoFiltre = useSelector((state) => state.restoFiltred.value)
    const [currentLocation, setCurrentLocation] = useState("Rechercher un lieu...");
    const [selectedCity, setSelectedCity] = useState("");
    const availableCities = ["Lille", "Paris"];
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const inputRef = useRef(null);

    console.log(restoFiltre)

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const selectCity = (city) => {
        setSelectedCity(city);
        setIsDropdownVisible(false);
        handleFilterByType("", city);
    };

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
                dispatch(initializeFiltreToStore())

                const formattedRestaurants = restaurantData.map((place) => ({
                    _id: place._id,
                    place_id: place.place_id,
                    id: place.id,
                    title: place.name.length > 20
                        ? place.name.substring(0, 17) + "..."
                        : place.name,
                    location: place.address,
                    address: place.location,
                    description: place.reviews ? place.reviews[0]?.text : "Ici, bientôt une description",
                    rating: place.rating,
                    reviews: place.reviews,
                    image: place.photo,
                    phoneNumber: place.phoneNumber,
                    openingHours: place.openingHours,
                }));
                setRestaurants(formattedRestaurants);

                // dispatch(addRestoFiltredToStore([...formattedRestaurants]))

                for (let i = 0 ; i < formattedRestaurants.length; i++){
                    dispatch(addRestoFiltredToStore(formattedRestaurants[i]))
                }

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

    const handleFilterByType = (type, city = selectedCity) => {
        const query = new URLSearchParams();

        if (city) {
            query.append("city", city);
        }

        if (type) {
            query.append("category", type);
        }

        if (!city && !type) {
            // Si aucun filtre n'est sélectionné, on réinitialise l'affichage
            setIsFilter(false);
            setDataFilter([]);
            return;
        }

        fetch(`${backendAdress}/findRestaurantsByCategory?${query.toString()}`)
            .then(response => response.json())
            .then(data => {
                dispatch(initializeFiltreToStore()) //On remet le reduccer filtre à zéro
                
                const updateFilterResto = []
                if (Array.isArray(data) && data.length > 0) {
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
                    for (let i = 0 ; i < dataRestaurantsFiltred.length; i++){
                        updateFilterResto.push(dataRestaurantsFiltred[i])
                    }
                } else {
                    setIsFilter(false);
                    setDataFilter([]);
                }

                for (let i = 0 ; i < updateFilterResto.length; i++){
                    dispatch(addRestoFiltredToStore(updateFilterResto[i]))
                }
            })
            .catch(error => {
                console.error("Error fetching filtered restaurants:", error);
                setIsFilter(false);
                setDataFilter([]);
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
                    <TouchableOpacity onPress={toggleDropdown} style={styles.searchInput}>
                        <Text>{selectedCity || "Rechercher une ville"}</Text>
                    </TouchableOpacity>

                    {isDropdownVisible && (
                        <ScrollView style={styles.dropdown}>
                            {availableCities.map((city) => (
                                <TouchableOpacity
                                    key={city}
                                    style={styles.dropdownItem}
                                    onPress={() => selectCity(city)}
                                >
                                    <Text>{city}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>

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
            <MarqueeText
                text="🔥Trend : Mamayia, Bestab du moment 🤯🍤🔥"
                speed={0.05}
            />
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
        backgroundColor: "#C44949",
        shadowRadius: 5,
        shadowColor: "grey",
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 1,
            height: 2,
        },
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        height: 35,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "500",
        color: "white",
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
    searchInput: {
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        color: "#000",
        maxHeight: 40,
        minWidth: 300,
    },
    searchIcon: {
        position: "absolute",
        left: 14,
        top: 10,
    },
    dropdown: {
        position: 'absolute',
        top: 60, 
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        maxHeight: 200,
        zIndex: 1000,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
});
