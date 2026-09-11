import { useState } from 'react';
import { TTSReader } from '../components/TTSReader';
import { KnowledgeBase } from '../components/KnowledgeBase';
import { Seo } from '../components/Seo';
import { useTts } from '../context/TtsContext';
import { CheckCircle2, Sparkles, ShieldCheck, Zap, Gift, Smartphone } from 'lucide-react';

const INITIAL_TEXT = `Welcome to Sound of Text.

You can type or paste any passage here, customize the reading rate and voice, and press Speak to hear clear, natural speech output directly in your browser.

Explore the Knowledge Base below for step-by-step guides on voice clips, character impressions, and custom WhatsApp ringtones.`;

const HOME_TITLE = 'Sound of Text — Free Text to Speech & Audio Merger';
const HOME_DESCRIPTION =
  'Convert text to natural speech online for free. No sign-up, no upload. Try it in your browser, or get 50+ languages, translation and audio merging in the Android app.';

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sound of Text',
    url: 'https://soundtext.github.io',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web, Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isBasedOn: 'https://soundtext.org',
    publisher: {
      '@type': 'Organization',
      name: 'Appz',
      email: 'dev@appz.se',
      url: 'https://help.appz.se',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Appz',
    email: 'dev@appz.se',
    url: 'https://help.appz.se',
  },
];

const TRUST_BADGES = [
  { icon: Gift, label: 'Free, no paywall' },
  { icon: ShieldCheck, label: 'No sign-up' },
  { icon: Zap, label: 'No upload' },
  { icon: Smartphone, label: 'Works on your phone' },
];

export default function HomePage() {
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    voices,
    isSupported,
    options,
    state,
    speak,
    pause,
    resume,
    stop,
    setVoiceURI,
    setRate,
    setPitch,
    setVolume,
  } = useTts();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const scrollToReader = () => {
    document.getElementById('tts-reader-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleListenArticle = (articleText: string) => {
    setText(articleText);
    speak(articleText);
    showToast('Speaking guide summary...');
    scrollToReader();
  };

  const handleLoadIntoEditor = (articleText: string) => {
    if (state.isPlaying) {
      stop();
    }
    setText(articleText);
    showToast('Loaded text into reader');
    scrollToReader();
  };

  return (
    <>
      <Seo
        title={HOME_TITLE}
        description={HOME_DESCRIPTION}
        path="/"
        jsonLd={HOME_JSON_LD}
      />

      {/* Intro Hero */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
          <span>Browser-first text to speech</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
          Turn text into speech — free, in your browser
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
          Type or paste your text, pick a voice, and hear it read aloud instantly. No sign-up,
          no upload, no recording gear. The Android app adds translation, bulk import, and audio
          merging.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-neutral-700 border border-neutral-200 shadow-2xs"
            >
              <Icon className="w-3.5 h-3.5 text-neutral-500" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* TTS Reader Component */}
      <TTSReader
        text={text}
        onChangeText={setText}
        voices={voices}
        isSupported={isSupported}
        options={options}
        state={state}
        onSpeak={speak}
        onPause={pause}
        onResume={resume}
        onStop={stop}
        onSetVoice={setVoiceURI}
        onSetRate={setRate}
        onSetPitch={setPitch}
        onSetVolume={setVolume}
      />

      {/* Section Divider */}
      <div className="my-12 border-t border-neutral-200/80" />

      {/* Knowledge Base Section */}
      <KnowledgeBase
        onListenArticle={handleListenArticle}
        onLoadIntoEditor={handleLoadIntoEditor}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-xs shadow-lg flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
