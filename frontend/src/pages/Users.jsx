import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users as UsersIcon, Send, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';

const InputField = ({ label, name, type="text", value, onChange, required=false, placeholder="" }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-blue-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-slate-200 focus:border-[#7c3aed] outline-none py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400" 
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required=false, disabled=false, placeholder="Choose" }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label} {required && <span className="text-blue-500">*</span>}
    </label>
    <select 
      name={name} 
      value={value} 
      onChange={onChange} 
      required={required}
      disabled={disabled}
      className="w-full bg-transparent border-b border-slate-200 focus:border-[#7c3aed] outline-none py-2 text-sm text-slate-800 transition-colors disabled:opacity-50 appearance-none"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const FileField = ({ label, name, onChange, required=false, accept="image/*,.pdf", existingFile, onPreview }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-2">
      {label} {required && <span className="text-blue-500">*</span>}
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
            <a href={`${IMAGE_BASE_URL.replace('/uploads', '')}${existingFile}`} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors shadow-sm text-center px-1">
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
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
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
    pincode: '', country_id: '', state_id: '', city_id: '',
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
  const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.country_id) fetchStates(formData.country_id);
    else setStates([]);
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) fetchCities(formData.state_id);
    else setCities([]);
  }, [formData.state_id]);

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
      pincode: '', country_id: '', state_id: '', city_id: '',
      company_type: 'Individual', pan_number: '', aadhaar_number: '',
      status: 'active', profile_status: 'pending'
    });
    setFileData({ profile_photo: null, pan_card_file: null, aadhaar_card_file: null });
    setExistingFiles({ profile_photo: null, pan_card_file: null, aadhaar_card_file: null });
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setIsEditMode(true);
    setEditingId(user.id);
    const cType = user.company_type || 'Individual';
    setActiveTab(cType);
    setFormData({
      name: user.name || '', email: user.email || '', phone: user.phone || '', 
      role_id: user.role_id || roles[0]?.id || 1,
      pincode: '', country_id: user.country_id || '', state_id: user.state_id || '', city_id: user.city_id || '',
      company_type: cType, 
      pan_number: user.pan_number || '', aadhaar_number: user.aadhaar_number || '',
      status: user.status || 'active', profile_status: user.profile_status || 'pending',
      password: '' // Don't populate password
    });
    setFileData({ profile_photo: null, pan_card_file: null, aadhaar_card_file: null });
    setExistingFiles({
      profile_photo: user.profile_photo ? (user.profile_photo.startsWith('/uploads/') ? user.profile_photo : `/uploads/Profile_Photo/${user.profile_photo}`) : null,
      pan_card_file: user.pan_card_file ? (user.pan_card_file.startsWith('/uploads/') ? user.pan_card_file : `/uploads/Pan_Card/${user.pan_card_file}`) : null,
      aadhaar_card_file: user.aadhaar_card_file ? (user.aadhaar_card_file.startsWith('/uploads/') ? user.aadhaar_card_file : `/uploads/Aadhaar_Card/${user.aadhaar_card_file}`) : null
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
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
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Name" />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="Email" />
                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone Number" />
                
                <SelectField 
                  label="System Role" name="role_id" value={formData.role_id} onChange={handleInputChange} required 
                  options={roles.map(r => ({ value: r.id, label: r.role_name }))} 
                />
                <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} required={!isEditMode} placeholder={isEditMode ? "Leave blank to keep" : "Password"} />
                
                <div className="relative">
                  <InputField label="Pincode" name="pincode" value={formData.pincode || ''} onChange={handlePincodeChange} placeholder="Enter 6-digit Pincode" />
                  {showSuggestions && pincodeSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-[-10px] max-h-48 overflow-y-auto">
                      {pincodeSuggestions.map((res, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => selectPincodeResult(res)}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
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
                  label="Country" name="country_id" value={formData.country_id} onChange={handleInputChange} required placeholder="Country" disabled
                  options={countries.map(c => ({ value: c.id, label: c.country_name }))} 
                />
                <SelectField 
                  label="State" name="state_id" value={formData.state_id} onChange={handleInputChange} required disabled placeholder="State"
                  options={states.map(s => ({ value: s.id, label: s.state_name }))} 
                />
                <SelectField 
                  label="City" name="city_id" value={formData.city_id} onChange={handleInputChange} required disabled placeholder="City"
                  options={cities.map(c => ({ value: c.id, label: c.city_name }))} 
                />

                <InputField label="PAN Number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} required placeholder="PAN Number" />
                <InputField label="Aadhar Number" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} required placeholder="Aadhar Number" />
                
                <FileField label="Upload Photo" name="profile_photo" onChange={handleFileChange} existingFile={existingFiles.profile_photo} onPreview={setPreviewImage} />
                <FileField label="Upload Pan Card" name="pan_card_file" onChange={handleFileChange} existingFile={existingFiles.pan_card_file} onPreview={setPreviewImage} />
                <FileField label="Upload Aadhar Card" name="aadhaar_card_file" onChange={handleFileChange} existingFile={existingFiles.aadhaar_card_file} onPreview={setPreviewImage} />
                
                <SelectField 
                  label="Account Status" name="status" value={formData.status} onChange={handleInputChange} required 
                  options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]} 
                />
                <SelectField 
                  label="Profile Status" name="profile_status" value={formData.profile_status} onChange={handleInputChange} required 
                  options={[{value: 'pending', label: 'Pending'}, {value: 'approved', label: 'Approved'}, {value: 'rejected', label: 'Rejected'}]} 
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
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center ${filter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Pending Approval
              {users.filter(u => u.profile_status === 'pending').length > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${filter === 'pending' ? 'bg-white text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
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
