import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, Save, X, Camera, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';

const InputField = ({ label, name, type="text", value, onChange, required=false, icon: Icon, placeholder="", disabled=false }) => (
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
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none py-2.5 pl-10 pr-4 rounded-xl text-sm text-slate-800 transition-all placeholder:text-slate-400 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed" 
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
        className="w-full bg-slate-50 border border-slate-200 focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none py-2.5 pl-10 pr-10 rounded-xl text-sm text-slate-800 transition-all appearance-none shadow-sm disabled:opacity-50 cursor-pointer"
      >
        <option value="">Choose {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

const DocumentPreview = ({ label, path, fieldName, selectedFile, onFileChange }) => {
  const [localPreview, setLocalPreview] = useState(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setLocalPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreview(null);
    }
  }, [selectedFile]);

  // Determine standard folder for files
  const folder = fieldName === 'profile_photo' ? 'Profile_Photo' : fieldName === 'pan_card_file' ? 'Pan_Card' : fieldName === 'aadhaar_card_file' ? 'Aadhaar_Card' : 'GST';
  const previewUrl = localPreview || (path ? `${IMAGE_BASE_URL}/${folder}/${path}` : null);
  
  // Detect if the file is PDF
  const isPDF = (selectedFile?.name?.toLowerCase().endsWith('.pdf')) || (!selectedFile && path?.toLowerCase().endsWith('.pdf'));

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-700">{label}</h3>
        {previewUrl && (
          <a 
            href={previewUrl}
            target="_blank" 
            rel="noreferrer"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline"
          >
            Open File
          </a>
        )}
      </div>
      <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-300 transition-all bg-white min-h-[140px] flex items-center justify-center">
        <input 
          type="file" 
          name={fieldName}
          onChange={onFileChange}
          accept="image/*,.pdf"
          className="absolute inset-0 opacity-0 cursor-pointer z-20"
        />
        
        {previewUrl ? (
          <div className="w-full h-full p-2 flex flex-col items-center justify-center z-10">
            {isPDF ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-200">
                  <span className="font-extrabold text-[10px] tracking-tight">PDF</span>
                </div>
                <p className="text-xs font-bold text-slate-600 truncate max-w-[180px] px-2 text-center">
                  {selectedFile ? selectedFile.name : path}
                </p>
                <span className="text-[10px] text-indigo-500 font-semibold group-hover:underline">Click to change</span>
              </div>
            ) : (
              <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 border border-slate-100 group-hover:opacity-75 transition-opacity">
                <img 
                  src={previewUrl} 
                  alt={label} 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 pointer-events-none">
                  Replace File
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
            <CreditCard className="w-8 h-8 text-slate-300 mb-2 group-hover:text-purple-400 transition-colors" />
            <p className="text-xs font-medium text-slate-500">Drag & drop or <span className="text-purple-600">browse</span></p>
            <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value, icon: Icon }) => (
  <div className="mb-5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      {label}
    </label>
    <div className="relative flex items-center">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pl-3.5 pointer-events-none text-emerald-600">
        <Icon className="w-4 h-4" />
      </div>
      <input 
        type="text" 
        value={value || 'N/A'} 
        readOnly 
        disabled
        className="w-full bg-slate-100/90 border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl text-sm font-bold text-slate-800 shadow-sm cursor-not-allowed select-none" 
      />
    </div>
  </div>
);

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  
  // BWG Mappings dropdowns
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    corporation_id: '', zone_id: '', ward_id: '',
    company_type: '', pan_number: '', aadhaar_number: ''
  });

  const [fileData, setFileData] = useState({
    profile_photo: null, pan_card_file: null, aadhaar_card_file: null
  });

  useEffect(() => {
    if (fileData.profile_photo) {
      const url = URL.createObjectURL(fileData.profile_photo);
      setProfilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProfilePreview(null);
    }
  }, [fileData.profile_photo]);

  useEffect(() => {
    fetchProfile();
    fetchCorporations();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      const user = res.data.user;
      if (user) {
        setUserData(user);
        
        // Pre-fetch dependent location options based on current user mapping
        if (user.corporation_id) {
          await fetchZones(user.corporation_id);
        }
        if (user.zone_id) {
          await fetchWards(user.zone_id);
        }

        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          corporation_id: user.corporation_id || '',
          zone_id: user.zone_id || '',
          ward_id: user.ward_id || '',
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

  const fetchCorporations = async () => {
    try {
      const res = await api.get('/corporations?limit=1000&status=Active');
      setCorporations(res.data.corporations || []);
    } catch (err) {
      console.error('Failed to fetch corporations', err);
    }
  };

  const fetchZones = async (corpId) => {
    try {
      const res = await api.get(`/corporations/${corpId}/zones`);
      setZones(res.data.zones || []);
    } catch (err) {
      console.error('Failed to fetch zones', err);
    }
  };

  const fetchWards = async (zoneId) => {
    try {
      const res = await api.get(`/zones/${zoneId}/wards`);
      setWards(res.data.wards || []);
    } catch (err) {
      console.error('Failed to fetch wards', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData({ ...fileData, [e.target.name]: file });
      toast.success(`${e.target.name.replace(/_file|_photo/g, '').replace('_', ' ').toUpperCase()} selected`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'corporation_id' || key === 'zone_id' || key === 'ward_id') {
        payload.append(key, formData[key] === null ? '' : formData[key]);
      } else if (formData[key] !== '' && formData[key] !== null) {
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
      
      // Update local storage user details
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

  const avatarSrc = profilePreview || (userData.profile_photo ? `${IMAGE_BASE_URL.replace('/uploads', '')}/uploads/Profile_Photo/${userData.profile_photo}` : null);

  const corpName = userData.corporation?.corporation_name || userData.corporation_name || corporations.find(c => String(c.id) === String(formData.corporation_id))?.corporation_name || (formData.corporation_id ? `Corporation #${formData.corporation_id}` : 'N/A');

  const zoneName = userData.zone?.zone_name || userData.zone_name || zones.find(z => String(z.id) === String(formData.zone_id))?.zone_name || (formData.zone_id ? `Zone #${formData.zone_id}` : 'N/A');

  const wardName = userData.ward?.ward_name || userData.ward_name || wards.find(w => String(w.id) === String(formData.ward_id))?.ward_name || (formData.ward_id ? `Ward #${formData.ward_id}` : 'N/A');

  return (
    <div className="w-full pb-12 px-0 font-sans">
      {/* Header Profile Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-40 bg-slate-100"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-20 flex flex-col md:flex-row md:items-end md:space-x-6">
            <div className="relative group inline-block">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 sm:border-8 border-white bg-slate-100 shadow-2xl overflow-hidden relative group">
                {avatarSrc ? (
                  <img 
                    src={avatarSrc} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600 text-5xl font-black">
                    {userData.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white z-10">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-[11px] font-bold">Change Photo</span>
                  <input 
                    type="file" 
                    name="profile_photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Floating Camera Button Badge */}
              <label 
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#7c3aed] text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-purple-700 hover:scale-110 transition-all z-20"
                title="Upload Profile Photo"
              >
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  name="profile_photo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
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
                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required icon={Mail} disabled={true} />
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
                <InputField label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} icon={CreditCard} />
                <InputField label="Aadhaar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} icon={CreditCard} />
              </div>
            </div>

            {/* Location context (BWG Mapping) */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center mb-8 pb-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mr-4">
                  <MapPin className="text-emerald-600 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Location Context</h2>
                  <p className="text-xs font-medium text-slate-400">Where you are mapped (Read-Only System Mapping)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                <ReadOnlyField label="Corporation" value={corpName} icon={MapPin} />
                <ReadOnlyField label="Zone" value={zoneName} icon={MapPin} />
                <ReadOnlyField label="Ward" value={wardName} icon={MapPin} />
              </div>
            </div>
          </div>

          {/* Right Column: Documents & Actions */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Verification Files</h2>
              <div className="space-y-6">
                <DocumentPreview label="Pan Card" path={userData.pan_card_file} fieldName="pan_card_file" selectedFile={fileData.pan_card_file} onFileChange={handleFileChange} />
                <DocumentPreview label="Aadhaar Card" path={userData.aadhaar_card_file} fieldName="aadhaar_card_file" selectedFile={fileData.aadhaar_card_file} onFileChange={handleFileChange} />
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
