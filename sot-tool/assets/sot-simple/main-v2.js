document.addEventListener("DOMContentLoaded", function () {

  /* ── Config ───────────────────────────────────────── */
  var config_sound_of_text = {
    length: "5000",
    scrollbar: "false",
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

  const savedDataContainer = document.createElement("div");
  savedDataContainer.classList.add("saved-data");

  /* ── Korean Language Locked ───────────────────────── */
  const selectedLanguage = {
    code: "ko-KR",
    name: "Korean (한국어)"
  };

  let isPlayingAll = false;
  let currentPlayIndex = 0;
  let isConverting = false;

  /* ── Character counter ────────────────────────────── */
  function updateCharCount() {
    if (!textArea || !charCounter) return;
    var len = textArea.value.length;
    charCounter.textContent = len.toLocaleString() + " / 5,000";
    if (clearIcon) clearIcon.style.opacity = len > 0 ? "1" : "0.2";
  }

  if (clearIcon && textArea) {
    clearIcon.addEventListener("click", function () {
      textArea.value = "";
      updateCharCount();
      textArea.focus();
    });
  }

  if (textArea) {
    textArea.addEventListener("input", updateCharCount);
    updateCharCount();
  }

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
    if (!convertButton) return;
    convertButton.disabled = loading;
    if (loading) {
      convertButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 sot-spinner"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>' +
        ' Converting to Korean Speech…';
    } else {
      convertButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>' +
        ' Convert to Korean Speech';
    }
  }

  /* ── Time Formatter ───────────────────────────────── */
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  /* ── Stop all active audios ───────────────────────── */
  function stopAllAudios() {
    isPlayingAll = false;
    document.querySelectorAll(".saved-item").forEach(function (item) {
      item.classList.remove("is-playing");
      var audio = item.querySelector("audio");
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      var playIcon = item.querySelector(".icon-play");
      var pauseIcon = item.querySelector(".icon-pause");
      if (playIcon) playIcon.style.display = "block";
      if (pauseIcon) pauseIcon.style.display = "none";
      var progressFill = item.querySelector(".audio-progress-fill");
      if (progressFill) progressFill.style.width = "0%";
      var curTime = item.querySelector(".audio-current-time");
      if (curTime) curTime.textContent = "0:00";
    });
  }

  /* ── Render saved results ─────────────────────────── */
  function renderSavedData(data) {
    savedDataContainer.innerHTML = "";

    if (data && data.length > 0) {
      if (dataHistoryDiv) dataHistoryDiv.style.display = "block";
    } else {
      if (dataHistoryDiv) dataHistoryDiv.style.display = "none";
      return;
    }

    savedDataContainer.classList.remove("scroll");

    data.forEach(function (item, index) {
      var itemDiv = document.createElement("div");
      itemDiv.classList.add("saved-item");
      itemDiv.setAttribute("data-index", index);

      itemDiv.innerHTML =
        '<div class="saved-item__header">' +
        '  <div class="saved-item__meta">' +
        '    <span class="saved-item__badge">🇰🇷 Korean Voice</span>' +
        '    <span class="saved-item__track-num">Audio #' + (index + 1) + '</span>' +
        '  </div>' +
        '  <button type="button" class="delete-item" data-index="' + index + '" title="Delete this audio" aria-label="Delete">' +
        '    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>' +
        '  </button>' +
        '</div>' +
        '<p class="saved-item__text">' + escapeHTML(item.text) + '</p>' +
        '<div class="custom-audio-player">' +
        '  <audio src="' + escapeAttr(item.audioUrl) + '" preload="metadata"></audio>' +
        '  <button type="button" class="audio-play-btn" aria-label="Play Korean Voice">' +
        '    <svg xmlns="http://www.w3.org/2000/svg" class="icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>' +
        '    <svg xmlns="http://www.w3.org/2000/svg" class="icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause" style="display:none;"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>' +
        '  </button>' +
        '  <div class="audio-progress-container">' +
        '    <div class="audio-progress-bar">' +
        '      <div class="audio-progress-fill"></div>' +
        '    </div>' +
        '    <div class="audio-time-row">' +
        '      <span class="audio-current-time">0:00</span>' +
        '      <span class="audio-duration">--:--</span>' +
        '    </div>' +
        '  </div>' +
        '  <a class="audio-download-btn" href="' + escapeAttr(item.audioUrl) + '" download="korean-soundoftext-' + (index + 1) + '.mp3" title="Download MP3" aria-label="Download MP3">' +
        '    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>' +
        '    <span>Download MP3</span>' +
        '  </a>' +
        '</div>';

      // Setup audio interactive behavior
      var audio = itemDiv.querySelector("audio");
      var playBtn = itemDiv.querySelector(".audio-play-btn");
      var iconPlay = itemDiv.querySelector(".icon-play");
      var iconPause = itemDiv.querySelector(".icon-pause");
      var progressBar = itemDiv.querySelector(".audio-progress-bar");
      var progressFill = itemDiv.querySelector(".audio-progress-fill");
      var curTimeDisplay = itemDiv.querySelector(".audio-current-time");
      var durationDisplay = itemDiv.querySelector(".audio-duration");

      // Load duration
      audio.addEventListener("loadedmetadata", function () {
        if (durationDisplay) durationDisplay.textContent = formatTime(audio.duration);
      });

      audio.addEventListener("durationchange", function () {
        if (durationDisplay) durationDisplay.textContent = formatTime(audio.duration);
      });

      // Update progress
      audio.addEventListener("timeupdate", function () {
        if (!audio.duration) return;
        var pct = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = pct + "%";
        if (curTimeDisplay) curTimeDisplay.textContent = formatTime(audio.currentTime);
      });

      // End of audio
      audio.addEventListener("ended", function () {
        itemDiv.classList.remove("is-playing");
        if (iconPlay) iconPlay.style.display = "block";
        if (iconPause) iconPause.style.display = "none";
        if (progressFill) progressFill.style.width = "0%";
        if (curTimeDisplay) curTimeDisplay.textContent = "0:00";

        if (isPlayingAll) {
          currentPlayIndex++;
          playNextInSequence();
        }
      });

      // Play/Pause button click
      playBtn.addEventListener("click", function () {
        if (audio.paused) {
          // Pause all other audios first
          document.querySelectorAll(".saved-item").forEach(function (other) {
            if (other !== itemDiv) {
              other.classList.remove("is-playing");
              var otherAudio = other.querySelector("audio");
              if (otherAudio) otherAudio.pause();
              var oPlay = other.querySelector(".icon-play");
              var oPause = other.querySelector(".icon-pause");
              if (oPlay) oPlay.style.display = "block";
              if (oPause) oPause.style.display = "none";
            }
          });

          audio.play().then(function () {
            itemDiv.classList.add("is-playing");
            if (iconPlay) iconPlay.style.display = "none";
            if (iconPause) iconPause.style.display = "block";
          }).catch(function (e) {
            console.error("Playback error:", e);
          });
        } else {
          audio.pause();
          itemDiv.classList.remove("is-playing");
          if (iconPlay) iconPlay.style.display = "block";
          if (iconPause) iconPause.style.display = "none";
        }
      });

      // Click on Progress bar to scrub
      progressBar.addEventListener("click", function (e) {
        var rect = progressBar.getBoundingClientRect();
        var clickX = e.clientX - rect.left;
        var width = rect.width;
        if (width > 0 && audio.duration) {
          var ratio = Math.max(0, Math.min(1, clickX / width));
          audio.currentTime = ratio * audio.duration;
          if (progressFill) progressFill.style.width = (ratio * 100) + "%";
        }
      });

      savedDataContainer.appendChild(itemDiv);
    });

    // Clear All
    var clearAllBtn = dataHistoryDiv ? dataHistoryDiv.querySelector(".clear-all") : null;
    if (clearAllBtn) {
      var newClearAll = clearAllBtn.cloneNode(true);
      clearAllBtn.parentNode.replaceChild(newClearAll, clearAllBtn);
      newClearAll.addEventListener("click", function () {
        stopAllAudios();
        localStorage.removeItem("ttsData");
        renderSavedData([]);
      });
    }

    // Play All
    var playAllBtn = dataHistoryDiv ? dataHistoryDiv.querySelector(".play-all") : null;
    if (playAllBtn) {
      var newPlayAll = playAllBtn.cloneNode(true);
      playAllBtn.parentNode.replaceChild(newPlayAll, playAllBtn);
      newPlayAll.addEventListener("click", function () {
        stopAllAudios();
        var items = document.querySelectorAll(".saved-item");
        if (items.length === 0) return;
        isPlayingAll = true;
        currentPlayIndex = 0;
        playNextInSequence();
      });
    }

    // Stop
    var stopBtn = document.getElementById("stop-tts");
    if (stopBtn) {
      var newStop = stopBtn.cloneNode(true);
      newStop.id = "stop-tts";
      stopBtn.parentNode.replaceChild(newStop, stopBtn);
      newStop.addEventListener("click", function () {
        stopAllAudios();
      });
    }

    // Delete individual
    document.querySelectorAll(".delete-item").forEach(function (button) {
      button.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-index"), 10);
        var existing = JSON.parse(localStorage.getItem("ttsData")) || [];
        var updated = existing.filter(function (_, i) { return i !== idx; });
        localStorage.setItem("ttsData", JSON.stringify(updated));
        renderSavedData(updated);
      });
    });

    savedDataContainer.scrollTop = savedDataContainer.scrollHeight;
  }

  function playNextInSequence() {
    var items = document.querySelectorAll(".saved-item");
    if (!isPlayingAll || currentPlayIndex >= items.length) {
      isPlayingAll = false;
      return;
    }

    var targetItem = items[currentPlayIndex];
    var audio = targetItem.querySelector("audio");
    var playBtn = targetItem.querySelector(".audio-play-btn");

    if (targetItem && audio && playBtn) {
      if (config_sound_of_text.scrollbar === "true") {
        savedDataContainer.scrollTop = targetItem.offsetTop;
      } else {
        window.scrollTo({ top: targetItem.offsetTop, behavior: "smooth" });
      }
      playBtn.click();
    }
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

  /* ── Convert button ───────────────────────────────── */
  if (convertButton) {
    convertButton.addEventListener("click", function () {
      var text = textArea ? textArea.value.trim() : "";
      if (!text) {
        alert("Please enter Korean text to convert.");
        if (textArea) textArea.focus();
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
      if (textArea) textArea.value = "";
      updateCharCount();

      var total = chunks.length;

      function processNext(idx) {
        if (idx >= total) {
          setButtonLoading(false);
          return;
        }

        convertButton.innerHTML =
          '<svg class="sot-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>' +
          ' Generating Korean Voice ' + (idx + 1) + ' of ' + total + '…';

        requestAudio(chunks[idx], selectedLanguage.code)
          .then(function (audioUrl) {
            saveItem(chunks[idx], selectedLanguage, audioUrl, false);
            processNext(idx + 1);
          })
          .catch(function (err) {
            console.error("Failed to convert chunk " + (idx + 1) + ":", err);
            alert("Failed to convert: \"" + chunks[idx].substring(0, 50) + "…\"\n\nError: " + err.message);
            processNext(idx + 1);
          });
      }

      processNext(0);
    });
  }

  /* ── Initialise history ───────────────────────────── */
  var existingData = JSON.parse(localStorage.getItem("ttsData")) || [];
  renderSavedData(existingData);
  if (dataHistoryDiv) dataHistoryDiv.appendChild(savedDataContainer);

  /* ── Utility ──────────────────────────────────────── */
  function escapeHTML(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

});
