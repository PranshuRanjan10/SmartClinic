'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/lib/session';

type AppointmentStatus = 'upcoming' | 'live' | 'done' | 'cancelled';

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: AppointmentStatus;
  notes?: string;
  patients?: {
    users?: { name: string, email: string };
  };
}

interface Medicine {
  id: string;
  name: string;
  description: string;
  reorder_level: number;
  stock_quantity: number;
  unit_price: number;
}

interface PrescriptionMedicineRow {
  medicine_id: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  upcoming: 'bg-amber-100 text-amber-700 border-amber-200',
  live: 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse',
  done: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
};

export default function DoctorDashboard() {
  const session = getSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Prescription Modal State
  const [prescribingFor, setPrescribingFor] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [nextVisit, setNextVisit] = useState('');
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionMedicineRow[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const userId = session?.id ?? '';
  const headers = { 'x-user-id': userId };

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/appointments/doctor?date=${today}`, { headers });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data ?? []);
      } else {
        setError(data.error || 'Failed to load appointments. Are you mapped as a Doctor?');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }, [userId, today]);

  const fetchMedicines = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch('/api/pharmacy/medicines', { headers });
      const data = await res.json();
      if (data.success) setMedicines(data.data ?? []);
    } catch { }
  }, [userId]);

  useEffect(() => {
    fetchAppointments();
    fetchMedicines();
  }, [fetchAppointments, fetchMedicines]);

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchAppointments();
    } catch { }
  };

  const startPrescription = (appt: Appointment) => {
    setPrescribingFor(appt);
    setDiagnosis('');
    setNextVisit('');
    setPrescriptionMedicines([{ medicine_id: '', dosage: '', frequency: '', duration: '', quantity: 1 }]);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const updateMedicineRow = (index: number, field: keyof PrescriptionMedicineRow, value: any) => {
    const updated = [...prescriptionMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionMedicines(updated);
  };

  const addMedicineRow = () => {
    setPrescriptionMedicines([...prescriptionMedicines, { medicine_id: '', dosage: '', frequency: '', duration: '', quantity: 1 }]);
  };

  const removeMedicineRow = (index: number) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
  };

  const submitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescribingFor) return;

    setSubmitLoading(true);
    setSubmitError('');

    // Filter out rows without a selected medicine
    const validMedicines = prescriptionMedicines.filter(m => m.medicine_id !== '');

    if (validMedicines.length === 0 && !diagnosis.trim()) {
      setSubmitError('Please provide a diagnosis or at least one medicine.');
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        appointment_id: prescribingFor.id,
        patient_id: prescribingFor.patient_id,
        diagnosis,
        notes: nextVisit ? `Next visit suggested: ${nextVisit}` : '',
        medicines: validMedicines
      };

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        // Automatically mark the appointment as done
        await handleStatusUpdate(prescribingFor.id, 'done');
        setTimeout(() => {
          setPrescribingFor(null);
        }, 2000);
      } else {
        setSubmitError(data.error || 'Failed to submit prescription');
      }
    } catch {
      setSubmitError('Network error while processing prescription');
    } finally {
      setSubmitLoading(false);
    }
  };

  const upcoming = appointments.filter((a) => a.status === 'upcoming').length;
  const live = appointments.filter((a) => a.status === 'live').length;
  const done = appointments.filter((a) => a.status === 'done').length;

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800 pb-20">

      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mt-10 -mr-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mb-10 -ml-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">Doctor Workspace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, <br />
              <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Dr. {session?.name?.split(' ')[0] ?? 'Doctor'}</span>
            </h1>
            <p className="text-slate-400 font-medium">{todayDisplay}</p>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-center min-w-[100px]">
              <div className="text-3xl font-black text-white">{appointments.length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm text-center min-w-[100px]">
              <div className="text-3xl font-black text-emerald-400">{done}</div>
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mt-1">Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center group hover:border-amber-200 transition-colors">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-3xl font-black text-slate-800">{loading ? '—' : upcoming}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Upcoming</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center group hover:border-emerald-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <p className="text-3xl font-black text-slate-800">{loading ? '—' : live}</p>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">In Progress</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-3xl font-black text-slate-800">{loading ? '—' : done}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Completed</p>
        </div>
      </div>

      {/* Today's Schedule List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Today's Appointments</h2>
            <p className="text-sm text-slate-500 font-medium">Manage your patient flow</p>
          </div>
          <button onClick={fetchAppointments} className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading schedule...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-slate-800 font-bold text-lg mb-2">No Profile Found</p>
              <p className="text-slate-500 mb-4 max-w-sm">{error}. If this is a new account, a system admin must provision your profile in the database.</p>
              <button onClick={fetchAppointments} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Retry Connection</button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4 opacity-50">☕️</div>
              <p className="text-xl font-bold text-slate-800 mb-1">Schedule is clear</p>
              <p className="text-slate-500 font-medium">You have no appointments booked for today.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <div key={appt.id} className={`p-6 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${appt.status === 'live' ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>

                  {/* Left: Token & Time */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm relative overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">Token</span>
                      <span className="text-2xl font-black leading-none">{appt.queue_number}</span>
                      {appt.status === 'live' && <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>}
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border mb-1.5 ${STATUS_COLORS[appt.status]}`}>
                        {appt.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {appt.time_slot}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Patient Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      {appt.patients?.users?.name ? appt.patients.users.name : `Patient ID: ${appt.patient_id.slice(-6).toUpperCase()}`}
                    </h3>
                    {appt.notes ? (
                      <p className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 max-w-lg inline-block">{appt.notes}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No preliminary notes provided.</p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {appt.status === 'upcoming' && (
                      <button onClick={() => handleStatusUpdate(appt.id, 'live')} className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors shadow-sm">
                        Call Patient
                      </button>
                    )}
                    {appt.status === 'live' && (
                      <button onClick={() => startPrescription(appt)} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Prescribe & Complete
                      </button>
                    )}
                    {appt.status === 'done' && (
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Consultation Finished
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Generator Modal */}
      {prescribingFor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl relative my-8 animate-fade-in-up border border-slate-200">

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-400 rounded-xl shadow-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Smart Clinic Prescription</h2>
                </div>
                <p className="text-slate-500 font-medium">Digital Medical Order Form</p>
              </div>
              <button onClick={() => setPrescribingFor(null)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-2.5 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-2">Prescription Issued</h3>
                <p className="text-slate-500 font-medium max-w-md">The prescription has been securely saved to the patient's record and routed to the pharmacy. Returning to schedule...</p>
              </div>
            ) : (
              <form onSubmit={submitPrescription} className="space-y-8">
                {/* Top Info Grid */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prescribing Doctor</p>
                    <p className="font-bold text-slate-900 text-lg">Dr. {session?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Provider ID: {userId.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Subject</p>
                    <p className="font-bold text-slate-900 text-lg">
                      {prescribingFor.patients?.users?.name ? prescribingFor.patients.users.name : `ID: ${prescribingFor.patient_id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Date: {todayDisplay}</p>
                  </div>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">{submitError}</div>}

                {/* Diagnosis Section */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Clinical Diagnosis
                  </label>
                  <textarea required placeholder="Enter primary diagnosis and observed symptoms..." rows={3}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm font-medium text-slate-700"
                    value={diagnosis} onChange={e => setDiagnosis(e.target.value)}></textarea>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Use comma separated keywords for better patient history parsing.</p>
                </div>

                {/* Medication Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      Prescribed Medication
                    </label>
                    <button type="button" onClick={addMedicineRow} className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prescriptionMedicines.map((row, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl relative group">
                        <div className="flex-1">
                          <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium appearance-none"
                            required value={row.medicine_id} onChange={e => updateMedicineRow(index, 'medicine_id', e.target.value)}>
                            <option value="">Select Medicine from Database...</option>
                            {medicines.map(m => (
                              <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock_quantity})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full sm:w-32">
                          <input type="text" placeholder="Dosage (e.g. 500mg)" required value={row.dosage} onChange={e => updateMedicineRow(index, 'dosage', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                        </div>
                        <div className="w-full sm:w-32">
                          <input type="text" placeholder="Freq (e.g. 1-0-1)" required value={row.frequency} onChange={e => updateMedicineRow(index, 'frequency', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                        </div>
                        <div className="w-full sm:w-32">
                          <input type="text" placeholder="Duration (e.g. 5 days)" required value={row.duration} onChange={e => updateMedicineRow(index, 'duration', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                        </div>
                        <div className="w-full sm:w-24">
                          <input type="number" min="1" placeholder="Qty" required value={row.quantity} onChange={e => updateMedicineRow(index, 'quantity', parseInt(e.target.value))}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                        </div>
                        {prescriptionMedicines.length > 1 && (
                          <button type="button" onClick={() => removeMedicineRow(index)} className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200 hover:bg-red-500 hover:text-white">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Visit Section */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Suggested Next Visit
                  </label>
                  <select value={nextVisit} onChange={e => setNextVisit(e.target.value)}
                    className="w-full sm:w-64 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700">
                    <option value="">No follow-up needed</option>
                    <option value="3 days">In 3 Days</option>
                    <option value="1 week">In 1 Week</option>
                    <option value="2 weeks">In 2 Weeks</option>
                    <option value="1 month">In 1 Month</option>
                    <option value="2 months">In 2 Months</option>
                    <option value="6 months">In 6 Months</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                  <button type="button" onClick={() => setPrescribingFor(null)} className="px-8 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors">
                    Discard
                  </button>
                  <button type="submit" disabled={submitLoading} className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2">
                    {submitLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        Issue Official Prescription
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
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
