/**
 *
 * Komponent odpowiedzialny za dostosowanie położenia elementu docka (np. paska narzędzi, przycisków)
 * w momencie pojawienia się lub zniknięcia wirtualnej klawiatury na urządzeniach mobilnych.
 * Funkcje:
 *  - Nasłuchuje zdarzeń `focus` i `blur` na polach tekstowych, aby wykryć aktywację klawiatury.
 *  - Reaguje na zdarzenia `resize`/`visualViewport`/`keyboardchange` w celu aktualizacji pozycji docka.
 *  - Ustawia odpowiedni `bottom` docka tak, aby nie był zasłaniany przez klawiaturę.
 *  - Ukrywa dock, gdy klawiatura jest schowana (opcjonalnie).
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Manipulacja stylem docka w reakcji na zmiany widoczności klawiatury.
 *   - Obsługa zdarzeń wejściowych i zmian rozmiaru widoku.
 *
 * - ❌ Niedozwolone:
 *   - Modyfikowanie innych elementów UI poza dockiem.
 *   - Wysyłanie żądań sieciowych.
 */
class VirtualKeyboardDock {
  /**
   * @param {HTMLElement} dockEl - Element docka, który ma być pozycjonowany.
   */
  constructor(dockEl, forceEnable = false) {
    this.dock = dockEl;
    this.isVisible = false;
    this.boundUpdate = this.updatePosition.bind(this);
    this.forceEnable = forceEnable;
  }
  /**
   * Podpina nasłuchy zdarzeń i ustawia początkową pozycję docka.
   */
  init() {
    if (!this.forceEnable && Utils.isMobile() === false) return;
    document.addEventListener("focusin", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        this.show();
      }
    });
    document.addEventListener("focusout", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        this.hide();
      }
    });

    window.addEventListener("resize", this.boundUpdate);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.boundUpdate);
    }
  }

  /**
   * Aktualizuje pozycję docka względem dolnej krawędzi okna.
   */
  updatePosition() {
    if (!this.isVisible) return;
    const offset = window.visualViewport
      ? window.innerHeight - window.visualViewport.height
      : 0;
    this.dock.style.bottom = `${offset}px`;
  }

  /**
   * Pokazuje dock i aktualizuje jego pozycję.
   */
  show() {
    this.isVisible = true;
    this.dock.style.display = "block";
    this.updatePosition();
  }

  /**
   * Ukrywa dock.
   */
  hide() {
    this.isVisible = false;
    this.dock.style.display = "none";
    this.dock.style.bottom = "0px";
  }
}
