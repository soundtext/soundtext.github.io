import { Link } from 'react-router-dom';
import { Volume2 } from 'lucide-react';

interface SiteFooterProps {
  voiceCount: number;
}

export function SiteFooter({ voiceCount }: SiteFooterProps) {
  return (
    <footer className="bg-white border-t border-neutral-200 py-10 text-xs text-neutral-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-neutral-700" />
            <span className="font-semibold text-neutral-800">Sound of Text</span>
            <span>•</span>
            <span>Free text to speech, on-device in your browser.</span>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-neutral-600" aria-label="Footer">
            <Link to="/about" className="hover:text-neutral-900 transition-colors">About</Link>
            <Link to="/guides" className="hover:text-neutral-900 transition-colors">Guides</Link>
            <Link to="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
            <Link to="/disclaimer" className="hover:text-neutral-900 transition-colors">Disclaimer</Link>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <p className="text-neutral-500">
            Powered by the Web Speech API · {voiceCount} system voices detected · No sign-up, no upload.
          </p>
          <p className="text-neutral-400">
            Maintained by Appz · inspired by the open-source Soundtext.org project (credited).
          </p>
        </div>
      </div>
    </footer>
  );
}
