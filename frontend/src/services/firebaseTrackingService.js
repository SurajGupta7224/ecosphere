import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/config';
import { parseAndSortPoints, getDestinationFromVehicle, calculateDistanceKm } from '../utils/geoUtils';

/**
 * Normalizes a raw tracking node from Firebase into a structured Vehicle object.
 * @param {string} key
 * @param {Object} rawData
 * @returns {Object}
 */
export const normalizeVehicleData = (key, rawData) => {
  if (!rawData) return null;

  // 1. Extract points from root node and all sub-session nodes (e.g. c2d7e98a-1a3b-4c5d-9e8f-7a6b5c4d3e2f or ccc3e5f4-46d9-4d34-88bd-f7f59c70f8f9)
  let combinedPoints = {};

  if (rawData.points && typeof rawData.points === 'object') {
    combinedPoints = { ...rawData.points };
  }

  if (rawData && typeof rawData === 'object') {
    Object.entries(rawData).forEach(([childKey, childValue]) => {
      if (childValue && typeof childValue === 'object' && childValue.points && typeof childValue.points === 'object') {
        combinedPoints = { ...combinedPoints, ...childValue.points };
      }
    });
  }

  const rawPointsArray = parseAndSortPoints(combinedPoints);

  // Filter out invalid GPS jump outliers
  const pointsArray = rawPointsArray.filter((pt, idx, arr) => {
    if (idx === 0) return true;
    const prev = arr[idx - 1];
    const dist = calculateDistanceKm(prev.lat, prev.lng, pt.lat, pt.lng);
    const timeDiffSec = Math.abs((pt.timestamp - prev.timestamp) / 1000);
    if (dist > 40 && timeDiffSec < 60) return false;
    return true;
  });

  const rawLat = Number(rawData.latitude);
  const rawLng = Number(rawData.longitude);

  const currentLat = (!isNaN(rawLat) && rawLat !== 0)
    ? rawLat
    : (pointsArray.length > 0 ? pointsArray[pointsArray.length - 1].lat : 12.9419702);

  const currentLng = (!isNaN(rawLng) && rawLng !== 0)
    ? rawLng
    : (pointsArray.length > 0 ? pointsArray[pointsArray.length - 1].lng : 77.5517499);

  const startPoint = pointsArray.length > 0
    ? pointsArray[0]
    : { lat: currentLat, lng: currentLng, timestamp: rawData.startTime || rawData.timestamp || Date.now() };

  let calculatedDistance = Number(rawData.totalDistance || 0);
  if (!calculatedDistance && pointsArray.length > 1) {
    let sumDist = 0;
    for (let i = 1; i < pointsArray.length; i++) {
      sumDist += calculateDistanceKm(pointsArray[i - 1].lat, pointsArray[i - 1].lng, pointsArray[i].lat, pointsArray[i].lng);
    }
    calculatedDistance = Math.round(sumDist * 10) / 10;
  }

  const rawStatus = (rawData.status || 'STOPPED').toUpperCase();
  const isDeviation = rawStatus === 'DEVIATION' || rawStatus === 'OFF-ROUTE' || Boolean(rawData.metadata?.isDeviation);
  const rawSpeed = Number(rawData.speed || 0);
  const formattedSpeed = isNaN(rawSpeed) ? 0 : Math.round(rawSpeed * 10) / 10;

  let mergedMetadata = rawData.metadata || {};
  if (rawData.sessionId && rawData[rawData.sessionId] && rawData[rawData.sessionId].metadata) {
    mergedMetadata = { ...rawData[rawData.sessionId].metadata, ...mergedMetadata };
  } else if (rawData && typeof rawData === 'object') {
    Object.entries(rawData).forEach(([cKey, cVal]) => {
      if (cVal && typeof cVal === 'object' && cVal.metadata && typeof cVal.metadata === 'object') {
        mergedMetadata = { ...cVal.metadata, ...mergedMetadata };
      }
    });
  }

  const currentApartment = mergedMetadata.currentApartment || mergedMetadata.pickupPoint || 'Apartment Pickup Site';
  const startName = mergedMetadata.startName || 'Hommlie Office, HSR Layout';

  const vehicleSummary = {
    id: String(key || rawData.driverId || ''),
    driverId: String(rawData.driverId || key || ''),
    driverName: rawData.driverName || `Driver #${rawData.driverId || key}`,
    vehicleNumber: rawData.vehicleNumber || `Vehicle #${rawData.driverId || key}`,
    latitude: currentLat,
    longitude: currentLng,
    speed: formattedSpeed,
    status: rawStatus,
    startTime: rawData.startTime,
    endTime: rawData.endTime,
    timestamp: rawData.timestamp || Date.now(),
    sessionId: rawData.sessionId || '',
    totalDistance: calculatedDistance,
    metadata: mergedMetadata,
    currentApartment,
    startName,
    isDeviation,
    pointsArray,
    startPoint,
    destinationPoint: null,
    rawData
  };

  vehicleSummary.destinationPoint = getDestinationFromVehicle(vehicleSummary);
  return vehicleSummary;
};

/**
 * Fetches points from Cloud Firestore subcollection tracking_sessions/{sessionId}/points
 */
export const fetchFirestoreSessionPoints = async (sessionId) => {
  if (!sessionId) return [];
  try {
    const url = `https://firestore.googleapis.com/v1/projects/hommlie-8fb41/databases/(default)/documents/tracking_sessions/${sessionId}/points`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];

    const pts = data.documents.map((doc, idx) => {
      const f = doc.fields || {};
      return {
        id: doc.name ? doc.name.split('/').pop() : `fs_${idx}`,
        lat: Number(f.latitude?.doubleValue || f.latitude?.integerValue || 0),
        lng: Number(f.longitude?.doubleValue || f.longitude?.integerValue || 0),
        timestamp: Number(f.timestamp?.integerValue || f.timestamp?.doubleValue || 0),
        speed: Number(f.speed?.doubleValue || f.speed?.integerValue || 0),
        bearing: Number(f.bearing?.doubleValue || f.bearing?.integerValue || 0),
        accuracy: Number(f.accuracy?.doubleValue || f.accuracy?.integerValue || 0),
        altitude: Number(f.altitude?.doubleValue || f.altitude?.integerValue || 0)
      };
    });

    return pts.sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    console.error('fetchFirestoreSessionPoints error:', err);
    return [];
  }
};

/**
 * Listens to all tracking nodes under /tracking in real-time from Firebase RTDB
 * and merges Cloud Firestore session points if available.
 * @param {function(Object.<string, Object>): void} onUpdate
 * @param {function(Error): void} [onError]
 * @returns {function(): void} Unsubscribe function
 */
export const subscribeToFleetTracking = (onUpdate, onError) => {
  const trackingRef = ref(db, 'tracking');
  const sessionPointsCache = {};

  const unsubscribe = onValue(
    trackingRef,
    async (snapshot) => {
      try {
        const data = snapshot.val();
        if (!data) {
          onUpdate({});
          return;
        }

        const normalizedVehicles = {};
        for (const [key, rawValue] of Object.entries(data)) {
          const vehicleObj = normalizeVehicleData(key, rawValue);
          if (vehicleObj && vehicleObj.vehicleNumber) {
            // If pointsArray is empty but sessionId exists, try fetching from Cloud Firestore points subcollection
            if ((!vehicleObj.pointsArray || vehicleObj.pointsArray.length === 0) && vehicleObj.sessionId) {
              if (!sessionPointsCache[vehicleObj.sessionId]) {
                sessionPointsCache[vehicleObj.sessionId] = await fetchFirestoreSessionPoints(vehicleObj.sessionId);
              }
              const fsPoints = sessionPointsCache[vehicleObj.sessionId];
              if (fsPoints && fsPoints.length > 0) {
                vehicleObj.pointsArray = fsPoints;
                vehicleObj.startPoint = fsPoints[0];
                if (!vehicleObj.totalDistance || vehicleObj.totalDistance === 0) {
                  let sumDist = 0;
                  for (let i = 1; i < fsPoints.length; i++) {
                    sumDist += calculateDistanceKm(fsPoints[i - 1].lat, fsPoints[i - 1].lng, fsPoints[i].lat, fsPoints[i].lng);
                  }
                  vehicleObj.totalDistance = Math.round(sumDist * 10) / 10;
                }
              }
            }

            normalizedVehicles[vehicleObj.id] = vehicleObj;
          }
        }

        onUpdate(normalizedVehicles);
      } catch (err) {
        if (onError) onError(err);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );

  return () => off(trackingRef, 'value', unsubscribe);
};

