import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import styles from '../styles';

const RestaurantInfo = ({ title, image, screenWidth, location, icon, isFavorite, place_id, handleFavorite }) => (
  <View style={styles.imageContainer}>
    <Image source={{ uri: image }} style={[styles.image, { width: screenWidth }]} />
    <TouchableOpacity style={styles.favoriteIcon} onPress={handleFavorite}>
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
);

export default RestaurantInfo;