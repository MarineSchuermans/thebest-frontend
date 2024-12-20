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
          {/* Texte de bienvenue personnalisé pour l'utilisateur connecté */}
          <Text style={styles.welcomeText}>Bienvenu, Bester {user.username}!</Text>

          {/* Bouton de déconnexion stylisé */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>déconnexion</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginSection}>
          {/* Texte de bienvenue pour l'utilisateur non connecté */}
          <Text style={styles.welcomeText}>
          Bienvenue ! Connectez-vous ou inscrivez-vous pour faire partie des meilleurs et découvrir notre sélection de meilleurs restaurants." </Text>

          {/* Bouton pour ouvrir la modale de connexion */}
          <TouchableOpacity onPress={_toggleModal} style={styles.userIcon}>
            <Text>{isModalVisible ? "Fermer" : "Se Connecter | S'inscrire"}</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginBottom: 13, // Augmentation de l'espacement sous le texte
    textAlign: "center",
  },
  logoutSection: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  logoutButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",

  },
  logoutButtonText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
  userIcon: {
    padding: 25,
    backgroundColor: "#C44949",
    borderRadius: 20,
    marginBottom: 20,
    color: "black",
    fontWeight: "bold", 
  },
  loginSection: {
    alignItems: "center",
    justifyContent: "center",
     
  },
});
