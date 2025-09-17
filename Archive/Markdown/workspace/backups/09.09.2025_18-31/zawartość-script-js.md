```js
const DOM = {
  // Te zmienne są teraz null na początku
  chatContainer: null,
  promptInput: null,
  userNameInput: null,
  tagPanelTemplate: null,
};

let currentUserName = "Kira";
const MAX_USERNAME_LENGTH = 20;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// Nowe zdarzenie: poczekaj, aż cały DOM zostanie załadowany
document.addEventListener("DOMContentLoaded", () => {
  // Inicjalizuj stałe DOM dopiero po załadowaniu całej strony
  DOM.chatContainer = document.getElementById("chat-container");
  DOM.promptInput = document.getElementById("prompt");
  DOM.userNameInput = document.querySelector("#user_name");
  DOM.tagPanelTemplate = document.querySelector(".tag-panel-template");

  // Listenery zdarzeń
  DOM.userNameInput.maxLength = MAX_USERNAME_LENGTH;
  DOM.userNameInput.placeholder = `Twoje imię (max ${MAX_USERNAME_LENGTH} znaków)`;
  DOM.userNameInput.addEventListener("input", setUserName);
});

document.getElementById("prompt").addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") {
    sendPrompt();
    e.preventDefault();
  }
});

document.querySelector("#settings-toggle").addEventListener("click", () => {
  document.querySelector("#side-panel").classList.toggle("open");
  if (window.innerWidth <= 768) {
    document.querySelector("#web-side-panel").classList.remove("open");
  }
});
document.querySelector("#burger-toggle").addEventListener("click", () => {
  document.querySelector("#web-side-panel").classList.toggle("open");
  if (window.innerWidth <= 768) {
    document.querySelector("#side-panel").classList.remove("open");
  }
});


function updateForKeyboard() {
  const vv = window.visualViewport;
  const input = document.getElementById("input-area");
  if (!vv || !input) return;

  const keyboard = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
  input.style.bottom = keyboard ? `${keyboard}px` : '0px';
}

window.visualViewport?.addEventListener("resize", updateForKeyboard);
window.visualViewport?.addEventListener("scroll", updateForKeyboard);
window.addEventListener("load", updateForKeyboard);



// // Listenery zdarzeń
// DOM.userNameInput.maxLength = MAX_USERNAME_LENGTH;
// DOM.userNameInput.placeholder = `Twoje imię (max ${MAX_USERNAME_LENGTH} znaków)`;
// DOM.userNameInput.addEventListener("input", setUserName);

// Funkcje pomocnicze
function setUserName() {
  const value = DOM.userNameInput.value.trim();
  if (value) {
    currentUserName = value;
  }
}

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text.replaceAll("{{user}}", currentUserName);
  DOM.chatContainer.appendChild(msg);

  if (sender === "ai") {
    const editBtn = createButton("✏️ Edytuj", () => enableEdit(msg, text));
    msg.appendChild(editBtn);
  }

  DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.onclick = onClick;
  return btn;
}

async function checkImageExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// Główne funkcje
async function sendPrompt() {
  const prompt = DOM.promptInput.value.trim();
  if (!prompt) return;

  DOM.promptInput.value = "";
  DOM.promptInput.disabled = true;
  appendMessage(prompt, "user");

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message ai";
  DOM.chatContainer.appendChild(loadingMsg);

  let secondsElapsed = 0;
  loadingMsg.innerText = `⏳ Generowanie odpowiedzi... (0s)`;

  const timer = setInterval(() => {
    secondsElapsed++;
    loadingMsg.innerText = `⏳ Generowanie odpowiedzi... (${secondsElapsed}s)`;
  }, 1000);

  const startTime = Date.now();

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    clearInterval(timer);

    loadingMsg.innerHTML = `⏱️ Czas generowania: ${duration} sekundy<br><br>${data.response}`;
    DOM.promptInput.disabled = false;

    const editBtn = createButton("✏️ Edytuj", () =>
      enableEdit(loadingMsg, data.response)
    );
    loadingMsg.appendChild(editBtn);
    appendRatingForm();
  } catch (err) {
    clearInterval(timer);
    loadingMsg.innerText = "❌ Błąd generowania odpowiedzi.";
    console.error("Błąd:", err);
    DOM.promptInput.disabled = false;
  }
}

function appendRatingForm() {
  const form = document.createElement("details");
  form.innerHTML = `
    <summary>Ocena⭐</summary>
    <div class="rating-form">
      <h3>Oceń odpowiedź AI</h3>
      <label><span>Narracja:</span><input type="range" min="0" max="5" id="continuity"></label>
      <label><span>Styl:</span><input type="range" min="0" max="5" id="style"></label>
      <label><span>Logika:</span><input type="range" min="0" max="5" id="logic"></label>
      <label><span>Jakość:</span><input type="range" min="0" max="5" id="expectation"></label>
      <label><span>Emocje:</span><input type="range" min="0" max="5" id="emotion"></label>
      <button onclick="submitRating()">Zapisz ocenę</button>
    </div>
  `;
  DOM.chatContainer.appendChild(form);
}

async function submitRating() {
  const ratings = {
    continuity: parseInt(document.getElementById("continuity").value),
    style: parseInt(document.getElementById("style").value),
    logic: parseInt(document.getElementById("logic").value),
    expectation: parseInt(document.getElementById("expectation").value),
    emotion: parseInt(document.getElementById("emotion").value),
  };

  try {
    await fetch("/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings }),
    });
    alert("Ocena zapisana! 👍");
  } catch (err) {
    console.error("Błąd zapisu oceny:", err);
    alert("Nie udało się zapisać oceny. 😞");
  }
}
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

if (isMobile) {
  document
    .querySelector("textarea#prompt")
    .setAttribute("placeholder", "Wpisz wiadomość...");
}

function replaseDatalistAsSelectIfIsMobile() {
  if (!isMobile) return;

  const tagPanel = document.querySelector(".tag-panel");
  // Map input id to placeholder for default option
  const placeholders = {
    "tag-location": "Nie wybrano lokalizacji",
    "tag-character": "Nie wybrano postaci",
    "tag-action": "Nie wybrano czynności",
    "tag-nsfw": "Nie wybrano czynności NSFW",
    "tag-emotion": "Nie wybrano emocji",
  };

  tagPanel.querySelectorAll("input[list]").forEach((input) => {
    const datalistId = input.getAttribute("list");
    const datalist = document.getElementById(datalistId);

    const select = document.createElement("select");
    select.id = input.id;
    select.classList.add("tag-select-mobile");

    // Default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = placeholders[input.id] || "Nie wybrano";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    datalist.querySelectorAll("option").forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.value;
      select.appendChild(opt);
    });

    input.replaceWith(select);
  });
}

function enableEdit(msgElement, originalText) {
  msgElement.innerHTML = "";

  const textarea = document.createElement("textarea");
  textarea.value = originalText;
  textarea.rows = 6;
  textarea.className = "form-element textarea-base w-full fix-w-full mt-10";

  const tagPanelTemplate = DOM.tagPanelTemplate.content.cloneNode(true);
  const tagPanel = document.createElement("div");
  tagPanel.className = "tag-panel";
  tagPanel.appendChild(tagPanelTemplate);

  const imageGallery = tagPanel.querySelector("#image-gallery");

  const saveBtn = createButton("💾 Zapisz", async () => {
    const selectedTags = ["location", "character", "action", "nsfw", "emotion"]
      .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
      .filter(Boolean);
    const selectedImage = tagPanel.querySelector(
      "input[name='image']:checked"
    )?.value;

    await submitEdit(textarea.value, selectedTags, msgElement, selectedImage);
  });

  const cancelBtn = createButton("❌ Anuluj", () => {
    msgElement.innerHTML = "";
    msgElement.innerText = originalText;
    const editBtn = createButton("✏️ Edytuj", () =>
      enableEdit(msgElement, originalText)
    );
    msgElement.appendChild(editBtn);
  });

  msgElement.appendChild(textarea);
  msgElement.appendChild(tagPanel);
  msgElement.appendChild(saveBtn);
  msgElement.appendChild(cancelBtn);

  // Re-attach event listeners to the new, cloned elements
  ["location", "character", "action", "nsfw", "emotion"].forEach((id) => {
    const el = tagPanel.querySelector(`#tag-${id}`);
    if (!el) return;
    replaseDatalistAsSelectIfIsMobile();

    const eventType = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventType, () => {
      const currentTags = ["location", "character", "action", "nsfw", "emotion"]
        .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
        .filter(Boolean);
      findMatchingImagesAndRender(currentTags, imageGallery);
    });
  });

  // Initial render of images
  const initialTags = ["location", "character", "action", "nsfw", "emotion"]
    .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
    .filter(Boolean);
  findMatchingImagesAndRender(initialTags, imageGallery);
}

// Function to find images and render them
async function findMatchingImagesAndRender(tags, galleryElement) {
  galleryElement.innerHTML = "";
  const combinations = [];
  for (let i = tags.length; i > 0; i--) {
    combinations.push(tags.slice(0, i).join("_"));
  }

  for (const base of combinations) {
    for (const ext of IMAGE_EXTENSIONS) {
      const src = `/static/NarrativeIMG/${base}${ext}`;
      if (await checkImageExists(src)) {
        const label = document.createElement("label");
        label.className = "image-label";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "image";
        radio.value = src;
        radio.style.display = "none";

        const img = document.createElement("img");
        img.src = src;
        img.width = 100; //Do wywalenia
        img.height = 100; //Do wywalenia
        img.className = "img-responsive br-2 mt-10";
        img.style.transition = "border-color 0.3s";

        radio.addEventListener("change", () => {
          const allImages = galleryElement.querySelectorAll("img");
          allImages.forEach((i) => (i.style.border = "2px solid transparent"));
          img.style.border = "2px solid #49c28f";
        });

        label.appendChild(radio);
        label.appendChild(img);
        galleryElement.appendChild(label);
      }
    }
  }
}

async function submitEdit(editedText, tags, msgElement, imageUrl) {
  try {
    await fetch("/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edited: editedText, tags }),
    });

    alert("Poprawiona wersja zapisana! 👍");

    msgElement.innerHTML = "";

    const finalText = document.createElement("div");
    finalText.innerText = editedText;
    msgElement.appendChild(finalText);

    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.width = 400;
      img.className = "img-responsive br-2 mt-10";

      msgElement.appendChild(img);
    }

    const editBtn = createButton("✏️ Edytuj", () =>
      enableEdit(msgElement, editedText)
    );
    msgElement.appendChild(editBtn);
  } catch (err) {
    console.error("Błąd zapisu edycji:", err);
    alert("Nie udało się zapisać edycji. 😞");
  }
}
```