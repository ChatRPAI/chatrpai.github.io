/**
 * Walidator promptów użytkownika przed wysłaniem do AI.
 * Sprawdza typ, długość i obecność niedozwolonych znaków.
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Stałe limitów: minLength, maxLength
 *   - Wzorzec niedozwolonych znaków: forbidden
 *   - Metoda: validate(prompt)
 *
 * - ❌ Niedozwolone:
 *   - Operacje na DOM
 *   - Zlecenia sieciowe (fetch, localStorage)
 *   - Logika aplikacyjna (np. renderowanie, wysyłka)
 *   - Efekty uboczne (np. console.log, mutacje zewnętrznych obiektów)
 */
class PromptValidator {
  /**
   * Minimalna długość promptu po przycięciu.
   * Prompt krótszy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static minLength = 1;

  /**
   * Maksymalna długość promptu po przycięciu.
   * Prompt dłuższy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static maxLength = 300;

  /**
   * Wzorzec niedozwolonych znaków w promptach.
   * Domyślnie: < oraz >
   * @type {RegExp}
   */
  static forbidden = /[<>]/;

  /**
   * Waliduje prompt użytkownika.
   * Sprawdza:
   * - czy jest typu string
   * - czy nie jest pusty po przycięciu
   * - czy mieści się w limicie długości
   * - czy nie zawiera niedozwolonych znaków
   *
   * @param {string} prompt - Tekst promptu od użytkownika
   * @returns {{ valid: boolean, errors: string[] }} - Obiekt z informacją o poprawności i listą błędów
   */
  static validate(prompt) {
    const errors = [];

    // Typ musi być string
    if (typeof prompt !== "string") {
      errors.push("Prompt musi być typu string.");
      return { valid: false, errors };
    }

    // Przycięcie spacji
    const trimmed = prompt.trim();
    const len = trimmed.length;

    // Walidacja długości
    if (len < this.minLength) {
      errors.push("Prompt nie może być pusty.");
    } else if (len > this.maxLength) {
      errors.push(
        `Maksymalna długość promptu to ${this.maxLength} znaków, otrzymano ${len}.`
      );
    }

    // Walidacja znaków
    if (this.forbidden.test(trimmed)) {
      errors.push("Prompt zawiera niedozwolone znaki: < lub >.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
