let currentUserName = "Kira";
document
  .querySelector(".user-name-label input")
  .addEventListener("input", setUserName);

function setUserName() {
  const input = document.querySelector(".user-name-label input");
  const maxLength = 20;
  if (input) {
    input.maxLength = maxLength;
    input.placeholder = "Twoje imię (max " + maxLength + " znaków)";
  }
  if (input && input.value.trim()) {
    currentUserName = input.value.trim();
  }
}

async function sendPrompt() {
  const prompt = document.getElementById("prompt").value;
  if (!prompt.trim()) return;
  document.getElementById("prompt").value = "";
  document.getElementById("prompt").setAttribute("disabled", "true");
  appendMessage(prompt, "user");

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message ai";
  document.getElementById("chat-container").appendChild(loadingMsg);

  let secondsElapsed = 0;
  loadingMsg.innerText = `⏳ Generowanie odpowiedzi... (0s)`;

  const timer = setInterval(() => {
    secondsElapsed++;
    loadingMsg.innerText = `⏳ Generowanie odpowiedzi... (${secondsElapsed}s)`;
  }, 1000);

  const start = Date.now();

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    clearInterval(timer);

    loadingMsg.innerHTML = `⏱️ Czas generowania: ${duration} sekundy<br><br>${data.response}`;
    document.getElementById("prompt").removeAttribute("disabled");

    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️ Edytuj";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = () => enableEdit(loadingMsg, data.response);
    loadingMsg.appendChild(editBtn);

    appendRatingForm();
  } catch (err) {
    clearInterval(timer);
    loadingMsg.innerText = "❌ Błąd generowania odpowiedzi.";
    console.error("Błąd:", err);
    document.getElementById("prompt").removeAttribute("disabled");
  }

  document.getElementById("prompt").value = "";
  document.getElementById("chat-container").scrollTop =
    document.getElementById("chat-container").scrollHeight;
}

function appendMessage(text, sender) {
  const container = document.getElementById("chat-container");
  const msg = document.createElement("div");
  text.replaceAll("{{user}}", currentUserName);
  msg.className = `message ${sender}`;
  msg.innerText = text;

  if (sender === "ai") {
    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️ Edytuj";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = () => enableEdit(msg, text);
    msg.appendChild(editBtn);
  }

  container.appendChild(msg);
}

function appendRatingForm() {
  const container = document.getElementById("chat-container");
  const form = document.createElement("details");
  //form.className = "rating-form";
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
  container.appendChild(form);
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
    const res = await fetch("/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings }),
    });
    const result = await res.json();
    alert("Ocena zapisana!");
  } catch (err) {
    console.error("Błąd zapisu oceny:", err);
    alert("Nie udało się zapisać oceny.");
  }
}

function enableEdit(msgElement, originalText) {
  const textarea = document.createElement("textarea");
  textarea.value = originalText;
  textarea.rows = 6;
  textarea.style.width = "100%";
  textarea.style.marginTop = "10px";

  const tagPanel = document.createElement("div");
  tagPanel.className = "tag-panel";
  tagPanel.innerHTML = document.querySelector(".tag-panel-template").innerHTML;

  const saveBtn = document.createElement("button");
  saveBtn.innerText = "💾 Zapisz";
  saveBtn.onclick = () => {
    const selectedTags = [
      "tag-location",
      "tag-character",
      "tag-action",
      "tag-nsfw",
      "tag-emotion",
    ]
      .map((id) => tagPanel.querySelector(`#${id}`)?.value.trim())
      .filter(Boolean);
    submitEdit(textarea.value, selectedTags, msgElement);
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "❌ Anuluj";
  cancelBtn.onclick = () => {
    msgElement.innerHTML = "";
    msgElement.innerText = originalText;

    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️ Edytuj";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = () => enableEdit(msgElement, originalText);
    msgElement.appendChild(editBtn);
  };

  // Obsługa dynamicznego podglądu obrazków
  [
    "tag-location",
    "tag-character",
    "tag-action",
    "tag-nsfw",
    "tag-emotion",
  ].forEach((id) => {
    const input = tagPanel.querySelector(`#${id}`);
    if (input) {
      input.addEventListener("input", () => {
        const selectedTags = [
          "tag-location",
          "tag-character",
          "tag-action",
          "tag-nsfw",
          "tag-emotion",
        ]
          .map((id) => tagPanel.querySelector(`#${id}`)?.value.trim())
          .filter(Boolean);
        findMatchingImage(selectedTags);
      });
    }
  });

  msgElement.innerHTML = "";
  msgElement.appendChild(textarea);
  msgElement.appendChild(tagPanel);
  msgElement.appendChild(saveBtn);
  msgElement.appendChild(cancelBtn);

  tagPanel.querySelectorAll("input[type='radio']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const allIMGs = tagPanel.querySelectorAll("img");
      allIMGs.forEach((img) => img.removeAttribute("style"));
      const selectedIMG = tagPanel.querySelector(
        `label[for='${radio.id}'] img`
      );
      console.log(selectedIMG);
      if (selectedIMG) {
        selectedIMG.style.border = "2px solid #49c28f";
      }
    });
  });
}

function updateImagePreview() {
  const selectedTags = Array.from(
    document.querySelectorAll("input[type='checkbox']:checked")
  ).map((cb) => cb.value);
  const preview = document.getElementById("image-preview");

  // Przykładowa mapa obrazków
  const imageMap = {
    forest_joy: "/static/NarrativeIMG/1.png",
    castle_sadness: "/static/NarrativeIMG/2.jpeg",
    forest_intimacy: "/static/NarrativeIMG/3.gif",
  };

  const key = selectedTags.join("_");
  const imageUrl = imageMap[key] || "basic-preset-image.jpg";

  preview.innerHTML = `<img src="${imageUrl}" width="400" style="border-radius:8px;">`;
}

const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function findMatchingImage(tags, callback) {
  const gallery = document.getElementById("image-gallery");
  gallery.innerHTML = "";

  const combinations = [];
  for (let i = tags.length; i > 0; i--) {
    combinations.push(tags.slice(0, i).join("_"));
  }

  combinations.forEach((base) => {
    imageExtensions.forEach((ext) => {
      const src = `/static/NarrativeIMG/${base}${ext}`;
      checkImageExists(src, (exists) => {
        if (exists) {
          const label = document.createElement("label");
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = "image";
          radio.style.display = "none";

          const img = document.createElement("img");
          img.src = src;
          img.onclick = () => {
            document
              .querySelectorAll(".tag-panel img")
              .forEach((i) => (i.style.border = "2px solid #00000000"));
            img.style.border = "2px solid #49c28f";
            radio.checked = true;
          };

          label.appendChild(img);
          gallery.appendChild(label);
          gallery.appendChild(radio);
        }
      });
    });
  });
}

function checkImageExists(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("HEAD", url, true);
  xhr.onload = () => callback(xhr.status !== 404);
  xhr.onerror = () => callback(false);
  xhr.send();
}

async function submitEdit(editedText, tags, msgElement) {
  try {
    const res = await fetch("/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edited: editedText, tags }),
    });

    const result = await res.json();
    alert("Poprawiona wersja zapisana!");

    // Zastąp tryb edycji aktualną wiadomością
    msgElement.innerHTML = "";

    const finalText = document.createElement("div");
    finalText.innerText = editedText;
    msgElement.appendChild(finalText);

    // Dodaj obrazek jeśli istnieje
    const combinations = [];
    for (let i = tags.length; i > 0; i--) {
      combinations.push(tags.slice(0, i).join("_"));
    }

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    let imageFound = false;

    for (const base of combinations) {
      for (const ext of imageExtensions) {
        const src = `/static/NarrativeIMG/${base}${ext}`;
        const exists = await checkImageExistsAsync(src);
        if (exists) {
          const img = document.createElement("img");
          img.src = src;
          img.width = 400;
          img.style.borderRadius = "8px";
          img.style.marginTop = "10px";
          msgElement.appendChild(img);
          imageFound = true;
          break;
        }
      }
      if (imageFound) break;
    }

    // Dodaj przycisk edycji z powrotem
    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️ Edytuj";
    editBtn.style.marginLeft = "10px";
    editBtn.onclick = () => enableEdit(msgElement, editedText);
    msgElement.appendChild(editBtn);
  } catch (err) {
    console.error("Błąd zapisu edycji:", err);
    alert("Nie udało się zapisać edycji.");
  }
}

function checkImageExistsAsync(url) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true);
    xhr.onload = () => resolve(xhr.status !== 404);
    xhr.onerror = () => resolve(false);
    xhr.send();
  });
}
