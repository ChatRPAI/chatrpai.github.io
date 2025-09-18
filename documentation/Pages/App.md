# App

Główny koordynator cyklu życia aplikacji. Odpowiada za uruchamianie przekazanych modułów
w ustalonej kolejności. Sam nie tworzy modułów – dostaje je z warstwy inicjalizacyjnej
(np. init_chat.js) jako listę obiektów implementujących metodę `init(ctx)`.
Zasady:
-------
✅ Dozwolone:
  - Sekwencyjne uruchamianie modułów
  - Przekazywanie kontekstu (`Context`) do modułów
  - Obsługa modułów synchronicznych i asynchronicznych
❌ Niedozwolone:
  - Tworzenie instancji modułów na sztywno
  - Logika biznesowa lub UI
  - Bezpośrednia manipulacja DOM
TODO:
  - Obsługa zatrzymywania modułów (`destroy()`)
  - Równoległe uruchamianie niezależnych modułów
  - Obsługa wyjątków w pojedynczych modułach bez przerywania całej inicjalizacji
Refaktoryzacja?:
  - Wprowadzenie systemu priorytetów modułów
  - Integracja z loggerem do raportowania czasu inicjalizacji

---

## constructor

Tworzy instancję aplikacji.

**_@param_** *`{Context}`* _**context**_  kontener zależności
**_@param_** *`{Array<{ init: (ctx: Context) => void | Promise<void> }>}`* _**modules**_  lista modułów do uruchomienia

```javascript
  constructor(context, modules = []) {
    /** @type {Context} */
    this.ctx = context;
    /** @type {Array<{ init: (ctx: Context) => any }>} */
    this.modules = modules;
  }
```

---

this.ctx = context;

---

## init()

Uruchamia wszystkie moduły w kolejności, przekazując im kontekst.
Obsługuje moduły synchroniczne i asynchroniczne.

**@returns** *`{Promise<void>}`*

```javascript
  async init() {
    LoggerService.record("log", "[App] Inicjalizacja aplikacji...");
    for (const m of this.modules) {
      if (m && typeof m.init === "function") {
        await m.init(this.ctx);
      }
    }
    LoggerService.record("log", "[App] Aplikacja gotowa.");
  }
```

---

## Pełny kod klasy
```javascript
class App {
  constructor(context, modules = []) {
    this.ctx = context;
    this.modules = modules;
  }

  async init() {
    LoggerService.record("log", "[App] Inicjalizacja aplikacji...");
    for (const m of this.modules) {
      if (m && typeof m.init === "function") {
        await m.init(this.ctx);
      }
    }
    LoggerService.record("log", "[App] Aplikacja gotowa.");
  }
}
```