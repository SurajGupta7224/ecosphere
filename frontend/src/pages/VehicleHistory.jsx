import React, { useState, useEffect } from 'react';
import { Truck, Calendar, Activity, ChevronLeft, Maximize2, Minimize2, Clock, MapPin, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useVehicleTracking from '../hooks/useVehicleTracking';
import VehicleList from '../components/tracking/VehicleList';
import LiveMap from '../components/tracking/LiveMap';
import GisVisualizationPanel from '../components/tracking/GisVisualizationPanel';
import { fetchFirestoreSessionPoints } from '../services/firebaseTrackingService';

const VehicleHistory = () => {
  const navigate = useNavigate();

  // Primary Tracking Hook
  const {
    loading: trackingLoading,
    error: trackingError,
    allVehicles,
    filteredVehicles,
    vehicle: activeVehicle,
    selectedVehicleId,
    selectVehicleById,
    searchQuery: trackingSearchQuery,
    setSearchQuery: setTrackingSearchQuery,
    statusFilter: trackingStatusFilter,
    setStatusFilter: setTrackingStatusFilter,
    sortBy: trackingSortBy,
    setSortBy: setTrackingSortBy,
    points: livePoints,
    currentLocation: liveCurrentLocation,
    startPoint: liveStartPoint,
    destinationPoint: liveDestinationPoint,
    status: vehicleStatus,
    speed: vehicleSpeed,
    driver: vehicleDriver,
    vehicleNumber,
    totalDistance: liveTotalDistance,
    timestamp: vehicleTimestamp,
    isDeviation,
    playbackState,
    startPlayback,
    pausePlayback,
    resetPlayback,
    setPlaybackIndex,
    setPlaybackSpeed,
  } = useVehicleTracking();

  // Firestore Sessions & Date Filters
  const [historyPoints, setHistoryPoints] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [dateFilter, setDateFilter] = useState('TODAY');
  const [customDate, setCustomDate] = useState('');
  const [isFleetOverview, setIsFleetOverview] = useState(true);

  // Fetch Firestore Sessions & Points for Selected Date Range
  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoadingPoints(true);
      try {
        const url = 'https://firestore.googleapis.com/v1/projects/hommlie-8fb41/databases/(default)/documents/tracking_sessions';
        const res = await fetch(url);
        if (!res.ok) {
          setHistoryPoints([]);
          return;
        }
        const data = await res.json();
        if (!data.documents || !Array.isArray(data.documents)) {
          setHistoryPoints([]);
          return;
        }

        const rawSessions = data.documents.map((doc) => {
          const f = doc.fields || {};
          const sid = doc.name ? doc.name.split('/').pop() : '';
          return {
            sessionId: sid,
            driverName: f.driverName?.stringValue || 'Driver',
            vehicleNumber: f.vehicleNumber?.stringValue || 'Vehicle',
            userId: f.userId?.stringValue || '',
            status: f.status?.stringValue || 'COMPLETED',
            startTime: Number(f.startTime?.integerValue || Date.now()),
            endTime: Number(f.endTime?.integerValue || 0),
            totalDistance: Number(f.totalDistance?.doubleValue || f.totalDistance?.integerValue || 0),
            totalPoints: Number(f.totalPoints?.integerValue || 0)
          };
        });

        const currentVehicle = allVehicles.find((v) => v.id === selectedVehicleId);
        let filtered = rawSessions;
        if (currentVehicle) {
          filtered = rawSessions.filter(
            (s) => s.vehicleNumber === currentVehicle.vehicleNumber || s.userId === currentVehicle.driverId || s.sessionId === currentVehicle.sessionId
          );
        }

        // Date range filtering
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (customDate) {
          const startOfSelected = new Date(customDate).setHours(0, 0, 0, 0);
          const endOfSelected = startOfSelected + oneDayMs;
          filtered = filtered.filter((s) => s.startTime >= startOfSelected && s.startTime < endOfSelected);
        } else if (dateFilter === 'TODAY') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          filtered = filtered.filter((s) => s.startTime >= startOfToday);
        } else if (dateFilter === 'YESTERDAY') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          const startOfYesterday = startOfToday - oneDayMs;
          filtered = filtered.filter((s) => s.startTime >= startOfYesterday && s.startTime < startOfToday);
        }

        filtered.sort((a, b) => b.startTime - a.startTime);

        if (filtered.length > 0) {
          const allPointsPromises = filtered.map((s) => fetchFirestoreSessionPoints(s.sessionId));
          const allPtsArrays = await Promise.all(allPointsPromises);
          const combinedPts = allPtsArrays.flat();
          setHistoryPoints(combinedPts);
          resetPlayback();
        } else {
          setHistoryPoints([]);
        }
      } catch (err) {
        console.error('Error fetching Firestore history:', err);
        setHistoryPoints([]);
      } finally {
        setLoadingPoints(false);
      }
    };

    fetchHistoryData();
  }, [selectedVehicleId, allVehicles, dateFilter, customDate]);

  // Determine active points (use historyPoints if available, else fallback to livePoints)
  const displayPoints = historyPoints.length > 0 ? historyPoints : livePoints;

  const displayCurrentLocation = playbackState.isPlaying || playbackState.currentIndex > 0
    ? displayPoints[playbackState.currentIndex] || liveCurrentLocation
    : displayPoints.length > 0
      ? displayPoints[displayPoints.length - 1]
      : liveCurrentLocation;

  const displayStartPoint = displayPoints.length > 0 ? displayPoints[0] : liveStartPoint;
  const displayDestPoint = displayPoints.length > 0 ? displayPoints[displayPoints.length - 1] : liveDestinationPoint;

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto space-y-4 font-sans bg-slate-50 min-h-screen">
      {/* Top Header Navigation & Calendar Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-black"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600 animate-pulse" />
              Vehicle Tracking History & Trip Analytics
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              Historical GPS route logs, calendar date trip history, and live tracking from Realtime Firebase
            </p>
          </div>
        </div>

        {/* Calendar Date Picker & Date Filter Quick Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {['TODAY', 'YESTERDAY', 'ALL TIME'].map((df) => (
              <button
                key={df}
                onClick={() => {
                  setDateFilter(df);
                  setCustomDate('');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateFilter === df && !customDate
                    ? 'bg-white text-sky-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {df}
              </button>
            ))}
          </div>

          {/* Calendar Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1 rounded-xl text-xs font-bold shadow-2xs">
            <Calendar className="w-4 h-4 text-sky-600" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter('');
              }}
              className="bg-transparent text-slate-800 font-extrabold outline-none cursor-pointer text-xs"
            />
          </div>

          <button
            onClick={() => setIsFleetOverview((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border cursor-pointer ${
              isFleetOverview
                ? 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span>📡 Live Movement</span>
          </button>
        </div>
      </div>

      {/* ──────────────── EXACT SAME 3-COLUMN TRACKING DASHBOARD GRID FOR 100% UNIFORM DESIGN ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── LEFT COLUMN: VEHICLE SEARCH & LIST (Identical Component) ── */}
        <VehicleList
          filteredVehicles={filteredVehicles}
          totalVehiclesCount={allVehicles.length}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={selectVehicleById}
          searchQuery={trackingSearchQuery}
          onSearchChange={setTrackingSearchQuery}
          statusFilter={trackingStatusFilter}
          onStatusFilterChange={setTrackingStatusFilter}
          sortBy={trackingSortBy}
          onSortByChange={setTrackingSortBy}
          onResetFilters={() => {
            setTrackingSearchQuery('');
            setTrackingStatusFilter('All Status');
            setTrackingSortBy('Status');
          }}
          loading={trackingLoading}
        />

        {/* ── MIDDLE COLUMN: REAL-TIME / HISTORICAL INTERACTIVE GOOGLE MAP (Identical Component) ── */}
        <LiveMap
          vehicle={activeVehicle}
          points={displayPoints}
          currentLocation={displayCurrentLocation}
          startPoint={displayStartPoint}
          destinationPoint={displayDestPoint}
          allVehicles={allVehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={selectVehicleById}
          isDeviation={isDeviation}
          isFleetOverview={isFleetOverview}
          loading={trackingLoading || loadingPoints}
        />

        {/* ── RIGHT COLUMN: GIS ROUTE VISUALIZATION & PLAYBACK PANEL (Identical Component) ── */}
        <GisVisualizationPanel
          vehicle={activeVehicle}
          points={displayPoints}
          status={vehicleStatus}
          speed={vehicleSpeed}
          driver={vehicleDriver}
          vehicleNumber={vehicleNumber}
          totalDistance={liveTotalDistance}
          timestamp={vehicleTimestamp}
          isDeviation={isDeviation}
          playbackState={playbackState}
          onStartPlayback={startPlayback}
          onPausePlayback={pausePlayback}
          onResetPlayback={resetPlayback}
          onSeek={setPlaybackIndex}
          onSpeedChange={setPlaybackSpeed}
        />
      </div>
    </div>
  );
};

export default VehicleHistory;
