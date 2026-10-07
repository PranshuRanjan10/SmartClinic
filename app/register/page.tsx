import Link from 'next/link';
import RegisterForm from '@/frontend/modules/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-[10%] right-[10%] w-[60%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="bg-gradient-to-br from-indigo-500 to-emerald-400 p-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-transform group-hover:scale-110">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Smart Clinic</h1>
            </div>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-[1.2] mb-6 tracking-tight">
            Start your journey <br />
            <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">to better health.</span>
          </h2>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            Join the smart healthcare revolution. Register as a patient today to book appointments, manage prescriptions, and track your medical history instantly.
          </p>

          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <p className="text-slate-300 italic">"The simplest way to manage my family's healthcare needs. The digital prescriptions feature is a lifesaver."</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">SJ</div>
              <div>
                <p className="text-sm font-bold text-white">Sarah Jenkins</p>
                <p className="text-xs text-slate-400">Verified Patient</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Mobile Navbar */}
        <Link href="/" className="lg:hidden absolute top-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-emerald-500 p-2 rounded-xl shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Clinic</h1>
        </Link>

        <div className="w-full max-w-md mt-16 lg:mt-0">
          <div className="mb-8 border-b border-slate-100 pb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium">Register as a patient to access the portal.</p>
          </div>

          {/* Form Component */}
          <RegisterForm />

          {/* Login Link */}
          <div className="mt-8 text-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-slate-500 mb-3 text-sm">Already have an account?</p>
            <Link
              href="/login"
              className="inline-block w-full text-center py-3 px-4 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm font-semibold transition-all"
            >
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
