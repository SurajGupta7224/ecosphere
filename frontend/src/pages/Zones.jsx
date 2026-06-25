import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [activeCorporations, setActiveCorporations] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [formData, setFormData] = useState({
    corporation_id: '',
    zone_name: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchActiveCorporations();
  }, []);

  useEffect(() => {
    fetchZones();
  }, [page, searchCorpId, statusFilter, sortField, sortOrder]);

  const fetchActiveCorporations = async () => {
    try {
      // Get active corporations for dropdown (unpaginated)
      const res = await api.get('/corporations', {
        params: { status: 'Active', limit: 1000 }
      });
      setActiveCorporations(res.data.corporations || []);
    } catch (err) {
      console.error("Failed to load active corporations:", err);
    }
  };

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/zones', {
        params: {
          page,
          search: searchName,
          corporation_id: searchCorpId,
          status: statusFilter,
          sortField,
          sortOrder,
          limit: 10
        }
      });
      setZones(res.data.zones || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load zones:", err);
      toast.error(err.response?.data?.message || "Failed to load zones");
      setZones([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchZones();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const openAddForm = () => {
    setFormData({ corporation_id: activeCorporations[0]?.id || '', zone_name: '', status: 'Active' });
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const openEditForm = (zone) => {
    setFormData({
      corporation_id: zone.corporation_id,
      zone_name: zone.zone_name,
      status: zone.status
    });
    setSelectedId(zone.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.corporation_id) {
      toast.error("Corporation is required");
      return;
    }
    if (!formData.zone_name.trim()) {
      toast.error("Zone name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/zones/${selectedId}`, formData);
        toast.success("Zone updated successfully");
      } else {
        await api.post('/zones', formData);
        toast.success("Zone created successfully");
      }
      setIsFormOpen(false);
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (zone) => {
    const newStatus = zone.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/zones/${zone.id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteZone = async () => {
    try {
      await api.delete(`/zones/${idToDelete}`);
      toast.success("Zone deleted successfully");
      setIsDeleteModalOpen(false);
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete zone");
    }
  };

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Zone' : 'Add New Zone'}</h2>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zone Name *</label>
                  <input
                    type="text" name="zone_name" value={formData.zone_name} onChange={handleInputChange} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                    placeholder="e.g. Zone 1"
                  />
                </div>
              </div>

              <div className="space-y-6">
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
              <button type="submit" disabled={submitting} className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-[#7c3aed] text-white hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : 'Save Zone'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Zone Management</h1>
              <p className="text-slate-500 mt-1 text-sm">Add and manage zones within corporations.</p>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center px-6 py-3 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Zone
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Search zone name..." value={searchName} onChange={(e) => setSearchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all text-sm"
                />
              </form>
              <div className="flex flex-wrap items-center gap-3">
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
                    <th className="p-5">Corporation Name</th>
                    <th className="p-5 cursor-pointer select-none" onClick={() => handleSort('zone_name')}>
                      Zone Name {sortField === 'zone_name' && (sortOrder === 'ASC' ? '▲' : '▼')}
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
                      <td colSpan="6" className="p-20 text-center">
                        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-medium text-slate-400">Loading your data...</p>
                      </td>
                    </tr>
                  ) : zones.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-20 text-center">
                        <p className="text-slate-600 font-bold">No Zones Found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new zone.</p>
                      </td>
                    </tr>
                  ) : zones.map((zone, index) => (
                    <tr key={zone.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 text-xs font-mono text-slate-400">{(page - 1) * 10 + index + 1}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">
                        {zone.corporation?.corporation_name || '—'}
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-slate-800 text-sm">{zone.zone_name}</p>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => toggleStatus(zone)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${zone.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${zone.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {zone.status}
                        </button>
                      </td>
                      <td className="p-5 text-xs text-slate-500 font-medium">
                        {new Date(zone.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button onClick={() => openEditForm(zone)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(zone.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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
                  Showing {zones.length} of {totalItems} items
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
        title="Delete Zone?"
        message="This action will delete the zone. This action cannot be undone if there are no linked records."
        onConfirm={deleteZone}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmLabel="Yes, Delete it"
      />
    </div>
  );
};

export default Zones;
