Zestaw funkcji pomocniczych wykorzystywanych w całej aplikacji.
Nie wymaga instancjonowania — wszystkie metody są dostępne statycznie.
## Zasady:
- ✅ Dozwolone:
  - Funkcje czyste: throttle, debounce, clamp, formatDate, randomId
  - Operacje na DOM: safeQuery, createButton
  - Detekcja środowiska: isMobile
  - Sprawdzenie dostępności zasobów: checkImageExists
- ❌ Niedozwolone:
  - Logika aplikacyjna (np. renderowanie wiadomości)
  - Zależności od klas domenowych (ChatManager, BackendAPI itd.)
  - Mutacje globalnego stanu
  - Efekty uboczne poza LoggerService

---

## throttle()

Ogranicza wywołanie funkcji do max raz na `limit` ms.

**_@param_** *`{Function}`* _**fn**_  Funkcja do ograniczenia

**_@param_** *`{number}`* _**limit**_  Minimalny odstęp między wywołaniami (ms)

**@returns** *`{Function}`*  - Funkcja z throttlingiem

```javascript
  throttle(fn, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },
```

---

## debounce()

Opóźnia wywołanie funkcji do momentu, gdy przestanie być wywoływana przez `delay` ms.

**_@param_** *`{Function}`* _**fn**_  Funkcja do opóźnienia

**_@param_** *`{number}`* _**delay**_  Czas oczekiwania po ostatnim wywołaniu (ms)

**@returns** *`{Function}`*  - Funkcja z debounce

```javascript
  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },
```

---

## clamp()

Ogranicza wartość do zakresu [min, max].

**_@param_** *`{number}`* _**val**_  Wartość wejściowa

**_@param_** *`{number}`* _**min**_  Minimalna wartość

**_@param_** *`{number}`* _**max**_  Maksymalna wartość

**@returns** *`{number}`*  - Wartość ograniczona do zakresu

```javascript
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },
```

---

## formatDate()

Formatuje datę jako string HH:MM:SS (bez AM/PM).

**_@param_** *`{Date}`* _**date**_  Obiekt daty

**@returns** *`{string}`*  - Sformatowany czas

```javascript
  formatDate(date) {
    return date.toLocaleTimeString("pl-PL", { hour12: false });
  },
```

---

## randomId()

Generuje losowy identyfikator (np. do elementów DOM, wiadomości).

**@returns** *`{string}`*  - Losowy identyfikator

```javascript
  randomId() {
    return Math.random().toString(36).substr(2, 9);
  },
```

---

## safeQuery()

Bezpieczne pobranie elementu DOM.
Jeśli element nie istnieje, loguje ostrzeżenie.

**_@param_** *`{string}`* _**selector**_  CSS selektor

**@returns** *`{HTMLElement|null}`*  - Znaleziony element lub null

```javascript
  safeQuery(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      LoggerService.record("warn", `Brak elementu dla selektora: ${selector}`);
    }
    return el;
  },
```

---

## createButton()

Tworzy przycisk z tekstem i handlerem kliknięcia.

**_@param_** *`{string}`* _**label**_  Tekst przycisku

**_@param_** *`{Function}`* _**onClick**_  Funkcja obsługująca kliknięcie

**@returns** *`{HTMLButtonElement}`*  - Gotowy element przycisku

```javascript
  createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "form-element";
    btn.addEventListener("click", onClick);
    return btn;
  },
```

---

## isMobile()

Detekcja urządzenia mobilnego na podstawie user-agenta i szerokości okna.

**@returns** *`{boolean}`*  - Czy urządzenie jest mobilne

```javascript
  isMobile() {
    const uaMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );
    const narrow = window.innerWidth < 768;
    const mobile = uaMobile && narrow;
    LoggerService.record("log", "Detekcja urządzenia mobilnego:", mobile);
    return mobile;
  },
```

---

## Pełny kod klasy

```javascript
const Utils = {
  throttle(fn, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },

  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  formatDate(date) {
    return date.toLocaleTimeString("pl-PL", { hour12: false });
  },

  randomId() {
    return Math.random().toString(36).substr(2, 9);
  },

  safeQuery(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      LoggerService.record("warn", `Brak elementu dla selektora: ${selector}`);
    }
    return el;
  },

  createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "form-element";
    btn.addEventListener("click", onClick);
    return btn;
  },

  isMobile() {
    const uaMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );
    const narrow = window.innerWidth < 768;
    const mobile = uaMobile && narrow;
    LoggerService.record("log", "Detekcja urządzenia mobilnego:", mobile);
    return mobile;
  },
};
```