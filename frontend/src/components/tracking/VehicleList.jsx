import React, { memo } from 'react';
import { Search, Filter, SlidersHorizontal, Truck, Navigation, Signal, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../../utils/geoUtils';

const VehicleList = ({
  filteredVehicles,
  totalVehiclesCount,
  selectedVehicleId,
  onSelectVehicle,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  loading
}) => {
  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between gap-3 h-full min-h-[640px]">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search vehicle number or driver..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <button
          onClick={onResetFilters}
          className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Reset Search & Filters"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Status">All Status</option>
          <option value="Moving">Moving</option>
          <option value="Idle">Idle</option>
          <option value="Stopped">Stopped</option>
          <option value="Deviation">Deviation</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="Status">Sort: Status</option>
          <option value="Name">Sort: Vehicle #</option>
          <option value="Speed">Sort: Speed</option>
        </select>
      </div>

      {/* Counter Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
        <span className="font-extrabold text-sky-900 text-xs">
          {filteredVehicles.length} of {totalVehiclesCount} Vehicles
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Realtime Firebase</span>
      </div>

      {/* Vehicles List - Fills full vertical height smoothly */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-h-[480px] max-h-[620px] pr-1">

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading vehicles from Firebase...</span>
          </div>
        ) : filteredVehicles.filter(v => v && v.vehicleNumber && !v.vehicleNumber.includes('Vehicle #')).length > 0 ? (
          filteredVehicles
            .filter(v => v && v.vehicleNumber && !v.vehicleNumber.includes('Vehicle #'))
            .map((v) => {
            const isSelected = selectedVehicleId === v.id;
            const statusUpper = (v.status || '').toUpperCase();
            const isMoving = statusUpper === 'MOVING';
            const isIdle = statusUpper === 'IDLE';
            const isStopped = statusUpper === 'STOPPED';

            const statusBg = v.isDeviation
              ? 'bg-rose-500 text-white'
              : isIdle
              ? 'bg-amber-500 text-white'
              : isStopped
              ? 'bg-slate-600 text-white'
              : 'bg-emerald-500 text-white';

            const hasRealApartment = v.currentApartment && v.currentApartment !== 'Apartment Pickup Site';

            return (
              <div
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  v.isDeviation
                    ? isSelected
                      ? 'border-rose-500 bg-rose-50/90 shadow-md ring-2 ring-rose-500/30'
                      : 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                {/* Header line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${statusBg} flex items-center justify-center shadow-sm shrink-0`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        {v.vehicleNumber}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold">Driver: {v.driverName}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wide ${
                      v.isDeviation
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : isIdle
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isStopped
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        v.isDeviation
                          ? 'bg-rose-500'
                          : isIdle
                          ? 'bg-amber-500'
                          : isStopped
                          ? 'bg-slate-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {v.isDeviation ? 'DEVIATION' : v.status}
                  </span>
                </div>

                {/* Apartment Collection Location (Only rendered when assigned) */}
                {hasRealApartment && (
                  <div className="text-[10px] text-slate-700 font-bold flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">🏢 {v.currentApartment}</span>
                  </div>
                )}


                {/* Footer line */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-[10px]">

                  {v.isDeviation ? (
                    <span className="font-extrabold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Off-Route Alert
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      <Navigation className="w-3 h-3 text-emerald-600 rotate-45" />
                      <span>{v.speed} km/h</span>
                      {isMoving && <Signal className="w-3 h-3 text-emerald-500 ml-0.5 animate-pulse" />}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-medium">
                    Updated {formatRelativeTime(v.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs font-semibold">
            {searchQuery ? `No vehicle matches "${searchQuery}"` : 'No vehicle data available in Firebase.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(VehicleList);
