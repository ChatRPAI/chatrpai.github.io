# 📦 ChatUI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
- ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
- ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
- ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny

ChatUI
======
Kontroler interfejsu czatu:
- Renderuje wiadomości użytkownika i AI
- Obsługuje edycję, ocenę, błędy, ładowanie
- Waliduje prompt i przewija widok

---
## 🧬 Konstruktor

/**
Tworzy instancję ChatUI.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
⚙️ *@param {EditManager}* - Manager edycji wiadomości.
⚙️ *@param {BackendAPI}* - Interfejs komunikacji z backendem.
/

```js
constructor(domInstance, editManager, backendAPI) {
this.dom = domInstance;
    this.editManager = editManager;
    this.backendAPI = backendAPI;
    this.attachPromptLengthWatcher();
}
```

---
## 🔧 Metody

### `addUserMessage(text, id)`

Dodaje wiadomość użytkownika do czatu.


### `attachPromptLengthWatcher()`

Obserwuje długość promptu i aktywuje walidację.


### `addAIMessage({ id, sender, text, tags, duration, avatarUrl, timestamp })`

Dodaje wiadomość AI z avatarami, tagami i przyciskiem edycji.


### `_createBase(type, text, id, tags = [], duration = 0)`

Tworzy bazowy wrapper wiadomości.


### `addLoadingMessage()`

Dodaje wiadomość tymczasową z animacją ładowania.


### `showError(msgEl)`

Wyświetla komunikat błędu w wiadomości AI.


### `addRatingForm(msgEl)`

Dodaje przycisk edycji do wiadomości.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.


### `hydrateAIMessage(msgEl, data)`

Hydratuje wiadomość AI i dodaje formularz oceny.


---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `EditManager`
- `PromptValidator`
- `RatingForm`
- `SenderRegistry`
- `UserManager`
- `Utils`