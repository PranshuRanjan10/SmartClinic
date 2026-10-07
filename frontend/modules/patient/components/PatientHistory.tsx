'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/session';

type AppointmentStatus = 'upcoming' | 'live' | 'done' | 'cancelled';

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: AppointmentStatus;
  notes?: string;
  doctors?: { users?: { name: string }; specialization: string };
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  upcoming: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  live: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  done: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
};

export default function PatientHistory() {
  const session = getSession();
  const userId = session?.id ?? '';
  const headers = { 'x-user-id': userId };

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch('/api/appointments', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointments(data.data ?? []);
        else setError(data.error || 'Failed to load history');
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false));
  }, [userId]);

  const past = appointments.filter(a => a.status === 'done' || a.status === 'cancelled');
  const active = appointments.filter(a => a.status === 'upcoming' || a.status === 'live');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/dashboard/patient" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold transition text-sm">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Medical History</h1>
          <p className="text-slate-500 font-medium mt-1">All your past and upcoming appointments</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-bold">{error}</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-40">📅</div>
              <p className="text-xl font-bold text-slate-800 mb-1">No appointment history</p>
              <p className="text-slate-500 font-medium">Your appointments will appear here once booked.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {active.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Active</h2>
                  <div className="space-y-3">
                    {active.map(apt => <AppointmentRow key={apt.id} apt={apt} />)}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Past</h2>
                  <div className="space-y-3">
                    {past.map(apt => <AppointmentRow key={apt.id} apt={apt} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentRow({ apt }: { apt: Appointment }) {
  const STATUS_COLORS: Record<AppointmentStatus, string> = {
    upcoming: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    live: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    done: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-700 font-black text-lg">
          {apt.queue_number}
        </div>
        <div>
          <p className="font-bold text-slate-900">Dr. {apt.doctors?.users?.name || 'Unknown'}</p>
          <p className="text-sm text-slate-500 font-medium">{apt.doctors?.specialization || 'General'}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-slate-600">{new Date(apt.appointment_date).toLocaleDateString()}</span>
        <span className="font-medium text-slate-600">{apt.time_slot}</span>
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${STATUS_COLORS[apt.status]}`}>
          {apt.status}
        </span>
      </div>
    </div>
  );
}
