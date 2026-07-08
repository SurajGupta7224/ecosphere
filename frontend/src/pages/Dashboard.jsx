import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Shield, MapPin, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { t } = useSettings();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.role_name?.toLowerCase() === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  if (!data) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <p className="text-slate-500">Failed to load data.</p>
      <button onClick={() => window.location.reload()} className="text-[#7c3aed] font-bold hover:underline">Retry</button>
    </div>
  );

  const { stats } = data;

  return (
    <div className="space-y-6">

      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard_overview')}</h1>
          <p className="text-slate-500 text-sm">{t('system_snapshot')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <button onClick={() => navigate('/users')} className="flex items-center px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors shadow-sm">
                <Users className="w-4 h-4 mr-1.5" /> {t('manage_users')}
              </button>
              <button onClick={() => navigate('/roles')} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
                <Shield className="w-4 h-4 mr-1.5 text-purple-500" /> {t('manage_roles')}
              </button>
            </>
          )}
          <button onClick={() => navigate('/locations')} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
            <MapPin className="w-4 h-4 mr-1.5 text-blue-500" /> {t('view_locations')}
          </button>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-[#7c3aed]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('total_users')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats.totalUsers || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mr-4">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('active_roles')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats.totalRoles || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('total_cities')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats.totalCities || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mr-4">
            <MapPin className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('total_pincodes')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats.totalPincodes || 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e133c] to-[#7c3aed] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h2 className="text-2xl font-bold">{t('welcome_back')}, {user.name || 'User'}!</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            You are logged into the Ecosphere administration portal. From this console, you can manage user profiles, configure access controls, assign roles and permissions, and audit geographic locations.
          </p>
        </div>
      </div>

      {/* 10. SYSTEM HEALTH */}
      <div className="bg-slate-800 rounded-xl p-4 shadow-sm text-slate-300 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-6">
          <div className="flex items-center"><Activity className="w-3 h-3 mr-1.5 text-emerald-400" /> {t('system_health')}: {t('operational')}</div>
          <div className="hidden sm:block">Sync: <span className="text-emerald-400 font-bold">{t('live')}</span></div>
          <div className="hidden sm:block">Database Load: <span className="text-white font-bold">{t('optimal')}</span></div>
        </div>
        <div className="mt-2 sm:mt-0 text-slate-500">
          {t('last_aggregation')}: {new Date().toLocaleTimeString()}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
