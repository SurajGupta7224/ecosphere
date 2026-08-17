import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Image as ImageIcon,
  ChevronLeft, ChevronRight, Save, RotateCcw, Filter, Layers, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import ConfirmModal from '../components/ConfirmModal';

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    color: '',
    slug: '',
    description: '',
    alt_tag: '',
    meta_title: '',
    meta_description: '',
    status: 1,
  });

  const [subCategoryImage, setSubCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Variations State
  const [variations, setVariations] = useState([]);
  const [variationErrors, setVariationErrors] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Fetch categories for dropdown on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [page, statusFilter, categoryFilter, refreshTrigger]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { params: { limit: 200, status: 1 } });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sub-categories', {
        params: { page, search, status: statusFilter, category_id: categoryFilter, limit: 10 },
      });
      setSubCategories(res.data.subCategories || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load sub-categories:', err);
      toast.error(err.response?.data?.message || 'Failed to load sub-categories');
      setSubCategories([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubCategories();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubCategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ─── VARIATION HANDLERS ───────────────────────────────────────────────────

  const addVariation = () => {
    const newOrder = variations.length;
    setVariations([
      ...variations,
      {
        id: null,
        variation_name: '',
        number_of_sr: '',
        schedule_after_days: '',
        per_kg_price: '',
        bulk_price: '',
        status: 'Active',
        display_order: newOrder
      }
    ]);
    setVariationErrors([
      ...variationErrors,
      {
        variation_name: '',
        number_of_sr: '',
        schedule_after_days: '',
        per_kg_price: '',
        bulk_price: ''
      }
    ]);
  };

  const deleteVariation = (index) => {
    const updated = variations.filter((_, i) => i !== index);
    const reordered = updated.map((v, i) => ({ ...v, display_order: i }));
    setVariations(reordered);

    const updatedErrors = variationErrors.filter((_, i) => i !== index);
    setVariationErrors(updatedErrors);
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);

    // Inline field validation
    const updatedErrors = [...variationErrors];
    const rowErrors = { ...updatedErrors[index] };

    if (field === 'variation_name') {
      if (!value || value.trim() === '') {
        rowErrors.variation_name = 'Name is required';
      } else if (value.length > 100) {
        rowErrors.variation_name = 'Max 100 characters';
      } else {
        rowErrors.variation_name = '';
      }
    }

    if (field === 'number_of_sr') {
      const num = Number(value);
      if (value === '') {
        rowErrors.number_of_sr = 'Required';
      } else if (isNaN(num) || num <= 0) {
        rowErrors.number_of_sr = 'Must be > 0';
      } else {
        rowErrors.number_of_sr = '';
      }
    }

    if (field === 'schedule_after_days') {
      const num = Number(value);
      if (value === '') {
        rowErrors.schedule_after_days = 'Required';
      } else if (isNaN(num) || num <= 0) {
        rowErrors.schedule_after_days = 'Must be > 0';
      } else {
        rowErrors.schedule_after_days = '';
      }
    }

    if (field === 'per_kg_price') {
      const num = Number(value);
      if (value === '') {
        rowErrors.per_kg_price = 'Required';
      } else if (isNaN(num) || num < 0) {
        rowErrors.per_kg_price = 'Must be ≥ 0';
      } else {
        rowErrors.per_kg_price = '';
      }
    }

    if (field === 'bulk_price') {
      const num = Number(value);
      if (value === '') {
        rowErrors.bulk_price = 'Required';
      } else if (isNaN(num) || num < 0) {
        rowErrors.bulk_price = 'Must be ≥ 0';
      } else {
        rowErrors.bulk_price = '';
      }
    }

    updatedErrors[index] = rowErrors;
    setVariationErrors(updatedErrors);
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...variations];
    const draggedItem = updated[draggedIndex];

    // Rearrange array items
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    // Re-index display_order based on array position
    const reordered = updated.map((v, i) => ({ ...v, display_order: i }));

    // Rearrange validation errors array to match
    const updatedErrors = [...variationErrors];
    const draggedError = updatedErrors[draggedIndex];
    updatedErrors.splice(draggedIndex, 1);
    updatedErrors.splice(index, 0, draggedError);

    setDraggedIndex(index);
    setVariations(reordered);
    setVariationErrors(updatedErrors);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Validate entire variations state before submit
  const validateVariationsForm = () => {
    let isValid = true;
    const errors = variations.map((v) => {
      const rowErrors = {};
      if (!v.variation_name || v.variation_name.trim() === '') {
        rowErrors.variation_name = 'Name is required';
        isValid = false;
      } else if (v.variation_name.length > 100) {
        rowErrors.variation_name = 'Max 100 characters';
        isValid = false;
      }

      const numSr = Number(v.number_of_sr);
      if (v.number_of_sr === '' || v.number_of_sr === undefined || v.number_of_sr === null) {
        rowErrors.number_of_sr = 'Required';
        isValid = false;
      } else if (isNaN(numSr) || numSr <= 0) {
        rowErrors.number_of_sr = 'Must be > 0';
        isValid = false;
      }

      const numDays = Number(v.schedule_after_days);
      if (v.schedule_after_days === '' || v.schedule_after_days === undefined || v.schedule_after_days === null) {
        rowErrors.schedule_after_days = 'Required';
        isValid = false;
      } else if (isNaN(numDays) || numDays <= 0) {
        rowErrors.schedule_after_days = 'Must be > 0';
        isValid = false;
      }

      const numPrice = Number(v.per_kg_price);
      if (v.per_kg_price === '' || v.per_kg_price === undefined || v.per_kg_price === null) {
        rowErrors.per_kg_price = 'Required';
        isValid = false;
      } else if (isNaN(numPrice) || numPrice < 0) {
        rowErrors.per_kg_price = 'Must be ≥ 0';
        isValid = false;
      }

      const numBulkPrice = Number(v.bulk_price);
      if (v.bulk_price === '' || v.bulk_price === undefined || v.bulk_price === null) {
        rowErrors.bulk_price = 'Required';
        isValid = false;
      } else if (isNaN(numBulkPrice) || numBulkPrice < 0) {
        rowErrors.bulk_price = 'Must be ≥ 0';
        isValid = false;
      }

      return rowErrors;
    });

    setVariationErrors(errors);
    return isValid;
  };

  // ─── SUBMISSION & RESET ───────────────────────────────────────────────────

  const resetForm = () => {
    setFormData({ category_id: '', name: '', color: '', slug: '', description: '', alt_tag: '', meta_title: '', meta_description: '', status: 1 });
    setVariations([]);
    setVariationErrors([]);
    setSubCategoryImage(null);
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (sc) => {
    setFormData({
      category_id: sc.category_id,
      name: sc.name,
      color: sc.color || '',
      slug: sc.slug,
      description: sc.description || '',
      alt_tag: sc.alt_tag || '',
      meta_title: sc.meta_title || '',
      meta_description: sc.meta_description || '',
      status: sc.status,
    });

    // Populate variations state
    const loadedVariations = sc.variations || [];
    setVariations(loadedVariations.map((v) => ({
      id: v.id,
      variation_name: v.variation_name,
      number_of_sr: v.number_of_sr,
      schedule_after_days: v.schedule_after_days,
      per_kg_price: v.per_kg_price !== undefined ? v.per_kg_price : '',
      bulk_price: v.bulk_price !== undefined ? v.bulk_price : '',
      status: v.status,
      display_order: v.display_order
    })));
    setVariationErrors(loadedVariations.map(() => ({
      variation_name: '',
      number_of_sr: '',
      per_kg_price: '',
      bulk_price: '',
      schedule_after_days: ''
    })));

    setImagePreview(sc.image ? `${IMAGE_BASE_URL}/SubCategory/${sc.image}` : null);
    setSelectedId(sc.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    // Validate variations before submission
    if (!validateVariationsForm()) {
      toast.error('Please resolve validation errors in the Variations section');
      return;
    }

    setSubmitting(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
    if (subCategoryImage) payload.append('subcategory_image', subCategoryImage);
    
    // Append variations array as JSON string
    payload.append('variations', JSON.stringify(variations));

    try {
      if (isEditMode) {
        await api.put(`/sub-categories/${selectedId}`, payload);
        toast.success('Sub-category updated successfully');
      } else {
        await api.post('/sub-categories', payload);
        toast.success('Sub-category created successfully');
      }
      setIsFormOpen(false);
      resetForm();
      setPage(1);                             // jump to page 1 so new item is visible
      setRefreshTrigger((t) => t + 1);        // trigger useEffect to reload table
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (sc) => {
    const newStatus = sc.status === 1 ? 0 : 1;
    try {
      await api.patch(`/sub-categories/${sc.id}/status`, { status: newStatus });
      toast.success('Status updated');
      setRefreshTrigger((t) => t + 1);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteSubCategory = async () => {
    try {
      await api.delete(`/sub-categories/${idToDelete}`);
      toast.success('Sub-category deleted');
      setIsDeleteModalOpen(false);
      setRefreshTrigger((t) => t + 1);
    } catch {
      toast.error('Failed to delete sub-category');
    }
  };

  return (
    <div className="w-full">
      {isFormOpen ? (
        /* ─── FORM PANEL ─────────────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEditMode ? 'Edit Sub-Category' : 'Add New Sub-Category'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Fields marked * are required</p>
            </div>
            <button
              onClick={() => { setIsFormOpen(false); resetForm(); }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* LEFT COLUMN */}
              <div className="space-y-6">

                {/* Category Dropdown — MOST IMPORTANT */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Parent Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm"
                  >
                    <option value="">— Select a Category —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sub-Category Name *
                  </label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleInputChange} required
                    placeholder="e.g. Men's Shoes, Laptops…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm"
                  />
                </div>

                {/* Sub-Category Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sub-Category Color
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text" name="color" value={formData.color || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. #6366F1, rgb(99, 102, 241)…"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-mono"
                      />
                    </div>
                    <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                      <input
                        type="color" name="color" value={formData.color && formData.color.startsWith('#') && formData.color.length === 7 ? formData.color : '#6366f1'}
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                      />
                    </div>
                  </div>
                </div>

                {/* Slug (auto) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Slug <span className="font-normal lowercase tracking-normal text-violet-400">(auto-generated)</span>
                  </label>
                  <input
                    type="text" name="slug" value={formData.slug}
                    onChange={handleInputChange} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-mono text-slate-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    name="description" value={formData.description}
                    onChange={handleInputChange} rows="4"
                    placeholder="Describe this sub-category…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sub-Category Image *
                  </label>
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 transition-colors bg-slate-50 h-48">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Click to upload image</p>
                        <p className="text-[10px] text-slate-300 mt-1">JPG, PNG, WEBP — max 5 MB</p>
                      </div>
                    )}
                    <input
                      type="file" onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required={!isEditMode} accept="image/*"
                    />
                  </div>
                </div>

                {/* Alt Tag */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alt Tag</label>
                  <input
                    type="text" name="alt_tag" value={formData.alt_tag}
                    onChange={handleInputChange}
                    placeholder="Image alt text for SEO…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm"
                  />
                </div>

                {/* Meta Title + Status row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meta Title *</label>
                    <input
                      type="text" name="meta_title" value={formData.meta_title}
                      onChange={handleInputChange} required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      name="status" value={formData.status} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Description — full width */}
            <div className="mt-8">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meta Description *</label>
              <textarea
                name="meta_description" value={formData.meta_description}
                onChange={handleInputChange} rows="2" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm resize-none"
              />
            </div>

            {/* Variations Card Section */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Variations</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure service variations, schedule periods, and ordering.</p>
                </div>
                <button
                  type="button"
                  onClick={addVariation}
                  className="flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-md shadow-violet-100 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add Variation
                </button>
              </div>

              <div className="p-6">
                {variations.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                    <p className="text-sm text-slate-400 font-medium">No variations added yet.</p>
                    <p className="text-xs text-slate-300 mt-1">Click "Add Variation" to define your service pricing and schedule.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                          <th className="p-3 w-10 text-center"></th> {/* Drag handle column */}
                          <th className="p-3">Variation Name *</th>
                          <th className="p-3 w-32">Number of SR *</th>
                          <th className="p-3 w-44">Schedule After Days *</th>
                          <th className="p-3 w-36">Par Kg Price *</th>
                          <th className="p-3 w-36">Bulk Price *</th>
                          <th className="p-3 w-36">Status *</th>
                          <th className="p-3 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variations.map((v, index) => (
                          <tr
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`transition-colors duration-150 ${
                              draggedIndex === index ? 'bg-violet-50/70 opacity-50' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            {/* Drag handle */}
                            <td className="p-3 text-center">
                              <div
                                className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                            </td>

                            {/* Variation Name */}
                            <td className="p-3">
                              <input
                                type="text"
                                value={v.variation_name}
                                onChange={(e) => handleVariationChange(index, 'variation_name', e.target.value)}
                                placeholder="e.g. Daily, Weekly, Monthly..."
                                className={`w-full bg-slate-50 border rounded-xl py-2 px-3 outline-none text-xs transition-all ${
                                  variationErrors[index]?.variation_name
                                    ? 'border-red-300 focus:ring-4 focus:ring-red-50 focus:border-red-400'
                                    : 'border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                                }`}
                              />
                              {variationErrors[index]?.variation_name && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                                  {variationErrors[index].variation_name}
                                </p>
                              )}
                            </td>

                            {/* Number of SR */}
                            <td className="p-3">
                              <input
                                type="number"
                                min="1"
                                value={v.number_of_sr}
                                onChange={(e) => handleVariationChange(index, 'number_of_sr', e.target.value)}
                                placeholder="e.g. 4"
                                className={`w-full bg-slate-50 border rounded-xl py-2 px-3 outline-none text-xs transition-all ${
                                  variationErrors[index]?.number_of_sr
                                    ? 'border-red-300 focus:ring-4 focus:ring-red-50 focus:border-red-400'
                                    : 'border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                                }`}
                              />
                              {variationErrors[index]?.number_of_sr && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                                  {variationErrors[index].number_of_sr}
                                </p>
                              )}
                            </td>

                            {/* Schedule After Days */}
                            <td className="p-3">
                              <input
                                type="number"
                                min="1"
                                value={v.schedule_after_days}
                                onChange={(e) => handleVariationChange(index, 'schedule_after_days', e.target.value)}
                                placeholder="e.g. 7"
                                className={`w-full bg-slate-50 border rounded-xl py-2 px-3 outline-none text-xs transition-all ${
                                  variationErrors[index]?.schedule_after_days
                                    ? 'border-red-300 focus:ring-4 focus:ring-red-50 focus:border-red-400'
                                    : 'border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                                }`}
                              />
                              {variationErrors[index]?.schedule_after_days && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                                  {variationErrors[index].schedule_after_days}
                                </p>
                              )}
                            </td>

                            {/* Par Kg Price */}
                            <td className="p-3">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={v.per_kg_price}
                                  onChange={(e) => handleVariationChange(index, 'per_kg_price', e.target.value)}
                                  placeholder="0.00"
                                  className={`w-full bg-slate-50 border rounded-xl py-2 pl-7 pr-3 outline-none text-xs transition-all ${
                                    variationErrors[index]?.per_kg_price
                                      ? 'border-red-300 focus:ring-4 focus:ring-red-50 focus:border-red-400'
                                      : 'border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                                  }`}
                                />
                              </div>
                              {variationErrors[index]?.per_kg_price && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                                  {variationErrors[index].per_kg_price}
                                </p>
                              )}
                            </td>

                            {/* Bulk Price */}
                            <td className="p-3">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={v.bulk_price}
                                  onChange={(e) => handleVariationChange(index, 'bulk_price', e.target.value)}
                                  placeholder="0.00"
                                  className={`w-full bg-slate-50 border rounded-xl py-2 pl-7 pr-3 outline-none text-xs transition-all ${
                                    variationErrors[index]?.bulk_price
                                      ? 'border-red-300 focus:ring-4 focus:ring-red-50 focus:border-red-400'
                                      : 'border-slate-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-400'
                                  }`}
                                />
                              </div>
                              {variationErrors[index]?.bulk_price && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                                  {variationErrors[index].bulk_price}
                                </p>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-3">
                              <select
                                value={v.status}
                                onChange={(e) => handleVariationChange(index, 'status', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-xs focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all font-medium text-slate-700"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => deleteVariation(index)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Remove Variation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsFormOpen(false); resetForm(); }}
                className="flex items-center px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="flex items-center px-8 py-2.5 rounded-xl font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-100 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving…' : isEditMode ? 'Update Sub-Category' : 'Save Sub-Category'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ─── LIST VIEW ──────────────────────────────────────────────── */
        <>
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Sub-Category Management</h1>
              <p className="text-slate-500 mt-1 text-sm">Manage sub-categories linked to parent categories.</p>
            </div>
            <button
              onClick={openAddForm}
              className="flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold shadow-lg shadow-violet-100 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Sub-Category
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Search + Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Search sub-categories…"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all text-sm"
                />
              </form>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Category Filter */}
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-8 pr-4 outline-none focus:ring-2 focus:ring-violet-100 text-xs font-bold text-slate-600 appearance-none min-w-[150px]"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-8 pr-4 outline-none focus:ring-2 focus:ring-violet-100 text-xs font-bold text-slate-600 appearance-none min-w-[130px]"
                  >
                    <option value="">All Status</option>
                    <option value="1">Active Only</option>
                    <option value="0">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                    <th className="p-5">ID</th>
                    <th className="p-5">Image</th>
                    <th className="p-5">Sub-Category</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Slug</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Created</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-20 text-center">
                        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-medium text-slate-400">Loading data…</p>
                      </td>
                    </tr>
                  ) : subCategories.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Layers className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-600 font-bold">No Sub-Categories Found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new sub-category.</p>
                      </td>
                    </tr>
                  ) : (
                    subCategories.map((sc) => (
                      <tr key={sc.id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* ID */}
                        <td className="p-5 text-xs font-mono text-slate-400">#{sc.id}</td>

                        {/* Image */}
                        <td className="p-5">
                          <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                            {sc.image ? (
                              <img
                                src={`${IMAGE_BASE_URL}/SubCategory/${sc.image}`}
                                alt={sc.alt_tag || sc.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-full h-full p-3 text-slate-300" />
                            )}
                          </div>
                        </td>

                        {/* Sub-Category Name */}
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {sc.color && (
                              <span 
                                className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0 shadow-sm" 
                                style={{ backgroundColor: sc.color }}
                                title={`Color: ${sc.color}`}
                              />
                            )}
                            <p className="font-bold text-slate-800 text-sm">{sc.name}</p>
                          </div>
                        </td>

                        {/* Parent Category */}
                        <td className="p-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                            {sc.category?.name || '—'}
                          </span>
                        </td>

                        {/* Slug */}
                        <td className="p-5">
                          <p className="text-[10px] font-mono text-slate-400">{sc.slug}</p>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-5">
                          <button
                            onClick={() => toggleStatus(sc)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                              sc.status === 1
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${sc.status === 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {sc.status === 1 ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Created Date */}
                        <td className="p-5 text-xs text-slate-500 font-medium">
                          {new Date(sc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Actions */}
                        <td className="p-5 text-right space-x-2">
                          <button
                            onClick={() => openEditForm(sc)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(sc.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-bold text-slate-400">
                  Showing {subCategories.length} of {totalItems} items
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i} onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          page === i + 1
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-100'
                            : 'text-slate-400 hover:bg-white border border-transparent hover:border-slate-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
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
        title="Delete Sub-Category?"
        message="This will soft-delete the sub-category (status = 0). You can restore it by changing the status later."
        onConfirm={deleteSubCategory}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmLabel="Yes, Delete it"
      />
    </div>
  );
};

export default SubCategories;
