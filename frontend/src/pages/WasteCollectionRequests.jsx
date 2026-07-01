import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Image as ImageIcon, CheckCircle, Trash2, Calendar, Clock,
  User, Phone, Mail, MapPin, Building, ShieldCheck, ClipboardCheck, FileText, ArrowLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function WasteCollectionRequests() {
  const [subcategoryCards, setSubcategoryCards] = useState([]);
  const [openDropdownCategoryId, setOpenDropdownCategoryId] = useState(null);
  
  const [formData, setFormData] = useState({
    // Section 1: Customer Details
    customer_type: 'Individual',
    authorized_person_name: '',
    mobile_number: '',
    email: '',
    
    // Section 2: Property Details
    address_search: '',
    latitude: '',
    longitude: '',
    waste_generator_name: '',
    complete_address: '',
    area_sqm: '',
    no_of_dwelling_units: '',

    // Section 4: License Details
    registered_rwa: '',
    gst: '',
    pan: '',
    trade_license: '',

    // Section 5: Additional Details
    pickup_notes: '',
    pickup_date: '',
    pickup_time: '',
    time_slot_id: '',
  });

  const navigate = useNavigate();

  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // T&C state — shown first before the form
  const [tncAccepted, setTncAccepted] = useState(false);
  const [tncSaving, setTncSaving] = useState(false);
  const [tncBoxes, setTncBoxes] = useState({
    tnc_agree: false,
    accuracy_agree: false,
    copyright_agree: false,
    promo_agree: false,
  });

  const handleTncAccept = async () => {
    setTncSaving(true);
    try {
      await api.post('/tnc/accept', {
        accepted_checkboxes: JSON.stringify(tncBoxes)
      });
    } catch (err) {
      console.warn('TnC save failed (non-blocking):', err);
    } finally {
      setTncSaving(false);
      setTncAccepted(true);
    }
  };

  const handleTncDecline = () => {
    navigate('/');
  };

  // Google Map refs
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const mapDivRef = useRef(null);

  // ── Effect 1: Load the Google Maps script only (no map init yet) ────────────
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

  // ── Effect 2: Init map once T&C accepted (form div now exists in DOM) ────────
  useEffect(() => {
    if (!tncAccepted) return;

    const DEFAULT_LAT = 20.5937;
    const DEFAULT_LNG = 78.9629;

    const initMap = () => {
      if (!mapDivRef.current || mapInstanceRef.current) return;

      const map = new window.google.maps.Map(mapDivRef.current, {
        center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
        zoom: 5,
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
      mapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag to adjust location'
      });
      markerRef.current = marker;

      // When marker is dragged → update lat/lng fields
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        const lat = pos.lat().toFixed(6);
        const lng = pos.lng().toFixed(6);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      });

      // Autocomplete wired to update map + marker + fields
      const searchInput = document.getElementById('mapSearchInput');
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

            setFormData(prev => ({
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

    // Small delay to ensure the map div has painted after tncAccepted state change
    const waitForGoogle = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setTimeout(initMap, 50);
      } else {
        setTimeout(waitForGoogle, 100);
      }
    };
    waitForGoogle();

  }, [tncAccepted]);

  // Fetch Sub Categories on mount
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await api.get('/sub-categories', { params: { limit: 200, status: 1 } });
        const allSubCats = res.data.subCategories || [];
        
        // Initialize cards for all active subcategories
        const cards = allSubCats.map(sc => {
          return {
            subcategory_id: sc.id,
            subcategory_name: sc.name,
            category_name: sc.category?.name || 'Waste Category',
            category_id: sc.category_id,
            color: sc.color || '#6366f1',
            variations: sc.variations || [],
            selected_variation_id: '',
            expected_waste: '',
            included: false // Default to false (not selected initially)
          };
        });
        setSubcategoryCards(cards);
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        toast.error("Failed to load waste subcategories.");
      }
    };
    fetchSubCategories();
  }, []);

  // Handle Toggle Include/Exclude for a subcategory card
  const handleToggleInclude = (subcatId) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const nextIncluded = !card.included;
        const defaultVar = card.variations?.[0] || null;
        return {
          ...card,
          included: nextIncluded,
          selected_variation_id: nextIncluded 
            ? (card.selected_variation_id || (defaultVar ? defaultVar.id : '')) 
            : '',
          custom_price: nextIncluded 
            ? (card.custom_price || (defaultVar ? defaultVar.per_kg_price?.toString() || '' : '')) 
            : '', // Pre-set to suggested price on toggle
          expected_waste: nextIncluded ? card.expected_waste : ''
        };
      }
      return card;
    }));
  };

  // Handle variation selection in a card
  const handleSelectVariation = (subcatId, varId) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        const numericVarId = varId ? Number(varId) : '';
        const selectedVar = card.variations.find(v => v.id == numericVarId) || null;
        return {
          ...card,
          selected_variation_id: numericVarId,
          custom_price: selectedVar ? selectedVar.per_kg_price?.toString() || '' : '' // Pre-set to new variation's suggested price
        };
      }
      return card;
    }));
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleCloseDropdown = () => {
      setOpenDropdownCategoryId(null);
    };
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  // Handle expected waste input change
  const handleCardWasteChange = (subcatId, val) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return {
          ...card,
          expected_waste: val
        };
      }
      return card;
    }));
  };

  // Handle custom price change in a card
  const handleCardPriceChange = (subcatId, val) => {
    setSubcategoryCards(prev => prev.map(card => {
      if (card.subcategory_id === subcatId) {
        return {
          ...card,
          custom_price: val
        };
      }
      return card;
    }));
  };

  const fetchActiveTimeSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const res = await api.get('/time-slots/active', { params: { date } });
      if (res.data.success) {
        setTimeSlots(res.data.slots || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load time slots for the selected date.");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (formData.pickup_date) {
      fetchActiveTimeSlots(formData.pickup_date);
    } else {
      setTimeSlots([]);
    }
    setFormData(prev => ({ ...prev, time_slot_id: '', pickup_time: '' }));
  }, [formData.pickup_date]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(filePreviews[index]);
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
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
    setSubcategoryCards(prev => prev.map(card => {
      return {
        ...card,
        selected_variation_id: '',
        custom_price: '',
        expected_waste: '',
        included: false // Reset to unselected
      };
    }));
    setSelectedFiles([]);
    filePreviews.forEach(url => URL.revokeObjectURL(url));
    setFilePreviews([]);
  };

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Field Validations
    const activeCards = subcategoryCards.filter(c => c.included);
    if (activeCards.length === 0) {
      toast.error("Please select at least one subcategory and complete its details.");
      return;
    }

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

    if (!formData.pickup_date) {
      toast.error("Preferred pickup date is required.");
      return;
    }

    if (!formData.time_slot_id) {
      toast.error("Please select an available time slot.");
      return;
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.pickup_date);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Pickup date cannot be in the past.");
      return;
    }

    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    // Build subcategories array
    const subcategoriesData = activeCards.map(card => {
      const selectedVar = card.variations.find(v => v.id == card.selected_variation_id);
      const defaultVarPrice = selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0;
      const customPriceVal = parseFloat(card.custom_price);
      const finalPrice = (!isNaN(customPriceVal) && customPriceVal >= 0 && card.custom_price !== '') 
        ? customPriceVal 
        : defaultVarPrice;

      const expectedWaste = parseFloat(card.expected_waste) || 0;
      return {
        category_id: card.category_id,
        subcategory_id: card.subcategory_id,
        variation_id: selectedVar.id,
        expected_waste: expectedWaste,
        custom_price: finalPrice,
        suggested_price: defaultVarPrice
      };
    });

    payload.append('subcategories', JSON.stringify(subcategoriesData));

    // Append Files
    selectedFiles.forEach(file => {
      payload.append('images', file);
    });

    try {
      await api.post('/waste-collection-requests', payload);
      setSubmitSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate waste collection request.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── T&C Screen (shown first, before the form) ─────────────────────────────
  if (!tncAccepted) {
    const TNC_ITEMS = [
      {
        key: 'tnc_agree',
        text: 'By using our waste management services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as the terms and conditions outlined in the MoU, which are hereby incorporated by reference.',
      },
      {
        key: 'accuracy_agree',
        text: 'We warrant that the information provided by us is to the best of our knowledge and belief, accurate and current at the time of provisioning.',
      },
      {
        key: 'copyright_agree',
        text: 'Copyrights reserved with Ecosphere Waste Solutions and Mukka Protiens Limited.',
      },
      {
        key: 'promo_agree',
        text: 'I agree to receive promotional emails',
      },
    ];

    return (
      <div className="w-full pb-12 px-0 font-sans">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={handleTncDecline}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-violet-600" /> Waste Collection Requests
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">Please review and accept the Terms & Conditions to continue.</p>
          </div>
        </div>

        {/* T&C Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Terms &amp; Conditions</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Read each point carefully and check the boxes to agree</p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="px-8 py-6 space-y-3">
              {TNC_ITEMS.map(({ key, text }) => (
                <label
                  key={key}
                  className={`flex items-start gap-4 rounded-2xl px-5 py-4 cursor-pointer select-none transition-all border ${
                    tncBoxes[key]
                      ? 'bg-violet-50 border-violet-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={tncBoxes[key]}
                    onChange={() => setTncBoxes(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="mt-0.5 flex-shrink-0 w-4 h-4 cursor-pointer accent-violet-600"
                  />
                  <p className={`text-sm leading-relaxed font-medium ${tncBoxes[key] ? 'text-violet-800' : 'text-slate-600'}`}>
                    {text}
                  </p>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-8 py-6 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTncDecline}
                className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm transition-all cursor-pointer shadow-sm"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={tncSaving}
                onClick={handleTncAccept}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-violet-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                {tncSaving ? 'Saving…' : 'Accept & Continue →'}
              </button>
            </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {

    return (
      <div className="w-full pb-12 px-0 font-sans flex items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full text-center border border-slate-100 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Request Generated Successfully!</h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            Your manual waste collection request has been saved and is currently set to <span className="font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">Pending</span> status.
          </p>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold shadow-lg shadow-violet-100 transition-all active:scale-98 cursor-pointer"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group subcategories by category
  const categoriesMap = {};
  subcategoryCards.forEach(card => {
    if (!categoriesMap[card.category_id]) {
      categoriesMap[card.category_id] = {
        category_id: card.category_id,
        category_name: card.category_name,
        color: card.color,
        subcategories: []
      };
    }
    categoriesMap[card.category_id].subcategories.push(card);
  });
  const groupedCategories = Object.values(categoriesMap);

  return (
    <div className="w-full pb-12 px-0 font-sans">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-violet-600" /> Add Waste Collection Request
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Phase 1 — Enter request details manually.</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
          
          {/* SECTION 1: Customer Details */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-violet-500" /> Section 1: Customer Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Type *</label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
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
                  value={formData.authorized_person_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter 10-digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@mail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: Property Details */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-violet-500" /> Section 2: Property Details
            </h2>
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Search *</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    id="mapSearchInput"
                    name="address_search"
                    value={formData.address_search}
                    onChange={handleInputChange}
                    required
                    placeholder="Search locations using Google..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude *</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 28.7041"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude *</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 77.1025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>
              </div>

              {/* Interactive Google Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                <div
                  ref={mapDivRef}
                  id="propertyMap"
                  style={{ height: '320px', width: '100%' }}
                />
                {!formData.latitude && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 pointer-events-none">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-500">Search an address above to pin the location</p>
                      <p className="text-[11px] text-slate-400 mt-1">You can also drag the marker to adjust</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Waste Generator Name *</label>
                  <input
                    type="text"
                    name="waste_generator_name"
                    value={formData.waste_generator_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Smart Bazar / RWA Residency"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Area (SqM)</label>
                    <input
                      type="number"
                      name="area_sqm"
                      value={formData.area_sqm}
                      onChange={handleInputChange}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dwelling Units</label>
                    <input
                      type="number"
                      name="no_of_dwelling_units"
                      value={formData.no_of_dwelling_units}
                      onChange={handleInputChange}
                      placeholder="e.g. 12"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    name="complete_address"
                    value={formData.complete_address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Enter complete detailed street address..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: Expected Waste (KG) */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardCheck className="w-5 h-5 text-violet-500" /> Section 3: Expected Waste (KG)
            </h2>
            <div className="space-y-6">
              
              {subcategoryCards.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  Loading waste categories...
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Grouped Category Selection Controls */}
                  <div className="space-y-6 pb-6 border-b border-slate-100">
                    {groupedCategories.map((cat) => {
                      const selectedSubcats = cat.subcategories.filter(s => s.included);
                      const isOpen = openDropdownCategoryId === cat.category_id;

                      return (
                        <div key={cat.category_id} className="space-y-2 relative">
                          {/* Category Header */}
                          <h3 className="text-lg font-black text-emerald-800 tracking-tight">
                            {cat.category_name}
                          </h3>
                          
                          {/* Sub-Category Label */}
                          <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                            Sub-Category
                          </label>

                          {/* Multiselect Box */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownCategoryId(isOpen ? null : cat.category_id);
                            }}
                            className="min-h-[50px] bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2 flex flex-wrap gap-2 items-center cursor-pointer select-none transition-all focus-within:ring-2 focus-within:ring-violet-500/20"
                          >
                            {selectedSubcats.length === 0 ? (
                              <span className="text-sm text-slate-400 pl-2">Select subcategories...</span>
                            ) : (
                              selectedSubcats.map((sub) => (
                                <span
                                  key={sub.subcategory_id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleInclude(sub.subcategory_id);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
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
                                    handleToggleInclude(sub.subcategory_id);
                                  }}
                                  className={`px-4 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50 flex items-center justify-between ${
                                    sub.included ? 'text-violet-600 bg-violet-50/50' : 'text-slate-700'
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
                  {subcategoryCards.filter(c => c.included).map((card) => {
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
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-[16px] p-6 space-y-6 transition-all duration-300 hover:shadow-md animate-in fade-in duration-300"
                      >
                        {/* Card Header */}
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-lg font-extrabold text-emerald-800 tracking-tight">
                            {card.subcategory_name}
                          </h3>
                        </div>

                        {/* 3-Column Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* 1. Variation Dropdown */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              Variation
                            </label>
                            <select
                              value={card.selected_variation_id}
                              onChange={(e) => handleSelectVariation(card.subcategory_id, e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-semibold text-slate-800 cursor-pointer"
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
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              No. of Services
                            </label>
                            <input
                              type="text"
                              disabled
                              value={selectedVar ? selectedVar.number_of_sr || '0' : ''}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                            />
                          </div>

                          {/* 3. Scheduled Every */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              Scheduled Every
                            </label>
                            <input
                              type="text"
                              disabled
                              value={selectedVar ? `Every ${selectedVar.schedule_after_days || '1'} Days` : ''}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                            />
                          </div>

                          {/* 4. Expected Waste Per Day */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
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
                              className={`w-full border rounded-lg py-2.5 px-3 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${
                                selectedVar 
                                  ? 'bg-white border-slate-200 focus:ring-purple-100 focus:border-purple-400' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            />
                          </div>

                          {/* 5. Agreed Price - Editable */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
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
                                className={`w-full border rounded-lg py-2.5 pl-3 pr-12 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${
                                  selectedVar 
                                    ? 'bg-white border-slate-200 focus:ring-purple-100 focus:border-purple-400' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹/KG</span>
                            </div>
                          </div>

                          {/* 6. Suggested Price */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              Suggested Price
                            </label>
                            <input
                              type="text"
                              disabled
                              value={selectedVar ? `₹${selectedVar.per_kg_price || '0'}/KG` : ''}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                            />
                          </div>

                        </div>

                        {/* Live Calculations Section */}
                        {selectedVar && expectedDaily > 0 && (
                          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Estimates</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Waste</span>
                                <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{estMonthlyWaste.toFixed(2).replace(/\.00$/, '')} KG</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Yearly Waste</span>
                                <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{estYearlyWaste.toFixed(2).replace(/\.00$/, '')} KG</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Price</span>
                                <span className="font-extrabold text-purple-700 text-sm block mt-0.5">₹{estMonthlyPrice.toFixed(2).replace(/\.00$/, '')}</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Yearly Price</span>
                                <span className="font-extrabold text-purple-700 text-sm block mt-0.5">₹{estYearlyPrice.toFixed(2).replace(/\.00$/, '')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* SECTION 4: License Details */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-violet-500" /> Section 4: License Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered RWA</label>
                <input
                  type="text"
                  name="registered_rwa"
                  value={formData.registered_rwa}
                  onChange={handleInputChange}
                  placeholder="e.g. Green Valley Association"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
                <input
                  type="text"
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PAN Number</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trade License</label>
                <input
                  type="text"
                  name="trade_license"
                  value={formData.trade_license}
                  onChange={handleInputChange}
                  placeholder="e.g. TL-998877"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                />
              </div>

            </div>
          </div>

          {/* SECTION 5: Additional Details */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-violet-500" /> Section 5: Additional Details
            </h2>
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-700 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Pickup Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="pickup_time"
                      disabled
                      value={formData.pickup_time}
                      placeholder="Select a time slot card below..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Selectable Time Slot Cards */}
              {formData.pickup_date && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Available Time Slot *
                  </label>
                  {loadingSlots ? (
                    <div className="text-slate-400 text-xs flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading available time slots...
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-500" />
                      No active time slots are available for the selected date. Please choose another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {timeSlots.map((slot) => {
                        const isSelected = formData.time_slot_id == slot.id;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                time_slot_id: slot.id,
                                pickup_time: `${slot.start_time_formatted} - ${slot.end_time_formatted}`
                              }));
                            }}
                            className={`flex flex-col justify-center p-4 rounded-2xl border text-left transition-all duration-200 h-20 ${
                              isSelected
                                ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer text-slate-700'
                            }`}
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-sm block truncate max-w-[80%]">
                                  {slot.slot_name}
                                </span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-white bg-white'
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                                  )}
                                </div>
                              </div>
                              <span className={`text-[11px] font-bold block mt-1 ${isSelected ? 'text-violet-100' : 'text-slate-500'}`}>
                                {slot.start_time_formatted} - {slot.end_time_formatted}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup Notes</label>
                <textarea
                  name="pickup_notes"
                  value={formData.pickup_notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Provide instructions, landmarks, or special details for the driver..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
                />
              </div>

              {/* Upload Waste Images */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Waste Images (Multiple)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Image Add Box */}
                  <div className="relative h-28 border-2 border-dashed border-slate-200 hover:border-violet-400 transition-colors bg-slate-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center text-slate-400 p-2">
                    <ImageIcon className="w-7 h-7 mb-1 opacity-50 text-slate-400" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Previews */}
                  {filePreviews.map((url, idx) => (
                    <div key={idx} className="relative h-28 border border-slate-200 rounded-xl bg-slate-100 overflow-hidden">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-90 hover:opacity-100 shadow-md transition-all active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                </div>
              </div>

            </div>
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-violet-100 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Generating Request…' : 'Generate Request'}
            </button>
          </div>

      </form>

    </div>
  );
}

