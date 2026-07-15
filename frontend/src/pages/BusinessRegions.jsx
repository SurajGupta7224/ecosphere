import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const BusinessRegions = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [formData, setFormData] = useState({
    zone: 'South',
    state: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchRegions();
  }, [page, statusFilter, sortField, sortOrder]);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/business-regions', {
        params: { 
          page, 
          search, 
          status: statusFilter, 
          sortField, 
          sortOrder, 
          limit: 10 
        }
      });
      setRegions(res.data.businessRegions || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load business regions:", err);
      toast.error(err.response?.data?.message || "Failed to load business regions");
      setRegions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRegions();
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
    setFormData({ zone: 'South', state: '', status: 'Active' });
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const openEditForm = (region) => {
    setFormData({
      zone: region.zone || 'South',
      state: region.state || '',
      status: region.status
    });
    setSelectedId(region.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.state.trim()) {
      toast.error("State/Region name is required");
      return;
    }
    if (formData.state.length > 100) {
      toast.error("State/Region name cannot exceed 100 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/business-regions/${selectedId}`, formData);
        toast.success("Business region updated successfully");
      } else {
        await api.post('/business-regions', formData);
        toast.success("Business region created successfully");
      }
      setIsFormOpen(false);
      fetchRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (region) => {
    const newStatus = region.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/business-regions/${region.id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteRegion = async () => {
    try {
      await api.delete(`/business-regions/${idToDelete}`);
      toast.success("Business region deleted successfully");
      fetchRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete business region");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="w-full">
      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Business Region' : 'Add New Business Region'}</h2>
            <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zone *</label>
                <select
                  name="zone" value={formData.zone} onChange={handleInputChange} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="South">South</option>
                  <option value="North">North</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State *</label>
                <input
                  type="text" name="state" value={formData.state} onChange={handleInputChange} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700"
                  placeholder="e.g. Karnataka"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  name="status" value={formData.status} onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium text-slate-700 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-slate-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex items-center px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Region'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Business Regions</h1>
              <p className="text-slate-500 mt-1 text-sm">Add and manage B2B business regions.</p>
            </div>
            <button onClick={openAddForm} className="flex items-center px-5 py-3 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
              <Plus className="w-5 h-5 mr-2" /> Add Region
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Search business regions..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
              />
            </form>

            <div className="flex w-full md:w-auto items-center gap-4">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-48">
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

              {(search || statusFilter) && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}
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
                    <th onClick={() => handleSort('zone')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-all">Zone</th>
                    <th onClick={() => handleSort('state')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-all">State (Region Name)</th>
                    <th onClick={() => handleSort('status')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-all">Status</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">Loading business regions...</td>
                    </tr>
                  ) : regions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <p className="text-slate-600 font-bold">No Business Regions Found</p>
                        <p className="text-slate-400 text-xs mt-1">Try resetting the search or add a new region.</p>
                      </td>
                    </tr>
                  ) : regions.map((region) => (
                    <tr key={region.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-4 px-6 text-slate-500">#{region.id}</td>
                      <td className="py-4 px-6 text-slate-800 font-semibold">{region.zone || 'South'}</td>
                      <td className="py-4 px-6 text-slate-800 font-bold">{region.state || region.region_name}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(region)}
                          className={`flex items-center px-3 py-1 rounded-full text-xs font-bold gap-1 transition-all ${
                            region.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100/70'
                          }`}
                        >
                          {region.status === 'Active' ? (
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
                        <button onClick={() => openEditForm(region)} className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(region.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && regions.length > 0 && (
              <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs font-bold text-slate-400">
                  Showing {regions.length} of {totalItems} items
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
        onConfirm={deleteRegion}
        title="Delete Business Region"
        message="Are you sure you want to delete this business region? This action cannot be undone and will fail if any sub regions are linked."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BusinessRegions;
