```js
// 📦 LoggerService.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `LoggerService` działa jako buforowany logger z historią
 * - ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
 * - ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
 *
 * LoggerService
 * =============
 * Centralny logger aplikacji:
 * - Buforuje wpisy z poziomem i timestampem
 * - Czyści wpisy starsze niż 5 minut
 * - Pozwala pobrać historię i ją wyczyścić
 */

class LoggerService {
  /** Bufor wpisów logowania */
  static buffer = [];
  /** Maksymalny wiek wpisów w ms (domyślnie 5 minut) */
  static maxAgeMs = 5 * 60 * 1000;

  /**
   * Dodaje wpis do bufora i loguje do konsoli.
   * @param {'log'|'warn'|'error'} level - Poziom logowania.
   * @param {string} msg - Treść komunikatu.
   * @param {any[]} [args] - Dodatkowe dane.
   */
  static record(level, msg, ...args) {
    const timestamp = Date.now();
    this.buffer.push({ timestamp, level, msg, args });
    this.cleanup();
    // Wciąż wyświetlamy w konsoli, ale przez LoggerService
    console[level](
      `[${new Date(timestamp).toLocaleTimeString()}] ${msg}`,
      ...args
    );
  }

  /** Usuwa wpisy starsze niż `maxAgeMs`. */
  static cleanup() {
    const cutoff = Date.now() - this.maxAgeMs;
    this.buffer = this.buffer.filter((e) => e.timestamp >= cutoff);
  }

/**
 * Zwraca historię logów z bufora.
 * @param {Object} [options]
 * @param {boolean} [options.clone=false] - Czy zwrócić głęboką kopię wpisów.
 * @returns {Array<{timestamp:number, level:string, msg:string, args:any[]}>}
 */
static getHistory({ clone = false } = {}) {
  this.cleanup();
  if (!clone) return [...this.buffer];

  return this.buffer.map(entry => ({
    timestamp: entry.timestamp,
    level: entry.level,
    msg: entry.msg,
    args: Array.isArray(entry.args) ? [...entry.args] : [],
  }));
}


  /** Czyści cały bufor logów. */
  static clearHistory() {
    this.buffer = [];
  }
}


// 📦 Diagnostics.js
class Diagnostics {
  static tests = [];

  static register(name, fn, group = "default") {
    this.tests.push({ name, fn, group });
  }

  static async runAll() {
    const grouped = {};
    for (const { name, fn, group } of this.tests) {
      const result = await this.captureError(fn, name);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(result);
    }

    for (const [groupName, results] of Object.entries(grouped)) {
      console.groupCollapsed(`🧪 [${groupName}]`);
      console.table(
        results.map((r) => ({
          Status: r.status,
          Test: r.name,
          Błąd: r.error || "—"
        }))
      );
      console.groupEnd();
    }
  }

  static async runGroup(groupName) {
    const results = [];
    for (const { name, fn, group } of this.tests) {
      if (group === groupName) {
        const result = await this.captureError(fn, name);
        results.push(result);
      }
    }

    if (results.length === 0) {
      console.warn(`🧪 Brak testów w grupie: ${groupName}`);
      return;
    }

    console.group(`🧪 Wyniki grupy: ${groupName}`);
    console.table(
      results.map((r) => ({
        Status: r.status,
        Test: r.name,
        Błąd: r.error || "—"
      }))
    );
    console.groupEnd();
  }

  static async captureError(fn, name) {
    try {
      await fn();
      return { status: "✅", name, error: "" };
    } catch (e) {
      return { status: "❌", name, error: e.message || String(e) };
    }
  }

  static assertEqual(a, b) {
    if (a !== b) throw new Error(`Oczekiwano ${b}, otrzymano ${a}`);
  }

  static assertType(value, type) {
    if (typeof value !== type) throw new Error(`Typ ${typeof value}, oczekiwano ${type}`);
  }

    /**
   * Zwraca Promise, który rozwiązuje się po określonym czasie.
   * Przydatne do testów asynchronicznych.
   *
   * @param {number} ms - Liczba milisekund do odczekania.
   * @returns {Promise<void>}
   */
  static wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}


// 📦 BackendAPI.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
 * - ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
 * - ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
 * - ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
 *
 * BackendAPI
 * ==========
 * Warstwa komunikacji z backendem:
 * - Obsługuje generowanie odpowiedzi, ocenianie i edycję
 * - Wykorzystuje `fetch` z metodą POST i JSON
 */
class BackendAPI {
  /**
   * Wysyła prompt użytkownika do backendu.
   * @param {string} prompt
   * @returns {Promise<Object>}
   */
  async generate(prompt) {
    const res = await RequestRetryManager.fetchWithRetry(
      "/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      },
      3, // max 3 próby
      1000 // 1s opóźnienia
    );
    return res.json();
  }

  /**
   * Przesyła oceny odpowiedzi AI.
   * @param {Object} ratings
   * @returns {Promise<Object>}
   */
  async rate(ratings) {
    console.log("Wywołanie /rate z:", ratings);
    const res = await RequestRetryManager.fetchWithRetry(
      "/rate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratings),
      },
      3,
      1000
    );
    return res.json();
  }

  /**
   * Przesyła edytowaną odpowiedź z tagami.
   * @param {string} editedText
   * @param {Object} tags
   * @returns {Promise<Object>}
   */
  async edit(editedText, tags) {
   const res = await RequestRetryManager.fetchWithRetry(
     "/edit",
     {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ editedText, tags })
     },
     3,
     1000
   );
    return res.json();
  }

    /**
   * Przesyła wiadomość użytkownika do backendu.
   * @param {{ sender: string, text: string }} message
   * @returns {Promise<Object>}
   */
  async postMessage({ sender, text }) {
  const res = await fetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, text })
  });
  return res.json(); // → { id, sender, text, timestamp, tags? }
}

/**
 * Pobiera słownik tagów z backendu.
 * @returns {Promise<Object>} np. { "tag-location": [...], "tag-nsfw": [...] }
 */
async getTags() {
  const res = await fetch("/tags", { method: "GET", headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} przy pobieraniu /tags`);
  return res.json();
}


}


// 📦 ChatHistoryManager.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `ChatHistoryManager` buforuje historię czatu i synchronizuje ją z backendem
 * - ✅ Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
 * - ✅ Wykorzystuje `localStorage` z kontrolą świeżości cache
 * - ✅ Posiada dobrze wydzielone metody prywatne: `_loadCache()`, `_saveCache()`, `_isCacheFresh()`, `_fetchHistoryFromServer()`
 * - ✅ Możliwość dodania metod: `clearCache()`, `forceRefresh()`, `getLastMessage()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest przejrzysty i dobrze rozdzielony
 *
 * ChatHistoryManager
 * ==================
 * Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
 * - Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
 * - Chroni przed nadmiernym ruchem sieciowym
 */

class ChatHistoryManager {
  static cacheKey = "chat_session_cache";
  static cacheExpiry = 5 * 60 * 1000; // 5 min

  /**
   * Inicjalizuje sesję czatu.
   * @param {string} sessionId - Identyfikator sesji z backendu.
   */
  static async init(sessionId) {
    this.sessionId = sessionId;
    this._loadCache();
    // Jeśli cache wygasł, przeładuj z serwera
    if (!this._isCacheFresh()) {
      await this._fetchHistoryFromServer();
    }
  }

  /**
   * Pobiera historię wiadomości z cache lub backendu.
   * @returns {Promise<Object[]>} Lista wiadomości.
   */
  static async getHistory() {
    if (this._isCacheFresh()) {
      return this._history;
    }
    await this._fetchHistoryFromServer();
    return this._history;
  }

  /**
   * Dodaje wiadomość do sesji i zapisuje ją w cache.
   * @param {{ sender: string, text: string }} msg - Wiadomość do zapisania.
   * @returns {Promise<Object>} Zapisana wiadomość z backendu.
   */
  static async appendMessage(msg) {
    const res = await fetch(`/api/sessions/${this.sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    const saved = await res.json();
    this._history.push(saved);
    this._saveCache();
    return saved;
  }

  /**
   * Wczytuje historię z localStorage.
   * @private
   */
  static _loadCache() {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (raw) {
        const { timestamp, history } = JSON.parse(raw);
        this._cacheTimestamp = timestamp;
        this._history = history;
      }
    } catch {
      this._history = [];
      this._cacheTimestamp = 0;
    }
  }
  /**
   * Zapisuje historię do localStorage.
   * @private
   */
  static _saveCache() {
    this._cacheTimestamp = Date.now();
    localStorage.setItem(
      this.cacheKey,
      JSON.stringify({
        timestamp: this._cacheTimestamp,
        history: this._history,
      })
    );
  }
  /**
   * Sprawdza, czy cache jest świeży.
   * @private
   * @returns {boolean}
   */
  static _isCacheFresh() {
    return (
      this._history &&
      Date.now() - (this._cacheTimestamp || 0) < this.cacheExpiry
    );
  }
  /**
   * Pobiera historię z backendu i aktualizuje cache.
   * @private
   * @returns {Promise<void>}
   */
  static async _fetchHistoryFromServer() {
    const res = await fetch(`/api/sessions/${this.sessionId}/messages`);
    this._history = await res.json();
    this._saveCache();
  }
}


// 📦 ChatManager.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
 * - ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
 * - ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
 * - ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony
 *
 * ChatManager
 * ===========
 * Centralny kontroler logiki czatu:
 * - Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
 * - Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy
 */

class ChatManager {
  /**
   * Tworzy instancję ChatManager.
   * @param {ChatUI} chatUI - Interfejs czatu.
   * @param {BackendAPI} backendAPI - Komunikacja z backendem.
   * @param {Dom} dom - Referencje do elementów DOM.
   */
  constructor(chatUI, backendAPI, dom) {
    this.chatUI = chatUI;
    this.backendAPI = backendAPI;
    this.dom = dom;
  }

  /**
   * Wysyła prompt użytkownika i obsługuje odpowiedź AI.
   * @returns {Promise<void>}
   */
  async sendPrompt() {
    const raw = this.dom.prompt.value.trim();
    if (!raw) return;

    const userMsg = await this.backendAPI.postMessage({
      text: raw,
      sender: "user",
    });
    this.chatUI.addUserMessage(userMsg.text, userMsg.id);

    const { msgEl, timer } = this.chatUI.addLoadingMessage();
    const start = Date.now();

    try {
      const aiMsg = await this.backendAPI.generate(raw);

      if (!aiMsg || typeof aiMsg.text !== "string") {
        LoggerService.record(
          "warn",
          "[ChatManager] Brak pola text w odpowiedzi AI",
          aiMsg
        );
        this.chatUI.showError(msgEl);
        return;
      }

      clearInterval(timer);

      this.chatUI.hydrateAIMessage(msgEl, {
        id: aiMsg.id,
        sender: aiMsg.sender,
        text: aiMsg.text,
        tags: aiMsg.tags,
        duration: aiMsg.generation_time,
        avatarUrl: aiMsg.avatarUrl,
      });

      await this.backendAPI.postMessage({ ...aiMsg, sender: aiMsg.sender });
    } catch (err) {
      LoggerService.record("error", "[ChatManager] Wyjątek w generate()", err);
      this.chatUI.showError(msgEl);
    } finally {
      this.dom.prompt.disabled = false;
    }
  }
}


// 📦 ChatUI.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
 * - ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
 * - ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
 * - ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny
 *
 * ChatUI
 * ======
 * Kontroler interfejsu czatu:
 * - Renderuje wiadomości użytkownika i AI
 * - Obsługuje edycję, ocenę, błędy, ładowanie
 * - Waliduje prompt i przewija widok
 */
class ChatUI {
  /**
   * Tworzy instancję ChatUI.
   * @param {Dom} domInstance - Referencje do elementów DOM.
   * @param {EditManager} editManager - Manager edycji wiadomości.
   * @param {ChatManager} chatManager - Pośrednik komunikacji z backendem.
   */
  constructor(domInstance, editManager, chatManager) {
    this.dom = domInstance;
    this.editManager = editManager;
    this.chatManager = null; // ustawiane później przez setChatManager()
    this.attachPromptLengthWatcher();
  }

  setChatManager(chatManager) {
  this.chatManager = chatManager;
}

  /** Dodaje wiadomość użytkownika do czatu. */
  addUserMessage(text, id) {
    const msg = document.createElement("div");
    msg.classList.add("message", "user");
    msg.dataset.msgId = id;

    const txt = document.createElement("div");
    txt.className = "msg-text";

    const p = document.createElement("p");
    p.textContent = UserManager.replacePlaceholders(text);
    txt.appendChild(p);

    msg.appendChild(txt);
    this.dom.chatContainer.appendChild(msg);
    this.scrollToBottom();
  }
  /** Obserwuje długość promptu i aktywuje walidację. */
  attachPromptLengthWatcher() {
    const textarea = this.dom.prompt;
    const info = this.dom.inputArea.querySelector(".max-text-length-warning");
    const form = this.dom.inputArea;
    const errorMsgEl = this.dom.inputArea.querySelector(".prompt-error");

    if (!textarea || !info || !form || !errorMsgEl) return;

    let isDirty = false; // czy użytkownik już edytował ręcznie?

    const update = () => {
      const value = textarea.value;
      const len = value.length;
      const { valid, errors } = PromptValidator.validate(value);

      // zawsze aktualizujemy licznik i stan przycisku
      info.textContent = `${len}/${PromptValidator.maxLength} znaków`;
      info.style.color = len > PromptValidator.maxLength ? "tomato" : "";
      form.querySelector('button[type="submit"]').disabled = !valid;

      // pokazujemy błąd tylko gdy isDirty==true i prompt jest nie-valid
      errorMsgEl.textContent = isDirty && !valid ? errors[0] : "";
    };

    // Gdy użytkownik coś wpisze/usuwa – ustawiamy isDirty i odpalamy update
    textarea.addEventListener("input", (e) => {
      isDirty = true;
      update();
    });

    // Po wysłaniu promptu textarea jest czyszczone przez ChatManager
    // Resetujemy isDirty i odpalamy update() tak, żeby znikły ewentualne błędy
    form.addEventListener("submit", () => {
      setTimeout(() => {
        isDirty = false;
        update();
      }, 0);
    });

    // startowe wywołanie – isDirty == false, więc nie ma błędu, ale licznik też się zaktualizuje
    update();
  }

  /** Dodaje wiadomość AI z avatarami, tagami i przyciskiem edycji. */
  addAIMessage({ id, sender, text, tags, duration, avatarUrl, timestamp }) {
    const msg = document.createElement("div");
    msg.classList.add("message", "ai");
    msg.dataset.msgId = id;
    msg.dataset.tags = tags.join("_");
    msg.setAttribute("msg-id", id); // dla zgodności z markupem
    msg.setAttribute("role", "article");

    const time = document.createElement("span");
    time.className = "ai-msg-time";
    time.textContent = `⏱️ Czas generowania: ${duration}s`;
    msg.appendChild(time);

    const content = document.createElement("div");
    content.className = `msg-content ${SenderRegistry.getClass(sender)}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar-sender";
    avatar.innerHTML = `
    <img src="${avatarUrl}" alt="${sender} Avatar">
    <strong>${sender}</strong>
  `;

    const txt = document.createElement("div");
    txt.className = "msg-text";

    const p = document.createElement("p");
    p.innerHTML = UserManager.replacePlaceholders(text);
    txt.appendChild(p);

    if (tags.length > 0) {
      const img = document.createElement("img");
      img.src = `/static/NarrativeIMG/${tags.join("_")}.jpg`;
      img.alt = tags.join(" ");
      txt.appendChild(img);
    }

    content.append(avatar, txt);
    msg.appendChild(content);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "✏️ Edytuj";
    editBtn.addEventListener("click", () => {
      this.editManager.enableEdit(msg, text, id, timestamp);
    });
    msg.appendChild(editBtn);

    this.dom.chatContainer.appendChild(msg);
    this.scrollToBottom();
    if (this.addRatingForm) {
      this.addRatingForm(msg);
    }
  }

  /** Tworzy bazowy wrapper wiadomości. */
  _createBase(type, text, id, tags = [], duration = 0) {
    const el = document.createElement("div");
    el.classList.add("message", type);
    el.dataset.msgId = id;
    if (tags.length) el.dataset.tags = tags.join("_");
    return el;
  }

  /** Dodaje wiadomość tymczasową z animacją ładowania. */
  addLoadingMessage() {
    const msg = document.createElement("div");
    msg.classList.add("message", "ai");

    const content = document.createElement("div");
    content.className = "msg-content msg-ai-loading";

    const txt = document.createElement("div");
    txt.className = "msg-text";
    const p = document.createElement("p");
    p.textContent = "⏳ Generowanie odpowiedzi... (0s)";
    txt.appendChild(p);

    content.appendChild(txt);
    msg.appendChild(content);

    this.dom.chatContainer.appendChild(msg);
    this.scrollToBottom();

    // opcjonalnie: timer do aktualizacji czasu
    let seconds = 0;
    const timer = setInterval(() => {
      p.textContent = `⏳ Generowanie odpowiedzi... (${++seconds}s)`;
    }, 1000);

    return { msgEl: msg, timer };
  }

  /** Wyświetla komunikat błędu w wiadomości AI. */
  showError(msgEl) {
    msgEl.textContent = "❌ Błąd generowania odpowiedzi.";
    this.scrollToBottom();
  }

  /** Dodaje przycisk edycji do wiadomości. */
  addEditButton(
    msgEl,
    originalText,
    messageId = "msg-temp",
    sessionId = "session-temp"
  ) {
    const btn = Utils.createButton("✏️ Edytuj", () => {
      this.editManager.enableEdit(msgEl, originalText, messageId, sessionId);
    });
    msgEl.appendChild(btn);
  }

  /** Dodaje formularz oceny wiadomości AI. */
  addRatingForm(msgEl) {
    // jeśli już założony na tym elemencie → toggle otwarcia
    if (msgEl._ratingForm) {
      msgEl._ratingForm.toggle();
      return;
    }

   let form = null;

const handleSubmit = async (ratings) => {
  console.log("Wysyłam ocenę:", ratings);
  try {
    await this.chatManager.backendAPI.rate(ratings);
    alert("Ocena wysłana!");
  } catch (err) {
    console.error("Błąd wysyłania oceny:", err);
    alert("Błąd wysyłania oceny");
  }
  form?.close();
};

form = new RatingForm(msgEl, handleSubmit);
msgEl._ratingForm = form;

  }

  /** Przewija widok czatu do ostatniej wiadomości. */
  scrollToBottom() {
    this.dom.chatContainer.scrollTop = this.dom.chatContainer.scrollHeight;
  }

  /** Hydratuje wiadomość AI i dodaje formularz oceny. */
  hydrateAIMessage(msgEl, data) {
    this.editManager.renderAIInto(msgEl, data);
    this.addRatingForm(msgEl); // tu działa, bo jesteś w ChatUI
  }
}


// 📦 Dom.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `Dom` centralizuje dostęp do elementów interfejsu
 * - ✅ Ułatwia testowanie, refaktoryzację i spójność struktury HTML
 * - ✅ Obsługuje walidację i logowanie braków przez `LoggerService`
 * - ✅ Możliwość dodania metod: `exists()`, `refresh()`, `getAll()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
 * - 💡 Należy ją przeanalizować pod kątem działania na różnych strukturach HTML/DOM w których nie musi być zawarte nigdy np.: "#chat-container"
 *
 * Dom
 * ===
 * Centralny rejestr elementów interfejsu:
 * - Pobiera i przechowuje referencje do komponentów UI
 * - Obsługuje walidację i logowanie braków
 */
class Dom {
 /**
   * Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.
   */
  constructor() {
    /** @type {HTMLElement} Główny wrapper aplikacji */
    this.app = this.q("#app");

    /** @type {HTMLElement} Kontener historii czatu */
    this.chatWrapper = this.q("#chat-wrapper");

    /** @type {HTMLElement} Scrollowalny obszar wiadomości */
    this.chatContainer = this.q("#chat-container");

    /** @type {HTMLFormElement} Formularz wysyłania wiadomości */
    this.inputArea = this.q("#input-area");

    /** @type {HTMLTextAreaElement} Pole tekstowe wiadomości */
    this.prompt = this.q("#prompt");

    /** @type {HTMLButtonElement} Przycisk otwierający panel nawigacyjny */
    this.burgerToggle = this.q("#burger-toggle");

    /** @type {HTMLElement} Panel boczny z linkami */
    this.webSidePanel = this.q("#web-side-panel");

    /** @type {HTMLButtonElement} Przycisk otwierający panel ustawień */
    this.settingsToggle = this.q("#settings-toggle");

    /** @type {HTMLElement} Panel boczny z ustawieniami */
    this.settingSidePanel = this.q("#setting-side-panel");

    /** @type {HTMLTemplateElement} Szablon panelu tagów */
    this.tagPanelTemplate = this.q("#tag-panel-template");
  }

  /**
   * Pobiera pierwszy element pasujący do selektora CSS.
   * @param {string} selector - Selektor CSS.
   * @returns {HTMLElement|null} Element lub null.
   */
  q(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      LoggerService.record("warn", `[Dom] Nie znaleziono elementu dla selektora: ${selector}`);
    }
    return el;
  }

  /**
   * Pobiera wszystkie elementy pasujące do selektora CSS.
   * @param {string} selector - Selektor CSS.
   * @returns {NodeListOf<HTMLElement>} Lista elementów.
   */
  qa(selector) {
    return document.querySelectorAll(selector);
  }
}


// 📦 EditManager.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `EditManager` obsługuje pełny proces edycji wiadomości AI w interfejsie czatu
 * - ✅ Integruje się z `Dom`, `BackendAPI`, `LoggerService`, `GalleryLoader`, `TagsPanel`, `EditValidator`, `Utils`
 * - ✅ Obsługuje tryb edycji, walidację, zapis, anulowanie i renderowanie wiadomości
 * - ✅ Możliwość dodania metod: `disableEdit()`, `setSessionId()`, `validateBeforeSubmit()`
 * - ⚠️ Mapowanie tagów na kategorie powinno być oparte o dane JSON z backendu (np. `tag-location`, `tag-character`, ...)
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
 *
 * EditManager
 * ===========
 * Kontroler procesu edycji wiadomości AI:
 * - Renderuje edytor, tagi, galerię
 * - Waliduje dane i wysyła do backendu
 * - Renderuje zaktualizowaną wiadomość
 */

class EditManager {
  /**
   * Tworzy instancję EditManager.
   * @param {Dom} dom - Referencje do elementów DOM.
   * @param {BackendAPI} backendAPI - Interfejs komunikacji z backendem.
   * @param {LoggerService} logger - Logger aplikacji.
   */
  constructor(dom, backendAPI, logger) {
    this.dom = dom;
    this.backendAPI = backendAPI;
    this.logger = logger;
  }
  /**
   * Włącza tryb edycji dla wiadomości AI.
   * @param {HTMLElement} msgElement - Element wiadomości.
   * @param {string} originalText - Oryginalna treść wiadomości.
   * @param {string} messageId - ID wiadomości.
   * @param {string} sessionId - ID sesji.
   */
  async enableEdit(msgElement, originalText, messageId, sessionId) {
    const existingDataTags = (msgElement.dataset.tags || "").trim(); // np. "cave_kissing"

    msgElement.innerHTML = "";

    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.rows = 6;
    textarea.className = "form-element textarea-base w-full fix-w-full mt-10";

    const tagPanel = document.createElement("div");
    tagPanel.className = "tag-panel";
    msgElement.appendChild(textarea);
    msgElement.appendChild(tagPanel);
    const tagsPanel = new TagsPanel(tagPanel);
    const galleryLoader = new GalleryLoader(tagPanel);

    // 1) Pobierz słownik tagów z backendu przez BackendAPI
    let tagOptions = null;
    try {
      tagOptions = await this.backendAPI.getTags();
    } catch (err) {
      this.logger?.record?.(
        "error",
        "[EditManager] Nie udało się pobrać /api/tags",
        err
      );
      // fallback — zostanie to, co buildTagFields() domyślnie utworzył
    }

    // 2) Jeśli mamy tagOptions z backendu — przebuduj pola i ustaw domyślne z data-tags
    if (tagOptions) {
      tagsPanel.setTagOptions(tagOptions);
      tagsPanel.applyDefaultsFromDataTags(existingDataTags, tagOptions);
    } else {
      // fallback: jeśli nie udało się pobrać, spróbuj ustawić domyślne na bazie istniejącego markup’u
      if (existingDataTags) {
        const tokens = existingDataTags.split("_").filter(Boolean);
        const setIfExists = (id, val) => {
          const el = tagPanel.querySelector(`#tag-${id}`);
          if (el) el.value = val;
        };
        // heurystyka bez słownika backendowego (ostatnia deska ratunku)
        // nic nie zgadujemy „kategorii”, jedynie rozkładamy po kolei
        const order = ["location", "character", "action", "nsfw", "emotion"];
        tokens
          .slice(0, order.length)
          .forEach((tok, idx) => setIfExists(order[idx], tok));
      }
    }

    let bootstrapping = true;
    tagsPanel.init(() => {
      if (bootstrapping) return;
      galleryLoader.renderFromTags(tagsPanel.getTagList());
    });

    // startowa galeria na bazie obecnych wartości
    galleryLoader.renderFromTags(tagsPanel.getTagList());
    bootstrapping = false;

    const saveBtn = Utils.createButton("💾 Zapisz", async () => {
      const tags = this.getSelectedTags(tagPanel);

       // 🔹 TU ustawiamy data-tags na elemencie wiadomości
  msgElement.dataset.tags = tags.join("_");

      const selectedImage = tagPanel.querySelector(
        "input[name='image']:checked"
      )?.value;
      const { valid, errors } = EditValidator.validate(textarea.value, tags);
      if (!valid) {
        alert(`Błąd edycji: ${errors.join("\n")}`);
        return;
      }
    
      await this.submitEdit({
        editedText: textarea.value,
        tags,
        imageUrl: selectedImage,
        msgElement,
        originalText,
        messageId,
        sessionId,
      });
    });
    saveBtn.classList.add("button-base");

    const cancelBtn = Utils.createButton("❌ Anuluj", () => {
      this.renderAIInto(msgElement, {
        id: messageId,
        sender: msgElement._snapshot?.sender || "AI",
        text: originalText,
        tags: (existingDataTags || "").split("_").filter(Boolean),
        duration: msgElement._snapshot?.duration || "0",
        avatarUrl:
          msgElement._snapshot?.avatarUrl ||
          "/static/NarrativeIMG/Avatars/AI.png",
      });
    });
    cancelBtn.classList.add("button-base");

    msgElement.appendChild(saveBtn);
    msgElement.appendChild(cancelBtn);
  }

  /**
   * Wysyła edytowaną wiadomość do backendu i renderuje ją.
   * @param {Object} params - Parametry edycji.
   */
  async submitEdit(params) {
    const updated = await this.backendAPI.edit({
      editedText: params.editedText,
      tags: params.tags,
      imageUrl: params.imageUrl,
      messageId: params.messageId,
      sessionId: params.sessionId,
    });


    const targetEl = params.msgElement;
    await this.renderAIInto(targetEl, {
      id: updated.id || targetEl.dataset.msgId || "msg-temp",
      sender: updated.sender || (targetEl._snapshot?.sender ?? "AI"),
      text: String(updated.text.editedText || ""),
      tags: updated.text.tags || [],
      duration:
        targetEl._snapshot?.timeText?.match(/(\d+(?:\.\d+)?)s/)?.[1] || "0",
      avatarUrl:
        updated.avatarUrl ||
        (targetEl._snapshot?.avatarUrl ??
          "/static/NarrativeIMG/Avatars/AI.png"),
      imageUrl: params.imageUrl,
    });
  }
  /**
   * Renderuje wiadomość AI do DOM.
   * @param {HTMLElement} msgElement - Element wiadomości.
   * @param {Object} data - Dane wiadomości.
   */
  async renderAIInto(
    msgElement,
    { id, sender, text, tags = [], duration = "0", avatarUrl, imageUrl }
  ) {
    
    msgElement.className = "message ai";
    msgElement.dataset.msgId = id;
    msgElement.dataset.tags = tags.join("_");
    msgElement.setAttribute("msg-id", id);
    msgElement.setAttribute("role", "article");
    msgElement.innerHTML = "";

    const time = document.createElement("span");
    time.className = "ai-msg-time";
    time.textContent = `⏱️ Czas generowania: ${duration}s`;
    msgElement.appendChild(time);
    
    const content = document.createElement("div");
    content.className = `msg-content ${SenderRegistry.getClass(sender)}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar-sender";
    avatar.innerHTML = `<img src="${avatarUrl}" alt="${sender} Avatar"><strong>${sender}</strong>`;

    const txt = document.createElement("div");
    txt.className = "msg-text";
    const p = document.createElement("p");
    p.innerHTML = UserManager.replacePlaceholders(text);
    txt.appendChild(p);

    
    let finalImgUrl = imageUrl;

if (!finalImgUrl && tags.length) {
  const resolved = await ImageResolver.resolve(tags, { logger: this.logger });
  finalImgUrl = resolved[0] || null;
}



      
    if (finalImgUrl) {
      const img = document.createElement("img");
      img.src = finalImgUrl;
      img.alt = tags.join(" ") || "illustration";
      txt.appendChild(img);
    }

    content.append(avatar, txt);
    msgElement.appendChild(content);

    const editBtn = Utils.createButton("✏️ Edytuj", () => {
      this.enableEdit(msgElement, text, id, "session-temp");  
    });
    editBtn.classList.add("button-base");
    msgElement.appendChild(editBtn);
  }



  /**
   * Pobiera wybrane tagi z panelu.
   * @param {HTMLElement} tagPanel - Panel tagów.
   * @returns {string[]} Lista tagów.
   */
getSelectedTags(tagPanel) {
 const selectedImage = tagPanel.querySelector('input[name="gallery-choice"]:checked')?.value;

if (selectedImage) {
  // Wyciągnij tylko nazwę pliku z pełnej ścieżki
  const fileName = selectedImage.split("/").pop(); // "forest_Hestia.png"

  let baseName = fileName;
  for (const ext of ImageResolver.extensions) {
    if (baseName.toLowerCase().endsWith(ext)) {
      baseName = baseName.slice(0, -ext.length);
      break;
    }
  }

  return baseName.split("_").filter(Boolean); // ["forest", "Hestia"]
}

}



  /**
   * Renderuje obrazy na podstawie tagów.
   * @param {HTMLElement} tagPanel - Panel tagów.
   */
  async renderImages(tagPanel) {
    const tags = this.getSelectedTags(tagPanel);
    const urls = await ImageResolver.resolve(tags, { logger: this.logger });
    const galleryLoader = new GalleryLoader(tagPanel);
    
    galleryLoader.renderImages(urls);
  }
}


// 📦 EditValidator.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
 * - ✅ Zwraca wynik walidacji i listę błędów
 * - ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
 *
 * EditValidator
 * =============
 * Walidator treści edytowanej wiadomości i tagów:
 * - Tekst nie może być pusty ani za długi
 * - Tagi nie mogą przekraczać limitu znaków
 */

class EditValidator {
   /** Maksymalna długość tekstu */
  static maxTextLength = 500;
   /** Maksymalna długość pojedynczego tagu */
  static maxTagLength = 300;

  /**
   * Waliduje tekst i tagi.
   * @param {string} text - Treść wiadomości.
   * @param {string[]} tags - Lista tagów.
   * @returns {{ valid: boolean, errors: string[] }} Wynik walidacji.
   */
  static validate(text, tags) {
    const errors = [];
    const len = text.trim().length;

    if (len === 0) {
      errors.push('Tekst edycji nie może być pusty.');
    }
    if (len > this.maxTextLength) {
      errors.push(`Tekst edycji nie może mieć więcej niż ${this.maxTextLength} znaków (obecnie ${len}).`);
    }
    // walidacja tagów
    tags.forEach((t) => {
      if (t.length > this.maxTagLength) {
        errors.push(`Tag "${t}" jest za długi (max ${this.maxTagLength} znaków).`);
      }
    });
    // opcjonalnie: wymóg co najmniej 1 taga
    // if (tags.length === 0) {
    //   errors.push('Wybierz przynajmniej jeden tag.');
    // }

    return { valid: errors.length === 0, errors };
  }
}


// 📦 GalleryLoader.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `GalleryLoader` renderuje obrazy w galerii na podstawie tagów lub danych z API
 * - ✅ Obsługuje fallbacki, komunikaty, selekcję i błędy
 * - ✅ Integruje się z `ImageResolver`, `Utils`, `LoggerService`
 * - ⚠️ Brakuje metody `renderImages(urls)` — musi być zdefiniowana, bo jest wywoływana
 * - ✅ Możliwość dodania metod: `setLogger()`, `setGallerySelector()`, `destroy()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i czytelny
 *
 * GalleryLoader
 * =============
 * Loader obrazów do galerii:
 * - Renderuje obrazy z tagów i z API
 * - Obsługuje komunikaty, błędy, selekcję
 * - Integruje się z `ImageResolver`, `Utils`, `LoggerService`
 */

class GalleryLoader {
  /**
   * Tworzy instancję loadera.
   * @param {HTMLElement} container - Kontener zawierający `#image-gallery`.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      const actualType =
        container === null
          ? "null"
          : Array.isArray(container)
          ? "Array"
          : container?.constructor?.name || typeof container;

      throw new Error(
        `[GalleryLoader] Przekazany kontener nie jest elementem DOM. ` +
          `Otrzymano: ${actualType} → ${String(container)}`
      );
    }

    /** @type {HTMLElement|null} Element galerii obrazów */
    this.gallery = container.querySelector("#image-gallery");
  }

  /** Czyści zawartość galerii. */
  clearGallery() {
    if (this.gallery) this.gallery.innerHTML = "";
  }

  /**
   * Wyświetla komunikat w galerii.
   * @param {string} message - Tekst komunikatu.
   */
  showMessage(message) {
    if (!this.gallery) return;
    this.clearGallery();
    const msg = document.createElement("div");
    msg.classList.add("gallery-message");
    msg.textContent = message;
    this.gallery.appendChild(msg);
  }

  /**
 * Renderuje obrazy w galerii na podstawie przekazanych URLi.
 * Każdy obraz jest opakowany w `<label>` z ukrytym `input[type="radio"]`,
 * umożliwiającym wybór i podświetlenie.
 *
 * @param {string[]} urls - Lista URLi obrazów do wyświetlenia.
 */
renderImages(urls) {
  if (!this.gallery) return;
  this.clearGallery();

  urls.forEach((url, index) => {
    const wrapper = document.createElement("label");
    wrapper.classList.add("image-option");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "gallery-choice";
    input.style.display = "none";
    input.value = url;


    const img = document.createElement("img");
    img.src = url;
    img.loading = "lazy";
    img.alt = `Obraz ${index + 1}`;


    wrapper.appendChild(input);
    wrapper.appendChild(img);
    this.gallery.appendChild(wrapper);

    wrapper.addEventListener("click", () => {
      this.highlightSelected(wrapper);
    });
  });
}

  /**
   * Renderuje obrazy na podstawie tagów.
   * @param {string[]} tags - Lista tagów.
   */
  async renderFromTags(tags) {
    const gallery =
      this.gallery || this.container.querySelector("#image-gallery");
    if (!gallery) return;

    // 1) kombinacje (jak masz)
    const comboUrls = await ImageResolver.resolve(tags, {
      logger: this.logger,
    });

    // 2) fallback: pojedyncze tagi
    const singleUrls = [];
    for (const t of tags) {
      for (const ext of ImageResolver.extensions) {
        const url = `${ImageResolver.basePath}${t}${ext}`;
        // minimalizacja HEAD: sprawdzaj tylko jeśli nie ma w combo
        if (
          !comboUrls.includes(url) &&
          (await ImageResolver.checkImageExists(url))
        ) {
          singleUrls.push(url);
          break;
        }
      }
    }

    const unique = Array.from(new Set([...comboUrls, ...singleUrls]));
    this.renderImages(unique);
  }

  /**
   * Podświetla wybrany obraz.
   * @param {HTMLElement} selectedWrapper - Element `<label>` z obrazem.
   */
  highlightSelected(selectedWrapper) {
    const all = this.gallery.querySelectorAll(".image-option");
    all.forEach((el) => el.classList.remove("selected"));
    selectedWrapper.classList.add("selected");
  }

  /**
   * Pobiera dane z API i renderuje obrazy.
   * @param {string} endpoint - Ścieżka API.
   * @param {Object} params - Parametry zapytania.
   */
  async loadFromAPI(endpoint, params = {}) {
    try {
      this.showMessage("Ładowanie...");
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        this.renderImages(data);
      } else {
        this.showMessage("Brak wyników.");
      }
    } catch (err) {
      if (this.logger)
        this.logger.record(
          "error",
          "[GalleryLoader] Błąd ładowania obrazów:",
          err
        );
      this.showMessage("Błąd ładowania obrazów.");
    }
  }
}


// 📦 ImageResolver.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
 * - ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
 * - ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty
 *
 * ImageResolver
 * =============
 * Resolver obrazów na podstawie tagów:
 * - Generuje permutacje nazw
 * - Sprawdza dostępność przez cache, localStorage, HEAD
 * - Preloaduje znalezione obrazy
 */
class ImageResolver {
  /** Obsługiwane rozszerzenia plików */
  static extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  /** Ścieżka bazowa do folderu z obrazami */
  static basePath = "/static/NarrativeIMG/";
  /** Cache dostępności obrazów */
  static imageCache = new Map();
  /** Bufor zapytań w trakcie */
  static inFlight = new Map();
  /** Rejestr preloadowanych obrazów */
  static preloadRegistry = new Set();

  /**
   * Zwraca listę istniejących obrazów pasujących do tagów.
   * @param {string[]} tags - Lista tagów.
   * @param {object} options - Opcje dodatkowe.
   * @param {number} [options.maxResults=2] - Maksymalna liczba wyników.
   * @param {object} [options.logger] - Logger (opcjonalnie).
   * @returns {Promise<string[]>}
   */
  static async resolve(tags, { maxResults = 2, logger = null } = {}) {
    const exactCombo = tags.join("_");
    for (const ext of this.extensions) {
      const exactUrl = this.basePath + exactCombo + ext;
      if (await this.checkImageExists(exactUrl, logger)) {
        this.preloadImages([exactUrl]);
        return [exactUrl];
      }
    }
    const combos = this.generateCombinations(tags);
    const results = [];

    for (const combo of combos) {
      for (const ext of this.extensions) {
        const url = this.basePath + combo + ext;
        if (await this.checkImageExists(url, logger)) {
          results.push(url);
          break;
        }
      }
    }

    this.preloadImages(results);
    return results;
  }

  /**
   * Sprawdza, czy obraz istnieje.
   * @param {string} url - URL obrazu.
   * @param {object} logger - Logger (opcjonalnie).
   * @returns {Promise<boolean>}
   */
  static async checkImageExists(url, logger = null) {
    if (this.imageCache.has(url)) {
      if (this.imageCache.get(url) && logger) {
        logger.record("log", `[ImageResolver] Cache (in-memory) ✔ ${url}`);
      }
      return this.imageCache.get(url);
    }

    if (this.inFlight.has(url)) {
      if (logger) {
        logger.record("log", `[ImageResolver] Dedup in-flight HEAD: ${url}`);
      }
      return this.inFlight.get(url);
    }

    const promise = (async () => {
      const stored = localStorage.getItem(`img-exists:${url}`);
      if (stored === "true") {
        this.imageCache.set(url, true);
        if (logger) {
          logger.record("log", `[ImageResolver] Cache (localStorage) ✔ ${url}`);
        }
        return true;
      }

      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
          localStorage.setItem(`img-exists:${url}`, "true");
          this.imageCache.set(url, true);
          if (logger) {
            logger.record("log", `[ImageResolver] HEAD ✔ ${url}`);
          }
          return true;
        } else {
          this.imageCache.set(url, false);
          return false;
        }
      } catch (err) {
        this.imageCache.set(url, false);
        if (logger) {
          logger.record("error", `[ImageResolver] HEAD error ${url}`, err);
        }
        return false;
      }
    })();

    this.inFlight.set(url, promise);
    const exists = await promise;
    this.inFlight.delete(url);
    return exists;
  }

  /**
   * Preloaduje obrazy do przeglądarki.
   * @param {string[]} urls - Lista URLi do preloadu.
   */
  static preloadImages(urls) {
    urls.forEach((url) => {
      if (this.preloadRegistry.has(url)) return;
      const img = new Image();
      img.src = url;
      this.preloadRegistry.add(url);
    });
  }

  /**
   * Generuje permutacje tagów połączone znakiem '_'.
   * @param {string[]} tags - Lista tagów.
   * @returns {string[]} Lista kombinacji.
   */
  static generateCombinations(tags) {
    const results = [];

    function permute(prefix, remaining) {
      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i];
        const newPrefix = prefix.concat(next);
        results.push(newPrefix.join("_"));
        const nextRemaining = remaining
          .slice(0, i)
          .concat(remaining.slice(i + 1));
        permute(newPrefix, nextRemaining);
      }
    }

    permute([], tags);
    return results;
  }
}


// 📦 KeyboardManager.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `KeyboardManager` dba o widoczność pola `#input-area` nad klawiaturą ekranową
 * - ✅ Obsługuje `visualViewport`, `scroll`, `resize` i workaround dla Firefoksa
 * - ✅ Możliwość dodania metod: `destroy()`, `setTarget()`, `isKeyboardVisible()`, `debug()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
 *
 * KeyboardManager
 * ===============
 * Klasa odpowiedzialna za zarządzanie pozycjonowaniem interfejsu w momencie pojawienia się klawiatury ekranowej.
 * Jej głównym celem jest zapewnienie, że pole wprowadzania wiadomości (`#input-area`) pozostaje widoczne nad klawiaturą,
 * szczególnie na urządzeniach mobilnych i w przeglądarkach takich jak Firefox, które wymagają dodatkowego fixu.
 *
 * Zależności:
 * - `Dom`: klasa dostarczająca referencje do elementów DOM, w tym `inputArea`.
 * - `visualViewport`: API przeglądarki służące do wykrywania zmian w widocznej części viewportu.
 * - `navigator.userAgent`: używany do wykrycia przeglądarki Firefox i zastosowania odpowiedniego workaroundu.
 */
/**
 * KeyboardManager
 * ===============
 * Zarządza pozycją pola `#input-area` względem klawiatury ekranowej.
 * - Obsługuje `visualViewport` API
 * - Wykrywa Firefoksa i stosuje fix
 * - Integruje się z klasą `Dom`
 */
class KeyboardManager {
  /**
   * Tworzy instancję KeyboardManager.
   * @param {Dom} domInstance - Referencje do elementów DOM.
   */
  constructor(domInstance) {
    /** @type {Dom} Referencje do elementów DOM */
    this.dom = domInstance;

    /** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
    this.isFirefox = /firefox/i.test(navigator.userAgent);
  }

  /** Inicjalizuje nasłuchiwacze `resize` i `scroll`. */
  init() {
    if (!window.visualViewport) {
      LoggerService.record(
        "warn",
        "[KeyboardManager] visualViewport API niedostępne."
      );
      return;
    }

    window.visualViewport.addEventListener(
      "resize",
      this.updatePosition.bind(this)
    );
    window.visualViewport.addEventListener(
      "scroll",
      this.updatePosition.bind(this)
    );

    this.updatePosition(); // Ustawienie początkowe
  }

  /** Aktualizuje pozycję pola `input-area` nad klawiaturą. */
  updatePosition() {
    const vv = window.visualViewport;
    if (!vv || !this.dom.inputArea) return;

    const keyboardHeight = Math.max(
      0,
      window.innerHeight - (vv.height + vv.offsetTop)
    );

    this.dom.inputArea.style.bottom = keyboardHeight
      ? `${keyboardHeight}px`
      : "0px";

    if (this.isFirefox) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }
}


// 📦 PanelsController.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `PanelsController` działa jako kontroler widoczności paneli bocznych
 * - ✅ Obsługuje toggle, open, close, init i zapewnia wyłączność paneli
 * - ✅ Możliwość dodania metod: `addPanel()`, `isPanelOpen()`, `getOpenPanel()`, `destroy()`
 * - 💡 Na mobile: tylko jeden panel może być otwarty jednocześnie, wszystkie są domyślnie zamknięte po odświeżeniu
 * - 💡 Na desktopie: panele nie zasłaniają treści, więc mogą być otwarte równolegle
 * - 💡 Panel `setting-side-panel` powinien być otwarty lub zamknięty zależnie od ciasteczka — użytkownik decyduje
 * - 💡 Warto dodać stałą `cookiePanels = ['setting-side-panel']` i obsłużyć ich stan przy `init()` 
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
 *
 * PanelsController
 * ================
 * Kontroler widoczności paneli bocznych aplikacji:
 * - Obsługuje otwieranie, zamykanie i przełączanie paneli
 * - Zapewnia, że tylko jeden panel może być otwarty
 * - Integruje się z klasą `Dom` i `Utils`
 */

class PanelsController {
  /**
   * Tworzy instancję kontrolera paneli.
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    /** @type {Dom} Referencje do elementów DOM */
    this.dom = domInstance;

    /**
     * @type {Array<{button: HTMLElement, panel: HTMLElement}>}
     * Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
     */
    this.panels = [
      { button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
      { button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
    ];
  }

  /** Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli. */
  init() {
    this.panels.forEach(({ button, panel }) => {
      if (!Utils.isMobile() && panel.classList.contains("setting-panel")) {
        this.openPanel(panel); // na desktopie panel ustawień otwarty
      }
      if (!button || !panel) return;
      button.addEventListener("click", () => this.togglePanel(panel));
    });
  }

  /**
   * Otwiera wskazany panel i zamyka pozostałe.
   * @param {HTMLElement} panel - Panel do otwarcia.
   */
  openPanel(panel) {
    this.closeAllPanels();
    panel.classList.add("open");
  }

  /**
   * Zamyka wskazany panel.
   * @param {HTMLElement} panel - Panel do zamknięcia.
   */
  closePanel(panel) {
    panel.classList.remove("open");
  }

  /**
   * Przełącza stan panelu.
   * @param {HTMLElement} panel - Panel do przełączenia.
   */
  togglePanel(panel) {
    const isOpen = panel.classList.contains("open");
    if (isOpen) {
      this.closePanel(panel);
    } else {
      this.openPanel(panel);
    }
  }

  /** Zamyka wszystkie panele. */
  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel.classList.remove("open"));
  }
}


// 📦 PromptValidator.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `PromptValidator` działa jako walidator treści promptów
 * - ✅ Obsługuje typ, długość i niedozwolone znaki
 * - ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
 *
 * PromptValidator
 * ===============
 * Walidator treści promptów:
 * - Sprawdza typ (string)
 * - Sprawdza długość w granicach [minLength, maxLength]
 * - Sprawdza obecność niedozwolonych znaków
 */

class PromptValidator {
  /** Minimalna długość promptu */
  static minLength = 1;
  /** Maksymalna długość promptu */
  static maxLength = 300;

  /**
   * Waliduje prompt.
   * @param {string} prompt - Treść promptu do sprawdzenia.
   * @returns {{ valid: boolean, errors: string[] }} Obiekt z informacją o poprawności i listą błędów.
   */
  static validate(prompt) {
    const errors = [];

    if (typeof prompt !== "string") {
      errors.push("Prompt musi być tekstem.");
    } else {
      const len = prompt.trim().length;
      if (len < this.minLength) {
        errors.push(`Prompt nie może być pusty.`);
      }
      if (len > this.maxLength) {
        errors.push(
          `Prompt nie może mieć więcej niż ${this.maxLength} znaków (obecnie ${len}).`
        );
      }
      // przykładowy check na niedozwolone znaki:
      if (/[<>]/.test(prompt)) {
        errors.push("Prompt zawiera niedozwolone znaki: < lub >.");
      }
    }

    return { valid: errors.length === 0, errors };
  }
}


// 📦 RatingForm.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `RatingForm` działa jako komponent oceny odpowiedzi
 * - ✅ Renderuje formularz z suwakami i obsługuje interakcję
 * - ✅ Przekazuje wynik do `onSubmit`, obsługuje toggle/close/destroy
 * - ✅ Możliwość dodania metod: `setRatings()`, `isOpen()`, `validate()`, `getCriteriaKeys()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
 *
 * RatingForm
 * ==========
 * Komponent formularza oceny odpowiedzi:
 * - Renderuje formularz z suwakami dla różnych kryteriów
 * - Obsługuje interakcję i aktualizację wartości
 * - Przekazuje wynik do `onSubmit`
 * - Obsługuje toggle, close i destroy
 */
class RatingForm {
  /**
   * Tworzy formularz oceny pod podanym elementem wiadomości.
   * @param {HTMLElement} msgEl - Element wiadomości, pod którym pojawi się formularz.
   * @param {Function} onSubmit - Callback wywoływany po kliknięciu "Wyślij ocenę".
   */
  constructor(msgEl, onSubmit) {
    this.msgEl = msgEl;
    this.onSubmit = onSubmit;
    this._render();
  }

  /** Renderuje formularz w DOM */
  _render() {
    const details = document.createElement("details");
    details.className = "rating-form";
    // od razu wstaw pod message
    this.msgEl.insertAdjacentElement("afterend", details);
    this.details = details;

    const summary = document.createElement("summary");
    summary.textContent = "Oceń odpowiedź ⭐";
    details.appendChild(summary);

    const header = document.createElement("h3");
    header.textContent = "Twoja ocena:";
    details.appendChild(header);

    this.criteria = [
      { key: "Narrative", label: "Narracja" },
      { key: "Style", label: "Styl" },
      { key: "Logic", label: "Logika" },
      { key: "Quality", label: "Jakość" },
      { key: "Emotions", label: "Emocje" },
    ];

    this.criteria.forEach(({ key, label }) => {
      const row = document.createElement("label");
      const label_val = document.createElement("span");
      label_val.textContent = label + ": ";
      row.appendChild(label_val);
      const input = document.createElement("input");
      input.type = "range";
      input.min = "1";
      input.max = "5";
      input.value = "3";
      input.name = key;
      const val = document.createElement("span");
      val.textContent = input.value;
      input.addEventListener("input", () => (val.textContent = input.value));
      row.append(input, val);
      details.appendChild(row);
    });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Wyślij ocenę";
    btn.addEventListener("click", () => this._submit());
    details.appendChild(btn);
  }
  /** Zbiera wartości suwaków i przekazuje do `onSubmit` */
  _submit() {
    const ratings = this._getRatings();
    const payload = {
      messageId: this.msgEl.dataset.msgId || "msg-temp",
      sessionId: "session-temp", // lub dynamicznie z kontekstu
      ratings,
    };
    this.onSubmit(payload);
    console.log("Wysyłam ocenę:", payload);

  }
  /**
   * Zwraca obiekt ocen z wartościami suwaków.
   * @returns {Object} Obiekt ocen, np. { Narrative: 4, Style: 3, ... }
   */
  _getRatings() {
    return Array.from(
      this.details.querySelectorAll('input[type="range"]')
    ).reduce((acc, inp) => ((acc[inp.name] = Number(inp.value)), acc), {});
  }

  /** Przełącza widoczność formularza */
  toggle() {
    this.details.open = !this.details.open;
  }

  /** Zamyka formularz */
  close() {
    this.details.open = false;
  }

  /** Usuwa formularz z DOM i czyści referencję */
  destroy() {
    this.details.remove();
    delete this.msgEl._ratingForm;
  }
}


// 📦 RequestRetryManager.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
 * - ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
 * - ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
 *
 * RequestRetryManager
 * ===================
 * Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.
 * */

class RequestRetryManager {
  /**
   * Wykonuje fetch z retry.
   *
   * @param {string|Request} input  - URL lub Request
   * @param {object} [init]         - Opcje fetch (method, headers, body itd.)
   * @param {number} [retries=3]    - Liczba ponownych prób przy nieudanym fetch
   * @param {number} [delay=1000]   - Opóźnienie między próbami w ms
   * @param {object} [options]      - Dodatkowe opcje
   * @param {boolean} [options.silent=false] - Czy logować błędy
   * @param {object} [options.logger=null]   - Logger z metodą `.record(...)`
   * @returns {Promise<Response>}
   * @throws Jeśli skończą się wszystkie próby lub błąd nie jest sieciowy
   */
  static async fetchWithRetry(
    input,
    init = {},
    retries = 3,
    delay = 1000,
    { silent = false, logger = null } = {}
  ) {
    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(input, init);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      } catch (err) {
        attempt++;
        if (logger && typeof logger.record === "function") {
          const level = attempt > retries ? "error" : silent ? "log" : "warn";
          const msg =
            attempt > retries
              ? `[RequestRetryManager] Wyczerpane retry dla: ${input}`
              : silent
              ? `[RequestRetryManager] (silent) fetch fail ${input}`
              : `[RequestRetryManager] Błąd fetch (${attempt}/${retries}):`;

          logger.record(level, msg, err);
        }

        if (attempt > retries) throw err;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}


// 📦 SenderRegistry.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
 * - ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
 * - ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
 * - ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę
 *
 * SenderRegistry
 * ==============
 * Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
 * - Każdy nadawca otrzymuje klasę z palety
 * - Przypisania są zapamiętywane w `Map`
 * - Indeksy rotują, by nie przekroczyć długości palety
 */
class SenderRegistry {
  /** Paleta dostępnych klas CSS */
  static palette = ['msg-ai-1','msg-ai-2','msg-ai-3','msg-ai-4','msg-ai-5'];

  /** Mapa przypisań: sender → index */
  static map = new Map();

  /** Aktualny indeks w palecie */
  static idx = 0;

  /**
   * Zwraca klasę CSS dla podanego nadawcy.
   * Jeśli nadawca nie był wcześniej zarejestrowany, przypisuje mu kolejną klasę z palety.
   * @param {string} sender - Identyfikator nadawcy.
   * @returns {string} Klasa CSS przypisana nadawcy.
   */
  static getClass(sender) {
    if (!this.map.has(sender)) {
      this.map.set(sender, this.idx);
      this.idx = (this.idx + 1) % this.palette.length;
    }
    return this.palette[this.map.get(sender)];
  }
}


// 📦 TagSelectorFactory.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `TagSelectorFactory` działa jako fabryka komponentów tagów
 * - ✅ Docelowo planowana separacja metod:
 *     • `createTagField()` → `TagFieldRenderer`
 *     • `getLabelText()` → `TagLabelDictionary`
 *     • `replaceTagField()` → `TagFieldReplacer`
 * - ✅ Możliwość dodania metod: `createTagField(name, options, type)`, `getTagFieldType()`, `getAvailableTags(name)`
 * - ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami
 *
 * TagSelectorFactory
 * ==================
 * Fabryka komponentów tagów:
 * - Tworzy pola tagów (`select` lub `input + datalist`) zależnie od urządzenia
 * - Generuje etykiety
 * - Umożliwia dynamiczną podmianę pola w kontenerze
 */
class TagSelectorFactory {
   /**
   * Tworzy pole tagu z etykietą i opcjami.
   * W zależności od urządzenia zwraca `select` lub `input + datalist`.
   * @param {string} name - Nazwa pola tagu.
   * @param {string[]} options - Lista dostępnych opcji.
   * @returns {HTMLElement} Element `label` zawierający pole tagu.
   */
  static createTagField(name, options) {
    const label = document.createElement("label");
    label.className = "text-base";
    label.textContent = `${this.getLabelText(name)}: `;

    if (Utils.isMobile()) {
      const select = document.createElement("select");
      select.id = `tag-${name}`;
      select.name = name;
      select.className = "form-element w-full";

      options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });

      label.appendChild(select);
      return label;
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.id = `tag-${name}`;
      input.name = name;
      input.setAttribute("list", `${name}-tags`);
      input.className = "form-element w-full";

      const datalist = document.createElement("datalist");
      datalist.id = `${name}-tags`;
      options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        datalist.appendChild(option);
      });

      label.appendChild(input);
      label.appendChild(datalist);
      return label;
    }
  }
  /**
   * Zwraca tekst etykiety dla danego pola tagu.
   * @param {string} name - Nazwa pola.
   * @returns {string} Tekst etykiety.
   */
  static getLabelText(name) {
    return (
      {
        location: "Lokalizacja",
        character: "Postać",
        action: "Czynność (nonNSFW)",
        nsfw: "Czynność (NSFW)",
        emotion: "Emocja",
      }[name] || name
    );
  }
  /**
   * Podmienia istniejące pole tagu w kontenerze na nowe.
   * Dodatkowo resetuje autofill przez `blur()` i `setSelectionRange()`.
   * @param {HTMLElement} container - Kontener DOM.
   * @param {string} name - Nazwa pola tagu.
   * @param {string[]} options - Lista nowych opcji.
   */
  static replaceTagField(container, name, options) {
    const old = container.querySelector(`#tag-${name}`);
    if (old) old.parentElement.removeChild(old);

    const newField = this.createTagField(name, options);
    container.appendChild(newField);
    [
      "#tag-location",
      "#tag-character",
      "#tag-action",
      "#tag-nsfw",
      "#tag-emotion",
    ].forEach((sel) => {
      const el = container.querySelector(sel);

      if (el) {
        el.blur();
        el.setSelectionRange?.(0, 0);
      } // subtelny anty-autofill
    });
  }
}


// 📦 TagsPanel.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `TagsPanel` działa jako kontroler komponentu tagów + integracja z galerią
 * - ✅ Docelowo planowana separacja metod:
 *     • `buildTagFields()` → `TagFieldBuilder`
 *     • `init(onChange)` → `TagEventBinder`
 *     • `notifyTagsChanged()` → `GallerySyncService`
 *     • `getSelectedTags()` / `getTagList()` → `TagStateManager`
 *     • `clearTags()` → `TagResetService`
 * - ✅ Możliwość dodania metod: `setTags()`, `disableTags()`, `validateTags()`, `getTagOptions()`
 * - ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami
 *
 * TagsPanel
 * =========
 * Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
 * - Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
 * - Obsługuje zmiany użytkownika i aktualizuje galerię
 * - Umożliwia odczyt i czyszczenie tagów
 */
class TagsPanel {
  /**
   * Tworzy instancję panelu tagów.
   * @param {HTMLElement} container - Element DOM, do którego zostanie podłączony panel.
   * @throws {Error} Jeśli `container` nie jest elementem DOM.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      const actualType =
        container === null
          ? "null"
          : Array.isArray(container)
          ? "Array"
          : container?.constructor?.name || typeof container;

      throw new Error(
        `[TagsPanel] Przekazany kontener nie jest elementem DOM. ` +
          `Otrzymano: ${actualType} → ${String(container)}`
      );
    }

    /** @type {HTMLElement} Kontener panelu tagów */
    this.container = container;

    /** @type {GalleryLoader} Loader galerii obrazów */
    this.onTagsChanged = null; // callback z zewnątrz

    /** @type {Object.<string, HTMLElement>} Referencje do pól tagów */
    this.fields = {};

    this.buildTagFields();
    this.notifyTagsChanged();

    /** @type {HTMLElement} Element galerii obrazów */
    const gallery = document.createElement("div");
    gallery.id = "image-gallery";
    gallery.className = "gallery-grid mt-10";
    this.container.appendChild(gallery);
    this.gallery = gallery;
  }

  /**
   * Skrót do `querySelector` w obrębie kontenera.
   * @param {string} selector - Selektor CSS.
   * @returns {HTMLElement|null} Znaleziony element lub null.
   */
  q(selector) {
    const el = this.container.querySelector(selector);
    if (!el) {
      LoggerService.record(
        "warn",
        `[TagsPanel] Nie znaleziono elementu: ${selector}`,
        this.container
      );
    }
    return el;
  }

  /**
   * Tworzy pola tagów dynamicznie z użyciem `TagSelectorFactory`.
   * Wstawia je do kontenera i zapisuje referencje w `this.fields`.
   */
  buildTagFields() {
    const tagNames = ["location", "character", "action", "nsfw", "emotion"];
    const tagOptions = {
      location: ["forest", "castle", "cave", "village"],
      character: ["Lytha", "Aredia", "Xavier"],
      action: ["healing", "combat", "ritual"],
      nsfw: ["intimacy", "touch", "kiss"],
      emotion: ["joy", "sadness", "fear", "love"],
    };

    tagNames.forEach((name) => {
      const options = tagOptions[name] || [];
      const fieldWrapper = TagSelectorFactory.createTagField(name, options);

      this.container.appendChild(fieldWrapper);

      const field = fieldWrapper.querySelector(`#tag-${name}`) || fieldWrapper;
      this.fields[name] = field;
    });
  }

  /**
   * Inicjalizuje nasłuchiwanie zmian w polach tagów.
   * @param {Function} onChange - Funkcja wywoływana przy każdej zmianie tagów.
   */
  init(onChange) {
    const debouncedRefresh = Utils.debounce(
      () => this.notifyTagsChanged(),
      300
    );

    Object.values(this.fields).forEach((field) => {
      if (!field) return;
      const eventType = field.tagName === "SELECT" ? "change" : "input";

      field.addEventListener(eventType, () => {
        if (typeof onChange === "function") {
          onChange(this.getSelectedTags());
        }
        debouncedRefresh();
      });
    });
  }

  /**
   * Zwraca aktualnie wybrane tagi jako obiekt.
   * @returns {Object} Obiekt z kluczami: location, character, action, nsfw, emotion.
   */
  getSelectedTags() {
    return {
      location: this.fields.location?.value || "",
      character: this.fields.character?.value || "",
      action: this.fields.action?.value || "",
      nsfw: this.fields.nsfw?.value || "",
      emotion: this.fields.emotion?.value || "",
    };
  }

  /**
   * Zwraca aktualnie wybrane tagi jako tablicę stringów.
   * Pomija puste wartości.
   * @returns {string[]} Tablica wybranych tagów.
   */
  getTagList() {
    return Object.values(this.getSelectedTags()).filter(Boolean);
  }

  /**
   * Aktualizuje galerię obrazów na podstawie aktualnych tagów.
   * Wywołuje `GalleryLoader.renderFromTags()`.
   */
  notifyTagsChanged() {
    if (typeof this.onTagsChanged === "function") {
      this.onTagsChanged(this.getTagList());
    }
  }

  /**
   * Czyści wszystkie pola tagów.
   * Ustawia ich wartość na pustą i aktualizuje galerię.
   */
  clearTags() {
    Object.values(this.fields).forEach((field) => {
      if (field) field.value = "";
    });
    this.notifyTagsChanged();
  }

  /**
 * Zastępuje opcje tagów i przebudowuje pola na podstawie słownika z backendu.
 * Oczekuje kluczy w postaci "tag-location", "tag-character", ... (tak jak w tags.json).
 * Zachowuje this.gallery, jeśli już istnieje (pola mają być przed galerią).
 * @param {Object<string,string[]>} tagOptionsFromBackend
 */
setTagOptions(tagOptionsFromBackend) {
  // Normalizacja kluczy "tag-*" -> nazwa pola jak w projekcie
  const toFieldName = (k) => k.startsWith("tag-") ? k.slice(4) : k; // tag-location -> location

  // Usuń stare pola (label + inputy), ale zostaw galerię
  Array.from(this.container.children).forEach((child) => {
    if (child !== this.gallery) this.container.removeChild(child);
  });

  // Zbuduj na nowo pola
  this.fields = {};
  Object.entries(tagOptionsFromBackend).forEach(([backendKey, options]) => {
    const name = toFieldName(backendKey); // np. "location"
    const fieldWrapper = TagSelectorFactory.createTagField(name, options || []);
    // Wstaw przed galerią, jeśli istnieje, lub na koniec kontenera
    if (this.gallery && this.gallery.parentElement === this.container) {
      this.container.insertBefore(fieldWrapper, this.gallery);
    } else {
      this.container.appendChild(fieldWrapper);
    }
    const field = fieldWrapper.querySelector(`#tag-${name}`) || fieldWrapper;
    this.fields[name] = field;
  });
}

/**
 * Ustawia domyślne wartości inputów na podstawie data-tags (np. "cave_kissing")
 * i słownika tagów z backendu. Jeśli jakiś tag nie występuje w żadnej kategorii — pomijamy.
 * @param {string} dataTags np. "cave_kissing"
 * @param {Object<string,string[]>} tagOptionsFromBackend
 */
applyDefaultsFromDataTags(dataTags, tagOptionsFromBackend) {
  if (!dataTags) return;

  const tokens = dataTags.split("_").filter(Boolean); // ["cave", "kissing"]
  const mapBackendKeyToField = (k) => k.startsWith("tag-") ? k.slice(4) : k; // "tag-nsfw" -> "nsfw"

  for (const token of tokens) {
    for (const [backendKey, options] of Object.entries(tagOptionsFromBackend)) {
      if (Array.isArray(options) && options.includes(token)) {
        const fieldName = mapBackendKeyToField(backendKey); // "nsfw"
        const field = this.fields[fieldName];
        if (field) field.value = token;
        break; // znaleźliśmy kategorię dla tego tokena — nie szukamy dalej
      }
    }
  }
}

}


// 📦 UserManager.js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `UserManager` działa jako statyczny menedżer sesji użytkownika
 * - ✅ Docelowo planowana separacja metod:
 *     • `setName`, `getName` → `UserStorage`
 *     • `init(dom)` → `UserInputBinder`
 *     • `replacePlaceholders(text)` → `TextInterpolator`
 * - ✅ Możliwość dodania metod: `hasName()`, `clearName()`, `getStorageType()`, `replacePlaceholders(text, map)`
 * - ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami
 * - Wyjaśnić czym jest interpolacja tekstu
 *
 * UserManager
 * ===========
 * Statyczna klasa do zarządzania nazwą użytkownika:
 * - zapisuje w localStorage lub cookie (fallback),
 * - odczytuje nazwę użytkownika,
 * - podłącza pole input do automatycznego zapisu,
 * - podmienia placeholdery w tekstach.
 */
class UserManager {
  /** Klucz używany w localStorage i cookie */
  static storageKey = 'user_name';

  /**
   * Zapisuje imię użytkownika w localStorage lub cookie (fallback).
   * @param {string} name - Imię użytkownika.
   */
  static setName(name) {
    try {
      localStorage.setItem(this.storageKey, name);
    } catch {
      document.cookie = `${this.storageKey}=${encodeURIComponent(name)}; max-age=${30*24*60*60}`;
    }
  }

  /**
   * Odczytuje imię użytkownika z localStorage lub cookie.
   * @returns {string} Imię użytkownika lub pusty string.
   */
  static getName() {
    try {
      return localStorage.getItem(this.storageKey) || '';
    } catch {
      const match = document.cookie.match(new RegExp(`(^| )${this.storageKey}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : '';
    }
  }

  /**
   * Podłącza pole input #user_name:
   * - wypełnia istniejącą wartością,
   * - zapisuje każdą zmianę.
   * @param {Dom} dom - Instancja klasy Dom z metodą `q()`.
   */
  static init(dom) {
    const input = dom.q('#user_name');
    if (!input) return;
    input.value = this.getName();
    input.addEventListener('input', () => {
      this.setName(input.value.trim());
    });
  }

  /**
   * Podmienia placeholder {{user}} w tekście na aktualne imię.
   * @param {string} text - Tekst zawierający placeholder.
   * @returns {string} Tekst z podmienionym imieniem.
   */
  static replacePlaceholders(text) {
    const name = this.getName() || 'Użytkowniku';
    return text.replace(/{{\s*user\s*}}/gi, name);
  }
}


// 📦 Utils.js
/**
 * FEEDBACK KAMILA (11.09.2025)
 * =============================
 * - ✅ Klasa `Utils` działa jako statyczny zestaw narzędzi — nie wymaga instancji
 * - ✅ Docelowo planowana separacja metod do modułów:
 *     • `throttle`, `debounce` → `TimingUtils`
 *     • `formatDate`, `clamp`, `randomId` → `DataUtils`
 *     • `safeQuery`, `createButton` → `DOMUtils`
 *     • `isMobile` → `EnvUtils` / `DeviceDetector`
 *     • `checkImageExists` → `ResourceUtils` / `ImageValidator`
 * - ✅ Możliwość dodania metod: `once`, `retry`, `wait`, `escapeHTML`, `parseQueryParams`
 * - ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami
 *
 * Utils
 * =====
 * Klasa zawierająca zestaw statycznych metod pomocniczych wykorzystywanych w całej aplikacji.
 * Nie wymaga instancjonowania — wszystkie metody są dostępne bezpośrednio przez `Utils`.
 *
 * Oferuje funkcje związane z:
 * - optymalizacją wywołań (throttle, debounce),
 * - manipulacją danymi (formatowanie dat, ograniczanie wartości, generowanie ID),
 * - obsługą DOM (bezpieczne pobieranie elementów, tworzenie przycisków),
 * - detekcją środowiska (mobilność),
 * - sprawdzaniem dostępności zasobów (obrazów).
 */
class Utils {
  /**
   * Ogranicza częstotliwość wywołań funkcji — zapewnia, że funkcja `fn` nie zostanie wywołana częściej niż co `limit` milisekund.
   *
   * @param {Function} fn - Funkcja do ograniczenia.
   * @param {number} limit - Minimalny odstęp czasu w ms.
   * @returns {Function} Nowa funkcja z throttlingiem.
   */
  static throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Opóźnia wywołanie funkcji do momentu, aż minie określony czas od ostatniego wywołania.
   * Przydatne np. przy obsłudze inputów, scrolla, resize.
   *
   * @param {Function} fn - Funkcja do opóźnienia.
   * @param {number} delay - Czas opóźnienia w ms.
   * @returns {Function} Nowa funkcja z debounce.
   */
  static debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Formatuje datę do czytelnego formatu zgodnego z lokalizacją `pl-PL`.
   *
   * @param {Date|string|number} date - Obiekt Date, timestamp lub string.
   * @returns {string} Sformatowana data, np. "09.09.2025, 19:00".
   */
  static formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Ogranicza wartość do podanego zakresu [min, max].
   *
   * @param {number} value - Wartość wejściowa.
   * @param {number} min - Minimalna wartość.
   * @param {number} max - Maksymalna wartość.
   * @returns {number} Wartość w zakresie.
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generuje losowy identyfikator alfanumeryczny.
   *
   * @param {number} [length=8] - Długość identyfikatora.
   * @returns {string} Losowy identyfikator, np. "x9f3k2a1".
   */
  static randomId(length = 8) {
  let id = "";
  while (id.length < length) {
    id += Math.random().toString(36).slice(2);
  }
  return id.slice(0, length);
}


  /**
   * Sprawdza, czy użytkownik korzysta z urządzenia mobilnego na podstawie `navigator.userAgent`.
   * Wypisuje wynik detekcji w konsoli.
   *
   * @returns {boolean} True, jeśli urządzenie jest mobilne.
   */
  static isMobile() {
    if (typeof window !== "undefined") {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      isMobile
        ? LoggerService.record("log", "[Utils] Detekcja mobilna:", navigator.userAgent, "→", isMobile)
        : null;
      return isMobile;
    }
    return false;
  }

  /**
   * Bezpieczne pobieranie elementu DOM.
   * Jeśli element nie istnieje, wypisuje ostrzeżenie w konsoli.
   *
   * @param {string} selector - Selektor CSS.
   * @returns {HTMLElement|null} Znaleziony element lub null.
   */
  static safeQuery(selector) {
    const el = document.querySelector(selector);
    if (!el) console.warn(`[Utils] Nie znaleziono elementu: ${selector}`);
    return el;
  }

  /**
   * Tworzy przycisk HTML z podanym tekstem i funkcją obsługi kliknięcia.
   *
   * @param {string} label - Tekst przycisku.
   * @param {Function} onClick - Funkcja wywoływana po kliknięciu.
   * @returns {HTMLButtonElement} Gotowy przycisk.
   */
  static createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "button-base";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  /**
   * Sprawdza, czy obrazek pod danym adresem istnieje, wykonując zapytanie HEAD.
   *
   * @param {string} url - Adres obrazka.
   * @returns {Promise<boolean>} True, jeśli obrazek istnieje, false w przeciwnym razie.
   */
  static async checkImageExists(url) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }
}


// 📦 DiagnosticsTests.js


// 🚀 init_chat.js
/**
 * FEEDBACK KAMILA (11.09.2025)
 * =============================
 * - ✅ Gettery, settery i dynamiczna rejestracja zależności → wdrażamy
 * - ❌ Separacja kontekstu na moduły → zbędna
 * - ✅ Przeniesienie metod do odpowiednich klas → po testach
 *     • `addClearImageCacheButton()` → docelowo do `PanelsController`
 *     • `initTagModules()` → docelowo do `TagsPanel` lub `TagManager`
 * - ✅ Cykle życia aplikacji (init/destroy) → wdrożone
 * - ❌ Obsługa błędów inicjalizacji → pominięta (testy konstruktorów)
 * - ✅ Rejestracja eventów jako osobna klasa → zaplanowane
 * - ✅ Tryb debug zawsze aktywny
 *
 * Context
 * =======
 * Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.
 */
class Context {
  constructor() {
    this._registry = new Map();
    this.register("logger", LoggerService);
    this.register("diagnostics", Diagnostics);
    this.register("userManager", UserManager);
    this.register("dom", new Dom());
    this.register("utils", Utils);
    this.register("backendAPI", new BackendAPI());
  }

  register(name, instance) {
    this._registry.set(name, instance);
  }

  get(name) {
    return this._registry.get(name);
  }

  get logger()      { return this.get("logger"); }
  get diagnostics() { return this.get("diagnostics"); }
  get userManager() { return this.get("userManager"); }
  get dom()         { return this.get("dom"); }
  get utils()       { return this.get("utils"); }
  get backendAPI()  { return this.get("backendAPI"); }
}

/**
 * App
 * ===
 * Fasada aplikacji:
 * - inicjalizuje moduły (klawiatura, panele, edycja, UI, manager czatu),
 * - rejestruje zdarzenia globalne (submit, Ctrl+Enter),
 * - zarządza cyklem życia (init, destroy),
 * - udostępnia metodę addClearImageCacheButton do wyczyszczenia cache obrazów.
 */
class App {
  /**
   * @param {Context} context
   */
  constructor(context) {
    this.ctx = context;
    this.keyboardManager  = new KeyboardManager(this.ctx.dom);
    this.panelsController = new PanelsController(this.ctx.dom);
    this.editManager      = new EditManager(this.ctx.dom, this.ctx.backendAPI, this.ctx.logger);
    this.chatUI = new ChatUI(this.ctx.dom, this.editManager);
    this.chatManager = new ChatManager(this.chatUI, this.ctx.backendAPI, this.ctx.dom);
    this.chatUI.setChatManager(this.chatManager); // ręcznie ustawiamy zależność

  }

  /**
   * Dodaje przycisk do panelu ustawień umożliwiający wyczyszczenie pamięci obrazów.
   */
  addClearImageCacheButton() {
    const wrapper = document.createElement("div");
    wrapper.className = "mt-20";

    const label = document.createElement("label");
    label.className = "text-sm block mb-5";
    label.textContent = "Pamięć obrazów:";

    const btn = this.ctx.utils.createButton("🧹 Wyczyść pamięć obrazów", () => {
      let cleared = 0;
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("img-exists:")) {
          localStorage.removeItem(key);
          cleared++;
        }
      });
      alert(`Wyczyszczono ${cleared} wpisów z pamięci obrazów.`);
    });

    btn.className = "form-element text-base mt-5 w-full";
    wrapper.appendChild(label);
    wrapper.appendChild(btn);
    this.ctx.dom.settingSidePanel.appendChild(wrapper);
  }

  /**
   * Inicjalizuje moduły tagów i galerię obrazów.
   */
  initTagModules() {
    this.tagsPanel      = new TagsPanel(this.ctx.dom);
    this.galleryLoader  = new GalleryLoader(this.ctx.dom);

    this.tagsPanel.init((selectedTags) => {
      this.ctx.logger.record("log", "[App] Wybrane tagi:", selectedTags);
      this.galleryLoader.loadFromAPI("/api/images", selectedTags);
    });
  }

  /**
   * Uruchamia aplikację:
   * - klawiatura, panele, userManager,
   * - rejestruje submit i Ctrl+Enter,
   * - dodaje clear-image-button.
   */
  init() {
    this.ctx.logger.record("log", "[App] Inicjalizacja aplikacji...");
    this.keyboardManager.init();
    this.ctx.userManager.init(this.ctx.dom);
    this.panelsController.init();

    this.ctx.dom.inputArea.addEventListener("submit", (e) => {
      e.preventDefault();
      this.chatManager.sendPrompt();
    });

    this.ctx.dom.prompt.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.chatManager.sendPrompt();
        e.preventDefault();
      }
    });

    this.addClearImageCacheButton();
    this.ctx.logger.record("log", "[App] Aplikacja gotowa.");
  }

  /**
   * Zatrzymuje aplikację i czyści zasoby.
   * (rejestrowane wywołania, timery, event listeners itp.)
   */
  destroy() {
    this.ctx.logger.record("warn", "[App] Zatrzymywanie aplikacji...");
    // tu w przyszłości można czyścić eventy i timery
  }
}

const context = new Context();
const app     = new App(context);
app.init();

```