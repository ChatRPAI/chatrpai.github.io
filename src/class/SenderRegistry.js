/**
 *
 * Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
 * Umożliwia rotacyjne przypisywanie kolorów z palety oraz zarządzanie rejestrem.
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Mapowanie nadawca → indeks → klasa CSS
 *   - Rotacja indeksów po przekroczeniu długości palety
 *   - Przechowywanie stanu w Map
 *
 * - ❌ Niedozwolone:
 *   - Operacje na DOM
 *   - Logika aplikacyjna (np. renderowanie wiadomości)
 *   - Zlecenia sieciowe, localStorage, fetch
 */
class SenderRegistry {
  /**
   * Lista dostępnych klas CSS dla nadawców.
   * Kolory są przypisywane rotacyjnie na podstawie indeksu.
   * @type {string[]}
   */
  static palette = [
    "sender-color-1",
    "sender-color-2",
    "sender-color-3",
    "sender-color-4",
    "sender-color-5",
    "sender-color-6",
    "sender-color-7",
    "sender-color-8",
    "sender-color-9",
    "sender-color-10",
    "sender-color-11",
    "sender-color-12",
    "sender-color-13",
    "sender-color-14",
  ];

  /**
   * Rejestr przypisań nadawca → indeks palety.
   * @type {Map<string, number>}
   */
  static registry = new Map();

  /**
   * Licznik rotacyjny dla kolejnych nadawców.
   * Wykorzystywany do wyznaczania indeksu w palecie.
   * @type {number}
   */
  static nextIndex = 0;

  /**
   * Zwraca klasę CSS dla danego nadawcy.
   * Jeśli nadawca nie był wcześniej zarejestrowany, przypisuje mu nową klasę z palety.
   * @param {string} sender - Nazwa nadawcy
   * @returns {string} - Klasa CSS przypisana nadawcy
   */
  static getClass(sender) {
    if (!sender || typeof sender !== "string") return "sender-color-default";

    if (!this.registry.has(sender)) {
      const index = this.nextIndex % this.palette.length;
      this.registry.set(sender, index);
      this.nextIndex++;
    }

    const idx = this.registry.get(sender);
    return this.palette[idx];
  }

  /**
   * Czyści rejestr nadawców i resetuje licznik.
   * Używane np. przy resecie czatu.
   */
  static reset() {
    this.registry.clear();
    this.nextIndex = 0;
  }

  /**
   * Sprawdza, czy nadawca jest już zarejestrowany.
   * @param {string} sender - Nazwa nadawcy
   * @returns {boolean} - Czy nadawca istnieje w rejestrze
   */
  static hasSender(sender) {
    return this.registry.has(sender);
  }

  /**
   * Zwraca indeks przypisany nadawcy w palecie.
   * @param {string} sender - Nazwa nadawcy
   * @returns {number | undefined} - Indeks w palecie lub undefined
   */
  static getSenderIndex(sender) {
    return this.registry.get(sender);
  }

  /**
   * Zwraca aktualną paletę kolorów.
   * @returns {string[]} - Kopia tablicy z klasami CSS
   */
  static getPalette() {
    return [...this.palette];
  }

  /**
   * Ustawia nową paletę kolorów i resetuje rejestr.
   * @param {string[]} newPalette - Nowa lista klas CSS
   */
  static setPalette(newPalette) {
    if (Array.isArray(newPalette) && newPalette.length > 0) {
      this.palette = newPalette;
      this.reset();
    }
  }
}
