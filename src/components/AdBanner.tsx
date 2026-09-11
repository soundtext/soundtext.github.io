import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdBanner() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not available (e.g. blocked); ignore.
    }
  }, []);

  return (
    <div id="ad-banner-slot" className="w-full mb-8">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9340211986472309"
        data-ad-slot="3377600041"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
