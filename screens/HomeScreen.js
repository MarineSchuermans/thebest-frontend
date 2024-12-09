import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, SafeAreaView, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addLocationToStore } from '../reducers/user';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome';




export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch()
    const [favorites, setFavorites] = useState(new Set());
    const categories = ['Fast food', 'Italien', 'Asiatique', 'Gastronomique'];

    const restaurants = [
        {
            id: 1,
            title: 'Le Gourmet',
            description: 'Description duis aute irure dolor in reprehenderit in volup...',
            rating: 4.9,
            image: 'https://www.aixenprovencetourism.com/wp-content/uploads/2013/07/ou_manger-1920x1080.jpg',
            phoneNumber: '+33123456789',
            location: '123 Rue de la Paix, Paris, France',
        },
        {
            id: 2,
            title: "Saveurs d'Asie",
            description: 'Description duis aute irure dolor in reprehenderit in volup...',
            rating: 4.9,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33987654321',
            location: '456 Rue de la Concorde, Paris, France',
        },
        {
            id: 3,
            title: 'Pizza Roma',
            description: 'Description duis aute irure dolor in reprehenderit in v...',
            rating: 4.9,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33987654321',
            location: '789 Rue de la Ferme, Paris, France',
        },
        {
            id: 4,
            title: 'Le Bistrot',
            description: 'Description duis aute irure dolor in reprehenderit in v...',
            rating: 4.8,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33123456789',
            location: '123 Rue de la Paix, Paris, France',
        },
        {
            id: 5,
            title: 'Sushi Master',
            description: 'Description duis aute irure dolor in reprehenderit in v...',
            rating: 4.0,
            image: 'https://placeholder.com/150x100',
            phoneNumber: '+33123456789',
            location: '456 Rue de la Concorde, Paris, France',
        }
    ];


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

                {item.id === 1 ? (
                    <Image
                        source={{ uri: item.image }}
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
                        <TouchableOpacity onPress={() => {
                            const newFavorites = new Set(favorites);
                            favorites.has(item.id) ? newFavorites.delete(item.id) : newFavorites.add(item.id);
                            setFavorites(newFavorites);
                        }}>
                            <Feather
                                name="heart"
                                size={20}
                                color={favorites.has(item.id) ? "#FF0000" : "#9CA3AF"}
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
    );

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                Location.watchPositionAsync({ distanceInterval : 10},
                    (location) => {console.log(location)
                        dispatch(addLocationToStore({ latitude: location.coords.latitude, longitude: location.coords.longitude }))

                    }
                )
                // const location = await Location.getCurrentPositionAsync({});
                // console.log(location);

            }
        })();
    }, []);


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
                        <RenderRestaurantItem item={restaurant}/>
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