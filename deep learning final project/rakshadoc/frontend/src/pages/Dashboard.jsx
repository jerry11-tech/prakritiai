import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DocumentUploader from '../components/DocumentUploader';
import BoundingBoxCanvas from '../components/BoundingBoxCanvas';
import BrailleViewer from '../components/BrailleViewer';
import AudioPlayer from '../components/AudioPlayer';
import { FileText, Download, Sparkles, Clock, LayoutGrid, CheckCircle2, ChevronRight, Layers, FileSpreadsheet, FileCode, AlertCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas', 'braille', 'audio'
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const { speakText } = useAccessibility();

  useEffect(() => {
    console.log('[Dashboard] Mounting');
    console.log('[Dashboard] API initialization started');
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setFetchError('');
    try {
      const res = await axios.get('/api/v1/layout/documents');
      console.log('[Dashboard] API initialization completed (fetched', res.data.length, 'documents)');
      setDocuments(res.data || []);
      if (res.data && res.data.length > 0 && !currentDoc) {
        setCurrentDoc(res.data[0]);
        setCurrentPage(1);
      }
      console.log('[Dashboard] Workspace initialized');
    } catch (err) {
      console.error('[Dashboard ERROR] Failed to fetch document history:', err?.message || err);
      setFetchError('Could not load existing document history. You can still upload new documents.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDocumentParsed = (doc) => {
    setDocuments(prev => [doc, ...prev]);
    setCurrentDoc(doc);
    setCurrentPage(1);
    setSelectedElement(null);
    if (speakText) {
      speakText(`Document ${doc.filename} successfully parsed. Quality score ${doc.quality_score} percent.`);
    }
  };

  console.log('[Dashboard] Rendering dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl card">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Indic Document Layout Parsing & Braille Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
            Document AI Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Upload low-quality scanned Indic documents. Perform denoising, CLAHE contrast enhancement, multi-class layout segmentation, OCR, Grade 1/2 Braille conversion & Screen-reader speech.
          </p>
        </div>

        {/* Quick Export Controls for Active Document */}
        {currentDoc && (
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-700/80 shrink-0">
            <span className="text-xs font-semibold text-slate-300 pl-2">Export:</span>
            <a
              href={`/api/v1/export/download/${currentDoc.id}?format=json`}
              download
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
              title="Download Layout JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              JSON
            </a>
            <a
              href={`/api/v1/export/download/${currentDoc.id}?format=docx`}
              download
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
              title="Download Layout Word DOCX"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              DOCX
            </a>
            <a
              href={`/api/v1/export/download/${currentDoc.id}?format=pdf`}
              download
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30 transition"
              title="Download Searchable PDF"
            >
              <Download className="w-3.5 h-3.5" />
              Searchable PDF
            </a>
          </div>
        )}
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchHistory}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white font-semibold rounded-xl flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & History List (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <DocumentUploader onDocumentParsed={handleDocumentParsed} />

          {/* History Documents */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl card">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Scanned Documents ({documents.length})
            </h3>

            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading recent documents...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No documents uploaded yet. Upload a scanned image above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => { setCurrentDoc(doc); setCurrentPage(1); setSelectedElement(null); }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      currentDoc && currentDoc.id === doc.id
                        ? 'bg-gradient-to-r from-cyan-950/80 to-slate-800 border-cyan-500/80 shadow-md'
                        : 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-semibold text-slate-200 block truncate">{doc.filename}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Pages: {doc.total_pages || 1} • Elements: {doc.layout_elements?.length || 0} • Score: {doc.quality_score}%
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parsed Interactive View & Accessibility Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentDoc ? (
            <>
              {/* Multi-page Navigation Control if total_pages > 1 */}
              {(currentDoc.total_pages || 1) > 1 && (
                <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg font-bold">
                      Multi-Page Document ({currentDoc.total_pages} Pages)
                    </span>
                    <span>Currently Viewing: Page {currentPage} of {currentDoc.total_pages}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1 border border-slate-700 transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous Page</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(currentDoc.total_pages, p + 1))}
                      disabled={currentPage >= currentDoc.total_pages}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1 border border-slate-700 transition"
                    >
                      <span>Next Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    activeTab === 'canvas'
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Layout Canvas & Segmentation</span>
                </button>

                <button
                  onClick={() => setActiveTab('braille')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    activeTab === 'braille'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Braille Reader (.BRF Export)</span>
                </button>

                <button
                  onClick={() => setActiveTab('audio')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    activeTab === 'audio'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Audio Screen Reader</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'canvas' && (
                <div className="space-y-6">
                  <BoundingBoxCanvas
                    document={currentDoc}
                    currentPage={currentPage}
                    selectedElement={selectedElement}
                    onSelectElement={setSelectedElement}
                  />

                  {/* Element Inspector Drawer */}
                  {selectedElement ? (
                    <div className="bg-slate-800/90 border border-cyan-500/60 rounded-2xl p-5 shadow-2xl card animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                          Selected Category: {selectedElement.category}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          Confidence: {(selectedElement.confidence * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Extracted Text Content (OCR)
                        </label>
                        <p className="text-sm text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-700 font-sans leading-relaxed">
                          {selectedElement.extracted_text || 'No text recognized.'}
                        </p>
                      </div>

                      <div className="space-y-2 mt-3">
                        <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                          Braille Unicode Translation
                        </label>
                        <p className="text-base text-indigo-300 bg-slate-900/90 p-3 rounded-xl border border-indigo-950 font-mono tracking-widest">
                          {selectedElement.braille_text}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                      Click any bounding box above (Title, Table, Stamp, Signature) to inspect its OCR text & Braille.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'braille' && <BrailleViewer document={currentDoc} />}

              {activeTab === 'audio' && <AudioPlayer document={currentDoc} />}
            </>
          ) : (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-12 text-center text-slate-400">
              Upload a scanned document to view layout analysis & Braille exports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
