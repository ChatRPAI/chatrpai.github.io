/**
 * EditValidator
 * =============
 * Walidator tekstu edytowanego przez AI oraz przypisanych tagów.
 * Sprawdza długość tekstu i tagów oraz obecność treści.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Stałe limitów: maxTextLength, maxTagLength
 *   - Metoda: validate(text, tags)
 *
 * ❌ Niedozwolone:
 *   - Operacje na DOM
 *   - Zlecenia sieciowe (fetch, localStorage)
 *   - Logika aplikacyjna (np. renderowanie, wysyłka)
 *   - Efekty uboczne (np. console.log, mutacje zewnętrznych obiektów)
 */
class EditValidator {
  /**
   * Maksymalna długość tekstu edycji.
   * Tekst dłuższy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static maxTextLength = 5000;

  /**
   * Maksymalna długość pojedynczego tagu.
   * Tag dłuższy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static maxTagLength = 300;

  /**
   * Waliduje tekst i tagi pod kątem pustki i długości.
   * - Tekst musi być niepusty po przycięciu.
   * - Tekst nie może przekraczać maxTextLength.
   * - Każdy tag musi być typu string i nie może przekraczać maxTagLength.
   *
   * @param {string} text - Edytowany tekst AI
   * @param {string[]} tags - Lista tagów
   * @returns {{ valid: boolean, errors: string[] }} - Obiekt z informacją o poprawności i listą błędów
   */
  static validate(text, tags) {
    const errors = [];

    // Przycięcie tekstu z obu stron
    const trimmedText = text.trim();
    const textLength = trimmedText.length;

    // Walidacja tekstu
    if (!textLength) {
      errors.push("Tekst edycji nie może być pusty.");
    } else if (textLength > this.maxTextLength) {
      errors.push(
        `Maksymalna długość tekstu to ${this.maxTextLength} znaków, otrzymano ${textLength}.`
      );
    }

    // Walidacja tagów
    for (const tag of tags) {
      if (typeof tag !== "string") continue; // ignoruj błędne typy
      if (tag.length > this.maxTagLength) {
        errors.push(
          `Tag "${tag}" przekracza limit ${this.maxTagLength} znaków (ma ${tag.length}).`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
