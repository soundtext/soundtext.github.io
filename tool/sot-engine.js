document.addEventListener("DOMContentLoaded", function () {

  var config_sound_of_text = {
    length: "600",
    scrollbar: "true",
    group_audio_control: "true",
    item_audio_control: "false",
  };

  var API_BASE = "https://api.soundoftext.com";

  const textArea = document.getElementById("text");
  const clearIcon = document.getElementById("clear-icon");
  const charCounter = document.getElementById("char-counter");
  const languageDivs = document.querySelectorAll(".language div");
  const convertButton = document.getElementById("convert-btn");
  const dataHistoryDiv = document.getElementById("data-history");
  const languageContainer = document.querySelector(".language");
  const savedDataContainer = document.createElement("div");
  savedDataContainer.classList.add("saved-data");

  let selectedLanguage = null;
  let isPlaying = false;
  let currentIndex = 0;
  let isConverting = false;

  if (config_sound_of_text.group_audio_control === "true") {
    document.querySelector(".sound-of-text.history .navigation").style.display = "flex";
  } else {
    document.querySelector(".sound-of-text.history .navigation").style.display = "none";
  }

  function selectDiv(div) {
    selectedLanguage = {
      code: div.getAttribute("data-code"),
      name: div.getAttribute("data-name"),
    };
    const languageSelectCode = document.querySelector(".language-select .code");
    languageSelectCode.setAttribute("data-code", div.getAttribute("data-code"));
    languageSelectCode.setAttribute("data-name", div.getAttribute("data-name"));
    languageSelectCode.textContent = div.getAttribute("data-name");
  }

  languageDivs.forEach(function (div) {
    div.addEventListener("click", function () {
      selectDiv(this);
      languageContainer.style.display = "none";
    });
  });

  var defaultLanguage = document.querySelector(".language-select .code");
  if (defaultLanguage) selectDiv(defaultLanguage);

  function updateCharCount() {
    var charCount = textArea.value.length;
    charCounter.textContent = charCount + " characters";
    clearIcon.style.opacity = charCount > 0 ? 1 : 0.2;
  }

  clearIcon.addEventListener("click", function () {
    textArea.value = "";
    updateCharCount();
    textArea.focus();
  });

  textArea.addEventListener("input", updateCharCount);
  updateCharCount();

  function splitTextForTTS(text, maxLength) {
    maxLength = maxLength || 200;
    text = text.trim();
    var nonEmptyLines = text
      .split("\n")
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });
    text = nonEmptyLines.join(" ");

    var sentences =
      text.match(/(?:\d+[.,]?\d*|\D)+?[.!?](?=\s|$)|(?:\d+[.,]?\d*|\D)+/g) || [];
    if (!sentences) return [];

    var chunks = [];
    var currentChunk = "";

    for (var i = 0; i < sentences.length; i++) {
      var sentence = sentences[i];
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence;
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

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
      if (!json.success) throw new Error("API returned error: " + (json.message || "unknown"));
      return pollForAudio(json.id);
    });
  }

  function pollForAudio(id, attempt) {
    attempt = attempt || 0;
    if (attempt > 30) return Promise.reject(new Error("Audio generation timed out"));

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
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(pollForAudio(id, attempt + 1));
          }, 500);
        });
      });
  }

  function setButtonLoading(loading) {
    isConverting = loading;
    convertButton.disabled = loading;
    if (loading) {
      convertButton.textContent = "\u23f3 Converting...";
    } else {
      convertButton.textContent = "Convert to Speech";
    }
  }

  function saveItem(text, language, audioUrl) {
    var item = {
      text: text,
      language: language,
      audioUrl: audioUrl
    };
    var existingData = JSON.parse(localStorage.getItem("ttsData")) || [];
    var newData = existingData.concat([item]);
    localStorage.setItem("ttsData", JSON.stringify(newData));
    renderSavedData(newData);
  }

  function renderSavedData(data) {
    savedDataContainer.innerHTML = '';

    if (data.length > 0) {
      document.querySelector(".sound-of-text.history").style.display = "block";
    } else {
      document.querySelector(".sound-of-text.history").style.display = "none";
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
        '  <p><strong>Text:</strong> ' + escapeText(item.text) + '</p>' +
        '  <p><strong>Language:</strong> ' + escapeText(item.language.name) + '</p>' +
        '  <div class="audio">' +
        '    <audio controls src="' + escapeAttr(item.audioUrl) + '" preload="auto"></audio>' +
        '    <a class="download-link" href="' + escapeAttr(item.audioUrl) + '" download="soundoftext-' + index + '.mp3" title="Download MP3" aria-label="Download MP3">' +
        '      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>' +
        '    </a>' +
        '  </div>' +
        '</div>' +
        '<button class="delete-item" data-index="' + index + '" title="Delete">' +
        '  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
        '</button>';
      savedDataContainer.appendChild(itemDiv);
    });

    var clearAllBtn = document.querySelector(".clear-all");
    if (clearAllBtn) {
      var newClearAll = clearAllBtn.cloneNode(true);
      clearAllBtn.parentNode.replaceChild(newClearAll, clearAllBtn);
      newClearAll.addEventListener("click", function () {
        localStorage.removeItem("ttsData");
        renderSavedData([]);
      });
    }

    var playAllBtn = document.querySelector(".play-all");
    if (playAllBtn) {
      var newPlayAll = playAllBtn.cloneNode(true);
      playAllBtn.parentNode.replaceChild(newPlayAll, playAllBtn);
      newPlayAll.addEventListener("click", playAllAudio);
    }

    var pauseBtn = document.getElementById("pause-tts");
    if (pauseBtn) {
      var newPause = pauseBtn.cloneNode(true);
      newPause.id = "pause-tts";
      pauseBtn.parentNode.replaceChild(newPause, pauseBtn);
      newPause.addEventListener("click", function () {
        var audio = document.querySelectorAll(".saved-item audio")[currentIndex];
        if (audio) { audio.pause(); isPlaying = false; }
      });
    }

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
        document.querySelectorAll(".saved-item").forEach(function (el) { el.classList.remove("playing"); });
      });
    }

    document.querySelectorAll(".delete-item").forEach(function (button) {
      button.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-index"), 10);
        var updatedData = data.filter(function (_, i) { return i !== idx; });
        localStorage.setItem("ttsData", JSON.stringify(updatedData));
        renderSavedData(updatedData);
      });
    });

    savedDataContainer.scrollTop = savedDataContainer.scrollHeight;
  }

  function playAllAudio() {
    if (isPlaying) return;
    isPlaying = true;

    var audios = document.querySelectorAll(".saved-item audio");
    currentIndex = 0;

    function playNext() {
      if (currentIndex < audios.length && isPlaying) {
        var currentAudio = audios[currentIndex];
        document.querySelectorAll(".saved-item").forEach(function (item) { item.classList.remove("playing"); });
        currentAudio.closest(".saved-item").classList.add("playing");

        if (config_sound_of_text.scrollbar === "true") {
          savedDataContainer.scrollTop = currentAudio.closest(".saved-item").offsetTop;
        } else {
          window.scrollTo({ top: currentAudio.closest(".saved-item").offsetTop, behavior: "smooth" });
        }

        currentAudio.play();
        currentAudio.onended = function () {
          currentIndex++;
          playNext();
        };
        currentAudio.onerror = function () {
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

  convertButton.addEventListener("click", function () {
    var text = textArea.value.trim();
    if (!text || !selectedLanguage) {
      alert("Please enter text and select a language.");
      return;
    }
    if (isConverting) return;

    var chunks = splitTextForTTS(text);
    if (chunks.length === 0) return;

    setButtonLoading(true);
    textArea.value = "";
    updateCharCount();

    var processed = 0;
    var total = chunks.length;

    function processNext(idx) {
      if (idx >= total) {
        setButtonLoading(false);
        return;
      }

      convertButton.textContent = "\u23f3 Converting " + (idx + 1) + " of " + total + "...";

      requestAudio(chunks[idx], selectedLanguage.code)
        .then(function (audioUrl) {
          saveItem(chunks[idx], selectedLanguage, audioUrl);
          processNext(idx + 1);
        })
        .catch(function (err) {
          console.error("Failed to convert chunk " + (idx + 1) + ":", err);
          alert("Failed to convert: \"" + chunks[idx].substring(0, 50) + "...\"\n\nError: " + err.message + "\n\nSkipping this chunk.");
          processNext(idx + 1);
        });
    }

    processNext(0);
  });

  var existingData = JSON.parse(localStorage.getItem("ttsData")) || [];
  renderSavedData(existingData);
  dataHistoryDiv.appendChild(savedDataContainer);

  function debounce(func, wait) {
    var timeout;
    return function () {
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () { func.apply(this, args); }, wait);
    };
  }

  var languageSelect = document.querySelector(".language-select");
  if (languageSelect) {
    languageSelect.addEventListener("click", function (e) {
      e.stopPropagation();
      var langEl = document.querySelector(".language");
      if (langEl) {
        var show = langEl.style.display === "block";
        langEl.style.display = show ? "none" : "block";
      }
    });
  }

  document.addEventListener("click", function (e) {
    var langEl = document.querySelector(".language");
    if (langEl && !e.target.closest(".language, .language-select")) {
      langEl.style.display = "none";
    }
  });

  function escapeText(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});