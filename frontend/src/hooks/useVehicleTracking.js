import { useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeToFleetTracking } from '../services/firebaseTrackingService';

/**
 * Custom React hook for live vehicle tracking from Firebase Realtime Database.
 * @param {string} [initialVehicleNumber] Optional vehicle number to search/select initially
 */
export const useVehicleTracking = (initialVehicleNumber = '') => {
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialVehicleNumber);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Status');

  // Playback state
  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    currentIndex: 0,
    speed: 1, // 1x, 2x, 4x
  });

  // Subscribe to live Firebase fleet tracking updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToFleetTracking(
      (data) => {
        setVehiclesMap(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useVehicleTracking] Listener error:', err);
        setError(err.message || 'Failed to connect to Firebase Realtime Database');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Convert map to array and sort/filter vehicles
  const allVehiclesList = useMemo(() => {
    return Object.values(vehiclesMap);
  }, [vehiclesMap]);

  // Filtered vehicles based on search and status filter
  const filteredVehicles = useMemo(() => {
    return allVehiclesList.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(q)) ||
        (v.driverName && v.driverName.toLowerCase().includes(q)) ||
        (v.id && v.id.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'All Status' ||
        (statusFilter === 'Moving' && v.status === 'MOVING') ||
        (statusFilter === 'Idle' && v.status === 'IDLE') ||
        (statusFilter === 'Stopped' && v.status === 'STOPPED') ||
        (statusFilter === 'Deviation' && v.isDeviation);

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'Name') return (a.vehicleNumber || '').localeCompare(b.vehicleNumber || '');
      if (sortBy === 'Speed') return (b.speed || 0) - (a.speed || 0);
      if (sortBy === 'Status') {
        if (a.isDeviation) return -1;
        if (b.isDeviation) return 1;
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });
  }, [allVehiclesList, searchQuery, statusFilter, sortBy]);

  // Automatically select initial or matching vehicle if not selected
  useEffect(() => {
    if (allVehiclesList.length > 0) {
      if (!selectedVehicleId) {
        // Look for matching vehicle number or pick the first vehicle
        const match = initialVehicleNumber
          ? allVehiclesList.find((v) => v.vehicleNumber === initialVehicleNumber)
          : null;
        setSelectedVehicleId(match ? match.id : allVehiclesList[0].id);
      }
    }
  }, [allVehiclesList, initialVehicleNumber, selectedVehicleId]);

  // Currently active vehicle object
  const activeVehicle = useMemo(() => {
    if (!selectedVehicleId) return allVehiclesList[0] || null;
    return vehiclesMap[selectedVehicleId] || allVehiclesList.find(v => v.id === selectedVehicleId) || null;
  }, [vehiclesMap, selectedVehicleId, allVehiclesList]);

  // Active vehicle properties
  const points = useMemo(() => activeVehicle?.pointsArray || [], [activeVehicle]);
  const currentLocation = useMemo(() => {
    if (!activeVehicle) return null;
    return { lat: activeVehicle.latitude, lng: activeVehicle.longitude };
  }, [activeVehicle]);

  const startPoint = useMemo(() => activeVehicle?.startPoint || null, [activeVehicle]);
  const destinationPoint = useMemo(() => activeVehicle?.destinationPoint || null, [activeVehicle]);

  // Handle Playback Interval Timer (Slower, realistic playback interval for smooth testing)
  useEffect(() => {
    let timer = null;
    if (playbackState.isPlaying && points.length > 0) {
      const baseInterval = 1800; // 1.8 seconds per point step
      const intervalMs = Math.max(250, baseInterval / playbackState.speed);
      timer = setInterval(() => {
        setPlaybackState((prev) => {
          if (prev.currentIndex >= points.length - 1) {
            return { ...prev, isPlaying: false, currentIndex: points.length - 1 };
          }
          return { ...prev, currentIndex: prev.currentIndex + 1 };
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playbackState.isPlaying, playbackState.speed, points]);


  // Playback Control Handlers
  const startPlayback = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: true,
      currentIndex: prev.currentIndex >= points.length - 1 ? 0 : prev.currentIndex,
    }));
  }, [points.length]);

  const pausePlayback = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resetPlayback = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentIndex: 0 }));
  }, []);

  const setPlaybackIndex = useCallback((index) => {
    const validIdx = Math.max(0, Math.min(index, points.length - 1));
    setPlaybackState((prev) => ({ ...prev, currentIndex: validIdx }));
  }, [points.length]);

  const setPlaybackSpeed = useCallback((speedMultiplier) => {
    setPlaybackState((prev) => ({ ...prev, speed: speedMultiplier }));
  }, []);

  const selectVehicleByNumber = useCallback((vehNum) => {
    const found = allVehiclesList.find(
      (v) => (v.vehicleNumber && v.vehicleNumber.toLowerCase() === vehNum.toLowerCase()) || v.id === vehNum
    );
    if (found) {
      setSelectedVehicleId(found.id);
      resetPlayback();
      return true;
    }
    return false;
  }, [allVehiclesList, resetPlayback]);

  const selectVehicleById = useCallback((id) => {
    setSelectedVehicleId(id);
    resetPlayback();
  }, [resetPlayback]);

  // Current playback position (if playing or scrubbed, otherwise currentLocation)
  const currentPlaybackPoint = useMemo(() => {
    if (playbackState.isPlaying || playbackState.currentIndex > 0) {
      return points[playbackState.currentIndex] || currentLocation;
    }
    return currentLocation;
  }, [playbackState.isPlaying, playbackState.currentIndex, points, currentLocation]);

  return {
    loading,
    error,
    allVehicles: allVehiclesList,
    filteredVehicles,
    vehicle: activeVehicle,
    selectedVehicleId,
    selectVehicleById,
    selectVehicleByNumber,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    // Spec requirements getters
    points,
    currentLocation: currentPlaybackPoint || currentLocation,
    liveCurrentLocation: currentLocation,
    startPoint,
    destinationPoint,
    status: activeVehicle?.status || 'STOPPED',
    speed: activeVehicle?.speed || 0,
    driver: activeVehicle?.driverName || '',
    vehicleNumber: activeVehicle?.vehicleNumber || '',
    totalDistance: activeVehicle?.totalDistance || 0,
    timestamp: activeVehicle?.timestamp || Date.now(),
    isDeviation: activeVehicle?.isDeviation || false,
    currentApartment: activeVehicle?.currentApartment || 'Apartment Pickup Site',
    startName: activeVehicle?.startName || 'Hommlie Office, HSR Layout',
    // Playback state & handlers

    playbackState,
    startPlayback,
    pausePlayback,
    resetPlayback,
    setPlaybackIndex,
    setPlaybackSpeed,
  };
};

export default useVehicleTracking;
