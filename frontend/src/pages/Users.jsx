import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users as UsersIcon, Send, RotateCcw, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';

const InputField = ({ label, name, type="text", value, onChange, required=false, placeholder="", error }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  let autoCompleteVal = "on";
  if (isPassword) {
    autoCompleteVal = "new-password";
  } else if (name === "email") {
    autoCompleteVal = "email";
  } else if (name === "phone") {
    autoCompleteVal = "tel";
  } else if (name === "name") {
    autoCompleteVal = "name";
  } else if (name === "pan_number" || name === "aadhaar_number") {
    autoCompleteVal = "off";
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label} {required && <span className="text-[#7c3aed]">*</span>}
      </label>
      <div className="relative">
        <input 
          type={inputType} 
          name={name} 
          value={value} 
          onChange={onChange} 
          required={required}
          placeholder={placeholder}
          autoComplete={autoCompleteVal}
          className={`w-full bg-transparent border-b outline-none py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 ${
            isPassword ? 'pr-10' : ''
          } ${
            error 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-slate-200 focus:border-[#7c3aed]'
          }`} 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <span className="text-red-500 text-[10px] mt-1 block">{error}</span>}
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, required=false, disabled=false, placeholder="Choose", error }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-[#7c3aed]">*</span>}
    </label>
    <select 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      disabled={disabled}
      className={`w-full bg-transparent border-b outline-none py-2 text-sm text-slate-800 transition-colors disabled:opacity-50 appearance-none ${
        error 
          ? 'border-red-500 focus:border-red-500' 
          : 'border-slate-200 focus:border-[#7c3aed]'
      }`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="text-red-500 text-[10px] mt-1 block">{error}</span>}
  </div>
);

const FileField = ({ label, name, onChange, required=false, accept="image/*,.pdf", existingFile, onPreview }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-2">
      {label} {required && <span className="text-[#7c3aed]">*</span>}
    </label>
    <div className="flex items-center space-x-4">
      {existingFile && (
        <div className="relative group shrink-0">
          {existingFile.match(/\.(jpeg|jpg|png|gif)$/i) ? (
            <img 
              src={`${IMAGE_BASE_URL.replace('/uploads', '')}${existingFile}`} 
              alt="Preview" 
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-all hover:scale-105" 
              onClick={() => onPreview(`${IMAGE_BASE_URL.replace('/uploads', '')}${existingFile}`)}
            />
          ) : (
            <a href={`${IMAGE_BASE_URL.replace('/uploads', '')}${existingFile}`} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-[#7c3aed] transition-colors shadow-sm text-center px-1">
              VIEW DOC
            </a>
          )}
        </div>
      )}
      <div className="flex items-center">
        <label className="cursor-pointer">
          <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 text-xs rounded hover:bg-slate-50 transition-colors">
            {existingFile ? 'Change file' : 'Choose file'}
          </span>
          <input 
            type="file" 
            name={name} 
            onChange={onChange} 
            accept={accept} 
            className="hidden" 
          />
        </label>
        <span className="ml-3 text-xs text-slate-400">No file chosen</span>
      </div>
    </div>
  </div>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // BWG Mappings dropdowns
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // Add/Edit User State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('Individual'); // Individual, Sole Proprietor, Company
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role_id: 1,
    corporation_id: '', zone_id: '', ward_id: '',
    company_type: 'Individual', pan_number: '', aadhaar_number: '',
    status: 'active', profile_status: 'pending'
  });
  
  const [fileData, setFileData] = useState({
    profile_photo: null, pan_card_file: null, aadhaar_card_file: null
  });
  const [existingFiles, setExistingFiles] = useState({
    profile_photo: null, pan_card_file: null, aadhaar_card_file: null
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchCorporations();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      setRoles(response.data.roles || []);
      if (response.data.roles?.length > 0) {
        setFormData(prev => ({ ...prev, role_id: response.data.roles[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch roles', err);
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
    const { name, value } = e.target;
    let finalValue = value;
    
    // Auto-uppercase PAN number
    if (name === 'pan_number') {
      finalValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Clear validation error on change
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCorporationChange = async (e) => {
    const corpId = e.target.value;
    setFormData(prev => ({ ...prev, corporation_id: corpId, zone_id: '', ward_id: '' }));
    setZones([]);
    setWards([]);
    
    // Clear errors for corporation, zone, and ward
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.corporation_id;
      delete updated.zone_id;
      delete updated.ward_id;
      return updated;
    });

    if (corpId) {
      await fetchZones(corpId);
    }
  };

  const handleZoneChange = async (e) => {
    const zoneId = e.target.value;
    setFormData(prev => ({ ...prev, zone_id: zoneId, ward_id: '' }));
    setWards([]);
    
    // Clear errors for zone and ward
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.zone_id;
      delete updated.ward_id;
      return updated;
    });

    if (zoneId) {
      await fetchWards(zoneId);
    }
  };

  const handleFileChange = (e) => {
    setFileData({ ...fileData, [e.target.name]: e.target.files[0] });
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setFormData({ ...formData, company_type: tabName });
  };

  const openAddForm = () => {
    setIsEditMode(false);
    setActiveTab('Individual');
    setFormData({
      name: '', email: '', phone: '', password: '', role_id: roles[0]?.id || 1,
      corporation_id: '', zone_id: '', ward_id: '',
      company_type: 'Individual', pan_number: '', aadhaar_number: '',
      status: 'active', profile_status: 'pending'
    });
    setZones([]);
    setWards([]);
    setFileData({ profile_photo: null, pan_card_file: null, aadhaar_card_file: null });
    setExistingFiles({ profile_photo: null, pan_card_file: null, aadhaar_card_file: null });
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = async (user) => {
    setIsEditMode(true);
    setEditingId(user.id);
    const cType = user.company_type || 'Individual';
    setActiveTab(cType);
    
    // Load dependent zones and wards based on user mapping
    if (user.corporation_id) {
      await fetchZones(user.corporation_id);
    } else {
      setZones([]);
    }

    if (user.zone_id) {
      await fetchWards(user.zone_id);
    } else {
      setWards([]);
    }

    setFormData({
      name: user.name || '', email: user.email || '', phone: user.phone || '', 
      role_id: user.role_id || roles[0]?.id || 1,
      corporation_id: user.corporation_id || '',
      zone_id: user.zone_id || '',
      ward_id: user.ward_id || '',
      company_type: cType, 
      pan_number: user.pan_number || '', aadhaar_number: user.aadhaar_number || '',
      status: user.status || 'active', profile_status: user.profile_status || 'pending',
      password: '********' // Show dummy dots for existing password
    });
    setFileData({ profile_photo: null, pan_card_file: null, aadhaar_card_file: null });
    setExistingFiles({
      profile_photo: user.profile_photo ? (user.profile_photo.startsWith('/uploads/') ? user.profile_photo : `/uploads/Profile_Photo/${user.profile_photo}`) : null,
      pan_card_file: user.pan_card_file ? (user.pan_card_file.startsWith('/uploads/') ? user.pan_card_file : `/uploads/Pan_Card/${user.pan_card_file}`) : null,
      aadhaar_card_file: user.aadhaar_card_file ? (user.aadhaar_card_file.startsWith('/uploads/') ? user.aadhaar_card_file : `/uploads/Aadhaar_Card/${user.aadhaar_card_file}`) : null
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]{2,50}$/.test(formData.name.trim())) {
      newErrors.name = 'Name must be 2-50 characters and contain only letters';
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Password validation
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    } else {
      // In edit mode, check password only if it is typed and is not the dummy placeholder
      if (formData.password && formData.password !== '********' && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    }

    // PAN validation
    if (!formData.pan_number || !formData.pan_number.trim()) {
      newErrors.pan_number = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.trim().toUpperCase())) {
      newErrors.pan_number = 'Enter a valid PAN (e.g., ABCDE1234F)';
    }

    // Aadhaar validation
    if (!formData.aadhaar_number || !formData.aadhaar_number.trim()) {
      newErrors.aadhaar_number = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaar_number.trim())) {
      newErrors.aadhaar_number = 'Aadhar number must be exactly 12 digits';
    }

    // Corporation, Zone, Ward validation
    if (!formData.corporation_id) {
      newErrors.corporation_id = 'Corporation is required';
    }
    if (!formData.zone_id) {
      newErrors.zone_id = 'Zone is required';
    }
    if (!formData.ward_id) {
      newErrors.ward_id = 'Ward is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      // If editing and password is empty or placeholder '********', do not append password key to payload
      if (key === 'password' && isEditMode && (!formData.password || formData.password === '********')) {
        return;
      }
      if (formData[key] !== null && formData[key] !== '') {
        payload.append(key, formData[key]);
      }
    });

    Object.keys(fileData).forEach(key => {
      if (fileData[key]) {
        payload.append(key, fileData[key]);
      }
    });

    try {
      if (isEditMode) {
        await api.put(`/users/${editingId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("User updated successfully");
      } else {
        await api.post('/users', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("User created successfully");
      }
      
      closeForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      toast.success(`User marked as ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteModal.id}`);
      toast.success("User deleted successfully!");
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchUsers();
    } catch(err) {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.profile_status === filter;
  });

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="w-full">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit User' : 'Add User'}</h2>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <form onSubmit={handleSubmit} noValidate className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Name" error={errors.name} />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="Email" error={errors.email} />
                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone Number" error={errors.phone} />
                
                <SelectField 
                  label="System Role" name="role_id" value={formData.role_id} onChange={handleInputChange} required 
                  options={roles.map(r => ({ value: r.id, label: r.role_name }))} 
                  error={errors.role_id}
                />
                
                <InputField 
                  label="Password" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required={!isEditMode} 
                  placeholder={isEditMode ? "Leave blank to keep" : "Password"}
                  error={errors.password}
                />
                
                <SelectField 
                  label="Corporation" name="corporation_id" value={formData.corporation_id} onChange={handleCorporationChange} required placeholder="Select Corporation"
                  options={corporations.map(c => ({ value: c.id, label: c.corporation_name }))} 
                  error={errors.corporation_id}
                />
                <SelectField 
                  label="Zone" name="zone_id" value={formData.zone_id} onChange={handleZoneChange} required placeholder="Select Zone" disabled={!formData.corporation_id}
                  options={zones.map(z => ({ value: z.id, label: z.zone_name }))} 
                  error={errors.zone_id}
                />
                <SelectField 
                  label="Ward" name="ward_id" value={formData.ward_id} onChange={handleInputChange} required placeholder="Select Ward" disabled={!formData.zone_id}
                  options={wards.map(w => ({ value: w.id, label: w.ward_name }))} 
                  error={errors.ward_id}
                />
 
                <InputField label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} required placeholder="PAN Number" error={errors.pan_number} />
                <InputField label="Aadhar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required placeholder="Aadhar Number" error={errors.aadhaar_number} />
                
                <FileField label="Upload Photo" name="profile_photo" onChange={handleFileChange} existingFile={existingFiles.profile_photo} onPreview={setPreviewImage} />
                <FileField label="Upload Pan Card" name="pan_card_file" onChange={handleFileChange} existingFile={existingFiles.pan_card_file} onPreview={setPreviewImage} />
                <FileField label="Upload Aadhar Card" name="aadhaar_card_file" onChange={handleFileChange} existingFile={existingFiles.aadhaar_card_file} onPreview={setPreviewImage} />
                
                <SelectField 
                  label="Account Status" name="status" value={formData.status} onChange={handleInputChange} required 
                  options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]} 
                  error={errors.status}
                />
                <SelectField 
                  label="Profile Status" name="profile_status" value={formData.profile_status} onChange={handleInputChange} required 
                  options={[{value: 'pending', label: 'Pending'}, {value: 'approved', label: 'Approved'}, {value: 'rejected', label: 'Rejected'}]} 
                  error={errors.profile_status}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-10 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={openAddForm} // acting as reset
                  className="flex items-center px-6 py-2 rounded font-medium bg-slate-400 hover:bg-slate-500 text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center px-6 py-2 rounded font-medium bg-[#7c3aed] hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" /> {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
              <p className="text-slate-500 mt-1 text-sm">Manage system users, vendors, and their profiles.</p>
            </div>
            <button 
              onClick={openAddForm}
              className="flex items-center px-4 py-2 bg-[#7c3aed] hover:bg-purple-700 text-white rounded font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User / Vendor
            </button>
          </div>

          <div className="flex items-center space-x-2 mb-4 bg-white p-2 rounded-lg border border-slate-200 w-fit">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'all' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              All Users
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center ${filter === 'pending' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Pending Approval
              {users.filter(u => u.profile_status === 'pending').length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${filter === 'pending' ? 'bg-white text-[#7c3aed]' : 'bg-purple-100 text-[#7c3aed]'}`}>
                  {users.filter(u => u.profile_status === 'pending').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setFilter('approved')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'approved' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Approved
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading data...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="p-4">Profile</th>
                      <th className="p-4">Contact / Business</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((u) => (
                      <tr key={u.id} className={`hover:bg-slate-50 transition-colors group ${u.profile_status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {u.profile_photo ? (
                              <img 
                                src={`${IMAGE_BASE_URL.replace('/uploads', '')}${u.profile_photo.startsWith('/uploads/') ? u.profile_photo : '/uploads/Profile_Photo/' + u.profile_photo}`} 
                                alt="avatar" 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer hover:scale-110 transition-transform shadow-sm" 
                                onClick={() => setPreviewImage(`${IMAGE_BASE_URL.replace('/uploads', '')}${u.profile_photo.startsWith('/uploads/') ? u.profile_photo : '/uploads/Profile_Photo/' + u.profile_photo}`)}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold">
                                {u.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-slate-800 font-medium text-sm">{u.name}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="text-slate-600 truncate max-w-[200px]">{u.email}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {u.role?.role_name || 'User'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col space-y-1.5 items-start">
                            <button 
                              onClick={() => toggleStatus(u)}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${u.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                              {u.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                            {u.profile_status === 'pending' && <span className="text-[10px] uppercase text-yellow-600 font-bold tracking-wider">Pending</span>}
                            {u.profile_status === 'approved' && <span className="text-[10px] uppercase text-emerald-600 font-bold tracking-wider">Approved</span>}
                            {u.profile_status === 'rejected' && <span className="text-[10px] uppercase text-red-600 font-bold tracking-wider">Rejected</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button 
                            onClick={() => openEditForm(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-block"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(u.id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                              <UsersIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-600 font-medium text-lg">No users found</p>
                            <p className="text-slate-400 mt-1 text-sm">Get started by adding a new user.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && users.length > PAGE_SIZE && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-500">
                  Page {page} of {Math.ceil(users.length / PAGE_SIZE)} · {users.length} total users
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs rounded border border-slate-300 text-slate-600 disabled:opacity-40 hover:bg-white transition-colors bg-transparent"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(Math.ceil(users.length / PAGE_SIZE), p + 1))}
                    disabled={page === Math.ceil(users.length / PAGE_SIZE)}
                    className="px-3 py-1 text-xs rounded border border-slate-300 text-slate-600 disabled:opacity-40 hover:bg-white transition-colors bg-transparent"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Profile</h2>
              <p className="text-slate-500 text-center text-sm mb-6">
                Are you sure you want to delete <span className="text-slate-800 font-medium">{deleteModal.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                  disabled={deleting}
                  className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded border border-slate-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={previewImage} 
              alt="Full Preview" 
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-4 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
