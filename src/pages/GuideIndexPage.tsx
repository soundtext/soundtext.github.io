import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import { Seo } from '../components/Seo';
import { GUIDES } from '../data/guides';

const GUIDES_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Text-to-Speech Guides',
  url: 'https://soundtext.github.io/guides',
  hasPart: GUIDES.map((guide) => ({
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `https://soundtext.github.io/guides/${guide.slug}`,
  })),
};

export default function GuideIndexPage() {
  return (
    <>
      <Seo
        title="Guides | Sound of Text"
        description="Step-by-step text-to-speech guides: create character voices, name-announcement clips, and custom WhatsApp ringtones."
        path="/guides"
        jsonLd={GUIDES_JSON_LD}
      />

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-neutral-600" />
            <span>{GUIDES.length} guides</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            Text-to-Speech Guides
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Practical walkthroughs for turning text into audio: character impressions, AI voice
            effects, and custom WhatsApp notification sounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="group bg-white rounded-xs border border-neutral-200 p-5 sm:p-6 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-xs text-2xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {guide.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-2xs text-neutral-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    {guide.updated}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 leading-snug tracking-tight group-hover:text-neutral-700 transition-colors">
                  {guide.title}
                </h2>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-3">
                  {guide.description}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <span>Read guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
