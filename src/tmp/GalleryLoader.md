# 📦 GalleryLoader

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `GalleryLoader` renderuje obrazy w galerii na podstawie tagów lub danych z API
- ✅ Obsługuje fallbacki, komunikaty, selekcję i błędy
- ✅ Integruje się z `ImageResolver`, `Utils`, `LoggerService`
- ⚠️ Brakuje metody `renderImages(urls)` — musi być zdefiniowana, bo jest wywoływana
- ✅ Możliwość dodania metod: `setLogger()`, `setGallerySelector()`, `destroy()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i czytelny

GalleryLoader
=============
Loader obrazów do galerii:
- Renderuje obrazy z tagów i z API
- Obsługuje komunikaty, błędy, selekcję
- Integruje się z `ImageResolver`, `Utils`, `LoggerService`

---
## 🧬 Konstruktor

/**
Tworzy instancję loadera.
⚙️ *@param {HTMLElement}* - Kontener zawierający `#image-gallery`.
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
        `[GalleryLoader] Przekazany kontener nie jest elementem DOM. ` +
          `Otrzymano: ${actualType} → ${String(container)}`
      );
    }

    /** @type {HTMLElement|null} Element galerii obrazów */
    this.gallery = container.querySelector("#image-gallery");
}
```

---
## 🔧 Metody

### `clearGallery()`


### `showMessage(message)`

Wyświetla komunikat w galerii.

**Parametry:**
- `message` (`string`): Tekst komunikatu.

### `renderImages(urls)`

Renderuje obrazy w galerii na podstawie przekazanych URLi.
Każdy obraz jest opakowany w `<label>` z ukrytym `input[type="radio"]`,
umożliwiającym wybór i podświetlenie.

**Parametry:**
- `urls` (`string[]`): Lista URLi obrazów do wyświetlenia.

### `renderFromTags(tags)`

Renderuje obrazy na podstawie tagów.

**Parametry:**
- `tags` (`string[]`): Lista tagów.

### `highlightSelected(selectedWrapper)`

Podświetla wybrany obraz.

**Parametry:**
- `selectedWrapper` (`HTMLElement`): Element `<label>` z obrazem.

### `loadFromAPI(endpoint, params = {})`

Pobiera dane z API i renderuje obrazy.

**Parametry:**
- `endpoint` (`string`): Ścieżka API.
- `params` (`Object`): Parametry zapytania.

---
## 🔗 Zależności

- `GalleryLoader`
- `ImageResolver`
- `LoggerService`
- `Utils`