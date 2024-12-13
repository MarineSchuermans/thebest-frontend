import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { login, toggleModal } from "../reducers/user";
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
import React, { useState } from "react";
import { backendAdress } from "../config";
//import { useState } from "react";
import GoogleSingnin from "./Google-Singn-in";
//import styles from "../styles/Home.module.css";

export default function Modal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
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
          console.log("Server Response:", data);
          _toggleModal();
          dispatch(
            login({ username, token: data.token, avatarUrl: data.avatarUrl })
          );
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
  // Google Sign-In setup

  // GoogleSignin.configure({
  //   webClientId: clientId,
  //   offlineAccess: true, // Utile si vous souhaitez un rafraîchissement de token
  // });

  // const handleGoogleSignIn = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices(); // Vérifie si les services Google Play sont disponibles sur l'appareil
  //     const userInfo = await GoogleSignin.signIn(); // Lance la fenêtre de connexion Google et récupère les informations de l'utilisateur
  //     const { idToken } = userInfo; // Récupère le "idToken" de la réponse de Google, qui contient les informations d'authentificatio
  //     const decoded = jwtDecode(idToken); // Décode le "idToken" pour extraire les informations utilisateur sous forme de données lisibles
  //     console.log("Decoded Google token:", decoded); // Affiche dans la console les informations extraites du "idToken" (utile pour le débogage)
  //     dispatch(login({ username: decoded.name, token: idToken })); // Envoie les informations de l'utilisateur au store Redux pour mettre à jour l'état de l'utilisateur
  //     _toggleModal(); // Ferme le modal actuel en appelant la fonction _toggleModal
  //     //navigation.navigate("Home");// Navigue vers la page d'accueil de l'application une fois l'utilisateur connecté
  //   } catch (error) {
  //     console.log(error);
  //     Alert.alert("Erreur", "Google Sign-In a échoué.");
  //   }
  // };

  const _toggleModal = () => {
    dispatch(toggleModal());
    setIsSignUp(false); // Réinitialiser sur Sign-in à chaque ouverture
  };
  return (
    <RnModal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={_toggleModal}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={_toggleModal}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {isSignUp ? "Inscription" : "Connexion"}
          </Text>
        
          <GoogleSingnin />


          <Text style={styles.label}>Nom d'utilisateur</Text>
          <TextInput
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {isSignUp && (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={isSignUp ? handleSignUp : handleSignIn}
          >
            <Text style={styles.buttonText}>
              {isSignUp ? "S'inscrire" : "Se connecter"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleSignUp}>
            <Text>
              {isSignUp
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>
          {/* Google Sign-In button */}
          {/* <GoogleSigninButton
            style={{ width: 192, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
          /> */}
        </View>
      </TouchableOpacity>
    </RnModal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond transparent sombre
  },
  modalContent: {
    backgroundColor: "#C44949", // Base de l'application
    padding: 30,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black", // Titre noir
    marginBottom: 20,
    fontFamily: "Roboto", // Exemple de police professionnelle
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "black", // Labels en noir
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC", // Gris clair
    backgroundColor: "#FFF", // Fond blanc
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: "100%",
    fontSize: 16,
  },
  button: {
    backgroundColor: "black", // Bouton noir
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF", // Texte blanc sur le bouton
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 10,
    fontSize: 14,
    color: "black", // Texte noir pour les liens
    textDecorationLine: "underline",
  },
});
