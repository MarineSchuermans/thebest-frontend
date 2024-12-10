import { Button, Text, View, StyleSheet, Image} from 'react-native';
import MapView from 'react-native-maps';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';



export default function MapScreen({ navigation }) {
    const user = useSelector((state) => state.user.value)

    // console.log(user)

          // if (currentLocation == null) {
  //   return (
  //     <View>
  //     </View>
  //   )
  // }

  const favoritesMarkers = user.favorites.map((data, i) => {
    console.log('location')
    return (
      <Marker key= {i} pinColor ={'#C44949'} coordinate={{ latitude: data.latitude, longitude: data.longitude}} title={data.title}>
        <Image source= {require('../assets/Icone_Favoris.png')} style={styles.markerImage}/>
      </Marker>
    )
  })


    return (
        <MapView
        initialRegion={{
          latitude: user.places.latitude,
          longitude: user.places.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={{ flex: 1 }}
       >
        <Marker pinColor ={'#C44949'}coordinate={{ latitude: user.places.latitude, longitude: user.places.longitude}} title='My Position'>
        </Marker>
        {favoritesMarkers}
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
      width: 80,
      height: 80,
      color: 'red',
    },

  });