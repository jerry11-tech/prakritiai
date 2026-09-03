import React, { useState, useEffect } from 'react';
import { Eye, Download, Copy, Check, FileText, Sparkles, Volume2 } from 'lucide-react';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';

export default function BrailleViewer({ document }) {
  const [brailleData, setBrailleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { speakText } = useAccessibility();

  useEffect(() => {
    if (document) {
      fetchBraille();
    }
  }, [document]);

  const fetchBraille = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/braille/convert/${document.id}`);
      setBrailleData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (brailleData?.unicode_braille) {
      navigator.clipboard.writeText(brailleData.unicode_braille);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!document) return null;

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Braille Reader & Accessibility Export
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Grade 1 & Grade 2 Unicode Braille translation (compatible with Refreshable Braille Displays & Embossers)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Braille' : 'Copy'}</span>
          </button>

          <a
            href={`/api/v1/braille/download/${document.id}`}
            download
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 border border-indigo-500 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .BRF</span>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Generating Grade 1 & Grade 2 Braille Unicode Encoding...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unicode Braille Box */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Unicode Braille Output (\u2800 - \u28FF)
              </span>
              <button
                onClick={() => speakText("Braille conversion complete. Ready for refreshable braille displays.")}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Listen Status</span>
              </button>
            </div>
            <pre className="text-lg font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-2 selection:bg-indigo-500 selection:text-white">
              {brailleData?.unicode_braille || '⠠⠁⠠⠃⠠⠉ ⠠⠙⠠⠑⠠⠋ ⠠⠛⠠h⠠⠊ ⠠⠚⠠⠅⠠⠇ ⠠⠍⠠⠝⠠⠕'}
            </pre>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>• Compatible with Freedom Scientific, HumanWare, and Orbit Braille Displays</span>
            <span className="text-emerald-400 font-semibold">Ready for Embosser (.BRF)</span>
          </div>
        </div>
      )}
    </div>
  );
}
