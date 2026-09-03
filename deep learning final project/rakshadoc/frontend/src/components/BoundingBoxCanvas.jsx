import React, { useState, useRef, useEffect } from 'react';
import { Eye, Bug, ZoomIn, ZoomOut, Maximize2, MoveHorizontal, AlertTriangle } from 'lucide-react';

const CATEGORY_COLORS = {
  Title: 'border-cyan-400 bg-cyan-500/20 text-cyan-200',
  Header: 'border-indigo-400 bg-indigo-500/20 text-indigo-200',
  Paragraph: 'border-slate-400 bg-slate-500/20 text-slate-200',
  Table: 'border-emerald-400 bg-emerald-500/20 text-emerald-200',
  Figure: 'border-amber-400 bg-amber-500/20 text-amber-200',
  Signature: 'border-rose-400 bg-rose-500/20 text-rose-200',
  'Official Stamp': 'border-purple-400 bg-purple-500/20 text-purple-200',
  Logo: 'border-blue-400 bg-blue-500/20 text-blue-200',
  Footer: 'border-zinc-400 bg-zinc-500/20 text-zinc-200'
};

/**
 * Central Bounding Box Normalization Function
 * Converts raw coordinates into percentages relative to original image size.
 */
export function normalizeBoundingBox(elem, docWidth = 800, docHeight = 1000) {
  if (!elem) return null;

  let x1 = Number(elem.bbox_x1);
  let y1 = Number(elem.bbox_y1);
  let x2 = Number(elem.bbox_x2);
  let y2 = Number(elem.bbox_y2);

  if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
    console.warn('[BoundingBox WARNING] Non-finite bbox coordinates:', elem);
    return null;
  }

  if (x2 < x1) [x1, x2] = [x2, x1];
  if (y2 < y1) [y1, y2] = [y2, y1];

  const rawWidth = x2 - x1;
  const rawHeight = y2 - y1;

  if (rawWidth <= 0 || rawHeight <= 0) {
    console.warn('[BoundingBox WARNING] Non-positive dimensions:', elem);
    return null;
  }

  const isNormalized = x1 <= 1.0 && y1 <= 1.0 && x2 <= 1.0 && y2 <= 1.0 && docWidth > 1 && docHeight > 1;
  const origX = isNormalized ? x1 * docWidth : x1;
  const origY = isNormalized ? y1 * docHeight : y1;
  const origW = isNormalized ? rawWidth * docWidth : rawWidth;
  const origH = isNormalized ? rawHeight * docHeight : rawHeight;

  const clampedX = Math.max(0, Math.min(docWidth, origX));
  const clampedY = Math.max(0, Math.min(docHeight, origY));
  const clampedW = Math.min(docWidth - clampedX, origW);
  const clampedH = Math.min(docHeight - clampedY, origH);

  const leftPct = (clampedX / docWidth) * 100;
  const topPct = (clampedY / docHeight) * 100;
  const widthPct = (clampedW / docWidth) * 100;
  const heightPct = (clampedH / docHeight) * 100;

  return {
    origX: Math.round(clampedX),
    origY: Math.round(clampedY),
    origW: Math.round(clampedW),
    origH: Math.round(clampedH),
    leftPct: leftPct.toFixed(3),
    topPct: topPct.toFixed(3),
    widthPct: widthPct.toFixed(3),
    heightPct: heightPct.toFixed(3)
  };
}

export default function BoundingBoxCanvas({ document, currentPage = 1, selectedElement, onSelectElement }) {
  const [viewMode, setViewMode] = useState('fit-page'); // 'fit-page', 'fit-width', 'zoom'
  const [zoomLevel, setZoomLevel] = useState(100); // 50, 75, 100, 125, 150, 200
  const [debugMode, setDebugMode] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 800, height: 1000 });
  const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });
  const [aspectMismatch, setAspectMismatch] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  if (!document) return null;

  const docWidth = naturalDimensions.width || document.img_width || 800;
  const docHeight = naturalDimensions.height || document.img_height || 1000;

  const elements = (document.layout_elements || []).filter(
    elem => (elem.page_number || 1) === currentPage
  );

  const rawFileName = document.file_path ? document.file_path.split(/[/\\\\]/).pop() : (document.filename || '');
  const imageSrc = rawFileName ? `/uploads/${rawFileName}` : 'https://via.placeholder.com/600x800/1e293b/94a3b8?text=Indic+Document+Preview';

  const handleImageLoad = (e) => {
    const { clientWidth, clientHeight, naturalWidth, naturalHeight } = e.target;
    const realWidth = naturalWidth || docWidth;
    const realHeight = naturalHeight || docHeight;
    setNaturalDimensions({ width: realWidth, height: realHeight });
    setDisplayedSize({ width: clientWidth, height: clientHeight });

    const origRatio = realWidth / realHeight;
    const dispRatio = clientWidth / (clientHeight || 1);
    const mismatch = Math.abs(origRatio - dispRatio) > 0.05;
    setAspectMismatch(mismatch);

    if (mismatch) {
      console.error(`[BoundingBox ERROR] Document aspect ratio mismatch! Original: ${origRatio.toFixed(3)} (${realWidth}x${realHeight}), Rendered: ${dispRatio.toFixed(3)} (${clientWidth}x${clientHeight})`);
    } else {
      console.log('[BoundingBox] Image aspect ratio preserved:', {
        original: `${realWidth} × ${realHeight} (${origRatio.toFixed(3)})`,
        displayed: `${clientWidth} × ${clientHeight} (${dispRatio.toFixed(3)})`,
        scale: (clientWidth / realWidth).toFixed(4)
      });
    }
  };

  useEffect(() => {
    const updateSize = () => {
      if (imgRef.current) {
        const clientWidth = imgRef.current.clientWidth;
        const clientHeight = imgRef.current.clientHeight;
        setDisplayedSize({ width: clientWidth, height: clientHeight });
        if (docWidth > 0 && docHeight > 0) {
          const origRatio = docWidth / docHeight;
          const dispRatio = clientWidth / (clientHeight || 1);
          setAspectMismatch(Math.abs(origRatio - dispRatio) > 0.05);
        }
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [viewMode, zoomLevel, docWidth, docHeight]);

  const origRatio = docWidth / docHeight;
  const dispRatio = displayedSize.height > 0 ? displayedSize.width / displayedSize.height : origRatio;
  const currentScale = docWidth > 0 ? (displayedSize.width / docWidth) : 1;

  // Determine Image Styling based on View Mode
  const getImageStyle = () => {
    if (viewMode === 'fit-page') {
      return {
        maxHeight: '72vh',
        maxWidth: '100%',
        width: 'auto',
        height: 'auto',
        display: 'block'
      };
    } else if (viewMode === 'fit-width') {
      return {
        width: '100%',
        height: 'auto',
        display: 'block'
      };
    } else {
      // Zoom Mode
      const targetWidth = Math.round(docWidth * (zoomLevel / 100));
      return {
        width: `${targetWidth}px`,
        height: 'auto',
        display: 'block'
      };
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl card space-y-4">
      {/* Canvas Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Segmented Layout Canvas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {document.filename} • Page {currentPage} • Original: {docWidth}×{docHeight}px (Ratio: {origRatio.toFixed(3)})
          </p>
        </div>

        {/* View Mode & Zoom Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Modes */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('fit-page')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'fit-page'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Fit entire page in view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit Page</span>
            </button>

            <button
              onClick={() => setViewMode('fit-width')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'fit-width'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Fit document to viewer width"
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
              <span>Fit Width</span>
            </button>

            <button
              onClick={() => { setViewMode('zoom'); setZoomLevel(100); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'zoom'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Set to 100% natural resolution"
            >
              <span>100%</span>
            </button>
          </div>

          {/* Zoom Level Controls */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                setViewMode('zoom');
                setZoomLevel(z => Math.max(50, z - 25));
              }}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-cyan-300 font-bold px-1 min-w-[38px] text-center">
              {viewMode === 'fit-page' ? 'Fit' : viewMode === 'fit-width' ? 'Width' : `${zoomLevel}%`}
            </span>
            <button
              onClick={() => {
                setViewMode('zoom');
                setZoomLevel(z => Math.min(200, z + 25));
              }}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Debug Mode Toggle */}
          <button
            onClick={() => setDebugMode(prev => !prev)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition ${
              debugMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug BBox</span>
          </button>
        </div>
      </div>

      {/* Aspect Ratio Mismatch Alert */}
      {aspectMismatch && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>[BoundingBox ERROR] Document aspect ratio mismatch detected! Original: {origRatio.toFixed(3)}, Rendered: {dispRatio.toFixed(3)}</span>
        </div>
      )}

      {/* Debug Info Panel */}
      {debugMode && (
        <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3 text-xs font-mono text-amber-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div><span className="text-slate-400">Original:</span> {docWidth} × {docHeight}</div>
          <div><span className="text-slate-400">Rendered:</span> {displayedSize.width} × {displayedSize.height}</div>
          <div><span className="text-slate-400">Orig Ratio:</span> {origRatio.toFixed(3)}</div>
          <div><span className="text-slate-400">Disp Ratio:</span> {dispRatio.toFixed(3)}</div>
          <div><span className="text-slate-400">Scale:</span> {currentScale.toFixed(4)}</div>
          <div><span className="text-slate-400">View Mode:</span> {viewMode}</div>
          <div><span className="text-slate-400">Zoom:</span> {zoomLevel}%</div>
          <div><span className="text-slate-400">Elements:</span> {elements.length}</div>
        </div>
      )}

      {/* Document Viewport - Scrollable container */}
      <div
        ref={containerRef}
        className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-auto flex justify-center max-h-[78vh] min-h-[450px]"
      >
        {/* Document Wrapper: position-relative inline-block so bounding box overlay is locked to EXACT rendered image bounds */}
        <div className="relative inline-block rounded-xl border border-slate-700/80 shadow-2xl h-fit">
          {/* Document Image */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Parsed Document Layout"
            onLoad={handleImageLoad}
            style={getImageStyle()}
            className="select-none pointer-events-auto rounded-xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/600x800/1e293b/94a3b8?text=Indic+Document+Preview';
            }}
          />

          {/* Bounding Box Overlay Layer (inset-0 matches EXACT rendered image size) */}
          <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
            {elements.map((elem) => {
              const bbox = normalizeBoundingBox(elem, docWidth, docHeight);
              if (!bbox) return null;

              const colorStyle = CATEGORY_COLORS[elem.category] || 'border-cyan-400 bg-cyan-500/20 text-cyan-200';
              const isSelected = selectedElement && selectedElement.id === elem.id;

              return (
                <div
                  key={elem.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(elem);
                  }}
                  style={{
                    left: `${bbox.leftPct}%`,
                    top: `${bbox.topPct}%`,
                    width: `${bbox.widthPct}%`,
                    height: `${bbox.heightPct}%`
                  }}
                  className={`absolute border-2 rounded cursor-pointer pointer-events-auto transition-all ${colorStyle} ${
                    isSelected
                      ? 'ring-4 ring-cyan-400 scale-[1.01] z-30 shadow-2xl bg-cyan-500/30'
                      : 'opacity-85 hover:opacity-100 hover:scale-[1.005] z-10'
                  }`}
                  title={`${elem.category} (${(elem.confidence * 100).toFixed(0)}%)`}
                >
                  <div className="absolute -top-4 left-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-900 text-white border border-slate-700 shadow flex items-center gap-1 z-20 pointer-events-none">
                    <span>{elem.category}</span>
                    <span className="text-cyan-400">{(elem.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {/* Debug Info Overlay inside Box */}
                  {debugMode && (
                    <div className="p-1 bg-slate-950/90 text-[8px] font-mono text-amber-300 leading-none overflow-hidden h-full border border-amber-800">
                      <div>{elem.category}</div>
                      <div>x: {bbox.origX}</div>
                      <div>y: {bbox.origY}</div>
                      <div>w: {bbox.origW}</div>
                      <div>h: {bbox.origH}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
