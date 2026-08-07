import { useState, useEffect, useRef } from 'react';
import {
    Search,
    User,
    Phone,
    Mail,
    MapPin,
    Building,
    ShieldCheck,
    ClipboardCheck,
    FileText,
    Image as ImageIcon,
    ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';


/**
 * Customer Registration
 * Fields pulled ONLY from Sections 2 (Customer Details), 3 (License Details),
 * 4 (Location Details – B2C path) and 5 (Service Details / Expected Waste)
 * of WasteCollectionRequests.jsx. Palette (violet/slate/white cards) matches
 * that file; layout/spacing follows the original registration screenshot
 * (stacked full-width section cards with a header + footer).
 */
export default function CustomerRegistration() {
    const [formData, setFormData] = useState({
        // Section 2: Customer Details
        customer_type: '',
        contact_person: '',
        mobile_number: '',
        email: '',

        // Section 3: License Details
        registered_rwa: '',
        gst: '',
        pan: '',
        trade_license: '',

        // Section 4: Location Details
        address_search: '',
        latitude: '',
        longitude: '',
        waste_generator_name: '',
        area_sqm: '',
        no_of_dwelling_units: '',
        complete_address: '',
    });

    // Section 3 file uploads
    const [rwaFile, setRwaFile] = useState(null);
    const [gstFile, setGstFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [tradeLicenseFile, setTradeLicenseFile] = useState(null);

    // Section 5: subcategory-based expected waste
    const [subcategoryCards, setSubcategoryCards] = useState([]);
    const [openDropdownCategoryId, setOpenDropdownCategoryId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Google Map refs (Section 4)
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const mapDivRef = useRef(null);

    // ── Load Google Maps script ──────────────────────────────────────────
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

    // ── Init map ──────────────────────────────────────────────────────────
    useEffect(() => {
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
            });
            mapInstanceRef.current = map;

            const marker = new window.google.maps.Marker({
                map,
                position: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
                draggable: true,
                animation: window.google.maps.Animation.DROP,
                title: 'Drag to adjust location',
            });
            markerRef.current = marker;

            marker.addListener('dragend', () => {
                const pos = marker.getPosition();
                const lat = pos.lat().toFixed(6);
                const lng = pos.lng().toFixed(6);

                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: pos }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        setFormData((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            complete_address: results[0].formatted_address,
                            address_search: results[0].formatted_address,
                        }));
                    } else {
                        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                    }
                });
            });
        };

        const waitForGoogle = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setTimeout(initMap, 50);
            } else {
                setTimeout(waitForGoogle, 100);
            }
        };
        waitForGoogle();
    }, []);

    // ── Bind Autocomplete to the address search input ────────────────────
    useEffect(() => {
        let autocompleteInstance = null;

        const setupAutocomplete = () => {
            const searchInput = document.getElementById('mapSearchInput');
            if (!searchInput || !window.google?.maps?.places) return;

            const autocomplete = new window.google.maps.places.Autocomplete(searchInput, {
                types: ['geocode', 'establishment'],
            });
            autocompleteInstance = autocomplete;

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat().toFixed(6);
                    const lng = place.geometry.location.lng().toFixed(6);
                    const addr = place.formatted_address || '';
                    const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };

                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setCenter(newPos);
                        mapInstanceRef.current.setZoom(16);
                    }
                    if (markerRef.current) {
                        markerRef.current.setPosition(newPos);
                    }

                    setFormData((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        complete_address: addr,
                        address_search: addr,
                    }));
                }
            });
        };

        const interval = setInterval(() => {
            const searchInput = document.getElementById('mapSearchInput');
            if (searchInput && window.google?.maps?.places) {
                setupAutocomplete();
                clearInterval(interval);
            }
        }, 100);

        return () => {
            clearInterval(interval);
            if (autocompleteInstance) {
                window.google.maps.event.clearInstanceListeners(autocompleteInstance);
            }
        };
    }, []);

    // ── Fetch waste subcategories (Section 5) ─────────────────────────────
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const res = await api.get('/sub-categories', { params: { limit: 200, status: 1 } });
                const allSubCats = res.data.subCategories || [];
                const cards = allSubCats.map((sc) => ({
                    subcategory_id: sc.id,
                    subcategory_name: sc.name,
                    category_name: sc.category?.name || 'Waste Category',
                    category_id: sc.category_id,
                    variations: sc.variations || [],
                    selected_variation_id: '',
                    expected_waste: '',
                    custom_price: '',
                    included: false,
                }));
                setSubcategoryCards(cards);
            } catch (err) {
                console.error('Failed to load subcategories:', err);
                toast.error('Failed to load waste subcategories.');
            }
        };
        fetchSubCategories();
    }, []);

    // ── Close subcategory dropdown on click outside ───────────────────────
    useEffect(() => {
        const handleCloseDropdown = () => setOpenDropdownCategoryId(null);
        window.addEventListener('click', handleCloseDropdown);
        return () => window.removeEventListener('click', handleCloseDropdown);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile_number') {
            setFormData((prev) => ({ ...prev, mobile_number: value.replace(/\D/g, '').slice(0, 10) }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggleInclude = (subcatId) => {
        setSubcategoryCards((prev) =>
            prev.map((card) => {
                if (card.subcategory_id === subcatId) {
                    const nextIncluded = !card.included;
                    const defaultVar = card.variations?.[0] || null;
                    return {
                        ...card,
                        included: nextIncluded,
                        selected_variation_id: nextIncluded
                            ? card.selected_variation_id || (defaultVar ? defaultVar.id : '')
                            : '',
                        custom_price: nextIncluded
                            ? card.custom_price || (defaultVar ? defaultVar.per_kg_price?.toString() || '' : '')
                            : '',
                        expected_waste: nextIncluded ? card.expected_waste : '',
                    };
                }
                return card;
            })
        );
    };

    const handleSelectVariation = (subcatId, varId) => {
        setSubcategoryCards((prev) =>
            prev.map((card) => {
                if (card.subcategory_id === subcatId) {
                    const numericVarId = varId ? Number(varId) : '';
                    const selectedVar = (card.variations || []).find((v) => v.id == numericVarId) || null;
                    return {
                        ...card,
                        selected_variation_id: numericVarId,
                        custom_price: selectedVar ? selectedVar.per_kg_price?.toString() || '' : '',
                    };
                }
                return card;
            })
        );
    };

    const handleCardWasteChange = (subcatId, val) => {
        setSubcategoryCards((prev) =>
            prev.map((card) => (card.subcategory_id === subcatId ? { ...card, expected_waste: val } : card))
        );
    };

    const renderDocumentUploadField = (file, setFile, title, containerId) => {
        const isImage = file && (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name));
        const previewUrl = file ? URL.createObjectURL(file) : '';

        return (
            <div
                id={containerId}
                className="relative w-full h-32 border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden group transition-all"
            >
                {file ? (
                    <div className="w-full h-full relative">
                        {isImage ? (
                            <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
                                <FileText className="w-8 h-8 text-violet-500 mb-1" />
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[90%]">
                                    {file.name}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.open(previewUrl, '_blank')}
                                className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg font-bold text-xs shadow-md"
                            >
                                View
                            </button>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-md"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all flex flex-col items-center justify-center cursor-pointer text-slate-400 p-4">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-xs font-bold text-slate-500">{title}</span>
                        <span className="text-[10px] text-slate-400 mt-1">Image or PDF (Max 5MB)</span>
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                )}
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== '' && value !== null) payload.append(key, value);
            });
            if (rwaFile) payload.append('rwa_file', rwaFile);
            if (gstFile) payload.append('gst_file', gstFile);
            if (panFile) payload.append('pan_file', panFile);
            if (tradeLicenseFile) payload.append('trade_license_file', tradeLicenseFile);

            const activeCards = subcategoryCards.filter((c) => c.included);
            const subcategoriesData = activeCards.map((card) => ({
                category_id: card.category_id,
                subcategory_id: card.subcategory_id,
                variation_id: card.selected_variation_id,
                expected_waste: parseFloat(card.expected_waste) || 0,
                custom_price: parseFloat(card.custom_price) || 0,
            }));
            payload.append('subcategories', JSON.stringify(subcategoriesData));

            await api.post('/customers/register', payload);
            toast.success('Registration submitted successfully.');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Group subcategories by category for Section 5
    const categoriesMap = {};
    subcategoryCards.forEach((card) => {
        if (!categoriesMap[card.category_id]) {
            categoriesMap[card.category_id] = {
                category_id: card.category_id,
                category_name: card.category_name,
                subcategories: [],
            };
        }
        categoriesMap[card.category_id].subcategories.push(card);
    });
    const groupedCategories = Object.values(categoriesMap);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6 text-violet-600" />
                        Let&rsquo;s Get You Started
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">Fill in the details to complete your registration.</p>
                </div>
                <a href="/" className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm">
                    <ArrowLeft size={16} />
                    Home
                </a>
            </header>

            <form onSubmit={handleSubmit} noValidate className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-6">

                {/* Section 2: Customer Details */}
                <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <User className="w-5 h-5 text-violet-500" /> Customer Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Customer Type *
                            </label>
                            <select
                                name="customer_type"
                                value={formData.customer_type}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                            >
                                <option value="" disabled hidden>Select Option</option>
                                <option value="Individual">Individual</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Residential">Residential</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Contact Person *
                            </label>
                            <input
                                type="text"
                                name="contact_person"
                                required
                                value={formData.contact_person}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Mobile Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    name="mobile_number"
                                    required
                                    value={formData.mobile_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter 10-digit number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="example@mail.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: License Details */}
                <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ShieldCheck className="w-5 h-5 text-violet-500" /> License Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Registered RWA
                            </label>
                            <input
                                type="text"
                                name="registered_rwa"
                                value={formData.registered_rwa}
                                onChange={handleInputChange}
                                placeholder="e.g. Green Valley Association"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                            />
                            {renderDocumentUploadField(rwaFile, setRwaFile, 'Upload RWA Proof', 'rwa_file_upload')}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                GST Number
                            </label>
                            <input
                                type="text"
                                name="gst"
                                value={formData.gst}
                                onChange={handleInputChange}
                                placeholder="e.g. 07AAAAA1111A1Z1"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                            />
                            {renderDocumentUploadField(gstFile, setGstFile, 'Upload GST Certificate', 'gst_file_upload')}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                PAN Number
                            </label>
                            <input
                                type="text"
                                name="pan"
                                value={formData.pan}
                                onChange={handleInputChange}
                                placeholder="e.g. ABCDE1234F"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                            />
                            {renderDocumentUploadField(panFile, setPanFile, 'Upload PAN Copy', 'pan_file_upload')}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Trade License
                            </label>
                            <input
                                type="text"
                                name="trade_license"
                                value={formData.trade_license}
                                onChange={handleInputChange}
                                placeholder="e.g. TL-998877"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                            />
                            {renderDocumentUploadField(tradeLicenseFile, setTradeLicenseFile, 'Upload Trade License', 'trade_file_upload')}
                        </div>
                    </div>
                </div>

                {/* Section 4: Location Details */}
                <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Building className="w-5 h-5 text-violet-500" /> Location Details
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Address Search *
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    id="mapSearchInput"
                                    name="address_search"
                                    required
                                    value={formData.address_search}
                                    onChange={handleInputChange}
                                    placeholder="Search locations using Google..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Latitude *
                                </label>
                                <input
                                    type="text"
                                    name="latitude"
                                    required
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 28.7041"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Longitude *
                                </label>
                                <input
                                    type="text"
                                    name="longitude"
                                    required
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 77.1025"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                            <div ref={mapDivRef} id="propertyMap" style={{ height: '300px', width: '100%' }} />
                            {!formData.latitude && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 pointer-events-none">
                                    <div className="text-center">
                                        <MapPin className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-500">
                                            Search an address above to pin the location
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    BWG Name (Waste Generator) *
                                </label>
                                <input
                                    type="text"
                                    name="waste_generator_name"
                                    required
                                    value={formData.waste_generator_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Smart Bazar"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-medium text-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Area (SqM)
                                    </label>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Flats
                                    </label>
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
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Complete Address *
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                                <textarea
                                    name="complete_address"
                                    required
                                    rows="3"
                                    value={formData.complete_address}
                                    onChange={handleInputChange}
                                    placeholder="Enter complete detailed street address..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Service Details / Expected Waste (KG) */}
                <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <ClipboardCheck className="w-5 h-5 text-violet-500" /> Service Details / Expected Waste (KG)
                    </h2>

                    {subcategoryCards.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            Loading waste categories...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-6 pb-6 border-b border-slate-100">
                                {groupedCategories.map((cat) => {
                                    const selectedSubcats = cat.subcategories.filter((s) => s.included);
                                    const isOpen = openDropdownCategoryId === cat.category_id;

                                    return (
                                        <div key={cat.category_id} className="space-y-2 relative">
                                            <h3 className="text-base font-black text-violet-800 tracking-tight">
                                                {cat.category_name}
                                            </h3>
                                            <label className="block text-xs font-bold text-slate-700 mt-2 mb-1">
                                                Sub-Category
                                            </label>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownCategoryId(isOpen ? null : cat.category_id);
                                                }}
                                                className="min-h-[50px] bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2 flex flex-wrap gap-2 items-center cursor-pointer select-none transition-all focus-within:ring-2 focus-within:ring-violet-500/20"
                                            >
                                                {selectedSubcats.length === 0 ? (
                                                    <span className="text-sm text-slate-400 pl-2">
                                                        Select subcategories...
                                                    </span>
                                                ) : (
                                                    selectedSubcats.map((sub) => (
                                                        <span
                                                            key={sub.subcategory_id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleInclude(sub.subcategory_id);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
                                                        >
                                                            <span className="font-bold">×</span>
                                                            {sub.subcategory_name}
                                                        </span>
                                                    ))
                                                )}
                                            </div>

                                            {isOpen && (
                                                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1.5">
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
                                                            {sub.included && <span className="text-violet-600 font-bold">✓</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {subcategoryCards
                                .filter((c) => c.included)
                                .map((card) => {
                                    const selectedVar =
                                        (card.variations || []).find((v) => v.id == card.selected_variation_id) || null;
                                    const expectedDaily = parseFloat(card.expected_waste) || 0;
                                    const defaultVarPrice = selectedVar ? parseFloat(selectedVar.per_kg_price || 0) : 0;
                                    const customPriceVal = parseFloat(card.custom_price);
                                    const finalPrice =
                                        !isNaN(customPriceVal) && customPriceVal >= 0 && card.custom_price !== ''
                                            ? customPriceVal
                                            : defaultVarPrice;
                                    const estMonthlyWaste = expectedDaily * 30;
                                    const estMonthlyPrice = estMonthlyWaste * finalPrice;

                                    return (
                                        <div
                                            key={card.subcategory_id}
                                            className="bg-white border border-slate-200 hover:border-slate-300 rounded-[16px] p-6 space-y-6 transition-all"
                                        >
                                            <div className="border-b border-slate-100 pb-3">
                                                <h3 className="text-base font-extrabold text-violet-800 tracking-tight">
                                                    {card.subcategory_name}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-slate-700">Variation</label>
                                                    <select
                                                        value={card.selected_variation_id}
                                                        onChange={(e) => handleSelectVariation(card.subcategory_id, e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold text-slate-800 cursor-pointer"
                                                    >
                                                        <option value="">-Select Type-</option>
                                                        {(card.variations || []).map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.variation_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-slate-700">
                                                        Expected Waste (KG/Day) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="any"
                                                        required
                                                        disabled={!selectedVar}
                                                        value={card.expected_waste}
                                                        onChange={(e) => handleCardWasteChange(card.subcategory_id, e.target.value)}
                                                        placeholder="Enter waste in KG per day"
                                                        className={`w-full border rounded-lg py-2.5 px-3 outline-none focus:ring-4 transition-all text-sm font-semibold text-slate-800 ${
                                                            selectedVar
                                                                ? 'bg-white border-slate-200 focus:ring-violet-100 focus:border-violet-400'
                                                                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-slate-700">Suggested Price</label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={selectedVar ? `₹${selectedVar.per_kg_price || '0'}/KG` : ''}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            {selectedVar && expectedDaily > 0 && (
                                                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                                            Monthly Waste
                                                        </span>
                                                        <span className="font-extrabold text-slate-800 text-sm block mt-0.5">
                                                            {estMonthlyWaste.toFixed(2).replace(/\.00$/, '')} KG
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                                            Est. Monthly Price
                                                        </span>
                                                        <span className="font-extrabold text-violet-700 text-sm block mt-0.5">
                                                            ₹{estMonthlyPrice.toFixed(2).replace(/\.00$/, '')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-10 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-violet-100 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>

            <footer className="text-center text-xs text-slate-400 py-6">
                <p>© Ecosphere Waste Solutions - A subsidiary of Mukka Proteins Ltd. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
