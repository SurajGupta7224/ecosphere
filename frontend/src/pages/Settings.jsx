import { useState, useEffect, useRef } from 'react';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import {
  Globe, Image as ImageIcon, Palette, Building2, Mail, Shield,
  Cpu, ClipboardList, Save, RotateCcw, ChevronRight,
  Sun, Moon, Eye, EyeOff, Send, Upload, RefreshCw, X, Filter,
  SlidersHorizontal
} from 'lucide-react';

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',  label: 'General Settings',  icon: Globe },
  { id: 'branding', label: 'Branding Settings', icon: ImageIcon },
  { id: 'theme',    label: 'Theme Settings',    icon: Palette },
  { id: 'company',  label: 'Company Settings',  icon: Building2 },
  { id: 'email',    label: 'Email Settings',    icon: Mail },
  { id: 'security', label: 'Security Settings', icon: Shield },
  { id: 'system',   label: 'System Settings',   icon: Cpu },
  { id: 'audit',    label: 'Audit Logs',        icon: ClipboardList },
];

const TIMEZONES = ['Asia/Kolkata','UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Dubai','Australia/Sydney'];
const DATE_FORMATS = ['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD','DD-MM-YYYY','MMM DD, YYYY'];
const TIME_FORMATS = ['12-hour (hh:mm A)','24-hour (HH:mm)'];
const LANGUAGES = ['English','Hindi','Tamil','Kannada','Spanish','French','German','Arabic','Japanese'];
const CURRENCIES = ['INR (₹)','USD ($)','EUR (€)','GBP (£)','AED (د.إ)','JPY (¥)'];

// ─── Shared Components ────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{children}</label>
);

const Hint = ({ children }) => (
  <p className="text-xs text-slate-400 mt-1">{children}</p>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
      placeholder:text-slate-300 transition-all ${className}`}
    {...props}
  />
);

const Select = ({ options = [], className = '', ...props }) => (
  <select
    className={`w-full px-3 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all ${className}`}
    {...props}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Field = ({ label, hint, children, span2 }) => (
  <div className={span2 ? 'md:col-span-2' : ''}>
    <Label>{label}</Label>
    {children}
    {hint && <Hint>{hint}</Hint>}
  </div>
);

const Toggle = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 px-4 bg-white border-b border-slate-100 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40
        ${value ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
        ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const ColorField = ({ label, name, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all">
      <input
        type="color"
        value={value || '#6366f1'}
        onChange={onChange}
        name={name}
        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
      />
      <input
        type="text"
        value={value || '#6366f1'}
        onChange={onChange}
        name={name}
        className="flex-1 text-sm text-slate-800 bg-transparent border-0 outline-none font-mono"
      />
    </div>
  </div>
);

const ImageUploadField = ({ label, current, name, onChange, hint }) => {
  const ref = useRef();
  const [preview, setPreview] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [current, preview]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(e);
    }
  };

  const imgSrc = preview || (current ? `${IMAGE_BASE_URL}/${current}` : null);

  return (
    <div>
      <Label>{label}</Label>
      <div
        onClick={() => ref.current.click()}
        className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer
          hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group text-center"
      >
        {imgSrc && !hasError ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={imgSrc}
              alt={label}
              className="max-h-16 object-contain rounded"
              onError={() => setHasError(true)}
            />
            <span className="text-xs text-indigo-500 font-medium group-hover:underline">Click to replace</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
              <Upload className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Click to upload</span>
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
          </div>
        )}
      </div>
      <input ref={ref} type="file" name={name} accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
};

const SaveBar = ({ onSave, onReset, saving }) => (
  <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100">
    <button
      type="button"
      onClick={onReset}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100
        hover:bg-slate-200 rounded-lg transition-all"
    >
      <RotateCcw className="w-3.5 h-3.5" /> Reset
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
        bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
        rounded-lg shadow-sm shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving
        ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
        : <><Save className="w-3.5 h-3.5" /> Save Settings</>}
    </button>
  </div>
);

const SectionCard = ({ title, icon: Icon, description, badge, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100" style={{ background: 'var(--card-header-bg)' }}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          {badge && <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">{badge}</span>}
        </div>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { refreshSettings, t } = useSettings();

  const [general,  setGeneral]  = useState({});
  const [branding, setBranding] = useState({});
  const [theme,    setTheme]    = useState({});
  const [company,  setCompany]  = useState({});
  const [email,    setEmail]    = useState({});
  const [security, setSecurity] = useState({});
  const [system,   setSystem]   = useState({});
  const [brandFiles, setBrandFiles] = useState({});

  // Email test
  const [testEmail, setTestEmail]   = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [showPass, setShowPass]     = useState(false);

  // Audit
  const [auditLogs,    setAuditLogs]    = useState([]);
  const [auditMeta,    setAuditMeta]    = useState({ total: 0, page: 1, totalPages: 1 });
  const [auditFilters, setAuditFilters] = useState({ module: '', start_date: '', end_date: '', page: 1, limit: 15 });
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => { if (activeTab === 'audit') fetchAuditLogs(); }, [activeTab, auditFilters]);

  // Load Google Font dynamically for live preview
  useEffect(() => {
    if (theme.font_family) {
      const fontName = theme.font_family;
      const systemFonts = ['system-ui', 'sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New'];
      if (!systemFonts.includes(fontName)) {
        const id = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
          document.head.appendChild(link);
        }
      }
    }
  }, [theme.font_family]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        const s = res.data.settings;
        setGeneral(s.app      || {});
        setBranding(s.branding || {});
        setTheme(s.theme      || {});
        setCompany(s.company  || {});
        setEmail(s.email      || {});
        setSecurity(s.security || {});
        setSystem(s.system    || {});
      }
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(auditFilters).filter(([, v]) => v));
      const res = await api.get('/settings/audit-logs', { params });
      if (res.data.success) {
        setAuditLogs(res.data.logs);
        setAuditMeta(res.data.pagination);
      }
    } catch { toast.error('Failed to load audit logs'); }
    finally { setAuditLoading(false); }
  };

  // patch: partial settings object to push instantly into SettingsContext
  const save = async (endpoint, payload, patch = null) => {
    setSaving(true);
    try {
      await api.put(endpoint, payload);
      toast.success('Settings saved successfully');
      refreshSettings(patch); // instant UI update + background re-fetch
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(branding).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
      Object.entries(brandFiles).forEach(([k, v]) => fd.append(k, v));
      await api.put('/settings/branding', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Branding settings saved');
      // Push branding patch instantly (companyName → displayed in sidebar)
      refreshSettings({ companyName: branding.company_name, appName: branding.company_name });
      fetchSettings();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const testSmtp = async () => {
    if (!testEmail) return toast.error('Enter a recipient email');
    setSmtpTesting(true);
    try {
      const res = await api.post('/settings/email/test', { ...email, test_recipient: testEmail });
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'SMTP test failed'); }
    finally { setSmtpTesting(false); }
  };

  const f = setter => e => {
    const { name, value, type, checked } = e.target;
    setter(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBrandFile = e => {
    const { name, files } = e.target;
    if (files[0]) setBrandFiles(p => ({ ...p, [name]: files[0] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t('settings')}</h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">Manage your application configuration. Changes apply across the entire platform.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sticky top-6">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const labelKey = tab.id === 'audit' ? 'audit_logs' : `${tab.id}_settings`;
            const translatedLabel = t(labelKey);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                  ${active
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                style={active ? { background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' } : {}}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left leading-tight">{translatedLabel}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </button>
            );
          })}
        </aside>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-w-0">

          {/* GENERAL */}
          {activeTab === 'general' && (
            <SectionCard title={t('general_settings')} icon={Globe} description="Core application identity and locale configuration.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Application Name">
                  <Input name="app_name" value={general.app_name || ''} onChange={f(setGeneral)} placeholder="e.g. Ecosphere" />
                </Field>
                <Field label="Application Short Name">
                  <Input name="app_short_name" value={general.app_short_name || ''} onChange={f(setGeneral)} placeholder="e.g. ECO" />
                </Field>
                <Field label="Application Version">
                  <Input name="app_version" value={general.app_version || ''} onChange={f(setGeneral)} placeholder="e.g. 1.0.0" />
                </Field>
                <Field label="Timezone">
                  <Select name="timezone" value={general.timezone || 'Asia/Kolkata'} onChange={f(setGeneral)} options={TIMEZONES} />
                </Field>
                <Field label="Date Format">
                  <Select name="date_format" value={general.date_format || 'DD/MM/YYYY'} onChange={f(setGeneral)} options={DATE_FORMATS} />
                </Field>
                <Field label="Time Format">
                  <Select name="time_format" value={general.time_format || '12-hour (hh:mm A)'} onChange={f(setGeneral)} options={TIME_FORMATS} />
                </Field>
                <Field label="Default Language">
                  <Select name="default_language" value={general.default_language || 'English'} onChange={f(setGeneral)} options={LANGUAGES} />
                </Field>
                <Field label="Default Currency">
                  <Select name="default_currency" value={general.default_currency || 'INR (₹)'} onChange={f(setGeneral)} options={CURRENCIES} />
                </Field>
              </div>
              <SaveBar
                onSave={() => save('/settings/general', general, { appName: general.app_name, defaultLanguage: general.default_language })}
                onReset={fetchSettings}
                saving={saving}
              />
            </SectionCard>
          )}

          {/* BRANDING */}
          {activeTab === 'branding' && (
            <SectionCard title={t('branding_settings')} icon={ImageIcon} description="Logos, colours, and public-facing identity.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Company Name">
                  <Input name="company_name" value={branding.company_name || ''} onChange={f(setBranding)} placeholder="Ecosphere" />
                </Field>
                <Field label="Company Tagline">
                  <Input name="company_tagline" value={branding.company_tagline || ''} onChange={f(setBranding)} placeholder="Sustainable Future" />
                </Field>
                <Field label="Support Email">
                  <Input name="support_email" type="email" value={branding.support_email || ''} onChange={f(setBranding)} />
                </Field>
                <Field label="Support Phone">
                  <Input name="support_phone" value={branding.support_phone || ''} onChange={f(setBranding)} />
                </Field>
                <Field label="Footer Copyright" span2>
                  <Input name="footer_copyright" value={branding.footer_copyright || ''} onChange={f(setBranding)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-100">
                <ImageUploadField label="Company Logo" name="company_logo" current={branding.company_logo} onChange={handleBrandFile} hint="200×60px PNG recommended" />
                <ImageUploadField label="Favicon" name="favicon" current={branding.favicon} onChange={handleBrandFile} hint="32×32px ICO or PNG" />
                <ImageUploadField label="Login Page Logo" name="login_logo" current={branding.login_logo} onChange={handleBrandFile} hint="Displayed on login screen" />
                <ImageUploadField label="Login Background" name="login_bg" current={branding.login_bg} onChange={handleBrandFile} hint="1920×1080px JPG recommended" />
              </div>
              <SaveBar onSave={saveBranding} onReset={fetchSettings} saving={saving} />
            </SectionCard>
          )}

          {/* THEME */}
          {activeTab === 'theme' && (
            <SectionCard title={t('theme_settings')} icon={Palette} description="Customise the look and feel with colour tokens and theme mode.">
              {/* Mode Selector */}
              <div className="mb-6">
                <Label>Theme Mode</Label>
                <div className="flex gap-3 mt-2">
                  {[
                    { id: 'light', icon: Sun,  label: 'Light' },
                    { id: 'dark',  icon: Moon, label: 'Dark' },
                    { id: 'system', icon: Cpu, label: 'System' },
                  ].map(m => {
                    const active = theme.theme_type === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTheme(p => ({ ...p, theme_type: m.id }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                          ${active
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                      >
                        <m.icon className="w-4 h-4" /> {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="mb-6">
                <Label>Font Family</Label>
                <div className="max-w-xs mt-2">
                  <Select 
                    name="font_family" 
                    value={theme.font_family || 'Inter'} 
                    onChange={f(setTheme)} 
                    options={[
                      'Inter',
                      'Roboto',
                      'Poppins',
                      'Outfit',
                      'Plus Jakarta Sans',
                      'Montserrat',
                      'Playfair Display',
                      'Lora',
                      'Open Sans',
                      'Lato',
                      'Oswald',
                      'Merriweather',
                      'Nunito',
                      'Raleway',
                      'DM Sans',
                      'Ubuntu',
                      'Cabin',
                      'Fira Sans',
                      'Quicksand',
                      'Cinzel',
                      'EB Garamond',
                      'system-ui'
                    ]} 
                  />
                </div>
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ColorField label="Primary Color"    name="primary_color"    value={theme.primary_color}    onChange={f(setTheme)} />
                <ColorField label="Secondary Color"  name="secondary_color"  value={theme.secondary_color}  onChange={f(setTheme)} />
                <ColorField label="Sidebar Color"    name="sidebar_color"    value={theme.sidebar_color}    onChange={f(setTheme)} />
                <ColorField label="Sidebar Text Color" name="sidebar_text_color" value={theme.sidebar_text_color} onChange={f(setTheme)} />
                <ColorField label="Sidebar Active BG" name="sidebar_active_bg_color" value={theme.sidebar_active_bg_color} onChange={f(setTheme)} />
                <ColorField label="Sidebar Active Text" name="sidebar_active_text_color" value={theme.sidebar_active_text_color} onChange={f(setTheme)} />
                <ColorField label="Navbar Color"     name="navbar_color"     value={theme.navbar_color}     onChange={f(setTheme)} />
                <ColorField label="Card Background"  name="card_bg_color"    value={theme.card_bg_color}    onChange={f(setTheme)} />
                <ColorField label="Button Color"     name="button_color"     value={theme.button_color}     onChange={f(setTheme)} />
                <ColorField label="Text Color"       name="text_color"       value={theme.text_color}       onChange={f(setTheme)} />
              </div>

              {/* Live Preview */}
              <div
                className="mt-6 rounded-xl p-5 transition-all"
                style={{ 
                  backgroundColor: theme.sidebar_color || '#1e133c',
                  fontFamily: theme.font_family || 'Inter'
                }}
              >
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Live Preview (Theme & Buttons)</p>
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow"
                    style={{ backgroundColor: theme.primary_color || '#6366f1' }}
                  >Primary Button</button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow"
                    style={{ backgroundColor: theme.secondary_color || '#8b5cf6' }}
                  >Secondary</button>
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: theme.card_bg_color || '#fff', color: theme.text_color || '#1e293b' }}
                  >Card Text</span>
                </div>

                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Live Preview (Sidebar Menu)</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <div
                    className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: theme.sidebar_active_bg_color || '#ffffff1a',
                      color: theme.sidebar_active_text_color || '#ffffff'
                    }}
                  >
                    Active Menu Item
                  </div>
                  <div
                    className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      color: theme.sidebar_text_color || '#cbd5e1'
                    }}
                  >
                    Inactive Menu Item
                  </div>
                </div>
              </div>

              <SaveBar
                onSave={() => save('/settings/theme', theme, { theme })}
                onReset={fetchSettings}
                saving={saving}
              />
            </SectionCard>
          )}

          {/* COMPANY */}
          {activeTab === 'company' && (
            <SectionCard title={t('company_settings')} icon={Building2} description="Legal entity details, address, and business information.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Legal Company Name">
                  <Input name="legal_name" value={company.legal_name || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Registration Number">
                  <Input name="registration_number" value={company.registration_number || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="GST / Tax Number">
                  <Input name="tax_number" value={company.tax_number || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Website URL">
                  <Input name="website_url" type="url" value={company.website_url || ''} onChange={f(setCompany)} placeholder="https://" />
                </Field>
                <Field label="Contact Email">
                  <Input name="contact_email" type="email" value={company.contact_email || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Contact Phone">
                  <Input name="contact_phone" value={company.contact_phone || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Address Line 1" span2>
                  <Input name="address_line1" value={company.address_line1 || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Address Line 2" span2>
                  <Input name="address_line2" value={company.address_line2 || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="City">
                  <Input name="city" value={company.city || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="State / Province">
                  <Input name="state" value={company.state || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Postal Code">
                  <Input name="postal_code" value={company.postal_code || ''} onChange={f(setCompany)} />
                </Field>
                <Field label="Country">
                  <Input name="country" value={company.country || ''} onChange={f(setCompany)} />
                </Field>
              </div>
              <SaveBar onSave={() => save('/settings/company', company)} onReset={fetchSettings} saving={saving} />
            </SectionCard>
          )}

          {/* EMAIL */}
          {activeTab === 'email' && (
            <SectionCard title={t('email_settings')} icon={Mail} description="Configure your SMTP server for transactional emails.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="SMTP Host">
                  <Input name="smtp_host" value={email.smtp_host || ''} onChange={f(setEmail)} placeholder="smtp.gmail.com" />
                </Field>
                <Field label="SMTP Port">
                  <Input name="smtp_port" type="number" value={email.smtp_port || ''} onChange={f(setEmail)} placeholder="587" />
                </Field>
                <Field label="SMTP Username">
                  <Input name="smtp_username" value={email.smtp_username || ''} onChange={f(setEmail)} />
                </Field>
                <Field label="SMTP Password">
                  <div className="relative">
                    <Input
                      name="smtp_password"
                      type={showPass ? 'text' : 'password'}
                      value={email.smtp_password || ''}
                      onChange={f(setEmail)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Encryption">
                  <Select name="encryption_type" value={email.encryption_type || 'tls'} onChange={f(setEmail)} options={['none', 'ssl', 'tls']} />
                </Field>
                <Field label="From Name">
                  <Input name="from_name" value={email.from_name || ''} onChange={f(setEmail)} placeholder="Ecosphere Admin" />
                </Field>
                <Field label="From Email" span2>
                  <Input name="from_email" type="email" value={email.from_email || ''} onChange={f(setEmail)} placeholder="noreply@ecosphere.in" />
                </Field>
              </div>

              {/* SMTP Test */}
              <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-3">
                  <Send className="w-4 h-4" /> Test SMTP Connection
                </p>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Enter recipient email…"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    onClick={testSmtp}
                    disabled={smtpTesting}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white
                      bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg whitespace-nowrap
                      hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 transition-all"
                  >
                    {smtpTesting
                      ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Testing…</>
                      : <><Send className="w-3.5 h-3.5" />Send Test</>}
                  </button>
                </div>
              </div>

              <SaveBar onSave={() => save('/settings/email', email)} onReset={fetchSettings} saving={saving} />
            </SectionCard>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <SectionCard title={t('security_settings')} icon={Shield} description="Authentication, session, and access control configuration.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <Field label="Session Timeout (minutes)">
                  <Input name="session_timeout" type="number" value={security.session_timeout || 60} onChange={f(setSecurity)} />
                </Field>
                <Field label="Max Login Attempts">
                  <Input name="max_login_attempts" type="number" value={security.max_login_attempts || 5} onChange={f(setSecurity)} />
                </Field>
                <Field label="Lockout Duration (minutes)">
                  <Input name="lockout_duration" type="number" value={security.lockout_duration || 30} onChange={f(setSecurity)} />
                </Field>
                <Field label="Password Expiry (days, 0 = never)">
                  <Input name="password_expiry_days" type="number" value={security.password_expiry_days || 0} onChange={f(setSecurity)} />
                </Field>
                <Field label="Minimum Password Length">
                  <Input name="min_password_length" type="number" value={security.min_password_length || 8} onChange={f(setSecurity)} />
                </Field>
                <Field label="JWT Secret Key">
                  <Input name="jwt_secret_key" type="password" value={security.jwt_secret_key || ''} onChange={f(setSecurity)} />
                </Field>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Toggle label="Two-Factor Authentication" description="Force all admin users to enable 2FA on login"
                  value={!!security.two_factor_enabled} onChange={v => setSecurity(p => ({ ...p, two_factor_enabled: v }))} />
                <Toggle label="Enable CAPTCHA on Login" description="Show CAPTCHA challenge on the login form"
                  value={!!security.captcha_enabled} onChange={v => setSecurity(p => ({ ...p, captcha_enabled: v }))} />
                <Toggle label="Force HTTPS / SSL" description="Redirect all HTTP traffic to HTTPS"
                  value={!!security.force_https} onChange={v => setSecurity(p => ({ ...p, force_https: v }))} />
                <Toggle label="Allow Multiple Sessions" description="Users can log in from multiple devices simultaneously"
                  value={!!security.allow_multiple_sessions} onChange={v => setSecurity(p => ({ ...p, allow_multiple_sessions: v }))} />
              </div>

              <SaveBar onSave={() => save('/settings/security', security)} onReset={fetchSettings} saving={saving} />
            </SectionCard>
          )}

          {/* SYSTEM */}
          {activeTab === 'system' && (
            <SectionCard title={t('system_settings')} icon={Cpu} description="Technical and operational configuration for the platform.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <Field label="Max File Upload Size (MB)">
                  <Input name="max_upload_size_mb" type="number" value={system.max_upload_size_mb || 10} onChange={f(setSystem)} />
                </Field>
                <Field label="Log Retention (days)">
                  <Input name="log_retention_days" type="number" value={system.log_retention_days || 90} onChange={f(setSystem)} />
                </Field>
                <Field label="Backup Frequency">
                  <Select name="backup_frequency" value={system.backup_frequency || 'daily'} onChange={f(setSystem)} options={['hourly', 'daily', 'weekly', 'monthly', 'never']} />
                </Field>
                <Field label="Items Per Page">
                  <Select name="items_per_page" value={String(system.items_per_page || 10)} onChange={f(setSystem)} options={['10', '25', '50', '100']} />
                </Field>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Toggle label="Maintenance Mode" description="When enabled, only admins can access the site"
                  value={!!system.maintenance_mode} onChange={v => setSystem(p => ({ ...p, maintenance_mode: v }))} />
                <Toggle label="Debug / Developer Mode" description="Exposes detailed error messages in API responses"
                  value={!!system.debug_mode} onChange={v => setSystem(p => ({ ...p, debug_mode: v }))} />
                <Toggle label="Enable API Rate Limiting" description="Protect endpoints from abuse with rate limiting"
                  value={!!system.enable_rate_limiting} onChange={v => setSystem(p => ({ ...p, enable_rate_limiting: v }))} />
                <Toggle label="Enable Audit Logging" description="Log all admin configuration changes"
                  value={!!system.enable_audit_logs} onChange={v => setSystem(p => ({ ...p, enable_audit_logs: v }))} />
              </div>

              <SaveBar onSave={() => save('/settings/system', system)} onReset={fetchSettings} saving={saving} />
            </SectionCard>
          )}

          {/* AUDIT LOGS */}
          {activeTab === 'audit' && (
            <SectionCard title={t('audit_logs')} icon={ClipboardList} badge={`${auditMeta.total} records`} description="Track all configuration changes made by administrators.">

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 flex-1 min-w-40">
                  <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <select
                    className="flex-1 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    value={auditFilters.module}
                    onChange={e => setAuditFilters(p => ({ ...p, module: e.target.value, page: 1 }))}
                  >
                    <option value="">All Modules</option>
                    {['General', 'Branding', 'Theme', 'Company', 'Email', 'Security', 'System'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="date"
                  className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={auditFilters.start_date}
                  onChange={e => setAuditFilters(p => ({ ...p, start_date: e.target.value, page: 1 }))}
                />
                <input
                  type="date"
                  className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={auditFilters.end_date}
                  onChange={e => setAuditFilters(p => ({ ...p, end_date: e.target.value, page: 1 }))}
                />
                <button
                  onClick={fetchAuditLogs}
                  disabled={auditLoading}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setAuditFilters({ module: '', start_date: '', end_date: '', page: 1, limit: 15 })}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide w-10">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Module</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                          </div>
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No audit logs found</p>
                        </td>
                      </tr>
                    ) : auditLogs.map((log, i) => (
                      <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3 text-slate-400 text-xs">{((auditFilters.page - 1) * auditFilters.limit) + i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 text-xs">{log.user_name}</p>
                          {log.user?.email && <p className="text-slate-400 text-xs">{log.user.email}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-xs">{log.action}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ip_address}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(log.created_at).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditMeta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing {((auditFilters.page - 1) * auditFilters.limit) + 1}–{Math.min(auditFilters.page * auditFilters.limit, auditMeta.total)} of {auditMeta.total}
                  </p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: auditMeta.totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setAuditFilters(prev => ({ ...prev, page: p }))}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg border transition-all
                          ${auditFilters.page === p
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >{p}</button>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}
