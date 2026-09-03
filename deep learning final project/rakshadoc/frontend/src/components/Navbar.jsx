import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Eye, Volume2, ShieldCheck, LogOut, FileText, UserCheck, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { highContrast, toggleHighContrast, screenReaderActive, toggleScreenReader } = useAccessibility();
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
            R
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-wide">
              RakshaDoc
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Indic Document AI & Braille Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Accessibility Toolbar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleHighContrast}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 shadow-md'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle High Contrast Mode for Low Vision"
        >
          {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>High Contrast</span>
        </button>

        <button
          onClick={toggleScreenReader}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            screenReaderActive
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Screen Reader Mode"
        >
          <Volume2 className="w-4 h-4" />
          <span>Screen Reader: {screenReaderActive ? 'ON' : 'OFF'}</span>
        </button>

        {user ? (
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-xs font-medium text-slate-300 hover:text-cyan-400 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Workspace</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}

            <div className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-800/80 rounded-md">
              {user.full_name}
            </div>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 pl-4 border-l border-slate-800">
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
