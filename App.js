import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LikeScreen from './screens/LikeScreen';
import MapScreen from './screens/MapScreen';
import RestoScreen from './screens/RestoScreen';
import UserScreen from './screens/UserScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Header } from 'react-native/Libraries/NewAppScreen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';


import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import user from './reducers/user'

const store = configureStore({
  reducer: { user },
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (

    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Resto' component={RestoScreen} />
    </Stack.Navigator>

  )
}



export default function App() {
  return (
    <Provider store={store}>

      <NavigationContainer>
        <Tab.Navigator screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = '';
            const user = useSelector((state) => state.user.value)
            console.log(user.avatarUrl)
            // const avatarUser = require(`./assets/avatars/${user.avatarUrl}`)

            let isConnected = false
            if (user.token?.length > 0 ){
                isConnected = true
            } 


            if (route.name === 'Home') {
              fontName = FontAwesome
              iconName = 'home';
              return <FontAwesome name={iconName} size={size} color={color} />
            } else if (route.name === 'User' && !isConnected) {
              fontName = FontAwesome
              iconName = 'user';
              // return <Image source={require('./assets/avatars/avatar1.png')} style={styles.userImage}/>

              return <FontAwesome name={iconName} size={size} color={color} />
            } else if (route.name === 'User' && isConnected) {
              // fontName = FontAwesome
              // iconName = 'user';
              return <Image source={require('./assets/avatars/avatar1.png')} style={styles.userImage}/>
            } else if (route.name === 'Like') {
              fontName = FontAwesome
              iconName = 'heart';
              return <FontAwesome name={iconName} size={size} color={color} />
            } else if (route.name === 'Map') {
              fontName = Feather
              iconName = 'map-pin';
              return <Feather name={iconName} size={size} color={color} />
            }

            // return <fontName name={iconName} size={size} color={color} />

            // return <Entypo name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#C44949',
          tabBarInactiveTintColor: 'grey',
          headerShown: false,
        })}>
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userImage: {
    height: 20,
    width: 20
  }
});
