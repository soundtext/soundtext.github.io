/* ==========================================================================
   Sound of Text — Web Speech Studio Engine
   Exact Implementation from sot-tool/text-to-speech.html (Bug-Free Edition)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById("mobileToggle");
  const drawerClose = document.getElementById("drawerClose");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  if (mobileToggle) mobileToggle.addEventListener("click", () => mobileDrawer && mobileDrawer.classList.add("open"));
  if (drawerClose) drawerClose.addEventListener("click", () => mobileDrawer && mobileDrawer.classList.remove("open"));
  if (drawerLinks) {
    drawerLinks.forEach(link => link.addEventListener("click", () => mobileDrawer && mobileDrawer.classList.remove("open")));
  }

  // 3. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (questionBtn) {
      questionBtn.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        faqItems.forEach(f => f.classList.remove("active"));
        if (!isActive) item.classList.add("active");
      });
    }
  });

  /* ==========================================================================
     Text-to-Speech Engine (sot-tool/text-to-speech.html)
     ========================================================================== */
  const textInput = document.getElementById('textInput');
  const textDisplay = document.getElementById('textDisplay');
  const textWell = document.getElementById('textWell');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const voiceSelect = document.getElementById('voiceSelect');
  const rate = document.getElementById('rate');
  const pitch = document.getElementById('pitch');
  const volume = document.getElementById('volume');
  const rateVal = document.getElementById('rateVal');
  const pitchVal = document.getElementById('pitchVal');
  const volumeVal = document.getElementById('volumeVal');
  const vu = document.getElementById('vu');

  const synth = window.speechSynthesis;
  let voices = [];
  let wordSpans = [];
  let isPaused = false;
  window._activeUtterance = null; // Prevent Chrome garbage collection bug

  function loadVoices() {
    if (!synth || !voiceSelect) return;
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.value = 0;
      opt.textContent = 'Default Browser Voice';
      voiceSelect.appendChild(opt);
      return;
    }

    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });

    // Auto-select Indonesian or English or default
    for (let i = 0; i < voices.length; i++) {
      if (voices[i].lang === 'id-ID' || voices[i].lang.startsWith('id') || voices[i].lang === 'en-US' || voices[i].default) {
        voiceSelect.selectedIndex = i;
        break;
      }
    }
  }

  loadVoices();
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }

  if (rate && rateVal) {
    rate.addEventListener('input', () => rateVal.textContent = parseFloat(rate.value).toFixed(1) + 'x');
  }
  if (pitch && pitchVal) {
    pitch.addEventListener('input', () => pitchVal.textContent = parseFloat(pitch.value).toFixed(1));
  }
  if (volume && volumeVal) {
    volume.addEventListener('input', () => volumeVal.textContent = Math.round(volume.value * 100) + '%');
  }

  function buildDisplay(text) {
    if (!textDisplay) return;
    textDisplay.innerHTML = '';
    wordSpans = [];
    const tokens = text.split(/(\s+)/);
    let cursor = 0;
    tokens.forEach(tok => {
      if (tok.length === 0) return;
      if (/\s+/.test(tok)) {
        textDisplay.appendChild(document.createTextNode(tok));
      } else {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = tok;
        textDisplay.appendChild(span);
        wordSpans.push({ start: cursor, end: cursor + tok.length, el: span });
      }
      cursor += tok.length;
    });
  }

  function highlightAt(charIndex) {
    wordSpans.forEach(w => w.el.classList.remove('active'));
    const match = wordSpans.find(w => charIndex >= w.start && charIndex < w.end);
    if (match) {
      match.el.classList.add('active');
      match.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function setSpeakingUI(speaking) {
    if (playBtn) {
      playBtn.classList.toggle('live', speaking && !isPaused);
      playBtn.textContent = speaking && !isPaused ? 'On Air' : 'Play';
    }
    if (vu) {
      vu.classList.toggle('on', speaking && !isPaused);
    }
    if (pauseBtn) pauseBtn.disabled = !speaking;
    if (stopBtn) stopBtn.disabled = !speaking;
    if (textWell) textWell.classList.toggle('speaking', speaking);
    if (textDisplay) textDisplay.classList.toggle('showing', speaking);
  }

  function speak() {
    if (!synth) {
      alert("Browser does not support Web Speech API.");
      return;
    }
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
      alert("Please enter text to speak.");
      return;
    }

    if (voices.length === 0) {
      voices = synth.getVoices();
      loadVoices();
    }

    synth.cancel();
    synth.resume();
    buildDisplay(text);

    const utter = new SpeechSynthesisUtterance(text);
    
    // Assign voice
    if (voices.length > 0 && voiceSelect) {
      const idx = parseInt(voiceSelect.value, 10);
      if (!isNaN(idx) && voices[idx]) {
        utter.voice = voices[idx];
      } else if (voices[0]) {
        utter.voice = voices[0];
      }
    }

    if (rate) utter.rate = parseFloat(rate.value) || 1.0;
    if (pitch) utter.pitch = parseFloat(pitch.value) || 1.0;
    if (volume) utter.volume = parseFloat(volume.value) || 1.0;

    utter.onboundary = (e) => {
      if (e.name === 'word' || e.charLength !== undefined) {
        highlightAt(e.charIndex);
      }
    };

    utter.onstart = () => {
      isPaused = false;
      setSpeakingUI(true);
    };

    utter.onend = () => {
      setSpeakingUI(false);
      wordSpans.forEach(w => w.el.classList.remove('active'));
    };

    utter.onerror = (e) => {
      // Ignore normal cancel/interrupted events when stopping
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
        setSpeakingUI(false);
      }
    };

    window._activeUtterance = utter; // Retain reference to prevent garbage collection

    // Delay slightly to let synth.cancel() settle in Chromium
    setTimeout(() => {
      synth.speak(utter);
    }, 20);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (synth && synth.speaking && isPaused) {
        synth.resume();
        isPaused = false;
        setSpeakingUI(true);
      } else {
        speak();
      }
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (synth && synth.speaking && !isPaused) {
        synth.pause();
        isPaused = true;
        setSpeakingUI(true);
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (synth) synth.cancel();
      isPaused = false;
      setSpeakingUI(false);
      wordSpans.forEach(w => w.el.classList.remove('active'));
    });
  }
});
