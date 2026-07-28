import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Shield, MapPin,
  Building2, Compass, CalendarRange,
  Truck, Navigation, Activity,
  Leaf, Recycle, Trash2, AlertTriangle, Scale, Factory, ExternalLink,
  Search, Filter, SlidersHorizontal, Signal, ChevronDown, ChevronLeft, ChevronRight,
  Clock, AlertOctagon, RotateCcw, Radio, Eye, Share2, CheckCircle2, Crosshair, Plus, Minus, Layers, Zap
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

  // Filter & View states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [groupFilter, setGroupFilter] = useState('All Groups');
  const [sortBy, setSortBy] = useState('Status');
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [vehicleCoords, setVehicleCoords] = useState([
    {
      id: 'v114',
      name: 'Vehicle #114',
      group: 'Koramangala',
      driver: 'Sunil Gowda',
      speed: '62 km/h',
      speedValue: 62,
      location: 'Koramangala, Bengaluru',
      load: '2.4t',
      status: 'Moving',
      isDeviation: false,
      color: '#10b981',
      lat: 12.9352,
      lng: 77.6245,
      route: 'Koramangala Route A',
      progress: 78,
      lastUpdate: '5 sec ago',
      eta: '02:45 PM',
      distance: '112 km'
    },
    {
      id: 'v108',
      name: 'Vehicle #108',
      group: 'HSR Layout',
      driver: 'Anil Singh',
      speed: '24 km/h',
      speedValue: 24,
      location: 'Banashankari, Bengaluru',
      load: '1.8t',
      status: 'Deviation',
      isDeviation: true,
      deviationDetails: '3.2 km Off-Route',
      color: '#ef4444',
      lat: 12.9103,
      lng: 77.6384,
      route: 'HSR Route B (Off-Route)',
      progress: 68,
      lastUpdate: '10 sec ago',
      eta: '03:30 PM',
      distance: '128 km'
    },
    {
      id: 'v102',
      name: 'Vehicle #102',
      group: 'JP Nagar',
      driver: 'Rajesh Kumar',
      speed: '45 km/h',
      speedValue: 45,
      location: 'JP Nagar, Bengaluru',
      load: '2.1t',
      status: 'Moving',
      isDeviation: false,
      color: '#3b82f6',
      lat: 12.9069,
      lng: 77.5813,
      route: 'JP Nagar Route C',
      progress: 42,
      lastUpdate: '2 sec ago',
      eta: '04:15 PM',
      distance: '94 km'
    },
    {
      id: 'v116',
      name: 'Vehicle #116',
      group: 'BTM Layout',
      driver: 'Manoj Naik',
      speed: '0 km/h · 15m',
      speedValue: 0,
      location: 'BTM Layout, Bengaluru',
      load: '0.0t',
      status: 'Idle',
      isDeviation: false,
      color: '#64748b',
      lat: 12.8945,
      lng: 77.6201,
      route: 'BTM Route D',
      progress: 15,
      lastUpdate: '15 min ago',
      eta: '05:00 PM',
      distance: '45 km'
    },
    {
      id: 'v120',
      name: 'Vehicle #120',
      group: 'Electronic City',
      driver: 'Suresh Babu',
      speed: '55 km/h',
      speedValue: 55,
      location: 'Electronic City, Bengaluru',
      load: '3.0t',
      status: 'Moving',
      isDeviation: false,
      color: '#f59e0b',
      lat: 12.8452,
      lng: 77.6602,
      route: 'Electronic City Route E',
      progress: 90,
      lastUpdate: '1 sec ago',
      eta: '01:50 PM',
      distance: '156 km'
    },
    {
      id: 'v125',
      name: 'Vehicle #125',
      group: 'Electronic City',
      driver: 'Vikram Rao',
      speed: '0 km/h',
      speedValue: 0,
      location: 'Electronic City Phase 2, Bengaluru',
      load: '0.0t',
      status: 'Stopped',
      isDeviation: false,
      color: '#64748b',
      lat: 12.8390,
      lng: 77.6710,
      route: 'Route F (Stopped)',
      progress: 0,
      lastUpdate: '25 min ago',
      eta: 'Stopped',
      distance: '0 km'
    }
  ]);

  // Dynamic GIS route line position calculator based on vehicle progress %
  const getTruckGisCoords = (progress = 50, isDeviation = false) => {
    if (isDeviation) {
      return { x: 120, y: 50, currentSegment: 'Detour Site (3.2 km off route)', nextStop: 'Detour Site' };
    }
    const p = Math.max(0, Math.min(100, progress));
    const points = [
      { pct: 0, x: 50, y: 200, name: 'BWG Warehouse' },
      { pct: 25, x: 110, y: 150, name: 'P1 - Green Valley' },
      { pct: 50, x: 180, y: 120, name: 'P2 - Acme Tech Park' },
      { pct: 75, x: 260, y: 70, name: 'P3 - Royal Heights' },
      { pct: 100, x: 350, y: 40, name: 'Mukka Proteins' }
    ];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (p >= p1.pct && p <= p2.pct) {
        const ratio = (p - p1.pct) / (p2.pct - p1.pct);
        const x = p1.x + (p2.x - p1.x) * ratio;
        const y = p1.y + (p2.y - p1.y) * ratio;
        return {
          x,
          y,
          currentSegment: `${p1.name} ➔ ${p2.name}`,
          nextStop: p2.name
        };
      }
    }
    return { x: 350, y: 40, currentSegment: 'Mukka Proteins Limited', nextStop: 'DEST' };
  };

  const [selectedVehicle, setSelectedVehicle] = useState(vehicleCoords[1]); // Default to Vehicle #108
  const [selectedNode, setSelectedNode] = useState({
    id: 'p2',
    name: 'Acme Tech Park',
    address: 'Outer Ring Road, BTM Layout',
    type: 'Commercial Pickup Point 2',
    status: 'Active Collection Site',
    timestamp: '10:45 AM',
    assignedVehicle: 'Vehicle #108',
    driver: 'Anil Singh',
    vehicleDistance: 'Vehicle On-Site'
  });

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

  // Sync selectedVehicle properties when vehicleCoords update
  useEffect(() => {
    if (vehicleCoords.length > 0 && selectedVehicle) {
      const current = vehicleCoords.find(v => v.id === selectedVehicle.id);
      if (current) {
        setSelectedVehicle(current);
      }
    }
  }, [vehicleCoords]);

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
        const mainColor = v.isDeviation ? '#ef4444' : v.status === 'Idle' ? '#f59e0b' : v.status === 'Stopped' ? '#64748b' : '#10b981';
        const darkColor = v.isDeviation ? '#991b1b' : v.status === 'Idle' ? '#b45309' : v.status === 'Stopped' ? '#334155' : '#047857';
        const beaconColor = v.isDeviation ? '#f87171' : v.status === 'Idle' ? '#fbbf24' : v.status === 'Stopped' ? '#94a3b8' : '#34d399';

        // High-Quality Sleek Vector Truck Marker SVG (Clean - NO bottom/dashed circles)
        const truckSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="58" height="38" viewBox="0 0 58 38">
          <defs>
            <filter id="truckShadow-${v.id}" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.45"/>
            </filter>
            <linearGradient id="truckBody-${v.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${mainColor}" />
              <stop offset="100%" stop-color="${darkColor}" />
            </linearGradient>
          </defs>
          <g filter="url(#truckShadow-${v.id})">
            <!-- Waste Cargo Container (Body) -->
            <rect x="5" y="7" width="28" height="18" rx="3" fill="url(#truckBody-${v.id})" stroke="#ffffff" stroke-width="1.4" />
            
            <!-- Metallic Container Rib Lines -->
            <line x1="12" y1="9" x2="12" y2="23" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
            <line x1="19" y1="9" x2="19" y2="23" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
            <line x1="26" y1="9" x2="26" y2="23" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />

            <!-- Rear Loading Hopper -->
            <path d="M 5 7 L 5 25 L 1 23 L 1 9 Z" fill="${darkColor}" stroke="#ffffff" stroke-width="0.9" />

            <!-- Driver Cabin -->
            <path d="M 33 10 L 44 10 L 51 16 L 51 25 L 33 25 Z" fill="#0f172a" stroke="#ffffff" stroke-width="1.4" />
            
            <!-- Tinted Glass Windshield -->
            <path d="M 37 11.5 L 43 11.5 L 48.5 16 L 37 16 Z" fill="#38bdf8" fill-opacity="0.9" stroke="#ffffff" stroke-width="0.8" />

            <!-- Heavy Duty Chrome Rim Wheels -->
            <circle cx="11" cy="26" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.3" />
            <circle cx="11" cy="26" r="1.6" fill="#cbd5e1" />

            <circle cx="23" cy="26" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.3" />
            <circle cx="23" cy="26" r="1.6" fill="#cbd5e1" />

            <circle cx="44" cy="26" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.3" />
            <circle cx="44" cy="26" r="1.6" fill="#cbd5e1" />

            <!-- Top Roof Beacon Light -->
            <circle cx="40" cy="7.5" r="2" fill="${beaconColor}" stroke="#ffffff" stroke-width="0.8" />
          </g>
        </svg>`;

        const svgMarker = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(truckSvg),
          size: new window.google.maps.Size(58, 38),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(29, 19),
          scaledSize: new window.google.maps.Size(58, 38)
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

  const zoomInMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
    }
  };

  const zoomOutMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
    }
  };

  const recenterMap = () => {
    if (mapInstance.current && selectedVehicle) {
      mapInstance.current.setCenter({ lat: selectedVehicle.lat, lng: selectedVehicle.lng });
      mapInstance.current.setZoom(15);
    }
  };

  const filteredVehicles = vehicleCoords.filter(v => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(query) ||
      v.driver.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All Status' ||
      (statusFilter === 'Moving' && v.status === 'Moving') ||
      (statusFilter === 'Idle' && v.status === 'Idle') ||
      (statusFilter === 'Stopped' && (v.status === 'Stopped' || v.status === 'Idle')) ||
      (statusFilter === 'Deviation' && v.isDeviation);

    const matchesGroup =
      groupFilter === 'All Groups' || v.group === groupFilter;

    return matchesSearch && matchesStatus && matchesGroup;
  }).sort((a, b) => {
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Speed') return (b.speedValue || 0) - (a.speedValue || 0);
    if (sortBy === 'Status') {
      if (a.isDeviation) return -1;
      if (b.isDeviation) return 1;
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

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
        
        {/* Top Section Banner */}
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
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-extrabold border border-emerald-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              GPS Tracking Active
            </span>
          </div>
        </div>

        {/* 3-COLUMN MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* ── LEFT COLUMN: FLEET SEARCH, FILTERS & VEHICLE LIST (col-span-3) ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
            
            {/* Search Input & Filter Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />  
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vehicle, driver or location..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <button className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-extrabold">2</span>
              </button>
            </div>

            {/* Filter Dropdowns Row */}
            <div className="grid grid-cols-3 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="col-span-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Moving">Moving</option>
                <option value="Idle">Idle</option>
                <option value="Stopped">Stopped</option>
                <option value="Deviation">Deviation</option>
              </select>

              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="col-span-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer truncate"
              >
                <option value="All Groups">All Groups</option>
                <option value="Koramangala">Koramangala</option>
                <option value="HSR Layout">HSR Layout</option>
                <option value="JP Nagar">JP Nagar</option>
                <option value="BTM Layout">BTM Layout</option>
                <option value="Electronic City">Electronic City</option>
              </select>

              <button
                onClick={() => {
                  setStatusFilter('All Status');
                  setGroupFilter('All Groups');
                  setSearchQuery('');
                  toast.success("Filters reset");
                }}
                className="col-span-1 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Reset filters"
              >
                <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>

            {/* Sub-header Bar (Count & Sort) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
              <span className="font-extrabold text-sky-900 text-xs">128 Vehicles</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[11px] font-extrabold text-slate-700 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="Status">Status</option>
                  <option value="Name">Name</option>
                  <option value="Speed">Speed</option>
                </select>
              </div>
            </div>

            {/* Vehicle List Cards (Scrollable & Status Colored Icons) */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[460px] pr-1">
              {filteredVehicles.map((v) => {
                const isSelected = selectedVehicle.id === v.id;
                const statusBg = v.isDeviation
                  ? 'bg-rose-500 text-white'
                  : v.status === 'Idle'
                  ? 'bg-amber-500 text-white'
                  : v.status === 'Stopped'
                  ? 'bg-slate-600 text-white'
                  : 'bg-emerald-500 text-white';

                return (
                  <div
                    key={v.id}
                    onClick={() => selectVehicleOnMap(v)}
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
                    {/* Top line: Status-Colored Truck Icon, Name, Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Status-Based Icon Container (Green/Amber/Red/Slate - No Black) */}
                        <div className={`w-8 h-8 rounded-xl ${statusBg} flex items-center justify-center shadow-sm shrink-0`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            {v.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-semibold">Driver: {v.driver}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wide ${
                          v.isDeviation
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : v.status === 'Idle'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : v.status === 'Stopped'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          v.isDeviation ? 'bg-rose-500' : v.status === 'Idle' ? 'bg-amber-500' : v.status === 'Stopped' ? 'bg-slate-500' : 'bg-emerald-500'
                        }`} />
                        {v.status}
                      </span>
                    </div>

                    {/* Bottom Line: Speed, Location & Deviation Indicator */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-[10px]">
                      {v.isDeviation ? (
                        <span className="font-extrabold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          3.2 km Off-Route
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 font-bold text-slate-700">
                          <Navigation className="w-3 h-3 text-emerald-600 rotate-45" />
                          <span>{v.speed}</span>
                          {v.status === 'Moving' && <Signal className="w-3 h-3 text-emerald-500 ml-0.5" />}
                        </div>
                      )}

                      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]" title={v.location}>
                        {v.location}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredVehicles.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                  No vehicles match current search or filters.
                </div>
              )}
            </div>

            {/* Left Column Pagination Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
              <span>Showing 1 to {filteredVehicles.length} of 128 vehicles</span>
              <div className="flex items-center gap-1 font-bold">
                <button className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button className="w-5 h-5 rounded bg-sky-600 text-white flex items-center justify-center">1</button>
                <button className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600">2</button>
                <button className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600">3</button>
                <span>...</span>
                <button className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600">26</button>
                <button className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* ── MIDDLE COLUMN: REAL-TIME INTERACTIVE GOOGLE MAP (col-span-5) ── */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            
            {/* Top Floating Fleet Summary Stats Overlay */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200 z-30 flex items-center gap-3 sm:gap-4 text-xs font-extrabold pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase block font-bold">Total</span>
                  <span className="text-xs text-slate-800">128</span>
                </div>
              </div>

              <div className="h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase block font-bold">Moving</span>
                  <span className="text-xs text-emerald-600">96</span>
                </div>
              </div>

              <div className="h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase block font-bold">Idle</span>
                  <span className="text-xs text-amber-600">18</span>
                </div>
              </div>

              <div className="h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertOctagon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase block font-bold">Stopped</span>
                  <span className="text-xs text-rose-600">14</span>
                </div>
              </div>
            </div>

            {/* Map Container Canvas */}
            <div className="flex-1 min-h-[490px] rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100">
              <div ref={mapRef} className="w-full h-full z-10" />

              {!googleLoaded && (
                <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="w-9 h-9 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-slate-600 text-xs font-bold">Loading Interactive Real-Time Map...</p>
                </div>
              )}

              {/* Floating Action Controls Overlay (Top Right) */}
              <div className="absolute top-16 right-3 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
                <button
                  onClick={zoomInMap}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={zoomOutMap}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={recenterMap}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-sky-600 font-bold transition-colors cursor-pointer border-t border-slate-100 pt-1"
                  title="Recenter Map on Selected Vehicle"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Floating Bottom Center Legend Bar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md z-30 flex items-center gap-3 text-[11px] font-bold text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Moving</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Idle</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span>Stopped</span>
                </div>
                <div className="flex items-center gap-1 text-rose-700 font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span>Deviation</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT COLUMN: GIS MAP VISUALIZATION PANEL (col-span-4) ── */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
            
            {/* Header Bar with Active Vehicle Badge (Status-Colored) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-600" /> GIS Map Visualization
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Real-time route tracking & deviation monitoring</p>
              </div>

              {/* Status-Colored Active Vehicle Badge (No Black) */}
              <div className={`px-3 py-1 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm ${
                selectedVehicle.isDeviation
                  ? 'bg-rose-600'
                  : selectedVehicle.status === 'Idle'
                  ? 'bg-amber-500'
                  : selectedVehicle.status === 'Stopped'
                  ? 'bg-slate-600'
                  : 'bg-emerald-600'
              }`}>
                <Truck className="w-3.5 h-3.5 text-white" />
                <span>{selectedVehicle.name}</span>
              </div>
            </div>

            {/* Vehicle Live Metric Banner (Synced with Selected Vehicle) */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                  selectedVehicle.isDeviation
                    ? 'bg-rose-100 text-rose-700'
                    : selectedVehicle.status === 'Idle'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedVehicle.isDeviation ? 'bg-rose-600 animate-ping' : selectedVehicle.status === 'Idle' ? 'bg-slate-400' : 'bg-emerald-500'
                  }`} />
                  {selectedVehicle.isDeviation ? 'Deviation Alert' : `${selectedVehicle.status} (On-Track)`}
                </span>

                <span className="text-[10px] text-slate-400 font-medium">Driver: <strong className="text-slate-700">{selectedVehicle.driver}</strong></span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Speed</span>
                  <span className="text-xs font-extrabold text-slate-800">{selectedVehicle.speed}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Last Update</span>
                  <span className="text-xs font-extrabold text-slate-800">{selectedVehicle.lastUpdate || '10 sec ago'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">ETA</span>
                  <span className="text-xs font-extrabold text-sky-700">{selectedVehicle.eta || '03:30 PM'}</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Diagram Canvas (Distinct Destination Color & Dynamic Route Sync) */}
            <div className="relative w-full flex-1 min-h-[300px] bg-slate-50/60 rounded-xl border border-slate-200 p-2 overflow-hidden shadow-inner flex flex-col items-center justify-center">
              
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <svg className="w-full h-full relative z-10" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="45%" stopColor="#f59e0b" />
                    <stop offset="75%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Main Approved Route Line */}
                <path
                  d="M 50 200 L 110 150 L 180 120 L 260 70 L 350 40"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Deviation Path Line (ONLY active if selected vehicle has deviation alert) */}
                {selectedVehicle.isDeviation && (
                  <>
                    <path
                      d="M 180 120 L 120 50"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="5,4"
                      strokeLinecap="round"
                    />

                    {/* Deviation Label Pill on Canvas */}
                    <g transform="translate(120, 32)">
                      <rect x="-40" y="-9" width="80" height="18" rx="9" fill="#0f172a" stroke="#ef4444" strokeWidth="1.2" />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
                        Deviation Alert
                      </text>
                    </g>
                  </>
                )}

                {/* 1. BWG Node (Green) */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({
                  id: 'bwg',
                  name: 'BWG Warehouse Depot',
                  address: 'Central Depot, Bommanahalli',
                  type: 'Starting Location',
                  status: 'Verified Start',
                  timestamp: '08:15 AM',
                  assignedVehicle: selectedVehicle.name,
                  driver: selectedVehicle.driver,
                  vehicleDistance: 'Depot Start'
                })}>
                  <circle cx="50" cy="200" r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="50" cy="200" r="4" fill="#ffffff" />
                  <text x="50" y="222" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="800">BWG</text>
                </g>

                {/* 2. P1 Node */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({
                  id: 'p1',
                  name: 'Pickup Point 1 - Green Valley',
                  address: 'Sector 4, HSR Layout',
                  type: 'Residential Pickup',
                  status: 'Completed (1.2 Tons)',
                  timestamp: '09:15 AM',
                  assignedVehicle: selectedVehicle.name,
                  driver: selectedVehicle.driver,
                  vehicleDistance: 'Checkpoint Clear'
                })}>
                  <circle cx="110" cy="150" r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="110" cy="150" r="3.5" fill="#ffffff" />
                  <text x="122" y="154" textAnchor="start" fill="#d97706" fontSize="9" fontWeight="800">P1</text>
                </g>

                {/* 3. P2 Node */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({
                  id: 'p2',
                  name: 'Pickup Point 2 - Acme Tech Park',
                  address: 'Outer Ring Road, BTM Layout',
                  type: 'Commercial Pickup',
                  status: 'Active Collection Site',
                  timestamp: '10:45 AM',
                  assignedVehicle: selectedVehicle.name,
                  driver: selectedVehicle.driver,
                  vehicleDistance: 'Vehicle On-Site'
                })}>
                  <circle cx="180" cy="120" r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="180" cy="120" r="3.5" fill="#ffffff" />
                  <text x="192" y="124" textAnchor="start" fill="#d97706" fontSize="9" fontWeight="800">P2</text>
                </g>

                {/* 4. P3 Node */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({
                  id: 'p3',
                  name: 'Pickup Point 3 - Royal Heights',
                  address: 'Begur Main Road',
                  type: 'Apartment Pickup',
                  status: 'Scheduled Stop',
                  timestamp: '11:30 AM',
                  assignedVehicle: selectedVehicle.name,
                  driver: selectedVehicle.driver,
                  vehicleDistance: 'ETA 14 mins'
                })}>
                  <circle cx="260" cy="70" r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="260" cy="70" r="3.5" fill="#ffffff" />
                  <text x="272" y="74" textAnchor="start" fill="#d97706" fontSize="9" fontWeight="800">P3</text>
                </g>

                {/* 5. Deviation Alert Node (ONLY rendered if vehicle has deviation alert) */}
                {selectedVehicle.isDeviation && (
                  <g className="cursor-pointer" onClick={() => {
                    setSelectedNode({
                      id: 'deviation',
                      name: '🚨 DEVIATION ALERT - Detour Site',
                      address: 'Unauthorized Landfill / Off-Route Location',
                      type: 'Geo-Fence Stoppage',
                      status: 'UNAUTHORIZED DETOUR',
                      timestamp: '10:05 AM',
                      assignedVehicle: selectedVehicle.name,
                      driver: selectedVehicle.driver,
                      vehicleDistance: 'Diverted 3.2 km off route'
                    });
                  }}>
                    <circle cx="120" cy="50" r="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="120" cy="50" r="4" fill="#ef4444" />
                  </g>
                )}

                {/* 6. DEST Node - Mukka Proteins Limited (Distinct Vibrant Purple/Violet Theme) */}
                <g className="cursor-pointer" onClick={() => setSelectedNode({
                  id: 'dest',
                  name: 'DEST - Mukka Proteins Limited',
                  address: '4M66+CCH, Mitganahalli, Kadusonnapanahalli, Bagaluru, Karnataka 562149',
                  mapUrl: 'https://maps.app.goo.gl/7cLn9E939ADzo3bAA?g_st=ac',
                  type: 'Destination Processing Facility',
                  status: 'Mukka Proteins Plant',
                  timestamp: selectedVehicle.eta || '03:30 PM',
                  assignedVehicle: selectedVehicle.name,
                  driver: selectedVehicle.driver,
                  vehicleDistance: `ETA ${selectedVehicle.eta || '35 mins'}`
                })}>
                  <circle cx="350" cy="40" r="13" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="350" cy="40" r="5" fill="#ffffff" />
                  <text x="350" y="64" textAnchor="middle" fill="#7c3aed" fontSize="10" fontWeight="900">DEST</text>
                </g>

                {/* Dynamic Vehicle Marker Indicator on Canvas - Calculated precisely along GIS route line */}
                {(() => {
                  const coords = getTruckGisCoords(selectedVehicle.progress, selectedVehicle.isDeviation);
                  const isDev = selectedVehicle.isDeviation;
                  return (
                    <g transform={`translate(${coords.x}, ${coords.y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="14"
                        fill={isDev ? '#ef4444' : '#10b981'}
                        fillOpacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="6"
                        fill={isDev ? '#dc2626' : '#10b981'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })()}
              </svg>

              {/* Node Details Popover Drawer */}
              {selectedNode && (
                <div className="absolute top-2 right-2 left-2 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl z-40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="font-extrabold text-slate-900 text-xs truncate max-w-[85%] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      {selectedNode.name}
                    </span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <p className="text-[10px] text-slate-600 font-medium leading-snug flex-1">{selectedNode.address}</p>
                    {selectedNode.mapUrl && (
                      <a
                        href={selectedNode.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-extrabold shrink-0 shadow-sm transition-all cursor-pointer"
                        title="Open Mukka Proteins Limited on Google Maps"
                      >
                        <span>Redirect</span>
                        <ExternalLink className="w-3 h-3 text-white" />
                      </a>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-medium block">Status</span>
                      <span className="font-extrabold text-slate-800">{selectedNode.status}</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-medium block">Timestamp</span>
                      <span className="font-extrabold text-sky-700">{selectedNode.timestamp}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-bold border-t border-slate-100 text-slate-700">
                    <span>Vehicle: {selectedNode.assignedVehicle}</span>
                    <span className="text-purple-700 font-extrabold">{selectedNode.vehicleDistance}</span>
                  </div>
                </div>
              )}
            </div>

            {/* GIS Legend Bar (With Purple Destination Badge for Contrast) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 px-3 flex flex-wrap items-center justify-between gap-2 shadow-sm text-xs">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>BWG Start</span>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pickup Points</span>
              </div>

              <a
                href="https://maps.app.goo.gl/7cLn9E939ADzo3bAA?g_st=ac"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[10px] transition-colors cursor-pointer border border-purple-200/60"
                title="Redirect to Mukka Proteins Limited on Google Maps"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>Mukka Proteins</span>
                <ExternalLink className="w-2.5 h-2.5 text-purple-600" />
              </a>

              {selectedVehicle.isDeviation && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-900 text-white font-bold text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Deviation Alert</span>
                </div>
              )}
            </div>

            {/* Trip Progress Bar Card (Dynamic Vehicle Sync) */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
                <span>BWG Warehouse</span>
                <span className="text-[10px] text-slate-400 font-bold">➔ {selectedVehicle.distance || '128 km'} ➔</span>
                <span className="text-purple-900 font-extrabold">Mukka Proteins</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Start • 08:15 AM</span>
                <span>Destination • {selectedVehicle.eta || '03:30 PM'}</span>
              </div>

              {/* Progress Track */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedVehicle.progress || 68}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-800">{selectedVehicle.progress || 68}%</span>
              </div>
            </div>

            {/* Bottom Alert / Action Container (ONLY shows red alert when selected vehicle has deviation alert) */}
            {selectedVehicle.isDeviation ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-rose-900 text-xs">Deviation Alert Triggered</h5>
                    <p className="text-[10px] text-rose-700 font-medium">{selectedVehicle.name} is 3.2 km off planned route</p>
                  </div>
                </div>

                <a
                  href="https://maps.app.goo.gl/7cLn9E939ADzo3bAA?g_st=ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-extrabold transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Redirect Map</span>
                  <ExternalLink className="w-3 h-3 text-rose-600" />
                </a>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-emerald-900 text-xs">Route Status Normal</h5>
                    <p className="text-[10px] text-emerald-700 font-medium">{selectedVehicle.name} operating on approved route</p>
                  </div>
                </div>

                <button
                  onClick={() => toast.success(`Route status verified for ${selectedVehicle.name}`)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
