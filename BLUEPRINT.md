# Topical Blueprint & SEO Architecture (`BLUEPRINT.md`)

**Target Domain**: `soundtext.github.io`  
**Core Strategy**: High-intent, non-cannibalizing topical silos built around the interactive Sound of Text engine.

---

## 1. Core Architecture Overview

Search Console data confirms that **`soundtext.github.io`** is recognized primarily as an online **Sound of Text / Text to Speech Generator**. 

The **Homepage (`/`)** serves as the **Master Brand Pillar** for all "Sound of Text" queries, eliminating the need for a redundant `/sound-of-text/` sub-page and preventing self-cannibalization.

The site consolidates search intent into **6 Core Tool & SEO Pages** supported by **5 Legal & Trust Pages** (11 pages total).

```
soundtext.github.io/
│
├── [CORE TOOL & SEO PILLARS]
│   ├── /                               (Homepage & Master Sound of Text Pillar)
│   ├── /sound-of-text-whatsapp/        (WhatsApp Voice Note Generator)
│   ├── /text-to-speech/                (Text to Speech Master Pillar)
│   ├── /text-to-sound/                 (Text to Sound Master Pillar)
│   ├── /female-voice/                  (Female Voice Synthesis Hub)
│   └── /male-voice/                    (Male Voice Synthesis Hub)
│
└── [LEGAL, TRUST & E-E-A-T UTILITIES]
    ├── /about/                         (About & Author Methodology)
    ├── /contact/                       (Contact Support)
    ├── /privacy-policy/                (Privacy & Data Security Policy)
    ├── /terms/                         (Terms of Service & Usage Rights)
    └── /disclaimer/                    (Service Availability Disclaimer)
```

---

## 2. Page Inventory & Intent Consolidation

### Core Tool & SEO Pages (6 Pages)

| Page Permalink | Page Role | Target Keyword Cluster (Unified Intent) |
|---|---|---|
| **`/`** | Homepage & Master Pillar | *sound of text, sound of text mp3, sound of text google, sound of text download free online* |
| **`/sound-of-text-whatsapp/`** | Silo 1 Child | Consolidates: *sound of text whatsapp, voice note generator for whatsapp, whatsapp text to speech* |
| **`/text-to-speech/`** | Silo 2 Pillar | Consolidates: *text to speech online free, text to speech mp3, text to speech no login, browser tts* |
| **`/text-to-sound/`** | Silo 3 Pillar | Consolidates: *text to sound generator, convert text to sound mp3, text into sound online* |
| **`/female-voice/`** | Silo 4 Pillar | Consolidates: *female voice text to speech, natural female voice generator, female voice mp3 download* |
| **`/male-voice/`** | Silo 4 Pillar | Consolidates: *male voice text to speech, natural male voice generator, male voice mp3 free* |

### Legal & E-E-A-T Trust Pages (5 Pages)

| Page Permalink | Source File | Purpose |
|---|---|---|
| **`/about/`** | `_pages/author.md` | Author credentials, tool creation story, and technical methodology. |
| **`/contact/`** | `_pages/contact.md` | Direct support contact form and user inquiries. |
| **`/privacy-policy/`** | `_pages/privacypolicy.md` | Data protection, zero audio storage guarantees, and cookie policies. |
| **`/terms/`** | `_pages/terms.md` | Audio generation licensing and terms of service. |
| **`/disclaimer/`** | `_pages/disclaimer.md` | API usage disclosures and service availability notices. |

---

## 3. Internal Linking Architecture

```
Homepage (/) [Master Brand Pillar: "Sound of Text"]
   ├── /sound-of-text-whatsapp/  ──► (Backlinks to /)
   ├── /text-to-speech/          ──► (Links to / and siblings)
   ├── /text-to-sound/           ──► (Links to / and siblings)
   ├── /female-voice/            ──► (Links to / and siblings)
   └── /male-voice/              ──► (Links to / and siblings)
```

* **`/sound-of-text-whatsapp/`**: Links directly back to Homepage (`/`) as its parent pillar.
* **Topic Pillars (`/text-to-speech/`, `/text-to-sound/`, `/female-voice/`, `/male-voice/`)**: Link to Homepage (`/`) and cross-link between key sibling pillars.
* **Footer**: Houses links to all 5 Legal & Trust pages.

---

## 4. Technical SEO Requirements

1. **Structured Data**: Include `WebApplication` and `SoftwareApplication` JSON-LD schema on pages containing the TTS generator.
2. **Canonical URLs**: Strictly set canonical tags pointing to `https://soundtext.github.io<permalink>`.
3. **OpenGraph & Twitter Cards**: Add customized social sharing metadata for every page.
