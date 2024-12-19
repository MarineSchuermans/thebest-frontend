import { Button, Text, View, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo'
import { FlatList, PanGestureHandler } from 'react-native-gesture-handler';
import { removeFavoritesToStore, addFavoritesToStore } from '../reducers/user'
import { addRestoToStore, initializeRestoToStore } from '../reducers/resto';
import { backendAdress } from "../config"



export default function LikeScreen({ navigation }) {
    const dispatch = useDispatch()
    const likePlaces = useSelector((state) => state.resto.value)
    const user = useSelector((state) => state.user.value)
    const id_places = user.favorites

    let isConnected = false
    if (user.token?.length > 0) {
        isConnected = true
    }

    useEffect(() => {
        fetch(`${backendAdress}/places`)
            .then(response => response.json())
            .then(data => {
                dispatch(initializeRestoToStore())
                const updateLikes = []
                for (let i = 0; i < id_places.length; i++) {
                    const matchingResto = data.places.find(place => place.id === id_places[i])

                    if (matchingResto) {
                        updateLikes.push(matchingResto)
                    }
                }
                for (let i = 0; i < updateLikes.length; i++) {
                    dispatch(addRestoToStore(updateLikes[i]))
                }
            })
    }, [id_places.length])

    const dataRestoFav = likePlaces.map((place, index) => 
    ({
        place_id: place.id,
        id: index + 1,
        title: place.name,
        location: place.address,
        address: place.location,
        description: place.reviews[0]?.text,
        rating: place.rating,
        reviews: place.reviews,
        image: place.photo,
        phoneNumber: place.phoneNumber,
        openingHours: place.openingHours
    })
)
    const handleRemoveFavorite = (item) => {
        const infos = {
            token: user.token,
            obj_id: item
        }
        fetch('https://the-best-backend.vercel.app/users/favorites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(infos)
        })
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    dispatch(addFavoritesToStore(item))
                } else {
                    dispatch(removeFavoritesToStore(item))
                }
            })
            .catch(error => {
                console.error('Erreur de la requête:', error)
            })
    }

    let favoriteListe

    if (likePlaces.length === 0 || !isConnected) {
        favoriteListe = <Text> No favorite</Text>
    } else {
        favoriteListe = dataRestoFav.map((item, i) => {
            return (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Resto', {
                        key: { i },
                        title: item.title,
                        place_id: item.place_id,
                        description: item?.description,
                        rating: item.rating,
                        reviews: item?.reviews,
                        image: item.image,
                        phoneNumber: item.phoneNumber,
                        location: item?.location,
                        address: item.address,
                    })}
                    style={styles.restaurantCard}
                >
                    <Image
                        source={{ uri: item.image }}
                        style={styles.restaurantImage}
                    />
                    <View style={styles.restaurantInfo}>
                        <View style={styles.restaurantHeader}>
                            <Text style={styles.restaurantTitle}>{item.title}</Text>
                            <TouchableOpacity style={styles.cross} onPress={() => handleRemoveFavorite(item.place_id)}>
                                <Entypo
                                    name="cross"
                                    size={30}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.description}>{item.description?.length > 0 ? item.description.slice(0, 35) : 'Service rapide, plats délicieux, ambiance agréable !'}...</Text>
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
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Feather name="map-pin" size={24} />
                <View style={styles.searchContainer}>
                    <Text style={styles.title}>Tes Best of The Best ♥</Text>
                </View>
                <FontAwesome6 name="bars" size={24} />
            </View>
            <View style={styles.restaurantList}>
                <ScrollView>
                    {favoriteListe}
                </ScrollView>
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
    },
    searchContainer: {
        flex: 1,
        marginHorizontal: 16,
        alignItems: 'center',
        position: 'center',
    },
    title: {
        fontSize: 23,
        fontWeight: 'bold',
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
    },
    cross: {
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