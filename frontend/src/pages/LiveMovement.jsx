import React, { useState } from 'react';
import { Truck, Navigation, Search, RefreshCw, Layers, ShieldCheck, MapPin, Activity } from 'lucide-react';
import useVehicleTracking from '../hooks/useVehicleTracking';
import VehicleList from '../components/tracking/VehicleList';
import LiveMap from '../components/tracking/LiveMap';

const LiveMovement = () => {
  const {
    loading: trackingLoading,
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
    isDeviation,
  } = useVehicleTracking();

  return (
    <div className="p-4 sm:p-6 max-w-[1920px] mx-auto space-y-4 font-sans bg-slate-50 min-h-[calc(100vh-80px)] flex flex-col">
      {/* Top Header Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-2xs">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Live Fleet Movement & Real-time GIS Map
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                ● Live Firebase Stream
              </span>
            </h1>
            <p className="text-slate-500 text-xs font-medium">
              Real-time vehicle position, speed, and driver updates from Realtime Database
            </p>
          </div>
        </div>

        {/* Active Vehicle Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-800 px-4 py-2 rounded-xl text-xs font-black shadow-2xs">
            <Truck className="w-4 h-4 text-sky-600" />
            <span>Tracking Vehicle: {vehicleNumber || 'KA02JQ3882'} ({vehicleDriver || 'Manish Kumar'})</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Live Tracking Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[620px]">
        {/* Left Column: Vehicle Search & Selector List */}
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

        {/* Right Column: Interactive Live GIS Map */}
        <LiveMap
          vehicle={activeVehicle}
          points={livePoints}
          currentLocation={liveCurrentLocation}
          startPoint={liveStartPoint}
          destinationPoint={liveDestinationPoint}
          allVehicles={allVehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={selectVehicleById}
          isDeviation={isDeviation}
          isFleetOverview={true}
          loading={trackingLoading}
          containerClassName="lg:col-span-9 rounded-2xl p-4 min-h-[620px]"
        />
      </div>
    </div>
  );
};

export default LiveMovement;
