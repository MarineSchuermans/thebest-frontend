import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, toggleModal, addFavoritesToStore } from "../reducers/user";
import {
  View,
  Alert,
  Text,
  TextInput,
  Button,
  Image,
  Modal as RnModal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { backendAdress } from "../config";
import { useNavigation } from "@react-navigation/native";

export default function Modal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  // const [isModalVisible, setIsModalVisible] = useState(false);

  const isModalVisible = user.isModalVisible;
  const [isSignUp, setIsSignUp] = useState(false); // Gère l'état entre Sign-in et Sign-up

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Utilisé uniquement pour Sign-up

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validateUsername = (username) => username.length >= 3;
  const validatePassword = (password) => password.length >= 8;

  const toggleSignUp = () => setIsSignUp(!isSignUp);

  const handleSignUp = () => {
    if (!validateEmail(email)) {
      Alert.alert(
        "Email invalide",
        "Veuillez saisir une adresse électronique valide."
      );
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (!validateUsername(username)) {
      Alert.alert(
        "Username invalide",
        "Username doit comporter au moins 3 characters."
      );
      return;
    }

    fetch(`${backendAdress}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          Alert.alert("Inscription réussie !");
          _toggleModal();
          dispatch(
            login({ username, token: data.token, avatarUrl: data.avatarUrl })
          );
          setUsername("");
          setPassword("");
          setEmail("");
          navigation.navigate("Home");
          // setIsModalVisible(false);
        } else {
          Alert.alert("Error", data.error || "L'enregistrement a échoué.");
        }
      })
      .catch(() => {
        Alert.alert("Error", "An error occurred. Please try again later.");
      });
  };

  const handleSignIn = () => {
    fetch(`${backendAdress}/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          console.log(data)
          console.log("Server Response:", data);
          _toggleModal();
          dispatch(
            login({ username, token: data.token, avatarUrl: data.avatarUrl })
          );
          dispatch(addFavoritesToStore({...data.favorite}))
          // fetch(`${backendAdress}/users/favorites`, {
          //   method: 'GET',
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({token: data })

          // })
          //   .then(response => response.json())
          //   .then (fav => {
          //     console.log(fav)
          //   })
          setUsername("");
          setPassword("");
          navigation.navigate("Home");
          // setIsModalVisible(false);
        } else {
          Alert.alert("Error", data.error || "Login failed.");
        }
      })
      .catch(() => {
        Alert.alert("Error", "An error occurred. Please try again later.");
      });
  };

  const _toggleModal = () => {
    // setIsModalVisible(!isModalVisible);
    dispatch(toggleModal());
    setIsSignUp(false); // Réinitialiser sur Sign-in à chaque ouverture
  };

  return (
    // <View style={styles.container}>
    <RnModal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={_toggleModal}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={_toggleModal}>
        <View style={styles.modalContent}>
          <Text>{isSignUp ? "Inscription" : "Connexion"}</Text>

          <TextInput
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {isSignUp && (
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          )}

          <Button
            title={isSignUp ? "S'inscrire" : "Se connecter"}
            onPress={isSignUp ? handleSignUp : handleSignIn}
          />

          <TouchableOpacity onPress={toggleSignUp}>
            <Text>
              {isSignUp
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </RnModal>
    // </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, width: 200 },
});
