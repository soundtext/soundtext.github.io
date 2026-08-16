---
layout: page
title: Documentation
permalink: /docs/
description: Technical documentation for the Korean Text-to-Speech tool — API reference, file layout, configuration, and deployment.
---

# Korean Text-to-Speech Tool — Documentation

This site hosts a single, self-contained text-to-speech widget that converts Korean (Hangul) text into spoken MP3 audio using the [Sound of Text](https://soundoftext.org) TTS backend. There are no headers, footers, navigation menus, or static pages — only the tool and this documentation.

---

## 1. What the tool does

The widget accepts up to **5,000 characters** of Korean text, splits it into ~200-character chunks at sentence boundaries, and submits each chunk to the Sound of Text API (`engine: Google`, `voice: ko-KR`). When the server returns an MP3 URL, the chunk is added to an in-page history list with its own player, download button, and delete control.

All generated clips are stored in the browser via `localStorage` under the key `ttsData`, so a reload of the page restores the previous session.

---

## 2. File layout

```
sot-tool/
├── _config.yml              # Minimal Jekyll config (no features, no ads)
├── Gemfile                  # github-pages gem
├── index.html               # The tool — loads tts.html
├── docs.md                  # This file
├── README.md                # Project overview
├── .gitignore
│
├── _layouts/
│   ├── default.html         # Used by index.html — no header/footer
│   └── page.html            # Used by docs.md — same minimal shell
│
├── _includes/
│   ├── head.html            # <head>: meta tags, schema.org JSON-LD, CSS
│   └── tts.html             # The TTS widget markup (tool section + script tag)
│
├── main.scss                 # Root SCSS → compiled to /main.css (page chrome only)
│
└── assets/
    └── sot-simple/
        ├── main-v2.js       # Widget logic (API, polling, audio player, history)
        └── style.css        # Widget styling
```

Everything not listed above has been **removed** from the parent site: the navigation header, footer columns, hero sections, feature grids, newsletter CTAs, ad banners, related-article carousels, contact/about/privacy/terms pages, etc.

---

## 3. How the tool works

### 3.1 API endpoint

The widget calls:

```
POST https://api.soundoftext.com/sounds
Content-Type: application/json

{
  "engine": "Google",
  "data": { "text": "<chunk>", "voice": "ko-KR" }
}
```

The server returns `{ "success": true, "id": "<job-id>" }`. The client then polls `GET https://api.soundoftext.com/sounds/<job-id>` every 500 ms (max 20 attempts) until the response status becomes `"Done"` and contains a `location` URL pointing to the generated MP3.

### 3.2 Text splitting

`splitTextForTTS(text, maxLength = 200)`:

1. Trims and normalises newlines (collapses non-empty lines into a single string).
2. Splits on sentence boundaries using the regex  
   `/(?:\d+[.,]?\d*|\D)+?[.!?](?=\s|$)|(?:\d+[.,]?\d*|\D)+/g`.
3. Packs sentences into chunks no longer than `maxLength` characters.

### 3.3 Rendered history

Each successful chunk becomes a `.saved-item` card with:

| Element | Purpose |
| --- | --- |
| 🇰🇷 Korean Voice badge | Identifies the voice used |
| Audio #N | Track number |
| Source text | Echo of the synthesised text |
| Custom audio player | Play/pause, scrub, current time / duration |
| Download MP3 | Direct `<a download>` link to the API URL |
| Delete button | Removes that single entry |

Toolbar actions: **Play All** (sequential playback), **Stop**, **Clear** (removes all entries).

### 3.4 State machine

- `isPlayingAll` — set when the *Play All* button starts a sequence.
- `currentPlayIndex` — cursor into the saved items list.
- `isConverting` — locks the convert button while chunks are being generated.

---

## 4. Configuration knobs

All configurable values live at the top of `assets/sot-simple/main-v2.js`:

```js
var config_sound_of_text = {
  length: "5000",            // max textarea characters
  scrollbar: "false",        // "true" → scroll saved-data container during Play All
  group_audio_control: "true",
  item_audio_control: "false"
};

var API_BASE = "https://api.soundoftext.com";
var selectedLanguage = { code: "ko-KR", name: "Korean (한국어)" };
```

| Key | Default | Effect |
| --- | --- | --- |
| `length` | `5000` | Hard cap on textarea length |
| `scrollbar` | `false` | If `true`, the saved-data list scrolls to the active item; if `false`, the page scrolls instead |
| `group_audio_control` | `true` | Reserved flag for grouped playback |
| `item_audio_control` | `false` | Reserved flag for per-item playback |
| `API_BASE` | `https://api.soundoftext.com` | Override to point at a self-hosted TTS endpoint |
| `selectedLanguage.code` | `ko-KR` | Voice code sent to the API |
| `selectedLanguage.name` | `Korean (한국어)` | Display name in the locked language bar |

To support a different language, change both the locked `code`/`name` in `_includes/tts.html` *and* the corresponding `selectedLanguage` object in `main-v2.js`.

---

## 5. SEO & structured data

`head.html` emits the standard meta tags (title, description, Open Graph, Twitter Card, canonical) plus a `WebApplication` JSON-LD block on the index page only. There are no third-party analytics or ad scripts.

---

## 6. Running locally

```bash
cd sot-tool
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000> for the tool and <http://localhost:4000/docs/> for this page.

### Plain static hosting

Because the tool is fully client-side, you can also skip Jekyll entirely and serve the `_site/` output, or copy these files to any static host:

```
sot-tool/index.html
sot-tool/docs/index.html
sot-tool/assets/sot-simple/main-v2.js
sot-tool/assets/sot-simple/style.css
sot-tool/main.css
```

The only server requirement is that the API at `https://api.soundoftext.com` is reachable from the visitor's browser.

---

## 7. Browser support

The widget relies on:

- `fetch` + `Promise`
- ES6 `const` / arrow functions inside `main-v2.js`
- `localStorage`
- HTML5 `<audio>` with the `preload="metadata"` attribute

Any evergreen browser (Chrome, Edge, Firefox, Safari) released in the last ~5 years works.

---

## 8. Limitations

- Audio quality and voice naturalness depend entirely on Google's TTS engine for `ko-KR`.
- The public Sound of Text endpoint is rate-limited per IP; high-volume usage should move to a self-hosted instance.
- Chunks longer than ~200 characters are split at sentence boundaries; if a single sentence exceeds the limit it is sent as-is and may fail.
- `localStorage` is per-origin and per-browser — generated clips don't sync across devices.

---

## 9. License

The widget code is released under the same MIT license as the parent project. The `assets/sot-simple/` files are direct copies of the original Sound of Text widget.