# Klasy js

---

**Spis treści**

- [Klasy js](#klasy-js)
  - [init\_chat.js](#init_chatjs)
  - [Utils.js](#utilsjs)
  - [TagsPanel.js](#tagspaneljs)
    - [TagSelectorFactory.js](#tagselectorfactoryjs)
    - [PanelsController.js](#panelscontrollerjs)
    - [KeyboardManager.js](#keyboardmanagerjs)
    - [ImageResolver.js](#imageresolverjs)
    - [GalleryLoader.js](#galleryloaderjs)
    - [EditManager.js](#editmanagerjs)
    - [Dom.js](#domjs)
    - [Diagnostics.js](#diagnosticsjs)
    - [ChatUI.js](#chatuijs)
    - [ChatManager.js](#chatmanagerjs)
    - [BackendAPI.js](#backendapijs)


---

## init_chat.js
```js
/**
 * App
 * ===
 * Główna klasa aplikacji, odpowiedzialna za inicjalizację i integrację wszystkich modułów frontendowych.
 * Obsługuje:
 * - tworzenie instancji klas pomocniczych i kontrolerów,
 * - rejestrowanie zdarzeń globalnych,
 * - uruchamianie interfejsu czatu, paneli bocznych, edycji wiadomości, diagnostyki,
 * - renderowanie panelu tagów i zarządzanie pamięcią podręczną obrazów.
 *
 * Zależności:
 * - `Dom`: dostarcza referencje do elementów DOM.
 * - `Utils`: zbiór funkcji pomocniczych (np. debounce, createButton).
 * - `BackendAPI`: komunikacja z backendem (generowanie, edycja, ocena).
 * - `KeyboardManager`: zarządzanie pozycjonowaniem pola tekstowego względem klawiatury ekranowej.
 * - `PanelsController`: obsługa paneli bocznych (menu, ustawienia).
 * - `EditManager`: tryb edycji wiadomości AI.
 * - `ChatUI`: interfejs czatu.
 * - `ChatManager`: logika przepływu wiadomości.
 * - `Diagnostics`: zbieranie danych o stanie aplikacji.
 * - `TagsPanel`, `GalleryLoader`: obsługa tagów i dynamicznej galerii obrazów.
 */

class App {
  /**
   * Tworzy instancję aplikacji i inicjalizuje wszystkie moduły.
   * Moduły są tworzone i powiązane ze sobą w odpowiedniej kolejności.
   */
  constructor() {
    this.dom = new Dom();
    this.utils = Utils;
    this.backendAPI = new BackendAPI();

    this.keyboardManager = new KeyboardManager(this.dom);
    this.panelsController = new PanelsController(this.dom);
    this.editManager = new EditManager(this.dom, this.backendAPI);
    this.chatUI = new ChatUI(this.dom, this.editManager);
    this.chatManager = new ChatManager(this.chatUI, this.backendAPI, this.dom);

    this.diagnostics = new Diagnostics(this.dom);
  }

  /**
   * Dodaje przycisk do panelu ustawień umożliwiający wyczyszczenie pamięci podręcznej obrazów.
   * Usuwa wpisy `img-exists:*` z `localStorage` i wyświetla komunikat z liczbą usuniętych rekordów.
   */
  addClearImageCacheButton() {
    const sidePanel = document.getElementById("side-panel");
    if (!sidePanel) return;

    const wrapper = document.createElement("div");
    wrapper.className = "mt-20";

    const label = document.createElement("label");
    label.className = "text-sm block mb-5";
    label.textContent = "Pamięć obrazów:";

    const btn = Utils.createButton("🧹 Wyczyść pamięć obrazów", () => {
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
    sidePanel.appendChild(wrapper);
  }

  /**
   * Wstawia zawartość szablonu `<template class="tag-panel-template">` do wskazanego kontenera DOM.
   * Inicjalizuje `TagsPanel` i `GalleryLoader` na podstawie wstawionego panelu.
   *
   * @param {string} targetSelector - Selektor miejsca, w którym ma się pojawić panel (domyślnie `#side-panel`).
   */
  renderTagPanel(targetSelector = "#side-panel") {
    const tpl = document.querySelector(".tag-panel-template");
    const target = document.querySelector(targetSelector);

    if (tpl && target) {
      const clone = tpl.content.cloneNode(true);
      target.appendChild(clone);

      const panelContainer = target;

      const tagsPanel = new TagsPanel(panelContainer);
      const galleryLoader = new GalleryLoader(panelContainer);

      tagsPanel.init((selectedTags) => {
        galleryLoader.loadFromAPI("/api/images", selectedTags);
      });

      console.log("[App] Tag panel wstawiony i zainicjalizowany.");
    }
  }

  /**
   * Inicjalizuje moduły zależne od panelu tagów.
   * Tworzy instancje `TagsPanel` i `GalleryLoader` oraz rejestruje callback aktualizujący galerię.
   */
  initTagModules() {
    this.tagsPanel = new TagsPanel(this.dom);
    this.galleryLoader = new GalleryLoader(this.dom);

    this.tagsPanel.init((selectedTags) => {
      console.log("[App] Wybrane tagi:", selectedTags);
      this.galleryLoader.loadFromAPI("/api/images", selectedTags);
    });
  }

  /**
   * Uruchamia aplikację:
   * - inicjalizuje menedżery klawiatury i paneli,
   * - rejestruje zdarzenia globalne (submit, Ctrl+Enter),
   * - dodaje przycisk czyszczenia pamięci obrazów,
   * - wypisuje komunikat o gotowości aplikacji.
   */
  init() {
    console.log("[App] Inicjalizacja aplikacji...");
    this.keyboardManager.init();
    this.panelsController.init();

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

    this.addClearImageCacheButton();
    console.log("[App] Aplikacja gotowa.");
  }
}


const app = new App();
app.init();
```
## Utils.js
```js
/**
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
 *
 * Zależności:
 * - `window`, `navigator.userAgent`: wykorzystywane do detekcji środowiska.
 * - `document`: używany do manipulacji DOM.
 * - `fetch`: do sprawdzania dostępności obrazów przez zapytania HEAD.
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
   * @param {number} length - Długość identyfikatora (domyślnie 8).
   * @returns {string} Losowy identyfikator, np. "x9f3k2a1".
   */
  static randomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  }

  /**
   * Sprawdza, czy użytkownik korzysta z urządzenia mobilnego na podstawie `navigator.userAgent`.
   * Wypisuje wynik detekcji w konsoli.
   *
   * @returns {boolean} True, jeśli urządzenie jest mobilne.
   */
  static isMobile() {
    if (typeof window !== "undefined") {
      console.log(
        "[Utils] Detekcja mobilna:",
        navigator.userAgent,
        "→",
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      );
      return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
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
```
## TagsPanel.js
```js
/**
 * TagsPanel
 * =========
 * Klasa odpowiedzialna za zarządzanie panelem tagów w interfejsie użytkownika.
 * Obsługuje:
 * - dynamiczne tworzenie pól tagów (lokalizacja, postać, czynność, emocja, NSFW),
 * - reagowanie na zmiany wartości tagów i przekazywanie ich do callbacka,
 * - aktualizację galerii obrazów na podstawie wybranych tagów,
 * - czyszczenie pól tagów,
 * - integrację z `TagSelectorFactory`, `GalleryLoader` i `ImageResolver`.
 *
 * Zależności:
 * - `TagSelectorFactory`: generuje komponenty tagów (`<select>` lub `<input list>`), zależnie od urządzenia.
 * - `GalleryLoader`: renderuje obrazy na podstawie tagów.
 * - `ImageResolver`: wykorzystywany pośrednio przez `GalleryLoader` do generowania URLi obrazów.
 * - `Utils.debounce()`: ogranicza częstotliwość aktualizacji galerii przy zmianach tagów.
 */

class TagsPanel {
  /**
   * Tworzy instancję klasy TagsPanel.
   * Inicjalizuje kontener, loader galerii, pola tagów oraz galerię obrazów.
   *
   * @param {HTMLElement} container - Kontener panelu tagów (np. sklonowany z <template>).
   * @param {GalleryLoader} galleryLoader - Instancja klasy GalleryLoader do renderowania obrazów.
   * @throws {Error} Jeśli przekazany kontener nie jest elementem DOM.
   */
  constructor(container, galleryLoader) {
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
    this.galleryLoader = galleryLoader;

    /** @type {Object.<string, HTMLElement>} Referencje do pól tagów */
    this.fields = {};

    this.buildTagFields();
    this.refreshGallery();

    /** @type {HTMLElement} Element galerii obrazów */
    const gallery = document.createElement("div");
    gallery.id = "image-gallery";
    gallery.className = "gallery-grid mt-10";
    this.container.appendChild(gallery);
    this.gallery = gallery;
  }

  /**
   * Skrót do `querySelector` w obrębie kontenera.
   * Jeśli element nie zostanie znaleziony, wypisuje ostrzeżenie.
   *
   * @param {string} selector - Selektor CSS.
   * @returns {HTMLElement|null} Znaleziony element lub null.
   */
  q(selector) {
    const el = this.container.querySelector(selector);
    if (!el) {
      console.warn(`[TagsPanel] Nie znaleziono elementu: ${selector}`, this.container);
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
      emotion: ["joy", "sadness", "fear", "love"]
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
   * Po każdej zmianie wywoływany jest callback i aktualizowana jest galeria.
   *
   * @param {Function} onChange - Funkcja wywoływana przy każdej zmianie tagów.
   */
  init(onChange) {
    const debouncedRefresh = Utils.debounce(() => this.refreshGallery(), 300);

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
   *
   * @returns {string[]} Tablica wybranych tagów.
   */
  getTagList() {
    return Object.values(this.getSelectedTags()).filter(Boolean);
  }

  /**
   * Aktualizuje galerię obrazów na podstawie aktualnych tagów.
   * Wywołuje `GalleryLoader.renderFromTags()`.
   */
  refreshGallery() {
    const tags = this.getTagList();
    this.galleryLoader.renderFromTags(tags);
  }

  /**
   * Czyści wszystkie pola tagów.
   * Ustawia ich wartość na pustą i aktualizuje galerię.
   */
  clearTags() {
    Object.values(this.fields).forEach((field) => {
      if (field) field.value = "";
    });
    this.refreshGallery();
  }
}
```
### TagSelectorFactory.js
```js
/**
 * TagSelectorFactory
 * ==================
 * Klasa odpowiedzialna za tworzenie komponentów wyboru tagów w interfejsie użytkownika.
 * Dostosowuje typ komponentu do urządzenia:
 * - na urządzeniach mobilnych generuje element `<select>`,
 * - na desktopie generuje pole `<input>` z powiązanym `<datalist>`.
 *
 * Obsługuje:
 * - dynamiczne źródła opcji dla każdego pola tagu,
 * - etykiety opisowe dla pól,
 * - integrację z klasą `TagsPanel`, która zarządza całością panelu tagów.
 *
 * Zależności:
 * - `Utils.isMobile()`: wykorzystywane do detekcji typu urządzenia i wyboru odpowiedniego komponentu.
 * - `TagsPanel`: klasa, która wykorzystuje `TagSelectorFactory` do generowania pól tagów.
 */

class TagSelectorFactory {
  /**
   * Tworzy komponent tagu dla danego pola.
   * W zależności od urządzenia zwraca:
   * - `<label>` zawierający `<select>` z opcjami (na mobilnych),
   * - `<label>` zawierający `<input>` i `<datalist>` (na desktopie).
   *
   * @param {string} name - Nazwa pola (np. "location", "emotion").
   * @param {string[]} options - Lista opcji do wyboru.
   * @returns {HTMLElement} Gotowy element `<label>` zawierający komponent wyboru.
   */
  static createTagField(name, options) {
    const label = document.createElement("label");
    label.className = "text-base";
    label.textContent = `${TagSelectorFactory.getLabelText(name)}: `;

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
   * Zwraca etykietę tekstową dla danego pola tagu.
   * Używane do opisania pola w interfejsie użytkownika.
   *
   * @param {string} name - Nazwa pola (np. "location").
   * @returns {string} Tekst etykiety w języku polskim.
   */
  static getLabelText(name) {
    return {
      location: "Lokalizacja",
      character: "Postać",
      action: "Czynność (nonNSFW)",
      nsfw: "Czynność (NSFW)",
      emotion: "Emocja"
    }[name] || name;
  }

  /**
   * Podmienia istniejące pole tagu w kontenerze na nowe.
   * Usuwa poprzedni komponent i wstawia nowy wygenerowany przez `createTagField`.
   *
   * @param {HTMLElement} container - Kontener panelu tagów.
   * @param {string} name - Nazwa pola (np. "emotion").
   * @param {string[]} options - Lista opcji do wyboru.
   */
  static replaceTagField(container, name, options) {
    const old = container.querySelector(`#tag-${name}`);
    if (old) old.parentElement.removeChild(old);

    const newField = TagSelectorFactory.createTagField(name, options);
    container.appendChild(newField);
  }
}
```
### PanelsController.js
```js
/**
 * PanelsController
 * ================
 * Klasa odpowiedzialna za zarządzanie panelami bocznymi aplikacji.
 * Obsługuje:
 * - otwieranie i zamykanie paneli (np. menu nawigacyjne, ustawienia),
 * - przełączanie widoczności paneli na podstawie interakcji użytkownika,
 * - zapewnienie, że tylko jeden panel może być otwarty w danym momencie.
 *
 * Zależności:
 * - `Dom`: klasa dostarczająca referencje do elementów DOM, takich jak przyciski (`burgerToggle`, `settingsToggle`)
 *   oraz kontenery paneli (`webSidePanel`, `sidePanel`).
 * - Panele są identyfikowane przez klasę CSS `open`, która kontroluje ich widoczność.
 */

class PanelsController {
  /**
   * Tworzy instancję kontrolera paneli i rejestruje powiązania przycisków z panelami.
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
      { button: this.dom.settingsToggle, panel: this.dom.sidePanel },
    ];
  }

  /**
   * Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.
   * Po kliknięciu przycisku wywoływana jest funkcja przełączająca widoczność panelu.
   */
  init() {
    this.panels.forEach(({ button, panel }) => {
      if (!button || !panel) return;
      button.addEventListener("click", () => this.togglePanel(panel));
    });
  }

  /**
   * Otwiera wskazany panel i zamyka wszystkie pozostałe.
   * Dodaje klasę `open` do wybranego panelu.
   *
   * @param {HTMLElement} panel - Panel do otwarcia.
   */
  openPanel(panel) {
    this.closeAllPanels();
    panel.classList.add("open");
  }

  /**
   * Zamyka wskazany panel.
   * Usuwa klasę `open` z danego panelu.
   *
   * @param {HTMLElement} panel - Panel do zamknięcia.
   */
  closePanel(panel) {
    panel.classList.remove("open");
  }

  /**
   * Przełącza stan panelu — jeśli jest otwarty, zostanie zamknięty; jeśli zamknięty, zostanie otwarty.
   * Zapewnia, że tylko jeden panel może być otwarty w danym momencie.
   *
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
   * Zamyka wszystkie panele w aplikacji.
   * Usuwa klasę `open` ze wszystkich zarejestrowanych paneli.
   */
  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel.classList.remove("open"));
  }
}
```
### KeyboardManager.js
```js
/**
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

class KeyboardManager {
  /**
   * Tworzy instancję KeyboardManager z dostępem do elementów DOM.
   * Wykrywa, czy użytkownik korzysta z przeglądarki Firefox.
   *
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    /** @type {Dom} Referencje do elementów DOM */
    this.dom = domInstance;

    /** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
    this.isFirefox = /firefox/i.test(navigator.userAgent);
  }

  /**
   * Inicjalizuje nasłuchiwanie zdarzeń związanych z klawiaturą ekranową.
   * Używa API `visualViewport` do wykrywania zmian rozmiaru i scrolla.
   * Jeśli API jest niedostępne, wypisuje ostrzeżenie w konsoli.
   */
  init() {
    if (!window.visualViewport) {
      console.warn("[KeyboardManager] visualViewport API niedostępne.");
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

  /**
   * Aktualizuje pozycję pola `input-area`, tak aby znajdowało się nad klawiaturą.
   * Oblicza wysokość klawiatury na podstawie różnicy między `window.innerHeight` a `visualViewport.height + offsetTop`.
   * Ustawia wartość `bottom` w stylach CSS dla `input-area`.
   * Dodatkowo stosuje fix dla Firefoksa, który może mieć problemy z przewijaniem.
   */
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
```
### ImageResolver.js
```js
/**
 * ImageResolver
 * =============
 * Klasa odpowiedzialna za generowanie listy dostępnych obrazów na podstawie kombinacji tagów.
 * Obsługuje:
 * - tworzenie nazw plików z tagów,
 * - sprawdzanie dostępności obrazów (z cache, localStorage lub przez zapytanie HEAD),
 * - preloadowanie obrazów do przeglądarki,
 * - optymalizację zapytań przez pamięć podręczną.
 *
 * Zależności:
 * - `fetch`: do wykonywania zapytań HEAD w celu sprawdzenia dostępności obrazów.
 * - `localStorage`: do trwałego cache'owania wyników dostępności obrazów między sesjami.
 * - `Image`: do preloadowania obrazów w tle.
 * - Współpracuje z klasą `GalleryLoader`, która renderuje obrazy na podstawie URLi zwróconych przez `resolve()`.
 */

class ImageResolver {
  /** @type {string[]} Lista obsługiwanych rozszerzeń plików graficznych. */
  static extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  /** @type {string} Ścieżka bazowa do katalogu z obrazami. */
  static basePath = "/static/NarrativeIMG/";

  /** @type {Map<string, boolean>} Pamięć podręczna dostępności obrazów w bieżącej sesji. */
  static imageCache = new Map();

  /** @type {Set<string>} Rejestr URLi obrazów, które zostały już preloadowane. */
  static preloadRegistry = new Set();

  /**
   * Zwraca listę istniejących obrazów pasujących do tagów.
   * Generuje kombinacje tagów, tworzy potencjalne ścieżki plików,
   * sprawdza ich dostępność i preloaduje znalezione obrazy.
   *
   * @param {string[]} tags - Lista tagów (maksymalnie 5).
   * @returns {Promise<string[]>} Lista URLi obrazów, które faktycznie istnieją.
   */
  static async resolve(tags) {
    const combos = ImageResolver.generateCombinations(tags);
    const candidates = [];

    combos.forEach((combo) => {
      ImageResolver.extensions.forEach((ext) => {
        candidates.push(`${ImageResolver.basePath}${combo}${ext}`);
      });
    });

    const results = [];
    for (const url of candidates) {
      const exists = await ImageResolver.checkImageExists(url);
      if (exists) results.push(url);
    }

    ImageResolver.preloadImages(results);
    return results;
  }

  /**
   * Sprawdza, czy obraz istnieje — najpierw z localStorage, potem przez zapytanie HEAD.
   * Wynik jest zapisywany zarówno w `imageCache`, jak i w `localStorage` dla trwałości.
   *
   * @param {string} url - URL obrazka do sprawdzenia.
   * @returns {Promise<boolean>} True jeśli obraz istnieje, false w przeciwnym razie.
   */
  static async checkImageExists(url) {
    const cached = localStorage.getItem(`img-exists:${url}`);
    if (cached !== null) {
      const exists = cached === "true";
      ImageResolver.imageCache.set(url, exists);
      return exists;
    }

    try {
      const res = await fetch(url, { method: "HEAD" });
      const exists = res.ok;
      ImageResolver.imageCache.set(url, exists);
      localStorage.setItem(`img-exists:${url}`, String(exists));
      return exists;
    } catch {
      ImageResolver.imageCache.set(url, false);
      localStorage.setItem(`img-exists:${url}`, "false");
      return false;
    }
  }

  /**
   * Preloaduje obrazy do przeglądarki (jeśli jeszcze nie były).
   * Tworzy obiekty `Image` i ustawia ich `src`, co powoduje wczytanie obrazów w tle.
   *
   * @param {string[]} urls - Lista URLi obrazów do preloadowania.
   */
  static preloadImages(urls) {
    urls.forEach((url) => {
      if (ImageResolver.preloadRegistry.has(url)) return;

      const img = new Image();
      img.src = url;
      ImageResolver.preloadRegistry.add(url);
    });
  }

  /**
   * Generuje wszystkie możliwe kombinacje tagów (od 1 do 5) połączone znakiem `_`.
   * Kombinacje są generowane rekurencyjnie, bez powtórzeń i w kolejności zachowującej oryginalne tagi.
   *
   * @param {string[]} tags - Lista tagów wejściowych.
   * @returns {string[]} Lista nazw plików (bez rozszerzeń) wygenerowanych z kombinacji tagów.
   */
  static generateCombinations(tags) {
    const results = [];

    const recurse = (prefix, remaining) => {
      if (prefix.length > 0) results.push(prefix.join("_"));
      if (prefix.length === 5 || remaining.length === 0) return;

      for (let i = 0; i < remaining.length; i++) {
        recurse([...prefix, remaining[i]], remaining.slice(i + 1));
      }
    };

    recurse([], tags);
    return results;
  }
}
```
### GalleryLoader.js
```js
/**
 * GalleryLoader
 * =============
 * Klasa odpowiedzialna za ładowanie i renderowanie obrazów w galerii znajdującej się w przekazanym kontenerze DOM.
 * Obsługuje:
 * - czyszczenie galerii,
 * - wyświetlanie komunikatów informacyjnych,
 * - renderowanie obrazów z URLi,
 * - pobieranie danych z API i aktualizację widoku,
 * - integrację z tagami i wybór obrazów przez użytkownika.
 *
 * Zależności:
 * - `ImageResolver`: generuje listę URLi obrazów na podstawie tagów.
 * - `Utils`: dostarcza funkcje pomocnicze (np. tworzenie przycisków, debounce).
 * - `HTMLElement` z `#image-gallery` musi istnieć w przekazanym kontenerze.
 */

class GalleryLoader {
  /**
   * Tworzy instancję loadera i lokalizuje element galerii w przekazanym kontenerze.
   * @param {HTMLElement} container - Kontener panelu tagów zawierający galerię.
   * @throws {Error} Jeśli przekazany kontener nie jest elementem DOM.
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

  /**
   * Czyści zawartość galerii — usuwa wszystkie dzieci z elementu `#image-gallery`.
   */
  clearGallery() {
    if (this.gallery) this.gallery.innerHTML = "";
  }

  /**
   * Wyświetla komunikat tekstowy w galerii.
   * Czyści poprzednią zawartość i dodaje nowy element z wiadomością.
   * @param {string} message - Tekst komunikatu do wyświetlenia.
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
   * Renderuje obrazy na podstawie tagów (z użyciem ImageResolver).
   * Pobiera listę URLi i przekazuje je do metody renderującej.
   * @param {string[]} tags - Lista tagów do przetworzenia.
   */
  async renderFromTags(tags) {
    const urls = await ImageResolver.resolve(tags);
    this.renderImages(urls);
  }

  /**
   * Renderuje obrazy w galerii na podstawie przekazanych URLi.
   * Każdy obraz jest dodawany jako element `<img>` z atrybutem `loading="lazy"`,
   * opakowany w `<label>` z ukrytym `input[type="radio"]` umożliwiającym wybór.
   * @param {string[]} urls - Tablica URLi obrazów do wyświetlenia.
   */
  renderImages(urls) {
    if (!this.gallery) return;
    this.gallery.innerHTML = "";

    urls.forEach((url) => {
      const wrapper = document.createElement("label");
      wrapper.className = "image-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "image";
      input.value = url;
      input.style.display = "none";

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Tag image";
      img.loading = "lazy";

      wrapper.appendChild(input);
      wrapper.appendChild(img);
      this.gallery.appendChild(wrapper);

      img.addEventListener("click", () => {
        input.checked = true;
        this.highlightSelected(wrapper);
      });
    });
  }

  /**
   * Podświetla wybrany obraz w galerii.
   * Usuwa klasę `selected` ze wszystkich obrazów i dodaje ją do wybranego.
   * @param {HTMLElement} selectedWrapper - Element `<label>` zawierający wybrany obraz.
   */
  highlightSelected(selectedWrapper) {
    const all = this.gallery.querySelectorAll(".image-option");
    all.forEach((el) => el.classList.remove("selected"));
    selectedWrapper.classList.add("selected");
  }

  /**
   * Pobiera dane z API i renderuje obrazy w galerii.
   * Obsługuje:
   * - parametry zapytania,
   * - komunikaty ładowania,
   * - obsługę błędów,
   * - informację o braku wyników.
   *
   * @param {string} endpoint - Ścieżka API do pobrania danych.
   * @param {Object} params - Obiekt z parametrami zapytania (opcjonalny).
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
      console.error("[GalleryLoader] Błąd ładowania obrazów:", err);
      this.showMessage("Błąd ładowania obrazów.");
    }
  }
}
```
### EditManager.js
```js
/**
 * EditManager
 * ===========
 * Klasa odpowiedzialna za obsługę procesu edycji wiadomości AI w interfejsie czatu.
 * Umożliwia:
 * - uruchomienie trybu edycji inline (textarea, tagi, galeria obrazów),
 * - dynamiczne renderowanie obrazów na podstawie wybranych tagów,
 * - zapisanie zmian do backendu,
 * - anulowanie edycji i przywrócenie pierwotnej wiadomości.
 *
 * Zależności:
 * - `Dom`: dostarcza dostęp do szablonu panelu tagów (`tagPanelTemplate`) oraz innych elementów DOM.
 * - `BackendAPI`: umożliwia przesyłanie edytowanej wiadomości i tagów do backendu.
 * - `GalleryLoader`: renderuje obrazy na podstawie URLi wygenerowanych przez `ImageResolver`.
 * - `TagsPanel`: zarządza dynamicznymi polami tagów i aktualizacją galerii.
 * - `ImageResolver`: generuje listę dostępnych obrazów na podstawie kombinacji tagów.
 * - `Utils`: dostarcza funkcje pomocnicze, m.in. tworzenie przycisków.
 */

class EditManager {
  /**
   * Tworzy instancję klasy EditManager.
   * @param {Dom} dom - Instancja klasy Dom z dostępem do szablonu panelu tagów.
   * @param {BackendAPI} backendAPI - Instancja klasy BackendAPI do komunikacji z serwerem.
   */
  constructor(dom, backendAPI) {
    this.dom = dom;
    this.backendAPI = backendAPI;
  }

  /**
   * Uruchamia tryb edycji dla wskazanej wiadomości.
   * Tworzy interfejs edycji zawierający:
   * - pole tekstowe z oryginalną treścią,
   * - panel tagów,
   * - galerię obrazów,
   * - przyciski zapisu i anulowania.
   *
   * @param {HTMLElement} msgElement - Element wiadomości do edycji.
   * @param {string} originalText - Oryginalna treść wiadomości.
   * @param {string} messageId - Identyfikator wiadomości (do backendu).
   * @param {string} sessionId - Identyfikator sesji (do backendu).
   */
  enableEdit(msgElement, originalText, messageId, sessionId) {
    if (!this.dom.tagPanelTemplate?.content) {
      console.error("[EditManager] Brak szablonu tagPanelTemplate w DOM.");
      return;
    }

    msgElement.innerHTML = "";

    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.rows = 6;
    textarea.className = "form-element textarea-base w-full fix-w-full mt-10";

    const tagPanel = document.createElement("div");
    tagPanel.className = "tag-panel";

    const galleryLoader = new GalleryLoader(tagPanel);
    const tagsPanel = new TagsPanel(tagPanel, galleryLoader);
    tagsPanel.init(() => {
      galleryLoader.renderFromTags(tagsPanel.getTagList());
    });

    const imageGallery = tagPanel.querySelector("#image-gallery");

    const saveBtn = Utils.createButton("💾 Zapisz", async () => {
      const tags = this.getSelectedTags(tagPanel);
      const selectedImage = tagPanel.querySelector("input[name='image']:checked")?.value;

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

    const cancelBtn = Utils.createButton("❌ Anuluj", () => {
      msgElement.innerHTML = "";
      msgElement.innerText = originalText;
      const editBtn = Utils.createButton("✏️ Edytuj", () =>
        this.enableEdit(msgElement, originalText, messageId, sessionId)
      );
      msgElement.appendChild(editBtn);
    });

    msgElement.appendChild(textarea);
    msgElement.appendChild(tagPanel);
    msgElement.appendChild(saveBtn);
    msgElement.appendChild(cancelBtn);

    this.attachTagListeners(tagPanel, imageGallery);
    this.renderImages(tagPanel, imageGallery);
  }

  /**
   * Pobiera aktualnie wybrane tagi z panelu.
   * @param {HTMLElement} tagPanel - Kontener zawierający pola tagów.
   * @returns {string[]} Tablica niepustych wartości tagów.
   */
  getSelectedTags(tagPanel) {
    return ["location", "character", "action", "nsfw", "emotion"]
      .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
      .filter(Boolean);
  }

  /**
   * Podłącza nasłuchiwanie zmian w polach tagów.
   * Po każdej zmianie aktualizowana jest galeria obrazów.
   *
   * @param {HTMLElement} tagPanel - Kontener z polami tagów.
   * @param {HTMLElement} imageGallery - Element galerii obrazów.
   */
  attachTagListeners(tagPanel, imageGallery) {
    ["location", "character", "action", "nsfw", "emotion"].forEach((id) => {
      const el = tagPanel.querySelector(`#tag-${id}`);
      if (!el) return;

      const eventType = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventType, () => {
        this.renderImages(tagPanel, imageGallery);
      });
    });
  }

  /**
   * Renderuje obrazy na podstawie aktualnych tagów.
   * Pobiera listę URLi z `ImageResolver` i przekazuje je do `GalleryLoader`.
   *
   * @param {HTMLElement} tagPanel - Kontener z polami tagów.
   */
  async renderImages(tagPanel) {
    const tags = this.getSelectedTags(tagPanel);
    const urls = await ImageResolver.resolve(tags);
    const galleryLoader = new GalleryLoader(tagPanel);
    galleryLoader.renderImages(urls);
  }

  /**
   * Wysyła edytowaną wiadomość do backendu i aktualizuje widok wiadomości.
   * Po zapisaniu:
   * - usuwa interfejs edycji,
   * - wyświetla nową treść,
   * - dodaje obraz (jeśli wybrano),
   * - przywraca przycisk edycji.
   *
   * @param {Object} params - Parametry edycji.
   * @param {string} params.editedText - Zmieniona treść wiadomości.
   * @param {string[]} params.tags - Lista wybranych tagów.
   * @param {string} params.imageUrl - URL wybranego obrazu (opcjonalnie).
   * @param {HTMLElement} params.msgElement - Element wiadomości do aktualizacji.
   * @param {string} params.originalText - Oryginalna treść wiadomości.
   * @param {string} params.messageId - Identyfikator wiadomości.
   * @param {string} params.sessionId - Identyfikator sesji.
   */
  async submitEdit({
    editedText,
    tags,
    imageUrl,
    msgElement,
    originalText,
    messageId,
    sessionId,
  }) {
    try {
      await this.backendAPI.edit(editedText, tags, messageId, sessionId);

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

      const editBtn = Utils.createButton("✏️ Edytuj", () =>
        this.enableEdit(msgElement, editedText, messageId, sessionId)
      );
      msgElement.appendChild(editBtn);
    } catch (err) {
      console.error("[EditManager] Błąd zapisu edycji:", err);
      alert("Nie udało się zapisać edycji. 😞");
    }
  }
}
```
### Dom.js
```js
/**
 * Dom
 * ===
 * Centralna klasa odpowiedzialna za dostęp do elementów DOM w aplikacji.
 * Umożliwia:
 * - jednolite i bezpieczne pobieranie elementów interfejsu,
 * - przechowywanie referencji do najczęściej używanych komponentów,
 * - ograniczenie wielokrotnego wyszukiwania tych samych selektorów,
 * - łatwą modyfikację struktury HTML bez konieczności zmian w wielu miejscach kodu.
 *
 * Zależności:
 * - Klasa nie posiada zależności zewnętrznych, ale jest wykorzystywana przez inne komponenty aplikacji,
 *   takie jak `ChatUI`, `ChatManager`, `Diagnostics`, `EditManager`, które korzystają z jej referencji do elementów DOM.
 */

class Dom {
  /**
   * Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.
   * Wszystkie elementy są pobierane raz i przechowywane jako właściwości instancji.
   * W przypadku braku elementu, wypisywane jest ostrzeżenie w konsoli.
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

    /** @type {HTMLTemplateElement} Szablon panelu tagów */
    this.tagPanelTemplate = this.q("#tag-panel-template");
  }

  /**
   * Skrót do `document.querySelector` z walidacją.
   * Pobiera pierwszy element pasujący do selektora CSS.
   * Jeśli element nie zostanie znaleziony, wypisuje ostrzeżenie w konsoli.
   *
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
   * Skrót do `document.querySelectorAll`.
   * Pobiera wszystkie elementy pasujące do selektora CSS.
   *
   * @param {string} selector - Selektor CSS elementów.
   * @returns {NodeListOf<HTMLElement>} Lista znalezionych elementów.
   */
  qa(selector) {
    return document.querySelectorAll(selector);
  }
}
```
### Diagnostics.js
```js
/**
 * Diagnostics
 * ===========
 * Klasa odpowiedzialna za zbieranie i prezentowanie informacji diagnostycznych o stanie aplikacji.
 * Umożliwia:
 * - odczyt parametrów widoku (viewport, scroll, wysokości elementów),
 * - wyświetlanie danych w konsoli,
 * - wstawianie danych do pola tekstowego (np. #prompt),
 * - szybkie uruchomienie pełnej diagnostyki.
 *
 * Zależności:
 * - `Dom`: klasa dostarczająca referencje do elementów DOM, takich jak `chatWrapper`, `inputArea`, `prompt`.
 *   Instancja `Dom` musi być przekazana do konstruktora, aby `Diagnostics` mogła odczytywać pozycje i rozmiary elementów.
 */

class Diagnostics {
  /**
   * Tworzy instancję klasy Diagnostics z dostępem do elementów DOM.
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   */
  constructor(domInstance) {
    this.dom = domInstance;
  }

  /**
   * Zbiera dane diagnostyczne z bieżącego stanu aplikacji.
   * Odczytuje parametry z `visualViewport`, `window`, `document`, `body` oraz pozycje elementów DOM.
   *
   * @returns {Object} Obiekt zawierający następujące właściwości:
   * - `timestamp`: {string} aktualny czas w formacie HH:MM:SS,
   * - `visualViewportHeight`: {number} wysokość widocznego obszaru viewportu,
   * - `visualViewportOffsetTop`: {number} przesunięcie viewportu od góry,
   * - `visualViewportOffsetLeft`: {number} przesunięcie viewportu od lewej,
   * - `windowInnerHeight`: {number} wysokość okna wewnętrznego,
   * - `windowOuterHeight`: {number} wysokość okna zewnętrznego,
   * - `documentClientHeight`: {number} wysokość dokumentu HTML,
   * - `bodyClientHeight`: {number} wysokość elementu body,
   * - `wrapperOffsetTop`: {number} pozycja górna kontenera czatu,
   * - `wrapperOffsetBottom`: {number} pozycja dolna kontenera czatu,
   * - `wrapperHeight`: {number} wysokość kontenera czatu,
   * - `inputAreaOffsetTop`: {number} pozycja górna pola wejściowego,
   * - `inputAreaOffsetBottom`: {number} pozycja dolna pola wejściowego,
   * - `inputAreaHeight`: {number} wysokość pola wejściowego,
   * - `scrollY`: {number} aktualna pozycja scrolla pionowego,
   * - `scrollX`: {number} aktualna pozycja scrolla poziomego.
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
   * Wyświetla dane diagnostyczne w konsoli w formie tabeli.
   * Używa `console.table()` dla czytelnej prezentacji.
   */
  logToConsole() {
    console.table(this.collectData());
  }

  /**
   * Wstawia dane diagnostyczne do pola tekstowego (np. #prompt).
   * Formatowane jako lista klucz-wartość z jednostką `px`.
   * Jeśli wartość jest `null` lub `undefined`, zostaje zaokrąglona do 0.
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
   * Uruchamia pełną diagnostykę:
   * - wyświetla dane w konsoli (`console.table`),
   * - wstawia dane do pola tekstowego (#prompt).
   */
  run() {
    this.logToConsole();
    this.outputToPrompt();
  }
}
// Bardziej developer mode to przeprowadzania testów w console przeglądarki
```
### ChatUI.js
```js
/**
 * ChatUI
 * ======
 * Klasa odpowiedzialna za zarządzanie warstwą wizualną czatu.
 * Obsługuje:
 * - dodawanie wiadomości użytkownika i AI,
 * - wyświetlanie komunikatów ładowania i błędów,
 * - aktualizację odpowiedzi AI,
 * - dodawanie przycisku edycji i formularza oceny,
 * - przewijanie widoku do ostatniej wiadomości.
 *
 * Zależności:
 * - `Dom`: dostarcza referencje do kontenera czatu i innych elementów DOM.
 * - `EditManager`: obsługuje tryb edycji wiadomości AI.
 * - `Utils`: dostarcza funkcje pomocnicze (np. tworzenie przycisków).
 * - `app.backendAPI`: wykorzystywany w formularzu oceny do przesyłania danych.
 */

class ChatUI {
  /**
   * Tworzy instancję klasy ChatUI z dostępem do elementów DOM i menedżera edycji.
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   * @param {EditManager} editManager - Instancja klasy EditManager do obsługi edycji wiadomości.
   */
  constructor(domInstance, editManager) {
    this.dom = domInstance;
    this.editManager = editManager;
  }

  /**
   * Dodaje wiadomość do kontenera czatu.
   * Tworzy element `<div>` z klasą `message` i typem (`user` lub `ai`).
   * @param {string} type - Typ wiadomości (`user` lub `ai`).
   * @param {string} text - Treść wiadomości.
   */
  addMessage(type, text) {
    if (!this.dom.chatContainer) return;
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.textContent = text;
    this.dom.chatContainer.appendChild(msg);
    this.scrollToBottom();
  }

  /**
   * Dodaje wiadomość tymczasową informującą o generowaniu odpowiedzi.
   * Aktualizuje tekst co sekundę, pokazując czas oczekiwania.
   * @returns {{ msgEl: HTMLElement, timer: number }} Obiekt zawierający element wiadomości i identyfikator timera.
   */
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

  /**
   * Aktualizuje wiadomość AI po zakończeniu generowania.
   * Wstawia czas generowania i odpowiedź w formacie HTML.
   * @param {HTMLElement} msgEl - Element wiadomości do aktualizacji.
   * @param {string} response - Treść odpowiedzi AI.
   * @param {number} duration - Czas generowania w sekundach.
   */
  updateAIMessage(msgEl, response, duration) {
    msgEl.innerHTML = `⏱️ Czas generowania: ${duration}s<br><br>${response}`;
    this.scrollToBottom();
  }

  /**
   * Wyświetla komunikat błędu w wiadomości AI.
   * @param {HTMLElement} msgEl - Element wiadomości do aktualizacji.
   */
  showError(msgEl) {
    msgEl.textContent = "❌ Błąd generowania odpowiedzi.";
    this.scrollToBottom();
  }

  /**
   * Dodaje przycisk edycji do wiadomości.
   * Wywołuje EditManager.enableEdit() z przekazanym tekstem.
   * @param {HTMLElement} msgEl - Element wiadomości, do którego dodawany jest przycisk.
   * @param {string} originalText - Oryginalna treść wiadomości.
   * @param {string} [messageId="msg-temp"] - Identyfikator wiadomości (opcjonalny).
   * @param {string} [sessionId="session-temp"] - Identyfikator sesji (opcjonalny).
   */
  addEditButton(msgEl, originalText, messageId = "msg-temp", sessionId = "session-temp") {
    const btn = Utils.createButton("✏️ Edytuj", () => {
      this.editManager.enableEdit(msgEl, originalText, messageId, sessionId);
    });
    msgEl.appendChild(btn);
  }

  /**
   * Dodaje formularz oceny odpowiedzi AI.
   * Formularz zawiera suwaki dla pięciu kryteriów oraz przycisk wysyłania.
   * Po kliknięciu wysyła dane do backendu.
   */
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
      details.appendChild(document.createTextNode(polishLabels[index] + ": "));
      details.appendChild(input);
    });

    const submitBtn = Utils.createButton("Wyślij ocenę", () => {
      details.querySelector("button").addEventListener("click", async () => {
        const ratings = {};
        details.querySelectorAll('input[type="range"]').forEach((input) => {
          ratings[input.name] = parseInt(input.value, 10);
        });

        try {
          await app.backendAPI.rate({ ratings: ratings });
          alert("Ocena wysłana!");
        } catch (err) {
          console.error("Błąd wysyłania oceny:", err);
        }
      });
    });
    details.appendChild(submitBtn);

    this.dom.chatContainer.appendChild(details);
  }

  /**
   * Przewija widok czatu do ostatniej wiadomości.
   */
  scrollToBottom() {
    this.dom.chatContainer.scrollTop = this.dom.chatContainer.scrollHeight;
  }
}
```
### ChatManager.js
```js
/**
 * ChatManager
 * ===========
 * Klasa odpowiedzialna za zarządzanie przepływem wiadomości między użytkownikiem, interfejsem czatu (ChatUI) i backendem (BackendAPI).
 * Stanowi centralny kontroler logiki czatu, łącząc warstwę UI z warstwą komunikacji serwerowej.
 * Obsługuje:
 * - odczytanie promptu od użytkownika,
 * - wysłanie zapytania do backendu,
 * - wyświetlenie odpowiedzi AI,
 * - obsługę błędów,
 * - dodanie opcji edycji i oceny odpowiedzi.
 *
 * Zależności:
 * - `ChatUI`: odpowiada za manipulację interfejsem użytkownika (dodawanie wiadomości, komunikatów, przycisków).
 * - `BackendAPI`: odpowiada za komunikację z serwerem (generowanie odpowiedzi, przesyłanie ocen, edycja).
 * - `Dom`: dostarcza referencje do elementów DOM (np. pole promptu).
 */

class ChatManager {
  /**
   * Tworzy instancję klasy ChatManager z dostępem do interfejsu czatu, API backendu i elementów DOM.
   * @param {ChatUI} chatUI - Instancja klasy ChatUI, odpowiedzialna za warstwę wizualną czatu.
   * @param {BackendAPI} backendAPI - Instancja klasy BackendAPI, odpowiedzialna za komunikację z backendem.
   * @param {Dom} dom - Instancja klasy Dom, zawierająca referencje do elementów DOM.
   */
  constructor(chatUI, backendAPI, dom) {
    this.chatUI = chatUI;
    this.backendAPI = backendAPI;
    this.dom = dom;
  }

  /**
   * Wysyła prompt użytkownika do backendu i obsługuje odpowiedź.
   * Proces obejmuje:
   * - walidację i czyszczenie pola tekstowego,
   * - dodanie wiadomości użytkownika do czatu,
   * - wyświetlenie komunikatu ładowania,
   * - wysłanie zapytania do backendu,
   * - aktualizację wiadomości AI z odpowiedzią,
   * - dodanie przycisku edycji i formularza oceny,
   * - obsługę błędów i przywrócenie interaktywności pola tekstowego.
   *
   * @returns {Promise<void>}
   */
  async sendPrompt() {
    const prompt = this.dom.prompt.value.trim();
    if (!prompt) return;

    // Dezaktywuj pole i wyczyść
    this.dom.prompt.value = "";
    this.dom.prompt.disabled = true;

    // Dodaj wiadomość użytkownika
    this.chatUI.addMessage("user", prompt);

    // Dodaj komunikat ładowania
    const { msgEl, timer } = this.chatUI.addLoadingMessage();
    const startTime = Date.now();

    try {
      // Wyślij zapytanie do backendu
      const data = await this.backendAPI.generate(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      clearInterval(timer);

      // Zaktualizuj wiadomość AI
      this.chatUI.updateAIMessage(msgEl, data.response, duration);

      // Dodaj przycisk edycji i formularz oceny
      this.chatUI.addEditButton(msgEl, data.response);
      this.chatUI.addRatingForm(msgEl, this.backendAPI);
    } catch (err) {
      clearInterval(timer);
      this.chatUI.showError(msgEl);
      console.error("[ChatManager] Błąd generowania:", err);
    } finally {
      // Przywróć interaktywność pola promptu
      this.dom.prompt.disabled = false;
    }
  }
}
```
### BackendAPI.js
```js
/**
 * BackendAPI
 * ==========
 * Klasa odpowiedzialna za komunikację z backendem aplikacji.
 * Stanowi warstwę abstrakcji nad interfejsem HTTP i obsługuje:
 * - generowanie odpowiedzi na podstawie promptu użytkownika,
 * - przesyłanie ocen wygenerowanych odpowiedzi,
 * - edycję odpowiedzi z uwzględnieniem tagów.
 * Wszystkie metody wykorzystują `fetch` z metodą POST i przesyłają dane w formacie JSON.
 * 
 * Zależności:
 * - Klasa nie posiada zależności zewnętrznych, ale jest wykorzystywana przez komponenty frontendowe takie jak `ChatManager`, `EditManager` czy `ChatUI`,
 *   które korzystają z jej metod do komunikacji z serwerem.
 */

class BackendAPI {
  /**
   * Wysyła prompt użytkownika do backendu w celu wygenerowania odpowiedzi.
   * @param {string} prompt - Treść zapytania od użytkownika.
   * @returns {Promise<Object>} Obiekt z odpowiedzią wygenerowaną przez backend.
   * @throws {Error} Jeśli odpowiedź HTTP nie jest poprawna (np. kod statusu ≠ 200).
   */
  async generate(prompt) {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    return res.json();
  }

  /**
   * Przesyła oceny wygenerowanej odpowiedzi do backendu.
   * @param {Object} ratings - Obiekt zawierający oceny, np.:
   *   {
   *     Narrative: number,
   *     Style: number,
   *     Logic: number,
   *     Quality: number,
   *     Emotions: number
   *   }
   * @returns {Promise<Object>} Obiekt z potwierdzeniem lub odpowiedzią backendu.
   * @throws {Error} Jeśli odpowiedź HTTP nie jest poprawna.
   */
  async rate(ratings) {
    const res = await fetch("/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ratings),
    });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    return res.json();
  }

  /**
   * Przesyła edytowaną odpowiedź wraz z tagami do backendu.
   * @param {string} editedText - Zmieniona treść odpowiedzi.
   * @param {Object} tags - Obiekt zawierający tagi powiązane z odpowiedzią, np.:
   *   {
   *     location: string,
   *     character: string,
   *     action: string,
   *     nsfw: string,
   *     emotion: string
   *   }
   * @returns {Promise<Object>} Obiekt z odpowiedzią backendu po edycji.
   * @throws {Error} Jeśli odpowiedź HTTP nie jest poprawna.
   */
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
```