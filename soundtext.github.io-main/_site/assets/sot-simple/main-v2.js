document.addEventListener("DOMContentLoaded", function () {

  var config_sound_of_text = {
    // default: "id-ID",
    length: "600",
    scrollbar: "true",
    group_audio_control: "true",
    item_audio_control: "false",
  };

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

  if (config_sound_of_text.group_audio_control === "true") {
    document.querySelector(".sound-of-text.history .navigation").style.display =
      "flex";
  } else {
    document.querySelector(".sound-of-text.history .navigation").style.display =
      "none";
  }

  // Fungsi untuk memilih bahasa
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

  // Event listener untuk memilih bahasa
  languageDivs.forEach((div) => {
    div.addEventListener("click", function () {
      selectDiv(this);
      languageContainer.style.display = "none";
    });
  });

  // Pilih bahasa default
  const defaultLanguage = document.querySelector(".language-select .code");
  if (defaultLanguage) selectDiv(defaultLanguage);

  // Update jumlah karakter
  function updateCharCount() {
    const charCount = textArea.value.length;
    charCounter.textContent = `${charCount} characters`;
    clearIcon.style.opacity = charCount > 0 ? 1 : 0.2;
  }

  // Bersihkan textarea
  clearIcon.addEventListener("click", function () {
    textArea.value = "";
    updateCharCount();
    textArea.focus();
  });

  // Update karakter saat input
  textArea.addEventListener("input", updateCharCount);

  // Inisialisasi counter
  updateCharCount();

  function splitTextForTTS(text, maxLength = 200) {
    text = text.trim();
    const nonEmptyLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    text = nonEmptyLines.join(" ");

    const sentences =
      text.match(/(?:\d+[.,]?\d*|\D)+?[.!?](?=\s|$)|(?:\d+[.,]?\d*|\D)+/g) ||
      [];
    if (!sentences) return [];

    const chunks = [];
    let currentChunk = "";

    for (const sentence of sentences) {
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

  // Render data tersimpan
  function renderSavedData(data) {
    savedDataContainer.innerHTML = '';
    console.log(data.length);
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

    data.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("saved-item");
      itemDiv.innerHTML = `
            <div>
                    <p><strong>Text:</strong> ${item.text}</p>
                    <p><strong>Language:</strong> ${item.language.name}</p>
                    <div class="audio">
                    <audio controls referrerpolicy="no-referrer" src="${item.audioUrl}" download="sound-of-text.mp3" controlsList="download"></audio>
                    <svg class="download" width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 7L12 14M12 14L15 11M12 14L9 11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 17H12H8" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="#1C274C" stroke-width="1.5"/>
</svg>
                    </div>
                </div>
                <button class="delete-item" data-index="${index}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
                  </svg>
                </button>
        `;
      savedDataContainer.appendChild(itemDiv);
    });

    // Clear All Button
    document.querySelector(".clear-all").addEventListener("click", function () {
      localStorage.removeItem("ttsData");
      renderSavedData([]);
      console.log(JSON.parse(localStorage.getItem("ttsData")) );
      console.log('delete click');
    });

    // Play All Button
    document.querySelector(".play-all").addEventListener("click", playAllAudio);

    // Pause Audio
    document.getElementById("pause-tts").addEventListener("click", function () {
      const audio =
        document.querySelectorAll(".saved-item audio")[currentIndex];
      if (audio) {
        audio.pause();
        isPlaying = false;
      }
    });

    // Stop Audio
    document.getElementById("stop-tts").addEventListener("click", function () {
      const audios = document.querySelectorAll(".saved-item audio");
      if (audios.length > 0) {
        audios[currentIndex].pause();
        audios[currentIndex].currentTime = 0;
      }
      currentIndex = 0;
      isPlaying = false;
    });

    // Delete Item
    document.querySelectorAll(".delete-item").forEach((button) => {
      button.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        const updatedData = data.filter((_, i) => i !== index);
        localStorage.setItem("ttsData", JSON.stringify(updatedData));
        renderSavedData(updatedData);
      });
    });

    savedDataContainer.scrollTop = savedDataContainer.scrollHeight;
  }

  function saveData(text, language, addOnTop = true) {
    const splits = splitTextForTTS(text);
    const dataToSave = splits.map((chunk) => ({
      text: chunk,
      language,
      audioUrl: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${
        language.code
      }&client=tw-ob&q=${encodeURIComponent(chunk)}&ttsspeed=1`,
    }));

    const existingData = JSON.parse(localStorage.getItem("ttsData")) || [];
    const newData = addOnTop
      ? [...dataToSave, ...existingData]
      : [...existingData, ...dataToSave];

    localStorage.setItem("ttsData", JSON.stringify(newData));
    renderSavedData(newData);
  }

  function playAllAudio() {
    if (isPlaying) return;
    isPlaying = true;

    const audios = document.querySelectorAll(".saved-item audio");
    currentIndex = 0;

    function playNext() {
      if (currentIndex < audios.length) {
        const currentAudio = audios[currentIndex];

        // Highlight item yang sedang diputar
        document
          .querySelectorAll(".saved-item")
          .forEach((item) => item.classList.remove("playing"));
        currentAudio.closest(".saved-item").classList.add("playing");

        // Scroll ke item yang sedang diputar
        if (config_sound_of_text.scrollbar === "true") {
          savedDataContainer.scrollTop =
            currentAudio.closest(".saved-item").offsetTop;
        } else {
          window.scrollTo({
            top: currentAudio.closest(".saved-item").offsetTop,
            behavior: "smooth",
          });
        }

        // Putar audio
        currentAudio.play();

        // Event listener untuk lanjut ke audio berikutnya
        currentAudio.addEventListener("ended", function () {
          currentIndex++;
          playNext();
        });
      } else {
        isPlaying = false;
      }
    }

    playNext();
  }

  convertButton.addEventListener("click", function () {
    const text = textArea.value.trim();
    if (!text || !selectedLanguage) {
      alert("Please enter text and select a language.");
      return;
    }

    saveData(text, selectedLanguage, false);
    textArea.value = "";
    updateCharCount();
  });

  const existingData = JSON.parse(localStorage.getItem("ttsData")) || [];
  renderSavedData(existingData);

  dataHistoryDiv.appendChild(savedDataContainer);

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  document
    .querySelector(".language-select")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      adjustLanguagePosition();
      document.querySelector(".language").style.display = "block";
    });

  function adjustDropdownHeight() {
    const availableHeight = document.getElementById("text").offsetHeight;
    document.querySelector(".language").style.maxHeight = `${
      availableHeight > 100 ? availableHeight : 100
    }px`;
  }

  function adjustLanguagePosition() {
    const barHeight = document.querySelector(".bar").offsetHeight + 21;
    document.querySelector(".language").style.bottom = `${barHeight}px`;
  }

  adjustLanguagePosition();
  adjustDropdownHeight();

  window.addEventListener("resize", debounce(adjustDropdownHeight, 200));
  window.addEventListener("resize", debounce(adjustLanguagePosition, 200));

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".language, .language-select")) {
      document.querySelector(".language").style.display = "none";
    }
  });

  // Event listener untuk tombol download audio
  document.addEventListener("click", function (event) {
    if (event.target.matches(".audio .download")) {
      const audioElement = event.target
        .closest(".audio")
        .querySelector("audio");

      if (audioElement) {
        const audioUrl = audioElement.getAttribute("src");
        if (audioUrl) {
          downloadAudio(audioUrl, `soundoftext.or.id--${Date.now()}.mp3`);
        } else {
          console.error("Audio URL tidak ditemukan.");
        }
      }
    }
  });

  // Fungsi downloadAudio
  function downloadAudio(url, filename) {
    console.log(url);
    fetch(url, {
      method: "GET",
      mode: "no-cors",
      redirect: "follow",
      headers: new Headers({
        "accept-encoding": "gzip, deflate, br, zstd",
        origin: "translate.google.com",
        referer: "translate.google.com",
        authority: "translate.google.com",
        path: "/translate_tts?ie=UTF-8&tl=bs&client=tw-ob&q=Leave%20a%20Comment%20Logged%20in%20as%20Agus.%20Edit%20your%20profile.%20Log%20out%3F%20Required%20fields%20are%20marked%20*%20Comment&ttsspeed=1",
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const urlObject = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlObject;
        a.download = filename || "audio.mp3";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(urlObject);
        document.body.removeChild(a);
      })
      .catch((error) => console.error("Error downloading audio:", error));
  }
});
