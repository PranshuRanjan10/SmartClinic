import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-300">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Glass Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-emerald-400 p-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Smart Clinic</h1>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative group overflow-hidden rounded-xl p-[1px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 opacity-70 group-hover:opacity-100 animate-gradient-xy transition-opacity duration-300"></span>
              <div className="relative bg-slate-950/80 backdrop-blur-sm px-5 py-2 rounded-xl transition-all duration-300 group-hover:bg-slate-950/50">
                <span className="text-sm font-semibold text-white">Get Started</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left Hero Content */}
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">Next-Gen Healthcare</span>
            </div>

            <h1 className="text-6xl sm:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Modern Care. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                Smarter Clinic.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl font-light">
              Experience healthcare reimagined. A unified platform seamlessly connecting patients, doctors, and pharmacies with zero friction and maximum security.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-emerald-100 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300"></div>
                <span className="relative">Book Appointment</span>
                <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-lg text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all"
              >
                Patient Portal
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
              <div>
                <div className="text-3xl font-black text-white mb-1">24<span className="text-indigo-400">/</span>7</div>
                <div className="text-xs font-medium text-slate-500 tracking-wider uppercase">Availability</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-1">100<span className="text-emerald-400">+</span></div>
                <div className="text-xs font-medium text-slate-500 tracking-wider uppercase">Specialists</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-1">Zero</div>
                <div className="text-xs font-medium text-slate-500 tracking-wider uppercase">Wait Time</div>
              </div>
            </div>
          </div>

          {/* Right Floating Cards */}
          <div className="relative hidden lg:block h-[600px] perspective-1000">
            {/* Appointment Card */}
            <div className="absolute top-10 right-10 w-80 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transform hover:-translate-y-2 hover:bg-white/10 transition-all duration-500 z-30">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Instant Booking</h3>
                  <p className="text-xs text-slate-400">Real-time scheduling</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 w-3/4"></div>
              </div>
            </div>

            {/* Pharmacy Card */}
            <div className="absolute top-48 left-0 w-80 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transform hover:-translate-y-2 hover:bg-white/10 transition-all duration-500 z-20">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Digital Pharmacy</h3>
                  <p className="text-xs text-slate-400">Prescriptions & Refills</p>
                </div>
              </div>
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">💊</div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">💉</div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">🧪</div>
              </div>
            </div>

            {/* Records Card */}
            <div className="absolute bottom-10 right-20 w-80 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl transform hover:-translate-y-2 hover:bg-white/10 transition-all duration-500 z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-500/20 p-3 rounded-2xl text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Secure Records</h3>
                  <p className="text-xs text-slate-400">End-to-end encrypted</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-1.5 bg-white/10 rounded-full w-full"></div>
                <div className="h-1.5 bg-white/10 rounded-full w-3/4"></div>
                <div className="h-1.5 bg-white/20 rounded-full w-5/6"></div>
                <div className="h-1.5 bg-white/5 rounded-full w-1/2"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
