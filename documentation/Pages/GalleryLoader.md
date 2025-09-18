# GalleryLoader

Komponent odpowiedzialny za renderowanie galerii obrazów w przekazanym kontenerze.
Współpracuje z ImageResolver w celu wyszukiwania obrazów na podstawie tagów.
Umożliwia wybór obrazu przez użytkownika (radio name="gallery-choice").
## Zasady:
- ✅ Dozwolone:
  - Renderowanie obrazów w kontenerze
  - Współpraca z ImageResolver
  - Obsługa wyboru obrazu przez użytkownika
  - Pobieranie obrazów z API (GET)
- ❌ Niedozwolone:
  - Logika promptów, edycji, ocen
  - Połączenia z BackendAPI poza prostym GET
  - Mutacje globalnego stanu

---

## constructor

@param {HTMLElement|{galleryContainer?:HTMLElement}} [root] - Kontener lub obiekt z polem galleryContainer.

```javascript
  constructor(root) {
    /** @type {HTMLElement|null} */
    this.container = null;
    /** @type {HTMLElement|null} */
    this.gallery = null;
    if (root) this.setContainer(root.galleryContainer || root);
  }
```

---

    this.container = null;

---

## setContainer()

Ustawia kontener galerii. Obsługuje:
- `<div id="image-gallery">` jako bezpośrednią galerię,
- dowolny `<div>` (galeria = ten div),
- wrapper zawierający element #image-gallery.

**_@param_** *`{HTMLElement}`* _**el**_  Element kontenera

```javascript
  setContainer(el) {
    if (!(el instanceof HTMLElement)) {
      LoggerService.record(
        "error",
        "[GalleryLoader] setContainer: brak HTMLElement",
        el
      );
      return;
    }
    this.container = el;
    this.gallery = el.querySelector?.("#image-gallery") || el;
  }
```

---

## clearGallery()

Czyści zawartość galerii.

```javascript
  clearGallery() {
    if (this.gallery) this.gallery.innerHTML = "";
  }
```

---

## showMessage()

Pokazuje komunikat w galerii, czyszcząc poprzednią zawartość.

**_@param_** *`{string}`* _**message**_  Treść komunikatu

```javascript
  showMessage(message) {
    if (!this.gallery) return;
    this.clearGallery();
    const msg = document.createElement("div");
    msg.classList.add("gallery-message");
    msg.textContent = message;
    this.gallery.appendChild(msg);
  }
```

---

## renderImages()

Renderuje obrazy jako label z ukrytym input[type=radio] name="gallery-choice".
Dzięki temu EditManager może odczytać wybór.

**_@param_** *`{string[]}`* _**urls**_  Lista URL-i obrazów

```javascript
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
```

---

## renderFromTags()

Renderuje obrazy na podstawie tagów, używając ImageResolver.resolve().

**_@param_** *`{string[]}`* _**tags**_  Lista tagów

**@returns** *`{Promise<void>}`*

```javascript
  async renderFromTags(tags) {
    if (!this.gallery) {
      LoggerService.record(
        "error",
        "[GalleryLoader] Brak container w renderFromTags"
      );
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
      LoggerService.record(
        "error",
        "[GalleryLoader] renderFromTags error",
        err
      );
      this.showMessage("❌ Błąd renderowania galerii.");
    }
  }
```

---

## highlightSelected()

Podświetla obraz dopasowany do aktualnych tagów (pierwszy pasujący).
Ustawia również stan zaznaczenia radio.

**_@param_** *`{string[]}`* _**tags**_  Lista tagów

**@returns** *`{Promise<void>}`*

```javascript
  async highlightSelected(tags) {
    if (!this.gallery) return;
    const target = await ImageResolver.resolveBest(tags);
    if (!target) return;
    const items = this.gallery.querySelectorAll(".image-option");
    items.forEach((label) => {
      const img = label.querySelector("img");
      const match =
        img && (img.src.endsWith(target) || img.src.includes(target));
      label.classList.toggle("selected", !!match);
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = !!match;
    });
  }
```

---

## loadFromAPI()

Ładuje obrazy z API i renderuje listę URL-i.
Endpoint może zwrócić: string[] lub { images: string[] }.
@param {Record`<string,string>`} [params] - Parametry zapytania

**_@param_** *`{string}`* _**endpoint**_  URL endpointu API

**@returns** *`{Promise<void>}`*

```javascript
  async loadFromAPI(endpoint, params = {}) {
    if (!this.gallery) return;
    try {
      this.showMessage("Ładowanie...");
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(
        ([k, v]) => v && url.searchParams.append(k, v)
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const images = Array.isArray(data)
        ? data
        : Array.isArray(data.images)
        ? data.images
        : [];
      if (!images.length) return this.showMessage("Brak wyników.");
      this.renderImages(images);
    } catch (err) {
      LoggerService.record(
        "error",
        "[GalleryLoader] Błąd ładowania obrazów",
        err
      );
      this.showMessage("❌ Błąd ładowania obrazów.");
    }
  }
```

---

## _highlight()

Zaznacza wybraną opcję i odznacza pozostałe.
@private

**_@param_** *`{HTMLElement}`* _**selected**_  Element label z klasą .image-option

```javascript
  _highlight(selected) {
    if (!this.gallery) return;
    this.gallery
      .querySelectorAll(".image-option")
      .forEach((el) => el.classList.remove("selected"));
    selected.classList.add("selected");
    const radio = selected.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
```

---

## Pełny kod klasy

```javascript
class GalleryLoader {
  constructor(root) {
    this.container = null;
    this.gallery = null;
    if (root) this.setContainer(root.galleryContainer || root);
  }

  setContainer(el) {
    if (!(el instanceof HTMLElement)) {
      LoggerService.record(
        "error",
        "[GalleryLoader] setContainer: brak HTMLElement",
        el
      );
      return;
    }
    this.container = el;
    this.gallery = el.querySelector?.("#image-gallery") || el;
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

  async renderFromTags(tags) {
    if (!this.gallery) {
      LoggerService.record(
        "error",
        "[GalleryLoader] Brak container w renderFromTags"
      );
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
      LoggerService.record(
        "error",
        "[GalleryLoader] renderFromTags error",
        err
      );
      this.showMessage("❌ Błąd renderowania galerii.");
    }
  }

  async highlightSelected(tags) {
    if (!this.gallery) return;
    const target = await ImageResolver.resolveBest(tags);
    if (!target) return;
    const items = this.gallery.querySelectorAll(".image-option");
    items.forEach((label) => {
      const img = label.querySelector("img");
      const match =
        img && (img.src.endsWith(target) || img.src.includes(target));
      label.classList.toggle("selected", !!match);
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = !!match;
    });
  }

  async loadFromAPI(endpoint, params = {}) {
    if (!this.gallery) return;
    try {
      this.showMessage("Ładowanie...");
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(
        ([k, v]) => v && url.searchParams.append(k, v)
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const images = Array.isArray(data)
        ? data
        : Array.isArray(data.images)
        ? data.images
        : [];
      if (!images.length) return this.showMessage("Brak wyników.");
      this.renderImages(images);
    } catch (err) {
      LoggerService.record(
        "error",
        "[GalleryLoader] Błąd ładowania obrazów",
        err
      );
      this.showMessage("❌ Błąd ładowania obrazów.");
    }
  }

  _highlight(selected) {
    if (!this.gallery) return;
    this.gallery
      .querySelectorAll(".image-option")
      .forEach((el) => el.classList.remove("selected"));
    selected.classList.add("selected");
    const radio = selected.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}
```