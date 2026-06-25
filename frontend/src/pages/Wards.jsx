import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const Wards = () => {
  const [wards, setWards] = useState([]);
  const [activeCorporations, setActiveCorporations] = useState([]);
  const [formZones, setFormZones] = useState([]);
  const [filterZones, setFilterZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Filter & Pagination State
  const [searchName, setSearchName] = useState('');
  const [searchCorpId, setSearchCorpId] = useState('');
  const [searchZoneId, setSearchZoneId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [formData, setFormData] = useState({
    corporation_id: '',
    zone_id: '',
    ward_name: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchActiveCorporations();
  }, []);

  useEffect(() => {
    fetchWards();
  }, [page, searchCorpId, searchZoneId, statusFilter, sortField, sortOrder]);

  // Load Zones for filter when the filter corporation changes
  useEffect(() => {
    if (searchCorpId) {
      fetchFilterZones(searchCorpId);
    } else {
      setFilterZones([]);
      setSearchZoneId('');
    }
  }, [searchCorpId]);

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

  const fetchFormZones = async (corpId, currentZoneId = null) => {
    try {
      const res = await api.get(`/corporations/${corpId}/zones`);
      const zones = res.data.zones || [];
      setFormZones(zones);
      
      // Update form state
      setFormData(prev => ({
        ...prev,
        zone_id: currentZoneId && zones.some(z => z.id === currentZoneId) ? currentZoneId : (zones[0]?.id || '')
      }));
    } catch (err) {
      console.error("Failed to load form zones:", err);
      setFormZones([]);
    }
  };

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wards', {
        params: {
          page,
          search: searchName,
          corporation_id: searchCorpId,
          zone_id: searchZoneId,
          status: statusFilter,
          sortField,
          sortOrder,
          limit: 10
        }
      });
      setWards(res.data.wards || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load wards:", err);
      toast.error(err.response?.data?.message || "Failed to load wards");
      setWards([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWards();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'corporation_id') {
      fetchFormZones(value);
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

  const openAddForm = () => {
    const defaultCorpId = activeCorporations[0]?.id || '';
    setFormData({
      corporation_id: defaultCorpId,
      zone_id: '',
      ward_name: '',
      status: 'Active'
    });
    setFormZones([]);
    setIsEditMode(false);
    setIsFormOpen(true);

    if (defaultCorpId) {
      fetchFormZones(defaultCorpId);
    }
  };

  const openEditForm = async (ward) => {
    setFormData({
      corporation_id: ward.corporation_id,
      zone_id: ward.zone_id,
      ward_name: ward.ward_name,
      status: ward.status
    });
    setSelectedId(ward.id);
    setIsEditMode(true);
    setIsFormOpen(true);
    
    // Load zones of selected corporation and ensure selected zone_id is set
    await fetchFormZones(ward.corporation_id, ward.zone_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.corporation_id) {
      toast.error("Corporation is required");
      return;
    }
    if (!formData.zone_id) {
      toast.error("Zone is required");
      return;
    }
    if (!formData.ward_name.trim()) {
      toast.error("Ward name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/wards/${selectedId}`, formData);
        toast.success("Ward updated successfully");
      } else {
        await api.post('/wards', formData);
        toast.success("Ward created successfully");
      }
      setIsFormOpen(false);
      fetchWards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (ward) => {
    const newStatus = ward.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/wards/${ward.id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchWards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteWard = async () => {
    try {
      await api.delete(`/wards/${idToDelete}`);
      toast.success("Ward deleted successfully");
      setIsDeleteModalOpen(false);
      fetchWards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete ward");
    }
  };

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Ward' : 'Add New Ward'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>Select Zone</option>
                    {formZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ward Name *</label>
                  <input
                    type="text" name="ward_name" value={formData.ward_name} onChange={handleInputChange} required
                    disabled={!formData.zone_id}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm disabled:opacity-55 disabled:cursor-not-allowed"
                    placeholder="e.g. Ward 12"
                  />
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
              <button type="submit" disabled={submitting || !formData.zone_id} className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-[#7c3aed] text-white hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : 'Save Ward'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Ward Management</h1>
              <p className="text-slate-500 mt-1 text-sm">Add and manage wards within zones.</p>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center px-6 py-3 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Ward
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Search ward name..." value={searchName} onChange={(e) => setSearchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm"
                />
              </form>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative">
                  <select
                    value={searchCorpId} onChange={(e) => { setSearchCorpId(e.target.value); setPage(1); }}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 appearance-none min-w-[150px]"
                  >
                    <option value="">All Corporations</option>
                    {activeCorporations.map(corp => (
                      <option key={corp.id} value={corp.id}>{corp.corporation_name}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={searchZoneId} onChange={(e) => { setSearchZoneId(e.target.value); setPage(1); }}
                    disabled={!searchCorpId}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-purple-100 text-xs font-bold text-slate-600 appearance-none min-w-[150px] disabled:opacity-50"
                  >
                    <option value="">All Zones</option>
                    {filterZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.zone_name}</option>
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
                    <th className="p-5 cursor-pointer select-none" onClick={() => handleSort('ward_name')}>
                      Ward Name {sortField === 'ward_name' && (sortOrder === 'ASC' ? '▲' : '▼')}
                    </th>
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
                      <td colSpan="7" className="p-20 text-center">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-medium text-slate-400">Loading your data...</p>
                      </td>
                    </tr>
                  ) : wards.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-20 text-center">
                        <p className="text-slate-600 font-bold">No Wards Found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new ward.</p>
                      </td>
                    </tr>
                  ) : wards.map((ward, index) => (
                    <tr key={ward.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 text-xs font-mono text-slate-400">{(page - 1) * 10 + index + 1}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">
                        {ward.corporation?.corporation_name || '—'}
                      </td>
                      <td className="p-5 text-sm font-semibold text-slate-700">
                        {ward.zone?.zone_name || '—'}
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-slate-800 text-sm">{ward.ward_name}</p>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => toggleStatus(ward)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${ward.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${ward.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {ward.status}
                        </button>
                      </td>
                      <td className="p-5 text-xs text-slate-500 font-medium">
                        {new Date(ward.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button onClick={() => openEditForm(ward)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(ward.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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
                  Showing {wards.length} of {totalItems} items
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
        title="Delete Ward?"
        message="This action will delete the ward. This action cannot be undone."
        onConfirm={deleteWard}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmLabel="Yes, Delete it"
      />
    </div>
  );
};

export default Wards;
