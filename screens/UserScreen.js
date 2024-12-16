import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import Login from "../components/Login";

export default function UserScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Login  />
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
