import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle, Sparkles, Sliders } from 'lucide-react';
import axios from 'axios';

export default function DocumentUploader({ onDocumentParsed }) {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('hi');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document image or PDF file.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const res = await axios.post('/api/v1/layout/parse', formData);
      onDocumentParsed(res.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and parse document layout.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Upload Scanned Indic Document
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Supports noisy, low-quality, blurred or ink-faded scanned Indic documents (PNG, JPG, PDF)
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs font-semibold text-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="hi" className="bg-slate-900 text-slate-200">Hindi / Indic (हिंदी)</option>
            <option value="en" className="bg-slate-900 text-slate-200">English (en)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            file
              ? 'border-emerald-500/80 bg-emerald-950/10'
              : 'border-slate-700 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-cyan-400'
            }`}>
              {file ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
            </div>

            {file ? (
              <div>
                <span className="text-sm font-semibold text-emerald-400">{file.name}</span>
                <span className="block text-xs text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Click to change file
                </span>
              </div>
            ) : (
              <div>
                <span className="text-sm font-semibold text-slate-200">
                  Drop scanned document here or <span className="text-cyan-400 underline">browse</span>
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Enhances contrast, denoises, deskews & localizes Title, Tables, Stamps & Signatures
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className={`mt-4 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            uploading || !file
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enhancing Quality & Parsing Layout...</span>
            </>
          ) : (
            <>
              <FileCode className="w-4 h-4" />
              <span>Parse Indic Document Layout</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
