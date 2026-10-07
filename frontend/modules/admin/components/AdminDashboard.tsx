'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalAppointments: number;
  totalDoctors: number;
  totalRevenue: number;
}

interface UserDirectoryItem {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
  created_at: string;
  specialization?: string;
  license_number?: string;
}

const ROLE_STYLES = {
  patient: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  doctor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pharmacist: 'bg-amber-100 text-amber-700 border-amber-200',
  admin: 'bg-violet-100 text-violet-700 border-violet-200',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Roster Directory State
  const [directory, setDirectory] = useState<UserDirectoryItem[]>([]);
  const [dirLoading, setDirLoading] = useState(false);
  const [dirError, setDirError] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'patient' | 'doctor' | 'pharmacist'>('all');

  // Provisioning State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [provisionError, setProvisionError] = useState('');
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'pharmacist',
    // Doctor specific fields
    specialization: 'General Practice',
    license_number: '',
    consultation_fee: 150,
    working_hours_start: '09:00:00',
    working_hours_end: '17:00:00',
    slot_duration: 30
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectory = async () => {
    setDirLoading(true);
    setDirError('');
    try {
      const res = await fetch('/api/admin/users/directory');
      const data = await res.json();
      if (data.success) {
        setDirectory(data.data);
      } else {
        setDirError(data.error || 'Failed to load directory');
      }
    } catch {
      setDirError('Could not connect to server');
    } finally {
      setDirLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDirectory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'consultation_fee' || name === 'slot_duration' ? Number(value) : value
    }));
  };

  const submitProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionLoading(true);
    setProvisionError('');
    setProvisionSuccess(false);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setProvisionSuccess(true);
        fetchStats();
        fetchDirectory(); // Update roster table with new user
        setTimeout(() => {
          setShowProvisionModal(false);
          setProvisionSuccess(false);
          setFormData({
            ...formData, name: '', email: '', password: '', license_number: '' // Reset fields
          });
        }, 2000);
      } else {
        setProvisionError(data.error || 'Failed to provision account');
      }
    } catch {
      setProvisionError('Network error during provisioning');
    } finally {
      setProvisionLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats?.totalAppointments ?? 0,
      icon: '📅',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: '💰',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Registered Doctors',
      value: stats?.totalDoctors ?? 0,
      icon: '⚕️',
      color: 'from-indigo-500 to-violet-600',
      bg: 'bg-indigo-50',
    },
  ];

  const filteredDirectory = roleFilter === 'all'
    ? directory
    : directory.filter(user => user.role === roleFilter);

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 pb-20">

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] -mt-10 -mr-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mb-10 -ml-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              <span className="text-xs font-bold text-violet-300 tracking-wide uppercase">Admin Control Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
              System Overview
            </h1>
            <p className="text-slate-400 font-medium">Global analytics and infrastructure controls</p>
          </div>

          <button
            onClick={() => setShowProvisionModal(true)}
            className="px-6 py-3.5 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-900/50 flex items-center justify-center gap-2 border border-violet-500/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Provision Staff
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
          Analytics Overview
        </button>
        <button onClick={() => setActiveTab('roster')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'roster' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
          System Roster Database
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center group hover:border-violet-200 transition-colors">
                <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <p className="text-3xl font-black text-slate-800">{loading ? '—' : card.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">⚠️ {error}</div>
          )}

          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
              Infrastructure Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Supabase DB', status: 'operational' },
                { name: 'Auth Service', status: 'operational' },
                { name: 'Pharmacy API', status: 'operational' },
                { name: 'Appointments Sync', status: 'operational' },
              ].map((item) => (
                <div key={item.name} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm text-slate-500 font-bold mb-1">{item.name}</span>
                  <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Operational
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM ROSTER TAB */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Registered Users Directory</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Comprehensive view of all clinical staff and patients</p>
            </div>
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              {(['all', 'patient', 'doctor', 'pharmacist'] as const).map(role => (
                <button key={role} onClick={() => setRoleFilter(role)}
                  className={`capitalize px-4 py-2 text-xs font-bold rounded-lg transition-colors ${roleFilter === role ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 border-b border-slate-100 pl-6">Core Identity</th>
                  <th className="p-4 border-b border-slate-100">System Role</th>
                  <th className="p-4 border-b border-slate-100">Clinical Data</th>
                  <th className="p-4 border-b border-slate-100 text-right pr-6">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dirLoading ? (
                  <tr>
                    <td colSpan={4} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-bold">Querying Directory...</p>
                      </div>
                    </td>
                  </tr>
                ) : dirError ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-red-500 font-bold bg-red-50/50">{dirError}</td>
                  </tr>
                ) : filteredDirectory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-16 text-center">
                      <div className="text-4xl mb-3 opacity-50">📋</div>
                      <p className="text-slate-800 font-bold mb-1">No users found</p>
                      <p className="text-slate-500 text-sm">No accounts match the active `{roleFilter}` filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDirectory.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 pl-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                          {user.name.charAt(0)}{user.name.split(' ')[1]?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{user.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider rounded-lg border ${ROLE_STYLES[user.role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {user.role === 'doctor' ? (
                          <div className="flex flex-col">
                            <span className="text-emerald-700 font-bold">{user.specialization || 'General Practice'}</span>
                            <span className="text-xs text-slate-400 mt-0.5">Lic: {user.license_number || 'Pending'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-xs">Standard End-User Profile</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-bold">
                          ID: {user.id.slice(0, 6)}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Provisioning Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto w-full">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative my-8 animate-fade-in-up border border-slate-200">

            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Provision Staff Account
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Create backend access for internal clinic employees.</p>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {provisionSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Account Provisioned</h3>
                <p className="text-slate-500 font-medium">The employee has been registered and granted `{formData.role}` access.</p>
              </div>
            ) : (
              <form onSubmit={submitProvisioning} className="space-y-6">
                {provisionError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
                    {provisionError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Account Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all font-medium text-slate-800">
                      <option value="pharmacist">Pharmacist</option>
                      <option value="doctor">Medical Doctor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Temporary Password</label>
                    <input type="password" name="password" minLength={6} required value={formData.password} onChange={handleInputChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none transition-all font-medium" />
                  </div>
                </div>

                {formData.role === 'doctor' && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Clinical Profile Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Specialization</label>
                        <select name="specialization" value={formData.specialization} onChange={handleInputChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium">
                          <option value="General Practice">General Practice</option>
                          <option value="Cardiologist">Cardiologist</option>
                          <option value="Dermatologist">Dermatologist</option>
                          <option value="Neurologist">Neurologist</option>
                          <option value="Pediatrician">Pediatrician</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Medical License ID</label>
                        <input type="text" name="license_number" required value={formData.license_number} onChange={handleInputChange} placeholder="e.g. MED-84920"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fee (₹)</label>
                        <input type="number" name="consultation_fee" required typeof='number' min="0" value={formData.consultation_fee} onChange={handleInputChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
                        <input type="time" name="working_hours_start" required value={formData.working_hours_start} onChange={handleInputChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Time</label>
                        <input type="time" name="working_hours_end" required value={formData.working_hours_end} onChange={handleInputChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowProvisionModal(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={provisionLoading} className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 flex items-center gap-2">
                    {provisionLoading ? 'Processing...' : 'Provision Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
