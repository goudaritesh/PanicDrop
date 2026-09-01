import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Lock, Mail, ArrowRight, ShieldAlert, User, Key } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMessage(res.message || 'Invalid email or password.');
    }
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@panicdrop.com');
    setPassword('admin123');
  };

  const handleQuickDemoCustomer = () => {
    setEmail('customer@panicdrop.com');
    setPassword('customer123');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-sm space-y-6">
          
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-sm font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sign In to PanicDrop</h1>
            <p className="text-xs text-gray-500">
              Access your orders, wishlist, and profile settings.
            </p>
          </div>

          {/* 1-Click Fast Demo Credentials */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block text-center">
              1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-gray-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Admin Demo
              </button>
              <button
                type="button"
                onClick={handleQuickDemoCustomer}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-gray-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" /> Customer Demo
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
