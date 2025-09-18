# Dom

Centralny punkt dostępu do elementów DOM aplikacji.
Wymusza strukturę opartą na `<main id="app">` jako kontenerze bazowym.
## Zasady:
- ✅ Dozwolone:
  - Przechowywanie i udostępnianie referencji do elementów
  - Wyszukiwanie elementów tylko wewnątrz `<main id="app">`
- ❌ Niedozwolone:
  - Operacje poza `<main id="app">`
  - Modyfikowanie struktury DOM globalnie

---

## constructor

Inicjalizuje klasę Dom z wymuszeniem kontenera `<main id="app">`

**_@param_** *`{string|HTMLElement}`* _**rootSelector**_  domyślnie "#app"

```javascript
  constructor(rootSelector = "#app") {
    this.rootSelector = rootSelector;
    this.root = null;
    this.refs = {};
  }
```

---

## init()

Inicjalizuje referencje do elementów wewnątrz `<main id="app">`

**_@param_** *`{Record<string, string>}`* _**refMap**_  mapa nazw do selektorów

```javascript
  init(refMap) {
    const rootCandidate =
      typeof this.rootSelector === "string"
        ? document.querySelector(this.rootSelector)
        : this.rootSelector;

    if (!(rootCandidate instanceof HTMLElement)) {
      LoggerService.record(
        "error",
        '[Dom] Nie znaleziono <main id="app">. Wymagana struktura HTML.'
      );
      return;
    }

    if (rootCandidate.tagName !== "MAIN" || rootCandidate.id !== "app") {
      LoggerService.record(
        "error",
        '[Dom] Kontener bazowy musi być <main id="app">. Otrzymano:',
        rootCandidate
      );
      return;
    }

    this.root = rootCandidate;

    Object.entries(refMap).forEach(([name, selector]) => {
      const el =
        selector === this.rootSelector
          ? this.root
          : this.root.querySelector(selector);

      if (!el) {
        LoggerService.record("warn", `[Dom] Brak elementu: ${selector}`);
      }

      this.refs[name] = el || null;
      this[name] = el || null;
    });
  }
```

---

## q()

Wyszukuje element w obrębie `<main id="app">`

**_@param_** *`{string}`* _**selector**_

**@returns** *`{HTMLElement|null}`*

```javascript
  q(selector) {
    return this.root?.querySelector(selector) || null;
  }
```

---

## qa()

Wyszukuje wszystkie elementy pasujące do selektora w obrębie `<main id="app">`

**_@param_** *`{string}`* _**selector**_

**@returns** *`{NodeListOf<HTMLElement>}`*

```javascript
  qa(selector) {
    return this.root?.querySelectorAll(selector) || [];
  }
```

---

## Pełny kod klasy

```javascript
class Dom {
  constructor(rootSelector = "#app") {
    this.rootSelector = rootSelector;
    this.root = null;
    this.refs = {};
  }

  init(refMap) {
    const rootCandidate =
      typeof this.rootSelector === "string"
        ? document.querySelector(this.rootSelector)
        : this.rootSelector;

    if (!(rootCandidate instanceof HTMLElement)) {
      LoggerService.record(
        "error",
        '[Dom] Nie znaleziono <main id="app">. Wymagana struktura HTML.'
      );
      return;
    }

    if (rootCandidate.tagName !== "MAIN" || rootCandidate.id !== "app") {
      LoggerService.record(
        "error",
        '[Dom] Kontener bazowy musi być <main id="app">. Otrzymano:',
        rootCandidate
      );
      return;
    }

    this.root = rootCandidate;

    Object.entries(refMap).forEach(([name, selector]) => {
      const el =
        selector === this.rootSelector
          ? this.root
          : this.root.querySelector(selector);

      if (!el) {
        LoggerService.record("warn", `[Dom] Brak elementu: ${selector}`);
      }

      this.refs[name] = el || null;
      this[name] = el || null;
    });
  }

  q(selector) {
    return this.root?.querySelector(selector) || null;
  }

  qa(selector) {
    return this.root?.querySelectorAll(selector) || [];
  }
}
```