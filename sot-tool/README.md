# sot-tool — minimal Jekyll site hosting the Sound of Text Korean TTS widget

A stripped-down Jekyll project containing **only** the Korean text-to-speech widget
and its documentation. All header/footer navigation, menus, hero sections,
feature grids, ad banners, contact/about/privacy/terms pages, related-article
carousels, and tracking scripts from the parent `soundtext.github.io` site have
been intentionally removed.

## Pages

| URL | Source | Purpose |
| --- | --- | --- |
| `/` | `index.html` | The TTS widget itself |
| `/docs/` | `docs.md` | Full technical documentation (API, layout, config, deployment) |

## What's included

```
sot-tool/
├── _config.yml              # Minimal Jekyll config
├── Gemfile                  # github-pages gem
├── index.html               # Tool landing page (loads the widget)
├── docs.md                  # Documentation
├── README.md                # ← you are here
├── .gitignore
├── _layouts/
│   ├── default.html         # No header, no footer
│   └── page.html            # Same minimal shell, used by docs.md
├── _includes/
│   ├── head.html            # Meta + JSON-LD + CSS
│   └── tts.html             # The widget markup + script tag
├── main.scss                 # Root SCSS → compiled to /main.css (page chrome only)
└── assets/
    └── sot-simple/
        ├── main-v2.js       # Widget logic — API, polling, audio player, history
        └── style.css        # Widget styles
```

## What's NOT included (and why)

- ❌ Navigation header (`_includes/header.html` from parent) — removed
- ❌ Footer columns (`_includes/footer.html`) — removed
- ❌ Hero sections, feature grids, newsletter CTA — removed
- ❌ `_pages/` (contact, privacy, terms, disclaimer, author) — removed
- ❌ AdSense banners (`_includes/adbanner.html`) — removed
- ❌ iOS App Store lookup script (`_includes/appstoreimages.html`) — removed
- ❌ Post layout, archive layout, hero page layouts — removed
- ❌ `_sass/` files for the parent theme (`base.scss`, `layout.scss`, `social.scss`,
  `github-markdown.scss`) — removed; replaced with a minimal root `main.scss` that
  compiles to `/main.css`

## Running

```bash
cd sot-tool
bundle install
bundle exec jekyll serve
```

Open <http://localhost:4000>.

## License

MIT — same as the parent project. The widget code under `assets/sot-simple/`
is a verbatim copy of the original Sound of Text widget.