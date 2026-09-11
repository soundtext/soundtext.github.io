import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Volume2, Sparkles, BookOpen, Mic, Info } from 'lucide-react';
import { useTts } from '../context/TtsContext';

const linkBase = 'px-3 py-1.5 rounded-xs text-sm font-medium transition-colors flex items-center gap-1.5';

export function Header() {
  const { state } = useTts();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [activeSection, setActiveSection] = useState('tts-reader-section');

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      const kbEl = document.getElementById('knowledgebase-section');
      if (kbEl && kbEl.getBoundingClientRect().top <= 200) {
        setActiveSection('knowledgebase-section');
      } else {
        setActiveSection('tts-reader-section');
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const goToSection = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  return (
    <header
      id="site-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xs bg-neutral-900 text-white flex items-center justify-center shadow-sm shrink-0">
            <Volume2 className="w-5 h-5 text-neutral-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-neutral-900 truncate">
                Sound of Text
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                Web Audio
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block truncate">
              Free, private text-to-speech
            </p>
          </div>
        </Link>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-neutral-200 bg-neutral-50">
          <span
            className={`w-2 h-2 rounded-full ${
              state.isPlaying
                ? state.isPaused
                  ? 'bg-amber-500'
                  : 'bg-emerald-500 animate-pulse'
                : 'bg-neutral-400'
            }`}
          />
          <span className="font-medium text-neutral-700">
            {state.isPlaying
              ? state.isPaused
                ? 'Speech Paused'
                : 'Speaking Audio'
              : 'Synthesizer Ready'}
          </span>
          {state.currentWord && (
            <span className="ml-1 text-neutral-500 italic max-w-[120px] truncate">
              "{state.currentWord}"
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1.5" aria-label="Main Navigation">
          <button
            id="nav-btn-reader"
            type="button"
            onClick={() => goToSection('tts-reader-section')}
            className={`${linkBase} ${
              isHome && activeSection === 'tts-reader-section'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Reader</span>
          </button>

          <button
            id="nav-btn-knowledgebase"
            type="button"
            onClick={() => goToSection('knowledgebase-section')}
            className={`${linkBase} ${
              isHome && activeSection === 'knowledgebase-section'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden lg:inline">Knowledge Base</span>
          </button>

          <NavLink
            id="nav-btn-guides"
            to="/guides"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`
            }
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Guides</span>
          </NavLink>

          <NavLink
            id="nav-btn-about"
            to="/about"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`
            }
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
