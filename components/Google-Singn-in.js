import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = "619790277370-st8fno1oaglfom2d8ajvjmcfpmg07rk9.apps.googleusercontent.com";

export default function GoogleSignin() {
  const [userInfo, setUserInfo] = useState(null);

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      fetchUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch(discovery.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  return (
    <View style={styles.container}>
                          {/* <Image
                        source={{ uri: data.photo_reference }}
                        style={styles.restaurantImage}>
                          
                        </Image> */}
      {userInfo ? (
        <Text>Welcome, {userInfo.name}!</Text>
      ) : (
        <TouchableOpacity
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Image
          source={require('../assets/googlelogo.webp')} // Chemin vers ton image
          style={{ width: 50, height: 50 }} // Dimensions de l'image
        />
      </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { heigth: '65', justifyContent: "center", alignItems: "center" },
});
