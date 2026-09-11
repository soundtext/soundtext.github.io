export interface VoiceItem {
  voiceURI: string;
  name: string;
  lang: string;
  isDefault: boolean;
  localService: boolean;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWord: string;
  charIndex: number;
  wordIndex: number;
}

export interface TTSOptions {
  voiceURI: string;
  rate: number;
  pitch: number;
  volume: number;
}

export type GuideCategory =
  | 'WhatsApp Ringtones'
  | 'Character Voices'
  | 'Voice Generators';

export interface GuideMeta {
  slug: string;
  title: string;
  category: GuideCategory;
  description: string;
  listenText: string;
  published: string;
  updated: string;
  author: string;
  tags: string[];
}
