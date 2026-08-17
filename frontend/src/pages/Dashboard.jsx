import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Shield, MapPin,
  Building2, Compass, CalendarRange,
  Truck, Navigation, Activity,
  Leaf, Recycle, Trash2, AlertTriangle, Scale, Factory, ExternalLink,
  Search, Filter, SlidersHorizontal, Signal, ChevronDown, ChevronLeft, ChevronRight,
  Clock, AlertOctagon, RotateCcw, Radio, Eye, Share2, CheckCircle2, Crosshair, Plus, Minus, Layers, Zap, Maximize2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import useVehicleTracking from '../hooks/useVehicleTracking';
import VehicleList from '../components/tracking/VehicleList';
import LiveMap from '../components/tracking/LiveMap';
import GisVisualizationPanel from '../components/tracking/GisVisualizationPanel';


// ─── Circular stat card matching the design mockup ───────────────────────────
const WasteStatCard = ({ label, value, unit, color, bgColor, icon, onClick }) => {
  const circumference = 2 * Math.PI * 42; // r=42
  const progress = 0.75; // decorative ring at 75%
  const dashOffset = circumference * (1 - progress);
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center gap-3"
    >
      {/* Circular ring with icon */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
          {/* Colored progress ring */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Icon centered */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ margin: '12px' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bgColor, color }}
          >
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
          </div>
        </div>
      </div>

      {/* Value + unit */}
      <div className="text-center">
        <p className="text-2xl font-extrabold text-slate-800 leading-none">
          {value}
          {unit && <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>

      {/* Label pill */}
      <div
        className="px-4 py-2 rounded-full text-sm font-medium tracking-wide"
        style={{ backgroundColor: bgColor, color }}
      >
        {label}
      </div>
    </div>
  );
};

// ─── BWG Card with custom layered background waves matching the design mockup ───────────
const BwgCard = ({ title, value, onClick, icon: Icon, iconBg, iconColor, gradientId, stopColor }) => {
  return (
    <div
      onClick={onClick}
      className="flex-1 min-w-[150px] relative group cursor-pointer bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] p-5 overflow-hidden"
    >
      {/* Layered SVG Waves in the background */}
      <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stopColor} stopOpacity="0" />
              <stop offset="100%" stopColor={stopColor} stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id={`grad2-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stopColor} stopOpacity="0" />
              <stop offset="100%" stopColor={stopColor} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {/* Back Wave Layer */}
          <path
            d="M 0,40 Q 50,20 100,32 T 200,22 L 200,40 Z"
            fill={`url(#grad-${gradientId})`}
          />
          {/* Front Wave Layer */}
          <path
            d="M 0,40 Q 60,12 120,28 T 200,16 L 200,40 Z"
            fill={`url(#grad2-${gradientId})`}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Icon box (custom rounded-xl with light bg) */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} transition-all duration-300 group-hover:scale-105`}>
          <Icon className="w-5.5 h-5.5" />
        </div>

        {/* Text and Number */}
        <div className="mt-5">
          <p className="text-base font-normal text-black mb-1.5">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { t } = useSettings();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin';

  // Filter States
  const [fromDate, setFromDate] = useState('2026-07-01');
  const [toDate, setToDate] = useState('2026-07-08');
  const [selectedCorp, setSelectedCorp] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedWard, setSelectedWard] = useState('All');
  const [collectionStatus, setCollectionStatus] = useState('All');

  const [corporations, setCorporations] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch Dashboard Stats
  const fetchStats = async (filterParams = {}) => {
    try {
      const res = await api.get('/dashboard/stats', { params: filterParams });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  // Initial stats fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch Corporations for filters
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const res = await api.get('/corporations', { params: { status: 'Active', limit: 1000 } });
        const corpsList = res.data.corporations || res.data || [];
        setCorporations(corpsList);
        setSelectedCorp('');
      } catch (err) {
        console.error("Error loading corporations for filters:", err);
        setCorporations([]);
        setSelectedCorp('');
      }
    };
    loadFilterData();
  }, []);

  // Fetch Divisions (Zones) when selected Corporation changes
  useEffect(() => {
    if (!selectedCorp) {
      setDivisions([]);
      setSelectedDivision('All');
      return;
    }
    const loadDivisions = async () => {
      try {
        const res = await api.get(`/corporations/${selectedCorp}/zones`);
        setDivisions(res.data.zones || res.data || []);
        setSelectedDivision('All');
      } catch (err) {
        console.error("Error loading divisions:", err);
        setDivisions([]);
        setSelectedDivision('All');
      }
    };
    loadDivisions();
  }, [selectedCorp]);

  // Fetch Wards when selected Division changes
  useEffect(() => {
    if (selectedDivision === 'All' || !selectedDivision) {
      setWards([]);
      setSelectedWard('All');
      return;
    }
    const loadWards = async () => {
      try {
        const res = await api.get(`/zones/${selectedDivision}/wards`);
        setWards(res.data.wards || res.data || []);
        setSelectedWard('All');
      } catch (err) {
        console.error("Error loading wards:", err);
        setWards([]);
        setSelectedWard('All');
      }
    };
    loadWards();
  }, [selectedDivision]);

  // Filter actions
  const handleApplyFilters = () => {
    setLoading(true);
    fetchStats({
      fromDate,
      toDate,
      corporation_id: selectedCorp,
      zone_id: selectedDivision,
      ward_id: selectedWard,
      status: collectionStatus
    });
    toast.success("Filters applied successfully");
  };

  const handleResetFilters = () => {
    setFromDate('2026-07-01');
    setToDate('2026-07-08');
    setSelectedCorp('');
    setSelectedDivision('All');
    setSelectedWard('All');
    setCollectionStatus('All');

    setLoading(true);
    fetchStats();
    toast.success("Filters reset successfully");
  };

  // Real-time Firebase Vehicle Tracking Hook
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
    points,
    currentLocation,
    startPoint,
    destinationPoint,
    status: vehicleStatus,
    speed: vehicleSpeed,
    driver: vehicleDriver,
    vehicleNumber,
    totalDistance,
    timestamp: vehicleTimestamp,
    isDeviation,
    playbackState,
    startPlayback,
    pausePlayback,
    resetPlayback,
    setPlaybackIndex,
    setPlaybackSpeed,
  } = useVehicleTracking();

  const [isFleetOverview, setIsFleetOverview] = useState(true);



  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  if (!data) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <p className="text-slate-500">Failed to load data.</p>
      <button onClick={() => window.location.reload()} className="text-[#7c3aed] font-bold hover:underline">Retry</button>
    </div>
  );

  const { stats } = data;

  return (
    <div className="space-y-6">

      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full relative min-h-[110px] pb-2">
        <div className="pb-2">
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            {t('dashboard_overview') || 'Dashboard Overview'}
            <Leaf className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">{t('system_snapshot') || 'System snapshot and real-time metrics.'}</p>
        </div>
        {/* Right side banner illustration matching the mockup */}
        <div className="hidden md:block absolute right-0 bottom-[-20px] h-32 md:h-40 lg:h-70 max-w-full select-none pointer-events-none">
          <img
            src="/panel/dashboard-banner.webp"
            alt="Dashboard Banner"
            className="h-full w-auto object-contain object-right-bottom"
          />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">

          {/* FROM DATE */}
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm font-normal text-black block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
            />
          </div>

          {/* TO DATE */}
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm font-normal text-black block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
            />
          </div>

          {/* CORPORATION */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-normal text-black block mb-1">
              Corporation
            </label>
            <select
              value={selectedCorp}
              onChange={(e) => setSelectedCorp(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
            >
              <option value="">All Corporations</option>
              {corporations.map((corp) => (
                <option key={corp.id} value={corp.id}>
                  {corp.corporation_name}
                </option>
              ))}
            </select>
          </div>

          {/* DIVISION */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-normal text-black block mb-1">
              Division
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              disabled={!selectedCorp}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="All">All Divisions</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.zone_name}
                </option>
              ))}
            </select>
          </div>

          {/* WARD */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-normal text-black block mb-1">
              Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={selectedDivision === 'All' || !selectedDivision}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="All">All Wards</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.ward_name}
                </option>
              ))}
            </select>
          </div>

          {/* COLLECTION STATUS */}
          <div className="flex-1 min-w-[130px]">
            <label className="text-sm font-normal text-black block mb-1">
              Collection Status
            </label>
            <select
              value={collectionStatus}
              onChange={(e) => setCollectionStatus(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold transition-colors shadow-sm bg-white"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              Apply Filter
            </button>
          </div>

        </div>
      </div>

      {/* ADMINISTRATION & FIELD OPERATIONS */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-700">{t('BWG_Operations') || 'Municipal Operations'}</h2>
          {/* <p className="text-slate-400 text-[11px]">{t('BWG_description') || 'Track and manage municipal corporations, zones, wards, and scheduled collection events'}</p> */}
        </div>
        <div className="flex flex-col lg:flex-row items-stretch gap-1.5">
          <BwgCard
            title="Bulk Waste Generator"
            value={(stats.totalBWGs || 0).toLocaleString()}
            onClick={() => navigate('/bwg/collection-event')}
            icon={Factory}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            gradientId="bwg"
            stopColor="#10b981"
          />

          <div className="hidden lg:flex items-center justify-center px-1 text-emerald-600/70 font-black text-xl select-none">
            →
          </div>

          <BwgCard
            title="Corporation"
            value={(stats.totalCorporations || 0).toLocaleString()}
            onClick={() => navigate('/bwg/corporation')}
            icon={Building2}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            gradientId="corp"
            stopColor="#3b82f6"
          />

          <div className="hidden lg:flex items-center justify-center px-1 text-emerald-600/70 font-black text-xl select-none">
            →
          </div>

          <BwgCard
            title="Zone"
            value={(stats.totalZones || 0).toLocaleString()}
            onClick={() => navigate('/bwg/zone')}
            icon={Compass}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            gradientId="zone"
            stopColor="#8b5cf6"
          />

          <div className="hidden lg:flex items-center justify-center px-1 text-emerald-600/70 font-black text-xl select-none">
            →
          </div>

          <BwgCard
            title="Ward"
            value={(stats.totalWards || 0).toLocaleString()}
            onClick={() => navigate('/bwg/ward')}
            icon={MapPin}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            gradientId="ward"
            stopColor="#f97316"
          />

          <div className="hidden lg:flex items-center justify-center px-1 text-emerald-600/70 font-black text-xl select-none">
            →
          </div>

          <BwgCard
            title="Collection Event"
            value={(stats.totalCollectionEvents || 0).toLocaleString()}
            onClick={() => navigate('/bwg/collection-event')}
            icon={CalendarRange}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            gradientId="event"
            stopColor="#0d9488"
          />
        </div>
      </div>

      {/* ──────────────── WASTE STATISTICS CARDS ──────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-700">Waste Overview</h2>
          {/* <p className="text-slate-400 text-[11px]">Real-time snapshot of waste categories, pickups, and fleet deployment</p> */}
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* BWG Registered */}
          <WasteStatCard
            label="BWG Registered"
            value={(stats.totalBWGs || 0).toLocaleString()}
            unit=""
            color="#22c55e"
            bgColor="#dcfce7"
            icon={<Leaf />}
            onClick={() => navigate('/waste-collection-requests')}
          />
          {/* Wet Waste */}
          <WasteStatCard
            label="Wet Waste"
            value={(stats.wetWaste || 0).toLocaleString()}
            unit="Tons"
            color="#16a34a"
            bgColor="#dcfce7"
            icon={<Leaf />}
            onClick={() => navigate('/waste-collection-requests')}
          />
          {/* Dry Waste */}
          <WasteStatCard
            label="Dry Waste"
            value={(stats.dryWaste || 0).toLocaleString()}
            unit="Tons"
            color="#f59e0b"
            bgColor="#fef3c7"
            icon={<Recycle />}
            onClick={() => navigate('/waste-collection-requests')}
          />
          {/* Sanitary Waste */}
          <WasteStatCard
            label="Sanitary Waste"
            value={(stats.sanitaryWaste || 0).toLocaleString()}
            unit="Tons"
            color="#3b82f6"
            bgColor="#dbeafe"
            icon={<Trash2 />}
            onClick={() => navigate('/waste-collection-requests')}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Special Care Waste */}
          <WasteStatCard
            label="Special Care Waste"
            value={(stats.specialCareWaste || 0).toLocaleString()}
            unit="Tons"
            color="#ef4444"
            bgColor="#fee2e2"
            icon={<AlertTriangle />}
            onClick={() => navigate('/waste-collection-requests')}
          />
          {/* Total Waste */}
          <WasteStatCard
            label="Total Waste"
            value={(stats.totalWaste || 0).toLocaleString()}
            unit="Tons"
            color="#22c55e"
            bgColor="#dcfce7"
            icon={<Scale />}
            onClick={() => navigate('/waste-collection-requests')}
          />
          {/* Total Pickups */}
          <WasteStatCard
            label="Total Pickups"
            value={(stats.totalPickups || 0).toLocaleString()}
            unit=""
            color="#8b5cf6"
            bgColor="#ede9fe"
            icon={<Truck />}
            onClick={() => navigate('/waste-collection-requests')}
          />
          {/* Total Vehicles */}
          <WasteStatCard
            label="Total Vehicles"
            value={(stats.totalVehicles || 0).toLocaleString()}
            unit=""
            color="#f59e0b"
            bgColor="#fef3c7"
            icon={<Truck />}
            onClick={() => navigate('/aggregator-vehicles')}
          />
        </div>
      </div>


      {/* SYSTEM ACCESS & GEOGRAPHIC SETTINGS - hidden per user request */}

      {/* ──────────────── LIVE VEHICLE TRACKING & GIS ROUTE MONITORING (3-COLUMN LAYOUT) ──────────────── */}
      <div className="space-y-4 pt-4 font-sans">
        
        {/* Top Section Banner with Live Movement Overview Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0d4634] flex items-center justify-center shadow-md">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Live Vehicle Tracking & GIS Monitoring
              </h2>
              <p className="text-slate-500 text-xs font-medium">
                Real-time fleet tracking, GPS location & deviation alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFleetOverview((prev) => !prev)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${
                isFleetOverview
                  ? 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>📡 Live Movement - Listen (All Trucks)</span>
            </button>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-extrabold border border-emerald-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              GPS Active
            </span>
            <button
              onClick={() => navigate('/vehicle-history')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all border border-slate-200 shadow-sm flex items-center gap-1.5 px-3 text-xs font-extrabold"
              title="Full Screen / Tracking History"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
              <span>Full Screen</span>
            </button>
          </div>

        </div>

        {/* 3-COLUMN MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ── LEFT COLUMN: VEHICLE SEARCH & LIST ── */}
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

          {/* ── MIDDLE COLUMN: REAL-TIME INTERACTIVE GOOGLE MAP ── */}
          <LiveMap
            vehicle={activeVehicle}
            points={points}
            currentLocation={currentLocation}
            startPoint={startPoint}
            destinationPoint={destinationPoint}
            allVehicles={allVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={selectVehicleById}
            isDeviation={isDeviation}
            isFleetOverview={isFleetOverview}
            loading={trackingLoading}
          />


          {/* ── RIGHT COLUMN: GIS ROUTE VISUALIZATION & PLAYBACK PANEL ── */}
          <GisVisualizationPanel
            vehicle={activeVehicle}
            points={points}
            currentLocation={currentLocation}
            startPoint={startPoint}
            destinationPoint={destinationPoint}
            status={vehicleStatus}
            speed={vehicleSpeed}
            driver={vehicleDriver}
            vehicleNumber={vehicleNumber}
            totalDistance={totalDistance}
            timestamp={vehicleTimestamp}
            isDeviation={isDeviation}
            playbackState={playbackState}
            onStartPlayback={startPlayback}
            onPausePlayback={pausePlayback}
            onResetPlayback={resetPlayback}
            onIndexChange={setPlaybackIndex}
            onSpeedChange={setPlaybackSpeed}
          />
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
