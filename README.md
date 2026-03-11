# 🔊 Text to Speech MP3 — Google Translate TTS Downloader

> Turn any written text into natural-sounding speech instantly and download it as an MP3 file — powered by Google Translate's TTS engine.

---

## ✨ What It Does

Paste any text, pick a language, and get a high-quality audio file in seconds. No sign-up, no API key, no cost. Just instant voice synthesis you can download and use anywhere.

Popular use cases:
- 📱 **WhatsApp voice messages** — send custom voice notes without recording yourself
- 🎵 **TikTok audio** — generate viral voiceover clips in any language or accent
- 🏫 **Classroom learning** — help students hear correct pronunciation of words and sentences
- ♿ **Accessibility** — make written content listenable for users with reading difficulties
- 🌍 **Multilingual content** — produce audio in dozens of languages with a single tool

---

## 🚀 Features

- ⚡ **Instant synthesis** — convert text to speech in real time
- 🌐 **Dozens of languages & accents** — English, Spanish, French, German, Japanese, Arabic, and many more
- 💾 **MP3 download** — save the audio file directly to your device
- 🔑 **No API key required** — uses Google Translate's TTS endpoint
- 🆓 **Free to use** — no account or subscription needed
- 🧩 **Lightweight** — minimal dependencies, easy to run anywhere

---

## 📦 Installation

```bash
git clone https://github.com/your-username/tts-mp3-downloader.git
cd tts-mp3-downloader
pip install -r requirements.txt
```

**Requirements:** Python 3.7+

---

## 🛠️ Usage

### Command Line

```bash
python tts.py --text "Hello, world!" --lang en --output hello.mp3
```

### Arguments

| Argument | Short | Description | Default |
|----------|-------|-------------|---------|
| `--text` | `-t` | The text to convert to speech | *(required)* |
| `--lang` | `-l` | Language code (e.g. `en`, `es`, `fr`, `ja`) | `en` |
| `--output` | `-o` | Output filename | `output.mp3` |
| `--slow` | | Speak at a slower rate | `false` |

### Examples

```bash
# English
python tts.py -t "Good morning!" -l en -o morning.mp3

# Spanish
python tts.py -t "Buenos días, ¿cómo estás?" -l es -o buenos_dias.mp3

# Japanese
python tts.py -t "おはようございます" -l ja -o ohayo.mp3

# Slow speed (great for language learning)
python tts.py -t "How are you?" -l en --slow -o slow_greeting.mp3
```

---

## 🌍 Supported Languages (Sample)

| Code | Language   | Code | Language    |
|------|------------|------|-------------|
| `en` | English    | `zh` | Chinese     |
| `es` | Spanish    | `ja` | Japanese    |
| `fr` | French     | `ko` | Korean      |
| `de` | German     | `ar` | Arabic      |
| `it` | Italian    | `hi` | Hindi       |
| `pt` | Portuguese | `ru` | Russian     |

Full list of supported language codes: [Google Translate Languages](https://cloud.google.com/translate/docs/languages)

---

## ⚠️ Limitations

- Text length may be limited per request by the underlying TTS endpoint (typically ~200 characters). For longer text, the tool automatically splits and merges the audio.
- This project uses an unofficial/public endpoint. For production or high-volume usage, consider the [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech).
- Audio quality and naturalness may vary by language.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

Please open an issue first for major changes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- Powered by [Google Translate](https://translate.google.com/) TTS engine
- Trusted by millions of users worldwide for quick, reliable voice synthesis
