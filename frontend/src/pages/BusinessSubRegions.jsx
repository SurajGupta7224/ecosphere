import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter, CheckCircle, XCircle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import ConfirmModal from '../components/ConfirmModal';

const BusinessSubRegions = () => {
  const [subRegions, setSubRegions] = useState([]);
  const [activeRegions, setActiveRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Filter & Pagination State
  const [searchName, setSearchName] = useState('');
  const [searchRegionId, setSearchRegionId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Form State
  const [gstnFile, setGstnFile] = useState(null);
  const [agriLicenceFile, setAgriLicenceFile] = useState(null);
  const [shopEstablishmentFile, setShopEstablishmentFile] = useState(null);

  const [formData, setFormData] = useState({
    business_region_id: '',
    sub_region_name: '',
    branch_name: '',
    branch_code: '',
    office_address: '',
    gstn: '',
    agri_licence: '',
    shop_establishment: '',
    contact_person_name: '',
    contact_number: '',
    email_id: '',
    gstn_file: '',
    agri_licence_file: '',
    shop_establishment_file: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchActiveRegions();
  }, []);

  useEffect(() => {
    fetchSubRegions();
  }, [page, searchRegionId, statusFilter, sortField, sortOrder]);

  const fetchActiveRegions = async () => {
    try {
      const res = await api.get('/business-regions', {
        params: { status: 'Active', limit: 1000 }
      });
      setActiveRegions(res.data.businessRegions || []);
    } catch (err) {
      console.error("Failed to load active regions:", err);
    }
  };

  const fetchSubRegions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/business-sub-regions', {
        params: {
          page,
          search: searchName,
          business_region_id: searchRegionId,
          status: statusFilter,
          sortField,
          sortOrder,
          limit: 10
        }
      });
      setSubRegions(res.data.businessSubRegions || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load business sub regions:", err);
      toast.error(err.response?.data?.message || "Failed to load sub regions");
      setSubRegions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubRegions();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact_number') {
      const cleanVal = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleanVal }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const openAddForm = async () => {
    setGstnFile(null);
    setAgriLicenceFile(null);
    setShopEstablishmentFile(null);
    let initialBranchCode = '';
    try {
      const res = await api.get('/business-sub-regions/next-code');
      initialBranchCode = res.data.nextBranchCode || 'EC-001';
    } catch (err) {
      console.error("Failed to load next branch code:", err);
      initialBranchCode = 'EC-001';
    }
    setFormData({
      business_region_id: activeRegions[0]?.id || '',
      sub_region_name: '',
      branch_name: '',
      branch_code: initialBranchCode,
      office_address: '',
      gstn: '',
      agri_licence: '',
      shop_establishment: '',
      contact_person_name: '',
      contact_number: '',
      email_id: '',
      gstn_file: '',
      agri_licence_file: '',
      shop_establishment_file: '',
      status: 'Active'
    });
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const openEditForm = (subReg) => {
    setGstnFile(null);
    setAgriLicenceFile(null);
    setShopEstablishmentFile(null);
    setFormData({
      business_region_id: subReg.business_region_id,
      sub_region_name: subReg.sub_region_name || '',
      branch_name: subReg.branch_name || subReg.sub_region_name || '',
      branch_code: subReg.branch_code || '',
      office_address: subReg.office_address || '',
      gstn: subReg.gstn || '',
      agri_licence: subReg.agri_licence || '',
      shop_establishment: subReg.shop_establishment || '',
      contact_person_name: subReg.contact_person_name || '',
      contact_number: subReg.contact_number || '',
      email_id: subReg.email_id || '',
      gstn_file: subReg.gstn_file || '',
      agri_licence_file: subReg.agri_licence_file || '',
      shop_establishment_file: subReg.shop_establishment_file || '',
      status: subReg.status
    });
    setSelectedId(subReg.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };
  const renderFilePreview = (file, existingFilename) => {
    if (file) {
      const isImg = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
      if (isImg) {
        return (
          <div className="mt-2 relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
          </div>
        );
      } else {
        return (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5 w-fit">
            <FileText className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{file.name}</span>
          </div>
        );
      }
    }
    if (existingFilename) {
      const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(existingFilename);
      if (isImg) {
        return (
          <div className="mt-2 relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <img src={`${IMAGE_BASE_URL}/CollectionRequests/${existingFilename}`} alt="Preview" className="w-full h-full object-cover" />
          </div>
        );
      } else {
        return (
          <a
            href={`${IMAGE_BASE_URL}/CollectionRequests/${existingFilename}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 font-bold bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5 w-fit hover:bg-purple-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{existingFilename}</span>
          </a>
        );
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.business_region_id) {
      toast.error("Business region is required");
      return;
    }
    const subRegionNameVal = (formData.sub_region_name || formData.branch_name || '').trim();
    if (!subRegionNameVal) {
      toast.error("Sub region name / Branch name is required");
      return;
    }
    if (subRegionNameVal.length > 100) {
      toast.error("Sub region name cannot exceed 100 characters");
      return;
    }

    const contactNumberVal = (formData.contact_number || '').trim();
    if (contactNumberVal && contactNumberVal.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    const emailIdVal = (formData.email_id || '').trim();
    if (emailIdVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailIdVal)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    const gstnVal = (formData.gstn || '').trim();
    if (gstnVal) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstRegex.test(gstnVal)) {
        toast.error("Please enter a valid 15-character GSTN number");
        return;
      }
    }

    const payload = new FormData();
    payload.append('business_region_id', formData.business_region_id);
    payload.append('sub_region_name', subRegionNameVal);
    payload.append('branch_name', subRegionNameVal);
    payload.append('office_address', formData.office_address || '');
    payload.append('gstn', formData.gstn || '');
    payload.append('agri_licence', formData.agri_licence || '');
    payload.append('shop_establishment', formData.shop_establishment || '');
    payload.append('contact_person_name', formData.contact_person_name || '');
    payload.append('contact_number', formData.contact_number || '');
    payload.append('email_id', formData.email_id || '');
    payload.append('status', formData.status || 'Active');

    if (gstnFile) payload.append('gstn_file', gstnFile);
    if (agriLicenceFile) payload.append('agri_licence_file', agriLicenceFile);
    if (shopEstablishmentFile) payload.append('shop_establishment_file', shopEstablishmentFile);

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/business-sub-regions/${selectedId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Business sub region updated successfully");
      } else {
        await api.post('/business-sub-regions', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Business sub region created successfully");
      }
      setIsFormOpen(false);
      fetchSubRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (subReg) => {
    const newStatus = subReg.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/business-sub-regions/${subReg.id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchSubRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteSubRegion = async () => {
    try {
      await api.delete(`/business-sub-regions/${idToDelete}`);
      toast.success("Sub region deleted successfully");
      fetchSubRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sub region");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Business Sub Region' : 'Add New Business Sub Region'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Business Region *</label>
                  <select
                    name="business_region_id" value={formData.business_region_id} onChange={handleInputChange} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm cursor-pointer font-medium text-slate-700"
                  >
                    <option value="">- Select Business Region -</option>
                    {activeRegions.map(reg => (
                      <option key={reg.id} value={reg.id}>
                        {reg.zone ? `${reg.zone} - ` : ''}{reg.state || reg.region_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Sub Region / Branch Name *</label>
                  <input
                    type="text" 
                    name="branch_name" 
                    value={formData.branch_name} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, branch_name: val, sub_region_name: val }));
                    }} 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700"
                    placeholder="e.g. Ramamurthy Nagar"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch Code</label>
                  <input
                    type="text" 
                    name="branch_code" 
                    value={isEditMode ? formData.branch_code : 'Auto-generated'} 
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 outline-none text-sm font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person Name</label>
                  <input
                    type="text" 
                    name="contact_person_name" 
                    value={formData.contact_person_name} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                  <input
                    type="text" 
                    name="contact_number" 
                    value={formData.contact_number} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email ID</label>
                  <input
                    type="email" 
                    name="email_id" 
                    value={formData.email_id} 
                    onChange={handleInputChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm cursor-pointer font-medium text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Office Address</label>
                  <textarea
                    name="office_address" 
                    value={formData.office_address} 
                    onChange={handleInputChange} 
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700 resize-none"
                    placeholder="Enter complete office address"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Licence & Certificate Documents</p>
                  
                  {/* GSTN Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">GSTN Number</label>
                      <input
                        type="text" 
                        name="gstn" 
                        value={formData.gstn} 
                        onChange={handleInputChange} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-xs font-semibold text-slate-700 focus:border-purple-400"
                        placeholder="GSTN Registration No."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">GSTN Image / PDF</label>
                      <input
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setGstnFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                      />
                      {renderFilePreview(gstnFile, formData.gstn_file)}
                    </div>
                  </div>

                  {/* Agri Licence Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Agri Licence Number</label>
                      <input
                        type="text" 
                        name="agri_licence" 
                        value={formData.agri_licence} 
                        onChange={handleInputChange} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-xs font-semibold text-slate-700 focus:border-purple-400"
                        placeholder="Agri Licence No."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Agri Licence Image / PDF</label>
                      <input
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setAgriLicenceFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                      />
                      {renderFilePreview(agriLicenceFile, formData.agri_licence_file)}
                    </div>
                  </div>

                  {/* Shop & Establishment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shop Establishment Number</label>
                      <input
                        type="text" 
                        name="shop_establishment" 
                        value={formData.shop_establishment} 
                        onChange={handleInputChange} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-xs font-semibold text-slate-700 focus:border-purple-400"
                        placeholder="Shop Establishment No."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shop Est. Image / PDF</label>
                      <input
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setShopEstablishmentFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                      />
                      {renderFilePreview(shopEstablishmentFile, formData.shop_establishment_file)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-slate-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex items-center px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Sub Region'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Business Sub Regions</h1>
              <p className="text-slate-500 mt-1 text-sm">Add and manage B2B business sub regions linked to regions.</p>
            </div>
            <button onClick={openAddForm} className="flex items-center px-5 py-3 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
              <Plus className="w-5 h-5 mr-2" /> Add Sub Region
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Search sub regions..." value={searchName} onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
              />
            </form>

            <div className="flex flex-wrap w-full md:w-auto items-center gap-4">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-48">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={searchRegionId} onChange={(e) => { setSearchRegionId(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full cursor-pointer"
                >
                  <option value="">All Regions</option>
                  {activeRegions.map(reg => (
                    <option key={reg.id} value={reg.id}>
                      {reg.zone ? `${reg.zone} - ` : ''}{reg.state || reg.region_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-40">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {(searchName || searchRegionId || statusFilter) && (
                <button
                  onClick={() => { setSearchName(''); setSearchRegionId(''); setStatusFilter(''); setPage(1); }}
                  className="p-2.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
                  title="Reset filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th onClick={() => handleSort('id')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-all">ID</th>
                    <th onClick={() => handleSort('sub_region_name')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-all">Branch / Sub Region</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Business Region</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Licences / Certificates</th>
                    <th onClick={() => handleSort('status')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-all">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">Loading business sub regions...</td>
                    </tr>
                  ) : subRegions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <p className="text-slate-600 font-bold">No Business Sub Regions Found</p>
                        <p className="text-slate-400 text-xs mt-1">Try resetting the search filters or add a new sub region.</p>
                      </td>
                    </tr>
                  ) : subRegions.map((subReg) => (
                    <tr key={subReg.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-4 px-6 text-slate-500">#{subReg.id}</td>
                      <td className="py-4 px-6 text-slate-800">
                        <span className="font-bold block">{subReg.branch_name || subReg.sub_region_name}</span>
                        {subReg.branch_code && (
                          <span className="text-[9px] font-mono font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 mt-1 inline-block">
                            {subReg.branch_code}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {subReg.businessRegion?.zone ? `${subReg.businessRegion.zone} - ` : ''}
                        {subReg.businessRegion?.state || subReg.businessRegion?.region_name || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <span className="block text-slate-800 font-bold text-xs">{subReg.contact_person_name || 'N/A'}</span>
                        {(subReg.contact_number || subReg.email_id) && (
                          <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                            {subReg.contact_number} {subReg.email_id ? `| ${subReg.email_id}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {subReg.gstn && (
                            subReg.gstn_file ? (
                              <a 
                                href={`${IMAGE_BASE_URL}/CollectionRequests/${subReg.gstn_file}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-800 px-1.5 py-0.5 rounded uppercase border border-purple-100 transition-colors"
                              >
                                GSTN: {subReg.gstn}
                              </a>
                            ) : (
                              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                GSTN: {subReg.gstn}
                              </span>
                            )
                          )}
                          {subReg.agri_licence && (
                            subReg.agri_licence_file ? (
                              <a 
                                href={`${IMAGE_BASE_URL}/CollectionRequests/${subReg.agri_licence_file}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-800 px-1.5 py-0.5 rounded uppercase border border-purple-100 transition-colors"
                              >
                                Agri: {subReg.agri_licence}
                              </a>
                            ) : (
                              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                Agri: {subReg.agri_licence}
                              </span>
                            )
                          )}
                          {subReg.shop_establishment && (
                            subReg.shop_establishment_file ? (
                              <a 
                                href={`${IMAGE_BASE_URL}/CollectionRequests/${subReg.shop_establishment_file}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[9px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-800 px-1.5 py-0.5 rounded uppercase border border-purple-100 transition-colors"
                              >
                                Shop: {subReg.shop_establishment}
                              </a>
                            ) : (
                              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                Shop: {subReg.shop_establishment}
                              </span>
                            )
                          )}
                          {!subReg.gstn && !subReg.agri_licence && !subReg.shop_establishment && (
                            <span className="text-xs text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(subReg)}
                          className={`flex items-center px-3 py-1 rounded-full text-xs font-bold gap-1 transition-all ${
                            subReg.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100/70'
                          }`}
                        >
                          {subReg.status === 'Active' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => openEditForm(subReg)} className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(subReg.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && subRegions.length > 0 && (
              <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs font-bold text-slate-400">
                  Showing {subRegions.length} of {totalItems} items
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-700 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSubRegion}
        title="Delete Business Sub Region"
        message="Are you sure you want to delete this business sub region? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BusinessSubRegions;
