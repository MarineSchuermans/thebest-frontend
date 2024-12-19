import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/HomeScreen/main";
import LikeScreen from "./screens/LikeScreen";
import MapScreen from "./screens/MapScreen";
import RestoScreen from "./screens/RestoScreen";
import UserScreen from "./screens/UserScreen";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toggleModal } from "./reducers/user";
import user from "./reducers/user";
import resto from "./reducers/resto"
import restoFiltred from "./reducers/restoFiltred"
import Modal from "./components/Modal";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
// import { TouchableOpacity } from "react-native-gesture-handler";

const store = configureStore({
  reducer: { user, resto, restoFiltred },
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Resto" component={RestoScreen} />
    </Stack.Navigator>
  );
};

function InnerApp() {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const isConnected = user?.token?.length > 0; // Vérifier la connexion de l'utilisateur

  return (
    <NavigationContainer>
      <Modal />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = "";

            if (route.name === "Home") {
              iconName = "home";
              return <FontAwesome name={iconName} size={size} color={color} />;
            } else if (route.name === "User" && !isConnected) {
              iconName = "user";
              return <FontAwesome name={iconName} size={size} color={color} />;
            } else if (route.name === "User" && isConnected) {
              const avatarMap = {
                "map-pin-yellow": require(`./assets/map-pin-yellow.png`),
                avatar1: require(`./assets/avatars/avatar1.png`),
                avatar2: require(`./assets/avatars/avatar2.png`),
                avatar3: require(`./assets/avatars/avatar3.png`),
              };
              return (
                <Image
                  source={avatarMap[user.avatarUrl]}
                  style={styles.userImage}
                />
              );
            } else if (route.name === "Like") {
              iconName = "heart";

              return <FontAwesome name={iconName} size={size} color={color} />;
            } else if (route.name === "Map") {
              iconName = "map-pin";
              return <Feather name={iconName} size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: "#C44949",
          tabBarInactiveTintColor: "grey",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={StackNavigator} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen
          name="Like"
          component={LikeScreen}
          listeners={{
            tabPress: (e) => {
              if (!isConnected) {
                e.preventDefault(); // Empêche l'accès à l'onglet
                dispatch(toggleModal(true)); // Affiche le modal
              }
            },
          }}
        />
        <Tab.Screen name="User" component={UserScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <InnerApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  userImage: {
    height: 20,
    width: 20,
  },
});
