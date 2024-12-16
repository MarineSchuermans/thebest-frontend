import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
  Image,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
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
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { backendAdress } from "../config";

import { toggleModal } from "../reducers/user"; //ismael rajout

// import { ApifyClient } from 'apify-client';
const DISTANCE_MATRIX_API_KEY =
  "SJvsfAsLwymsiRh9mxc5C4KbU4R3hN5aPj9fb3eiPrezkpl8z2cq5ukdqZzH026e";
const PARKING_DATA_URL =
  "https://data.lillemetropole.fr/geoserver/wms?service=WFS&version=1.1.0&request=GetFeature&typeName=parking&outputFormat=application/json";
const ReviewModal = ({ visible, onClose, onSubmit, photo }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
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
          <Text style={styles.modalTitle}>Add a Review</Text>
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
            placeholder="Write your review"
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
    description,
    rating,
    image,
    phoneNumber,
    location,
    type,
    address,
  } = route.params;
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  const [photoUri, setPhotoUri] = useState(null);
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

  // useEffect(() => {

  //     // Initialize the ApifyClient with API token
  //     const client = new ApifyClient({
  //         token: 'apify_api_aQEbQtJvzhWHS48o1P5oq9elYbGsmn2lFuAU',
  //     });

  //     // Prepare Actor input
  //     const input = {
  //         "directUrls": [
  //             "https://www.instagram.com/meltingpot_restaurant_lille/"
  //         ],
  //         "resultsType": "posts",
  //         "resultsLimit": 5,
  //         "searchType": "hashtag",
  //         "searchLimit": 1,
  //         "addParentData": false
  //     };

  //     (async () => {
  //         // Run the Actor and wait for it to finish
  //         const run = await client.actor("shu8hvrXbJbY3Eb9W").call(input);

  //         // Fetch and print Actor results from the run's dataset (if any)
  //         console.log('Results from dataset');
  //         const { items } = await client.dataset(run.defaultDatasetId).listItems();
  //         items.forEach((item) => {
  //             console.dir(item);

  //             setPhotoPlaces(...photoPlaces, item)

  //             console.log(item)
  //         });
  //     })();
  // }, [])

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

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const isConnected = user?.token;

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

  const handleAddReview = (review) => {
    
    const newReview = {
      ...review,
      date: new Date().toISOString(),
      isUserReview: true,
    };

    if (userReview) {
      // Modifier l'avis existant
      setReviews(reviews.map((r) => (r.isUserReview ? newReview : r)));
    } else {
      // Ajouter un nouvel avis
      setReviews([...reviews, newReview]);
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
  const handleDeleteReview = () => {
    if (!isConnected) {
        // Ouvrir le modal si non connecté rajouter ismael
        dispatch(toggleModal(true));
        return;
      } else {
    if (userReview) {
      setReviews(reviews.filter((r) => r.isUserReview === false));
      setUserReview(null);
    }
}
  };

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
  // const getCoordinatesFromAddress = async (address) => {
  //     try {
  //         const json = await Geocoder.from(address);
  //         const location = json.results[0].geometry.location;
  //         return {
  //             latitude: location.lat,
  //             longitude: location.lng,
  //         };
  //     } catch (error) {
  //         console.error('Error getting coordinates:', error);
  //         return null;
  //     }
  // };

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

    navigation.navigate("Map", { restaurant: restaurantDetails });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: image }}
                style={[styles.image, { width: screenWidth }]}
              />
              <TouchableOpacity
                style={styles.favoriteIcon}
                onPress={() =>  {isConnected ? setIsFavorite(!isFavorite): dispatch(toggleModal())}}
                >
                <Feather
                  name="heart"
                  size={24}
                  color={isFavorite ? "#FF0000" : "#FFFFFF"}
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
                  onPress={() => {isConnected ? setIsCameraVisible(true) : dispatch(toggleModal())}}
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
                  onPress={() => {isConnected ? setModalVisible(true) : dispatch(toggleModal())}}
                >
                  <Feather name="edit" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Avis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={openGPS}>
                  <Feather name="navigation" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>GPS</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.description}>{description}</Text>
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
                  Distance to you: {distances.toUser || "Calculating..."}
                </Text>
                {nearestParking && (
                  <View style={styles.parkingDistanceContainer}>
                    <Text style={styles.distanceText}>
                      Distance to nearest parking:
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
        data={reviews}
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
            <Text style={styles.reviewComment}>{item.comment}</Text>
            <Text style={styles.reviewDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            {item.isUserReview && (
              <View>
                <TouchableOpacity onPress={handleEditReview}>
                  <Text style={styles.editReview}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDeleteReview}>
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
  reviewComment: {
    fontSize: 14,
    color: "#666666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
});
