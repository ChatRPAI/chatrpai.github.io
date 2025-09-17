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

   static inFlight = new Map();

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
static async resolve(tags, logger = null) {
  this.logger = logger;
  const combos = ImageResolver.generateCombinations(tags);
  const results = [];

  for (const combo of combos) {
    for (const ext of this.extensions) {
      const url = this.basePath + combo + ext;
      if (await this.checkImageExists(url)) {
        results.push(url);
        break;
      }
    }
  }

  this.preloadImages(results);
  return results;
}



  /**
   * Sprawdza, czy obraz istnieje — najpierw z localStorage, potem przez zapytanie HEAD.
   * Wynik jest zapisywany zarówno w `imageCache`, jak i w `localStorage` dla trwałości.
   *
   * @param {string} url - URL obrazka do sprawdzenia.
   * @returns {Promise<boolean>} True jeśli obraz istnieje, false w przeciwnym razie.
   */
  static async checkImageExists(url, logger = null) {
    // 1) in-memory cache (true/false)
    if (this.imageCache.has(url)) {
      // tylko logujemy ponownie TRUE
      if (this.imageCache.get(url)) {
        if (logger) logger.record("log", `[ImageResolver] Cache (in-memory) ✔ ${url}`);
    }
    return this.imageCache.get(url);
  }

  // 2) deduplikacja równoległych wywołań
  if (this.inFlight.has(url)) {
    // log tylko raz per URL
    if (!this._loggedInFlight) {
      if (logger) logger.record("log", `[ImageResolver] Dedup in-flight HEAD: ${url}`);
      this._loggedInFlight = new Set();
      this._loggedInFlight.add(url);
    }
    return this.inFlight.get(url);
  }

  // 3) single HEAD + cache
  const promise = (async () => {
    // 3a) localStorage – tylko true
    const stored = localStorage.getItem(`img-exists:${url}`);
    if (stored === "true") {
      this.imageCache.set(url, true);
      if (logger) logger.record("log", `[ImageResolver] Cache (localStorage) ✔ ${url}`);
      return true;
    }

    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        // tylko zapamiętujemy w LS gdy TRUE
        localStorage.setItem(`img-exists:${url}`, "true");
        this.imageCache.set(url, true);
        if (logger) logger.record("log", `[ImageResolver] HEAD ✔ ${url}`);
        return true;
      } else {
        // tylko in-memory
        this.imageCache.set(url, false);
        return false;
      }
    } catch (err) {
      // logujemy tylko błędy sieci HEAD
      if (logger) logger.record("error", `[ImageResolver] HEAD error ${url}`, err);
      this.imageCache.set(url, false);
      return false;
    }
  })();

  this.inFlight.set(url, promise);

  const exists = await promise;
  this.inFlight.delete(url);
  return exists;
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

  // pozostałe pola…

  /**
   * Generuje wszystkie możliwe permutacje tagów (od 1 do N) połączone znakiem '_'.
   * Dla ['forest','healing','Lytha'] zwróci między innymi:
   *  'forest', 'healing', 'Lytha',
   *  'forest_healing', 'healing_forest',
   *  'forest_Lytha', 'Lytha_forest',
   *  'healing_Lytha', 'Lytha_healing',
   *  'forest_healing_Lytha', 'forest_Lytha_healing', …
   *
   * @param {string[]} tags
   * @returns {string[]}
   */
  static generateCombinations(tags) {
    const results = [];

    function permute(prefix, remaining) {
      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i];
        const newPrefix = prefix.concat(next);
        results.push(newPrefix.join("_"));
        // buduj dalej permutacje z pominięciem użytego elementu
        const nextRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
        permute(newPrefix, nextRemaining);
      }
    }

    permute([], tags);
    return results;
  }
}
```
```js
// 🧪 DiagnosticsTests.js

Diagnostics.register("testTagMapping", () => {
  const tag = "healing";
  const cat = categorizeTag(tag);
  Diagnostics.assertEqual(cat, "action");
});

Diagnostics.register("testGalleryLoaderContainer", () => {
  const container = document.createElement("div");
  const loader = new GalleryLoader(container);
  Diagnostics.assertType(loader.container, "object");
});

Diagnostics.register("testImageResolverOutput", () => {
  const url = ImageResolver.resolve(["forest"], LoggerService);
  Diagnostics.assertType(url, "string");
  Diagnostics.assertEqual(url.includes("forest"), true);
});

Diagnostics.register("testUtilsDebounce", () => {
  let counter = 0;
  const fn = Utils.debounce(() => counter++, 100);
  fn(); fn(); fn();
  setTimeout(() => {
    Diagnostics.assertEqual(counter, 1);
  }, 150);
});

Diagnostics.register("testLoggerServiceRecord", () => {
  LoggerService.record("info", "Test log", { foo: "bar" });
  const history = LoggerService.getHistory();
  Diagnostics.assertType(history, "object");
  Diagnostics.assertEqual(Array.isArray(history), true);
});

Diagnostics.register("testTagsPanelStructure", () => {
  const container = document.createElement("div");
  const gallery = new GalleryLoader(container);
  const panel = new TagsPanel(container, gallery);
  Diagnostics.assertType(panel.fields.location, "object");
  Diagnostics.assertEqual(typeof panel.getTagList, "function");
});

Diagnostics.register("testRatingFormRender", () => {
  const msgEl = document.createElement("div");
  RatingForm.render(msgEl);
  const stars = msgEl.querySelectorAll(".rating-star");
  Diagnostics.assertEqual(stars.length > 0, true);
});

Diagnostics.register("testSenderRegistryClass", () => {
  const cls = SenderRegistry.getClass("Lytha");
  Diagnostics.assertType(cls, "string");
});

Diagnostics.register("testRequestRetryManager", async () => {
  const result = await RequestRetryManager.fetchWithRetry("/ping", {}, 1, 100);
  Diagnostics.assertType(result.status, "number");
});

Diagnostics.register("testPromptValidator", () => {
  const result = PromptValidator.validate("Hello");
  Diagnostics.assertEqual(result.valid, true);
});

await RequestRetryManager.fetchWithRetry("/rate", {}, 3, 1000, {
  silent: false,
  logger: LoggerService
});
```
```js
// TagCatalog – źródło prawdy do rozpoznawania tagów per kategoria
const TagCatalog = {
  location: new Set(["forest", "castle", "cave", "village"]),
  character: new Set(["Lytha", "Aredia", "Xavier"]),
  action: new Set(["healing", "combat", "ritual"]),
  nsfw: new Set(["intimacy", "touch", "kiss"]),
  emotion: new Set(["joy", "sadness", "fear", "love"]),
};

// heurystyka dopasowania pojedynczego taga do kategorii
function categorizeTag(tag) {
  for (const [cat, set] of Object.entries(TagCatalog)) {
    if (set.has(tag)) return cat;
  }
  return null;
}

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

  async enableEdit(msgElement, originalText, messageId, sessionId) {
    const rawTags = (msgElement.dataset.tags || "").split("_").filter(Boolean);
    const mapped = {
      location: "",
      character: "",
      action: "",
      nsfw: "",
      emotion: "",
    };
    for (const t of rawTags) {
      const cat = categorizeTag(t);
      if (cat && !mapped[cat]) mapped[cat] = t;
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

    let bootstrapping = true;
    tagsPanel.init(() => {
      if (bootstrapping) return;
      galleryLoader.renderFromTags(tagsPanel.getTagList());
    });

    // ustaw wartości pól tagów
    const $ = (sel) => tagPanel.querySelector(sel);
    $("#tag-location").value = mapped.location || "";
    $("#tag-character").value = mapped.character || "";
    $("#tag-action").value = mapped.action || "";
    $("#tag-nsfw").value = mapped.nsfw || "";
    $("#tag-emotion").value = mapped.emotion || "";

    galleryLoader.renderFromTags(Object.values(mapped).filter(Boolean));
    bootstrapping = false;

    const saveBtn = Utils.createButton("💾 Zapisz", async () => {
      const tags = this.getSelectedTags(tagPanel);
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
        tags: rawTags,
        duration: msgElement._snapshot?.duration || "0",
        avatarUrl:
          msgElement._snapshot?.avatarUrl ||
          "/static/NarrativeIMG/Avatars/AI.png",
      });
    });
    cancelBtn.classList.add("button-base");

    msgElement.appendChild(textarea);
    msgElement.appendChild(tagPanel);
    msgElement.appendChild(saveBtn);
    msgElement.appendChild(cancelBtn);
  }

  async submitEdit(params) {
    // dopasuj wywołanie do BackendAPI.edit, które przyjmuje obiekt
    const updated = await this.backendAPI.edit({
      editedText: params.editedText,
      tags: params.tags,
      imageUrl: params.imageUrl,
      messageId: params.messageId,
      sessionId: params.sessionId,
    });
    // oczekujemy: { id, text, tags, avatarUrl, sender }
    const targetEl = params.msgElement;
    this.renderAIInto(targetEl, {
      id: updated.id || targetEl.dataset.msgId || "msg-temp",
      sender: updated.sender || (targetEl._snapshot?.sender ?? "AI"),
      text: updated.text,
      tags: updated.tags || [],
      duration:
        targetEl._snapshot?.timeText?.match(/(\d+(?:\.\d+)?)s/)?.[1] || "0",

      avatarUrl:
        updated.avatarUrl ||
        (targetEl._snapshot?.avatarUrl ??
          "/static/NarrativeIMG/Avatars/AI.png"),
      imageUrl: params.imageUrl, // priorytet dla wybranego obrazka z galerii
    });
  }

  /**
   * Rysuje pełną kartę AI wewnątrz istniejącego msgElement (bez tworzenia nowego).
   * API zgodne z ChatUI.addAIMessage
   */
  renderAIInto(
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
    avatar.innerHTML = `
    <img src="${avatarUrl}" alt="${sender} Avatar">
    <strong>${sender}</strong>
  `;

    const txt = document.createElement("div");
    txt.className = "msg-text";
    const p = document.createElement("p");
    p.innerHTML = UserManager.replacePlaceholders(text);
    txt.appendChild(p);

    const finalImgUrl =
      imageUrl ||
      (tags.length ? `/static/NarrativeIMG/${tags.join("_")}.jpg` : null);
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
    const urls = await ImageResolver.resolve(tags, LoggerService);
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
}
```
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


  /**
   * Renderuje obrazy w galerii na podstawie przekazanych URLi.
   * Każdy obraz jest dodawany jako element `<img>` z atrybutem `loading="lazy"`,
   * opakowany w `<label>` z ukrytym `input[type="radio"]` umożliwiającym wybór.
   * @param {string[]} urls - Tablica URLi obrazów do wyświetlenia.
   */
async renderFromTags(tags) {
  const gallery = this.gallery || this.container.querySelector("#image-gallery");
  if (!gallery) return;

  // 1) kombinacje (jak masz)
  const comboUrls = await ImageResolver.resolve(tags, LoggerService);

  // 2) fallback: pojedyncze tagi
  const singleUrls = [];
  for (const t of tags) {
    for (const ext of ImageResolver.extensions) {
      const url = `${ImageResolver.basePath}${t}${ext}`;
      // minimalizacja HEAD: sprawdzaj tylko jeśli nie ma w combo
      if (!comboUrls.includes(url) && await ImageResolver.checkImageExists(url)) {
        singleUrls.push(url);
        break;
      }
    }
  }

  const unique = Array.from(new Set([...comboUrls, ...singleUrls]));
  this.renderImages(unique);
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
      LoggerService.record("error", "[GalleryLoader] Błąd ładowania obrazów:", err);
      this.showMessage("Błąd ładowania obrazów.");
    }
  }
}
```