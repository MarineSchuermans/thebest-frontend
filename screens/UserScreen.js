import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import Login from "../components/Login";
import DeleteCompte from "../components/DeleteCompte";
import { useSelector } from "react-redux";
import ModifierUser from "../components/ModifierUser";


export default function UserScreen({}) {
  const user = useSelector((state) => state.user.value);

  return (
    <View style={styles.container}>
      <Login />

      {/* Afficher DeleteCompte uniquement si l'utilisateur est connecté */}
      {user.token ? <DeleteCompte /> : null}
      {user.token ? <ModifierUser currentEmail={user.email} currentUsername={user.username}/> :  null}
      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",

  },
});
