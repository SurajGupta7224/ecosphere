import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, Save, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';

const InputField = ({ label, name, type="text", value, onChange, required=false, icon: Icon }) => (
  <div className="mb-5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-[#7c3aed] transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <input 
        type={type} 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        required={required}
        className="w-full bg-slate-50 border border-slate-200 focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none py-2.5 pl-10 pr-4 rounded-xl text-sm text-slate-800 transition-all placeholder:text-slate-400 shadow-sm" 
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required=false, disabled=false, icon: Icon }) => (
  <div className="mb-5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-[#7c3aed] transition-colors z-10">
        <Icon className="w-4 h-4" />
      </div>
      <select 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        required={required}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none py-2.5 pl-10 pr-4 rounded-xl text-sm text-slate-800 transition-all appearance-none shadow-sm disabled:opacity-50"
      >
        <option value="">Choose {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const DocumentPreview = ({ label, path, fieldName, onFileChange }) => (
  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold text-slate-700">{label}</h3>
      {path && (
        <a 
          href={`${IMAGE_BASE_URL}/${fieldName === 'profile_photo' ? 'Profile_Photo' : fieldName === 'pan_card_file' ? 'Pan_Card' : fieldName === 'aadhaar_card_file' ? 'Aadhaar_Card' : 'GST'}/${path}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline"
        >
          View Existing
        </a>
      )}
    </div>
    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-300 transition-colors bg-white">
      <input 
        type="file" 
        name={fieldName}
        onChange={onFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <CreditCard className="w-8 h-8 text-slate-300 mb-2 group-hover:text-purple-400 transition-colors" />
        <p className="text-xs font-medium text-slate-500">Drag & drop or <span className="text-purple-600">browse</span></p>
        <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
      </div>
    </div>
  </div>
);

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    pincode: '', country_id: '', state_id: '', city_id: '',
    company_type: '', pan_number: '', aadhaar_number: ''
  });

  const [fileData, setFileData] = useState({
    profile_photo: null, pan_card_file: null, aadhaar_card_file: null
  });

  useEffect(() => {
    fetchProfile();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.country_id) fetchStates(formData.country_id);
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) fetchCities(formData.state_id);
  }, [formData.state_id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      const user = res.data.user;
      if (user) {
        setUserData(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          pincode: '',
          country_id: user.country_id || '',
          state_id: user.state_id || '',
          city_id: user.city_id || '',
          company_type: user.company_type || '',
          pan_number: user.pan_number || '',
          aadhaar_number: user.aadhaar_number || ''
        });
      } else {
        toast.error('User data not found');
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await api.get('/locations/countries');
      setCountries(res.data.countries || []);
    } catch (err) {}
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await api.get(`/locations/states/${countryId}`);
      setStates(res.data.states || []);
    } catch (err) {}
  };

  const fetchCities = async (stateId) => {
    try {
      const res = await api.get(`/locations/cities/${stateId}`);
      setCities(res.data.cities || []);
    } catch (err) {}
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePincodeChange = async (e) => {
    const code = e.target.value;
    setFormData(prev => ({ ...prev, pincode: code }));
    
    if (code.length === 6) {
      try {
        const res = await api.get(`/locations/pincode/${code}`);
        if (res.data.results) {
          const results = res.data.results;
          if (results.length === 1) {
            const { country_id, state_id, city_id } = results[0];
            setFormData(prev => ({ ...prev, country_id, state_id, city_id }));
            toast.success("Location auto-filled successfully");
            setShowSuggestions(false);
          } else {
            setPincodeSuggestions(results);
            setShowSuggestions(true);
            toast.success(`${results.length} areas found for this pincode`);
          }
        }
      } catch (err) {
        toast.error("Invalid Pincode or not found in system");
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectPincodeResult = (res) => {
    setFormData(prev => ({ 
      ...prev, 
      country_id: res.country_id, 
      state_id: res.state_id, 
      city_id: res.city_id 
    }));
    setShowSuggestions(false);
    toast.success(`Selected: ${res.city?.city_name || 'Area'}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData({ ...fileData, [e.target.name]: file });
      toast.success(`${e.target.name.replace('_', ' ')} selected`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    Object.keys(fileData).forEach(key => {
      if (fileData[key]) {
        payload.append(key, fileData[key]);
      }
    });

    try {
      const res = await api.put('/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      
      // Update local storage user if needed
      const currentLocalUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedLocalUser = { 
        ...currentLocalUser, 
        name: res.data.user.name, 
        email: res.data.user.email,
        profile_photo: res.data.user.profile_photo,
        profile_status: res.data.user.profile_status
      };
      localStorage.setItem('user', JSON.stringify(updatedLocalUser));
      
      fetchProfile();
      // Reload page to reflect header changes
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">We couldn't load your profile data. Please try logging in again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 px-0">
      {/* Header Profile Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-40 bg-slate-100"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-20 flex flex-col md:flex-row md:items-end md:space-x-6">
            <div className="relative group inline-block">
              <div className="w-40 h-40 rounded-3xl border-8 border-white bg-slate-100 shadow-2xl overflow-hidden group">
                {userData.profile_photo ? (
                  <img 
                    src={`${IMAGE_BASE_URL}/Profile_Photo/${userData.profile_photo}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600 text-5xl font-black">
                    {userData.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white w-8 h-8" />
                  <input 
                    type="file" 
                    name="profile_photo"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 md:mb-4 flex-1">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{userData.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
                  {userData.role?.role_name}
                </span>
                <span className="flex items-center text-sm font-medium text-slate-500">
                  <Mail className="w-4 h-4 mr-1.5" /> {userData.email}
                </span>
                <span className="flex items-center text-sm font-medium text-slate-500">
                  <Phone className="w-4 h-4 mr-1.5" /> {userData.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center mb-8 pb-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mr-4">
                  <User className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Personal Details</h2>
                  <p className="text-xs font-medium text-slate-400">Your basic identity information</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required icon={User} />
                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required icon={Mail} />
                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required icon={Phone} />
                <InputField label="New Password" name="password" type="password" value={formData.password} onChange={handleInputChange} icon={CreditCard} placeholder="Keep blank to stay same" />
              </div>
            </div>

            {/* Business/Professional */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center mb-8 pb-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mr-4">
                  <Building className="text-indigo-600 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Business Information</h2>
                  <p className="text-xs font-medium text-slate-400">Details about your professional status</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <SelectField 
                  label="Company Type" name="company_type" value={formData.company_type} onChange={handleInputChange} icon={Building}
                  options={[
                    { value: 'Individual', label: 'Individual' },
                    { value: 'Sole Proprietor', label: 'Sole Proprietor' },
                    { value: 'Private Limited', label: 'Private Limited' },
                    { value: 'Partnership', label: 'Partnership' }
                  ]}
                />
                <InputField label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} icon={CreditCard} />
                <InputField label="Aadhaar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} icon={CreditCard} />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center mb-8 pb-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mr-4">
                  <MapPin className="text-emerald-600 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Location Context</h2>
                  <p className="text-xs font-medium text-slate-400">Where you are located</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div className="relative">
                  <InputField label="Pincode" name="pincode" value={formData.pincode || ''} onChange={handlePincodeChange} icon={MapPin} />
                  {showSuggestions && pincodeSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl mt-[-15px] max-h-48 overflow-y-auto">
                      {pincodeSuggestions.map((res, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => selectPincodeResult(res)}
                          className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-800">
                            {res.pincode} - {res.city?.area}, {res.city?.city_name}, {res.city?.district}, {res.city?.region}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tight">
                            {res.state?.state_name} • {res.country?.country_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <SelectField 
                  label="Country" name="country_id" value={formData.country_id} onChange={handleInputChange} icon={MapPin} disabled
                  options={countries.map(c => ({ value: c.id, label: c.country_name }))} 
                />
                <SelectField 
                  label="State" name="state_id" value={formData.state_id} onChange={handleInputChange} icon={MapPin} disabled
                  options={states.map(s => ({ value: s.id, label: s.state_name }))} 
                />
                <SelectField 
                  label="City" name="city_id" value={formData.city_id} onChange={handleInputChange} icon={MapPin} disabled
                  options={cities.map(c => ({ value: c.id, label: c.city_name }))} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Documents & Actions */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Verification Files</h2>
              <div className="space-y-6">
                <DocumentPreview label="Pan Card" path={userData.pan_card_file} fieldName="pan_card_file" onFileChange={handleFileChange} />
                <DocumentPreview label="Aadhaar Card" path={userData.aadhaar_card_file} fieldName="aadhaar_card_file" onFileChange={handleFileChange} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-4 rounded-3xl bg-[#7c3aed] hover:bg-purple-700 text-white font-bold shadow-xl shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
