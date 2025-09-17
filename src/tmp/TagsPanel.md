# 📦 TagsPanel

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `TagsPanel` działa jako kontroler komponentu tagów + integracja z galerią
- ✅ Docelowo planowana separacja metod:
• `buildTagFields()` → `TagFieldBuilder`
• `init(onChange)` → `TagEventBinder`
• `notifyTagsChanged()` → `GallerySyncService`
• `getSelectedTags()` / `getTagList()` → `TagStateManager`
• `clearTags()` → `TagResetService`
- ✅ Możliwość dodania metod: `setTags()`, `disableTags()`, `validateTags()`, `getTagOptions()`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami

TagsPanel
=========
Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
- Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
- Obsługuje zmiany użytkownika i aktualizuje galerię
- Umożliwia odczyt i czyszczenie tagów

---
## 🧬 Konstruktor

/**
Tworzy instancję panelu tagów.
⚙️ *@param {HTMLElement}* - Element DOM, do którego zostanie podłączony panel.
/

```js
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
```

---
## 🔧 Metody

### `q(selector)`


### `buildTagFields()`

Tworzy pola tagów dynamicznie z użyciem `TagSelectorFactory`.
Wstawia je do kontenera i zapisuje referencje w `this.fields`.


### `init(onChange)`

Inicjalizuje nasłuchiwanie zmian w polach tagów.

**Parametry:**
- `onChange` (`Function`): Funkcja wywoływana przy każdej zmianie tagów.

### `getSelectedTags()`

Zwraca aktualnie wybrane tagi jako obiekt.


### `getTagList()`

Zwraca aktualnie wybrane tagi jako tablicę stringów.
Pomija puste wartości.


### `notifyTagsChanged()`

Aktualizuje galerię obrazów na podstawie aktualnych tagów.
Wywołuje `GalleryLoader.renderFromTags()`.


### `clearTags()`

Czyści wszystkie pola tagów.
Ustawia ich wartość na pustą i aktualizuje galerię.


### `setTagOptions(tagOptionsFromBackend)`

Zastępuje opcje tagów i przebudowuje pola na podstawie słownika z backendu.
Oczekuje kluczy w postaci "tag-location", "tag-character", ... (tak jak w tags.json).
Zachowuje this.gallery, jeśli już istnieje (pola mają być przed galerią).


### `applyDefaultsFromDataTags(dataTags, tagOptionsFromBackend)`

Ustawia domyślne wartości inputów na podstawie data-tags (np. "cave_kissing")
i słownika tagów z backendu. Jeśli jakiś tag nie występuje w żadnej kategorii — pomijamy.


---
## 🔗 Zależności

- `GalleryLoader`
- `LoggerService`
- `TagSelectorFactory`
- `TagsPanel`
- `Utils`