import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/HomeScreen";
import LikeScreen from "./screens/LikeScreen";
import MapScreen from "./screens/MapScreen";
import RestoScreen from "./screens/RestoScreen";
import UserScreen from "./screens/UserScreen";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
// import { toggleModal } from "../reducers/user";
import user from "./reducers/user";

import Modal from "./components/Modal";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { Header } from "react-native/Libraries/NewAppScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";

const store = configureStore({
  reducer: { user },
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

export default function App() {
  return (
    <Provider store={store}>

      <NavigationContainer>
          <Modal />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName = "";
              const user = useSelector((state) => state.user.value);
              console.log(user.avatarUrl);

              let isConnected = false;
              if (user.token?.length > 0) {
                isConnected = true;
              }

              if (route.name === "Home") {
                fontName = FontAwesome;
                iconName = "home";
                return (
                  <FontAwesome name={iconName} size={size} color={color} />
                );
              } else if (route.name === "User" && !isConnected) {
                fontName = FontAwesome;
                iconName = "user";
                return (
                  <FontAwesome name={iconName} size={size} color={color} />
                );
              } else if (route.name === "User" && isConnected) {
                const avatarMap = {
                  "map-pin-yellow": require(`./assets/map-pin-yellow.png`),
                  avatar1: require(`./assets/avatars/avatar1.png`),
                  avatar2: require(`./assets/avatars/avatar2.png`),
                  avatar3: require(`./assets/avatars/avatar3.png`),
                };
                return (
                  <Image
                    // source={{uri: (`../assets/${user.avatarUrl}.png`)}}
                    source={avatarMap[user.avatarUrl]}
                    style={styles.userImage}
                  />
                );
              } // Si l'utilisateur est connecté, on affiche l'icône "Like"
              if (route.name === "Like") {
                fontName = FontAwesome;
                iconName = "heart";
                return (
                  <FontAwesome name={iconName} size={size} color={color} />
                );
              } else if (route.name === "Map") {
                fontName = Feather;
                iconName = "map-pin";
                return <Feather name={iconName} size={size} color={color} />;
              }

              // return <fontName name={iconName} size={size} color={color} />

              // return <Entypo name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "#C44949",
            tabBarInactiveTintColor: "grey",
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={StackNavigator} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Like" component={LikeScreen} />
          <Tab.Screen name="User" component={UserScreen} />
          {/* <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View> */}
        </Tab.Navigator>
      </NavigationContainer>
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
