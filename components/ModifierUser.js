import React, { useState } from "react";
import { View, Text, TextInput, Button, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { backendAdress } from "../config"; // Si tu utilises une variable pour l'URL de ton backend

export default function ModifierUser({ currentUsername, currentEmail }) {
  const [username, setUsername] = useState(currentUsername || "");
  const [email, setEmail] = useState(currentEmail || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // État pour contrôler la visibilité du Modal

  const handleModifierUser = () => {
    console.log("Données envoyées :", { username, email, password });

    // Création de l'objet contenant uniquement les champs remplis
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
          setMessage("Utilisateur modifié avec succès !");
          setModalVisible(false); // Ferme le modal après la mise à jour
          
          setTimeout(() => { //sert ca enlever l erreur 
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
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
        <Text style={styles.buttonText}>Modifier Profile</Text>
      </TouchableOpacity>

      {/* Modal pour afficher les champs de saisie */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier Utilisateur</Text>

            <Text>Nom d'utilisateur :</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Nouveau nom d'utilisateur"
              style={styles.input}
            />

            <Text>Email :</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Nouvel email"
              style={styles.input}
            />

            <Text>Mot de passe :</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Nouveau mot de passe"
              secureTextEntry
              style={styles.input}
            />

            <Button title="Modifier" onPress={handleModifierUser} />

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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: '#FFEB3B', // Couleur jaune pour le bouton
    padding: 15,
    borderRadius: 30, // Rounded corners for a more modern look
    width: "80%", // Adjust width for a balanced button
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 51,
    marginTop: 1,

  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black", // Texte noir pour contraster avec le fond jaune
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparence en arrière-plan
  },
  modalContainer: {
    backgroundColor: "#C44949", // Couleur du fond du modal
    padding: 20,
    width: "80%",
    borderRadius: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "black", // Couleur du texte du titre
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
  closeButton: {
    color: "red", // Couleur rouge pour le bouton "Fermer"
    marginTop: 10,
  },
});
