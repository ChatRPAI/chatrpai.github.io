```js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `Dom` centralizuje dostęp do elementów interfejsu
 * - ✅ Ułatwia testowanie, refaktoryzację i spójność struktury HTML
 * - ✅ Obsługuje walidację i logowanie braków przez `LoggerService`
 * - ✅ Możliwość dodania metod: `exists()`, `refresh()`, `getAll()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
 * - 💡 Należy ją przeanalizować pod kątem działania na różnych strukturach HTML/DOM w których nie musi być zawarte nigdy np.: "#chat-container"
 */


/**
 * Dom
 * ===
 * Centralny rejestr elementów interfejsu:
 * - Pobiera i przechowuje referencje do komponentów UI
 * - Obsługuje walidację i logowanie braków
 */
class Dom {
 /**
   * Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.
   */
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

  /**
   * Pobiera pierwszy element pasujący do selektora CSS.
   * @param {string} selector - Selektor CSS.
   * @returns {HTMLElement|null} Element lub null.
   */
  q(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      LoggerService.record("warn", `[Dom] Nie znaleziono elementu dla selektora: ${selector}`);
    }
    return el;
  }

  /**
   * Pobiera wszystkie elementy pasujące do selektora CSS.
   * @param {string} selector - Selektor CSS.
   * @returns {NodeListOf<HTMLElement>} Lista elementów.
   */
  qa(selector) {
    return document.querySelectorAll(selector);
  }
}
```