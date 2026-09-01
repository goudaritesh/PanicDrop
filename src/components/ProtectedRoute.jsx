import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-cyan-400">AUTHENTICATING CIPHER...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">ACCESS RESTRICTED</h2>
        <p className="text-slate-400 text-sm max-w-md mt-2">
          Administrator clearance required to access this system module. Please log in with an administrator account.
        </p>
        <div className="mt-6 flex gap-4">
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold hover:text-cyan-400"
          >
            Return to Store
          </a>
          <a
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold"
          >
            Switch to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return children;
}
