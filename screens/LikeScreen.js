import { Button, Text, View, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Image} from 'react-native';
import { useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome';

export default function LikeScreen({ navigation }) {
    const user = useSelector((state) => state.user.value)

    console.log(user)

    const favoriteListe = user.favorites.map((data, i) => {
        console.log(data)
        return (
            <TouchableOpacity 
                onPress={() => navigation.navigate('Resto', {
                    key: {i},
                    title: data.title,
                    description: data.description,
                    rating: data.rating,
                    image: data.image,
                    phoneNumber: data?.phoneNumber,
                    location: data?.location,
                })} 
                style={styles.restaurantCard}
            >            
        
                  
                        <Image
                            source={{ uri: data.image }}
                            style={styles.restaurantImage}
                        />
                    <View style={styles.restaurantInfo}>
                        <View style={styles.restaurantHeader}>
                            <Text style={styles.restaurantTitle}>{data.title}</Text>
                            <TouchableOpacity >
                                
                                {/* <Feather
                                    name="trash"
                                    size={20}
                                    // color={favorites.has(.id) ? "#FF0000" : "#9CA3AF"}
                                /> */}
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
    
   

    // const RenderFavoriteItem = ({ item }) => (
    //     <TouchableOpacity 
    //             onPress={() => navigation.navigate('Resto', {
    //                 title: item.title,
    //                 description: item.description,
    //                 rating: item.rating,
    //                 image: item.image,
    //                 phoneNumber: item.phoneNumber,
    //                 location: item.location,
    //             })} 
    //             style={styles.restaurantCard}
    //         >            
        
    //                 {item.id === 1 ? (
    //                     <Image
    //                         source={{ uri: item.image }}
    //                         style={styles.restaurantImage}
    //                     />
    //                 ) : (
    //                     <View style={styles.placeholderImage}>
    //                         <View style={styles.placeholderInner} />
    //                     </View>
    //                 )}
    //                 <View style={styles.restaurantInfo}>
    //                     <View style={styles.restaurantHeader}>
    //                         <Text style={styles.restaurantTitle}>{item.title}</Text>
    //                         <TouchableOpacity onPress={() => {
    //                             handleFavorite(item)
    //                             const newFavorites = new Set(favorites);
    //                             favorites.has(item.id) ? newFavorites.delete(item.id) : newFavorites.add(item.id);
    //                             setFavorites(newFavorites);
        
    //                         }}>
    //                             <Feather
    //                                 name="trash"
    //                                 size={20}
    //                                 color={favorites.has(item.id) ? "#FF0000" : "#9CA3AF"}
    //                             />
    //                         </TouchableOpacity>
    //                     </View>
    //                     <Text style={styles.description}>{item.description}</Text>
    //                     <View style={styles.restaurantFooter}>
    //                         <Feather name="phone" size={16} />
    //                         <Feather name="map-pin" size={16} style={styles.footerIcon} />
    //                         <View style={styles.rating}>
    //                             <Text>{'★'.repeat(Math.floor(item.rating))}</Text>
    //                             <Text>{'☆'.repeat(5 - Math.floor(item.rating))}</Text>
    //                             <Text style={styles.ratingText}>({item.rating})</Text>
    //                         </View>
    //                     </View>
    //                 </View>
        
    //             </TouchableOpacity>
    //         );
        
    


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

            {/* <View style={{ height: 50 }}>
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
            </View> */}

            <View style={styles.restaurantList}>
                {favoriteListe}
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