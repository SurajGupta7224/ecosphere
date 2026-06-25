import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Leaf, Wrench, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { IMAGE_BASE_URL } from '../api';
import { useSettings } from '../context/SettingsContext';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { settings } = useSettings();

  const appName    = settings?.appName    || 'Ecosphere';
  const primary    = settings?.theme?.primary_color  || '#6366f1';
  const secondary  = settings?.theme?.secondary_color || '#8b5cf6';
  const tagline    = settings?.companyTagline || 'Admin Portal';

  const bgStyle = settings?.loginBg
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.65)), url(${IMAGE_BASE_URL}/${settings.loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      if (err.message === 'Network Error') {
        toast.error('Unable to connect to the server (Backend is offline).');
      } else {
        toast.error(err.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const isMaintenance = settings?.maintenanceMode;

  // Render Maintenance landing view
  if (isMaintenance && !isAdminMode) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-100 p-4 relative overflow-hidden font-sans"
        style={bgStyle}
      >
        {/* Decorative Gradients */}
        {!settings?.loginBg && (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
          </>
        )}

        <div className="w-full max-w-lg z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl text-center flex flex-col items-center">
            
            {settings?.loginLogo ? (
              <img
                src={`${IMAGE_BASE_URL}/${settings.loginLogo}`}
                alt={appName}
                className="max-h-16 object-contain mb-8"
              />
            ) : (
              /* Animated maintenance icon */
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8 animate-pulse">
                <Wrench className="w-10 h-10 text-white" />
              </div>
            )}

            <span className="px-3.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase tracking-widest mb-4">
              Scheduled Maintenance
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              We'll Be Back Soon
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base max-w-md mb-8 leading-relaxed">
              <strong>{appName}</strong> is currently undergoing scheduled maintenance to upgrade services and optimize system performance. We apologize for any inconvenience.
            </p>

            {/* Progress visual */}
            <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 mb-10 overflow-hidden relative">
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full animate-shimmer" 
                style={{ width: '40%' }}
              />
            </div>

            <button
              onClick={() => setIsAdminMode(true)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50"
            >
              Sign In as Administrator
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-8">
            {settings?.footerCopyright || `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
          </p>
        </div>
      </div>
    );
  }

  // Render Admin Login during maintenance OR normal Login
  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans
        ${isMaintenance 
          ? 'bg-[#0f172a] text-slate-100' 
          : 'bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-50'
        }`}
      style={bgStyle}
    >
      {/* Decorative Gradients */}
      {(!settings?.loginBg && isMaintenance) && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        </>
      )}

      {/* Card */}
      <div className="w-full max-w-md z-10">

        {/* Logo + Brand */}
        <div className="text-center mb-8">
          {settings?.loginLogo ? (
            <img
              src={`${IMAGE_BASE_URL}/${settings.loginLogo}`}
              alt={appName}
              className="max-h-16 mx-auto mb-4 object-contain"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <Leaf className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className={`text-3xl font-bold ${isMaintenance ? 'text-white' : 'text-slate-800'}`}>{appName}</h1>
          <p className={`${isMaintenance ? 'text-slate-400' : 'text-slate-500'} text-sm mt-1`}>{tagline}</p>
        </div>

        {/* Login Form */}
        <div className={`rounded-2xl shadow-xl border p-8 transition-all duration-300
          ${isMaintenance 
            ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-slate-950/50' 
            : 'bg-white border-slate-100 shadow-slate-200/60'
          }`}
        >
          {isMaintenance ? (
            <div className="flex items-center gap-3 mb-6">
              <button 
                type="button" 
                onClick={() => setIsAdminMode(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Admin Sign In</h2>
                <p className="text-xs text-slate-400 mt-0.5">Access during system maintenance</p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5
                ${isMaintenance ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all
                    ${isMaintenance 
                      ? 'text-white bg-slate-800 border-slate-700 focus:bg-slate-900 placeholder:text-slate-600' 
                      : 'text-slate-800 bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-300'
                    }`}
                  placeholder="admin@ecosphere.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5
                ${isMaintenance ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all
                    ${isMaintenance 
                      ? 'text-white bg-slate-800 border-slate-700 focus:bg-slate-900 placeholder:text-slate-600' 
                      : 'text-slate-800 bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-300'
                    }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
                text-white shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={`text-center text-xs mt-6 ${isMaintenance ? 'text-slate-500' : 'text-slate-400'}`}>
            {settings?.footerCopyright || `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
