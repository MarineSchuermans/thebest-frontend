import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, toggleModal } from "../reducers/user";
import {
  View,
  Text,
 
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function Login() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const isModalVisible = user.isModalVisible;

  const handleLogout = () => {
    dispatch(logout());
  };

  const _toggleModal = () => {
    dispatch(toggleModal());
  };

  console.log(user);

  return (
    <View style={styles.container}>
      {user.token ? (
        <View style={styles.logoutSection}>
          {/* Texte de bienvenue plus personnalisé */}
          <Text style={styles.welcomeText}>Bienvenu, Bester! Prêt à decouvrir les mielleure resto {user.username}! </Text>
        

          {/* Bouton de déconnexion stylisé */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>déconnexion</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={_toggleModal} style={styles.userIcon}>
          <Text>{isModalVisible ? "Close" : "Login/Sign-up"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  logoutSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#FF6347", // Couleur tomate pour un effet dynamique
    padding: 15,
    borderRadius: 30, // Rounded corners for a more modern look
    width: "80%", // Adjust width for a balanced button
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 51,
    marginTop: 1, // Ombre pour un effet de profondeur
  },
  logoutButtonText: {
    color: "black",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
  },
  userIcon: {
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Ombre pour un effet de profondeur
  },
});
