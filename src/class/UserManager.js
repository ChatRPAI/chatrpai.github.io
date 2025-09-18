/**
 *
 * Statyczna klasa do zarządzania nazwą użytkownika w aplikacji.
 * Umożliwia zapis, odczyt i czyszczenie imienia użytkownika oraz dynamiczną podmianę placeholderów w tekstach.
 * Integruje się z polem input `#user_name`, umożliwiając automatyczny zapis zmian.
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Przechowywanie i odczytywanie imienia użytkownika z AppStorageManager
 *   - Obsługa pola input `#user_name` (wypełnianie i nasłuchiwanie zmian)
 *   - Podmiana placeholderów w tekstach (np. `{{user}}`)
 *
 * - ❌ Niedozwolone:
 *   - Przechowywanie innych danych użytkownika niż imię
 *   - Logika niezwiązana z nazwą użytkownika
 *   - Modyfikacja innych pól formularza
 */
class UserManager {
  /**
   * @type {string} Klucz używany w AppStorageManager
   */
  static storageKey = "user_name";

  /**
   * Zapisuje imię użytkownika w AppStorageManager.
   * @param {string} name - Imię użytkownika.
   */
  static setName(name) {
    AppStorageManager.set(this.storageKey, name.trim());
  }

  /**
   * Odczytuje imię użytkownika z AppStorageManager.
   * @returns {string} Imię użytkownika lub pusty string.
   */
  static getName() {
    const raw = AppStorageManager.getWithTTL(this.storageKey);
    return typeof raw === "string" ? raw : raw ?? "";
  }

  /**
   * Sprawdza, czy imię użytkownika jest ustawione.
   * @returns {boolean} True, jeśli imię istnieje i nie jest puste.
   */
  static hasName() {
    return !!this.getName().trim();
  }

  /**
   * Usuwa zapisane imię użytkownika.
   */
  static clearName() {
    AppStorageManager.remove(this.storageKey);
  }

  /**
   * Zwraca typ pamięci, w której aktualnie przechowywane jest imię.
   * @returns {"localStorage"|"cookie"}
   */
  static getStorageType() {
    return AppStorageManager.type();
  }

  /**
   * Podłącza pole input #user_name:
   * - wypełnia istniejącą wartością,
   * - zapisuje każdą zmianę.
   * @param {Dom} dom - Instancja klasy Dom z metodą `q()`.
   */
  static init(dom) {
    const input = dom.q("#user_name");
    if (!input) return;
    input.value = this.getName();
    input.addEventListener("input", () => {
      this.setName(input.value);
    });
  }

  /**
   * Podmienia placeholdery w tekście na aktualne imię użytkownika.
   * @param {string} text - Tekst zawierający placeholdery (np. {{user}}).
   * @param {Object<string,string>} [map] - Opcjonalna mapa dodatkowych placeholderów do podmiany.
   * @returns {string} Tekst z podmienionymi wartościami.
   */
  static replacePlaceholders(text, map = {}) {
    const name = this.getName() || "Użytkowniku";
    let result = text.replace(/{{\s*user\s*}}/gi, name);
    for (const [key, value] of Object.entries(map)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
      result = result.replace(regex, value);
    }
    return result;
  }
}
