import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles';

const ReviewItem = ({ item, handleDeleteReview }) => (
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
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.editReview}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteReview(item)}>
          <Text style={styles.deleteReview}>Delete</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

export default ReviewItem;