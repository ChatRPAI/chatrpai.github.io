# 📦 EditManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditManager` obsługuje pełny proces edycji wiadomości AI w interfejsie czatu
- ✅ Integruje się z `Dom`, `BackendAPI`, `LoggerService`, `GalleryLoader`, `TagsPanel`, `EditValidator`, `Utils`
- ✅ Obsługuje tryb edycji, walidację, zapis, anulowanie i renderowanie wiadomości
- ✅ Możliwość dodania metod: `disableEdit()`, `setSessionId()`, `validateBeforeSubmit()`
- ⚠️ Mapowanie tagów na kategorie powinno być oparte o dane JSON z backendu (np. `tag-location`, `tag-character`, ...)
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony

EditManager
===========
Kontroler procesu edycji wiadomości AI:
- Renderuje edytor, tagi, galerię
- Waliduje dane i wysyła do backendu
- Renderuje zaktualizowaną wiadomość

---
## 🧬 Konstruktor

/**
Tworzy instancję EditManager.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
⚙️ *@param {BackendAPI}* - Interfejs komunikacji z backendem.
⚙️ *@param {LoggerService}* - Logger aplikacji.
/

```js
constructor(dom, backendAPI, logger) {
this.dom = dom;
    this.backendAPI = backendAPI;
    this.logger = logger;
}
```

---
## 🔧 Metody

### `enableEdit(msgElement, originalText, messageId, sessionId)`

Włącza tryb edycji dla wiadomości AI.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `originalText` (`string`): Oryginalna treść wiadomości.
- `messageId` (`string`): ID wiadomości.
- `sessionId` (`string`): ID sesji.

### `submitEdit(params)`

Wysyła edytowaną wiadomość do backendu i renderuje ją.

**Parametry:**
- `params` (`Object`): Parametry edycji.

### `getSelectedTags(tagPanel)`

Renderuje wiadomość AI do DOM.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `data` (`Object`): Dane wiadomości.

### `renderImages(tagPanel)`

Renderuje obrazy na podstawie tagów.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.

---
## 🔗 Zależności

- `BackendAPI`
- `Dom`
- `EditManager`
- `EditValidator`
- `GalleryLoader`
- `ImageResolver`
- `LoggerService`
- `SenderRegistry`
- `TagsPanel`
- `UserManager`
- `Utils`