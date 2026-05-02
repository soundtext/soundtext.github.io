---
layout: page
title: About the Author
permalink: /author/
---

<div class="author-profile">
    <div class="author-image">
        <img src="{{ site.app_icon | relative_url }}" alt="Sound of Text Team" style="width: 120px; border-radius: 50%; margin-bottom: 24px;">
    </div>
    <div class="author-info">
        <h1>Sound of Text Editorial Team</h1>
        <p class="lead">The Sound of Text editorial team consists of audio technology enthusiasts and language specialists dedicated to making voice synthesis accessible.</p>
        
        <p>Our contributors bring years of experience in digital accessibility, education technology, and creative content production. We rigorously test and review TTS tools to provide our readers with accurate, helpful, and up-to-date guides for creating audio content.</p>
        
        <div class="author-stats" style="margin-top: 40px;">
            <h3>Our Expertise</h3>
            <p>From troubleshooting regional accents to optimizing MP3 quality for various platforms, our team provides practical insights derived from first-hand usage of text-to-speech engines.</p>
        </div>
    </div>
</div>

<div class="author-posts" style="margin-top: 60px;">
    <h2>Articles by Sound of Text Team</h2>
    <div class="related-content-grid">
        {% for post in site.posts %}
        <div class="postlist-card">
            <a href="{{ post.url | relative_url }}" class="postlist-card-image">
                <img src="{{ post.image | relative_url }}" alt="{{ post.title }}">
            </a>
            <div class="postlist-card-body">
                <span class="postlist-category-label">{{ post.category | upcase }}</span>
                <h3 class="postlist-card-title"><a href="{{ post.url | relative_url }}" style="color: inherit; text-decoration: none;">{{ post.title }}</a></h3>
                <p class="postlist-card-excerpt">{{ post.excerpt | strip_html | truncate: 120 }}</p>
            </div>
        </div>
        {% endfor %}
    </div>
</div>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Sound of Text Editorial Team",
  "url": "{{ site.url }}/author/",
  "image": "{{ site.app_icon | absolute_url }}",
  "description": "Expert team specializing in text-to-speech technology, digital accessibility, and audio content creation.",
  "sameAs": [
    "https://github.com/{{ site.github_username }}",
    "{{ site.github_repo }}"
  ],
  "jobTitle": "Editorial Team",
  "worksFor": {
    "@id": "{{ site.url }}/#organization"
  }
}
</script>
