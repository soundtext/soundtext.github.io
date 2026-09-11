import { useEffect } from 'react';

export const SITE_URL = 'https://soundtext.github.io';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function Seo({ title, description, path, type = 'website', jsonLd }: SeoProps) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertLink('canonical', url);

    const scriptId = 'route-json-ld';
    document.getElementById(scriptId)?.remove();
    if (jsonLdString) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      script.text = jsonLdString;
      document.head.appendChild(script);
    }
  }, [title, description, path, type, jsonLdString]);

  return null;
}
