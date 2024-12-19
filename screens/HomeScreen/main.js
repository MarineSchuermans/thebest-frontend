import { StyleSheet, SafeAreaView } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addLocationToStore } from "../../reducers/user";
import {
  initializeFiltreToStore,
  addRestoFiltredToStore,
} from "../../reducers/restoFiltred";
import { backendAdress } from "../../config";
import { MarqueeText } from "../../components/marquee-text";
import RestoList from "./RestoList";
import CategorieSelection from "./CategorieSelection";
import CitySelection from "./CitySelection";

const categories = ["Fast food", "Italien", "Asiatique", "Gastronomique"];
const availableCities = ["Lille", "Paris"];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [restaurants, setRestaurants] = useState([]);
  const [isFilter, setIsFilter] = useState(false);
  const [dataFilter, setDataFilter] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        Location.watchPositionAsync({ distanceInterval: 10 }, (location) => {
          dispatch(
            addLocationToStore({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            })
          );
        });
      }
    })();
  }, []);

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const response = await fetch(backendAdress + "/findNearbyRestaurants");
        const restaurantData = await response.json();
        dispatch(initializeFiltreToStore());

        const formattedRestaurants = restaurantData.map((place) => ({
          _id: place._id,
          place_id: place.place_id,
          id: place.id,
          title:
            place.name.length > 17
              ? place.name.substring(0, 17) + "..."
              : place.name,
          location: place.address,
          address: place.location,
          description: place.reviews
            ? place.reviews[0]?.text
            : "Ici, bientôt une description",
          rating: place.rating,
          image: place.photo,
          phoneNumber: place.phoneNumber,
          openingHours: place.openingHours,
        }));
        setRestaurants(formattedRestaurants);

        // dispatch(addRestoFiltredToStore([...formattedRestaurants]))

        for (let i = 0; i < formattedRestaurants.length; i++) {
          dispatch(addRestoFiltredToStore(formattedRestaurants[i]));
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    getRestaurants();
  }, []);

  const selectCity = (city) => {
    setSelectedCity(city);
    handleFilterByType("", city);
  };

  const handleFilterByType = (type, city = selectedCity) => {
    const query = new URLSearchParams();

    if (city) {
      query.append("city", city);
    }

    if (type) {
      query.append("category", type);
    }

    if (!city && !type) {
      // Si aucun filtre n'est sélectionné, on réinitialise l'affichage
      setIsFilter(false);
      setDataFilter([]);
      return;
    }

    console.log(query.toString());

    fetch(`${backendAdress}/findRestaurantsByCategory?${query.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(initializeFiltreToStore()); //On remet le reduccer filtre à zéro

        const updateFilterResto = [];
        if (Array.isArray(data) && data.length > 0) {
          setIsFilter(true);
          const dataRestaurantsFiltred = data.map((place, index) => ({
            place_id: place.place_id,
            id: index + 1,
            title: place.name,
            location: place.address,
            address: place.location,
            description: place.reviews[0]?.text || "Description non disponible",
            rating: place.rating,
            reviews: place.reviews,
            image: place.photo,
            phoneNumber: place.phoneNumber,
            openingHours: place.openingHours,
          }));
          setDataFilter(dataRestaurantsFiltred);
          for (let i = 0; i < dataRestaurantsFiltred.length; i++) {
            updateFilterResto.push(dataRestaurantsFiltred[i]);
          }
        } else {
          setIsFilter(false);
          setDataFilter([]);
        }

        for (let i = 0; i < updateFilterResto.length; i++) {
          dispatch(addRestoFiltredToStore(updateFilterResto[i]));
        }
      })
      .catch((error) => {
        console.error("Error fetching filtered restaurants:", error);
        setIsFilter(false);
        setDataFilter([]);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CitySelection
        options={availableCities}
        selectedCity={selectedCity}
        onOptionSelect={selectCity}
      />
      <CategorieSelection
        options={categories}
        onOptionSelect={handleFilterByType}
      />
      <MarqueeText
        text="🔥Trend : Mamayia, Bestab du moment 🤯🍤🔥"
        speed={0.05}
      />
      <RestoList restaurants={isFilter ? dataFilter : restaurants} />
    </SafeAreaView>
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
