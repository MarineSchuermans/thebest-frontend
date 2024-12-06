import { Button, Text, View, StyleSheet, Image} from 'react-native';
import MapView from 'react-native-maps';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { Marker } from 'react-native-maps';



export default function MapScreen({ navigation }) {
    const user = useSelector((state) => state.user.value)

    console.log(user.places[0].latitude)

          // if (currentLocation == null) {
  //   return (
  //     <View>
  //     </View>
  //   )
  // }


    return (
        <MapView
        initialRegion={{
          latitude: user.places[0].latitude,
          longitude: user.places[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={{ flex: 1 }}
       >
        <Marker pinColor ={'#C44949'}coordinate={{ latitude: user.places[0].latitude, longitude: user.places[0].longitude}}>
          <Image source={require('../assets/map-pin-red.png')} style={styles.markerImage}/>
        </Marker>
       </MapView>

    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerImage: {
      width: 50,
      height: 50,
      color: 'red',
    }
  });