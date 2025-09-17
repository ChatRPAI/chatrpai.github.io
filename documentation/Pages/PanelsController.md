# PanelsController

================
Menedżer widoczności paneli bocznych w aplikacji.
Zapewnia kontrolę nad otwieraniem, zamykaniem i przełączaniem paneli w interfejsie użytkownika.
Obsługuje tryb mobilny (wyłączność paneli) oraz desktopowy (współistnienie).
Utrzymuje stan wybranych paneli w cookie — tylko na desktopie.
Zasady:
-------
✅ Odpowiedzialność:
  - Rejestracja paneli i ich przycisków
  - Obsługa zdarzeń kliknięcia
  - Przełączanie widoczności paneli
  - Zapisywanie stanu paneli w cookie (desktop only)
❌ Niedozwolone:
  - Deklaracja paneli statycznie
  - Modyfikacja zawartości paneli
  - Logika niezwiązana z UI paneli
API:
----
• `constructor(dom, panels, persistentPanels)` — inicjalizacja z referencjami DOM
• `init()` — rejestruje nasłuchiwacze i przywraca stan (desktop only)
• `addPanel(button, panel, id)` — dodaje nową parę przycisk→panel
• `openPanel(panel)` — otwiera panel (z wyłącznością na mobile)
• `closePanel(panel)` — zamyka panel
• `togglePanel(panel)` — przełącza widoczność panelu
• `closeAllPanels()` — zamyka wszystkie panele
• `isPanelOpen(panel)` — sprawdza, czy panel jest otwarty
• `getOpenPanel()` — zwraca pierwszy otwarty panel
• `getOpenPanels()` — zwraca wszystkie otwarte panele
• `destroy()` — usuwa nasłuchiwacze i czyści zasoby
Zależności:
 - `Dom`: dostarcza referencje do przycisków i paneli
 - `Utils.isMobile()`: wykrywa tryb mobilny
 - `AppStorageManager`: zapisuje i odczytuje stan paneli z cookie
 - `LoggerService`: loguje błędy i ostrzeżenia

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
