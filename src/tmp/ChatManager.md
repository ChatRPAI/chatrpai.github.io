# 📦 ChatManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
- ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
- ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
- ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony

ChatManager
===========
Centralny kontroler logiki czatu:
- Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
- Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy

---
## 🧬 Konstruktor

/**
Tworzy instancję ChatManager.
⚙️ *@param {ChatUI}* - Interfejs czatu.
⚙️ *@param {BackendAPI}* - Komunikacja z backendem.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
/

```js
constructor(chatUI, backendAPI, dom) {
this.chatUI = chatUI;
    this.backendAPI = backendAPI;
    this.dom = dom;
}
```

---
## 🔧 Metody

### `sendPrompt()`

Wysyła prompt użytkownika i obsługuje odpowiedź AI.


---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `LoggerService`