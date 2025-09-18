# VirtualKeyboardDock

Komponent odpowiedzialny za dostosowanie położenia elementu docka (np. paska narzędzi, przycisków)
w momencie pojawienia się lub zniknięcia wirtualnej klawiatury na urządzeniach mobilnych.
Funkcje:
 - Nasłuchuje zdarzeń `focus` i `blur` na polach tekstowych, aby wykryć aktywację klawiatury.
 - Reaguje na zdarzenia `resize`/`visualViewport`/`keyboardchange` w celu aktualizacji pozycji docka.
 - Ustawia odpowiedni `bottom` docka tak, aby nie był zasłaniany przez klawiaturę.
 - Ukrywa dock, gdy klawiatura jest schowana (opcjonalnie).
## Zasady:
- ✅ Dozwolone:
  - Manipulacja stylem docka w reakcji na zmiany widoczności klawiatury.
  - Obsługa zdarzeń wejściowych i zmian rozmiaru widoku.
- ❌ Niedozwolone:
  - Modyfikowanie innych elementów UI poza dockiem.
  - Wysyłanie żądań sieciowych.

---

## constructor

**_@param_** *`{HTMLElement}`* _**dockEl**_  Element docka, który ma być pozycjonowany.

```javascript
  constructor(dockEl, forceEnable = false) {
    this.dock = dockEl;
    this.isVisible = false;
    this.boundUpdate = this.updatePosition.bind(this);
    this.forceEnable = forceEnable;
  }
```

---

## init()

Podpina nasłuchy zdarzeń i ustawia początkową pozycję docka.

```javascript
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
```

---

## updatePosition()

Aktualizuje pozycję docka względem dolnej krawędzi okna.

```javascript
  updatePosition() {
    if (!this.isVisible) return;
    const offset = window.visualViewport
      ? window.innerHeight - window.visualViewport.height
      : 0;
    this.dock.style.bottom = `${offset}px`;
  }
```

---

## show()

Pokazuje dock i aktualizuje jego pozycję.

```javascript
  show() {
    this.isVisible = true;
    this.dock.style.display = "block";
    this.updatePosition();
  }
```

---

## hide()

Ukrywa dock.

```javascript
  hide() {
    this.isVisible = false;
    this.dock.style.display = "none";
    this.dock.style.bottom = "0px";
  }
```

---

## Pełny kod klasy

```javascript
class VirtualKeyboardDock {
  constructor(dockEl, forceEnable = false) {
    this.dock = dockEl;
    this.isVisible = false;
    this.boundUpdate = this.updatePosition.bind(this);
    this.forceEnable = forceEnable;
  }
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

  updatePosition() {
    if (!this.isVisible) return;
    const offset = window.visualViewport
      ? window.innerHeight - window.visualViewport.height
      : 0;
    this.dock.style.bottom = `${offset}px`;
  }

  show() {
    this.isVisible = true;
    this.dock.style.display = "block";
    this.updatePosition();
  }

  hide() {
    this.isVisible = false;
    this.dock.style.display = "none";
    this.dock.style.bottom = "0px";
  }
}
```