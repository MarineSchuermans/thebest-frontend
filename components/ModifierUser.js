import React, { useState } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { backendAdress } from "../config"; // Si tu utilises une variable pour l'URL de ton backend
import { useDispatch, useSelector} from "react-redux";
import { modifierUser } from "../reducers/user";

export default function ModifierUser({ currentUsername, currentEmail }) {
  const [username, setUsername] = useState(currentUsername || "");
  const [email, setEmail] = useState(currentEmail || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // État pour contrôler la visibilité du Modal
  const dispatch = useDispatch();
 
  const currentUsernameFromStore = useSelector((state) => state.user.value.username);  const handleModifierUser = () => {
    console.log("Données envoyées :", { username, email, password });
    

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    fetch(`${backendAdress}/users/modifier`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...updateData }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Réponse du serveur :", data);
        if (data.result) {
        
          dispatch(modifierUser({ username: data.User.username }));
          setMessage("Utilisateur modifié avec succès !");
          setModalVisible(false);
          setUsername('');
          setPassword('');
          setEmail('');


          setTimeout(() => {
            setMessage("");
          }, 3000);
        } else {
          setMessage(`Erreur : ${data.error}`);
        }
      })
      .catch((error) => {
       console.error("Erreur lors de la modification :", error);
        setMessage("Une erreur s'est produite lors de la modification.");
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.modifyButton}>
        <Text style={styles.modifyButtonText}>Modifier Profil</Text>
      </TouchableOpacity>

      {/* Modal pour afficher les champs de saisie */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier Profile</Text>

            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Nouveau nom d'utilisateur"
              style={styles.input}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email obligatoire"
              style={styles.input}
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Nouveau mot de passe"
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleModifierUser}>
              <Text style={styles.submitButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {message && <Text style={{ color: "green" }}>{message}</Text>}
    </View>
  );
}

// Définition des styles EN DEHORS du composant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: '0%',
  },
  modifyButton: {
    backgroundColor: "#C44949", // Rouge moderne
    padding: 15,
    borderRadius: 30,
    width: "80%", 
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: '9',
    
  },
  modifyButtonText: {
    color: "white",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center"
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#555555", 
    marginBottom: 5,
  },
  input: {
    height: 30,
    borderBottomWidth: 1, 
    borderBottomColor: "#DDD",
    marginBottom: 10,
    width: "100%",
    fontSize: 15,
    color: "#333",
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: "#C44949", // Rouge moderne
    padding: 12,
    borderRadius: 10,
    width: "100%", // Bouton pleine largeur
    alignItems: "center",
    marginTop: 40, // Espacement avec les champs
  },
  submitButtonText: {
    color: "#FFFFFF", // Texte blanc
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    color: "#C44949", // Texte rouge pour le bouton "Fermer"
    marginTop: 15,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
