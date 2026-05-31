const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => degrees * (Math.PI / 180);

export const calculateDistanceKm = (pointA, pointB) => {
  const latitudeDistance = toRadians(pointB.latitude - pointA.latitude);
  const longitudeDistance = toRadians(pointB.longitude - pointA.longitude);
  const startLatitude = toRadians(pointA.latitude);
  const endLatitude = toRadians(pointB.latitude);

  const a =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDistance / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};
