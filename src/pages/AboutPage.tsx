import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Gift,
  Accessibility,
  BadgeCheck,
  Smartphone,
  MonitorPlay,
  Mail,
  LifeBuoy,
  Languages,
  Merge,
  History,
} from 'lucide-react';
import { Seo } from '../components/Seo';

const PRINCIPLES = [
  { icon: Gift, title: 'Free first', body: 'No paywall around basic conversion. Ever.' },
  { icon: ShieldCheck, title: 'Private by default', body: 'On-device speech; no account and no upload of your text.' },
  { icon: Zap, title: 'Instant', body: 'Speed is the feature — type, convert, done.' },
  { icon: Accessibility, title: 'Accessible', body: 'Plain language, mobile-first, works on low-end devices.' },
  { icon: BadgeCheck, title: 'Honest', body: 'We describe only what the tool actually does.' },
];

const BROWSER_FEATURES = [
  'Choose from the voices installed on your device',
  'Adjust rate, pitch, and volume',
  'Play, pause, resume, and stop',
  'Follow along with word-by-word highlighting',
  'Nothing you type is uploaded to a server',
];

const APP_FEATURES = [
  { icon: Languages, text: '50+ languages with 1-step auto-translation' },
  { icon: Merge, text: 'Merge several clips into one audio file' },
  { icon: History, text: 'Local history of your recent conversions' },
  { icon: Smartphone, text: 'Bulk text import and save-to-device export' },
];

const STATS = [
  { value: 'Free', label: 'No account, no paywall' },
  { value: '0', label: 'Text uploaded' },
  { value: 'On-device', label: 'Browser speech synthesis' },
  { value: 'Web + Android', label: 'One product line' },
];

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Sound of Text — Free, Private Text to Speech"
        description="Learn what Sound of Text is: a free, browser-first text-to-speech tool. On-device speech, no account, plus a free Android app for 50+ languages, bulk import and audio merging."
        path="/about"
      />

      <article className="max-w-3xl mx-auto">
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            About Sound of Text
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            Free, private text-to-speech — for phones and browsers.
          </p>
          <p className="mt-4 text-xs text-neutral-500 border-y border-neutral-200 py-3">
            Maintained by <span className="font-semibold text-neutral-700">Appz</span> · Last
            updated <time dateTime="2026-09-11">September 11, 2026</time>
          </p>
        </header>

        <section className="mt-8 prose prose-neutral max-w-none">
          <h2>What it is</h2>
          <p>
            Sound of Text is a free text-to-speech tool that turns written text into spoken audio
            directly in your browser. Type or paste a passage, choose a voice, adjust the speed and
            pitch, then press Speak. There is no account to create, no file to upload, and no
            character paywall. It is built for creators, language learners, students, and anyone
            who simply wants to hear text read out loud on a phone or a computer.
          </p>
        </section>

        <section className="mt-8 prose prose-neutral max-w-none">
          <h2>Our story</h2>
          <p>
            Sound of Text was inspired by the original open-source Sound of Text project and the
            community around <span className="font-medium">Soundtext.org</span>, created by NC
            Pierson. We credit that work openly — it is where the idea of a simple, free
            text-to-speech page began. We are not that project and we do not claim to own it.
          </p>
          <p>
            This website and the <span className="font-medium">Sound of Text Com</span> Android app
            are maintained independently by <span className="font-medium">Appz</span>. The two are
            one product line: the app extends what the website does. Where the original project was
            a single purpose-built page, we focus on keeping the browser tool fast and private
            while the Android app adds translation, bulk import, and audio merging for heavier
            work.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">What you can do here</h2>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xs border border-neutral-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <MonitorPlay className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900">Browser studio</h3>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600">
                {BROWSER_FEATURES.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xs border border-neutral-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900">Android app — Sound of Text Com</h3>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600">
                {APP_FEATURES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 prose prose-neutral max-w-none">
          <h2>How it works and what we collect</h2>
          <p>
            Speech in the browser is produced <span className="font-medium">on your device</span>{' '}
            through the Web Speech API. When you press Speak, your browser asks the operating system
            for an installed voice and synthesizes the audio locally. Your text is not sent to us
            and is not stored on a server. We do not require an account, an email address, or a
            login. The only data involved is what your browser and any third-party assets on the
            page technically process — this is explained in detail in our{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
          <p>
            Available voices depend on your operating system and browser, not on a fixed list. On a
            phone you may see a handful of voices; on a desktop you may see dozens.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Our principles</h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-xs border border-neutral-200 p-4 shadow-2xs">
                <Icon className="w-4 h-4 text-neutral-700 mb-2" />
                <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 prose prose-neutral max-w-none">
          <h2>Team and contact</h2>
          <p>
            Sound of Text is published and developed by{' '}
            <span className="font-medium">Appz</span>. If something is broken, unclear, or you have
            a suggestion, we would like to hear about it.
          </p>
        </section>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="mailto:dev@appz.se"
            className="flex items-center gap-3 bg-white rounded-xs border border-neutral-200 p-4 hover:border-neutral-300 transition-colors shadow-2xs"
          >
            <Mail className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-medium text-neutral-800">dev@appz.se</span>
          </a>
          <a
            href="https://help.appz.se"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-xs border border-neutral-200 p-4 hover:border-neutral-300 transition-colors shadow-2xs"
          >
            <LifeBuoy className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-medium text-neutral-800">help.appz.se</span>
          </a>
        </div>

        <p className="mt-6 text-sm text-neutral-600">
          Credited lineage: the original Sound of Text project by NC Pierson and the Soundtext.org
          community. We thank them for the foundation this work builds on.
        </p>

        <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-neutral-100/70 rounded-xs border border-neutral-200 p-4 text-center">
              <p className="text-lg font-extrabold text-neutral-900">{stat.value}</p>
              <p className="mt-1 text-xs text-neutral-600">{stat.label}</p>
            </div>
          ))}
        </section>
      </article>
    </>
  );
}
