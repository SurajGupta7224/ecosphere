import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Plus, Trash2, ArrowRight, CheckCircle2, AlertTriangle, Play,
  RefreshCw, Download, FileText, Check, ChevronDown, ChevronUp, Layers, Settings, ShieldAlert,
  Menu, Info, Clock, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import ConfirmModal from '../components/ConfirmModal';

const GENERATION_OPTIONS = [
  { id: 'createMigration', label: 'Create Migration', defaultVal: true },
  { id: 'createModel', label: 'Create Sequelize Model', defaultVal: true },
  { id: 'createController', label: 'Create Controller', defaultVal: true },
  { id: 'createService', label: 'Create Service Layer', defaultVal: true },
  { id: 'createRoutes', label: 'Create API Routes', defaultVal: true },
  { id: 'registerRoute', label: 'Register Route Automatically', defaultVal: true },
  { id: 'registerSidebar', label: 'Register Sidebar Automatically', defaultVal: true },
  { id: 'createPermissions', label: 'Create CRUD Permissions', defaultVal: true },
  { id: 'createReactPage', label: 'Create React Listing Page', defaultVal: true },
  { id: 'createCreatePage', label: 'Create React Form Page', defaultVal: true },
  { id: 'createViewPage', label: 'Create React View Panel', defaultVal: true },
  { id: 'createExport', label: 'Create Export APIs', defaultVal: true }
];

export default function ModuleCreation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'history'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // Form State
  const [moduleName, setModuleName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [tableName, setTableName] = useState('');
  const [description, setDescription] = useState('');
  const [menuGroup, setMenuGroup] = useState('General Master');
  const [customMenuGroup, setCustomMenuGroup] = useState('');
  const [menuIcon, setMenuIcon] = useState('ClipboardList');
  const [menuOrder, setMenuOrder] = useState('1');
  const [moduleStatus, setModuleStatus] = useState('Active');

  // Checkboxes options
  const [opts, setOpts] = useState(
    GENERATION_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.defaultVal }), {})
  );

  // Fields state
  const [fields, setFields] = useState([
    {
      id: 1,
      fieldName: 'name',
      displayLabel: 'Name',
      databaseColumn: 'name',
      fieldType: 'Text',
      databaseType: 'VARCHAR',
      length: '255',
      placeholder: 'Enter name',
      defaultValue: '',
      required: true,
      unique: false,
      nullable: false,
      indexed: false,
      searchable: true,
      sortable: true,
      filterable: false,
      foreignKeyConfig: {
        referencedTable: '',
        referencedColumn: 'id',
        displayColumn: '',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    },
    {
      id: 2,
      fieldName: 'status',
      displayLabel: 'Status',
      databaseColumn: 'status',
      fieldType: 'Select',
      databaseType: 'ENUM',
      length: '',
      placeholder: 'Active, Inactive',
      defaultValue: 'Active',
      required: true,
      unique: false,
      nullable: false,
      indexed: true,
      searchable: false,
      sortable: true,
      filterable: true,
      foreignKeyConfig: {
        referencedTable: '',
        referencedColumn: 'id',
        displayColumn: '',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    }
  ]);

  // Generation progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [genSuccess, setGenSuccess] = useState(false);
  const [genError, setGenError] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState([]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/developer/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load generation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      Promise.resolve().then(() => {
        fetchHistory();
      });
    }
  }, [activeTab]);

  // Sync auto generation of slug and table name
  const handleModuleNameChange = (val) => {
    setModuleName(val);
    if (val) {
      const display = val.replace(/([A-Z])/g, ' $1').trim();
      setDisplayName(display);

      const generatedSlug = val.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      setSlug(generatedSlug);

      const generatedTable = val.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() + 's';
      setTableName(generatedTable);
    } else {
      setDisplayName('');
      setSlug('');
      setTableName('');
    }
  };

  const handleAddField = () => {
    setFields(prev => [
      ...prev,
      {
        id: Date.now(),
        fieldName: '',
        displayLabel: '',
        databaseColumn: '',
        fieldType: 'Text',
        databaseType: 'VARCHAR',
        length: '255',
        placeholder: '',
        defaultValue: '',
        required: false,
        unique: false,
        nullable: true,
        indexed: false,
        searchable: false,
        sortable: false,
        filterable: false,
        foreignKeyConfig: {
          referencedTable: '',
          referencedColumn: 'id',
          displayColumn: '',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      }
    ]);
  };

  const handleRemoveField = (id) => {
    if (fields.length <= 1) {
      toast.error("Modules must have at least one field!");
      return;
    }
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const handleFieldChange = (id, key, val) => {
    setFields(prev => prev.map(f => {
      if (f.id === id) {
        const updated = { ...f, [key]: val };
        
        // Auto fill helper
        if (key === 'fieldName') {
          updated.displayLabel = val.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          updated.databaseColumn = val.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
        }

        if (key === 'fieldType') {
          // Adjust defaults
          if (val === 'Number') {
            updated.databaseType = 'INT';
            updated.length = '';
          } else if (val === 'Textarea') {
            updated.databaseType = 'TEXT';
            updated.length = '';
          } else if (val === 'Boolean' || val === 'Checkbox') {
            updated.databaseType = 'BOOLEAN';
            updated.length = '';
          } else if (val === 'Date') {
            updated.databaseType = 'DATE';
            updated.length = '';
          } else if (val === 'DateTime') {
            updated.databaseType = 'DATETIME';
            updated.length = '';
          } else if (val === 'Timestamp') {
            updated.databaseType = 'TIMESTAMP';
            updated.length = '';
            updated.defaultValue = 'CURRENT_TIMESTAMP';
          } else if (val === 'Foreign Key') {
            updated.databaseType = 'INT';
            updated.length = '';
            updated.nullable = false;
          } else if (val === 'Image' || val === 'File') {
            updated.databaseType = 'VARCHAR';
            updated.length = '255';
          }
        }
        return updated;
      }
      return f;
    }));
  };

  const handleFkChange = (id, key, val) => {
    setFields(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          foreignKeyConfig: {
            ...f.foreignKeyConfig,
            [key]: val
          }
        };
      }
      return f;
    }));
  };

  const handleOptionToggle = (id) => {
    setOpts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerGeneration = async () => {
    if (!moduleName.trim()) {
      toast.error("Module name is required");
      return;
    }

    // Validate fields
    for (const f of fields) {
      if (!f.fieldName.trim() || !f.databaseColumn.trim()) {
        toast.error("All fields must have a name and database column");
        return;
      }
      if (f.fieldType === 'Foreign Key') {
        const fk = f.foreignKeyConfig;
        if (!fk.referencedTable || !fk.displayColumn) {
          toast.error(`Please complete Foreign Key settings for field: ${f.fieldName}`);
          return;
        }
      }
    }

    setIsGenerating(true);
    setGenSuccess(false);
    setGenError(null);
    setProgress(15);
    setLogs(["[GENERATOR] Starting module initialization...", `[GENERATOR] Target Module: ${moduleName}`]);

    const payload = {
      moduleName,
      displayName,
      slug,
      tableName,
      description,
      menuGroup: menuGroup === 'Custom' ? customMenuGroup : menuGroup,
      menuIcon,
      menuOrder: parseInt(menuOrder),
      status: moduleStatus,
      options: opts,
      fields
    };

    // Simulate logs in stages
    const timer1 = setTimeout(() => {
      setProgress(40);
      setLogs(prev => [...prev, "[GENERATOR] Database schema generated successfully.", "[GENERATOR] Creating Sequelize models & index associations..."]);
    }, 1200);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setLogs(prev => [...prev, "[GENERATOR] Model definitions saved.", "[GENERATOR] Generating express controllers and routers...", "[GENERATOR] Creating React pages and table components..."]);
    }, 2800);

    try {
      const res = await api.post('/developer/generate', payload);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgress(100);
      setLogs(res.data.logs || []);
      setGeneratedFiles(res.data.files || []);
      setGenSuccess(true);
      toast.success("Module generated successfully!");
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgress(100);
      setGenError(err.response?.data?.message || err.message);
      setLogs(err.response?.data?.logs || [err.message]);
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerRollback = (id) => {
    setModuleToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;
    setDeleteModalOpen(false);
    const id = moduleToDelete;
    setModuleToDelete(null);

    const loadingToast = toast.loading("Initiating deletion...");
    try {
      await api.post(`/developer/history/${id}/rollback`);
      toast.success("Module deleted successfully", { id: loadingToast });
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed", { id: loadingToast });
    }
  };

  return (
    <div className="w-full pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Code2 className="w-7 h-7 text-violet-600 animate-pulse" /> Module Creation CRUD Generator
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Automatically generate models, tables, APIs, and React interfaces in one click.</p>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'generator' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History &amp; Logs
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="space-y-8">
          
          {/* SECTION 1: Basic Information */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-violet-500" /> Section 1: Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Module Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Product"
                  value={moduleName}
                  onChange={e => handleModuleNameChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Product Catalog"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Module Slug (Auto)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. product-catalog"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Database Table Name (Auto)</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={e => setTableName(e.target.value)}
                  placeholder="e.g. products"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Group</label>
                <select
                  value={menuGroup}
                  onChange={e => setMenuGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold cursor-pointer"
                >
                  <option value="General Master">General Master</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Reports">Reports</option>
                  <option value="Settings">Settings</option>
                  <option value="Custom">Custom / Standalone</option>
                </select>
              </div>

              {menuGroup === 'Custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custom Group Name</label>
                  <input
                    type="text"
                    value={customMenuGroup}
                    onChange={e => setCustomMenuGroup(e.target.value)}
                    placeholder="e.g. Developer Tools"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Icon (Lucide)</label>
                <input
                  type="text"
                  value={menuIcon}
                  onChange={e => setMenuIcon(e.target.value)}
                  placeholder="e.g. ShoppingBag"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Order</label>
                <input
                  type="number"
                  value={menuOrder}
                  onChange={e => setMenuOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={moduleStatus}
                  onChange={e => setModuleStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of the module..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition-all text-sm font-semibold h-20"
              />
            </div>
          </div>

          {/* SECTION 2: Generation Options */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-violet-500" /> Section 2: Generation Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {GENERATION_OPTIONS.map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl px-5 py-4 cursor-pointer select-none transition-all border ${
                    opts[opt.id]
                      ? 'bg-violet-50 border-violet-200 shadow-sm text-violet-800'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={opts[opt.id]}
                    onChange={() => handleOptionToggle(opt.id)}
                    className="w-4 h-4 cursor-pointer accent-violet-600"
                  />
                  <span className="text-xs font-bold">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SECTION 3 & 4: Field & Foreign Key Configuration */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-white">
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Section 3: Field Configurations</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Add and configure columns for the database and UI fields.</p>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Field
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-widest bg-slate-50/50">
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Display Label</th>
                    <th className="p-3">Column Name</th>
                    <th className="p-3">Field Type</th>
                    <th className="p-3">Database Type</th>
                    <th className="p-3">Len</th>
                    <th className="p-3">Default</th>
                    <th className="p-3 text-center">Req</th>
                    <th className="p-3 text-center">Uniq</th>
                    <th className="p-3 text-center">Idx</th>
                    <th className="p-3 text-center">Search</th>
                    <th className="p-3 text-center">Sort</th>
                    <th className="p-3 text-center">Filter</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field) => (
                    <tr key={field.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-3">
                        <input
                          type="text"
                          value={field.fieldName}
                          onChange={e => handleFieldChange(field.id, 'fieldName', e.target.value)}
                          placeholder="e.g. price"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none w-32 focus:border-violet-400"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={field.displayLabel}
                          onChange={e => handleFieldChange(field.id, 'displayLabel', e.target.value)}
                          placeholder="e.g. Price"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none w-32 focus:border-violet-400"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={field.databaseColumn}
                          onChange={e => handleFieldChange(field.id, 'databaseColumn', e.target.value)}
                          placeholder="e.g. price"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-semibold outline-none w-32 focus:border-violet-400"
                        />
                      </td>

                      <td className="p-3">
                        <select
                          value={field.fieldType}
                          onChange={e => handleFieldChange(field.id, 'fieldType', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none w-32 cursor-pointer"
                        >
                          {['Text', 'Number', 'Email', 'Password', 'Textarea', 'Date', 'Time', 'DateTime', 'Timestamp', 'Boolean', 'Checkbox', 'Radio', 'Select', 'Image', 'File', 'Foreign Key'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3">
                        <select
                          value={field.databaseType}
                          onChange={e => handleFieldChange(field.id, 'databaseType', e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none w-32 cursor-pointer"
                        >
                          {['VARCHAR', 'INT', 'BIGINT', 'TEXT', 'LONGTEXT', 'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'DOUBLE', 'DECIMAL', 'ENUM', 'JSON', 'UUID'].map(dt => (
                            <option key={dt} value={dt}>{dt}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={field.length}
                          onChange={e => handleFieldChange(field.id, 'length', e.target.value)}
                          placeholder="255"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none w-14 focus:border-violet-400"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="text"
                          value={field.defaultValue}
                          onChange={e => handleFieldChange(field.id, 'defaultValue', e.target.value)}
                          placeholder="default"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none w-20 focus:border-violet-400"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => handleFieldChange(field.id, 'required', e.target.checked)}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.unique}
                          onChange={e => handleFieldChange(field.id, 'unique', e.target.checked)}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.indexed}
                          onChange={e => handleFieldChange(field.id, 'indexed', e.target.checked)}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.searchable}
                          onChange={e => handleFieldChange(field.id, 'searchable', e.target.checked)}
                          disabled={['Image', 'File', 'Boolean'].includes(field.fieldType)}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.sortable}
                          onChange={e => handleFieldChange(field.id, 'sortable', e.target.checked)}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={field.filterable}
                          onChange={e => handleFieldChange(field.id, 'filterable', e.target.checked)}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveField(field.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Foreign Key panels */}
            {fields.some(f => f.fieldType === 'Foreign Key') && (
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Section 4: Foreign Key Configurations
                </h3>
                <div className="space-y-4">
                  {fields.filter(f => f.fieldType === 'Foreign Key').map(field => (
                    <div key={field.id} className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Field Name</p>
                        <p className="text-xs font-black text-slate-700">{field.fieldName}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Referenced Table</label>
                        <select
                          value={field.foreignKeyConfig.referencedTable}
                          onChange={e => handleFkChange(field.id, 'referencedTable', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none cursor-pointer"
                        >
                          <option value="">Select Table</option>
                          {['users', 'roles', 'categories', 'sub_categories', 'corporations', 'zones', 'wards', 'time_slots'].map(tbl => (
                            <option key={tbl} value={tbl}>{tbl}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Referenced Column</label>
                        <input
                          type="text"
                          value={field.foreignKeyConfig.referencedColumn}
                          onChange={e => handleFkChange(field.id, 'referencedColumn', e.target.value)}
                          placeholder="id"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Display Column</label>
                        <input
                          type="text"
                          value={field.foreignKeyConfig.displayColumn}
                          onChange={e => handleFkChange(field.id, 'displayColumn', e.target.value)}
                          placeholder="e.g. name / category_name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trigger block */}
          <div className="flex justify-end pt-4">
            <button
              onClick={triggerGeneration}
              className="flex items-center px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Play className="w-5 h-5 mr-2" /> Generate Module
            </button>
          </div>
        </div>
      ) : (
        /* History & Rollbacks */
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Section 19: Generator History</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage generated modules and trigger rollbacks or regenerations.</p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <th className="p-5">Module Name</th>
                  <th className="p-5">Table Name</th>
                  <th className="p-5">Created By</th>
                  <th className="p-5">Date Created</th>
                  <th className="p-5">Files Created</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingHistory ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm font-medium text-slate-400">Loading module logs...</p>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <p className="text-slate-600 font-bold">No Generated Modules</p>
                      <p className="text-xs text-slate-400 mt-1">Configure and generate a module above to get started.</p>
                    </td>
                  </tr>
                ) : (
                  history.map((hRecord) => (
                    <tr key={hRecord.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-5 font-black text-slate-800">{hRecord.module_name}</td>
                      <td className="p-5 text-xs font-mono text-slate-600">{hRecord.table_name}</td>
                      <td className="p-5 text-sm font-semibold text-slate-700">{hRecord.creator?.name || 'Admin'}</td>
                      <td className="p-5 text-xs text-slate-500 font-medium">
                        {new Date(hRecord.created_at).toLocaleString()}
                      </td>
                      <td className="p-5 text-xs text-slate-500 max-w-[200px] truncate">
                        {(() => {
                          let files = [];
                          if (Array.isArray(hRecord.files_generated)) {
                            files = hRecord.files_generated;
                          } else if (typeof hRecord.files_generated === 'string') {
                            try {
                              files = JSON.parse(hRecord.files_generated);
                            } catch (err) {
                              console.error(err);
                              files = [];
                            }
                          }
                          return (files || []).map(f => String(f).split(/[\\/]/).pop()).join(", ");
                        })()}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          hRecord.status === 'Success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {hRecord.status}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button
                          onClick={() => triggerRollback(hRecord.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-black uppercase rounded-lg transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress / Logs Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative bg-slate-950 text-slate-100 rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 max-w-2xl w-full flex flex-col h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="border-b border-slate-800 pb-5 shrink-0">
              <div className="flex items-center gap-3">
                <Code2 className="w-8 h-8 text-violet-400 animate-spin" />
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white uppercase">Module Generation Progress</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Please wait while the generator builds your features...</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Logs Body */}
            <div className="flex-1 overflow-y-auto my-5 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 font-mono text-xs space-y-2 select-text custom-scrollbar">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('FATAL') ? 'text-rose-400 font-bold' : log.includes('Success') || log.includes('completed') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 pt-5 flex items-center justify-between shrink-0">
              <p className="text-xs font-semibold text-slate-400 font-mono">Progress: {progress}%</p>
              {progress === 100 && (
                <button
                  onClick={() => setIsGenerating(false)}
                  className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success / Result Screen overlay */}
      {genSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 max-w-xl w-full text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Module Generated Successfully!</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Your new module <span className="font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">{moduleName}</span> is compiled, migrated, and registered automatically.
            </p>

            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Files Created</h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-600 custom-scrollbar">
                {generatedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                    <span className="truncate">{file.split(/[\\/]/).pop()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setGenSuccess(false); setModuleName(''); setFields([]); }}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Generate Another
              </button>
              <button
                onClick={() => { setGenSuccess(false); navigate(`/${slug}`); }}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Open Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal Overlay */}
      {genError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 max-w-xl w-full text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Generation Failed!</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              An error occurred during generation. All files and table creations have been safely rolled back.
            </p>

            <div className="my-6 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-left font-mono text-xs text-rose-700 max-h-40 overflow-y-auto">
              {genError}
            </div>

            <button
              onClick={() => setGenError(null)}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Module"
        message="Are you sure you want to delete this module? This will drop database tables, delete all generated files, and revert all configuration changes!"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setModuleToDelete(null);
        }}
      />
    </div>
  );
}
