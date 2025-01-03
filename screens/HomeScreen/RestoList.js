import {
  TouchableOpacity,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import LikeIcon from "../../components/LikeIcon";
import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import {
  addFavoritesToStore,
  removeFavoritesToStore,
} from "../../reducers/user";
import { useNavigation } from "@react-navigation/native";

export default function RestoList({ restaurants }) {
  return (
    <ScrollView style={styles.restaurantList}>
      {restaurants.map((item, i) => (
        <OneRestaurant key={i} item={item} />
      ))}
    </ScrollView>
  );
}

function OneRestaurant({ item }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.value);
  let isConnected = user.token?.length > 0;
  const favorites = user.favorites;

  const isOpen = (hoursArray) => {
    if (!hoursArray || !hoursArray.length) return false;
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = days[new Date().getDay()];
    const todayHours = hoursArray.find((day) => day.startsWith(today));
    return todayHours && !todayHours.includes("Closed");
  };

  const handleFavorite = (item) => {
    if (!isConnected) return navigation.navigate("User");

    fetch("https://the-best-backend.vercel.app/users/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: user.token,
        obj_id: item.place_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(addFavoritesToStore(item.place_id));
        } else {
          dispatch(removeFavoritesToStore(item.place_id));
        }
      });
  };

  console.log(favorites);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Resto", {
          title: item.title.length > 20
          ? item.title.substring(0, 17) + "..."
          : item.title,
          place_id: item.place_id,
          description: item.description,
          rating: item.rating,
          reviews: item.reviews,
          image: item.image,
          phoneNumber: item.phoneNumber,
          location: item.location,
          address: item.address,
          openingHours: item.openingHours,
        })
      }
      style={styles.restaurantCard}
    >
      {item.image && item.image !== "placeholder_url" ? (
        <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <View style={styles.placeholderInner} />
        </View>
      )}

      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantTitle}>{item.title}</Text>
          <LikeIcon
            onClickIcon={() => handleFavorite(item)}
            color={
              isConnected && favorites.some((data) => item.place_id === data)
                ? "#FF0000"
                : "#9CA3AF"
            }
          />
        </View>

        <Text style={styles.description}>
          {item.description && item.description.length > 35
            ? `${item.description.slice(0, 35)}...`
            : "Service rapide, plats délicieux, ambiance agréable !"}
        </Text>

        <View style={styles.restaurantFooter}>
          <Feather name="phone" size={16} />
          <Feather name="map-pin" size={16} style={styles.footerIcon} />
          <View style={styles.rating}>
            <Text>{"★".repeat(Math.floor(item.rating))}</Text>
            <Text>{"☆".repeat(5 - Math.floor(item.rating))}</Text>
            <Text style={styles.ratingText}>({item.rating})</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOpen(item.openingHours)
                  ? "#34D399"
                  : "#EF4444",
              },
            ]}
          >
            <Text style={styles.statusText}>
              {isOpen(item.openingHours) ? "Ouvert" : "Fermé"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#C44949",
  },
  bar: {
    color: "#FFFFFF",
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 16,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 8,
  },
  clearButton: {
    position: "absolute",
    right: 12,
  },
  suggestionList: {
    maxHeight: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginHorizontal: 16,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: 10,
    color: "#9CA3AF",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  heart: {
    height: 50,
    width: 50,
  },
  categoryButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    height: 35,
  },
  categoryText: {
    fontSize: 14,
  },
  restaurantList: {
    flex: 1,
    marginTop: 0,
  },
  restaurantCard: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  restaurantImage: {
    width: 96,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 96,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderInner: {
    width: 48,
    height: 48,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  restaurantFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  footerIcon: {
    marginLeft: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  ratingText: {
    marginLeft: 4,
    color: "#6B7280",
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 135,
    paddingVertical: 8,
    color: "#000",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: 10,
  },
  dropdown: {
    position: "absolute",
    top: 60, // Ajustez selon la hauteur de votre header
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
