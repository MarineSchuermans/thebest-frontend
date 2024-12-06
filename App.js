import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
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

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'User') {
            iconName = 'user';
          } else if (route.name === 'Like') {
            iconName = 'heart';
          } else if (route.name === 'Map') {
            iconName = 'map-marker';
          }

          return <FontAwesome name={iconName} size={size} color={color} />
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
});
