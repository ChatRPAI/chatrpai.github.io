# PanelsController

Menedżer widoczności paneli bocznych w aplikacji.
Zapewnia kontrolę nad otwieraniem, zamykaniem i przełączaniem paneli w interfejsie użytkownika.
Obsługuje tryb mobilny (wyłączność paneli) oraz desktopowy (współistnienie).
Utrzymuje stan wybranych paneli w cookie — tylko na desktopie.
## Zasady:
- ✅ Dozwolone:
  - Rejestracja paneli i ich przycisków
  - Obsługa zdarzeń kliknięcia
  - Przełączanie widoczności paneli
  - Zapisywanie stanu paneli w cookie (desktop only)
- ❌ Niedozwolone:
  - Deklaracja paneli statycznie
  - Modyfikacja zawartości paneli
  - Logika niezwiązana z UI paneli

---

## constructor

**_@param_** *`{Dom}`* _**dom**_  Instancja klasy Dom

**_@param_** *`{Array<{button: HTMLElement, panel: HTMLElement, id: string}>}`* _**panels**_  lista paneli

**_@param_** *`{string[]}`* _**persistentPanels**_  identyfikatory paneli, które mają być zapamiętywane (desktop only)

```javascript
  constructor(dom, panels = [], persistentPanels = []) {
    this.dom = dom;
    this.panels = panels;
    this.cookiePanels = new Set(persistentPanels);
    this._unbinders = new Map();
  }
```

---

## init()

Inicjalizuje nasłuchiwacze kliknięć i przywraca stan z cookie (desktop only).

```javascript
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
```

---

## openPanel()

Otwiera panel. Na mobile zamyka inne.

**_@param_** *`{HTMLElement}`* _**panel**_

```javascript
  openPanel(panel) {
    if (Utils.isMobile()) {
      this.closeAllPanels();
    }
    panel.classList.add("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, true);
    }
  }
```

---

## closePanel()

Zamyka panel.

**_@param_** *`{HTMLElement}`* _**panel**_

```javascript
  closePanel(panel) {
    panel.classList.remove("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, false);
    }
  }
```

---

## togglePanel()

Przełącza widoczność panelu.

**_@param_** *`{HTMLElement}`* _**panel**_

```javascript
  togglePanel(panel) {
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    if (isOpen) {
      this.closePanel(panel);
    } else {
      this.openPanel(panel);
    }
  }
```

---

## isPanelOpen()

  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel?.classList.remove("open"));
  }

  /**
Sprawdza, czy panel jest otwarty.

**_@param_** *`{HTMLElement}`* _**panel**_

**@returns** *`{boolean}`*

```javascript
  isPanelOpen(panel) {
    return !!panel?.classList.contains("open");
  }
```

---

## getOpenPanel()

Zwraca pierwszy otwarty panel.

**@returns** *`{HTMLElement|null}`*

```javascript
  getOpenPanel() {
    const item = this.panels.find(({ panel }) =>
      panel?.classList.contains("open")
    );
    return item?.panel || null;
  }
```

---

## getOpenPanels()

Zwraca wszystkie otwarte panele.

**@returns** *`{HTMLElement[]}`*

```javascript
  getOpenPanels() {
    return this.panels
      .map(({ panel }) => panel)
      .filter((p) => p && p.classList.contains("open"));
  }
```

---

## destroy()

Usuwa nasłuchiwacze i czyści zasoby.

```javascript
  destroy() {
    this._unbinders.forEach((off) => off?.());
    this._unbinders.clear();
  }
```

---

## Pełny kod klasy

```javascript
class PanelsController {
  constructor(dom, panels = [], persistentPanels = []) {
    this.dom = dom;
    this.panels = panels;
    this.cookiePanels = new Set(persistentPanels);
    this._unbinders = new Map();
  }

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

  openPanel(panel) {
    if (Utils.isMobile()) {
      this.closeAllPanels();
    }
    panel.classList.add("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, true);
    }
  }

  closePanel(panel) {
    panel.classList.remove("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, false);
    }
  }

  togglePanel(panel) {
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    if (isOpen) {
      this.closePanel(panel);
    } else {
      this.openPanel(panel);
    }
  }

  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel?.classList.remove("open"));
  }

  isPanelOpen(panel) {
    return !!panel?.classList.contains("open");
  }

  getOpenPanel() {
    const item = this.panels.find(({ panel }) =>
      panel?.classList.contains("open")
    );
    return item?.panel || null;
  }

  getOpenPanels() {
    return this.panels
      .map(({ panel }) => panel)
      .filter((p) => p && p.classList.contains("open"));
  }

  destroy() {
    this._unbinders.forEach((off) => off?.());
    this._unbinders.clear();
  }
}
```