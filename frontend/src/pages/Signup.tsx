import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, User, ArrowRight, UserCheck, ShieldCheck, Loader2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/signup', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-slate-50 relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl border border-white p-10 rounded-3xl shadow-xl shadow-slate-200">
          
          <div>
            <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm" role="alert">
                <span className="block sm:inline">Registration successful! Redirecting...</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input name="name" type="text" required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-slate-50 focus:bg-white transition-all outline-none"
                    placeholder="John Doe" value={formData.name} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input name="email" type="email" required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-slate-50 focus:bg-white transition-all outline-none"
                    placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Type</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'user' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}>
                        <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} className="sr-only" />
                        <UserCheck className={`w-6 h-6 mb-2 ${formData.role === 'user' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium">Team Member</span>
                    </label>
                    <label className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'admin' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}>
                        <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} className="sr-only" />
                        <ShieldCheck className={`w-6 h-6 mb-2 ${formData.role === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium">Admin / Manager</span>
                    </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secure Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input name="password" type="password" required minLength={6}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-slate-50 focus:bg-white transition-all outline-none"
                    placeholder="••••••••" value={formData.password} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit" disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all shadow-md shadow-indigo-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-200" /> : <>Complete Registration<ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;