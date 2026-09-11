import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

export default function DisclaimerPage() {
  return (
    <>
      <Seo
        title="Disclaimer — Sound of Text"
        description="Terms and limitations for using Sound of Text, including speech accuracy, third-party tools and trademarks, and our non-affiliation with the original Soundtext.org project."
        path="/disclaimer"
      />

      <article className="max-w-3xl mx-auto">
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Disclaimer
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            What this tool is, what it is not, and how to read our guides.
          </p>
          <p className="mt-4 text-xs text-neutral-500 border-y border-neutral-200 py-3">
            Maintained by <span className="font-semibold text-neutral-700">Appz</span> · Last
            updated <time dateTime="2026-09-11">September 11, 2026</time>
          </p>
        </header>

        <div className="mt-8 prose prose-neutral max-w-none">
          <h2>General information</h2>
          <p>
            Sound of Text is provided as a free utility and for general information. The browser
            studio turns text into speech on your device; the Android app adds translation, bulk
            import, and audio merging. We work to keep the tool accurate and available, but we do
            not guarantee that it will always be error-free or uninterrupted.
          </p>

          <h2>Speech output varies by device</h2>
          <p>
            Browser speech is produced by the voices installed on your operating system. That means
            pronunciation, accent, and quality can differ from one device or browser to another. A
            word may sound correct on one phone and different on another. This is a property of the
            platform voices available to your browser, not a fixed output we control. For file
            export and consistent results, use the Android app, which saves or shares your audio.
          </p>

          <h2>No affiliation with third-party tools or the original project</h2>
          <p>
            Sound of Text is an independent product line maintained by Appz. We are{' '}
            <span className="font-medium">not affiliated with, endorsed by, or sponsored by</span>{' '}
            Soundtext.org, the original open-source Sound of Text project, or its author NC Pierson.
            We are inspired by and credit that work, but we do not own it and do not represent it.
          </p>
          <p>
            Some guides mention third-party services such as FreeTTS, FakeYou, Myinstants, BlipCut,
            ElevenLabs, Murf AI, Play.ht, and Narakeet. Those names, tools, images, and trademarks
            belong to their respective owners. They are referenced for instructional purposes only,
            and a mention is not an endorsement — nor should it be read as a partnership. Always
            review a third-party tool's own terms and privacy policy before using it.
          </p>

          <h2>No MP3 export from the browser</h2>
          <p>
            The website does not export MP3 files. Its download button saves your text as a script
            file. If a guide refers to downloading an MP3 from another service, that step applies to
            that service, not to us. To save or share audio, use the free Android app.
          </p>

          <h2>Not professional advice</h2>
          <p>
            The guides and articles on this site are provided for educational purposes. They are not
            legal, medical, accessibility, or professional advice, and should not be relied on as
            such.
          </p>

          <h2>External links</h2>
          <p>
            We are not responsible for the content, accuracy, or practices of websites we link to.
            Following an external link is at your own discretion.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Appz is not liable for any loss or damage
            arising from the use of, or inability to use, this website or the guides it contains.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this disclaimer can be sent to{' '}
            <a href="mailto:dev@appz.se">dev@appz.se</a>. See also our{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </article>
    </>
  );
}
