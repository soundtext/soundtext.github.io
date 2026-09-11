import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Volume2,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { GUIDES, GUIDE_CATEGORIES } from '../data/guides';

interface KnowledgeBaseProps {
  onListenArticle: (text: string) => void;
  onLoadIntoEditor: (text: string) => void;
}

export function KnowledgeBase({ onListenArticle, onLoadIntoEditor }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredGuides = useMemo(() => {
    return GUIDES.filter((guide) => {
      const matchesCat = selectedCategory === 'All' || guide.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCat;

      const matchesSearch =
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query) ||
        guide.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="knowledgebase-section" className="w-full pt-10 pb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-neutral-600" />
            <span>Guides & Tutorials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Knowledge Base
          </h2>
          <p className="mt-1.5 text-sm text-neutral-600 max-w-2xl leading-relaxed">
            Step-by-step guides for creating voice clips, character impressions, and custom WhatsApp ringtones with text-to-speech.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="kb-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides or topics..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-800 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 p-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {GUIDE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            id={`kb-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xs text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xs border border-neutral-200">
          <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-800">No matching guides found</p>
          <p className="text-xs text-neutral-500 mt-1">Try another search keyword or reset category filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-3 py-1.5 rounded-xs text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuides.map((guide) => (
            <article
              key={guide.slug}
              id={`kb-card-${guide.slug}`}
              className="bg-white rounded-xs border border-neutral-200 p-5 sm:p-6 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-2xs group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-xs text-2xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {guide.category}
                  </span>
                  <span className="text-2xs text-neutral-400 font-medium">
                    {guide.updated}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 leading-snug tracking-tight group-hover:text-neutral-700 transition-colors">
                  {guide.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3">
                  {guide.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-5 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  id={`kb-listen-${guide.slug}`}
                  onClick={() => onListenArticle(guide.listenText)}
                  className="px-2.5 py-1.5 rounded-xs text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                  title="Listen to this guide summary"
                >
                  <Volume2 className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Listen</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id={`kb-load-${guide.slug}`}
                    onClick={() => onLoadIntoEditor(guide.listenText)}
                    className="px-2.5 py-1.5 rounded-xs text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    title="Load text into TTS reader"
                  >
                    Load in TTS
                  </button>

                  <Link
                    id={`kb-read-${guide.slug}`}
                    to={`/guides/${guide.slug}`}
                    className="px-3 py-1.5 rounded-xs text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Quick Tips Footer Banner */}
      <div className="mt-8 p-5 rounded-xs bg-neutral-100/70 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xs bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-neutral-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Pro Tip for Natural Speech</h3>
            <p className="text-xs text-neutral-600">
              Insert commas before transitional phrases or lists to give browser synthesizers realistic breath pauses.
            </p>
          </div>
        </div>

        <Link
          to="/guides/best-sound-of-text-voices-for-whatsapp-ringtones"
          className="px-3.5 py-1.5 rounded-xs text-xs font-medium bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 transition-colors shrink-0 shadow-2xs"
        >
          Browse Voice Styles
        </Link>
      </div>
    </section>
  );
}
