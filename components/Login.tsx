import React, { useState } from 'react';
import { Hotel, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { name: string; role: string; email: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Demo credentials
  const DEMO_ACCOUNTS = [
    { email: 'admin@hotelsahil.com', password: 'admin123', name: 'Admin', role: 'Administrator' },
    { email: 'manager@hotelsahil.com', password: 'manager123', name: 'Sahil', role: 'Manager' },
    { email: 'staff@hotelsahil.com', password: 'staff123', name: 'Front Desk', role: 'Staff' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    const account = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (account) {
      onLogin({ name: account.name, role: account.role, email: account.email });
    } else {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center relative overflow-hidden">
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/8 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-amber-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-900/20 border border-red-800/30 mb-4 anim-float anim-glow">
            <Hotel className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-serif text-white tracking-wider">
            Hotel <span className="text-red-500">Sahil</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1 tracking-widest uppercase">Management System</p>
        </div>

        {/* Card */}
        <div className="bg-stone-900/60 backdrop-blur-sm rounded-2xl border border-white/5 p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-serif text-white">Welcome Back</h2>
            <p className="text-stone-500 text-sm mt-1">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-stone-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full bg-stone-800/80 border border-stone-700 rounded-lg px-4 py-3 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-stone-500">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-stone-800/80 border border-stone-700 rounded-lg px-4 py-3 pr-12 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                />
                <span className="text-stone-400 text-sm">Remember me</span>
              </label>
              <button type="button" className="text-red-500 text-sm hover:text-red-400 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3 text-red-400 text-sm anim-shake">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-6 rounded-lg font-serif text-lg tracking-wide flex items-center justify-center gap-3 transition-all ${
                isLoading
                  ? 'bg-stone-800 text-stone-400 cursor-wait'
                  : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-900/20 hover:shadow-red-900/30 transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-stone-900/40 backdrop-blur-sm rounded-xl border border-white/5 p-5">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-3 text-center">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account)}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-red-600/50 hover:bg-stone-800 transition-all"
              >
                <span className="text-white text-sm font-medium">{account.name}</span>
                <span className="text-stone-500 text-[10px]">{account.role}</span>
              </button>
            ))}
          </div>
          <p className="text-stone-600 text-[10px] text-center mt-3">
            Click a role above to auto-fill credentials, then hit Sign In
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-stone-600 text-xs mt-6">
          © 2026 eXon Solution Pvt. Ltd —
        </p>
      </div>
    </div>
  );
};

export default Login;
