import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Shield, MapPin,
  Building2, Compass, CalendarRange,
  Truck, Navigation, Activity,
  Leaf, Recycle, Trash2, AlertTriangle, Scale, Factory
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

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
        className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 leading-none">
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
        let corpsList = res.data.corporations || [];

        // If empty or Bommanahalli is not found, insert a fallback mock option
        const hasBommanahalli = corpsList.some(c => c.corporation_name.toLowerCase() === 'bommanahalli');
        if (!hasBommanahalli) {
          corpsList = [{ id: 'bommanahalli-mock', corporation_name: 'Bommanahalli' }, ...corpsList];
        }

        setCorporations(corpsList);

        const bommanahalli = corpsList.find(c => c.corporation_name.toLowerCase() === 'bommanahalli');
        if (bommanahalli) {
          setSelectedCorp(bommanahalli.id);
        } else if (corpsList.length > 0) {
          setSelectedCorp(corpsList[0].id);
        }
      } catch (err) {
        console.error("Error loading corporations for filters:", err);
        // Fallback list
        const fallbackList = [{ id: 'bommanahalli-mock', corporation_name: 'Bommanahalli' }];
        setCorporations(fallbackList);
        setSelectedCorp('bommanahalli-mock');
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
      if (selectedCorp === 'bommanahalli-mock') {
        const mockDivisions = [
          { id: 'div-1', zone_name: 'Bommanahalli Division' },
          { id: 'div-2', zone_name: 'HSR Layout' },
          { id: 'div-3', zone_name: 'Begur' }
        ];
        setDivisions(mockDivisions);
        setSelectedDivision('All');
        return;
      }
      try {
        const res = await api.get(`/corporations/${selectedCorp}/zones`);
        setDivisions(res.data.zones || []);
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
      if (selectedDivision.startsWith('div-')) {
        const mockWards = [
          { id: 'ward-174', ward_name: 'Ward 174 (HSR Layout)' },
          { id: 'ward-175', ward_name: 'Ward 175 (Bommanahalli)' },
          { id: 'ward-176', ward_name: 'Ward 176 (Anjanapura)' }
        ];
        setWards(mockWards);
        setSelectedWard('All');
        return;
      }
      try {
        const res = await api.get(`/zones/${selectedDivision}/wards`);
        setWards(res.data.wards || []);
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

    const bommanahalli = corporations.find(c => c.corporation_name.toLowerCase() === 'bommanahalli');
    if (bommanahalli) {
      setSelectedCorp(bommanahalli.id);
    } else if (corporations.length > 0) {
      setSelectedCorp(corporations[0].id);
    } else {
      setSelectedCorp('');
    }

    setSelectedDivision('All');
    setSelectedWard('All');
    setCollectionStatus('All');

    setLoading(true);
    fetchStats();
    toast.success("Filters reset successfully");
  };

  // Map tracking state & simulation hooks
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  const [vehicleCoords, setVehicleCoords] = useState([
    { id: 'v1', name: 'Vehicle #102', route: 'Bommanahalli Route A', driver: 'Rajesh Kumar', speed: '32 km/h', load: '2.4t', status: 'Moving', lat: 12.9023, lng: 77.6242 },
    { id: 'v2', name: 'Vehicle #108', route: 'HSR Route B', driver: 'Anil Singh', speed: '24 km/h', load: '1.8t', status: 'Moving', lat: 12.9103, lng: 77.6384 },
    { id: 'v3', name: 'Vehicle #114', route: 'Begur Route C', driver: 'Sunil Gowda', speed: '0 km/h', load: '0.0t', status: 'Idle', lat: 12.8945, lng: 77.6201 }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(vehicleCoords[0]);

  // Load Google Maps resources dynamically
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleLoaded(true);
      return;
    }

    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }
  }, []);

  // Simulate vehicle movements
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicleCoords(prev => prev.map(v => {
        if (v.status === 'Idle') return v;
        const latDrift = (Math.random() - 0.5) * 0.0006;
        const lngDrift = (Math.random() - 0.5) * 0.0006;
        return {
          ...v,
          lat: v.lat + latDrift,
          lng: v.lng + lngDrift
        };
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Update map markers when vehicleCoords or selectedVehicle changes
  useEffect(() => {
    if (!googleLoaded || !mapRef.current) return;

    if (!mapInstance.current) {
      // Center map in the general Bommanahalli/HSR Layout area
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.9023, lng: 77.6242 },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      });
    }

    vehicleCoords.forEach(v => {
      const isSelected = selectedVehicle.id === v.id;
      const markerColor = v.status === 'Idle' ? '#94a3b8' : isSelected ? '#7c3aed' : '#10b981';

      const svgMarker = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${markerColor}" stroke="white" stroke-width="2"/><g transform="translate(6, 6) scale(0.8)"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.14a2 2 0 0 0-.59-1.41L18.7 7.72A2 2 0 0 0 17.29 7H14" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" fill="white"/><circle cx="17" cy="18" r="2" fill="white"/></g></svg>`),
        size: new window.google.maps.Size(32, 32),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(16, 16),
        scaledSize: new window.google.maps.Size(32, 32)
      };

      const position = { lat: v.lat, lng: v.lng };

      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setPosition(position);
        markersRef.current[v.id].setIcon(svgMarker);
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          icon: svgMarker,
          title: v.name
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><b>${v.name}</b><br/>Driver: ${v.driver}<br/>Status: ${v.status} (${v.speed})</div>`
        });

        marker.addListener('click', () => {
          setSelectedVehicle(v);
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current[v.id] = marker;
        markersRef.current[v.id].infoWindow = infoWindow;
      }

      if (isSelected) {
        markersRef.current[v.id].infoWindow.setContent(
          `<div><b>${v.name}</b><br/>Driver: ${v.driver}<br/>Status: ${v.status} (${v.speed})<br/>Load: ${v.load}</div>`
        );
      }
    });

  }, [googleLoaded, vehicleCoords, selectedVehicle]);

  const selectVehicleOnMap = (v) => {
    setSelectedVehicle(v);
    if (mapInstance.current) {
      mapInstance.current.setCenter({ lat: v.lat, lng: v.lng });
      mapInstance.current.setZoom(15);
    }
  };

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
            src="/dashboard-banner.webp"
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
            />
          </div>

          {/* CORPORATION */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Corporation
            </label>
            <select
              value={selectedCorp}
              onChange={(e) => setSelectedCorp(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Division
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              disabled={!selectedCorp}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={selectedDivision === 'All' || !selectedDivision}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Collection Status
            </label>
            <select
              value={collectionStatus}
              onChange={(e) => setCollectionStatus(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
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
          <h2 className="text-base font-bold text-slate-700">{t('BWG_Operations') || 'Municipal Operations'}</h2>
          <p className="text-slate-400 text-[11px]">{t('BWG_description') || 'Track and manage municipal corporations, zones, wards, and scheduled collection events'}</p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch gap-1.5">
          <BwgCard
            title="Bulk Waste Generator (BWG)"
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
          <h2 className="text-base font-bold text-slate-700">Waste Overview</h2>
          <p className="text-slate-400 text-[11px]">Real-time snapshot of waste categories, pickups, and fleet deployment</p>
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

      {/* LIVE VEHICLE TRACKING MAP */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-lg font-bold text-slate-700">Live Vehicle Tracking</h2>
          <p className="text-slate-400 text-xs">Real-time status and geographic location tracking of active municipal collection trucks</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Active Fleet Status
            </span>
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
              {vehicleCoords.map((v) => {
                const isSelected = selectedVehicle.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => selectVehicleOnMap(v)}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                      ? 'border-[#7c3aed] bg-purple-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${v.status === 'Idle'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">{v.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Driver: {v.driver}</p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                          <Navigation className="w-2.5 h-2.5 rotate-45 text-slate-400" />
                          {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${v.status === 'Idle'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {v.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold">{v.speed}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Display */}
          <div className="flex-1 h-[400px] rounded-xl overflow-hidden relative border border-slate-100 bg-slate-50">
            <div ref={mapRef} className="w-full h-full z-10" />
            {!googleLoaded && (
              <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-slate-500 text-xs font-medium">Loading Interactive Map...</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
