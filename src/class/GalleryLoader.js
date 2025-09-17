/**
 * GalleryLoader
 * =============
 * Komponent odpowiedzialny za renderowanie galerii obrazów w przekazanym kontenerze.
 * Współpracuje z ImageResolver w celu wyszukiwania obrazów na podstawie tagów.
 * Umożliwia wybór obrazu przez użytkownika (radio name="gallery-choice").
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Renderowanie obrazów w kontenerze
 *   - Współpraca z ImageResolver
 *   - Obsługa wyboru obrazu przez użytkownika
 *   - Pobieranie obrazów z API (GET)
 *
 * ❌ Niedozwolone:
 *   - Logika promptów, edycji, ocen
 *   - Połączenia z BackendAPI poza prostym GET
 *   - Mutacje globalnego stanu
 *
 * TODO:
 *   - setMaxImages(n)
 *   - disableSelection()
 *   - exposeSelected(): string | null
 *   - support multi-select mode
 *
 * Refaktoryzacja?:
 *   - Rozdzielenie na podkomponenty:
 *     • GalleryRenderer → renderowanie i czyszczenie
 *     • GallerySelector → obsługa wyboru i podświetlenia
 *     • GalleryFetcher → integracja z ImageResolver i API
 */
class GalleryLoader {
  /**
   * @param {HTMLElement|{galleryContainer?:HTMLElement}} [root] - Kontener lub obiekt z polem galleryContainer.
   */
  constructor(root) {
    /** @type {HTMLElement|null} */
    this.container = null;
    /** @type {HTMLElement|null} */
    this.gallery = null;
    if (root) this.setContainer(root.galleryContainer || root);
  }

  /**
   * Ustawia kontener galerii. Obsługuje:
   * - <div id="image-gallery"> jako bezpośrednią galerię,
   * - dowolny <div> (galeria = ten div),
   * - wrapper zawierający element #image-gallery.
   *
   * @param {HTMLElement} el - Element kontenera
   */
  setContainer(el) {
    if (!(el instanceof HTMLElement)) {
      LoggerService.record("error", "[GalleryLoader] setContainer: brak HTMLElement", el);
      return;
    }
    this.container = el;
    this.gallery = el.querySelector?.("#image-gallery") || el;
  }

  /**
   * Czyści zawartość galerii.
   */
  clearGallery() {
    if (this.gallery) this.gallery.innerHTML = "";
  }

  /**
   * Pokazuje komunikat w galerii, czyszcząc poprzednią zawartość.
   *
   * @param {string} message - Treść komunikatu
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
   * Renderuje obrazy jako label z ukrytym input[type=radio] name="gallery-choice".
   * Dzięki temu EditManager może odczytać wybór.
   *
   * @param {string[]} urls - Lista URL-i obrazów
   */
  renderImages(urls) {
    if (!this.gallery) return;
    this.clearGallery();
    urls.forEach((url, idx) => {
      const label = document.createElement("label");
      label.className = "image-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "gallery-choice";
      input.value = url;
      input.style.display = "none";

      const img = document.createElement("img");
      img.src = url;
      img.alt = `Obraz ${idx + 1}`;
      img.loading = "lazy";

      label.append(input, img);
      this.gallery.appendChild(label);
      label.addEventListener("click", () => this._highlight(label));
    });
  }

  /**
   * Renderuje obrazy na podstawie tagów, używając ImageResolver.resolve().
   *
   * @param {string[]} tags - Lista tagów
   * @returns {Promise<void>}
   */
  async renderFromTags(tags) {
    if (!this.gallery) {
      LoggerService.record("error", "[GalleryLoader] Brak container w renderFromTags");
      return;
    }
    try {
      const urls = await ImageResolver.resolve(tags, { maxResults: 6 });
      if (urls.length === 0) {
        this.showMessage("❌ Brak obrazu dla tych tagów");
        return;
      }
      this.renderImages(urls);
      await this.highlightSelected(tags);
    } catch (err) {
      LoggerService.record("error", "[GalleryLoader] renderFromTags error", err);
      this.showMessage("❌ Błąd renderowania galerii.");
    }
  }

  /**
   * Podświetla obraz dopasowany do aktualnych tagów (pierwszy pasujący).
   * Ustawia również stan zaznaczenia radio.
   *
   * @param {string[]} tags - Lista tagów
   * @returns {Promise<void>}
   */
  async highlightSelected(tags) {
    if (!this.gallery) return;
    const target = await ImageResolver.resolveBest(tags);
    if (!target) return;
    const items = this.gallery.querySelectorAll(".image-option");
    items.forEach((label) => {
      const img = label.querySelector("img");
      const match = img && (img.src.endsWith(target) || img.src.includes(target));
      label.classList.toggle("selected", !!match);
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = !!match;
    });
  }

  /**
   * Ładuje obrazy z API i renderuje listę URL-i.
   * Endpoint może zwrócić: string[] lub { images: string[] }.
   *
   * @param {string} endpoint - URL endpointu API
   * @param {Record<string,string>} [params] - Parametry zapytania
   * @returns {Promise<void>}
   */
  async loadFromAPI(endpoint, params = {}) {
    if (!this.gallery) return;
    try {
      this.showMessage("Ładowanie...");
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([k, v]) => v && url.searchParams.append(k, v));
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const images = Array.isArray(data) ? data : (Array.isArray(data.images) ? data.images : []);
      if (!images.length) return this.showMessage("Brak wyników.");
      this.renderImages(images);
    } catch (err) {
      LoggerService.record("error", "[GalleryLoader] Błąd ładowania obrazów", err);
      this.showMessage("❌ Błąd ładowania obrazów.");
    }
  }

  /**
   * Zaznacza wybraną opcję i odznacza pozostałe.
   *
   * @param {HTMLElement} selected - Element label z klasą .image-option
   * @private
   */
  _highlight(selected) {
    if (!this.gallery) return;
    this.gallery.querySelectorAll(".image-option").forEach((el) => el.classList.remove("selected"));
    selected.classList.add("selected");
    const radio = selected.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}
