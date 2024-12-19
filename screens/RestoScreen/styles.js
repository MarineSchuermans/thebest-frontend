import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 30,
    resizeMode: "cover",
    marginTop: 10,
  },
  favoriteIcon: {
    position: "absolute",
    top: 30,
    right: 20,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 10,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  overlayLocation: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  rating: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFAA00",
    marginLeft: 5,
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D9CDB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
  },
  phoneNumber: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#C44949",
    padding: 12,
    borderRadius: 12,
    width: "40%",
    marginVertical: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    marginTop: 5,
    fontSize: 14,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  reviewItem: {
    width: 350,
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewRatingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
    color: "#FFAA00",
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: "#666666",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666666",
  },
  showMoreText: {
    fontWeight: 'bold',

  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    width: "90%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#C44949",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FAFAFA",
    marginBottom: 15,
    fontSize: 14,
  },
  commentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    backgroundColor: "#C44949",
    padding: 10,
    borderRadius: 25,
    width: "40%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    margin: 20,
  },
  captureButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "#F2994A",
    padding: 15,
    borderRadius: 50,
  },
  reviewPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  editReview: {
    color: "#C44949",
    fontWeight: "bold",
    marginTop: 5,
  },
  deleteReview: {
    color: "#C44949",
    fontWeight: "bold",
    marginTop: 5,
  },
  imageWrapper: {
    width: "100%",
    paddingHorizontal: 100,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  image: {
    height: 300,
    resizeMode: "cover",
  },
  mapPreview: {
    height: 200,
    marginVertical: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 11,
  },
  distanceContainer: {
    padding: 10,
    backgroundColor: "#F4F4F4",
  },
  distanceText: {
    fontSize: 14,
    marginBottom: 5,
  },
  parkingDistanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default styles;