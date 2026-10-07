'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/lib/session';

interface PharmacyOrder {
  id: string;
  prescription_id: string;
  patient_id: string;
  total_amount: number;
  status: 'pending' | 'ready' | 'collected' | 'unavailable';
  created_at: string;
}

interface Medicine {
  id: string;
  name: string;
  unit_price: number;
  stock_quantity: number;
}

const STATUS_STYLES: Record<PharmacyOrder['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-900/10',
  ready: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-900/10',
  collected: 'bg-slate-100 text-slate-600 border-slate-200 shadow-slate-900/10',
  unavailable: 'bg-red-100 text-red-600 border-red-200 shadow-red-900/10',
};

export default function PharmacistDashboard() {
  const session = getSession();
  const userId = session?.id ?? '';

  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'all'>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Walk-in mode states
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<{ med: Medicine; qty: number }[]>([]);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const status = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const res = await fetch(`/api/pharmacy/orders${status}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data ?? []);
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
    fetch('/api/pharmacy/medicines')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMedicines(data.data);
      })
      .catch(() => { });
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: PharmacyOrder['status']) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, pharmacistId: userId }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch { }
    finally { setUpdatingId(null); }
  };

  const addToCart = (medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.med.id === medId);
      if (existing) {
        if (existing.qty >= med.stock_quantity) return prev;
        return prev.map((item) => (item.med.id === medId ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { med, qty: 1 }];
    });
  };

  const updateCartQty = (medId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.med.id === medId) {
            const newQty = item.qty + delta;
            return { ...item, qty: Math.max(0, Math.min(newQty, item.med.stock_quantity)) };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const submitWalkInOrder = async () => {
    if (cart.length === 0) return;
    if (!userId) {
      setWalkInError('Session expired. Please log in again.');
      return;
    }
    setWalkInLoading(true);
    setWalkInError('');
    try {
      const res = await fetch('/api/pharmacy/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          medicines: cart.map((c) => ({ medicine_id: c.med.id, quantity: c.qty })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        setShowWalkInModal(false);
        fetchOrders();
        fetch('/api/pharmacy/medicines')
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setMedicines(data.data);
          });
      } else {
        setWalkInError(data.error || 'Failed to submit order');
      }
    } catch {
      setWalkInError('Network error');
    } finally {
      setWalkInLoading(false);
    }
  };

  const pending = orders.filter((o) => o.status === 'pending').length;
  const ready = orders.filter((o) => o.status === 'ready').length;
  const cartTotal = cart.reduce((sum, item) => sum + item.med.unit_price * item.qty, 0);

  const statCards = [
    { label: 'Pending Dispensation', value: loading ? '—' : pending, icon: '⏳', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { label: 'Ready for Pickup', value: loading ? '—' : ready, icon: '✅', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Today Orders', value: loading ? '—' : orders.length, icon: '📦', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: "Today's Revenue", value: loading ? '—' : `₹${orders.filter(o => o.status === 'collected').reduce((s, o) => s + o.total_amount, 0).toLocaleString()}`, icon: '💰', color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800 pb-20">

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px] -mt-10 -mr-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -mb-10 -ml-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">Pharmacy Terminal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
              Dispensary Control
            </h1>
            <p className="text-slate-400 font-medium">Manage e-prescriptions and walk-in sales</p>
          </div>

          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-6 py-3.5 bg-amber-500 text-slate-900 font-extrabold rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/50 flex items-center justify-center gap-2 border border-amber-400/50 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Walk-in POS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center group hover:border-amber-200 transition-colors">
            <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <p className="text-3xl font-black text-slate-800">{card.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">⚠️ {error}</div>
      )}

      {/* Order Management Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Floating Pill Tabs */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Order Queue</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Process generated prescriptions</p>
          </div>

          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            {(['pending', 'ready', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh Queue
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold">Synchronizing Orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="text-5xl mb-3 opacity-40">📭</div>
              <p className="text-slate-800 font-bold text-lg mb-1">Queue is Clear</p>
              <p className="text-slate-500 text-sm">No {activeTab === 'all' ? '' : activeTab} prescriptions currently require attention.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-col bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">

                  {/* Decorative side accent based on status */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'pending' ? 'bg-amber-400' : order.status === 'ready' ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>

                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider rounded-lg border shadow-sm ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                      <p className="font-bold text-slate-900 mt-2 flex items-center gap-2">
                        <span>🏷️ Order #{order.id.slice(-6).toUpperCase()}</span>
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total</p>
                      <p className="text-2xl font-black text-slate-900">₹{order.total_amount}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-2 pl-2">
                    {order.status === 'pending' && (
                      <button disabled={updatingId === order.id} onClick={() => handleStatusUpdate(order.id, 'ready')}
                        className="w-full sm:w-auto px-5 py-2 text-sm bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {updatingId === order.id ? 'Processing...' : 'Mark as Ready'}
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button disabled={updatingId === order.id} onClick={() => handleStatusUpdate(order.id, 'collected')}
                        className="w-full sm:w-auto px-5 py-2 text-sm bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {updatingId === order.id ? 'Processing...' : 'Mark as Collected'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POS Modal Overlay */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto w-full">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative my-8 animate-fade-in-up border border-slate-200 overflow-hidden">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Point of Sale</h2>
                  <p className="text-amber-500 font-bold text-sm tracking-wide uppercase">Direct Counter Transaction</p>
                </div>
              </div>
              <button onClick={() => { setShowWalkInModal(false); setCart([]); setWalkInError(''); }}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors mt-4 sm:mt-0 self-end sm:self-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-50">

              {/* Product Grid (Left Side) */}
              <div className="flex-1 p-6 md:border-r border-slate-200 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-end mb-6">
                  <h3 className="font-extrabold text-slate-900 text-lg">Inventory Directory</h3>
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">{medicines.length} items logged</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {medicines.map((med) => (
                    <div key={med.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors pr-2">{med.name}</p>
                          <p className="font-black text-amber-500 whitespace-nowrap">₹{med.unit_price}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mb-4">
                          <span className={`w-2 h-2 rounded-full ${med.stock_quantity > 10 ? 'bg-emerald-500' : med.stock_quantity > 0 ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></span>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock: {med.stock_quantity}</p>
                        </div>
                      </div>
                      <button onClick={() => addToCart(med.id)} disabled={med.stock_quantity <= 0}
                        className="w-full py-2.5 text-sm font-bold bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl transition-colors disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed border border-transparent disabled:border-slate-200">
                        {med.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Pane (Right Side) */}
              <div className="w-full md:w-[400px] flex flex-col bg-white shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10">

                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="font-extrabold text-slate-900 text-lg mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    Transaction Receipt
                  </h3>

                  {walkInError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold shadow-sm">
                      ⚠️ {walkInError}
                    </div>
                  )}

                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      </div>
                      <p className="font-bold text-slate-900 text-lg">Cart is Empty</p>
                      <p className="text-sm text-slate-500 font-medium mt-1">Add items from the inventory<br />to begin transaction.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.med.id} className="flex flex-col bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="pr-4">
                              <p className="text-sm font-bold text-slate-900 leading-tight">{item.med.name}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5 font-mono">₹{item.med.unit_price} / unit</p>
                            </div>
                            <span className="font-black text-slate-900">₹{(item.med.unit_price * item.qty).toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-32">
                            <button onClick={() => updateCartQty(item.med.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 font-bold hover:bg-amber-100 hover:text-amber-700 transition-colors">-</button>
                            <span className="text-sm font-black text-slate-900 w-8 text-center">{item.qty}</span>
                            <button onClick={() => updateCartQty(item.med.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 font-bold hover:bg-amber-100 hover:text-amber-700 transition-colors">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkout Footer Total Area */}
                <div className="p-6 bg-slate-900 text-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-20">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Amount Due</span>
                      <p className="text-sm text-slate-300 font-medium mt-0.5">{cart.length} item(s) selected</p>
                    </div>
                    <span className="text-4xl font-extrabold text-amber-500">₹{cartTotal.toLocaleString()}</span>
                  </div>

                  <button onClick={submitWalkInOrder} disabled={cart.length === 0 || walkInLoading}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-extrabold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none flex items-center justify-center gap-3">
                    {walkInLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Tender Exact Cash
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
