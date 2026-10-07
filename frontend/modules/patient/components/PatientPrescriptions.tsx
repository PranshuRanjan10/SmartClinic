'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/session';

interface PrescriptionMedicine {
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  medicines: { name: string };
}

interface Prescription {
  id: string;
  diagnosis: string;
  notes: string;
  created_at: string;
  doctors: { users: { name: string } };
  prescription_medicines: PrescriptionMedicine[];
}

export default function PatientPrescriptions() {
  const session = getSession();
  const userId = session?.id ?? '';
  const headers = { 'x-user-id': userId };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch('/api/patient/prescriptions', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrescriptions(data.data ?? []);
        } else {
          setError(data.error || 'Failed to load prescriptions');
        }
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false));
  }, [userId]);

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Prescriptions</h1>
          <p className="text-slate-500 font-medium mt-1">All prescriptions issued by your doctors</p>
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
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-40">📋</div>
              <p className="text-xl font-bold text-slate-800 mb-1">No prescriptions yet</p>
              <p className="text-slate-500 font-medium">Prescriptions from your doctors will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map(rx => (
                <div key={rx.id} className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 capitalize">{rx.diagnosis}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        Dr. {rx.doctors?.users?.name || 'Unknown'} &bull; {new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider self-start">
                      Issued
                    </span>
                  </div>

                  {rx.prescription_medicines?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prescribed Medicines</p>
                      {rx.prescription_medicines.map((med, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💊</span>
                            <span className="font-bold text-slate-800">{med.medicines?.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                            <span className="bg-white border border-slate-200 px-2 py-1 rounded-lg">{med.dosage}</span>
                            <span className="bg-white border border-slate-200 px-2 py-1 rounded-lg">{med.frequency}</span>
                            <span className="bg-white border border-slate-200 px-2 py-1 rounded-lg">{med.duration}</span>
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-1 rounded-lg">Qty: {med.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {rx.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 italic">📝 {rx.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
