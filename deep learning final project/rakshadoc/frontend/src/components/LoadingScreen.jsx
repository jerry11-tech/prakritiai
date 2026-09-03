import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = 'Initializing workspace...' }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-cyan-500/30 animate-pulse">
          R
        </div>

        <div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            RakshaDoc
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
            Document AI Workspace
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{message}</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full w-2/3 animate-pulse rounded-full"></div>
          </div>

          <p className="text-[11px] text-slate-400">
            Preparing document processing & Braille engine...
          </p>
        </div>
      </div>
    </div>
  );
}
