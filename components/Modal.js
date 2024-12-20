import { useNavigation } from "@react-navigation/native";
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
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { backendAdress } from "../config";
import GoogleSingnin from "./Google-Singn-in";

export default function Modal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);
  const isModalVisible = user.isModalVisible;
  const [isSignUp, setIsSignUp] = useState(false); // Gère l'état entre Sign-in et Sign-up
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); 

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
          data.favorites.forEach(favorite => {
            if (user.favorites.length === 0){
              dispatch(addFavoritesToStore(favorite))
            } else if (user.favorites.findOne(favorite) === false){
              console.log(false)
              dispatch(addFavoritesToStore(favorite))
            }

          })
          
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
        } else {
          Alert.alert("Error", data.error || "Login failed.");
        }
      })
      .catch(() => {
        Alert.alert("Error", "An error occurred. Please try again later.");
      });
  };
  
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


          <Text style={styles.label}>Nom d'utilisateur :</Text>
          <TextInput
            placeholder="Minimum 3 cararactères"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <Text style={styles.label}>Mot de passe :</Text>
          <TextInput
            placeholder="Minimum 8 caractères"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {isSignUp && (
            <>
              <Text style={styles.label}>Email :</Text>
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

          <TouchableOpacity style={styles.Text} onPress={toggleSignUp}>
            <Text>
              {isSignUp
                ? "Déjà un compte ? Se connecter"
                : "Pas de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond sombre avec transparence
  },
  modalContent: {
    backgroundColor: "#FFFFFF", // Fond blanc
    padding: 20,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5, 
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 5,
  },
  input: {
    height: 30, // Hauteur plus petite pour les champs
    borderBottomWidth: 1, // Bordure en bas
    borderBottomColor: "#DDD", // Couleur gris clair
    marginBottom: 10, // Moins d'espace entre les inputs
    width: "100%",
    fontSize: 15,
    color: "#333", // Texte sombre pour une bonne lisibilité
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#C44949", // Bouton rouge
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 50, // Marge de 2 cm environ (environ 40px)
  },
  buttonText: {
    color: "#FFFFFF", // Texte blanc pour contraste
    fontSize: 14,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 90,
    fontSize: 15,
    color: "black", // Liens en couleur bouton
    textDecorationLine: "underline",
    textAlign: "center",
  },
  Text: {
    marginTop: 15
  }
});

