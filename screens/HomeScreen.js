import {View,Text,StyleSheet,ScrollView, TextInput,TouchableOpacity,Image,SafeAreaView,FlatList,} from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {addLocationToStore,addFavoritesToStore,removeFavoritesToStore,} from "../reducers/user";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome6 from "react-native-vector-icons/FontAwesome";
import { backendAdress } from "../config";
import LikeIcon from "../components/LikeIcon";

export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch()
    const [favorites, setFavorites] = useState(new Set());
    const [restaurants, setRestaurants] = useState([]);
    const [isFavorite, setIsFavorite] = useState([])
    const categories = ['Fast food', 'Italien', 'Asiatique', 'Gastronomique'];
    const user = useSelector((state) => state.user.value);
    const [currentLocation, setCurrentLocation] = useState("Rechercher un lieu...");
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    
    useEffect(() => {
        getCurrentLocation();
    }, []);

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
        setIsFavorite([...user.favorites])
    }, [user.favorites.length])

    useEffect(() => {


        const getRestaurants = async () => {
            try {

                const response = await fetch(backendAdress + "/findNearbyRestaurants"); //ON N UTILISE PAS VERCEL A CAUSE DU TIMEOUT
                const restaurantData = await response.json()


                const formattedRestaurants = restaurantData.map((place, index) => ({
                    _id: place._id,
                    place_id: place.place_id,
                    id: index + 1,
                    title: place.name,
                    location: place.address,
                    address: place.location,
                    description: "Ici, bientôt une description",
                    rating: place.rating,
                    image: place.photo,
                    phoneNumber: place.phoneNumber,
                    openingHours: place.openingHours
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
                   
                    dispatch(
                        addLocationToStore({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        })
                    );
                });
            }
        })();
    }, []);


    // Verifier si le user est connecté via la présence ou non d'un token
    let isConnected = false
    if (user.token?.length > 0) {
        isConnected = true
    }


useEffect(() => {

}, [])
    //envoyer les favoris dans le reducer user au click sur le coeur
    const handleFavorite = (item) => {
        if (!isConnected) {
            return navigation.navigate('User') //Au press sur le coeur, si le user n'est pas connecté il est renvoyé sur la page log-in
        }

        const infos = {
            token: user.token,
            obj_id: item.place_id
        }

        fetch('https://the-best-backend.vercel.app/users/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(infos)
        })
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    // setIsFavorite([...isFavorite, item._id])
                    dispatch(addFavoritesToStore(item.place_id))
                    // console.log(item)
                } else {
                    // setIsFavorite(a => a.filter(e => e !== item._id))
                    dispatch(removeFavoritesToStore(item.place_id))
                }
                // console.log(isFavorite)
            })
            .catch(error => {
                console.error('Erreur de la requête:', error)
            })
    }

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.length > 2) {
        try {
            // Première étape : recherche générale
            const generalResponse = await Location.geocodeAsync(text);
            // if (generalResponse.length > 0) {
            //     const { latitude, longitude } = generalResponse[0];
            //     getRestaurants(latitude, longitude);
            // }
            
            // Deuxième étape : recherche détaillée pour chaque résultat général
            const detailedResults = await Promise.all(generalResponse.map(async (item) => {
                const detailedResponse = await Location.geocodeAsync(`${item.latitude},${item.longitude}`);
                return detailedResponse;
            }));

            // Aplatir et filtrer les résultats
            const allResults = detailedResults.flat().filter(Boolean);

            // Limiter à 10 résultats uniques
            const uniqueResults = Array.from(new Set(allResults.map(a => JSON.stringify(a))))
                .map(item => JSON.parse(item))
                .slice(0, 10);

            const suggestions = await Promise.all(uniqueResults.map(async (item) => {
                const address = await Location.reverseGeocodeAsync({
                    latitude: item.latitude,
                    longitude: item.longitude
                });
                return {
                    fullAddress: address[0] ? 
                        `${address[0].name || ''} ${address[0].street || ''}, ${address[0].city || ''}, ${address[0].country || ''}`.trim() : 
                        'Adresse inconnue',
                    accuracy: item.accuracy,
                    latitude: item.latitude,
                    longitude: item.longitude
                };
            }));

            // Filtrer les adresses vides et trier par précision (accuracy)
            const sortedSuggestions = suggestions
                .filter(suggestion => suggestion.fullAddress !== 'Adresse inconnue')
                .sort((a, b) => b.accuracy - a.accuracy);

            setSearchResults(sortedSuggestions);
            console.log("Résultats de recherche:", sortedSuggestions);
        } catch (error) {
            console.error("Erreur lors de la recherche d'adresses:", error);
        }
    } else {
        setSearchResults([]);
    }
};

// const fetchRestaurantsForLocation = async (latitude, longitude) => {
//     try {
//         const response = await fetch(`${backendAdress}/findNearbyRestaurants?lat=${latitude}&lng=${longitude}`);
//         const restaurantData = await response.json();

//         const formattedRestaurants = restaurantData.map((place, index) => ({
//             _id: place._id,
//             place_id: place.place_id,
//             id: index + 1,
//             title: place.name,
//             location: place.address,
//             address: place.location,
//             description: "Ici, bientôt une description",
//             rating: place.rating,
//             image: place.photo,
//             phoneNumber: place.phoneNumber,
//             openingHours: place.openingHours
//         }));

//         setRestaurants(formattedRestaurants);
//     } catch (error) {
//         console.error("Error fetching restaurants:", error);
//     }
// };
    
    const clearSearch = () => {
        setSearchText('');
        setSearchResults([]);
    };

  const RenderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Resto", {
          title: item.title,
          place_id: item.place_id,
          description: item.description,
          rating: item.rating,
          image: item.image,
          phoneNumber: item.phoneNumber,
          location: item.location,
          address: item.address,
        })
      }
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
                        color={isConnected && isFavorite.some(data => item.place_id == data) ? "#FF0000" : "#9CA3AF"}
                    />
                </View>

                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.restaurantFooter}>
                    <Feather name="phone" size={16} />
                    <Feather name="map-pin" size={16} style={styles.footerIcon} />
                    <View style={styles.rating}>
                        <Text>{"★".repeat(Math.floor(item.rating))}</Text>
                        <Text>{"☆".repeat(5 - Math.floor(item.rating))}</Text>
                        <Text style={styles.ratingText}>({item.rating})</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>

    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
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
    <FlatList
        data={searchResults}
        renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => {
                    setSearchText(item.fullAddress);
                    setCurrentLocation(item.fullAddress);
                    setSearchResults([]);
                    // Vous pouvez ajouter ici une logique pour mettre à jour la carte ou effectuer d'autres actions
                }}
            >
                <Text>{item.fullAddress}</Text>
            </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.suggestionList}
    />
)}
            <View style={{ height: 50 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity key={category} style={styles.categoryButton}>
                            <Text style={styles.categoryText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.restaurantList}>
                {restaurants.map((restaurant) => (
                    <RenderRestaurantItem key={restaurant.id} item={restaurant} />
                ))}
            </View>

            {/* <FlatList
                data={restaurants}
                renderItem={renderRestaurantItem}
                keyExtractor={item => item.id.toString()}
                style={styles.restaurantList}
            /> */}
        </SafeAreaView>

        // <View style={styles.container}>
        //     <Text> Home Screen </Text>
        //     <Button title = 'Go to Reso'
        //     onPress={() => navigation.navigate('Resto')}/>
        // </View>
    );
}

const styles = StyleSheet.create({

    container : {
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
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: "#000000",
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    suggestionList: {
        maxHeight: 200,
        backgroundColor: 'white',
        borderRadius: 5,
        marginTop: 5,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchIcon: {
        position: "absolute",
        left: 12,
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
