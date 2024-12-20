import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

AsyncStorage.setItem("hasSeenWelcome", "false");

export default function PopDescrip({}) {
  const [modalVisible, setModalVisible] = useState(false);
  // Vérification du premier lancement
  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");

      console.log(hasSeenWelcome)

      if (hasSeenWelcome !== "true") {
        setModalVisible(true);
      }
    };
    checkFirstLaunch();
  }, []);

  const closeModal = () => {
    AsyncStorage.setItem("hasSeenWelcome", "true");
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Bienvenue futur BESTER !</Text>
          <Text style={styles.modalText}>
          Découvrez les 5 meilleurs restaurants près de chez vous : les mieux notés, les plus appréciés, et prêts à vous séduire.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Fond assombri et translucide
    },
    modalContent: {
      width: "90%",
      padding: 20,
      borderRadius: 15,
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Fond translucide
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)", // Bordure subtile
      backdropFilter: "blur(10px)", // Effet flou (sur web, nécessite expo-gl pour React Native)
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 15,
      color: "white", // Texte blanc pour contraster avec le fond
      textShadowColor: "rgba(0, 0, 0, 0.5)", // Ombre pour la lisibilité
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    modalText: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 22,
      color: "white", // Texte blanc
      textShadowColor: "rgba(0, 0, 0, 0.5)", // Ombre
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    closeButton: {
      backgroundColor: "rgba(255, 255, 255, 0.2)", // Fond translucide pour le bouton
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25, // Bouton arrondi
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.4)", // Bordure discrète
    },
    closeButtonText: {
      color: "white", // Texte blanc
      fontWeight: "600",
      fontSize: 14,
      textTransform: "uppercase",
    },
  });
  