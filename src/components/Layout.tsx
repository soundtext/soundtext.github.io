import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { SiteFooter } from './SiteFooter';
import { AdBanner } from './AdBanner';
import { useTts } from '../context/TtsContext';

export function Layout() {
  const { voices } = useTts();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16">
        <AdBanner />
        <Outlet />
      </main>
      <SiteFooter voiceCount={voices.length} />
    </div>
  );
}
