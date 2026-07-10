import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, RefreshCw, Search, Eye, X,
  User, Phone, Mail, MapPin, Building, Calendar, Clock,
  ShieldCheck, FileText, Layers, ChevronRight, Info,
  CheckCircle, XCircle, AlertCircle, Package, TrendingUp,
  IndianRupee, Weight, Tag, Home, Hash, Edit3, Save, MoreVertical, Trash2, Image as ImageIcon
} from 'lucide-react';
import api, { IMAGE_BASE_URL } from '../api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  Pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  Verified: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Rejected: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  Completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${s.bg} ${s.border} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function InfoRow({ icon, label, value, iconColor = 'text-slate-400' }) {
  if (!value) return null;
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, iconColor = 'text-violet-600', children }) {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-violet-50`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export default function WasteCollectionRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editActiveStep, setEditActiveStep] = useState(1);
  const [activeDropdownLeadId, setActiveDropdownLeadId] = useState(null);
  const [openDropdownCategoryId, setOpenDropdownCategoryId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-trigger')) {
        setActiveDropdownLeadId(null);
      }
      if (!e.target.closest('.edit-category-dropdown-trigger')) {
        setOpenDropdownCategoryId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [editSubcategoryCards, setEditSubcategoryCards] = useState([]);
  
  // File management states for editing
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);
  const [editFilePreviews, setEditFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [editFormData, setEditFormData] = useState({
    customer_type: 'Individual',
    authorized_person_name: '',
    mobile_number: '',
    email: '',
    address_search: '',
    latitude: '',
    longitude: '',
    waste_generator_name: '',
    complete_address: '',
    area_sqm: '',
    no_of_dwelling_units: '',
    registered_rwa: '',
    gst: '',
    pan: '',
    trade_license: '',
    pickup_notes: '',
    pickup_date: '',
    pickup_time: '',
    time_slot_id: '',
  });

  const editAutocompleteRef = useRef(null);
  const editMapInstanceRef = useRef(null);
  const editMarkerRef = useRef(null);
  const editMapDivRef = useRef(null);

  // Load edit form fields when entering edit mode
  useEffect(() => {
    if (!isEditing || !selectedGroup) return;

    const first = selectedGroup.first || {};

    let parsedImages = [];
    if (first.images) {
      try {
        parsedImages = typeof first.images === 'string' ? JSON.parse(first.images) : first.images;
      } catch (err) {
        console.error("Failed to parse images:", err);
      }
    }
    setExistingImages(parsedImages || []);
    setEditSelectedFiles([]);
    setEditFilePreviews([]);

    setEditFormData({
      customer_type: first.customer_type || 'Individual',
      authorized_person_name: first.authorized_person_name || '',
      mobile_number: first.mobile_number || '',
      email: first.email || '',
      address_search: first.address_search || first.complete_address || '',
      latitude: first.latitude || '',
      longitude: first.longitude || '',
      waste_generator_name: first.waste_generator_name || '',
      complete_address: first.complete_address || '',
      area_sqm: first.area_sqm || '',
      no_of_dwelling_units: first.dwelling_units || first.no_of_dwelling_units || '',
      registered_rwa: first.registered_rwa || '',
      gst: first.gst_number || '',
      pan: first.pan_number || '',
      trade_license: first.trade_license || '',
      pickup_notes: first.pickup_notes || '',
      pickup_date: first.pickup_date || '',
      pickup_time: first.pickup_time || '',
      time_slot_id: first.time_slot_id || '',
    });

    const loadCatalogData = async () => {
      try {
        const [subcatRes, slotRes] = await Promise.all([
          api.get('/sub-categories', { params: { limit: 200 } }),
          api.get('/time-slots/active')
        ]);

        const slotsData = slotRes.data.slots || slotRes.data.timeSlots || slotRes.data || [];
        setTimeSlots(slotsData);

        const subCategories = subcatRes.data.subCategories || subcatRes.data || [];
        const subcatData = subCategories.map(sub => {
          const existingItem = selectedGroup.items.find(item => item.subcategory_id === sub.id);
          return {
            category_id: sub.category_id,
            category_name: sub.category?.name || '',
            subcategory_id: sub.id,
            subcategory_name: sub.name,
            variations: sub.variations || [],
            included: !!existingItem,
            selected_variation_id: existingItem ? existingItem.variation_id : '',
            custom_price: existingItem ? existingItem.agreed_price : '',
            expected_waste: existingItem ? existingItem.expected_waste : '',
          };
        });

        setEditSubcategoryCards(subcatData);
      } catch (err) {
        console.error("loadCatalogData error:", err);
        toast.error("Failed to load catalog details for editing.");
      }
    };

    loadCatalogData();
  }, [isEditing, selectedGroup]);

  // Load Google Maps script if not loaded
  useEffect(() => {
    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&libraries=places`;
      script.id = 'google-maps-script';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Autocomplete & Google Map setup for Edit Mode
  useEffect(() => {
    if (!isEditing || !selectedGroup) {
      editMapInstanceRef.current = null;
      editMarkerRef.current = null;
      return;
    }

    const DEFAULT_LAT = 20.5937;
    const DEFAULT_LNG = 78.9629;

    const first = selectedGroup.first || {};
    const initialLat = parseFloat(first.latitude) || DEFAULT_LAT;
    const initialLng = parseFloat(first.longitude) || DEFAULT_LNG;

    const initMap = () => {
      if (!editMapDivRef.current || editMapInstanceRef.current) return;

      const map = new window.google.maps.Map(editMapDivRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: first.latitude ? 16 : 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      });
      editMapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: initialLat, lng: initialLng },
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag to adjust location'
      });
      editMarkerRef.current = marker;

      // When marker is dragged → update lat/lng fields
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        const lat = pos.lat().toFixed(6);
        const lng = pos.lng().toFixed(6);
        setEditFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      });

      // Autocomplete wired to update map + marker + fields
      const searchInput = document.getElementById('editMapSearchInput');
      if (searchInput) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInput, {
          types: ['geocode', 'establishment']
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat().toFixed(6);
            const lng = place.geometry.location.lng().toFixed(6);
            const addr = place.formatted_address || '';
            const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };

            map.setCenter(newPos);
            map.setZoom(16);
            marker.setPosition(newPos);
            marker.setAnimation(window.google.maps.Animation.DROP);

            setEditFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              complete_address: addr,
              address_search: addr
            }));
          }
        });
      }
    };

    const waitForGoogle = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setTimeout(initMap, 400);
      } else {
        setTimeout(waitForGoogle, 100);
      }
    };
    waitForGoogle();

    return () => {
      editMapInstanceRef.current = null;
      editMarkerRef.current = null;
    };
  }, [isEditing, selectedGroup]);

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setEditFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSubcategoryCard = (subcatId) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const nextIncluded = !card.included;
        return {
          ...card,
          included: nextIncluded,
          selected_variation_id: nextIncluded && card.variations.length > 0 ? card.variations[0].id : '',
          custom_price: nextIncluded && card.variations.length > 0 ? card.variations[0].per_kg_price || '' : '',
          expected_waste: nextIncluded ? '1' : ''
        };
      }
      return card;
    }));
  };

  const handleCardVariationChange = (subcatId, variationId) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const selectedVar = card.variations.find(v => v.id == variationId);
        return {
          ...card,
          selected_variation_id: variationId,
          custom_price: selectedVar ? selectedVar.per_kg_price || '' : ''
        };
      }
      return card;
    }));
  };

  const handleCardWasteChange = (subcatId, val) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return { ...card, expected_waste: val };
      }
      return card;
    }));
  };

  const handleCardPriceChange = (subcatId, val) => {
    setEditSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return { ...card, custom_price: val };
      }
      return card;
    }));
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setEditFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeEditFile = (index) => {
    setEditSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(editFilePreviews[index]);
    setEditFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgName) => {
    setExistingImages(prev => prev.filter(img => img !== imgName));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.customer_type) {
      toast.error("Customer Type is required.");
      return;
    }
    if (!editFormData.authorized_person_name?.trim()) {
      toast.error("Authorized Person Name is required.");
      return;
    }

    // Mobile Number validation
    if (!editFormData.mobile_number?.trim()) {
      toast.error("Mobile Number is required.");
      return;
    }
    if (!/^\d{10}$/.test(editFormData.mobile_number)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Email validation
    if (!editFormData.email?.trim()) {
      toast.error("Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!editFormData.address_search?.trim()) {
      toast.error("Address Search is required.");
      return;
    }

    // Coordinates range checks
    if (!editFormData.latitude || !editFormData.longitude) {
      toast.error("Coordinates (Latitude/Longitude) are required. Please search and select an address.");
      return;
    }
    const latVal = parseFloat(editFormData.latitude);
    const lngVal = parseFloat(editFormData.longitude);
    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      toast.error("Please enter a valid Latitude between -90 and 90.");
      return;
    }
    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      toast.error("Please enter a valid Longitude between -180 and 180.");
      return;
    }

    if (!editFormData.waste_generator_name?.trim()) {
      toast.error("Waste Generator Name is required.");
      return;
    }

    // Area & Dwelling units validation if present
    if (editFormData.area_sqm) {
      const areaVal = parseFloat(editFormData.area_sqm);
      if (isNaN(areaVal) || areaVal <= 0) {
        toast.error("Area (SqM) must be a positive number.");
        return;
      }
    }
    if (editFormData.no_of_dwelling_units) {
      const unitsVal = parseInt(editFormData.no_of_dwelling_units);
      if (isNaN(unitsVal) || unitsVal <= 0) {
        toast.error("Dwelling Units must be a positive integer.");
        return;
      }
    }

    if (!editFormData.complete_address?.trim()) {
      toast.error("Complete Address is required.");
      return;
    }

    const activeCards = editSubcategoryCards.filter(c => c.included);
    for (const card of activeCards) {
      if (!card.selected_variation_id || !card.expected_waste || !card.custom_price) {
        toast.error(`Please select a variation, expected waste, and price for ${card.subcategory_name}.`);
        return;
      }
      const val = parseFloat(card.expected_waste);
      if (isNaN(val) || val < 1) {
        toast.error(`Please enter a valid Expected Waste (min 1 KG) for ${card.subcategory_name}.`);
        return;
      }
      const priceVal = parseFloat(card.custom_price);
      if (isNaN(priceVal) || priceVal < 0) {
        toast.error(`Please enter a valid Price (min 0) for ${card.subcategory_name}.`);
        return;
      }
    }

    if (editFormData.pickup_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(editFormData.pickup_date);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error("Pickup date cannot be in the past.");
        return;
      }
    }

    setSaving(true);

    const payload = new FormData();
    Object.keys(editFormData).forEach(key => {
      if (editFormData[key] !== undefined && editFormData[key] !== null) {
        payload.append(key, editFormData[key]);
      }
    });

    const subList = activeCards.map(card => ({
      category_id: card.category_id,
      subcategory_id: card.subcategory_id,
      variation_id: card.selected_variation_id,
      expected_waste: parseFloat(card.expected_waste) || 0,
      custom_price: parseFloat(card.custom_price) || 0,
      suggested_price: parseFloat(card.variations.find(v => v.id == card.selected_variation_id)?.per_kg_price || 0)
    }));
    payload.append('subcategories', JSON.stringify(subList));
    payload.append('existing_images', JSON.stringify(existingImages));

    editSelectedFiles.forEach(file => {
      payload.append('images', file);
    });

    try {
      await api.put(`/waste-collection-requests/lead/${selectedGroup.lead_id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Waste collection request updated successfully!");
      setIsEditing(false);
      fetchRequests();
      closePanel();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update waste collection request.");
    } finally {
      setSaving(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/waste-collection-requests', { params: { limit: 500 } });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load waste collection requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRequests();
    });
  }, []);

  // Group requests by lead_id
  const grouped = requests.reduce((acc, req) => {
    const key = req.lead_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {});

  const groupedList = Object.entries(grouped).map(([lead_id, items]) => {
    const first = items[0];
    const totalExpectedWaste = items.reduce((s, r) => s + parseFloat(r.expected_waste || 0), 0);
    const totalMonthlyPrice = items.reduce((s, r) => s + parseFloat(r.monthly_price || 0), 0);
    const totalYearlyPrice = items.reduce((s, r) => s + parseFloat(r.yearly_price || 0), 0);
    const categories = [...new Set(items.map(r => r.category?.name).filter(Boolean))].join(', ');
    const subCategories = [...new Set(items.map(r => r.subCategory?.name).filter(Boolean))].join(', ');
    return {
      lead_id,
      items,
      first,
      totalExpectedWaste,
      totalMonthlyPrice,
      totalYearlyPrice,
      categories,
      subCategories,
      itemCount: items.length,
    };
  }).sort((a, b) => new Date(b.first.created_at) - new Date(a.first.created_at));

  // Filter
  const filteredList = groupedList.filter(g => {
    const matchSearch = !search || [
      g.lead_id,
      g.first.waste_generator_name,
      g.first.authorized_person_name,
      g.first.mobile_number,
      g.first.email,
      g.categories,
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = !statusFilter || g.items.every(r => r.status === statusFilter) || g.first.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openPanel = (group) => {
    setSelectedGroup(group);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setIsEditing(false);
    setTimeout(() => setSelectedGroup(null), 300);
  };

  const totalLeads = groupedList.length;
  const totalRequests = requests.length;
  const pendingCount = groupedList.filter(g => g.first.status === 'Pending').length;
  const completedCount = groupedList.filter(g => g.first.status === 'Completed').length;

  // Group edit subcategories by category
  const editCategoriesMap = {};
  editSubcategoryCards.forEach(card => {
    if (!editCategoriesMap[card.category_id]) {
      editCategoriesMap[card.category_id] = {
        category_id: card.category_id,
        category_name: card.category_name,
        subcategories: []
      };
    }
    editCategoriesMap[card.category_id].subcategories.push(card);
  });
  const groupedEditCategories = Object.values(editCategoriesMap);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {panelOpen && selectedGroup ? (
        isEditing ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleEditSubmit} className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg">
                  Editing Lead: {selectedGroup.lead_id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Edit Waste Request Details
              </h2>
            </div>

            {/* Stacked Sections matching creation layout */}
            <div className="w-full space-y-6">

              {/* SECTION 1: Customer Details */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-4 h-4 text-violet-500" /> Section 1: Customer Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Type *</label>
                    <select
                      name="customer_type"
                      value={editFormData.customer_type}
                      onChange={handleEditInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Commercial">Commercial</option>
                      <option value="RWA">RWA</option>
                      <option value="Residential">Residential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Authorized Person Name *</label>
                    <input
                      type="text"
                      name="authorized_person_name"
                      value={editFormData.authorized_person_name}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter full name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={editFormData.mobile_number}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enter 10-digit number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      required
                      placeholder="example@mail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Property Details */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building className="w-4 h-4 text-violet-500" /> Section 2: Property Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Search *</label>
                    <input
                      type="text"
                      id="editMapSearchInput"
                      name="address_search"
                      value={editFormData.address_search}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Search locations..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude *</label>
                      <input
                        type="text"
                        name="latitude"
                        value={editFormData.latitude}
                        onChange={handleEditInputChange}
                        required
                        placeholder="e.g. 28.7041"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude *</label>
                      <input
                        type="text"
                        name="longitude"
                        value={editFormData.longitude}
                        onChange={handleEditInputChange}
                        required
                        placeholder="e.g. 77.1025"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Interactive Google Map */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                    <div
                      ref={editMapDivRef}
                      id="editPropertyMap"
                      style={{ height: '320px', width: '100%' }}
                    />
                    {!editFormData.latitude && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 pointer-events-none">
                        <div className="text-center">
                          <MapPin className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-500">Search an address above to pin the location</p>
                          <p className="text-[11px] text-slate-400 mt-1">You can also drag the marker to adjust</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Waste Generator Name *</label>
                      <input
                        type="text"
                        name="waste_generator_name"
                        value={editFormData.waste_generator_name}
                        onChange={handleEditInputChange}
                        required
                        placeholder="e.g. Green Heights Apartment"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area (SqM)</label>
                      <input
                        type="number"
                        name="area_sqm"
                        value={editFormData.area_sqm}
                        onChange={handleEditInputChange}
                        placeholder="e.g. 500"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dwelling Units</label>
                      <input
                        type="number"
                        name="no_of_dwelling_units"
                        value={editFormData.no_of_dwelling_units}
                        onChange={handleEditInputChange}
                        placeholder="e.g. 10"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address *</label>
                      <textarea
                        name="complete_address"
                        value={editFormData.complete_address}
                        onChange={handleEditInputChange}
                        required
                        rows="2"
                        placeholder="Enter complete detailed address"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Waste Details (Optional) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Layers className="w-4 h-4 text-emerald-600" /> Section 3: Waste Details (Optional)
                </h3>

                {editSubcategoryCards.length === 0 ? (
                  <div className="text-slate-400 text-xs italic text-center py-4">Loading catalog data...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Grouped Category Selection Controls */}
                    <div className="space-y-6 pb-6 border-b border-slate-100">
                      {groupedEditCategories.map((cat) => {
                        const selectedSubcats = cat.subcategories.filter(s => s.included);
                        const isOpen = openDropdownCategoryId === cat.category_id;

                        return (
                          <div key={cat.category_id} className="space-y-2 relative edit-category-dropdown-trigger">
                            {/* Category Header */}
                            <h3 className="text-sm font-black text-emerald-800 tracking-tight">
                              {cat.category_name}
                            </h3>

                            {/* Sub-Category Label */}
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2 mb-1">
                              Sub-Category
                            </label>

                            {/* Multiselect Box */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownCategoryId(isOpen ? null : cat.category_id);
                              }}
                              className="min-h-[46px] bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-2 flex flex-wrap gap-2 items-center cursor-pointer select-none transition-all focus-within:ring-2 focus-within:ring-violet-500/20"
                            >
                              {selectedSubcats.length === 0 ? (
                                <span className="text-xs text-slate-400 pl-2">Select subcategories...</span>
                              ) : (
                                selectedSubcats.map((sub) => (
                                  <span
                                    key={sub.subcategory_id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubcategoryCard(sub.subcategory_id);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                                  >
                                    <span className="font-bold">×</span>
                                    {sub.subcategory_name}
                                  </span>
                                ))
                              )}
                            </div>

                            {/* Dropdown Menu */}
                            {isOpen && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                {cat.subcategories.map((sub) => (
                                  <div
                                    key={sub.subcategory_id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubcategoryCard(sub.subcategory_id);
                                    }}
                                    className={`px-4 py-2 text-xs font-medium cursor-pointer hover:bg-slate-50 flex items-center justify-between ${sub.included ? 'text-violet-600 bg-violet-50/50' : 'text-slate-700'
                                      }`}
                                  >
                                    <span>{sub.subcategory_name}</span>
                                    {sub.included && (
                                      <span className="text-violet-600 font-bold">✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Render Cards only for selected subcategories */}
                    <div className="space-y-6">
                      {editSubcategoryCards.filter(c => c.included).map((card) => {
                        const selectedVar = card.variations.find(v => v.id == card.selected_variation_id) || null;
                        const expectedDaily = parseFloat(card.expected_waste) || 0;

                        const defaultVarPrice = selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0;
                        const customPriceVal = parseFloat(card.custom_price);
                        const finalPrice = (!isNaN(customPriceVal) && customPriceVal >= 0 && card.custom_price !== '')
                          ? customPriceVal
                          : defaultVarPrice;

                        const estMonthlyWaste = expectedDaily * 30;
                        const estYearlyWaste = expectedDaily * 365;

                        const estMonthlyPrice = estMonthlyWaste * finalPrice;
                        const estYearlyPrice = estYearlyWaste * finalPrice;

                        return (
                          <div
                            key={card.subcategory_id}
                            className="bg-slate-50 border border-slate-200/60 rounded-[16px] p-5 space-y-5 transition-all duration-300 hover:shadow-sm"
                          >
                            {/* Card Header */}
                            <div className="border-b border-slate-200/60 pb-2">
                              <h3 className="text-sm font-extrabold text-emerald-800 tracking-tight">
                                {card.subcategory_name}
                              </h3>
                            </div>

                            {/* 3-Column Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                              {/* 1. Variation Dropdown */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Variation
                                </label>
                                <select
                                  value={card.selected_variation_id}
                                  onChange={(e) => handleCardVariationChange(card.subcategory_id, e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-violet-400 text-xs font-semibold text-slate-800 cursor-pointer"
                                >
                                  <option value="">-Select Type-</option>
                                  {card.variations.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.variation_name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 2. No. of Services (Suggested Weight) */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  No. of Services
                                </label>
                                <input
                                  type="text"
                                  disabled
                                  value={selectedVar ? selectedVar.number_of_sr || '0' : ''}
                                  className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                                />
                              </div>

                              {/* 3. Scheduled Every */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Scheduled Every
                                </label>
                                <input
                                  type="text"
                                  disabled
                                  value={selectedVar ? `Every ${selectedVar.schedule_after_days || '1'} Days` : ''}
                                  className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                                />
                              </div>

                              {/* 4. Expected Waste Per Day */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Expected Waste (KG Per Day) *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  step="any"
                                  required
                                  disabled={!selectedVar}
                                  value={card.expected_waste}
                                  onChange={e => handleCardWasteChange(card.subcategory_id, e.target.value)}
                                  placeholder="Enter waste in KG per day"
                                  className={`w-full border rounded-lg py-2 px-3 outline-none text-xs font-semibold text-slate-800 ${selectedVar
                                      ? 'bg-white border-slate-200 focus:border-violet-400'
                                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                />
                              </div>

                              {/* 5. Agreed Price - Editable */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Agreed Price *
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    required
                                    disabled={!selectedVar}
                                    value={card.custom_price}
                                    onChange={e => handleCardPriceChange(card.subcategory_id, e.target.value)}
                                    placeholder="Enter price"
                                    className={`w-full border rounded-lg py-2 pl-3 pr-12 outline-none text-xs font-semibold text-slate-800 ${selectedVar
                                        ? 'bg-white border-slate-200 focus:border-violet-400'
                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                      }`}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹/KG</span>
                                </div>
                              </div>

                              {/* 6. Suggested Price */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Suggested Price
                                </label>
                                <input
                                  type="text"
                                  disabled
                                  value={selectedVar ? `₹${selectedVar.per_kg_price || '0'}/KG` : ''}
                                  className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                                />
                              </div>

                            </div>

                            {/* Live Calculations Section */}
                            {selectedVar && expectedDaily > 0 && (
                              <div className="pt-3 border-t border-slate-200/60 space-y-2 animate-in fade-in duration-150">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Estimates</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="bg-white border border-slate-200/60 rounded-xl p-2.5">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Monthly Waste</span>
                                    <span className="font-extrabold text-slate-800 text-xs block mt-0.5">{estMonthlyWaste.toFixed(2).replace(/\.00$/, '')} KG</span>
                                  </div>
                                  <div className="bg-white border border-slate-200/60 rounded-xl p-2.5">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Yearly Waste</span>
                                    <span className="font-extrabold text-slate-800 text-xs block mt-0.5">{estYearlyWaste.toFixed(2).replace(/\.00$/, '')} KG</span>
                                  </div>
                                  <div className="bg-white border border-slate-200/60 rounded-xl p-2.5">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Monthly Price</span>
                                    <span className="font-extrabold text-purple-700 text-xs block mt-0.5">₹{estMonthlyPrice.toFixed(2).replace(/\.00$/, '')}</span>
                                  </div>
                                  <div className="bg-white border border-slate-200/60 rounded-xl p-2.5">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Yearly Price</span>
                                    <span className="font-extrabold text-purple-700 text-xs block mt-0.5">₹{estYearlyPrice.toFixed(2).replace(/\.00$/, '')}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: License Details (Optional) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4 h-4 text-violet-500" /> Section 4: License Details (Optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registered RWA</label>
                    <input
                      type="text"
                      name="registered_rwa"
                      value={editFormData.registered_rwa}
                      onChange={handleEditInputChange}
                      placeholder="e.g. Green Valley Association"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-xs font-medium text-slate-700 focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GST Number</label>
                    <input
                      type="text"
                      name="gst"
                      value={editFormData.gst}
                      onChange={handleEditInputChange}
                      placeholder="e.g. 07AAAAA1111A1Z1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-xs font-medium text-slate-700 focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PAN Number</label>
                    <input
                      type="text"
                      name="pan"
                      value={editFormData.pan}
                      onChange={handleEditInputChange}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-xs font-medium text-slate-700 focus:border-violet-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Trade License</label>
                    <input
                      type="text"
                      name="trade_license"
                      value={editFormData.trade_license}
                      onChange={handleEditInputChange}
                      placeholder="e.g. TL-998877"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-xs font-medium text-slate-700 focus:border-violet-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Additional Details (Optional) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Calendar className="w-4 h-4 text-violet-500" /> Section 5: Additional Details (Optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preferred Pickup Date</label>
                    <input
                      type="date"
                      name="pickup_date"
                      value={editFormData.pickup_date}
                      onChange={handleEditInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-xs font-medium text-slate-700 focus:border-violet-400 cursor-pointer"
                    />
                  </div>

                  {editFormData.pickup_date && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Time Slot</label>
                      {timeSlots.length === 0 ? (
                        <div className="text-slate-400 text-xs italic">No active slots found.</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {timeSlots.map((slot) => {
                            const isSelected = editFormData.time_slot_id == slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => {
                                  setEditFormData(prev => ({
                                    ...prev,
                                    time_slot_id: slot.id,
                                    pickup_time: `${slot.start_time} - ${slot.end_time}`
                                  }));
                                }}
                                className={`w-full py-2 px-3 text-left rounded-lg border text-xs font-medium transition-all ${isSelected
                                    ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm'
                                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                                  }`}
                              >
                                {slot.slot_name} ({slot.start_time} - {slot.end_time})
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Notes</label>
                    <textarea
                      name="pickup_notes"
                      value={editFormData.pickup_notes}
                      onChange={handleEditInputChange}
                      rows="2"
                      placeholder="Provide landmarks, instructions..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-xs font-medium text-slate-700 resize-none focus:border-violet-400"
                    />
                  </div>

                  <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Manage Waste Photos</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      
                      {/* Upload Box */}
                      <div className="relative h-24 border-2 border-dashed border-slate-200 hover:border-violet-400 transition-colors bg-slate-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center text-slate-400 p-2">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50 text-slate-400" />
                        <span className="text-[9px] font-bold">Add Photo</span>
                        <input
                          type="file"
                          onChange={handleEditFileChange}
                          multiple
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Render Existing Images */}
                      {existingImages.map((imgName, idx) => (
                        <div key={`exist-${idx}`} className="relative h-24 border border-slate-200 rounded-xl bg-slate-100 overflow-hidden">
                          <img 
                            src={`${IMAGE_BASE_URL}/CollectionRequests/${imgName}`} 
                            alt="Existing Waste Pic" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(imgName)}
                            className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-90 hover:opacity-100 shadow-md transition-all active:scale-90"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Render New Previews */}
                      {editFilePreviews.map((url, idx) => (
                        <div key={`new-${idx}`} className="relative h-24 border border-slate-200 rounded-xl bg-slate-100 overflow-hidden">
                          <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeEditFile(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-90 hover:opacity-100 shadow-md transition-all active:scale-90"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Action Panel */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closePanel}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg">
                    {selectedGroup.lead_id}
                  </span>
                  <StatusBadge status={selectedGroup.first?.status} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {selectedGroup.first?.waste_generator_name || selectedGroup.first?.authorized_person_name || '—'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {selectedGroup.itemCount} subcategor{selectedGroup.itemCount !== 1 ? 'ies' : 'y'} selected · Pickup: {selectedGroup.first?.pickup_date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closePanel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm w-fit"
                >
                  <X className="w-3.5 h-3.5" />
                  Back to List
                </button>
              </div>
            </div>

            {/* Summary Pills / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Weight, label: 'Daily Waste', value: `${selectedGroup.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')} KG`, color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100' },
                { icon: IndianRupee, label: 'Monthly Rev.', value: `₹${selectedGroup.totalMonthlyPrice.toFixed(2).replace(/\.00$/, '')}`, color: 'text-purple-600', bg: 'bg-purple-50/50 border-purple-100' },
                { icon: TrendingUp, label: 'Yearly Rev.', value: `₹${selectedGroup.totalYearlyPrice.toFixed(0)}`, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' },
              ].map(pill => (
                <div key={pill.label} className={`${pill.bg} rounded-xl p-4 border shadow-sm flex items-center gap-4`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm flex-shrink-0`}>
                    <pill.icon className={`w-5 h-5 ${pill.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pill.label}</p>
                    <p className={`text-base font-bold text-slate-800 mt-0.5`}>{pill.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Details Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Columns (Main details) - 2 cols on lg */}
              <div className="lg:col-span-2 space-y-6">
                {/* Subcategories Breakdown */}
                <SectionCard title="Subcategories Breakdown" icon={Layers} iconColor="text-emerald-600">
                  <div className="space-y-4 pt-1">
                    {selectedGroup.items.filter(item => item.subcategory_id).length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs italic font-medium">
                        No waste details or subcategories were selected for this request.
                      </div>
                    ) : (
                      selectedGroup.items.map((item, idx) => {
                        const monthly_waste = parseFloat(item.monthly_waste || 0);
                        const yearly_waste = parseFloat(item.yearly_waste || 0);
                        const monthly_price = parseFloat(item.monthly_price || 0);
                        const yearly_price = parseFloat(item.yearly_price || 0);
                        return (
                          <div key={idx} className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
                            {/* Cat / Subcat header */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.category?.name && (
                                <>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {item.category.name}
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                </>
                              )}
                              <span className="text-sm font-bold text-slate-800">{item.subCategory?.name || '—'}</span>
                              {item.variation?.variation_name && (
                                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                                  {item.variation.variation_name}
                                </span>
                              )}
                            </div>

                            {/* Price & waste grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {[
                                { label: 'Expected Waste/Day', value: `${parseFloat(item.expected_waste || 0).toFixed(2)} KG`, color: 'text-blue-700' },
                                { label: 'Agreed Price/KG', value: `₹${parseFloat(item.agreed_price || 0).toFixed(2)}`, color: 'text-purple-700' },
                                { label: 'Suggested Price/KG', value: `₹${parseFloat(item.suggested_price || 0).toFixed(2)}`, color: 'text-slate-600' },
                                { label: 'Monthly Waste', value: `${monthly_waste.toFixed(2)} KG`, color: 'text-slate-700' },
                                { label: 'Yearly Waste', value: `${yearly_waste.toFixed(2)} KG`, color: 'text-slate-700' },
                                { label: 'Monthly Price', value: `₹${monthly_price.toFixed(2)}`, color: 'text-purple-700' },
                                { label: 'Yearly Price', value: `₹${yearly_price.toFixed(2)}`, color: 'text-purple-700' },
                              ].map(cell => (
                                <div key={cell.label} className="bg-white rounded-lg border border-slate-100 px-3 py-2 shadow-sm">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cell.label}</p>
                                  <p className={`text-xs font-semibold ${cell.color} mt-0.5`}>{cell.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </SectionCard>

                {/* Property & Generator Details */}
                <SectionCard title="Property & Generator Details" icon={Building} iconColor="text-blue-600">
                  <InfoRow icon={Building} label="Waste Generator Name" value={selectedGroup.first?.waste_generator_name} iconColor="text-blue-500" />
                  <InfoRow icon={Home} label="Area (SqM)" value={selectedGroup.first?.area_sqm ? `${selectedGroup.first.area_sqm} SqM` : null} iconColor="text-blue-400" />
                  <InfoRow icon={Hash} label="Dwelling Units" value={selectedGroup.first?.dwelling_units?.toString()} iconColor="text-blue-400" />
                  <InfoRow icon={MapPin} label="Complete Address" value={selectedGroup.first?.complete_address} iconColor="text-rose-500" />
                </SectionCard>

                {/* License & Legal Details */}
                <SectionCard title="License & Legal Details" icon={ShieldCheck} iconColor="text-amber-600">
                  <InfoRow icon={Building} label="Registered RWA" value={selectedGroup.first?.registered_rwa} iconColor="text-amber-500" />
                  <InfoRow icon={FileText} label="GST Number" value={selectedGroup.first?.gst_number} iconColor="text-amber-500" />
                  <InfoRow icon={FileText} label="PAN Number" value={selectedGroup.first?.pan_number} iconColor="text-amber-500" />
                  <InfoRow icon={Tag} label="Trade License" value={selectedGroup.first?.trade_license} iconColor="text-amber-500" />
                </SectionCard>
              </div>

              {/* Right Column (Side details) - 1 col on lg */}
              <div className="space-y-6">
                {/* Customer Details */}
                <SectionCard title="Customer Details" icon={User} iconColor="text-violet-600">
                  <InfoRow icon={User} label="Customer Type" value={selectedGroup.first?.customer_type} iconColor="text-violet-500" />
                  <InfoRow icon={User} label="Authorized Person Name" value={selectedGroup.first?.authorized_person_name} iconColor="text-violet-500" />
                  <InfoRow icon={Phone} label="Mobile Number" value={selectedGroup.first?.mobile_number} iconColor="text-green-500" />
                  <InfoRow icon={Mail} label="Email" value={selectedGroup.first?.email} iconColor="text-blue-500" />
                  <InfoRow icon={User} label="Created By User" value={selectedGroup.first?.customer?.name ? `${selectedGroup.first.customer.name} (${selectedGroup.first.customer.email || ''})` : '—'} iconColor="text-violet-500" />
                  <InfoRow icon={Calendar} label="Created Date" value={selectedGroup.first?.created_at ? new Date(selectedGroup.first.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} iconColor="text-violet-500" />
                </SectionCard>

                {/* Pickup & Additional Details */}
                <SectionCard title="Pickup & Additional Details" icon={Calendar} iconColor="text-indigo-600">
                  <InfoRow icon={Calendar} label="Preferred Pickup Date" value={selectedGroup.first?.pickup_date} iconColor="text-indigo-500" />
                  <InfoRow icon={Clock} label="Preferred Pickup Time" value={selectedGroup.first?.pickup_time} iconColor="text-indigo-500" />
                  <InfoRow icon={Info} label="Pickup Notes" value={selectedGroup.first?.pickup_notes} iconColor="text-slate-500" />
                  <InfoRow icon={User} label="Request Source" value={selectedGroup.first?.request_source} iconColor="text-slate-500" />
                </SectionCard>


              </div>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-violet-600" /> Waste Requests List
              </h1>
              <p className="text-slate-400 text-xs mt-1">All submitted requests grouped by Lead ID</p>
            </div>
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: totalLeads, icon: Hash, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Total Requests', value: totalRequests, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pending', value: pendingCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Lead ID, name, mobile, category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:border-violet-400 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {['Pending', 'Verified', 'Approved', 'Rejected', 'Completed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="text-xs font-bold text-slate-400 ml-auto">
              Showing <span className="text-slate-700">{filteredList.length}</span> lead{filteredList.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <RefreshCw className="w-10 h-10 animate-spin text-violet-500 mb-4" />
                <p className="text-sm font-semibold">Loading requests…</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <ClipboardList className="w-12 h-12 opacity-20 mb-4" />
                <p className="text-sm font-semibold">No waste collection requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead ID</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Generator / Contact</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Created Date</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categories Selected</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Items</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Waste/Day</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Monthly Rev.</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredList.map((group, idx) => (
                      <tr
                        key={group.lead_id}
                        className="hover:bg-violet-50/20 transition-colors group"
                      >
                        <td className="px-5 py-4 text-xs text-slate-400 font-bold align-top">{idx + 1}</td>

                        <td className="px-5 py-4 align-top">
                          <span className="font-mono text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-md block w-fit">
                            {group.lead_id}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                            {group.first.waste_generator_name || group.first.authorized_person_name || '—'}
                          </p>
                          {group.first.waste_generator_name && group.first.authorized_person_name && (
                            <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px] mt-0.5">
                              Ref: {group.first.authorized_person_name}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{group.first.mobile_number}</p>
                          {group.first.customer_type && (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">
                              {group.first.customer_type}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top text-xs font-semibold text-slate-700">
                          <div>
                            <span className="font-bold text-slate-700">{group.first.customer?.name || '—'}</span>
                            {group.first.customer?.email && (
                              <span className="block text-[9px] text-slate-400 mt-0.5">{group.first.customer.email}</span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top text-xs font-semibold text-slate-600 whitespace-nowrap">
                          {group.first.created_at ? (
                            <span>
                              {new Date(group.first.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          ) : '—'}
                        </td>

                        <td className="px-5 py-4 max-w-[200px] align-top">
                          {group.items.filter(item => item.category_id || item.subcategory_id).length === 0 ? (
                            <span className="text-xs font-medium text-slate-400 italic">No waste details provided</span>
                          ) : (
                            group.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 mb-1 last:mb-0">
                                {item.category?.name && (
                                  <>
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                                      {item.category.name}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                  </>
                                )}
                                <span className="text-xs font-medium text-slate-700 truncate">
                                  {item.subCategory?.name || '—'}
                                </span>
                              </div>
                            ))
                          )}
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center mx-auto">
                            {group.itemCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-800">
                            {group.totalExpectedWaste.toFixed(2).replace(/\.00$/, '')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 ml-1">KG</span>
                        </td>

                        <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                          <span className="text-xs font-bold text-purple-700">
                            ₹{group.totalMonthlyPrice.toFixed(2).replace(/\.00$/, '')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 ml-1.5">
                            (₹{group.totalYearlyPrice.toFixed(0)}/yr)
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top whitespace-nowrap">
                          {group.first.pickup_date ? (
                            <>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                {group.first.pickup_date}
                              </div>
                              {group.first.pickup_time && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
                                  <Clock className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                  {group.first.pickup_time}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 italic">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusBadge status={group.first.status} />
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          <div className="relative inline-block text-left action-dropdown-trigger">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownLeadId(activeDropdownLeadId === group.lead_id ? null : group.lead_id);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center border border-slate-200 bg-white shadow-sm"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeDropdownLeadId === group.lead_id && (
                              <div className="absolute right-0 mt-1 w-28 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownLeadId(null);
                                    openPanel(group);
                                    setIsEditing(false);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownLeadId(null);
                                    openPanel(group);
                                    setIsEditing(true);
                                    setEditActiveStep(1);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

