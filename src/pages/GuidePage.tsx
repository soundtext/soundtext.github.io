import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, User, Info } from 'lucide-react';
import { Seo } from '../components/Seo';
import { AdBanner } from '../components/AdBanner';
import { getGuideBySlug, getGuideContent } from '../data/guides';

export default function GuidePage() {
  const { slug = '' } = useParams();
  const guide = getGuideBySlug(slug);
  const content = guide ? getGuideContent(slug) : '';

  if (!guide) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-neutral-900">Guide not found</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The guide you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xs text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all guides
        </Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    author: { '@type': 'Organization', name: guide.author, url: 'https://help.appz.se' },
    publisher: { '@type': 'Organization', name: 'Appz', url: 'https://help.appz.se' },
    mainEntityOfPage: `https://soundtext.github.io/guides/${guide.slug}`,
  };

  return (
    <>
      <Seo
        title={`${guide.title} — Sound of Text`}
        description={guide.description}
        path={`/guides/${guide.slug}`}
        type="article"
        jsonLd={jsonLd}
      />

      <article className="max-w-3xl mx-auto">
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All guides
        </Link>

        <div className="mt-5">
          <span className="px-2.5 py-0.5 rounded-xs text-2xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
            {guide.category}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            {guide.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
            {guide.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-500 border-y border-neutral-200 py-3">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Maintained by {guide.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Last updated {guide.updated}
            </span>
          </div>
        </div>

        {/* Ad slot below the guide header */}
        <AdBanner />

        <div className="mt-8 prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-neutral-900 prose-a:font-medium prose-img:rounded-xs prose-img:border prose-img:border-neutral-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        <div className="mt-10 p-4 rounded-xs bg-neutral-100/70 border border-neutral-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-600 leading-relaxed">
            Third-party tool names, screenshots, and trademarks mentioned in this guide belong to
            their respective owners and are referenced for instructional purposes only. Sound of
            Text does not export MP3 files from the browser; save or share audio with the free
            Android app.
          </p>
        </div>
      </article>
    </>
  );
}
