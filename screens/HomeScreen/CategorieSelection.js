import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";


const categories = ["Fast food", "Italien", "Asiatique", "Gastronomique"];

export default function CategorieSelection({ options, onOptionSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('')
  return (
    <View style={{ height: 50 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {options.map((category) => {
          const isSelected = selectedCategory === category;
          return (
          <TouchableOpacity
            key={category}
            style={isSelected ? styles.categoryButtonOn : styles.categoryButton}
            onPress={() => onOptionSelect(category) + setSelectedCategory(category)}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
)})}
      </ScrollView>
    </View>
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
    backgroundColor: "#C44949",
    shadowRadius: 5,
    shadowColor: "grey",
    shadowOpacity: 0.3,
    shadowOffset: {
        width: 1,
        height: 2,
    },
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    height: 35,
},
categoryButtonOn: {
  backgroundColor: "#fc9595",
  shadowRadius: 5,
  shadowColor: "grey",
  shadowOpacity: 0.3,
  shadowOffset: {
      width: 1,
      height: 2,
  },
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 8,
  height: 35,

},
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
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
