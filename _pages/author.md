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
        <h1>Sound of Text Team</h1>
        <p class="lead">The dedicated team behind Sound of Text is committed to making high-quality text-to-speech technology accessible to everyone, everywhere.</p>
        
        <p>Our goal is to provide a simple, reliable, and free platform for users to convert text into natural-sounding speech for education, accessibility, social media, and more. We believe in the power of voice to bring digital content to life.</p>
        
        <div class="author-stats" style="margin-top: 40px;">
            <h3>Our Mission</h3>
            <p>To deliver natural-sounding voices and easy-to-use audio tools for creators, learners, and businesses worldwide.</p>
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
