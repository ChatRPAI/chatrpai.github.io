# 📦 PanelsController

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PanelsController` działa jako kontroler widoczności paneli bocznych
- ✅ Obsługuje toggle, open, close, init i zapewnia wyłączność paneli
- ✅ Możliwość dodania metod: `addPanel()`, `isPanelOpen()`, `getOpenPanel()`, `destroy()`
- 💡 Na mobile: tylko jeden panel może być otwarty jednocześnie, wszystkie są domyślnie zamknięte po odświeżeniu
- 💡 Na desktopie: panele nie zasłaniają treści, więc mogą być otwarte równolegle
- 💡 Panel `setting-side-panel` powinien być otwarty lub zamknięty zależnie od ciasteczka — użytkownik decyduje
- 💡 Warto dodać stałą `cookiePanels = ['setting-side-panel']` i obsłużyć ich stan przy `init()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty

PanelsController
================
Kontroler widoczności paneli bocznych aplikacji:
- Obsługuje otwieranie, zamykanie i przełączanie paneli
- Zapewnia, że tylko jeden panel może być otwarty
- Integruje się z klasą `Dom` i `Utils`

---
## 🧬 Konstruktor

/**
Tworzy instancję kontrolera paneli.
⚙️ *@param {Dom}* - Instancja klasy Dom z referencjami do elementów.
/

```js
constructor(domInstance) {
/** @type {Dom} Referencje do elementów DOM */
    this.dom = domInstance;

    /**
     * @type {Array<{button: HTMLElement, panel: HTMLElement}>}
     * Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
     */
    this.panels = [
      { button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
      { button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
    ];
}
```

---
## 🔧 Metody

### `init()`


### `openPanel(panel)`

Otwiera wskazany panel i zamyka pozostałe.

**Parametry:**
- `panel` (`HTMLElement`): Panel do otwarcia.

### `closePanel(panel)`

Zamyka wskazany panel.

**Parametry:**
- `panel` (`HTMLElement`): Panel do zamknięcia.

### `togglePanel(panel)`

Przełącza stan panelu.

**Parametry:**
- `panel` (`HTMLElement`): Panel do przełączenia.

### `closeAllPanels()`

Zamyka wszystkie panele.


---
## 🔗 Zależności

- `Dom`
- `PanelsController`
- `Utils`