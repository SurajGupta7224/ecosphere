import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORY_OPTIONS = [
  "Apartment",
  "Residential Colony",
  "Commercial Area",
  "Market",
  "School",
  "Hospital",
  "Office",
  "Public Place",
  "Industrial Area",
  "Government Building",
  "Railway Station",
  "Bus Stand",
  "Religious Place",
  "Park / Garden",
  "Other"
];

const CollectionEvents = () => {
  const [events, setEvents] = useState([]);
  const [activeCorporations, setActiveCorporations] = useState([]);

  const getCategoriesArray = (categories) => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (typeof categories === 'string') {
      try {
        const parsed = JSON.parse(categories);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return categories.split(',').map(c => c.trim()).filter(Boolean);
      }
    }
    return [];
  };

  
  // Cascading zones and wards for the Add/Edit Form
  const [formZones, setFormZones] = useState([]);
  const [formWards, setFormWards] = useState([]);
  
  // Cascading zones and wards for the Filters
  const [filterZones, setFilterZones] = useState([]);
  const [filterWards, setFilterWards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Search & Filter State
  const [searchName, setSearchName] = useState('');
  const [filterCorpId, setFilterCorpId] = useState('');
  const [filterZoneId, setFilterZoneId] = useState('');
  const [filterWardId, setFilterWardId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Form State
  const [formData, setFormData] = useState({
    corporation_id: '',
    zone_id: '',
    ward_id: '',
    event_name: '',
    categories: [],
    address: '',
    landmark: '',
    google_map_url: '',
    latitude: '',
    longitude: '',
    status: 'Active'
  });

  // Searchable Multi-Select Category Dropdown UI State
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);


  useEffect(() => {
    fetchActiveCorporations();
    
    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCollectionEvents();
  }, [page, filterCorpId, filterZoneId, filterWardId, statusFilter, sortField, sortOrder]);

  // Google Map Initialization & Event Listeners
  useEffect(() => {
    let active = true;
    if (isFormOpen) {
      const loadMap = () => {
        if (!active) return;
        if (!window.google || !window.google.maps) {
          setTimeout(loadMap, 100);
          return;
        }

        const defaultLat = parseFloat(formData.latitude) || 20.5937;
        const defaultLng = parseFloat(formData.longitude) || 78.9629;
        const initialZoom = formData.latitude && formData.longitude ? 16 : 5;

        const mapOptions = {
          center: { lat: defaultLat, lng: defaultLng },
          zoom: initialZoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        if (!mapRef.current) return;
        const mapInst = new window.google.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = mapInst;

        const markerInst = new window.google.maps.Marker({
          position: { lat: defaultLat, lng: defaultLng },
          map: mapInst,
          draggable: true,
          title: "Drag to set location"
        });
        markerInstanceRef.current = markerInst;

        // Drag marker to update coordinates
        markerInst.addListener('dragend', () => {
          const pos = markerInst.getPosition();
          const lat = pos.lat().toFixed(6);
          const lng = pos.lng().toFixed(6);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            google_map_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          }));
        });

        // Click map to reposition marker and update coordinates
        mapInst.addListener('click', (e) => {
          markerInst.setPosition(e.latLng);
          const lat = e.latLng.lat().toFixed(6);
          const lng = e.latLng.lng().toFixed(6);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            google_map_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          }));
        });

        // Google Places autocomplete search bar
        const searchInput = document.getElementById('mapSearchInput');
        if (searchInput) {
          const autocomplete = new window.google.maps.places.Autocomplete(searchInput, {
            types: ['geocode', 'establishment']
          });
          autocomplete.bindTo('bounds', mapInst);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              mapInst.setCenter(place.geometry.location);
              mapInst.setZoom(16);
              markerInst.setPosition(place.geometry.location);

              const lat = place.geometry.location.lat().toFixed(6);
              const lng = place.geometry.location.lng().toFixed(6);
              const formattedAddress = place.formatted_address || '';

              setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                address: formattedAddress,
                landmark: place.name || prev.landmark,
                google_map_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
              }));
            }
          });
        }
      };

      // Load Google Maps API script dynamically if not present
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&libraries=places`;
        script.id = 'google-maps-script';
        script.async = true;
        script.defer = true;
        script.onload = loadMap;
        document.head.appendChild(script);
      } else {
        loadMap();
      }
    }

    return () => {
      active = false;
    };
  }, [isFormOpen]);

  // Sync marker and center from manual coordinate changes
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const currentPos = markerInstanceRef.current.getPosition();
        if (!currentPos || Math.abs(currentPos.lat() - lat) > 0.0001 || Math.abs(currentPos.lng() - lng) > 0.0001) {
          markerInstanceRef.current.setPosition({ lat, lng });
          mapInstanceRef.current.setCenter({ lat, lng });
        }
      }
    }
  }, [formData.latitude, formData.longitude]);


  // Handle cascading filters change
  useEffect(() => {
    if (filterCorpId) {
      fetchFilterZones(filterCorpId);
    } else {
      setFilterZones([]);
      setFilterWards([]);
      setFilterZoneId('');
      setFilterWardId('');
    }
  }, [filterCorpId]);

  useEffect(() => {
    if (filterZoneId) {
      fetchFilterWards(filterZoneId);
    } else {
      setFilterWards([]);
      setFilterWardId('');
    }
  }, [filterZoneId]);

  const fetchActiveCorporations = async () => {
    try {
      const res = await api.get('/corporations', {
        params: { status: 'Active', limit: 1000 }
      });
      setActiveCorporations(res.data.corporations || []);
    } catch (err) {
      console.error("Failed to load corporations:", err);
    }
  };

  const fetchFilterZones = async (corpId) => {
    try {
      const res = await api.get(`/corporations/${corpId}/zones`);
      setFilterZones(res.data.zones || []);
    } catch (err) {
      console.error("Failed to load filter zones:", err);
    }
  };

  const fetchFilterWards = async (zoneId) => {
    try {
      const res = await api.get(`/zones/${zoneId}/wards`);
      setFilterWards(res.data.wards || []);
    } catch (err) {
      console.error("Failed to load filter wards:", err);
    }
  };

  // Form cascaded loaders
  const fetchFormZones = async (corpId, currentZoneId = null, currentWardId = null) => {
    try {
      const res = await api.get(`/corporations/${corpId}/zones`);
      const zones = res.data.zones || [];
      setFormZones(zones);
      
      const targetZoneId = currentZoneId && zones.some(z => z.id === currentZoneId) ? currentZoneId : (zones[0]?.id || '');
      setFormData(prev => ({
        ...prev,
        zone_id: targetZoneId,
        ward_id: ''
      }));

      if (targetZoneId) {
        await fetchFormWards(targetZoneId, currentWardId);
      } else {
        setFormWards([]);
      }
    } catch (err) {
      console.error("Failed to load form zones:", err);
      setFormZones([]);
      setFormWards([]);
    }
  };

  const fetchFormWards = async (zoneId, currentWardId = null) => {
    try {
      const res = await api.get(`/zones/${zoneId}/wards`);
      const wards = res.data.wards || [];
      setFormWards(wards);

      setFormData(prev => ({
        ...prev,
        ward_id: currentWardId && wards.some(w => w.id === currentWardId) ? currentWardId : (wards[0]?.id || '')
      }));
    } catch (err) {
      console.error("Failed to load form wards:", err);
      setFormWards([]);
    }
  };

  const fetchCollectionEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/collection-events', {
        params: {
          page,
          search: searchName,
          corporation_id: filterCorpId,
          zone_id: filterZoneId,
          ward_id: filterWardId,
          status: statusFilter,
          sortField,
          sortOrder,
          limit: 10
        }
      });
      setEvents(res.data.collectionEvents || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load collection events:", err);
      toast.error(err.response?.data?.message || "Failed to load collection events");
      setEvents([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCollectionEvents();
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'latitude' || name === 'longitude') {
        const lat = name === 'latitude' ? value : prev.latitude;
        const lng = name === 'longitude' ? value : prev.longitude;
        if (lat && lng) {
          next.google_map_url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }
      }
      return next;
    });

    if (name === 'corporation_id') {
      await fetchFormZones(value);
    } else if (name === 'zone_id') {
      await fetchFormWards(value);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const current = prev.categories || [];
      const next = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      return { ...prev, categories: next };
    });
  };

  const openAddForm = () => {
    const defaultCorpId = activeCorporations[0]?.id || '';
    setFormData({
      corporation_id: defaultCorpId,
      zone_id: '',
      ward_id: '',
      event_name: '',
      categories: [],
      address: '',
      landmark: '',
      google_map_url: '',
      latitude: '',
      longitude: '',
      status: 'Active'
    });
    setFormZones([]);
    setFormWards([]);
    setCategorySearch('');
    setIsCategoryDropdownOpen(false);
    setIsEditMode(false);
    setIsFormOpen(true);

    if (defaultCorpId) {
      fetchFormZones(defaultCorpId);
    }
  };

  const openEditForm = async (event) => {
    setFormData({
      corporation_id: event.corporation_id,
      zone_id: event.zone_id,
      ward_id: event.ward_id,
      event_name: event.event_name,
      categories: getCategoriesArray(event.categories),
      address: event.address,
      landmark: event.landmark || '',
      google_map_url: event.google_map_url || '',
      latitude: event.latitude || '',
      longitude: event.longitude || '',
      status: event.status
    });
    setCategorySearch('');
    setIsCategoryDropdownOpen(false);
    setSelectedId(event.id);
    setIsEditMode(true);
    setIsFormOpen(true);

    // Dynamic cascade load for forms
    await fetchFormZones(event.corporation_id, event.zone_id, event.ward_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.corporation_id) return toast.error("Corporation is required");
    if (!formData.zone_id) return toast.error("Zone is required");
    if (!formData.ward_id) return toast.error("Ward is required");
    if (!formData.event_name.trim()) return toast.error("Collection event name is required");
    if (!formData.categories || formData.categories.length === 0) return toast.error("Select at least one category");
    if (!formData.address.trim()) return toast.error("Complete address is required");

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/collection-events/${selectedId}`, formData);
        toast.success("Collection event updated successfully");
      } else {
        await api.post('/collection-events', formData);
        toast.success("Collection event created successfully");
      }
      setIsFormOpen(false);
      fetchCollectionEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (event) => {
    const newStatus = event.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/collection-events/${event.id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchCollectionEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteEvent = async () => {
    try {
      await api.delete(`/collection-events/${idToDelete}`);
      toast.success("Collection event deleted successfully");
      setIsDeleteModalOpen(false);
      fetchCollectionEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  const filteredCategoryOptions = CATEGORY_OPTIONS.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Collection Point' : 'Add Collection Point'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Corporation *</label>
                  <select
                    name="corporation_id" value={formData.corporation_id} onChange={handleInputChange} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                  >
                    <option value="" disabled>Select Corporation</option>
                    {activeCorporations.map(corp => (
                      <option key={corp.id} value={corp.id}>{corp.corporation_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zone *</label>
                  <select
                    name="zone_id" value={formData.zone_id} onChange={handleInputChange} required
                    disabled={!formData.corporation_id}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm disabled:opacity-55"
                  >
                    <option value="" disabled>Select Zone</option>
                    {formZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ward *</label>
                  <select
                    name="ward_id" value={formData.ward_id} onChange={handleInputChange} required
                    disabled={!formData.zone_id}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm disabled:opacity-55"
                  >
                    <option value="" disabled>Select Ward</option>
                    {formWards.map(ward => (
                      <option key={ward.id} value={ward.id}>{ward.ward_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Collection Event Name *</label>
                  <input
                    type="text" name="event_name" value={formData.event_name} onChange={handleInputChange} required
                    disabled={!formData.ward_id}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm disabled:opacity-55"
                    placeholder="e.g. Green Valley Apartment"
                  />
                </div>

                {/* Searchable Multi-Select Category */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Collection Categories *</label>
                  <div
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl min-h-[46px] py-2 px-4 outline-none hover:border-slate-300 transition-all text-sm cursor-pointer flex flex-wrap gap-1.5 items-center justify-between"
                  >
                    {formData.categories.length === 0 ? (
                      <span className="text-slate-400 text-sm">Select Categories...</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.categories.map(cat => (
                          <span
                            key={cat}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#7c3aed] border border-purple-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryToggle(cat);
                            }}
                          >
                            {cat}
                            <X className="w-3 h-3 ml-1 text-purple-400 hover:text-purple-600" />
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-slate-400 select-none">▼</span>
                  </div>

                  {isCategoryDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-200">
                      <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 outline-none text-xs"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                        {filteredCategoryOptions.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-2">No categories found</p>
                        ) : (
                          filteredCategoryOptions.map(cat => {
                            const isChecked = formData.categories.includes(cat);
                            return (
                              <label key={cat} className="flex items-center space-x-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCategoryToggle(cat)}
                                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                                />
                                <span>{cat}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="px-4 py-1.5 rounded-lg bg-[#7c3aed] text-white hover:bg-purple-700 font-bold text-xs shadow-sm transition-all"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address *</label>
                  <textarea
                    name="address" value={formData.address} onChange={handleInputChange} rows="2" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                    placeholder="Enter complete address..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Location on Map</label>
                  <input
                    type="text" id="mapSearchInput"
                    placeholder="Search place, colony, or building..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                  />
                </div>

                <div>
                  <div ref={mapRef} className="w-full h-48 rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100 relative">
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      Loading Google Map...
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Click on the map or drag the marker to pin location coordinates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude (Optional)</label>
                    <input
                      type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                      placeholder="e.g. 19.0760"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude (Optional)</label>
                    <input
                      type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                      placeholder="e.g. 72.8777"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landmark (Optional)</label>
                    <input
                      type="text" name="landmark" value={formData.landmark} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                      placeholder="e.g. Near ABC Petrol Pump"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Google Map URL (Optional)</label>
                    <input
                      type="text" name="google_map_url" value={formData.google_map_url} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm text-slate-500 font-mono text-[10px]"
                      placeholder="Auto-generated URL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-slate-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex items-center px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                <RotateCcw className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button type="submit" disabled={submitting || !formData.ward_id} className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-[#7c3aed] text-white hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : 'Save Collection Point'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Collection Point Management</h1>
              <p className="text-slate-500 mt-1 text-sm">Register and manage waste collection points inside Wards.</p>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center px-6 py-3 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Collection Point
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Search event name or address..." value={searchName} onChange={(e) => setSearchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm"
                />
              </form>
              
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative">
                  <select
                    value={filterCorpId} onChange={(e) => { setFilterCorpId(e.target.value); setPage(1); }}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 appearance-none min-w-[140px]"
                  >
                    <option value="">All Corporations</option>
                    {activeCorporations.map(corp => (
                      <option key={corp.id} value={corp.id}>{corp.corporation_name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={filterZoneId} onChange={(e) => { setFilterZoneId(e.target.value); setPage(1); }}
                    disabled={!filterCorpId}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 appearance-none min-w-[140px] disabled:opacity-50"
                  >
                    <option value="">All Zones</option>
                    {filterZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={filterWardId} onChange={(e) => { setFilterWardId(e.target.value); setPage(1); }}
                    disabled={!filterZoneId}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 appearance-none min-w-[140px] disabled:opacity-50"
                  >
                    <option value="">All Wards</option>
                    {filterWards.map(ward => (
                      <option key={ward.id} value={ward.id}>{ward.ward_name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 appearance-none min-w-[120px]"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active Only</option>
                    <option value="Inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                    <th className="p-5">Sr No</th>
                    <th className="p-5">Corporation</th>
                    <th className="p-5">Zone</th>
                    <th className="p-5">Ward</th>
                    <th className="p-5 cursor-pointer select-none" onClick={() => handleSort('event_name')}>
                      Collection Point Name {sortField === 'event_name' && (sortOrder === 'ASC' ? '▲' : '▼')}
                    </th>
                    <th className="p-5">Categories</th>
                    <th className="p-5">Landmark</th>
                    <th className="p-5 cursor-pointer select-none" onClick={() => handleSort('status')}>
                      Status {sortField === 'status' && (sortOrder === 'ASC' ? '▲' : '▼')}
                    </th>
                    <th className="p-5 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                      Created Date {sortField === 'created_at' && (sortOrder === 'ASC' ? '▲' : '▼')}
                    </th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="p-20 text-center">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-medium text-slate-400">Loading your data...</p>
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-20 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                          <MapPin className="w-6 h-6 opacity-40" />
                        </div>
                        <p className="text-slate-600 font-bold">No Collection Points Found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or register a new collection point.</p>
                      </td>
                    </tr>
                  ) : events.map((ev, index) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 text-xs font-mono text-slate-400">{(page - 1) * 10 + index + 1}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">{ev.corporation?.corporation_name || '—'}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">{ev.zone?.zone_name || '—'}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">{ev.ward?.ward_name || '—'}</td>
                      <td className="p-5">
                        <p className="font-bold text-slate-800 text-sm">{ev.event_name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] truncate">{ev.address}</p>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {getCategoriesArray(ev.categories).map(cat => (
                            <span key={cat} className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600 tracking-wider">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 text-xs text-slate-500 font-medium">{ev.landmark || '—'}</td>
                      <td className="p-5">
                        <button
                          onClick={() => toggleStatus(ev)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${ev.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${ev.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {ev.status}
                        </button>
                      </td>
                      <td className="p-5 text-xs text-slate-500 font-medium">
                        {new Date(ev.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button onClick={() => openEditForm(ev)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(ev.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-bold text-slate-400">
                  Showing {events.length} of {totalItems} items
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i} onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${page === i + 1 ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-100' : 'text-slate-400 hover:bg-white border border-transparent hover:border-slate-200'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Collection Point?"
        message="This action will delete the collection point registry. This action cannot be undone."
        onConfirm={deleteEvent}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmLabel="Yes, Delete it"
      />
    </div>
  );
};

export default CollectionEvents;
