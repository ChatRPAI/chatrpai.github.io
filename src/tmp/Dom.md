# 📦 Dom

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `Dom` centralizuje dostęp do elementów interfejsu
- ✅ Ułatwia testowanie, refaktoryzację i spójność struktury HTML
- ✅ Obsługuje walidację i logowanie braków przez `LoggerService`
- ✅ Możliwość dodania metod: `exists()`, `refresh()`, `getAll()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
- 💡 Należy ją przeanalizować pod kątem działania na różnych strukturach HTML/DOM w których nie musi być zawarte nigdy np.: "#chat-container"

Dom
===
Centralny rejestr elementów interfejsu:
- Pobiera i przechowuje referencje do komponentów UI
- Obsługuje walidację i logowanie braków

---
## 🧬 Konstruktor

/**
Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.
/

```js
constructor() {
/** @type {HTMLElement} Główny wrapper aplikacji */
    this.app = this.q("#app");

    /** @type {HTMLElement} Kontener historii czatu */
    this.chatWrapper = this.q("#chat-wrapper");

    /** @type {HTMLElement} Scrollowalny obszar wiadomości */
    this.chatContainer = this.q("#chat-container");

    /** @type {HTMLFormElement} Formularz wysyłania wiadomości */
    this.inputArea = this.q("#input-area");

    /** @type {HTMLTextAreaElement} Pole tekstowe wiadomości */
    this.prompt = this.q("#prompt");

    /** @type {HTMLButtonElement} Przycisk otwierający panel nawigacyjny */
    this.burgerToggle = this.q("#burger-toggle");

    /** @type {HTMLElement} Panel boczny z linkami */
    this.webSidePanel = this.q("#web-side-panel");

    /** @type {HTMLButtonElement} Przycisk otwierający panel ustawień */
    this.settingsToggle = this.q("#settings-toggle");

    /** @type {HTMLElement} Panel boczny z ustawieniami */
    this.settingSidePanel = this.q("#setting-side-panel");

    /** @type {HTMLTemplateElement} Szablon panelu tagów */
    this.tagPanelTemplate = this.q("#tag-panel-template");
}
```

---
## 🔧 Metody

### `q(selector)`


### `qa(selector)`

Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.

---
## 🔗 Zależności

- `Dom`
- `LoggerService`