# GalleryLoader

=============
Komponent odpowiedzialny za renderowanie galerii obrazów w przekazanym kontenerze.
Współpracuje z ImageResolver w celu wyszukiwania obrazów na podstawie tagów.
Umożliwia wybór obrazu przez użytkownika (radio name="gallery-choice").
Zasady:
-------
✅ Dozwolone:
  - Renderowanie obrazów w kontenerze
  - Współpraca z ImageResolver
  - Obsługa wyboru obrazu przez użytkownika
  - Pobieranie obrazów z API (GET)
❌ Niedozwolone:
  - Logika promptów, edycji, ocen
  - Połączenia z BackendAPI poza prostym GET
  - Mutacje globalnego stanu
TODO:
  - setMaxImages(n)
  - disableSelection()
  - exposeSelected(): string | null
  - support multi-select mode
Refaktoryzacja?:
  - Rozdzielenie na podkomponenty:
    • GalleryRenderer → renderowanie i czyszczenie
    • GallerySelector → obsługa wyboru i podświetlenia
    • GalleryFetcher → integracja z ImageResolver i API

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

## setContainer()

Ustawia kontener galerii. Obsługuje:
- `<div id="image-gallery">` jako bezpośrednią galerię,
- dowolny `<div>` (galeria = ten div),
- wrapper zawierający element #image-gallery.

**_@param_** *`{HTMLElement}`* _**el**_  Element kontenera

```javascript
  setContainer(el) {
    if (!(el instanceof HTMLElement)) {
      LoggerService.record("error", "[GalleryLoader] setContainer: brak HTMLElement", el);
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

## _highlight()

Zaznacza wybraną opcję i odznacza pozostałe.
@private

**_@param_** *`{HTMLElement}`* _**selected**_  Element label z klasą .image-option

```javascript
  _highlight(selected) {
    if (!this.gallery) return;
    this.gallery.querySelectorAll(".image-option").forEach((el) => el.classList.remove("selected"));
    selected.classList.add("selected");
    const radio = selected.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
```

---
