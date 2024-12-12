import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Modal } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { toggleModal } from "../reducers/user";
import { useDispatch, useSelector } from "react-redux";

export default function LikeIcon({ onClickIcon, color }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const isConnected = user?.isConnected;
  //const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLikePress = () => {
    if (!isConnected) {
      // Ouvrir le modal si non connecté
      dispatch(toggleModal(true));

      return;
    } else {
      // Action "like" si connecté
      console.log("Action 'Like' exécutée !");
      onClickIcon();
      // Ajoutez ici votre code pour liker un post ou effectuer une autre action
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleLikePress}
        style={{ height: 30, width: 30 }}
      >
        <FontAwesome name="heart" size={20} color={color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent pour le modal
  },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, width: 200 },
});
