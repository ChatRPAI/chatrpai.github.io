/**
 *
 * Menedżer widoczności paneli bocznych w aplikacji.
 * Zapewnia kontrolę nad otwieraniem, zamykaniem i przełączaniem paneli w interfejsie użytkownika.
 * Obsługuje tryb mobilny (wyłączność paneli) oraz desktopowy (współistnienie).
 * Utrzymuje stan wybranych paneli w cookie — tylko na desktopie.
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Rejestracja paneli i ich przycisków
 *   - Obsługa zdarzeń kliknięcia
 *   - Przełączanie widoczności paneli
 *   - Zapisywanie stanu paneli w cookie (desktop only)
 *
 * - ❌ Niedozwolone:
 *   - Deklaracja paneli statycznie
 *   - Modyfikacja zawartości paneli
 *   - Logika niezwiązana z UI paneli
 *
 */
class PanelsController {
  /**
   * @param {Dom} dom - Instancja klasy Dom
   * @param {Array<{button: HTMLElement, panel: HTMLElement, id: string}>} panels - lista paneli
   * @param {string[]} persistentPanels - identyfikatory paneli, które mają być zapamiętywane (desktop only)
   */
  constructor(dom, panels = [], persistentPanels = []) {
    this.dom = dom;
    this.panels = panels;
    this.cookiePanels = new Set(persistentPanels);
    this._unbinders = new Map();
  }

  /**
   * Inicjalizuje nasłuchiwacze kliknięć i przywraca stan z cookie (desktop only).
   */
  init() {
    this.panels.forEach(({ button, panel, id }) => {
      if (!button || !panel) return;

      if (!Utils.isMobile() && this.cookiePanels.has(id)) {
        const saved = AppStorageManager.getWithTTL(`panel:${id}`);
        if (saved === true) panel.classList.add("open");
      }

      const handler = () => this.togglePanel(panel);
      button.addEventListener("click", handler);
      this._unbinders.set(button, () =>
        button.removeEventListener("click", handler)
      );
    });
  }

  /**
   * Otwiera panel. Na mobile zamyka inne.
   * @param {HTMLElement} panel
   */
  openPanel(panel) {
    if (Utils.isMobile()) {
      this.closeAllPanels();
    }
    panel.classList.add("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, true);
    }
  }

  /**
   * Zamyka panel.
   * @param {HTMLElement} panel
   */
  closePanel(panel) {
    panel.classList.remove("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, false);
    }
  }

  /**
   * Przełącza widoczność panelu.
   * @param {HTMLElement} panel
   */
  togglePanel(panel) {
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    if (isOpen) {
      this.closePanel(panel);
    } else {
      this.openPanel(panel);
    }
  }

  /** Zamyka wszystkie panele. */
  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel?.classList.remove("open"));
  }

  /**
   * Sprawdza, czy panel jest otwarty.
   * @param {HTMLElement} panel
   * @returns {boolean}
   */
  isPanelOpen(panel) {
    return !!panel?.classList.contains("open");
  }

  /**
   * Zwraca pierwszy otwarty panel.
   * @returns {HTMLElement|null}
   */
  getOpenPanel() {
    const item = this.panels.find(({ panel }) =>
      panel?.classList.contains("open")
    );
    return item?.panel || null;
  }

  /**
   * Zwraca wszystkie otwarte panele.
   * @returns {HTMLElement[]}
   */
  getOpenPanels() {
    return this.panels
      .map(({ panel }) => panel)
      .filter((p) => p && p.classList.contains("open"));
  }

  /**
   * Usuwa nasłuchiwacze i czyści zasoby.
   */
  destroy() {
    this._unbinders.forEach((off) => off?.());
    this._unbinders.clear();
  }
}
