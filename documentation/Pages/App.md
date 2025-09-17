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
