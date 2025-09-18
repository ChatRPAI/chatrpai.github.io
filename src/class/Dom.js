/**
 *
 * Centralny punkt dostępu do elementów DOM aplikacji.
 * Wymusza strukturę opartą na <main id="app"> jako kontenerze bazowym.
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Przechowywanie i udostępnianie referencji do elementów
 *   - Wyszukiwanie elementów tylko wewnątrz <main id="app">
 *
 * - ❌ Niedozwolone:
 *   - Operacje poza <main id="app">
 *   - Modyfikowanie struktury DOM globalnie
 *
 */
class Dom {
  /**
   * Inicjalizuje klasę Dom z wymuszeniem kontenera <main id="app">
   * @param {string|HTMLElement} rootSelector - domyślnie "#app"
   */
  constructor(rootSelector = "#app") {
    this.rootSelector = rootSelector;
    this.root = null;
    this.refs = {};
  }

  /**
   * Inicjalizuje referencje do elementów wewnątrz <main id="app">
   * @param {Record<string, string>} refMap - mapa nazw do selektorów
   */
  init(refMap) {
    const rootCandidate =
      typeof this.rootSelector === "string"
        ? document.querySelector(this.rootSelector)
        : this.rootSelector;

    if (!(rootCandidate instanceof HTMLElement)) {
      LoggerService.record(
        "error",
        '[Dom] Nie znaleziono <main id="app">. Wymagana struktura HTML.'
      );
      return;
    }

    if (rootCandidate.tagName !== "MAIN" || rootCandidate.id !== "app") {
      LoggerService.record(
        "error",
        '[Dom] Kontener bazowy musi być <main id="app">. Otrzymano:',
        rootCandidate
      );
      return;
    }

    this.root = rootCandidate;

    Object.entries(refMap).forEach(([name, selector]) => {
      const el =
        selector === this.rootSelector
          ? this.root
          : this.root.querySelector(selector);

      if (!el) {
        LoggerService.record("warn", `[Dom] Brak elementu: ${selector}`);
      }

      this.refs[name] = el || null;
      this[name] = el || null;
    });
  }

  /**
   * Wyszukuje element w obrębie <main id="app">
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  q(selector) {
    return this.root?.querySelector(selector) || null;
  }

  /**
   * Wyszukuje wszystkie elementy pasujące do selektora w obrębie <main id="app">
   * @param {string} selector
   * @returns {NodeListOf<HTMLElement>}
   */
  qa(selector) {
    return this.root?.querySelectorAll(selector) || [];
  }
}
