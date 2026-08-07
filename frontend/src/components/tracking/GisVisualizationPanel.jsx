import React, { memo } from 'react';
import { Zap, Truck, AlertTriangle, CheckCircle2, ExternalLink, MapPin } from 'lucide-react';
import { formatRelativeTime, formatTimeString } from '../../utils/geoUtils';
import PlaybackControls from './PlaybackControls';

const GisVisualizationPanel = ({
  vehicle,
  points,
  currentLocation,
  startPoint,
  destinationPoint,
  status,
  speed,
  driver,
  vehicleNumber,
  totalDistance,
  timestamp,
  isDeviation,
  playbackState,
  onStartPlayback,
  onPausePlayback,
  onResetPlayback,
  onIndexChange,
  onSpeedChange
}) => {
  const [showApartmentModal, setShowApartmentModal] = React.useState(false);

  if (!vehicle) {
    return (
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center text-slate-400 text-xs font-semibold">
        Select a vehicle to view GIS route details
      </div>
    );
  }

  const isMoving = status === 'MOVING';
  const isIdle = status === 'IDLE';

  // Calculate dynamic progress percent along points
  const pointsCount = points.length;
  const currentIdx = playbackState.isPlaying || playbackState.currentIndex > 0 ? playbackState.currentIndex : Math.max(0, pointsCount - 1);
  const progressPct = pointsCount > 1 ? Math.round(((currentIdx + 1) / pointsCount) * 100) : 0;



  return (
    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sky-600" /> GIS Route Monitoring
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Realtime route tracking & deviation alerts</p>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm ${
            isDeviation
              ? 'bg-rose-600'
              : isIdle
              ? 'bg-amber-500'
              : isMoving
              ? 'bg-emerald-600'
              : 'bg-slate-600'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-white" />
          <span>{vehicleNumber}</span>
        </div>
      </div>

      {/* Live Metric Banner */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
              isDeviation
                ? 'bg-rose-100 text-rose-700'
                : isIdle
                ? 'bg-amber-100 text-amber-800'
                : isMoving
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDeviation
                  ? 'bg-rose-600 animate-ping'
                  : isIdle
                  ? 'bg-amber-500'
                  : isMoving
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            {isDeviation ? 'Deviation Alert' : status}
          </span>

          <span className="text-[10px] text-slate-400 font-medium">
            Driver: <strong className="text-slate-700">{driver}</strong>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-center">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Speed</span>
            <span className="text-xs font-extrabold text-slate-800">{speed} km/h</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Last Update</span>
            <span className="text-xs font-extrabold text-slate-800">{formatRelativeTime(timestamp)}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Points Recorded</span>
            <span className="text-xs font-extrabold text-sky-700">{pointsCount}</span>
          </div>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="relative w-full flex-1 min-h-[190px] bg-slate-50/60 rounded-xl border border-slate-200 p-2 overflow-hidden shadow-inner flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <svg className="w-full h-full relative z-10" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeGradientDynamic" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Planned / Traveled Cubic Bezier Route Line */}
          <path
            d="M 50 140 C 150 140, 230 40, 350 40"
            fill="none"
            stroke="url(#routeGradientDynamic)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Start Marker */}
          <g>
            <circle cx="50" cy="140" r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="50" cy="140" r="4" fill="#ffffff" />
            <text x="50" y="162" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="800">START</text>
          </g>

          {/* 3 Sequential Pickup Stop Pins along Bezier Curve with Color Toggle */}
          {(() => {
            const getCubicBezier = (u, p0, p1, p2, p3) => {
              const oneMinusU = 1 - u;
              return Math.pow(oneMinusU, 3) * p0 + 3 * Math.pow(oneMinusU, 2) * u * p1 + 3 * oneMinusU * Math.pow(u, 2) * p2 + Math.pow(u, 3) * p3;
            };

            const tCurrent = Math.max(0, Math.min(1, progressPct / 100));
            const pickupStops = [
              { id: 1, label: 'P1', tRatio: 0.25 },
              { id: 2, label: 'P2', tRatio: 0.50 },
              { id: 3, label: 'P3', tRatio: 0.75 }
            ];

            return pickupStops.map((stop) => {
              const aptX = getCubicBezier(stop.tRatio, 50, 150, 230, 350);
              const aptY = getCubicBezier(stop.tRatio, 140, 140, 40, 40);
              const isCollected = tCurrent >= stop.tRatio;

              return (
                <g key={stop.id} transform={`translate(${aptX}, ${aptY})`} onClick={() => setShowApartmentModal(true)} className="cursor-pointer">
                  <circle cx="0" cy="0" r="10" fill={isCollected ? '#10b981' : '#f59e0b'} stroke="#ffffff" strokeWidth="2.5" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
                    {stop.label}
                  </text>
                  <text x="0" y="20" textAnchor="middle" fill={isCollected ? '#047857' : '#b45309'} fontSize="8" fontWeight="800">
                    {isCollected ? 'COLLECTED ✅' : 'PENDING 🕒'}
                  </text>
                </g>
              );
            });
          })()}



          {/* Current Animated Position Indicator - Precisely Calculated on Cubic Bezier Curve */}
          {(() => {
            const t = Math.max(0, Math.min(1, progressPct / 100));
            const getCubicBezier = (u, p0, p1, p2, p3) => {
              const oneMinusU = 1 - u;
              return (
                Math.pow(oneMinusU, 3) * p0 +
                3 * Math.pow(oneMinusU, 2) * u * p1 +
                3 * oneMinusU * Math.pow(u, 2) * p2 +
                Math.pow(u, 3) * p3
              );
            };

            const truckX = getCubicBezier(t, 50, 150, 230, 350);
            const truckY = getCubicBezier(t, 140, 140, 40, 40);

            return (
              <g transform={`translate(${truckX}, ${truckY})`}>
                <circle cx="0" cy="0" r="14" fill={isDeviation ? '#ef4444' : '#0284c7'} fillOpacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="7" fill={isDeviation ? '#dc2626' : '#0284c7'} stroke="#ffffff" strokeWidth="2" />
              </g>
            );
          })()}

          {/* Destination Marker */}
          <g>
            <circle cx="350" cy="40" r="12" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="350" cy="40" r="4" fill="#ffffff" />
            <text x="350" y="62" textAnchor="middle" fill="#7c3aed" fontSize="10" fontWeight="900">DEST</text>
          </g>
        </svg>
      </div>

      {/* Dynamic Route Legend Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 px-3 flex flex-wrap items-center justify-between gap-2 shadow-sm text-xs">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Hommlie Office</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Apartment Stop</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-sky-600" />
          <span>Live Vehicle</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span>Mukka Proteins</span>
        </div>
      </div>

      {/* Active Collection Stop / Apartment Banner (Clickable to view details) */}

      {/* Active Collection Stop / Apartment Banner (Clickable to view details) */}
      <div
        onClick={() => setShowApartmentModal(true)}
        className="bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs cursor-pointer transition-all shadow-sm group"
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="truncate">
            <span className="text-[9px] text-amber-700 font-bold uppercase block">Active Collection Site (Click for Details)</span>
            <span className="font-extrabold text-amber-950 text-xs truncate block">
              🏢 {vehicle.currentApartment || 'Apartment Collection Site'}
            </span>
          </div>
        </div>
        <span className="px-2 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-black shrink-0 flex items-center gap-1 shadow-sm">
          <span>View Site</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
          <span className="truncate max-w-[40%]" title={vehicle.startName || 'Hommlie Office'}>
            {vehicle.startName || 'Hommlie Office'}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">➔ {totalDistance || 0} km ➔</span>
          <span className="text-purple-900 font-extrabold truncate max-w-[40%]" title={destinationPoint?.name || 'Mukka Proteins'}>
            {destinationPoint?.name || 'Mukka Proteins'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Start • {formatTimeString(startPoint?.timestamp || vehicle.startTime)}</span>
          <span>Dest • Mukka Proteins, Bagaluru</span>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-800">{progressPct}%</span>
        </div>
      </div>

      {/* Dynamic Route Status Alert Banner */}
      {isDeviation ? (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3 flex items-center justify-between gap-2 text-xs shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h5 className="font-extrabold text-rose-900 text-xs uppercase tracking-wide">🚨 Route Deviation Alert</h5>
              <p className="text-[11px] text-rose-700 font-bold">
                {vehicleNumber} has departed from the approved route ({vehicle.currentApartment || 'Unauthorized Detour Site'})
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <h5 className="font-extrabold text-emerald-900 text-xs">Route Status Normal</h5>
              <p className="text-[10px] text-emerald-700 font-medium">
                {vehicleNumber} operating on approved route ({vehicle.currentApartment || 'Hommlie Route'})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apartment Details Modal Overlay */}
      {showApartmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {vehicle.currentApartment || 'Apartment Collection Site'}
                  </h3>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                    Active Collection Stop
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowApartmentModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-extrabold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Address & Location</span>
                <p className="font-bold text-slate-800">
                  {vehicle.metadata?.apartmentAddress || `${vehicle.currentApartment || 'Sector 4, Bellandur'}, Bengaluru, Karnataka 560103`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">Total Flats</span>
                  <span className="text-base font-black text-amber-950">{vehicle.metadata?.flatsCount || 320} Units</span>
                </div>
                <div className="bg-sky-50/80 p-3 rounded-2xl border border-sky-100">
                  <span className="text-[10px] text-sky-700 font-bold block">Est. Waste Volume</span>
                  <span className="text-base font-black text-sky-950">{vehicle.metadata?.wasteKg || 450} kg</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Driver:</span>
                  <span className="font-extrabold text-slate-800">{driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle Number:</span>
                  <span className="font-extrabold text-sky-600">{vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-bold text-emerald-700">09:30 AM - 11:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination Facility:</span>
                  <span className="font-bold text-purple-700">Mukka Proteins (Bagaluru)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowApartmentModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-2xl font-extrabold text-xs hover:bg-slate-800 transition-colors shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(GisVisualizationPanel);

