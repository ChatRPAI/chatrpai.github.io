/**
 * TagsPanel
 * =========
 * Komponent odpowiedzialny za renderowanie i obsługę pól tagów oraz synchronizację z galerią.
 * Integruje się z TagSelectorFactory i GalleryLoader, umożliwiając wybór tagów i podgląd obrazów.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Tworzenie i aktualizacja pól tagów
 *   - Synchronizacja z galerią
 *   - Emisja zmian tagów do świata zewnętrznego
 *   - Obsługa wartości domyślnych z data-tags
 *
 * ❌ Niedozwolone:
 *   - Walidacja promptów/tekstu
 *   - Operacje sieciowe (np. pobieranie tagów z backendu)
 *   - Logika edycji, ocen, renderowania wiadomości
 *
 * TODO:
 *   - setMaxTagsPerField(n)
 *   - disableFields()
 *   - exposeSelectedTags(): string[]
 *   - obsługa tagów wielokrotnego wyboru
 *
 * Refaktoryzacja?:
 *   - Rozdzielenie na podkomponenty:
 *     • TagsFieldManager → tworzenie i aktualizacja pól
 *     • TagsSync → synchronizacja z galerią
 *     • TagsDefaults → obsługa data-tags i presetów
 */
class TagsPanel {
  /**
   * Tworzy instancję panelu tagów.
   * @param {HTMLElement} container - Kontener DOM z miejscem na pola tagów i galerię.
   * @throws {Error} Gdy container nie jest HTMLElement.
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
        `[TagsPanel] Przekazany kontener nie jest elementem DOM. Otrzymano: ${actualType} → ${String(
          container
        )}`
      );
    }

    /** @type {HTMLElement} */
    this.container = container;

    /** @type {{(tags:string[]):void}|null} */
    this.onTagsChanged = null;

    /** @type {Record<string, HTMLInputElement|HTMLSelectElement>} */
    this.fields = {};

    // 1) Zbuduj pola (domyślne — jeśli nie nadpiszesz setTagOptions)
    this.buildTagFields();

    // 2) Galeria pod spodem
    const gallery = document.createElement("div");
    gallery.id = "image-gallery";
    gallery.className = "gallery-grid mt-10";
    this.container.appendChild(gallery);

    /** @type {HTMLElement} */
    this.gallery = gallery;

    // 3) Podłącz GalleryLoader (kontener wielorazowy)
    this.galleryLoader = new GalleryLoader({ galleryContainer: gallery });
    this.galleryLoader.setContainer(gallery);

    // 4) Pierwsza emisja
    this.notifyTagsChanged();
  }

  /**
   * Skrót do querySelector w obrębie panelu.
   * @param {string} selector - CSS selektor
   * @returns {HTMLElement|null}
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
   * Domyślna konstrukcja pól tagów (fallback, gdy nie użyjesz setTagOptions()).
   * W realu zwykle używasz setTagOptions(daneZBackendu).
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
      const fieldWrapper = TagSelectorFactory.createTagField(
        name,
        tagOptions[name] || []
      );
      this.container.appendChild(fieldWrapper);
      const field =
        fieldWrapper.querySelector(`#tag-${name}`) ||
        fieldWrapper.querySelector("input, select");

      this.fields[name] = field;
    });
  }

  /**
   * Inicjalizuje nasłuchiwanie zmian w polach tagów.
   * @param {(tagsObj:Record<string,string>)=>void} onChange - Callback wywoływany przy zmianie
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
        if (typeof onChange === "function")
          onChange(this.getSelectedTagsObject());
        debouncedRefresh();
      });
    });
  }

  /**
   * Zwraca aktualne tagi jako obiekt {nazwaKategorii: wartość}.
   * @returns {Record<string,string>}
   */
  getSelectedTagsObject() {
    return Object.fromEntries(
      Object.entries(this.fields).map(([k, el]) => [k, el?.value || ""])
    );
  }

  /**
   * Zwraca aktualne tagi jako lista stringów (bez pustych).
   * @returns {string[]}
   */
  getTagList() {
    return Object.values(this.getSelectedTagsObject()).filter(Boolean);
  }

  /**
   * Emisja zmiany tagów i synchronizacja galerii.
   */
  notifyTagsChanged() {
    const list = this.getTagList();
    if (typeof this.onTagsChanged === "function") {
      this.onTagsChanged(list);
    }
    this.galleryLoader?.renderFromTags(list);
  }

  /**
   * Czyści wszystkie pola tagów i odświeża galerię.
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
   * Zachowuje this.gallery — pola idą przed galerią.
   *
   * @param {Record<string,string[]>} tagOptionsFromBackend
   */
  setTagOptions(tagOptionsFromBackend) {
    const toFieldName = (k) => (k.startsWith("tag-") ? k.slice(4) : k);

    Array.from(this.container.children).forEach((child) => {
      if (child !== this.gallery) this.container.removeChild(child);
    });

    this.fields = {};
    Object.entries(tagOptionsFromBackend).forEach(([backendKey, options]) => {
      const name = toFieldName(backendKey);
      const fieldWrapper = TagSelectorFactory.createTagField(
        name,
        options || []
      );
      if (this.gallery && this.gallery.parentElement === this.container) {
        this.container.insertBefore(fieldWrapper, this.gallery);
      } else {
        this.container.appendChild(fieldWrapper);
      }
      const field =
        fieldWrapper.querySelector(`#tag-${name}`) ||
        fieldWrapper.querySelector("input, select");

      this.fields[name] = field;
    });
  }

  /**
   * Ustawia wartości domyślne na podstawie data-tags (np. "cave_kissing")
   * i słownika tagów z backendu. Pomija tokeny, których nie ma w żadnej kategorii.
   *
   * @param {string} dataTags - np. "cave_kissing"
   * @param {Record<string,string[]>} tagOptionsFromBackend
   */
  applyDefaultsFromDataTags(dataTags, tagOptionsFromBackend) {
    if (!dataTags) return;

    const tokens = dataTags.split("_").filter(Boolean);
    const mapBackendKeyToField = (k) => (k.startsWith("tag-") ? k.slice(4) : k);

    for (const token of tokens) {
      for (const [backendKey, options] of Object.entries(
        tagOptionsFromBackend
      )) {
        if (Array.isArray(options) && options.includes(token)) {
          const fieldName = mapBackendKeyToField(backendKey);
          const field = this.fields[fieldName];
          if (field) field.value = token;
          break;
        }
      }
    }
  }
}
