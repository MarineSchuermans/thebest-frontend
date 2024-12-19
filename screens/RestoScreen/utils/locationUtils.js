import * as Location from 'expo-location';

const fetchUserLocation = async (setUserLocation) => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.error("Location permission denied");
    return;
  }

  let location = await Location.getCurrentPositionAsync({});
  setUserLocation(location.coords);
};

export { fetchUserLocation };