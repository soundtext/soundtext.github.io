document.addEventListener("DOMContentLoaded", function () {

  /* ── Config ───────────────────────────────────────── */
  var config_sound_of_text = {
    length: "5000",
    scrollbar: "true",
    group_audio_control: "true",
    item_audio_control: "false",
  };

  /* Sound of Text API endpoint */
  var API_BASE = "https://api.soundoftext.com";

  /* ── DOM refs ─────────────────────────────────────── */
  const textArea       = document.getElementById("text");
  const clearIcon      = document.getElementById("clear-icon");
  const charCounter    = document.getElementById("char-counter");
  const convertButton  = document.getElementById("convert-btn");
  const dataHistoryDiv = document.getElementById("data-history");
  const langSelectBtn  = document.getElementById("lang-select-btn");
  const langDropdown   = document.getElementById("lang-dropdown");
  const langList       = document.getElementById("lang-list");
  const langSearch     = document.getElementById("lang-search");
  const langDivs       = langList.querySelectorAll("[data-code]");

  const savedDataContainer = document.createElement("div");
  savedDataContainer.classList.add("saved-data");

  let selectedLanguage = null;
  let isPlaying  = false;
  let currentIndex = 0;
  let isConverting = false;

  /* ── History toolbar visibility ───────────────────── */
  const navEl = dataHistoryDiv.querySelector(".sot-history__toolbar");
  if (navEl) {
    navEl.style.display = config_sound_of_text.group_audio_control === "true" ? "flex" : "none";
  }

  /* ── Language selection ────────────────────────────── */
  function selectLang(el) {
    selectedLanguage = {
      code: el.getAttribute("data-code"),
      name: el.getAttribute("data-name"),
    };

    const codeSpan = langSelectBtn.querySelector(".code");
    codeSpan.setAttribute("data-code", selectedLanguage.code);
    codeSpan.setAttribute("data-name", selectedLanguage.name);
    codeSpan.textContent = selectedLanguage.name;

    // highlight selected in list
    langDivs.forEach(function (d) { d.classList.remove("selected"); });
    el.classList.add("selected");
  }

  langDivs.forEach(function (div) {
    div.addEventListener("click", function () {
      selectLang(this);
      closeLangDropdown();
    });
  });

  // Default language
  var defaultSpan = langSelectBtn.querySelector(".code");
  if (defaultSpan) selectLang(defaultSpan);

  /* ── Character counter ────────────────────────────── */
  function updateCharCount() {
    var len = textArea.value.length;
    charCounter.textContent = len.toLocaleString() + " / 5,000";
    clearIcon.style.opacity = len > 0 ? "1" : "0.2";
  }

  clearIcon.addEventListener("click", function () {
    textArea.value = "";
    updateCharCount();
    textArea.focus();
  });

  textArea.addEventListener("input", updateCharCount);
  updateCharCount();

  /* ── Language dropdown logic ──────────────────────── */
  function openLangDropdown() {
    langDropdown.classList.add("show");
    langSelectBtn.classList.add("open");
    langSearch.value = "";
    filterLangs("");
    setTimeout(function () { langSearch.focus(); }, 60);
  }

  function closeLangDropdown() {
    langDropdown.classList.remove("show");
    langSelectBtn.classList.remove("open");
  }

  langSelectBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (langDropdown.classList.contains("show")) {
      closeLangDropdown();
    } else {
      openLangDropdown();
    }
  });

  // Search filter
  function filterLangs(query) {
    var q = query.toLowerCase();
    langDivs.forEach(function (div) {
      var name = div.getAttribute("data-name").toLowerCase();
      div.style.display = name.indexOf(q) !== -1 ? "" : "none";
    });
  }

  langSearch.addEventListener("input", function () {
    filterLangs(this.value);
  });

  langSearch.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Close dropdown on outside click
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#lang-dropdown") && !e.target.closest("#lang-select-btn")) {
      closeLangDropdown();
    }
  });

  /* ── Text splitting for TTS ───────────────────────── */
  function splitTextForTTS(text, maxLength) {
    maxLength = maxLength || 200;
    text = text.trim();
    var lines = text.split("\n");
    var nonEmpty = [];
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t.length > 0) nonEmpty.push(t);
    }
    text = nonEmpty.join(" ");

    var sentences = text.match(/(?:\d+[.,]?\d*|\D)+?[.!?](?=\s|$)|(?:\d+[.,]?\d*|\D)+/g) || [];
    if (!sentences.length) return [];

    var chunks = [];
    var current = "";

    for (var s = 0; s < sentences.length; s++) {
      if ((current + sentences[s]).length <= maxLength) {
        current += sentences[s];
      } else {
        if (current.trim()) chunks.push(current.trim());
        current = sentences[s];
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  /* ── Sound of Text API ────────────────────────────── */

  /**
   * Request audio generation from the Sound of Text API.
   * 1. POST /sounds  → { success, id }
   * 2. GET  /sounds/:id  → { status, location }
   * Returns the final MP3 URL.
   */
  function requestAudio(text, voiceCode) {
    return fetch(API_BASE + "/sounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engine: "Google",
        data: { text: text, voice: voiceCode }
      })
    })
    .then(function (res) {
      if (!res.ok) throw new Error("API request failed: " + res.status);
      return res.json();
    })
    .then(function (json) {
      if (!json.success) throw new Error("API returned error");
      return pollForAudio(json.id);
    });
  }

  /**
   * Poll the API for audio status until it's "Done".
   */
  function pollForAudio(id, attempt) {
    attempt = attempt || 0;
    if (attempt > 20) return Promise.reject(new Error("Audio generation timed out"));

    return fetch(API_BASE + "/sounds/" + id)
      .then(function (res) {
        if (!res.ok) throw new Error("Poll failed: " + res.status);
        return res.json();
      })
      .then(function (json) {
        if (json.status === "Done" && json.location) {
          return json.location;
        }
        if (json.status === "Error") {
          throw new Error("Audio generation failed on server");
        }
        // Still pending — wait and retry
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(pollForAudio(id, attempt + 1));
          }, 500);
        });
      });
  }

  /* ── Button state helpers ─────────────────────────── */
  function setButtonLoading(loading) {
    isConverting = loading;
    convertButton.disabled = loading;
    if (loading) {
      convertButton.innerHTML =
        '<svg class="sot-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>' +
        ' Converting…';
    } else {
      convertButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
        '</svg> Convert to Speech';
    }
  }

  /* ── Render saved results ─────────────────────────── */
  function renderSavedData(data) {
    savedDataContainer.innerHTML = "";

    if (data.length > 0) {
      dataHistoryDiv.style.display = "block";
    } else {
      dataHistoryDiv.style.display = "none";
    }

    if (config_sound_of_text.scrollbar === "true") {
      savedDataContainer.classList.add("scroll");
    } else {
      savedDataContainer.classList.remove("scroll");
    }

    data.forEach(function (item, index) {
      var itemDiv = document.createElement("div");
      itemDiv.classList.add("saved-item");
      itemDiv.innerHTML =
        '<div>' +
        '  <p><strong>Text:</strong> ' + escapeHTML(item.text) + '</p>' +
        '  <p><strong>Language:</strong> ' + escapeHTML(item.language.name) + '</p>' +
        '  <div class="audio">' +
        '    <audio controls src="' + escapeAttr(item.audioUrl) + '" preload="auto"></audio>' +
        '    <a class="download-link" href="' + escapeAttr(item.audioUrl) + '" download="soundoftext-' + index + '.mp3" title="Download MP3" aria-label="Download MP3">' +
        '      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '        <path d="M12 7L12 14M12 14L15 11M12 14L9 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '        <path d="M16 17H12H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '        <path d="M2 12C2 7.286 2 4.929 3.464 3.464C4.929 2 7.286 2 12 2C16.714 2 19.071 2 20.536 3.464C22 4.929 22 7.286 22 12C22 16.714 22 19.071 20.536 20.536C19.071 22 16.714 22 12 22C7.286 22 4.929 22 3.464 20.536C2 19.071 2 16.714 2 12Z" stroke="currentColor" stroke-width="1.5"/>' +
        '      </svg>' +
        '    </a>' +
        '  </div>' +
        '</div>' +
        '<button type="button" class="delete-item" data-index="' + index + '" title="Remove" aria-label="Remove result">' +
        '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>' +
        '</button>';
      savedDataContainer.appendChild(itemDiv);
    });

    // Clear All
    var clearAllBtn = dataHistoryDiv.querySelector(".clear-all");
    if (clearAllBtn) {
      var newClearAll = clearAllBtn.cloneNode(true);
      clearAllBtn.parentNode.replaceChild(newClearAll, clearAllBtn);
      newClearAll.addEventListener("click", function () {
        localStorage.removeItem("ttsData");
        renderSavedData([]);
      });
    }

    // Play All
    var playAllBtn = dataHistoryDiv.querySelector(".play-all");
    if (playAllBtn) {
      var newPlayAll = playAllBtn.cloneNode(true);
      playAllBtn.parentNode.replaceChild(newPlayAll, playAllBtn);
      newPlayAll.addEventListener("click", playAllAudio);
    }

    // Pause
    var pauseBtn = document.getElementById("pause-tts");
    if (pauseBtn) {
      var newPause = pauseBtn.cloneNode(true);
      newPause.id = "pause-tts";
      pauseBtn.parentNode.replaceChild(newPause, pauseBtn);
      newPause.addEventListener("click", function () {
        var audios = document.querySelectorAll(".saved-item audio");
        if (audios[currentIndex]) {
          audios[currentIndex].pause();
          isPlaying = false;
        }
      });
    }

    // Stop
    var stopBtn = document.getElementById("stop-tts");
    if (stopBtn) {
      var newStop = stopBtn.cloneNode(true);
      newStop.id = "stop-tts";
      stopBtn.parentNode.replaceChild(newStop, stopBtn);
      newStop.addEventListener("click", function () {
        var audios = document.querySelectorAll(".saved-item audio");
        if (audios.length > 0 && audios[currentIndex]) {
          audios[currentIndex].pause();
          audios[currentIndex].currentTime = 0;
        }
        currentIndex = 0;
        isPlaying = false;
        document.querySelectorAll(".saved-item").forEach(function (el) {
          el.classList.remove("playing");
        });
      });
    }

    // Delete individual
    document.querySelectorAll(".delete-item").forEach(function (button) {
      button.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-index"), 10);
        var updated = data.filter(function (_, i) { return i !== idx; });
        localStorage.setItem("ttsData", JSON.stringify(updated));
        renderSavedData(updated);
      });
    });

    savedDataContainer.scrollTop = savedDataContainer.scrollHeight;
  }

  /* ── Save result with real audio URL ──────────────── */
  function saveItem(text, language, audioUrl, addOnTop) {
    var item = {
      text: text,
      language: language,
      audioUrl: audioUrl
    };
    var existing = JSON.parse(localStorage.getItem("ttsData")) || [];
    var newData = addOnTop ? [item].concat(existing) : existing.concat([item]);
    localStorage.setItem("ttsData", JSON.stringify(newData));
    renderSavedData(newData);
  }

  /* ── Play all audio sequentially ──────────────────── */
  function playAllAudio() {
    if (isPlaying) return;
    isPlaying = true;
    var audios = document.querySelectorAll(".saved-item audio");
    currentIndex = 0;

    function playNext() {
      if (currentIndex < audios.length && isPlaying) {
        var cur = audios[currentIndex];
        document.querySelectorAll(".saved-item").forEach(function (el) { el.classList.remove("playing"); });
        cur.closest(".saved-item").classList.add("playing");

        if (config_sound_of_text.scrollbar === "true") {
          savedDataContainer.scrollTop = cur.closest(".saved-item").offsetTop;
        } else {
          window.scrollTo({ top: cur.closest(".saved-item").offsetTop, behavior: "smooth" });
        }

        cur.play();
        cur.onended = function () {
          currentIndex++;
          playNext();
        };
      } else {
        isPlaying = false;
        document.querySelectorAll(".saved-item").forEach(function (el) { el.classList.remove("playing"); });
      }
    }
    playNext();
  }

  /* ── Convert button ───────────────────────────────── */
  convertButton.addEventListener("click", function () {
    var text = textArea.value.trim();
    if (!text || !selectedLanguage) {
      alert("Please enter text and select a language.");
      return;
    }
    if (text.length > 5000) {
      alert("Text must be 5,000 characters or fewer.");
      return;
    }
    if (isConverting) return;

    var chunks = splitTextForTTS(text);
    if (chunks.length === 0) return;

    setButtonLoading(true);
    textArea.value = "";
    updateCharCount();

    // Process all chunks sequentially through the API
    var processed = 0;
    var total = chunks.length;

    function processNext(idx) {
      if (idx >= total) {
        setButtonLoading(false);
        return;
      }

      convertButton.innerHTML =
        '<svg class="sot-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>' +
        ' Converting ' + (idx + 1) + ' of ' + total + '…';

      requestAudio(chunks[idx], selectedLanguage.code)
        .then(function (audioUrl) {
          saveItem(chunks[idx], selectedLanguage, audioUrl, false);
          processNext(idx + 1);
        })
        .catch(function (err) {
          console.error("Failed to convert chunk " + (idx + 1) + ":", err);
          alert("Failed to convert: \"" + chunks[idx].substring(0, 50) + "…\"\n\nError: " + err.message + "\n\nSkipping this chunk.");
          processNext(idx + 1);
        });
    }

    processNext(0);
  });

  /* ── Initialise history ───────────────────────────── */
  var existingData = JSON.parse(localStorage.getItem("ttsData")) || [];
  renderSavedData(existingData);
  dataHistoryDiv.appendChild(savedDataContainer);

  /* ── Utility ──────────────────────────────────────── */
  function escapeHTML(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

});
