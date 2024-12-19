import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import styles from '../styles';

const MapViewComponent = ({ mapRegion, address, rating, userLocation, navigateToMap }) => (
  <View style={styles.mapPreview}>
    <MapView
      style={styles.map}
      region={mapRegion}
      onPress={navigateToMap}
      scrollEnabled={false}
      zoomEnabled={false}
    >
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
            <Text style={styles.ratingText}>{rating ? rating.toFixed(1) : "N/A"}</Text>
          </View>
        </View>
      </Marker>
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
);

export default MapViewComponent;