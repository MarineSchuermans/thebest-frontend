import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { backendAdress } from "../config";
import { useDispatch } from "react-redux";
import { logout } from "../reducers/user"; 

export default function DeleteCompte() {
  const navigation = useNavigation();
  const token = useSelector((state) => state.user.value.token);
  const dispatch = useDispatch();

  const deleteUser = () => {
    console.log(token);
    let headersList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "Content-Type": "application/json",
    };

    let bodyContent = JSON.stringify({
      token: token,
    });

    fetch(backendAdress + "/users/delete", {
      method: "DELETE",
      body: bodyContent,
      headers: headersList,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          console.log("Compte supprimé :", data.message);
          dispatch(logout());  //utilisation de dispatch pour ramener 
          Alert.alert("Compte supprimé avec succès.");
          navigation.navigate("Home");
        } else {
          console.error("Erreur :", data.error);
          Alert.alert("Erreur", data.error); 
        }
      })
      .catch((error) => {
        console.error("Erreur serveur :", error);
        Alert.alert(
          "Erreur serveur",
          "Une erreur est survenue lors de la suppression : " + error.message
        );
      });
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirmation",
      "Supprimer compte ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => deleteUser() },
      ],
      { cancelable: false }
    );
  };

  const handleDeletePress = () => {
    if (!token) {
      console.log("L'utilisateur n'est pas connecté !");
      return;
    }
    console.log("Action 'delete' exécutée !");
    confirmDelete();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>cliquez pour desactiver votre compte</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
        <Text style={styles.buttonText}> Supprimer profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: '80%',
  },
  text: {
    color: "black",

  },
  deleteButton: {
    backgroundColor: "rgba(255, 0, 0, 0.74)",
    borderRadius: 30,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 51,
  },
  buttonText: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
  },
});