import React, { useState, useEffect, useRef, useCallback } from "react";
import {Text,View,StyleSheet,TouchableOpacity,Linking,Share,Image,Modal,TextInput,FlatList,ScrollView,} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CameraView, Camera } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { backendAdress, DISTANCE_MATRIX_API_KEY } from "../config";
import { addFavoritesToStore, removeFavoritesToStore } from "../reducers/user";
import { toggleModal } from "../reducers/user"; 


// URL pour récupérer les données de parking depuis une API
const PARKING_DATA_URL =
  "https://data.lillemetropole.fr/geoserver/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=parking&outputFormat=application/json";

  // Composant ReviewModal pour afficher et soumettre des avis
const ReviewModal = ({ visible, onClose, onSubmit, photo, place_id }) => {
    // Récupération de l'utilisateur depuis le store Redux
  const user = useSelector((state) => state.user.value);
    // Déclaration des états locaux pour la note et le commentaire
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

    // Fonction pour gérer la soumission du formulaire d'avis
  const handleSubmit = () => {
    // Envoi de la requête POST à l'API pour enregistrer l'avis en base de données
    fetch(`${backendAdress}/reviews`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({token: user.token, place_id: place_id, rating: rating, text: comment, photo: photo})
    }) 
      .then(response => response.json())
      .then((data) => {
        if (data.result){
          console.log(data) // Affichage des données en cas de succès
        } else {
          console.log(data) // Affichage des données en cas d'échec
        }
      })

    onSubmit({ rating, comment, photo });
    setRating(0);
    setComment("");
    onClose();
  };


  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Ajouter un avis</Text>
          {photo && (
            <Image source={{ uri: photo }} style={styles.reviewPhoto} />
          )}
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setRating(index + 1)}
              >
                <FontAwesome
                  name={index < rating ? "star" : "star-o"}
                  size={30}
                  color="#FFD700"
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Donnez votre avis"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

export default function RestoScreen({ route }) {
  const {
    title,
    place_id,
    description,
    rating,
    reviews,
    image,
    phoneNumber,
    location,
    type,
    address,
  } = route.params;
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  // const [isExpanded, setIsExpanted] = useState(false) //Pour afficher l'intégralité d'un avis ou non
  const [isFavorite, setIsFavorite] = useState([]);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  const [photoUri, setPhotoUri] = useState(null);
  const [reviewsFromDB, setReviewsFromDB] = useState([])
  const [userReview, setUserReview] = useState(null);
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [nearestParking, setNearestParking] = useState(null);
  const [distances, setDistances] = useState({
    toUser: null,
    toParking: null,
  });
  const [parkings, setParkings] = useState([]);
  const [photoPlaces, setPhotoPlaces] = useState([]);
  const [photos, setPhotos] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const isConnected = user?.token;

  useEffect(() => {
    const fetchRestaurantData = async () => {
        try {
            console.log("Fetching restaurant data for place_id:", place_id);
            console.log("Backend URL:", `${backendAdress}/restaurant/${place_id}`);

            const response = await fetch(`${backendAdress}/restaurant/${place_id}`);
            
            const responseText = await response.text();
            console.log("Raw response:", responseText);

            const data = JSON.parse(responseText);

            if (data.success && data.data && data.data.all_photos) {
                console.log("Photos found:", data.data.all_photos);
                setPhotos(data.data.all_photos);
            } else if (image) {
                console.log("No photos found, using default image");
                setPhotos([image]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            if (image) {
                setPhotos([image]);
            }
        }
    };

    if (place_id) {
        fetchRestaurantData();
    }
}, [place_id, image]);


  useEffect(() => {
    console.log("Photos à afficher dans RestoScreen:", photos);
}, [photos]);


  const fetchParkings = async () => {
    try {
      const response = await fetch(PARKING_DATA_URL);
      const data = await response.json();
      setParkings(data.features);
    } catch (error) {
      console.error("Erreur lors de la récupération des parkings:", error);
    }
  };
  useEffect(() => {
    fetchUserLocation();
    fetchNearbyRestaurants();
    fetchParkings();
  }, []);

  const calculateDistances = async () => {
    // Distance to user
    const userDistanceResult = await fetchRouteDistance(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: address.coordinates[1], longitude: address.coordinates[0] }
    );

    // Find nearest parking
    const nearestParkingLocation = findNearestParking();
    const parkingDistanceResult = nearestParkingLocation
      ? await fetchRouteDistance(
        {
          latitude: address.coordinates[1],
          longitude: address.coordinates[0],
        }, // Restaurant location
        {
          latitude: nearestParkingLocation.latitude,
          longitude: nearestParkingLocation.longitude,
        }
      )
      : null;

    setDistances({
      toUser: userDistanceResult,
      toParking: parkingDistanceResult,
    });
    setNearestParking(nearestParkingLocation);
  };

  useEffect(() => {
    if (userLocation && location) {
      calculateDistances();
    }
  }, [userLocation, parkings]);

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  const fetchNearbyRestaurants = async () => {
    try {
      const response = await fetch(`${backendAdress}/findNearbyRestaurants`);
      const data = await response.json();
      setNearbyRestaurants(data);
      // console.log(data)
    } catch (error) {
      console.error("Error fetching nearby restaurants:", error);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    setIsFavorite([...user.favorites])
  }, [user.favorites.length])

  useEffect(() => {
    if (userLocation && address) {
      const restaurantLat = parseFloat(address.coordinates[1]);
      const restaurantLon = parseFloat(address.coordinates[0]);

      // Calculer le point médian
      const midLat = (userLocation.latitude + restaurantLat) / 2;
      const midLon = (userLocation.longitude + restaurantLon) / 2;

      // Calculer la distance entre les deux points pour déterminer le zoom
      const latDelta = Math.abs(userLocation.latitude - restaurantLat) * 2;
      const lonDelta = Math.abs(userLocation.longitude - restaurantLon) * 2;

      setMapRegion({
        latitude: midLat,
        longitude: midLon,
        latitudeDelta: Math.max(latDelta, 0.02), // Minimum zoom
        longitudeDelta: Math.max(lonDelta, 0.02), // Minimum zoom
      });
    }
  }, [userLocation, address]);

  const photosFromApi = [];
  const videoFromApi = [];

   const getTypeIcon = () => {
    switch (type) {
      case "family":
        return { icon: "users", text: "Famille" };
      case "date":
        return { icon: "heart", text: "Rendez-vous" };
      case "couple":
        return { icon: "user-plus", text: "Couple" };
      default:
        return { icon: "cutlery", text: "Restaurant" };
    }
  };

  const { icon, text } = getTypeIcon();

  useEffect(() => {
    (async () => {
      const result = await Camera.requestCameraPermissionsAsync();
      setHasPermission(result && result.status === "granted");
    })();
  }, []);


  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setIsCameraVisible(false);
      setPhotoUri(photo.uri);
      setModalVisible(true);
    }
  };

  const openGPS = () => {
    if (!isConnected) {
      // Ouvrir le modal si non connecté rajouter ismael
      dispatch(toggleModal(true));
      return;
    } else {
      const url = Platform.select({
        ios: `maps:0,0?q=${location}`,
        android: `geo:0,0?q=${location}`,
      });
      Linking.openURL(url);
    }
  };

  const handleFavorite = (item) => {
    if (!isConnected) {
      return navigation.navigate('User')
    }

    const infos = {
      token: user.token,
      obj_id: place_id
    }

    fetch('https://the-best-backend.vercel.app/users/favorites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infos)
    })
      .then(response => response.json())
      .then(data => {
        if (data.result) {
          console.log(data.result)
          dispatch(addFavoritesToStore(infos.obj_id))
        } else {
          dispatch(removeFavoritesToStore(infos.obj_id))
        }
      })
      .catch(error => {
        console.error('Erreur de la requête:', error)
      })
  }

  // Recupération des avis Besters de la BDD par rapport a la place_id du resto
  useEffect(() => {
    fetch(`${backendAdress}/reviews/${place_id}`)
    .then(response => response.json())
    .then((data) => {
      // console.log(data)
      if (data.result){
        setReviewsFromDB(data.reviews)
      } else {
        console.log("Aucun Bester n'a laissé d'avis. Soyez le premier ! ")
      }
    })
  }, [reviewsFromDB])

  const handleAddReview = (review) => {
    const newReview = {
      ...review,
      date: new Date().toISOString(),
      isUserReview: true,
    };

    if (userReview) {
      // Modifier l'avis existant
      setReviewsList(reviewsList.map((r) => (r.isUserReview ? newReview : r)));
    } else {
      // Ajouter un nouvel avis
      setReviewsList([...reviewsList, newReview]);
    }
    setUserReview(newReview);
    setPhotoUri(null);
  };

  const handleEditReview = () => {
    if (!isConnected) {
      // Ouvrir le modal si non connecté rajouter ismael
      dispatch(toggleModal(true));
      return;
    } else {
      if (userReview) {
        setPhotoUri(userReview.photo);
        setModalVisible(true);
      }
    }
  };
  const handleDeleteReview = (review) => {
    if (!isConnected) {
      // Ouvrir le modal si non connecté rajouter ismael
      dispatch(toggleModal(true));
      return;
    } else {
      fetch(`${backendAdress}/reviews`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({token: user.token, _id: review._id})
      })
        .then(response => response.json())
        .then((data) => {
          if(data.result) {
            console.log('Avis supprimé')
            setReviewsFromDB(reviewsFromDB.filter(reviews => reviews._id !== review._id))
          }else{
            console.error('Erreur:', data.error)
          }
        })
      if (userReview) {
        setReviewsList(reviewsList.filter((r) => r.isUserReview === false));
        setUserReview(null);
      }
    }
  };

  // Comparatif des dates des avis afin que les avis les plus récents soient affichés en premiers
  const sortedReviews = reviewsFromDB.sort((a, b) => 
    new Date(b.created) - new Date(a.created)
  )

  const googleReviews = reviews.map((infos, i) => {
    const [isExpanded, setIsExpanted] = useState(false) //Pour afficher l'intégralité d'un avis ou non


    const toggleExpand = () => setIsExpanted(!isExpanded)
    return (
      <View style={styles.reviewItem} key={i}>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, index) => (
            <FontAwesome
              // key={i}
              name={index < infos.rating ? "star" : "star-o"}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
        <Text style={styles.reviewName}>{infos.author}</Text>
        <ScrollView> 
        <Text style={styles.reviewComment} maxLength={50}>{isExpanded ? infos.text : infos.text.length > 50 ? `${infos.text.substring(0, 50)}...`: infos.text}
        </Text>
        {infos.text.length > 50 && (
          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.showMoreText}>
              {isExpanded ? 'Moins' : 'Plus'} 
            </Text>
          </TouchableOpacity>
        )}

        </ScrollView>
        <Text style={styles.reviewDate}>
          {new Date(infos.date).toLocaleDateString()}
        </Text>
        {user.token === infos.user ? (
      <View>

        <TouchableOpacity onPress={() => handleDeleteReview(infos)}>
          <Text style={styles.deleteReview}>Delete</Text>
        </TouchableOpacity>
      </View>) : (<View/>
    )}
      </View>
    )
  })

  const uploadPhoto = async (uri) => {
    // Implémentation de l'upload de la photo
    console.log("Photo uploaded:", uri);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${title} - ${description}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!hasPermission || !isFocused) {
    return <View />;
  }

  const fetchRouteDistance = async (origin, destination) => {
    const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${DISTANCE_MATRIX_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.status === "OK"
        ? data.rows[0].elements[0].distance.text
        : null;
    } catch (error) {
      console.error("Distance calculation error:", error);
      return null;
    }
  };

  const findNearestParking = () => {
    if (!userLocation || !parkings.length) return null;

    const nearestParking = parkings.reduce((nearest, parking) => {
      const parkingCoords = {
        latitude: parking.properties.latitude,
        longitude: parking.properties.longitude,
      };

      const distance = calculateHaversineDistance(userLocation, parkingCoords);

      return !nearest || distance < nearest.distance
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const getParkingProximityColor = (distance) => {
    let distanceInKm;

    if (typeof distance === "string" && distance.includes("km")) {
      distanceInKm = parseFloat(distance);
    } else {
      const distanceInMeters = parseFloat(distance);
      distanceInKm = distanceInMeters / 1000; // Convert meters to kilometers
    }

    // Change the color based on the distance to the nearest parking
    if (distanceInKm < 1) {
      return "green";
    } else if (distanceInKm <= 3) {
      return "orange";
    } else {
      return "red";
    }
  };

  const navigateToMap = () => {
    const restaurantDetails = {
      name: title,
      description: description,
      rating: rating,
      photo: image,
      phoneNumber: phoneNumber,
      address: {
        type: "Point",
        coordinates: [
          parseFloat(address.coordinates[0]),
          parseFloat(address.coordinates[1]),
        ],
      },
      location: {
        latitude: parseFloat(address.coordinates[1]),
        longitude: parseFloat(address.coordinates[0]),
      },
    };

    navigation.navigate("Map", {
      restaurant: restaurantDetails,
      centerOnRestaurant: true
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <View style={styles.imageContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={[styles.image, { width: screenWidth }]}
                  />
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.favoriteIcon}
                onPress={() => { handleFavorite() }
                }
              >
                <Feather
                  name="heart"
                  size={24}
                  color={isFavorite.some(data => place_id === data) ? "#FF0000" : "#FFFFFF"}
                />
              </TouchableOpacity>
              <View style={styles.imageOverlay}>
                <Text style={styles.overlayTitle}>{title}</Text>
                <Text style={styles.overlayLocation}>{location}</Text>
                <FontAwesome name={icon} size={18} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => { isConnected ? setIsCameraVisible(true) : dispatch(toggleModal()) }}
                >
                  <Feather name="camera" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <Feather name="share-2" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Partager</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => { isConnected ? setModalVisible(true) : dispatch(toggleModal()) }}
                >
                  <Feather name="edit" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Avis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={openGPS}>
                  <Feather name="navigation" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>GPS</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal={true}>
                {googleReviews}
              {/* <Text style={styles.description}>{description}</Text> */}
              </ScrollView>
              <View style={styles.mapPreview}>
                <MapView
                  style={styles.map}
                  region={mapRegion}
                  onPress={navigateToMap}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  {/* Restaurant Marker */}
                  <Marker
                    coordinate={{
                      latitude: parseFloat(address.coordinates[1]),
                      longitude: parseFloat(address.coordinates[0]),
                    }}
                    title={title}
                    description={`Rating: ${rating}`}
                  >
                    <View style={styles.restaurantMarker}>
                      <Image
                        source={require("../assets/IMG_0029.png")}
                        style={{ width: 30, height: 30 }}
                      />
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>
                          {rating ? rating.toFixed(1) : "N/A"}
                        </Text>
                      </View>
                    </View>
                  </Marker>

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
                Distance jusqu'à vous : {distances.toUser || "Calculating..."}
                </Text>
                {nearestParking && (
                  <View style={styles.parkingDistanceContainer}>
                    <Text style={styles.distanceText}>
                    Distance du parking le plus proche :
                    </Text>
                    <Text
                      style={[
                        styles.distanceText,
                        {
                          color: getParkingProximityColor(distances.toParking),
                        },
                      ]}
                    >
                      {distances.toParking || "Calculating..."}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <FontAwesome
                    key={index}
                    name={index < Math.floor(rating) ? "star" : "star-o"}
                    size={24}
                    color="#FFD700"
                  />
                ))}
                <Text style={styles.rating}>{rating}/5</Text>
              </View>
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
              >
                <Feather name="phone" size={20} color="#FFFFFF" />
                <Text style={styles.phoneNumber}>{phoneNumber}</Text>
              </TouchableOpacity>
              <Text style={styles.reviewsTitle}>Avis</Text>
            </View>
          </View>
        }
        data={sortedReviews}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            {item.photo && (
              <Image source={{ uri: item.photo }} style={styles.reviewPhoto} />
            )}
            <View style={styles.reviewRating}>
              {[...Array(5)].map((_, index) => (
                <FontAwesome
                  key={index}
                  name={index < item.rating ? "star" : "star-o"}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.reviewComment}>{item.username}</Text>
            <Text style={styles.reviewComment}>{item.text}</Text>
            <Text style={styles.reviewDate}>
              {new Date(item.created).toLocaleDateString()}
            </Text>
            {item.isUserReview && (
              <View>
                <TouchableOpacity onPress={handleEditReview}>
                  <Text style={styles.editReview}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteReview(item)}>
                  <Text style={styles.deleteReview}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
       
        
        />
      
      <ReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddReview}
        photo={photoUri}
        place_id={place_id}
      />
      {isCameraVisible && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            ref={(ref) => (cameraRef.current = ref)}
          >
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Feather name="camera" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 30,
    resizeMode: "cover",
    marginTop: 10,
  },
  favoriteIcon: {
    position: "absolute",
    top: 30,
    right: 20,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 10,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  overlayLocation: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  rating: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFAA00",
    marginLeft: 5,
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D9CDB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  phoneNumber: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#C44949",
    padding: 12,
    borderRadius: 12,
    width: "40%",
    marginVertical: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    marginTop: 5,
    fontSize: 14,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  reviewItem: {
    width: 350,
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewRatingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
    color: "#FFAA00",
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: "#666666",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666666",
  },
  showMoreText: {
    fontWeight: 'bold',

  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    width: "90%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#C44949",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 15,
    fontSize: 14,
  },
  commentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    backgroundColor: "#C44949",
    padding: 10,
    borderRadius: 25,
    width: "40%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    margin: 20,
  },
  captureButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "#F2994A",
    padding: 15,
    borderRadius: 50,
  },
  reviewPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  editReview: {
    color: "#C44949",
    fontWeight: "bold",
    marginTop: 5,
  },
  deleteReview: {
    color: "#C44949",
    fontWeight: "bold",
    marginTop: 5,
  },
  imageWrapper: {
    width: "100%",
    paddingHorizontal: 100,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  image: {
    height: 300,
    resizeMode: "cover",
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
    backgroundColor: "#F4F4F4",
  },
  distanceText: {
    fontSize: 14,
    marginBottom: 5,
  },
  parkingDistanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  restaurantMarker: {
    alignItems: "center",
  },
  ratingBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ratingText: {
    fontSize: 12,
    color: "#000",
  },
});

