/**
 * Klasa Dom
 * =========
 * Centralny punkt dostępu do elementów DOM w aplikacji.
 * Umożliwia łatwe i czytelne pobieranie elementów oraz
 * przechowywanie ich referencji w jednym miejscu.
 *
 * Dzięki temu:
 * - unikasz wielokrotnego wyszukiwania tych samych elementów,
 * - masz spójne nazewnictwo,
 * - łatwo zmieniasz selektor w jednym miejscu, jeśli HTML się zmieni.
 */
class Dom {
  /**
   * Tworzy instancję klasy Dom i inicjalizuje referencje do elementów.
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
    this.sidePanel = this.q("#side-panel");
  }

  /**
   * Skrót do document.querySelector z walidacją.
   * @param {string} selector - Selektor CSS elementu.
   * @returns {HTMLElement|null} Znaleziony element lub null.
   */
  q(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      console.warn(`[Dom] Nie znaleziono elementu dla selektora: ${selector}`);
    }
    return el;
  }

  /**
   * Skrót do document.querySelectorAll.
   * @param {string} selector - Selektor CSS elementów.
   * @returns {NodeListOf<HTMLElement>} Lista elementów.
   */
  qa(selector) {
    return document.querySelectorAll(selector);
  }
}

/**
 * KeyboardManager
 * ===============
 * Zarządza zachowaniem interfejsu w momencie pojawienia się klawiatury ekranowej.
 * Odpowiada za pozycjonowanie pola wprowadzania wiadomości (#input-area)
 * tak, aby zawsze było widoczne nad klawiaturą.
 */
class KeyboardManager {
  /**
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    this.dom = domInstance;
    this.isFirefox = /firefox/i.test(navigator.userAgent);
  }

  /**
   * Inicjalizuje nasłuchiwanie zdarzeń związanych z klawiaturą.
   */
  init() {
    if (!window.visualViewport) {
      console.warn("[KeyboardManager] visualViewport API niedostępne.");
      return;
    }

    // Podpinamy eventy z throttlingiem
    window.visualViewport.addEventListener(
      "resize",
      this.updatePosition.bind(this)
    );
    window.visualViewport.addEventListener(
      "scroll",
      this.updatePosition.bind(this)
    );

    // Ustawienie początkowe
    this.updatePosition();
  }

  /**
   * Aktualizuje pozycję input-area nad klawiaturą.
   */
  updatePosition() {
    const vv = window.visualViewport;
    if (!vv || !this.dom.inputArea) return;

    // Obliczamy wysokość klawiatury
    const keyboardHeight = Math.max(
      0,
      window.innerHeight - (vv.height + vv.offsetTop)
    );

    // Ustawiamy bottom w input-area
    this.dom.inputArea.style.bottom = keyboardHeight
      ? `${keyboardHeight}px`
      : "0px";

    // Opcjonalny fix dla Firefoksa
    if (this.isFirefox) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }
}

/**
 * PanelsController
 * ================
 * Zarządza panelami bocznymi aplikacji (otwieranie, zamykanie, przełączanie).
 * Współpracuje z klasą Dom, aby mieć dostęp do przycisków i paneli.
 */
class PanelsController {
  /**
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    this.dom = domInstance;

    // Lista paneli i ich przycisków
    this.panels = [
      { button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
      { button: this.dom.settingsToggle, panel: this.dom.sidePanel },
    ];
  }

  /**
   * Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.
   */
  init() {
    this.panels.forEach(({ button, panel }) => {
      if (!button || !panel) return;
      button.addEventListener("click", () => this.togglePanel(panel));
    });
  }

  /**
   * Otwiera wskazany panel i zamyka inne.
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
   * Przełącza stan panelu (open/close).
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

  /**
   * Zamyka wszystkie panele.
   */
  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel.classList.remove("open"));
  }
}

/**
 * ChatUI
 * ======
 * Zarządza warstwą wizualną czatu:
 * - dodawanie wiadomości
 * - przewijanie historii
 * - czyszczenie czatu
 */
class ChatUI {
  /**
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    this.dom = domInstance;
  }

  addMessage(type, text) {
    if (!this.dom.chatContainer) return;
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.textContent = text;
    this.dom.chatContainer.appendChild(msg);
    this.scrollToBottom();
  }

  addLoadingMessage() {
    const msgEl = document.createElement("div");
    msgEl.classList.add("message", "ai");
    msgEl.textContent = "⏳ Generowanie odpowiedzi... (0s)";
    this.dom.chatContainer.appendChild(msgEl);
    this.scrollToBottom();

    let secondsElapsed = 0;
    const timer = setInterval(() => {
      secondsElapsed++;
      msgEl.textContent = `⏳ Generowanie odpowiedzi... (${secondsElapsed}s)`;
    }, 1000);

    return { msgEl, timer };
  }

  updateAIMessage(msgEl, response, duration) {
    msgEl.innerHTML = `⏱️ Czas generowania: ${duration}s<br><br>${response}`;
    this.scrollToBottom();
  }

  showError(msgEl) {
    msgEl.textContent = "❌ Błąd generowania odpowiedzi.";
    this.scrollToBottom();
  }

  addEditButton(msgEl, originalText) {
    const btn = Utils.createButton("✏️ Edytuj", () => {
      // Tu można wywołać enableEdit lub emitować event
      console.log("Edytuj kliknięte", originalText);
    });
    msgEl.appendChild(btn);
  }

  addRatingForm() {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.className = "rating-form";
    summary.textContent = "Oceń odpowiedź ⭐";
    details.appendChild(summary);

    const polishLabels = ["Narracja", "Styl", "Logika", "Jakość", "Emocje"];
    ["Narrative", "Style", "Logic", "Quality", "Emotions"].forEach((label, index) => {
      const input = document.createElement("input");
      input.type = "range";
      input.min = 1;
      input.max = 5;
      input.value = 3;
      input.name = label;
      details.appendChild(
        (document.createTextNode(polishLabels[index] + ": "))
      );
      details.appendChild(input);
    });

    const submitBtn = Utils.createButton("Wyślij ocenę", () => {
      details.querySelector("button").addEventListener("click", async () => {
        const ratings = {};
        details.querySelectorAll('input[type="range"]').forEach((input) => {
          ratings[input.name] = parseInt(input.value, 10);
        });

        try {
          await app.backendAPI.rate({ratings: ratings});
          alert("Ocena wysłana!");
        } catch (err) {
          console.error("Błąd wysyłania oceny:", err);
        }
      });
    });
    details.appendChild(submitBtn);

    this.dom.chatContainer.appendChild(details);
  }

  

  scrollToBottom() {
    this.dom.chatContainer.scrollTop = this.dom.chatContainer.scrollHeight;
  }
}

/**
 * TagsPanel
 * =========
 * Zarządza panelem tagów w obrębie przekazanego kontenera.
 * - obsługa pól wyboru tagów (lokalizacja, postać, czynność, emocja)
 * - pobieranie aktualnych wartości
 * - aktualizacja galerii obrazów
 */
class TagsPanel {
  /**
   * @param {HTMLElement} container - Kontener panelu tagów (np. sklonowany z <template>).
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

    this.container = container;

    this.fields = {
      location: this.q("#tag-location"),
      character: this.q("#tag-character"),
      action: this.q("#tag-action"),
      nsfw: this.q("#tag-nsfw"),
      emotion: this.q("#tag-emotion"),
    };

    this.gallery = this.q("#image-gallery");
  }

  /**
   * Skrót do querySelector w obrębie kontenera.
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  q(selector) {
    const el = this.container.querySelector(selector);
    if (!el) {
      console.warn(
        `[TagsPanel] Nie znaleziono elementu: ${selector} w kontenerze`,
        this.container
      );
    }
    return el;
  }
  /**
   * Inicjalizuje nasłuchiwanie zmian w polach tagów.
   * @param {Function} onChange - Callback wywoływany przy każdej zmianie.
   */
  init(onChange) {
    Object.values(this.fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        if (typeof onChange === "function") {
          onChange(this.getSelectedTags());
        }
      });
    });
  }

  /**
   * Zwraca aktualnie wybrane tagi.
   * @returns {Object}
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
   * Aktualizuje galerię obrazów.
   * @param {string[]} imageUrls
   */
  updateGallery(imageUrls) {
    if (!this.gallery) return;
    this.gallery.innerHTML = "";
    imageUrls.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Tag image";
      img.loading = "lazy";
      this.gallery.appendChild(img);
    });
  }

  /**
   * Czyści pola tagów.
   */
  clearTags() {
    Object.values(this.fields).forEach((field) => {
      if (field) field.value = "";
    });
  }
}

/**
 * GalleryLoader
 * =============
 * Ładuje i renderuje obrazy w galerii w obrębie przekazanego kontenera.
 */
class GalleryLoader {
  /**
   * @param {HTMLElement} container - Kontener panelu tagów.
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

    this.gallery = container.querySelector("#image-gallery");
  }

  clearGallery() {
    if (this.gallery) this.gallery.innerHTML = "";
  }

  showMessage(message) {
    if (!this.gallery) return;
    this.clearGallery();
    const msg = document.createElement("div");
    msg.classList.add("gallery-message");
    msg.textContent = message;
    this.gallery.appendChild(msg);
  }

  renderImages(urls) {
    if (!this.gallery) return;
    this.gallery.innerHTML = "";
    urls.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Tag image";
      img.loading = "lazy";
      this.gallery.appendChild(img);
    });
  }

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
      console.error("[GalleryLoader] Błąd ładowania obrazów:", err);
      this.showMessage("Błąd ładowania obrazów.");
    }
  }
}

/**
 * Diagnostics
 * ===========
 * Zbiera i wyświetla informacje diagnostyczne o stanie aplikacji.
 */
class Diagnostics {
  /**
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    this.dom = domInstance;
  }

  /**
   * Zbiera dane diagnostyczne.
   * @returns {Object} Obiekt z danymi diagnostycznymi.
   */
  collectData() {
    const vv = window.visualViewport;
    const wrapperRect = this.dom.chatWrapper?.getBoundingClientRect();
    const inputRect = this.dom.inputArea?.getBoundingClientRect();

    return {
      timestamp: new Date().toLocaleTimeString(),
      visualViewportHeight: vv?.height,
      visualViewportOffsetTop: vv?.offsetTop,
      visualViewportOffsetLeft: vv?.offsetLeft,
      windowInnerHeight: window.innerHeight,
      windowOuterHeight: window.outerHeight,
      documentClientHeight: document.documentElement.clientHeight,
      bodyClientHeight: document.body.clientHeight,
      wrapperOffsetTop: wrapperRect?.top,
      wrapperOffsetBottom: wrapperRect?.bottom,
      wrapperHeight: this.dom.chatWrapper?.offsetHeight,
      inputAreaOffsetTop: inputRect?.top,
      inputAreaOffsetBottom: inputRect?.bottom,
      inputAreaHeight: this.dom.inputArea?.offsetHeight,
      scrollY: window.scrollY,
      scrollX: window.scrollX,
    };
  }

  /**
   * Wyświetla dane w konsoli w formie tabeli.
   */
  logToConsole() {
    console.table(this.collectData());
  }

  /**
   * Wstawia dane do pola tekstowego (np. #prompt).
   */
  outputToPrompt() {
    if (!this.dom.prompt) return;
    const data = this.collectData();
    let output = "📊 DIAGNOSTYKA:\n";
    for (const [key, value] of Object.entries(data)) {
      output += `${key}: ${Math.round(value ?? 0)}px\n`;
    }
    this.dom.prompt.value = output;
  }

  /**
   * Uruchamia diagnostykę i wyświetla dane w konsoli oraz w polu tekstowym.
   */
  run() {
    this.logToConsole();
    this.outputToPrompt();
  }
}
/**
 * Utils
 * =====
 * Zbiór statycznych metod pomocniczych używanych w całej aplikacji.
 */
class Utils {
  /**
   * Ogranicza częstotliwość wywołań funkcji.
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
   * Formatuje datę do czytelnego formatu.
   * @param {Date|string|number} date - Obiekt Date lub timestamp.
   * @returns {string} Sformatowana data.
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
   * Ogranicza wartość do podanego zakresu.
   * @param {number} value - Wartość wejściowa.
   * @param {number} min - Minimalna wartość.
   * @param {number} max - Maksymalna wartość.
   * @returns {number} Wartość w zakresie [min, max].
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generuje losowy identyfikator.
   * @param {number} length - Długość identyfikatora.
   * @returns {string} Losowy identyfikator.
   */
  static randomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  }

  /**
   * Sprawdza, czy użytkownik korzysta z urządzenia mobilnego.
   * @returns {boolean} True, jeśli urządzenie jest mobilne.
   */
  static isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  /**
   * Bezpieczne pobieranie elementu DOM.
   * @param {string} selector - Selektor CSS.
   * @returns {HTMLElement|null} Element lub null.
   */
  static safeQuery(selector) {
    const el = document.querySelector(selector);
    if (!el) console.warn(`[Utils] Nie znaleziono elementu: ${selector}`);
    return el;
  }

  static createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  static async checkImageExists(url) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }
}

/**
 * App
 * ===
 * Główna klasa aplikacji – spina wszystkie moduły w całość.
 */
class App {
  constructor() {
    // 1. Podstawowe narzędzia
    this.dom = new Dom();
    this.utils = Utils;
    this.keyboardManager = new KeyboardManager(this.dom);
    this.panelsController = new PanelsController(this.dom);
    this.chatUI = new ChatUI(this.dom);
    this.backendAPI = new BackendAPI();
    this.chatManager = new ChatManager(this.chatUI, this.backendAPI, this.dom);

    this.diagnostics = new Diagnostics(this.dom);
  }

  /**
   * Wstawia zawartość <template class="tag-panel-template"> do DOM.
   * @param {string} targetSelector - Selektor miejsca, w którym ma się pojawić panel.
   */
  renderTagPanel(targetSelector = "#side-panel") {
    const tpl = document.querySelector(".tag-panel-template");
    const target = document.querySelector(targetSelector);

    if (tpl && target) {
      const clone = tpl.content.cloneNode(true);
      target.appendChild(clone);

      // Szukamy wstawionego kontenera (np. root elementu z template)
      const panelContainer = target; // lub target.querySelector('.tag-panel')

      const tagsPanel = new TagsPanel(panelContainer);
      const galleryLoader = new GalleryLoader(panelContainer);

      tagsPanel.init((selectedTags) => {
        galleryLoader.loadFromAPI("/api/images", selectedTags);
      });

      console.log("[App] Tag panel wstawiony i zainicjalizowany.");
    }
  }

  /**
   * Inicjalizuje moduły zależne od tag panelu.
   */
  initTagModules() {
    this.tagsPanel = new TagsPanel(this.dom);
    this.galleryLoader = new GalleryLoader(this.dom);

    this.tagsPanel.init((selectedTags) => {
      console.log("[App] Wybrane tagi:", selectedTags);
      // Przykład: ładowanie obrazów z API
      this.galleryLoader.loadFromAPI("/api/images", selectedTags);
    });
  }

  /**
   * Uruchamia aplikację.
   */
  init() {
    console.log("[App] Inicjalizacja aplikacji...");
    this.keyboardManager.init();
    this.panelsController.init();

    // Eventy globalne
    this.dom.inputArea.addEventListener("submit", (e) => {
      e.preventDefault();
      this.chatManager.sendPrompt();
    });

    this.dom.prompt.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.chatManager.sendPrompt();
        e.preventDefault();
      }
    });

    console.log("[App] Aplikacja gotowa.");
  }
}

/**
 * ChatManager
 * ===========
 * Zarządza przepływem wiadomości między użytkownikiem, UI i backendem.
 */
class ChatManager {
  /**
   * @param {ChatUI} chatUI - Instancja klasy ChatUI.
   * @param {BackendAPI} backendAPI - Instancja klasy BackendAPI.
   * @param {Dom} dom - Instancja klasy Dom.
   */
  constructor(chatUI, backendAPI, dom) {
    this.chatUI = chatUI;
    this.backendAPI = backendAPI;
    this.dom = dom;
  }

  /**
   * Wysyła prompt użytkownika do backendu i obsługuje odpowiedź.
   */
  async sendPrompt() {
    const prompt = this.dom.prompt.value.trim();
    if (!prompt) return;

    this.dom.prompt.value = "";
    this.dom.prompt.disabled = true;

    this.chatUI.addMessage("user", prompt);
    const { msgEl, timer } = this.chatUI.addLoadingMessage();

    const startTime = Date.now();

    try {
      const data = await this.backendAPI.generate(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      clearInterval(timer);

      this.chatUI.updateAIMessage(msgEl, data.response, duration);
      this.chatUI.addEditButton(msgEl, data.response);
      this.chatUI.addRatingForm(msgEl, this.backendAPI);
    } catch (err) {
      clearInterval(timer);
      this.chatUI.showError(msgEl);
      console.error("[ChatManager] Błąd generowania:", err);
    } finally {
      this.dom.prompt.disabled = false;
    }
  }
}

class BackendAPI {
  async generate(prompt) {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    return res.json();
  }

  async rate(ratings) {
    const res = await fetch("/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ratings),
    });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    return res.json();
  }

  async edit(editedText, tags) {
    const res = await fetch("/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editedText, tags }),
    });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    return res.json();
  }
}

//================================================================
// Tworzymy i uruchamiamy aplikację
const app = new App();
app.init();
