/**
 * Utils
 * =====
 * Zestaw funkcji pomocniczych wykorzystywanych w całej aplikacji.
 * Nie wymaga instancjonowania — wszystkie metody są dostępne statycznie.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Funkcje czyste: throttle, debounce, clamp, formatDate, randomId
 *   - Operacje na DOM: safeQuery, createButton
 *   - Detekcja środowiska: isMobile
 *   - Sprawdzenie dostępności zasobów: checkImageExists
 *
 * ❌ Niedozwolone:
 *   - Logika aplikacyjna (np. renderowanie wiadomości)
 *   - Zależności od klas domenowych (ChatManager, BackendAPI itd.)
 *   - Mutacje globalnego stanu
 *   - Efekty uboczne poza LoggerService
 *
 * TODO:
 *   - once(fn)
 *   - retry(fn, attempts)
 *   - escapeHTML(str)
 *   - parseQueryParams(url)
 *   - wait(ms)
 */
const Utils = {
  /**
   * Ogranicza wywołanie funkcji do max raz na `limit` ms.
   * @param {Function} fn - Funkcja do ograniczenia
   * @param {number} limit - Minimalny odstęp między wywołaniami (ms)
   * @returns {Function} - Funkcja z throttlingiem
   */
  throttle(fn, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * Opóźnia wywołanie funkcji do momentu, gdy przestanie być wywoływana przez `delay` ms.
   * @param {Function} fn - Funkcja do opóźnienia
   * @param {number} delay - Czas oczekiwania po ostatnim wywołaniu (ms)
   * @returns {Function} - Funkcja z debounce
   */
  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Ogranicza wartość do zakresu [min, max].
   * @param {number} val - Wartość wejściowa
   * @param {number} min - Minimalna wartość
   * @param {number} max - Maksymalna wartość
   * @returns {number} - Wartość ograniczona do zakresu
   */
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  /**
   * Formatuje datę jako string HH:MM:SS (bez AM/PM).
   * @param {Date} date - Obiekt daty
   * @returns {string} - Sformatowany czas
   */
  formatDate(date) {
    return date.toLocaleTimeString("pl-PL", { hour12: false });
  },

  /**
   * Generuje losowy identyfikator (np. do elementów DOM, wiadomości).
   * @returns {string} - Losowy identyfikator
   */
  randomId() {
    return Math.random().toString(36).substr(2, 9);
  },

  /**
   * Bezpieczne pobranie elementu DOM.
   * Jeśli element nie istnieje, loguje ostrzeżenie.
   * @param {string} selector - CSS selektor
   * @returns {HTMLElement|null} - Znaleziony element lub null
   */
  safeQuery(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      LoggerService.record("warn", `Brak elementu dla selektora: ${selector}`);
    }
    return el;
  },

  /**
   * Tworzy przycisk z tekstem i handlerem kliknięcia.
   * @param {string} label - Tekst przycisku
   * @param {Function} onClick - Funkcja obsługująca kliknięcie
   * @returns {HTMLButtonElement} - Gotowy element przycisku
   */
  createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "form-element";
    btn.addEventListener("click", onClick);
    return btn;
  },

  /**
   * Detekcja urządzenia mobilnego na podstawie user-agenta i szerokości okna.
   * @returns {boolean} - Czy urządzenie jest mobilne
   */
  isMobile() {
    const uaMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );
    const narrow = window.innerWidth < 768;
    const mobile = uaMobile && narrow;
    LoggerService.record("log", "Detekcja urządzenia mobilnego:", mobile);
    return mobile;
  },
};
