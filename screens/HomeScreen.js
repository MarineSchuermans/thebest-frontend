import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLocationToStore, addFavoritesToStore, removeFavoritesToStore } from '../reducers/user';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome';
import { backendAdress } from "../config";

export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch()
    const [favorites, setFavorites] = useState(new Set());
    const [restaurants, setRestaurants] = useState([]);
    const [isFavorite, setIsFavorite] = useState([])
    const categories = ['Fast food', 'Italien', 'Asiatique', 'Gastronomique'];
    const user = useSelector((state) => state.user.value)

    console.log(user)

    useEffect(() => {

        const getRestaurants = async () => {
            try {
            
                const response = await fetch('https://the-best-backend.vercel.app/findNearbyRestaurants');
                const restaurantData = await response.json();
                
          
                const formattedRestaurants = restaurantData.map((place, index) => ({
                    _id: place._id,
                    id: index + 1,
                    title: place.name,
                    location: place.address,
                    description: "Ici, bientôt une description",
                    rating: place.rating,
                    image: [place.photo], 
                    phoneNumber: place.phoneNumber,
                }));
    
                setRestaurants(formattedRestaurants);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            }
        };
    
        getRestaurants();
    }, []);

    // Verifier si le user est connecté via la présence ou non d'un token
    let isConnected = false
    if (user.token?.length > 0 ){
        isConnected = true
    } 

    
     
    //envoyer les favoris dans le reducer user au click sur le coeur
    const handleFavorite = (item) => {
        if (!isConnected){
            return navigation.navigate('User') //Au press sur le coeur, si le user n'est pas connecté il est renvoyé sur la page log-in
        }

        const infos = {
            token: user.token,
            obj_id: item._id
        }
        
        fetch('https://the-best-backend.vercel.app/users/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(infos)
        })
        .then(response => response.json())
        .then (data => {
            console.log(data)
            if (data.result){
                setIsFavorite([...isFavorite, item._id])
                dispatch(addFavoritesToStore({id: item._id}))
                // console.log(item)
            } else {
                setIsFavorite(a => a.filter(e => e !== item._id ))
                dispatch(removeFavoritesToStore({id: item._id}))
            }
            // console.log(isFavorite)
        })
        .catch(error => {
            console.error('Erreur de la requête:', error)
        })
    }

    const RenderRestaurantItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Resto', {
                title: item.title,
                description: item.description,
                rating: item.rating,
                image: item.image,
                phoneNumber: item.phoneNumber,
                location: item.location,
            })}
            style={styles.restaurantCard}
        >
        
            {item.image !== 'placeholder_url' ? (
                <Image
                    source={{ uri: item.image[0] }}
                    style={styles.restaurantImage}
                />
            ) : (
                <View style={styles.placeholderImage}>
                    <View style={styles.placeholderInner} />
                </View>
            )}

            <View style={styles.restaurantInfo}>
         
                <View style={styles.restaurantHeader}>
                    <Text style={styles.restaurantTitle}>{item.title}</Text>
                    <TouchableOpacity style={styles.heart}
                    onPress={() => {
                        handleFavorite(item);
                    }}>
                        <Feather
                            name="heart"
                            size={20}
                            color={isFavorite.some(data => item._id == data) ? "#FF0000" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                </View>

          
                <Text style={styles.description}>{item.description}</Text>

           
                <View style={styles.restaurantFooter}>
                    <Feather name="phone" size={16} />
                    <Feather name="map-pin" size={16} style={styles.footerIcon} />
                    <View style={styles.rating}>
                        <Text>{'★'.repeat(Math.floor(item.rating))}</Text>
                        <Text>{'☆'.repeat(5 - Math.floor(item.rating))}</Text>
                        <Text style={styles.ratingText}>({item.rating})</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                Location.watchPositionAsync({ distanceInterval : 10},
                    (location) => {console.log(location)
                        dispatch(addLocationToStore({ latitude: location.coords.latitude, longitude: location.coords.longitude }))

                    }
                )

            }
        })();
    }, []);


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Feather name="map-pin" size={24} style={styles.bar}/>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={16} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search"
                        style={styles.searchInput}
                    />
                </View>
                <FontAwesome6 name="bars" size={24} style={styles.bar}/>
            </View>

            <View style={{ height: 50 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={styles.categoryButton}
                        >
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
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
        backgroundColor: '#C44949',
    },
    bar: {
        color: '#FFFFFF',
    },
    searchContainer: {
        flex: 1,
        marginHorizontal: 16,
        position: 'relative',
    },
    searchInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 40,
        paddingVertical: 8,
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        top: 10,
        color: '#9CA3AF',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,    
    },
    heart: {
        height: 50,
        width: 50
    },
    categoryButton: {
        backgroundColor: '#F3F4F6',
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
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderInner: {
        width: 48,
        height: 48,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    restaurantInfo: {
        flex: 1,
        marginLeft: 16,
    },
    restaurantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    restaurantTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    restaurantFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    footerIcon: {
        marginLeft: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    ratingText: {
        marginLeft: 4,
        color: '#6B7280',
    }

});