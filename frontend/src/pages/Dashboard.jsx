import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Shield, MapPin,
  Building2, Compass, CalendarRange,
  Truck, Navigation, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

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
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  const [vehicleCoords, setVehicleCoords] = useState([
    { id: 'v1', name: 'Vehicle #102', route: 'Bommanahalli Route A', driver: 'Rajesh Kumar', speed: '32 km/h', load: '2.4t', status: 'Moving', lat: 12.9023, lng: 77.6242 },
    { id: 'v2', name: 'Vehicle #108', route: 'HSR Route B', driver: 'Anil Singh', speed: '24 km/h', load: '1.8t', status: 'Moving', lat: 12.9103, lng: 77.6384 },
    { id: 'v3', name: 'Vehicle #114', route: 'Begur Route C', driver: 'Sunil Gowda', speed: '0 km/h', load: '0.0t', status: 'Idle', lat: 12.8945, lng: 77.6201 }
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(vehicleCoords[0]);

  // Load Leaflet resources dynamically
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up scripts & style sheets when component unmounts
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
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
    if (!leafletLoaded || !mapRef.current) return;
    
    const L = window.L;
    if (!mapInstance.current) {
      // Center map in the general Bommanahalli/HSR Layout area
      mapInstance.current = L.map(mapRef.current).setView([12.9023, 77.6242], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    vehicleCoords.forEach(v => {
      const isSelected = selectedVehicle.id === v.id;
      const markerColor = v.status === 'Idle' ? '#94a3b8' : isSelected ? '#7c3aed' : '#10b981';
      
      const customIcon = L.divIcon({
        className: 'custom-vehicle-icon',
        html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: all 0.3s ease;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.14a2 2 0 0 0-.59-1.41L18.7 7.72A2 2 0 0 0 17.29 7H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([v.lat, v.lng]);
        markersRef.current[v.id].setIcon(customIcon);
      } else {
        const marker = L.marker([v.lat, v.lng], { icon: customIcon }).addTo(mapInstance.current);
        marker.bindPopup(`<b>${v.name}</b><br/>Driver: ${v.driver}<br/>Status: ${v.status} (${v.speed})`);
        marker.on('click', () => {
          setSelectedVehicle(marker.vehicleRef);
        });
        marker.vehicleRef = v;
        markersRef.current[v.id] = marker;
      }

      if (isSelected) {
        markersRef.current[v.id].setPopupContent(`<b>${v.name}</b><br/>Driver: ${v.driver}<br/>Status: ${v.status} (${v.speed})<br/>Load: ${v.load}`);
      }
    });

  }, [leafletLoaded, vehicleCoords, selectedVehicle]);

  const selectVehicleOnMap = (v) => {
    setSelectedVehicle(v);
    if (mapInstance.current) {
      mapInstance.current.setView([v.lat, v.lng], 15);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard_overview')}</h1>
          <p className="text-slate-500 text-sm">{t('system_snapshot')}</p>
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

      {/*ADMINISTRATION & FIELD OPERATIONS */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-700">{t('BWG_Operations') || 'Municipal Operations'}</h2>
          <p className="text-slate-400 text-[11px]">{t('BWG_description') || 'Track and manage municipal corporations, zones, wards, and scheduled collection events'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Municipal Corporations */}
          <div
            onClick={() => navigate('/bwg/corporation')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('corporation') || 'Corporation'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-[#7c3aed] transition-colors leading-none truncate">
                  {(stats.totalCorporations || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>

          {/* Zones */}
          <div
            onClick={() => navigate('/bwg/zone')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('zone') || 'Zone'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors leading-none truncate">
                  {(stats.totalZones || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>

          {/* Wards */}
          <div
            onClick={() => navigate('/bwg/ward')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('ward') || 'Ward'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors leading-none truncate">
                  {(stats.totalWards || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>

          {/* Collection Events */}
          <div
            onClick={() => navigate('/bwg/collection-event')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <CalendarRange className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('collection_event') || 'Collection Event'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors leading-none truncate">
                  {(stats.totalCollectionEvents || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>
        </div>
      </div>

      {/* SYSTEM ACCESS & GEOGRAPHIC SETTINGS */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-700">{t('system_settings') || 'System & Directory'}</h2>
          <p className="text-slate-400 text-[11px]">{t('system_description') || 'Overview of system users, access roles, and configured geographic details'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div
            onClick={() => navigate('/users')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('total_users') || 'Total Users'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-[#7c3aed] transition-colors leading-none truncate">
                  {(stats.totalUsers || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>

          {/* Active Roles */}
          <div
            onClick={() => navigate('/roles')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('active_roles') || 'Active Roles'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors leading-none truncate">
                  {(stats.totalRoles || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>

          {/* Total Cities */}
          <div
            onClick={() => navigate('/locations')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('total_cities') || 'Total Cities'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors leading-none truncate">
                  {(stats.totalCities || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>

          {/* Total Pincodes */}
          <div
            onClick={() => navigate('/locations')}
            className="group cursor-pointer bg-white hover:bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-orange-300 shadow-sm hover:shadow transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-inner flex-shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{t('total_pincodes') || 'Total Pincodes'}</p>
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors leading-none truncate">
                  {(stats.totalPincodes || 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <span className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all text-xs flex-shrink-0">→</span>
          </div>
        </div>
      </div>

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
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#7c3aed] bg-purple-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                        v.status === 'Idle' 
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
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        v.status === 'Idle'
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
            {!leafletLoaded && (
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
