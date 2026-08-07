/**
 * Converts Firebase points object into a chronologically sorted array of points.
 * @param {Object} pointsObj
 * @returns {Array<{lat: number, lng: number, timestamp: number, speed: number, altitude: number, bearing: number, accuracy: number, id: string}>}
 */
export const parseAndSortPoints = (pointsObj) => {
  if (!pointsObj || typeof pointsObj !== 'object') return [];

  const pointsArray = Object.entries(pointsObj).map(([key, point]) => ({
    id: key,
    lat: Number(point.latitude || point.lat || 0),
    lng: Number(point.longitude || point.lng || 0),
    timestamp: Number(point.timestamp || 0),
    speed: Number(point.speed || 0),
    altitude: Number(point.altitude || 0),
    bearing: Number(point.bearing || 0),
    accuracy: Number(point.accuracy || 0)
  }));

  // Sort ascending by timestamp
  return pointsArray.sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Linearly interpolates position between start and end coordinates.
 */
export const lerpPosition = (start, end, alpha) => {
  const clampAlpha = Math.max(0, Math.min(1, alpha));
  return {
    lat: start.lat + (end.lat - start.lat) * clampAlpha,
    lng: start.lng + (end.lng - start.lng) * clampAlpha
  };
};

/**
 * Formats a timestamp into a human readable relative time string.
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const tsNum = typeof timestamp === 'number' ? timestamp : parseInt(timestamp, 10);
  if (isNaN(tsNum)) return 'Just now';

  // Handle epoch seconds vs milliseconds
  const ms = tsNum < 1e11 ? tsNum * 1000 : tsNum;
  const secondsAgo = Math.floor((Date.now() - ms) / 1000);

  if (secondsAgo < 5) return 'Just now';
  if (secondsAgo < 60) return `${secondsAgo} sec ago`;
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hr ago`;
  return new Date(ms).toLocaleDateString();
};

/**
 * Formats a timestamp to HH:MM AM/PM string.
 */
export const formatTimeString = (timestamp) => {
  if (!timestamp) return '--:--';
  const tsNum = typeof timestamp === 'number' ? timestamp : parseInt(timestamp, 10);
  if (isNaN(tsNum)) return '--:--';
  const ms = tsNum < 1e11 ? tsNum * 1000 : tsNum;
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Extracts Destination point from vehicle metadata or falls back to last point / current location.
 */
export const getDestinationFromVehicle = (vehicle) => {
  if (!vehicle) return null;

  // Check metadata for destination
  if (vehicle.metadata) {
    const meta = vehicle.metadata;
    const destLat = meta.destinationLat || meta.destination?.latitude || meta.destination?.lat;
    const destLng = meta.destinationLng || meta.destination?.longitude || meta.destination?.lng;
    if (destLat && destLng) {
      return {
        lat: Number(destLat),
        lng: Number(destLng),
        name: meta.destinationName || meta.destination?.name || 'Destination',
        address: meta.destinationAddress || meta.destination?.address || ''
      };
    }
  }

  // Fallback to last point in pointsArray if available
  const points = vehicle.pointsArray || [];
  if (points.length > 0) {
    const lastPoint = points[points.length - 1];
    return {
      lat: lastPoint.lat,
      lng: lastPoint.lng,
      name: 'Destination (Last Recorded Point)',
      address: ''
    };
  }

  // Fallback to current location
  if (vehicle.latitude && vehicle.longitude) {
    return {
      lat: Number(vehicle.latitude),
      lng: Number(vehicle.longitude),
      name: 'Destination (Current Position)',
      address: ''
    };
  }

  return null;
};
