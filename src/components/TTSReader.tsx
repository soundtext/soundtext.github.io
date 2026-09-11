import { useState, useMemo, ChangeEvent } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Copy,
  Check,
  ClipboardPaste,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Languages,
  Gauge,
  Eye,
  FileText
} from 'lucide-react';
import { VoiceItem, TTSOptions, TTSState } from '../types';
import { SAMPLE_TEXTS } from '../data/knowledgebase';
import { AudioVisualizer } from './AudioVisualizer';

interface TTSReaderProps {
  text: string;
  onChangeText: (text: string) => void;
  voices: VoiceItem[];
  isSupported: boolean;
  options: TTSOptions;
  state: TTSState;
  onSpeak: (text: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSetVoice: (voiceURI: string) => void;
  onSetRate: (rate: number) => void;
  onSetPitch: (pitch: number) => void;
  onSetVolume: (volume: number) => void;
}

export function TTSReader({
  text,
  onChangeText,
  voices,
  isSupported,
  options,
  state,
  onSpeak,
  onPause,
  onResume,
  onStop,
  onSetVoice,
  onSetRate,
  onSetPitch,
  onSetVolume,
}: TTSReaderProps) {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [followAlongMode, setFollowAlongMode] = useState(true);
  const [langFilter, setLangFilter] = useState('all');

  // Text statistics
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const chars = text.length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    // Average reading speed is ~140-160 WPM at 1.0x rate
    const estSeconds = words > 0 ? Math.ceil((words / (150 * options.rate)) * 60) : 0;
    return { chars, words, estSeconds };
  }, [text, options.rate]);

  // Filter voices
  const filteredVoices = useMemo(() => {
    if (langFilter === 'all') return voices;
    return voices.filter((v) => v.lang.toLowerCase().startsWith(langFilter.toLowerCase()));
  }, [voices, langFilter]);

  // Unique languages for filtering
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    voices.forEach((v) => {
      const prefix = v.lang.slice(0, 2).toLowerCase();
      langs.add(prefix);
    });
    return Array.from(langs);
  }, [voices]);

  const activeVoice = useMemo(() => {
    return voices.find((v) => v.voiceURI === options.voiceURI) || voices[0];
  }, [voices, options.voiceURI]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
      }
    } catch {
      // Permission denied or unsupported
    }
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'speech-script.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (state.isPlaying) onStop();
    onChangeText('');
  };

  const handleSampleSelect = (sampleText: string) => {
    if (state.isPlaying) onStop();
    onChangeText(sampleText);
  };

  const handleTogglePlay = () => {
    if (!text.trim()) return;
    if (state.isPlaying) {
      if (state.isPaused) {
        onResume();
      } else {
        onPause();
      }
    } else {
      onSpeak(text);
    }
  };

  // Render text with word highlighting when playing in follow-along mode
  const renderHighlightedText = () => {
    if (!state.isPlaying || state.charIndex < 0) return null;

    const before = text.slice(0, state.charIndex);
    const activeWord = state.currentWord || '';
    const after = text.slice(state.charIndex + activeWord.length);

    return (
      <div className="p-4 sm:p-5 text-neutral-800 text-base leading-relaxed bg-white rounded-xs border border-neutral-200 min-h-[180px] sm:min-h-[220px] whitespace-pre-wrap select-text">
        <span className="text-neutral-500">{before}</span>
        {activeWord && (
          <span className="bg-amber-100 text-amber-950 font-semibold px-1.5 py-0.5 rounded shadow-xs border border-amber-200 transition-all">
            {activeWord}
          </span>
        )}
        <span className="text-neutral-700">{after}</span>
      </div>
    );
  };

  return (
    <section id="tts-reader-section" className="w-full">
      {/* Browser compatibility banner */}
      {!isSupported && (
        <div
          id="unsupported-banner"
          className="mb-6 p-4 rounded-xs bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3"
        >
          <VolumeX className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-base text-amber-900">Speech Synthesis Unavailable</h2>
            <p className="mt-1 text-amber-800">
              Your current browser does not support the Web Speech API. Please open this app in modern Google Chrome, Microsoft Edge, Safari, or Firefox to experience speech audio synthesis.
            </p>
          </div>
        </div>
      )}

      {/* Main Studio Card */}
      <div className="bg-white rounded-xs border border-neutral-200 shadow-xs overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-neutral-100 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              Samples:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_TEXTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  id={`sample-btn-${i}`}
                  onClick={() => handleSampleSelect(sample.text)}
                  className="px-2.5 py-1 rounded-xs text-xs font-medium bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 transition-colors shadow-2xs"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              id="action-paste-btn"
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="p-1.5 rounded-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors text-xs flex items-center gap-1"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            <button
              id="action-copy-btn"
              type="button"
              onClick={handleCopy}
              disabled={!text}
              title="Copy text to clipboard"
              className="p-1.5 rounded-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors text-xs flex items-center gap-1 disabled:opacity-40"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              id="action-download-btn"
              type="button"
              onClick={handleDownload}
              disabled={!text}
              title="Download text script"
              className="p-1.5 rounded-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              id="action-clear-btn"
              type="button"
              onClick={handleClear}
              disabled={!text}
              title="Clear all text"
              className="p-1.5 rounded-xs text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Text Area / Word Tracking Area */}
        <div className="p-4 sm:p-6 relative">
          {state.isPlaying && followAlongMode ? (
            <div className="relative">
              {renderHighlightedText()}
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  id="toggle-edit-mode-btn"
                  type="button"
                  onClick={() => setFollowAlongMode(false)}
                  className="px-2.5 py-1 rounded-xs text-xs font-medium bg-neutral-900/80 text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 backdrop-blur shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Switch to Edit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <textarea
                id="tts-input-textarea"
                rows={7}
                value={text}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChangeText(e.target.value)}
                placeholder="Type or paste the text you want to convert into speech here..."
                className="w-full p-4 sm:p-5 text-neutral-800 text-base leading-relaxed bg-neutral-50/50 hover:bg-white focus:bg-white rounded-xs border border-neutral-200 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-200 focus:outline-none transition-all resize-y min-h-[180px] sm:min-h-[220px]"
              />

              {state.isPlaying && !followAlongMode && (
                <div className="absolute top-3 right-3">
                  <button
                    id="toggle-follow-mode-btn"
                    type="button"
                    onClick={() => setFollowAlongMode(true)}
                    className="px-2.5 py-1 rounded-xs text-xs font-medium bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Follow Along</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text stats pill row */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
            <div className="flex items-center gap-3">
              <span>{stats.words} words</span>
              <span>•</span>
              <span>{stats.chars} characters</span>
              <span>•</span>
              <span>Est. {stats.estSeconds}s listening time</span>
            </div>

            {state.isPlaying && (
              <div className="flex items-center gap-1.5 text-neutral-700 font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Reading live</span>
              </div>
            )}
          </div>
        </div>

        {/* Playback Control Deck */}
        <div className="px-4 sm:px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Main Play / Pause Button */}
            <button
              id="tts-play-btn"
              type="button"
              onClick={handleTogglePlay}
              disabled={!text.trim() || !isSupported}
              className={`h-11 px-5 rounded-xs font-semibold text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                state.isPlaying && !state.isPaused
                  ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white hover:shadow-md'
              }`}
            >
              {state.isPlaying ? (
                state.isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                )
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Speak Text</span>
                </>
              )}
            </button>

            {/* Stop Button */}
            {state.isPlaying && (
              <button
                id="tts-stop-btn"
                type="button"
                onClick={onStop}
                className="h-11 px-4 rounded-xs font-semibold text-sm bg-white border border-neutral-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-neutral-700 flex items-center gap-2 transition-colors shadow-2xs"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            )}

            {/* Visualizer */}
            <AudioVisualizer isPlaying={state.isPlaying} isPaused={state.isPaused} />
          </div>

          {/* Voice & Tuning Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="toggle-settings-btn"
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`h-10 px-3 rounded-xs text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showSettings
                  ? 'bg-white border-neutral-300 text-neutral-900 shadow-2xs'
                  : 'bg-transparent border-neutral-200 text-neutral-600 hover:bg-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Voice Controls</span>
              <span className="text-neutral-400 text-xs">({options.rate}x)</span>
            </button>
          </div>
        </div>

        {/* Voice and Audio Controls Panel */}
        {showSettings && (
          <div
            id="tts-controls-panel"
            className="p-4 sm:p-6 bg-white border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {/* 1. Voice Selector */}
            <div className="space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="voice-select"
                  className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
                >
                  <Languages className="w-3.5 h-3.5 text-neutral-500" />
                  Voice Selection ({filteredVoices.length})
                </label>
                {availableLanguages.length > 1 && (
                  <select
                    id="lang-filter-select"
                    value={langFilter}
                    onChange={(e) => setLangFilter(e.target.value)}
                    className="text-2xs bg-neutral-100 border border-neutral-200 text-neutral-700 rounded px-1.5 py-0.5"
                  >
                    <option value="all">All Languages</option>
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <select
                id="voice-select"
                value={options.voiceURI}
                onChange={(e) => onSetVoice(e.target.value)}
                className="w-full text-sm py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-xs text-neutral-800 focus:ring-2 focus:ring-neutral-200 focus:outline-none truncate"
              >
                {filteredVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {v.localService ? '• Offline' : ''}
                  </option>
                ))}
              </select>
              <p className="text-2xs text-neutral-500 truncate">
                Active: {activeVoice ? activeVoice.name : 'System Default'}
              </p>
            </div>

            {/* 2. Speed / Rate Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="speed-slider"
                  className="font-semibold text-neutral-700 flex items-center gap-1.5"
                >
                  <Gauge className="w-3.5 h-3.5 text-neutral-500" />
                  Speed (Rate)
                </label>
                <span className="font-mono font-medium text-neutral-900">{options.rate}x</span>
              </div>

              <input
                id="speed-slider"
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={options.rate}
                onChange={(e) => onSetRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-xs appearance-none cursor-pointer accent-neutral-900"
              />

              <div className="flex items-center justify-between gap-1 pt-0.5">
                {[0.75, 1.0, 1.25, 1.5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onSetRate(preset)}
                    className={`px-2 py-0.5 rounded text-2xs font-medium border transition-colors ${
                      options.rate === preset
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Pitch & Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="volume-slider"
                  className="font-semibold text-neutral-700 flex items-center gap-1.5"
                >
                  {options.volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  Volume
                </label>
                <span className="font-mono font-medium text-neutral-900">
                  {Math.round(options.volume * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="mute-toggle-btn"
                  onClick={() => onSetVolume(options.volume > 0 ? 0 : 1)}
                  className="p-1 rounded text-neutral-600 hover:bg-neutral-100 text-xs"
                  title={options.volume > 0 ? 'Mute' : 'Unmute'}
                >
                  {options.volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-600" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  id="volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={options.volume}
                  onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-xs appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Pitch */}
              <div className="pt-1 flex items-center justify-between text-2xs text-neutral-500">
                <span>Pitch: {options.pitch.toFixed(1)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSetPitch(0.8)}
                    className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    Deep
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetPitch(1.0)}
                    className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetPitch(1.3)}
                    className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  >
                    High
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
