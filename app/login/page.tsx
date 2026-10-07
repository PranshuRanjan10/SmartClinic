import Link from 'next/link';
import LoginForm from '@/frontend/modules/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="bg-gradient-to-br from-indigo-500 to-emerald-400 p-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-transform group-hover:scale-110">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Smart Clinic</h1>
            </div>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-[1.2] mb-6 tracking-tight">
            Connect to your <br />
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Healthcare Hub.</span>
          </h2>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            Securely access your patient portal. Manage appointments, order prescriptions, and track your health records in one seamless experience.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs text-white">👨‍⚕️</div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs text-white">👩‍⚕️</div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs text-white">🏥</div>
            </div>
            <p className="text-sm font-medium text-slate-400">Trusted by top professionals</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Mobile Navbar */}
        <Link href="/" className="lg:hidden absolute top-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-emerald-500 p-2 rounded-xl shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Clinic</h1>
        </Link>

        <div className="w-full max-w-md mt-16 lg:mt-0">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>

          {/* Form Component */}
          <LoginForm />

          {/* Registration Link */}
          <div className="mt-8 text-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-slate-500 mb-3 text-sm">Don't have an account?</p>
            <Link
              href="/register"
              className="inline-block w-full text-center py-3 px-4 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm font-semibold transition-all"
            >
              First time here? Register as Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
