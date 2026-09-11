import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy | Sound of Text"
        description="How Sound of Text handles your data: on-device speech synthesis, no account, no upload of your text, and the third-party services the site relies on."
        path="/privacy"
      />

      <article className="max-w-3xl mx-auto">
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            On-device speech, no account, and no upload of your text.
          </p>
          <p className="mt-4 text-xs text-neutral-500 border-y border-neutral-200 py-3">
            Maintained by <span className="font-semibold text-neutral-700">Appz</span> · Last
            updated <time dateTime="2026-09-11">September 11, 2026</time>
          </p>
        </header>

        <div className="mt-8 prose prose-neutral max-w-none">
          <h2>Summary</h2>
          <p>
            Sound of Text is a browser-first text-to-speech tool. The conversion happens{' '}
            <span className="font-medium">on your device</span> through the Web Speech API. We do not
            ask you to create an account, and we do not upload or store the text you enter.
          </p>

          <h2>Information we do not collect</h2>
          <ul>
            <li>We do not require a name, email address, or login to use the tool.</li>
            <li>We do not upload, transmit, or store the text you type or paste into the reader.</li>
            <li>We do not record audio from your microphone. No microphone is used.</li>
          </ul>

          <h2>How speech is generated</h2>
          <p>
            When you press Speak, your browser queries your operating system for installed voices
            and synthesizes the audio locally. The resulting sound never leaves your device through
            us.
          </p>

          <h2>Third-party services</h2>
          <p>
            Like most websites, this site relies on external infrastructure and assets. These
            providers may receive standard technical data such as your IP address, browser type,
            and the pages you visit:
          </p>
          <ul>
            <li>
              <span className="font-medium">Hosting: GitHub Pages.</span> Serves the site's files
              and may keep server logs.
            </li>
            <li>
              <span className="font-medium">Google Fonts.</span> Delivers the typeface used on the
              site.
            </li>
            <li>
              <span className="font-medium">Google AdSense (publisher ca-pub-9340211986472309).</span>{' '}
              If ads are displayed, Google and its partners may use cookies or similar technologies
              to serve and measure ads. You can manage personalized advertising through{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>
              .
            </li>
          </ul>

          <h2>Cookies and advertising</h2>
          <p>
            Sound of Text itself does not set tracking cookies. Where advertising is enabled,
            third-party vendors including Google may place cookies to personalize or measure ads.
            You can block or delete cookies in your browser settings; the tool will continue to
            work.
          </p>

          <h2>Children's privacy</h2>
          <p>
            The tool is not directed at children under 13, and we do not knowingly collect personal
            information from them.
          </p>

          <h2>Your choices</h2>
          <p>
            Because we do not maintain accounts or store your text, there is no personal profile to
            delete. You can clear any locally stored browser data at any time through your browser
            settings.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy as the product changes. The "last updated" date at the top of
            this page will reflect the most recent revision.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy can be sent to{' '}
            <a href="mailto:dev@appz.se">dev@appz.se</a>. See also our{' '}
            <Link to="/disclaimer">Disclaimer</Link>.
          </p>

          <p className="text-sm text-neutral-500">
            This document explains our practices in plain language and is not legal advice.
          </p>
        </div>
      </article>
    </>
  );
}
