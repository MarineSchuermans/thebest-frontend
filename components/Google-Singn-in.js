import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = "619790277370-st8fno1oaglfom2d8ajvjmcfpmg07rk9.apps.googleusercontent.com";

export default function GoogleSignin() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token", 
    userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      scopes: ["openid", "profile", "email", "https://www.googleapis.com/auth/userinfo.profile"],
      redirectUri: "https://auth.expo.io/@iismael/my-app",  // Met à jour selon ton besoin
    },
    discovery
  );

  // Log de la requête de demande d'authentification
  useEffect(() => {
    console.log("Auth Request:", request);
  }, [request]);

  useEffect(() => {
    console.log("Auth Response:", response);

    if (response?.type === "success") {
      console.log("Auth Success:", response.authentication);
      fetchUserInfo(response.authentication.accessToken);
    } else if (response?.type === "error") {
      console.error("Auth Error:", response.error);
      setError(response.error);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      console.log("Fetching user info with token:", token);
      const res = await fetch(discovery.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("User info fetched:", data);
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

//   return (
//     <View style={styles.container}>
//       {userInfo ? (
//         <Text>Welcome, {userInfo.name}!</Text>
//       ) : (
//         <>
//           <TouchableOpacity
//             onPress={() => {
//               console.log("Initiating Google Sign In");
//               promptAsync();
//               console.log("Error during Google Sign In:", error);
//             }}
//             disabled={!request}
//           >
//             <Image
//               source={require('../assets/googlelogo.webp')}
//               style={{ width: 50, height: 50 }}
//             />
//           </TouchableOpacity>
//           {error && <Text style={{ color: 'red' }}>{error}</Text>}
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { height: 65, justifyContent: "center", alignItems: "center" },
 }
//);