import React, { useState } from "react";
import { Modal, TouchableOpacity, KeyboardAvoidingView, Platform, View, Text, Image, TextInput } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import styles from "./styles";

const ReviewModal = ({ visible, onClose, onSubmit, photo, place_id }) => {
  const user = useSelector((state) => state.user.value);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    // Fetch to post reviews to DB
    fetch(`${backendAdress}/reviews`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({token: user.token, place_id: place_id, rating: rating, text: comment, photo: photo})
    }) 
      .then(response => response.json())
      .then((data) => {
        if (data.result){
          console.log(data)
        } else {
          console.log(data)
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
      <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a Review</Text>
          {photo && <Image source={{ uri: photo }} style={styles.reviewPhoto} />}
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                <FontAwesome name={index < rating ? "star" : "star-o"} size={30} color="#FFD700" />
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

export default ReviewModal;