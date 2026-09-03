import React, { useState } from 'react';
import { Volume2, Play, Pause, Download, Radio, ShieldCheck, FastForward } from 'lucide-react';
import axios from 'axios';

export default function AudioPlayer({ document }) {
  const [audioData, setAudioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  const fetchAudioSpeech = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/tts/speech/${document.id}`);
      setAudioData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            Accessible Audio Screen Reader
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Reads structural document elements (Headers $\rightarrow$ Paragraphs $\rightarrow$ Tables $\rightarrow$ Stamps) in natural order
          </p>
        </div>

        <button
          onClick={fetchAudioSpeech}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 border border-emerald-500 transition"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{loading ? 'Synthesizing Audio...' : 'Generate Audio Speech'}</span>
        </button>
      </div>

      {audioData ? (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          <audio
            controls
            src={audioData.audio_url}
            className="w-full h-10 rounded-lg accent-emerald-500"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span className="truncate max-w-md">Transcript preview: {audioData.transcript.substring(0, 80)}...</span>
            <a
              href={audioData.audio_url}
              download={`rakshadoc_audio_${document.id}.mp3`}
              className="text-emerald-400 hover:underline font-semibold shrink-0 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download MP3
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-xl p-6 text-center text-xs text-slate-400">
          Click <span className="text-emerald-400 font-semibold">"Generate Audio Speech"</span> to synthesize a natural multi-speaker screen-reader narration for visually impaired users.
        </div>
      )}
    </div>
  );
}
