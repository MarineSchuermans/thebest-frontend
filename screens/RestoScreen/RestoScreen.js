import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, FlatList, View, ScrollView, Linking, Dimensions } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import ReviewModal from "./ReviewModal";
import RestaurantInfo from "./components/RestaurantInfo";
import MapViewComponent from "./components/MapViewComponent";
import ActionsBar from "./components/ActionsBar";
import ReviewItem from "./components/ReviewItem";
import { fetchRouteDistance, calculateHaversineDistance, findNearestParking } from "./utils/distanceUtils";
import { fetchUserLocation } from "./utils/locationUtils";
import { CameraView, Camera } from "expo-camera";
import styles from "./styles";

const RestoScreen = ({ route }) => {
  const {
    title, place_id, description, rating, reviews, image, phoneNumber, location, type, address,
  } = route.params;
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [isFavorite, setIsFavorite] = useState([]);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  const [photoUri, setPhotoUri] = useState(null);
  const [reviewsFromDB, setReviewsFromDB] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [nearestParking, setNearestParking] = useState(null);
  const [distances, setDistances] = useState({ toUser: null, toParking: null });
  const [parkings, setParkings] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const isConnected = user?.token;

  useEffect(() => {
    fetchUserLocation(setUserLocation);
    fetchNearbyRestaurants();
    fetchParkings();
  }, []);

  useEffect(() => {
    if (userLocation && location) {
      calculateDistances();
    }
  }, [userLocation, parkings]);

  const calculateDistances = async () => {
    const userDistance = await fetchRouteDistance(
      userLocation, 
      { latitude: address.coordinates[1], longitude: address.coordinates[0] }
    );
    const nearestParkingLocation = findNearestParking(userLocation, parkings);
    const parkingDistance = nearestParkingLocation 
      ? await fetchRouteDistance(
          { latitude: address.coordinates[1], longitude: address.coordinates[0] },
          nearestParkingLocation
        )
      : null;

    setDistances({ toUser: userDistance, toParking: parkingDistance });
    setNearestParking(nearestParkingLocation);
  };

  const fetchParkings = async () => {
    try {
      const response = await fetch(PARKING_DATA_URL);
      const data = await response.json();
      setParkings(data.features);
    } catch (error) {
      console.error("Erreur lors de la récupération des parkings:", error);
    }
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

  const handleFavorite = () => {
    if (!isConnected) return navigation.navigate('User');

    fetch('https://the-best-backend.vercel.app/users/favorites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: user.token, obj_id: place_id })
    })
      .then(response => response.json())
      .then(data => {
        if (data.result) {
          dispatch(addFavoritesToStore(place_id));
        } else {
          dispatch(removeFavoritesToStore(place_id));
        }
      })
      .catch(error => console.error('Erreur de la requête:', error));
  };

  const handleAddReview = (review) => {
    const newReview = { ...review, date: new Date().toISOString(), isUserReview: true };
    if (userReview) {
      setReviewsList(reviewsList.map(r => (r.isUserReview ? newReview : r)));
    } else {
      setReviewsList([...reviewsList, newReview]);
    }
    setUserReview(newReview);
    setPhotoUri(null);
  };

  const handleEditReview = () => {
    if (!isConnected) return dispatch(toggleModal(true));
    if (userReview) {
      setPhotoUri(userReview.photo);
      setModalVisible(true);
    }
  };

  const handleDeleteReview = (review) => {
    if (!isConnected) return dispatch(toggleModal(true));
    fetch(`${backendAdress}/reviews`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: user.token, _id: review._id })
    })
      .then(response => response.json())
      .then((data) => {
        if(data.result) {
          console.log('Avis supprimé');
          setReviewsFromDB(reviewsFromDB.filter(r => r !== review));
        } else {
          console.error('Erreur:', data.error);
        }
      });
    if (userReview) {
      setReviewsList(reviewsList.filter(r => !r.isUserReview));
      setUserReview(null);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setIsCameraVisible(false);
      setPhotoUri(photo.uri);
      setModalVisible(true);
    }
  };

  if (!hasPermission || !isFocused) return <View />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <RestaurantInfo 
              title={title} image={image} screenWidth={screenWidth} 
              location={location} icon={icon} isFavorite={isFavorite} 
              place_id={place_id} handleFavorite={handleFavorite}
            />
            <ActionsBar 
              isConnected={isConnected} 
              setIsCameraVisible={setIsCameraVisible} 
              dispatch={dispatch} 
              handleShare={handleShare} 
              setModalVisible={setModalVisible} 
              openGPS={openGPS}
            />
            <MapViewComponent 
              mapRegion={mapRegion} 
              address={address} 
              rating={rating} 
              userLocation={userLocation} 
              navigateToMap={navigateToMap}
            />
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>
                Distance to you: {distances.toUser || "Calculating..."}
              </Text>
              {nearestParking && (
                <View style={styles.parkingDistanceContainer}>
                  <Text style={styles.distanceText}>
                    Distance to nearest parking:
                  </Text>
                  <Text style={styles.distanceText}>
                    {distances.toParking || "Calculating..."}
                  </Text>
                </View>
              )}
            </View>
          </View>
        }
        data={reviewsFromDB}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <ReviewItem item={item} handleDeleteReview={handleDeleteReview} />}
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
};

export default RestoScreen;