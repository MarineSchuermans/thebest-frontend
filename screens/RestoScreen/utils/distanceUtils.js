import { DISTANCE_MATRIX_API_KEY } from '../config';

const calculateHaversineDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
    Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees) => degrees * (Math.PI / 180);

const findNearestParking = (userLocation, parkings) => {
  if (!userLocation || !parkings.length) return null;

  return parkings.reduce((nearest, parking) => {
    const parkingCoords = {
      latitude: parking.properties.latitude,
      longitude: parking.properties.longitude,
    };

    const distance = calculateHaversineDistance(userLocation, parkingCoords);

    return !nearest || distance < nearest.distance
      ? { ...parkingCoords, distance, details: parking.properties }
      : nearest;
  }, null);
};

const fetchRouteDistance = async (origin, destination) => {
  const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${DISTANCE_MATRIX_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.status === "OK"
      ? data.rows[0].elements[0].distance.text
      : null;
  } catch (error) {
    console.error("Distance calculation error:", error);
    return null;
  }
};

export { fetchRouteDistance, calculateHaversineDistance, findNearestParking };