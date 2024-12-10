import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../reducers/user";
import {
  View,
  Alert,
  Text,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { backendAdress } from "../config";

export default function UserScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Gère l'état entre Sign-in et Sign-up
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Utilisé uniquement pour Sign-up

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) => password.length >= 8;

  const toggleSignUp = () => setIsSignUp(!isSignUp);

  const handleSignUp = () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert("Weak password", "Password must be at least 8 characters long.");
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
          Alert.alert("Success", "Registration successful!");
          dispatch(login({ username, token: data.token }));
          setUsername("");
          setPassword("");
          setEmail("");
          setIsModalVisible(false);
        } else {
          Alert.alert("Error", data.error || "Registration failed.");
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
          dispatch(login({ username, token: data.token }));
          setUsername("");
          setPassword("");
          setIsModalVisible(false);
          navigation.navigate("Home");
        } else {
          Alert.alert("Error", data.error || "Login failed.");
        }
      })
      .catch(() => {
        Alert.alert("Error", "An error occurred. Please try again later.");
      });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    setIsSignUp(false); // Réinitialiser sur Sign-in à chaque ouverture
  };

  return (
    <View style={styles.container}>
      {user.token ? (
        <View style={styles.logoutSection}>
          <Text>Welcome {user.username} / </Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <TouchableOpacity onPress={toggleModal} style={styles.userIcon}>
          <Text>{isModalVisible ? "Close" : "Login/Sign-up"}</Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={isModalVisible}
        onRequestClose={toggleModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalContent}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.registerContainer}>
                <TouchableOpacity onPress={toggleModal} style={styles.closeModal}>
                  <Text style={styles.closeModalText}>X</Text>
                </TouchableOpacity>

                {isSignUp ? (
                  <>
                    <Text>Sign-up</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      onChangeText={setUsername}
                      value={username}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      onChangeText={setEmail}
                      value={email}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      secureTextEntry
                      onChangeText={setPassword}
                      value={password}
                    />
                    <Button title="Register" onPress={ () => handleSignUp() + navigation.navigate("Home")} />
                    <TouchableOpacity onPress={toggleSignUp}>
                      <Text style={styles.toggleText}>
                        Already have an account? Sign in
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text>Sign-in</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      onChangeText={setUsername}
                      value={username}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      secureTextEntry
                      onChangeText={setPassword}
                      value={password}
                    />
                    <Button title="Connect" onPress={handleSignIn}
                 />
                    <TouchableOpacity onPress={toggleSignUp}>
                      <Text style={styles.toggleText}>
                        Don't have an account? Sign up
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Vos styles d'origine + ajout d'un style pour `toggleText`
  toggleText: {
    marginTop: 10,
    color: "#007BFF",
    textAlign: "center",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9', // Un gris clair pour un fond neutre et moderne
  },
  userIcon: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Pour un effet d'ombre (Android)
  },
  registerContainer: {
    padding: 25,
    backgroundColor: '#C44949',
    borderRadius: 25,
    width: '85%',
    shadowColor: '#000',
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
    borderColor: '#E5E5E5',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 12,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    fontSize: 16,
    color: '#333', // Texte sombre pour un bon contraste
  },
  logoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Ajout d'un overlay semi-transparent
  },
  closeModal: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginRight: -10,
    padding: 5,
    backgroundColor: '#D9D9D9',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConnect: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  btnConnectText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnRegister: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C44949',
    alignItems: 'center',
  },
//   btnRegisterText: {
//     color: '#C44949',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
});
 