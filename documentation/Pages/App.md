# App

Główny koordynator cyklu życia aplikacji. Odpowiada za uruchamianie przekazanych modułów
w ustalonej kolejności. Sam nie tworzy modułów – dostaje je z warstwy inicjalizacyjnej
(np. init_chat.js) jako listę obiektów implementujących metodę `init(ctx)`.
## Zasady:
- ✅ Dozwolone:
  - Sekwencyjne uruchamianie modułów
  - Przekazywanie kontekstu (`Context`) do modułów
  - Obsługa modułów synchronicznych i asynchronicznych
- ❌ Niedozwolone:
  - Tworzenie instancji modułów na sztywno
  - Logika biznesowa lub UI
  - Bezpośrednia manipulacja DOM

---

## constructor

Tworzy instancję aplikacji.

**_@param_** *`{Context}`* _**context**_  kontener zależności

**_@param_** *`{Array<{ init: (ctx: Context) => void | Promise<void> }>}`* _**modules**_  lista modułów do uruchomienia

```javascript
  constructor(context, modules = []) {
    this.ctx = context;
    this.modules = modules;
  }
```

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