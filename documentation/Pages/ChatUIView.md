# ChatUIView

Widok głównego interfejsu czatu.
Odpowiada za:
 - Obsługę formularza promptu (wysyłanie wiadomości użytkownika)
 - Renderowanie wiadomości użytkownika i AI
 - Wyświetlanie stanu ładowania odpowiedzi AI
 - Hydratację wiadomości AI danymi z backendu
 - Obsługę przycisku edycji i panelu ocen
 - Aktualizację treści wiadomości po edycji
## Zasady:
- ✅ Dozwolone:
  - Manipulacja DOM w obrębie kontenera czatu
  - Obsługa zdarzeń UI (submit, ctrl+enter, kliknięcia)
  - Integracja z `UserManager`, `SenderRegistry`, `ChatRatingView`
- ❌ Niedozwolone:
  - Logika backendowa (wysyłanie żądań HTTP)
  - Walidacja treści (poza prostym sprawdzeniem pustego promptu)

---

## constructor

**_@param_** *`{HTMLElement}`* _**container**_  Kontener wiadomości czatu

**_@param_** *`{HTMLFormElement}`* _**promptForm**_  Formularz promptu

**_@param_** *`{HTMLInputElement|HTMLTextAreaElement}`* _**promptInput**_  Pole wprowadzania promptu

```javascript
  constructor(container, promptForm, promptInput) {
    this.container = container;
    this.promptForm = promptForm;
    this.promptInput = promptInput;

    /** @type {(prompt: string)=>void} */
    this.onPromptSubmit = null;

    /** @type {(msgEl: HTMLElement, originalText: string, id: number, timestamp: string, sessionId: string)=>void} */
    this.onEditRequested = null;

    /** @type {(payload: object)=>void} */
    this.onRatingSubmit = null;
  }
```

---

    this.onPromptSubmit = null;


---

## init()

    this.onRatingSubmit = null;
  }

  /**
Podpina obsługę formularza i skrótu Ctrl+Enter.

```javascript
  init() {
    this.promptForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = this.promptInput.value.trim();
      if (!t) return;
      const accepted = await this.onPromptSubmit?.(t);
      if (accepted) {
        this.promptInput.value = "";
      }
    });

    this.promptInput.addEventListener("keydown", async (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        const t = this.promptInput.value.trim();
        if (!t) return;
        const accepted = await this.onPromptSubmit?.(t);
        if (accepted) {
          this.promptInput.value = "";
        }
      }
    });
  }
```

---

## addUserMessage()

Dodaje wiadomość użytkownika do czatu.

**_@param_** *`{string}`* _**text**_  Treść wiadomości

```javascript
  addUserMessage(text) {
    const el = document.createElement("div");
    el.className = "message user";
    el.innerHTML = `<span class="message-text">${UserManager.replacePlaceholders(
      text
    )}</span>`;
    this.container.appendChild(el);
    this.scrollToBottom();
  }
```

---

## addLoadingMessage()

Dodaje placeholder ładowania odpowiedzi AI.

**@returns** *`{{msgEl: HTMLElement, timer: number}`*  } - Element wiadomości i ID timera

```javascript
  addLoadingMessage() {
    const msgEl = document.createElement("article");
    msgEl.className = "message ai";
    msgEl.setAttribute("role", "article");

    msgEl.innerHTML = `
      <div class="msg-content msg-ai-loading">
        <div class="msg-text"><p>⏳ Generowanie odpowiedzi... (0s)</p></div>
      </div>
    `.trim();

    this.container.appendChild(msgEl);
    this.scrollToBottom();

    const timerP = msgEl.querySelector(".msg-ai-loading p");
    let seconds = 0;
    const timer = setInterval(() => {
      if (timerP) {
        timerP.textContent = `⏳ Generowanie odpowiedzi... (${++seconds}s)`;
      }
    }, 1000);

    return { msgEl, timer };
  }
```

---

## hydrateAIMessage()

Renderuje wiadomość AI z danymi.
@param {boolean} [isEdited=false] - Czy wiadomość jest edytowana

**_@param_** *`{HTMLElement}`* _**msgEl**_  Element wiadomości

**_@param_** *`{object}`* _**data**_  Dane wiadomości

```javascript
  hydrateAIMessage(msgEl, data, isEdited = false) {
    msgEl.classList.add("msg-fading-out");

    const sessionId = data.sessionId || "sess-unknown";
    const senderId = data.senderId || data.sender || "sender-unknown";

    if (data.id) {
      msgEl.dataset.msgId = data.id;
    } else {
      const messageNum = data.messageNumber || Date.now();
      msgEl.dataset.msgId = `${sessionId}_${senderId}_${messageNum}`;
    }

    msgEl.dataset.sessionId = sessionId;
    msgEl.dataset.tags = Array.isArray(data.tags)
      ? data.tags.join("_")
      : data.tags || "";
    msgEl.dataset.timestamp = data.timestamp || "";
    msgEl.dataset.originalText = data.originalText ?? data.text;
    msgEl.dataset.sender = data.sender || "AI";
    msgEl.dataset.avatarUrl =
      data.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png";
    msgEl.dataset.generation_time = String(
      Number.isFinite(data.generation_time) ? data.generation_time : 0
    );
    msgEl.dataset.imageUrl = data.imageUrl || "";

    const renderedText = UserManager.replacePlaceholders(data.text);
    const tagList = Array.isArray(data.tags)
      ? data.tags
      : (data.tags || "").split("_").filter(Boolean);

    msgEl.innerHTML = `
      <header class="msg-header ${SenderRegistry.getClass(
        msgEl.dataset.sender
      )}">
        <div class="avatar-sender">
          <img src="${msgEl.dataset.avatarUrl}" alt="${
      msgEl.dataset.sender
    } Avatar">
          <strong>${msgEl.dataset.sender}</strong>
        </div>
      </header>
      <section class="msg-content">
        <div class="msg-text">
          <p ${isEdited ? 'class="edited"' : ""}>${renderedText}</p>
          ${
            msgEl.dataset.imageUrl
              ? `<img src="${msgEl.dataset.imageUrl}" alt="${tagList.join(
                  " "
                )}">`
              : ""
          }
        </div>
      </section>
      <footer class="msg-footer">
        <time class="ai-msg-time" datetime="${msgEl.dataset.timestamp}">
          ⏱️ ${msgEl.dataset.generation_time}s | 🗓️ ${msgEl.dataset.timestamp}
        </time>
      </footer>
    `.trim();

    if (AppStorageManager.getWithTTL("editingMode") === "1") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "form-element button-base msg-edit-btn";
      btn.textContent = "✏️ Edytuj";
      btn.addEventListener("click", () =>
        this.onEditRequested?.(
          msgEl,
          msgEl.dataset.originalText,
          msgEl.dataset.msgId,
          msgEl.dataset.timestamp,
          msgEl.dataset.sessionId
        )
      );
      msgEl.querySelector(".msg-footer").appendChild(btn);
    }

    if (AppStorageManager.getWithTTL("ratingMode") === "1") {
      new ChatRatingView(msgEl, (payload) => this.onRatingSubmit?.(payload));
    }

    msgEl.classList.remove("msg-fading-out");
    msgEl.classList.add("msg-fading-in");
    this.scrollToBottom();
  }
```

---

## showError()

Pokazuje komunikat błędu w wiadomości AI.

**_@param_** *`{HTMLElement}`* _**msgEl**_  Element wiadomości

```javascript
  showError(msgEl) {
    msgEl.innerHTML = `<span class="message-text">❌ Błąd generowania odpowiedzi.</span>`;
    this.scrollToBottom();
  }
```

---

## scrollToBottom()

Przewija czat na dół.

```javascript
  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }
```

---

## updateMessage()

Aktualizuje treść wiadomości po edycji.
@param {string[]} [tags=[]] - Lista tagów powiązanych z wiadomością
@param {string} [imageUrl=""] - URL ilustracji powiązanej z wiadomością

**_@param_** *`{HTMLElement}`* _**msgEl**_  Element wiadomości do zaktualizowania

**_@param_** *`{string}`* _**editedText**_  Nowa treść wiadomości

```javascript
  updateMessage(msgEl, editedText, tags = [], imageUrl = "") {
    // Zaktualizuj tekst w elemencie <p>
    const p = msgEl.querySelector("section.msg-content .msg-text p");
    if (p) p.textContent = UserManager.replacePlaceholders(editedText);

    // Zaktualizuj dataset
    msgEl.dataset.tags = tags.join("_");
    msgEl.dataset.imageUrl = imageUrl;

    // Znajdź kontener tekstu
    const textDiv = msgEl.querySelector("section.msg-content .msg-text");
    if (!textDiv) return;

    // Obsługa obrazka
    let img = textDiv.querySelector("img");

    if (imageUrl) {
      if (!img) {
        img = document.createElement("img");
        textDiv.appendChild(img);
      }
      img.src = imageUrl;
      img.alt = tags.join(" ");
    } else if (img) {
      img.remove();
    }
  }
```

---

## Pełny kod klasy

```javascript
class ChatUIView {
  constructor(container, promptForm, promptInput) {
    this.container = container;
    this.promptForm = promptForm;
    this.promptInput = promptInput;

    this.onPromptSubmit = null;

    this.onEditRequested = null;

    this.onRatingSubmit = null;
  }

  init() {
    this.promptForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = this.promptInput.value.trim();
      if (!t) return;
      const accepted = await this.onPromptSubmit?.(t);
      if (accepted) {
        this.promptInput.value = "";
      }
    });

    this.promptInput.addEventListener("keydown", async (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        const t = this.promptInput.value.trim();
        if (!t) return;
        const accepted = await this.onPromptSubmit?.(t);
        if (accepted) {
          this.promptInput.value = "";
        }
      }
    });
  }

  addUserMessage(text) {
    const el = document.createElement("div");
    el.className = "message user";
    el.innerHTML = `<span class="message-text">${UserManager.replacePlaceholders(
      text
    )}</span>`;
    this.container.appendChild(el);
    this.scrollToBottom();
  }

  addLoadingMessage() {
    const msgEl = document.createElement("article");
    msgEl.className = "message ai";
    msgEl.setAttribute("role", "article");

    msgEl.innerHTML = `
      <div class="msg-content msg-ai-loading">
        <div class="msg-text"><p>⏳ Generowanie odpowiedzi... (0s)</p></div>
      </div>
    `.trim();

    this.container.appendChild(msgEl);
    this.scrollToBottom();

    const timerP = msgEl.querySelector(".msg-ai-loading p");
    let seconds = 0;
    const timer = setInterval(() => {
      if (timerP) {
        timerP.textContent = `⏳ Generowanie odpowiedzi... (${++seconds}s)`;
      }
    }, 1000);

    return { msgEl, timer };
  }

  hydrateAIMessage(msgEl, data, isEdited = false) {
    msgEl.classList.add("msg-fading-out");

    const sessionId = data.sessionId || "sess-unknown";
    const senderId = data.senderId || data.sender || "sender-unknown";

    if (data.id) {
      msgEl.dataset.msgId = data.id;
    } else {
      const messageNum = data.messageNumber || Date.now();
      msgEl.dataset.msgId = `${sessionId}_${senderId}_${messageNum}`;
    }

    msgEl.dataset.sessionId = sessionId;
    msgEl.dataset.tags = Array.isArray(data.tags)
      ? data.tags.join("_")
      : data.tags || "";
    msgEl.dataset.timestamp = data.timestamp || "";
    msgEl.dataset.originalText = data.originalText ?? data.text;
    msgEl.dataset.sender = data.sender || "AI";
    msgEl.dataset.avatarUrl =
      data.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png";
    msgEl.dataset.generation_time = String(
      Number.isFinite(data.generation_time) ? data.generation_time : 0
    );
    msgEl.dataset.imageUrl = data.imageUrl || "";

    const renderedText = UserManager.replacePlaceholders(data.text);
    const tagList = Array.isArray(data.tags)
      ? data.tags
      : (data.tags || "").split("_").filter(Boolean);

    msgEl.innerHTML = `
      <header class="msg-header ${SenderRegistry.getClass(
        msgEl.dataset.sender
      )}">
        <div class="avatar-sender">
          <img src="${msgEl.dataset.avatarUrl}" alt="${
      msgEl.dataset.sender
    } Avatar">
          <strong>${msgEl.dataset.sender}</strong>
        </div>
      </header>
      <section class="msg-content">
        <div class="msg-text">
          <p ${isEdited ? 'class="edited"' : ""}>${renderedText}</p>
          ${
            msgEl.dataset.imageUrl
              ? `<img src="${msgEl.dataset.imageUrl}" alt="${tagList.join(
                  " "
                )}">`
              : ""
          }
        </div>
      </section>
      <footer class="msg-footer">
        <time class="ai-msg-time" datetime="${msgEl.dataset.timestamp}">
          ⏱️ ${msgEl.dataset.generation_time}s | 🗓️ ${msgEl.dataset.timestamp}
        </time>
      </footer>
    `.trim();

    if (AppStorageManager.getWithTTL("editingMode") === "1") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "form-element button-base msg-edit-btn";
      btn.textContent = "✏️ Edytuj";
      btn.addEventListener("click", () =>
        this.onEditRequested?.(
          msgEl,
          msgEl.dataset.originalText,
          msgEl.dataset.msgId,
          msgEl.dataset.timestamp,
          msgEl.dataset.sessionId
        )
      );
      msgEl.querySelector(".msg-footer").appendChild(btn);
    }

    if (AppStorageManager.getWithTTL("ratingMode") === "1") {
      new ChatRatingView(msgEl, (payload) => this.onRatingSubmit?.(payload));
    }

    msgEl.classList.remove("msg-fading-out");
    msgEl.classList.add("msg-fading-in");
    this.scrollToBottom();
  }

  showError(msgEl) {
    msgEl.innerHTML = `<span class="message-text">❌ Błąd generowania odpowiedzi.</span>`;
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  updateMessage(msgEl, editedText, tags = [], imageUrl = "") {
    const p = msgEl.querySelector("section.msg-content .msg-text p");
    if (p) p.textContent = UserManager.replacePlaceholders(editedText);

    msgEl.dataset.tags = tags.join("_");
    msgEl.dataset.imageUrl = imageUrl;

    const textDiv = msgEl.querySelector("section.msg-content .msg-text");
    if (!textDiv) return;

    let img = textDiv.querySelector("img");

    if (imageUrl) {
      if (!img) {
        img = document.createElement("img");
        textDiv.appendChild(img);
      }
      img.src = imageUrl;
      img.alt = tags.join(" ");
    } else if (img) {
      img.remove();
    }
  }
}
```