import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceItem, TTSOptions, TTSState } from '../types';

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [options, setOptions] = useState<TTSOptions>({
    voiceURI: '',
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentWord: '',
    charIndex: -1,
    wordIndex: -1,
  });

  const [activeText, setActiveText] = useState<string>('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const systemVoices = window.speechSynthesis.getVoices();
      if (systemVoices.length > 0) {
        const mapped: VoiceItem[] = systemVoices.map((v) => ({
          voiceURI: v.voiceURI,
          name: v.name,
          lang: v.lang,
          isDefault: v.default,
          localService: v.localService,
        }));
        setVoices(mapped);

        // Set default voice if none selected or not found
        setOptions((prev) => {
          if (prev.voiceURI && mapped.some((v) => v.voiceURI === prev.voiceURI)) {
            return prev;
          }
          const defaultVoice =
            mapped.find((v) => v.isDefault) ||
            mapped.find((v) => v.lang.startsWith('en')) ||
            mapped[0];
          return {
            ...prev,
            voiceURI: defaultVoice ? defaultVoice.voiceURI : '',
          };
        });
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Safety polling for browsers that don't trigger onvoiceschanged immediately
    const timer = setTimeout(loadVoices, 300);

    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (resumeTimerRef.current) {
        window.clearInterval(resumeTimerRef.current);
      }
    };
  }, []);

  // Workaround for Chrome ~15s pause bug during speech
  useEffect(() => {
    if (state.isPlaying && !state.isPaused) {
      resumeTimerRef.current = window.setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    } else {
      if (resumeTimerRef.current) {
        window.clearInterval(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    }
    return () => {
      if (resumeTimerRef.current) {
        window.clearInterval(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
  }, [state.isPlaying, state.isPaused]);

  const speak = useCallback(
    (textToSpeak: string) => {
      if (!isSupported || !window.speechSynthesis) return;

      const trimmed = textToSpeak.trim();
      if (!trimmed) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utteranceRef.current = utterance;
      setActiveText(trimmed);

      // Apply voice
      const systemVoices = window.speechSynthesis.getVoices();
      const selected = systemVoices.find((v) => v.voiceURI === options.voiceURI);
      if (selected) {
        utterance.voice = selected;
      }

      utterance.rate = Math.min(2, Math.max(0.5, options.rate));
      utterance.pitch = Math.min(2, Math.max(0.5, options.pitch));
      utterance.volume = Math.min(1, Math.max(0, options.volume));

      utterance.onstart = () => {
        setState({
          isPlaying: true,
          isPaused: false,
          currentWord: '',
          charIndex: 0,
          wordIndex: 0,
        });
      };

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const remaining = trimmed.slice(charIndex);
          const match = remaining.match(/^(\S+)/);
          const currentWord = match ? match[1].replace(/[.,!?;:()[\]{}'"]/g, '') : '';
          
          setState((prev) => ({
            ...prev,
            charIndex,
            currentWord,
          }));
        }
      };

      utterance.onend = () => {
        setState({
          isPlaying: false,
          isPaused: false,
          currentWord: '',
          charIndex: -1,
          wordIndex: -1,
        });
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        // Interrupted is normal when user clicks stop or starts new audio
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', event.error);
        }
        setState({
          isPlaying: false,
          isPaused: false,
          currentWord: '',
          charIndex: -1,
          wordIndex: -1,
        });
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, options]
  );

  const pause = useCallback(() => {
    if (!isSupported || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setState({
      isPlaying: false,
      isPaused: false,
      currentWord: '',
      charIndex: -1,
      wordIndex: -1,
    });
    utteranceRef.current = null;
  }, [isSupported]);

  const setVoiceURI = useCallback((voiceURI: string) => {
    setOptions((prev) => ({ ...prev, voiceURI }));
  }, []);

  const setRate = useCallback((rate: number) => {
    setOptions((prev) => ({ ...prev, rate }));
  }, []);

  const setPitch = useCallback((pitch: number) => {
    setOptions((prev) => ({ ...prev, pitch }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setOptions((prev) => ({ ...prev, volume }));
  }, []);

  return {
    voices,
    isSupported,
    options,
    state,
    activeText,
    speak,
    pause,
    resume,
    stop,
    setVoiceURI,
    setRate,
    setPitch,
    setVolume,
  };
}
