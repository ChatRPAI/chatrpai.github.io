/**
 *
 * Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług oraz
 * zapewnia wygodne gettery do najczęściej używanych komponentów.
 *
 * - ✅ Dozwolone:
 *   - Rejestracja instancji usług i komponentów (np. Dom, Utils, UserManager)
 *   - Pobieranie zależności po nazwie lub przez getter
 *   - Dynamiczne dodawanie nowych zależności w trakcie działania
 *
 * - ❌ Niedozwolone:
 *   - Tworzenie instancji usług na sztywno (to robi warstwa inicjalizacyjna)
 *   - Logika biznesowa lub UI
 *   - Operacje sieciowe
 */
class Context {
  /**
   * Tworzy nowy kontekst z początkowym zestawem usług.
   * @param {Record<string, any>} services - mapa nazw → instancji
   */
  constructor(services = {}) {
    /** @private @type {Map<string, any>} */
    this._registry = new Map(Object.entries(services));
  }

  /**
   * Rejestruje nową lub nadpisuje istniejącą zależność.
   * @param {string} name - unikalna nazwa zależności
   * @param {any} instance - instancja lub obiekt usługi
   */
  register(name, instance) {
    this._registry.set(name, instance);
  }

  /**
   * Pobiera zarejestrowaną zależność po nazwie.
   * @param {string} name - nazwa zależności
   * @returns {any} - instancja lub undefined
   */
  get(name) {
    return this._registry.get(name);
  }

  // Wygodne gettery (opcjonalne)
  get dom() {
    return this.get("dom");
  }
  get utils() {
    return this.get("utils");
  }
  get userManager() {
    return this.get("userManager");
  }
  get diagnostics() {
    return this.get("diagnostics");
  }
  get backendAPI() {
    return this.get("backendAPI");
  }
}
