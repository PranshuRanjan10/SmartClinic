'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/lib/session';

type AppointmentStatus = 'upcoming' | 'live' | 'done' | 'cancelled';

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: AppointmentStatus;
  notes?: string;
  doctors?: {
    users?: { name: string };
    specialization: string;
  };
}

interface Doctor {
  id: string;
  specialization: string;
  consultation_fee: number;
  working_hours_start: string;
  working_hours_end: string;
  users: { id: string; name: string; email: string } | null;
}

interface PharmacyOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface PatientProfile {
  id: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  blood_group: string;
}

interface Prescription {
  id: string;
  diagnosis: string;
  notes: string;
  created_at: string;
  doctors: { users: { name: string } };
  prescription_medicines: {
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    medicines: { name: string };
  }[];
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  upcoming: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  live: 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse',
  done: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  ready: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  collected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  unavailable: 'bg-red-100 text-red-600 border-red-200',
};

export default function PatientDashboard() {
  const session = getSession();

  // Data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Booking Form State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctor_id: '',
    appointment_date: '',
    time_slot: '',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    blood_group: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const userId = session?.id ?? '';
  const headers = { 'Content-Type': 'application/json', 'x-user-id': userId };

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    // Fetch Appointments
    setLoadingAppts(true);
    fetch('/api/appointments', { headers })
      .then(res => res.json())
      .then(data => data.success && setAppointments(data.data ?? []))
      .finally(() => setLoadingAppts(false));

    // Fetch Orders
    setLoadingOrders(true);
    fetch('/api/pharmacy/orders', { headers })
      .then(res => res.json())
      .then(data => data.success && setOrders(data.data ?? []))
      .finally(() => setLoadingOrders(false));

    // Fetch Profile
    setLoadingProfile(true);
    fetch('/api/patient/profile', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProfile(data.data);
          setProfileForm({
            date_of_birth: data.data.date_of_birth || '',
            gender: data.data.gender || '',
            phone: data.data.phone || '',
            address: data.data.address || '',
            blood_group: data.data.blood_group || '',
          });
        }
      })
      .finally(() => setLoadingProfile(false));

    // Fetch Prescriptions
    setLoadingPrescriptions(true);
    fetch('/api/patient/prescriptions', { headers })
      .then(res => res.json())
      .then(data => data.success && setPrescriptions(data.data ?? []))
      .finally(() => setLoadingPrescriptions(false));
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Cancel Appointment Action
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      } else {
        alert(data.error || 'Failed to cancel appointment');
      }
    } catch {
      alert('Network error canceling appointment');
    }
  };

  // Profile Update Logic
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setProfileSuccess(true);
        setTimeout(() => setShowProfileModal(false), 1500);
      } else {
        setProfileError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError('An unexpected error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  // Booking Modal Logic
  const openBookingModal = async () => {
    setShowBookingModal(true);
    setBookingError('');
    setBookingSuccess(false);
    setBookingForm({ doctor_id: '', appointment_date: '', time_slot: '', notes: '' });

    if (doctors.length === 0) {
      setLoadingDoctors(true);
      try {
        const res = await fetch('/api/doctors', { headers });
        const data = await res.json();
        if (data.success) setDoctors(data.data ?? []);
      } catch { }
      finally { setLoadingDoctors(false); }
    }
  };

  const fetchSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/doctors/${doctorId}/slots?date=${date}`, { headers });
      const data = await res.json();
      if (data.success) setSlots(data.data ?? []);
    } catch { }
    finally { setLoadingSlots(false); }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingForm),
      });

      const data = await res.json();

      if (data.success) {
        setBookingSuccess(true);
        fetchDashboardData();
        setTimeout(() => setShowBookingModal(false), 2000);
      } else {
        setBookingError(data.error || 'Failed to book appointment');
      }
    } catch (err) {
      setBookingError('An error occurred. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Extract unique diagnoses keywords for Medical History
  const medicalHistory = Array.from(new Set(
    prescriptions.map(p => p.diagnosis.split(',').map(d => d.trim())).flat()
  )).filter(Boolean);

  // Render Premium Statistics Header
  const nextAppointment = appointments.find(a => a.status === 'upcoming' || a.status === 'live');
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'ready');

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Appointments</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{appointments.length}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Active Prescriptions</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{prescriptions.length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Pending Pharmacy</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{activeOrders.length}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Profile Completeness</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {profile ? Object.values(profile).filter(Boolean).length / 6 * 100 : 0}%
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        </div>
      </div>

      {/* Primary Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={openBookingModal}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl p-4 font-bold text-lg shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Book New Appointment
        </button>
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-2xl p-4 font-bold text-lg shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Update Health Profile
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Upcoming Appointments Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Your Appointments</h2>
          </div>
          <div className="p-6">
            {loadingAppts ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : appointments.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-medium">No appointments scheduled.</p>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="group border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg text-slate-900">Dr. {apt.doctors?.users?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-500 font-medium">{apt.doctors?.specialization || 'General'}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${STATUS_COLORS[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(apt.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {apt.time_slot}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                        Queue #{apt.queue_number}
                      </div>
                    </div>

                    {apt.status === 'upcoming' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button onClick={() => handleCancelAppointment(apt.id)} className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors">
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Medical History (Keywords) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold tracking-tight">Medical History</h2>
              <p className="text-sm text-slate-500 mt-1">Diagnosed conditions and keywords</p>
            </div>
            <div className="p-6">
              {medicalHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-6 font-medium">No history recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.map((diag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-semibold capitalize">
                      {diag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold tracking-tight">Recent Prescriptions</h2>
            </div>
            <div className="p-0">
              {loadingPrescriptions ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : prescriptions.length === 0 ? (
                <p className="text-slate-500 text-center py-8 font-medium">No prescription history.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {prescriptions.slice(0, 3).map(rx => (
                    <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-slate-900 capitalize">{rx.diagnosis}</h4>
                        <span className="text-xs font-bold text-slate-400">{new Date(rx.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">Prescribed by Dr. {rx.doctors?.users?.name || 'Unknown'}</p>

                      <div className="space-y-2">
                        {rx.prescription_medicines.map((med, i) => (
                          <div key={i} className="flex justify-between items-center text-sm bg-white border border-slate-100 p-2 rounded-lg">
                            <span className="font-semibold text-slate-700">💊 {med.medicines?.name}</span>
                            <span className="text-xs font-medium text-slate-500">{med.dosage} • {med.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold mb-2">Update Profile</h2>
            <p className="text-slate-500 mb-6 text-sm">Keep your medical profile up to date for better care.</p>

            {profileSuccess ? (
              <div className="p-6 bg-emerald-50 text-emerald-700 rounded-2xl flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="font-bold">Profile updated successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileError && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{profileError}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Date of Birth</label>
                    <input type="date" required value={profileForm.date_of_birth} onChange={e => setProfileForm({ ...profileForm, date_of_birth: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Gender</label>
                    <select required value={profileForm.gender} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Phone</label>
                    <input type="tel" required value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Blood Group</label>
                    <select value={profileForm.blood_group} onChange={e => setProfileForm({ ...profileForm, blood_group: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700">
                      <option value="">Unknown</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Address</label>
                  <textarea required value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 resize-none"></textarea>
                </div>
                <button type="submit" disabled={profileLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors mt-2">
                  {profileLoading ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal (Preserved & Styled) */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold mb-2">Book Appointment</h2>
            <p className="text-slate-500 mb-6 text-sm">Select a doctor and available time slot.</p>

            {bookingSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-1">Appointment Confirmed!</h3>
                <p className="text-sm">Your booking has been successfully scheduled.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {bookingError && <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{bookingError}</div>}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Doctor</label>
                  <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={bookingForm.doctor_id}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, doctor_id: e.target.value, time_slot: '' });
                      if (bookingForm.appointment_date) fetchSlots(e.target.value, bookingForm.appointment_date);
                    }}>
                    <option value="">Choose a specialist...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.users?.name} - {d.specialization} (${d.consultation_fee})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Select Date</label>
                  <input type="date" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.appointment_date}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, appointment_date: e.target.value, time_slot: '' });
                      if (bookingForm.doctor_id) fetchSlots(bookingForm.doctor_id, e.target.value);
                    }} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Available Slots</label>
                  {loadingSlots ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-sm font-medium text-slate-500 animate-pulse">Checking availability...</div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {slots.map(slot => (
                        <button key={slot} type="button" onClick={() => setBookingForm({ ...bookingForm, time_slot: slot })}
                          className={`p-2 rounded-lg text-sm font-bold transition-all ${bookingForm.time_slot === slot ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-white text-slate-700 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-medium text-slate-500">
                      {bookingForm.doctor_id && bookingForm.appointment_date ? 'No slots available for this date' : 'Select a doctor and date first'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Notes (Optional)</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={2} placeholder="Reason for visit..."
                    value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={bookingLoading || !bookingForm.time_slot} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2">
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
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