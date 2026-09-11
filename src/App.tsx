import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TtsProvider } from './context/TtsContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import GuideIndexPage from './pages/GuideIndexPage';
import GuidePage from './pages/GuidePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <TtsProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />
          <Route path="guides" element={<GuideIndexPage />} />
          <Route path="guides/:slug" element={<GuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </TtsProvider>
  );
}
