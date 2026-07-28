import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Lock,
  Wrench,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Recycle,
  TrendingUp,
  Truck,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useSettings } from '../context/SettingsContext';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { settings } = useSettings();

  // CAPTCHA and 2FA states
  const [captchaImg, setCaptchaImg] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [step, setStep] = useState('login'); // login, 2fa-setup, 2fa-verify
  const [tempToken, setTempToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [otpSecret, setOtpSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const appName = settings?.appName || 'Ecosphere';

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/auth/captcha');
      if (res.data.success && res.data.captchaEnabled) {
        setCaptchaImg(res.data.captchaImg);
        setCaptchaToken(res.data.captchaToken);
        setCaptchaInput('');
      } else {
        setCaptchaImg(null);
        setCaptchaToken(null);
      }
    } catch (err) {
      console.error("Error fetching captcha:", err);
    }
  };

  useEffect(() => {
    if (settings?.captchaEnabled) {
      fetchCaptcha();
    }
  }, [settings]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { email, password };
      if (settings?.captchaEnabled) {
        payload.captcha_input = captchaInput;
        payload.captcha_token = captchaToken;
      }
      const response = await api.post('/auth/login', payload);

      if (response.data.twoFactorRequired) {
        setTempToken(response.data.tempToken);
        setOtpCode('');
        if (response.data.setupRequired) {
          setQrCode(response.data.qrCode);
          setOtpSecret(response.data.secret);
          setStep('2fa-setup');
        } else {
          setStep('2fa-verify');
        }
      } else if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      if (err.message === 'Network Error') {
        toast.error('Unable to connect to the server (Backend is offline).');
      } else {
        toast.error(err.response?.data?.message || 'Invalid credentials');
      }
      if (settings?.captchaEnabled) {
        fetchCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/verify', { tempToken, code: otpCode });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const isMaintenance = settings?.maintenanceMode;

  // Render Maintenance landing view
  if (isMaintenance && !isAdminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06291e] text-slate-100 p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-lg z-10">
          <div className="bg-[#09392b]/80 backdrop-blur-xl border border-emerald-800/40 rounded-3xl p-8 md:p-12 shadow-2xl text-center flex flex-col items-center">
            <img src="/logologinpage.png" alt={appName} className="max-h-16 object-contain mb-8" />
            <span className="px-3.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase tracking-widest mb-4">
              Scheduled Maintenance
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              We'll Be Back Soon
            </h1>
            <p className="text-emerald-100/70 text-sm md:text-base max-w-md mb-8 leading-relaxed">
              <strong>{appName}</strong> is currently undergoing scheduled maintenance to upgrade services.
            </p>
            <button
              onClick={() => setIsAdminMode(true)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-emerald-900/60 hover:bg-emerald-800 transition-all border border-emerald-700/50"
            >
              Sign In as Administrator
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2FA Setup or Verification Steps
  if (step === '2fa-setup' || step === '2fa-verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#073224] font-sans">
        <div className="w-full max-w-md z-10">
          <div className="text-center mb-6">
            <img src="/logologinpage.png" alt={appName} className="max-h-14 mx-auto mb-3 object-contain" />
            <h1 className="text-2xl font-bold text-white">{appName}</h1>
            <p className="text-emerald-200/70 text-xs mt-1">Two-Factor Authentication</p>
          </div>
          <div className="rounded-3xl bg-white shadow-2xl border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">2FA Verification</h2>
                <p className="text-xs text-slate-400 mt-0.5">Please check your authenticator app</p>
              </div>
            </div>
            <form onSubmit={handle2FAVerification} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-600">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="block w-full px-4 py-2.5 text-center text-lg font-bold tracking-widest rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800 bg-slate-50 border-slate-200"
                  placeholder="000000"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl text-sm font-extrabold text-white shadow-lg bg-gradient-to-r from-[#1b7a42] to-[#125c30]"
              >
                {loading ? 'Verifying…' : 'Verify & Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN PIXEL-PERFECT FULL PAGE LOGIN VIEW ──
  return (
    <div className="h-screen w-screen min-h-screen overflow-hidden bg-[#06291e] relative font-sans select-none flex flex-col lg:flex-row">

      {/* ── LAYER 0: DARK GREEN DOT GRID PATTERN ── */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25 pointer-events-none z-0" />

      {/* ── LAYER 1: FULL-SCREEN WHITE ORGANIC BACKDROP WAVE ── */}
      <svg
        className="absolute inset-0 w-full h-full text-white fill-current pointer-events-none z-0"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path d="M 0,0 L 660,0 C 660,180 920,580 840,620 C 880,780 820,920 680,1000 L 0,1000 Z" />
      </svg>

      {/* ── LAYER 2: LEFT PANEL (ILLUSTRATION + TEXT OVERLAYS) ── */}
      <div className="relative hidden lg:flex lg:w-[56%] xl:w-[58%] h-full shrink-0 flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden z-10">

        {/* Left Background Artwork */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-95">
          <img
            src="/loginimageleft.png"
            alt="Ecosphere Waste Solutions"
            className="w-full h-full object-cover object-left"
          />
        </div>

        {/* 1. Top Left Branding / Logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center p-1.5 border border-emerald-100">
            <img src="/logologinpage.png" alt="Ecosphere Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0f382a] tracking-tight leading-none flex items-center gap-1">
              ecosphere
            </h1>
            <p className="text-[9px] font-extrabold text-[#1a5e47] tracking-[0.2em] uppercase mt-0.5">
              WASTE SOLUTIONS
            </p>
          </div>
        </div>

        {/* 2. Middle Hero Content (Headline + Subtitle + 3 Features) */}
        <div className="relative z-20 max-w-lg my-auto pt-4 pb-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-black text-[#0c3325] leading-[1.15] tracking-tight">
            Building a Cleaner,<br />
            <span className="text-[#145c3d] flex items-center gap-2">
              Greener Tomorrow <span className="text-3xl">🍃</span>
            </span>
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-3.5 mb-7 leading-relaxed max-w-md">
            Smart waste management solutions for a sustainable and eco-friendly future.
          </p>

          {/* 3 Feature Points */}
          <div className="space-y-3 max-w-lg">

            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-black leading-snug">Sustainable Solutions</h4>
                <p className="text-sm font-medium text-black leading-tight">Eco-friendly waste management for a greener tomorrow</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-black leading-snug">Smart Monitoring</h4>
                <p className="text-sm font-medium text-black leading-tight">Real-time tracking and analytics for better decision making</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-black leading-snug">Reliable & Secure</h4>
                <p className="text-sm font-medium text-black leading-tight">Secure, reliable and transparent operations you can trust</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── LAYER 3: RIGHT PANEL (FLOATING FORM CARD OVER WHITE BACKDROP) ── */}
      <div className="relative w-full lg:w-[44%] xl:w-[42%] h-full min-h-screen flex items-center justify-center p-6 sm:p-10 z-20 shrink-0">

        {/* ── PREMIUM WHITE LOGIN CARD (420px max width) ── */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 sm:p-10 w-full max-w-[490px] border border-slate-100 relative z-10 flex flex-col justify-between my-auto">

          {/* Top Logo / Badge */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-full max-w-[170px] p-1 flex items-center justify-center mx-auto">
              <div className="w-full h-[64px]flex items-center justify-center overflow-hidden p-2">
                <img src="/ecospare-logo.png" alt="Ecosphere Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Welcome Heading */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2 flex items-center justify-center gap-1.5">
              Welcome Back! <span className="text-emerald-600 text-xl">🍃</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs font-semibold text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full h-[48px] pl-10 pr-4 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 focus:bg-white transition-all shadow-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-[48px] pl-10 pr-10 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 focus:bg-white transition-all shadow-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA Field (If Enabled in Settings) */}
            {settings?.captchaEnabled && captchaImg && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  VERIFICATION CODE
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    className="block w-1/2 h-[48px] px-3.5 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 focus:bg-white transition-all shadow-sm"
                    placeholder="Enter captcha"
                    required
                  />
                  <div
                    className="flex-1 h-[48px] border border-slate-200 rounded-xl overflow-hidden bg-white select-none cursor-pointer flex items-center justify-center shadow-sm"
                    onClick={fetchCaptcha}
                    dangerouslySetInnerHTML={{ __html: captchaImg }}
                    title="Click to refresh CAPTCHA"
                  />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="h-[48px] w-[48px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer shadow-sm flex items-center justify-center shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 font-semibold text-slate-600 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => toast.error('Please contact system administrator to reset password.')}
                className="font-bold text-emerald-700 hover:text-emerald-800 text-xs transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-xl bg-gradient-to-r from-[#298347] to-[#1c6837] hover:from-[#21733c] hover:to-[#17592e] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Security Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Your data is secure and protected</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
