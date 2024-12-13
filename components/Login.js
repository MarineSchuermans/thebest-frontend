import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, toggleModal } from "../reducers/user";
import {
  View,
  Alert,
  Text,
  TextInput,
  Button,
  Image,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function Login() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  // const [isModalVisible, setIsModalVisible] = useState(false);
  const isModalVisible = user.isModalVisible;

  const handleLogout = () => {
    dispatch(logout());
  };

  const _toggleModal = () => {
    dispatch(toggleModal());
  };

console.log(user)

  return (
    <View style={styles.container}>
      {user.token ? (
        <View style={styles.logoutSection}>
          <Text>Bienvenu, Bester {user.username} / </Text>
          <Button title="Se Deconnecter" onPress={handleLogout} />
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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20, // Espace sous le titre
    color: "#333",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
    fontWeight: "500",
  },
  avatar: {
    margin: 10,
    width: 150,
    height: 150,
  },
  // Vos styles d'origine + ajout d'un style pour `toggleText`
  toggleText: {
    marginTop: 10,
    color: "#000",
    textAlign: "center",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F9F9", // Un gris clair pour un fond neutre et moderne
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
    elevation: 5, // Pour un effet d'ombre (Android)
  },
  registerContainer: {
    padding: 25,
    backgroundColor: "#C44949",
    borderRadius: 25,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  registerSection: {
    marginBottom: 15,
  },
  input: {
    height: 45,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 12,
    borderRadius: 8,
    backgroundColor: "#D9D9D9",
    fontSize: 16,
    color: "#333", // Texte sombre pour un bon contraste
  },
  logoutSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Ajout d'un overlay semi-transparent
  },
  closeModal: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginRight: -10,
    padding: 5,
    backgroundColor: "#D9D9D9",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnConnect: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  btnConnectText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnRegister: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#C44949",
    alignItems: "center",
  },
  btnRegisterText: {
    color: "#C44949",
    fontSize: 16,
    fontWeight: "bold",
  },
});
