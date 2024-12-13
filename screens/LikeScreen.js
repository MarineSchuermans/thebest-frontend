import { Button, Text, View, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo'
import { FlatList, PanGestureHandler } from 'react-native-gesture-handler';
import { removeFavoritesToStore } from '../reducers/user'
import { backendAdress } from "../config"



export default function LikeScreen({ navigation }) {
    const dispatch = useDispatch()
    const [likePlaces, setLikePlaces] = useState([])
    const user = useSelector((state) => state.user.value)
    const id_places = user.favorites

    console.log(id_places)

   useEffect(() => {
    fetch(`${backendAdress}/places`)
        .then(response => response.json())
        .then(data => {

            // if (data.places.some(place => place._id === id_places))
            // const infoPlaces = data.find(place => id_places.some(idPlace => idPlace.id === place._id))
            // console.log(infoPlaces)
            // setLikePlaces()
            const updateLikes = []
            for (let i=0 ; i < id_places.length ; i++) {
                if (data.places.some(place => place._id === id_places[i].id)){
                    const infoPlace = data.places.find(placeLike => placeLike._id === id_places[i].id)
                    // console.log(infoPlace)
                    updateLikes.push(infoPlace)
                    // setLikePlaces([...likePlaces, infoPlace])
                } else {
                    console.log(false)
                }
                setLikePlaces([...likePlaces, updateLikes])
            }
        })

   }, [id_places])

    const handleRemoveFavorite = (data) => {
        console.log('remove favorite')
        dispatch(removeFavoritesToStore({id: data}))
    }

    let favoriteListe

    if (likePlaces.length === 0){
        favoriteListe = <Text> No favorite</Text>
    // }else if (likePlaces.length === 1){
    //     favoriteListe = (
    //         <TouchableOpacity
    //         onPress={() => navigation.navigate('Resto', {
    //             key: { i },
    //             title: likePlaces.name,
    //             description: likePlaces.description,
    //             rating: likePlaces.rating,
    //             image: likePlaces.photo_reference,
    //             phoneNumber: likePlaces.phone,
    //             location: likePlaces.address,
    //         })}
    //         style={styles.restaurantCard}
    //     >


    //         <Image
    //             source={{ uri: likePlaces.photo_reference }}
    //             style={styles.restaurantImage}
    //         />
    //         <View style={styles.restaurantInfo}>
    //             <View style={styles.restaurantHeader}>
    //                 <Text style={styles.restaurantTitle}>{likePlaces.name}</Text>
    //                 <TouchableOpacity style={styles.cross} onPress={() => handleRemoveFavorite(likePlaces.id)}>

    //                     <Entypo
    //                         name="cross"
    //                         size={30}
    //                     />
    //                 </TouchableOpacity>
    //             </View>
    //             <Text style={styles.description}>{likePlaces.description}</Text>
    //             <View style={styles.restaurantFooter}>
    //                 <Feather name="phone" size={16} />
    //                 <Feather name="map-pin" size={16} style={styles.footerIcon} />
    //                 <View style={styles.rating}>
    //                     <Text>{'★'.repeat(Math.floor(likePlaces.rating))}</Text>
    //                     <Text>{'☆'.repeat(5 - Math.floor(likePlaces.rating))}</Text>
    //                     <Text style={styles.ratingText}>({likePlaces.rating})</Text>
    //                 </View>
    //             </View>
    //         </View>

    //     </TouchableOpacity>
    //     )
    } else {
        favoriteListe = likePlaces.map((data, i) => {
            console.log(data.photo_reference)
            return (
    
                <TouchableOpacity
                    onPress={() => navigation.navigate('Resto', {
                        key: { i },
                        title: data.name,
                        description: data.description,
                        rating: data.rating,
                        image: data.photo,
                        phoneNumber: data.phone,
                        // location: data?.location,
                    })}
                    style={styles.restaurantCard}
                >
    
    
                    <Image
                        source={{ uri: data.photo_reference }}
                        style={styles.restaurantImage}
                    />
                    <View style={styles.restaurantInfo}>
                        <View style={styles.restaurantHeader}>
                            <Text style={styles.restaurantTitle}>{data.name}</Text>
                            <TouchableOpacity style={styles.cross} onPress={() => handleRemoveFavorite(data.id)}>
    
                                <Entypo
                                    name="cross"
                                    size={30}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.description}>{data.description}</Text>
                        <View style={styles.restaurantFooter}>
                            <Feather name="phone" size={16} />
                            <Feather name="map-pin" size={16} style={styles.footerIcon} />
                            <View style={styles.rating}>
                                <Text>{'★'.repeat(Math.floor(data.rating))}</Text>
                                <Text>{'☆'.repeat(5 - Math.floor(data.rating))}</Text>
                                <Text style={styles.ratingText}>({data.rating})</Text>
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
                    <Feather name="search" size={16} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search"
                        style={styles.searchInput}
                    />
                </View>
                <FontAwesome6 name="bars" size={24} />
            </View>


            <View style={styles.restaurantList}>
                {favoriteListe}
                {/* <FlatListItem /> */}
                {/* {restaurants.map((restaurant) => (
                    <RenderRestaurantItem item={restaurant} />
                ))} */}
            </View>



        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    // container: {
    //   flex: 1,
    //   backgroundColor: '#fff',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    // },
    // const styles = StyleSheet.create({
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
    },
    cross: {
        height: 50,
        width:50
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