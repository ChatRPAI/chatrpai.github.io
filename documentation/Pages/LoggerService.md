# LoggerService

=============
Buforowany logger do środowiska przeglądarkowego z ograniczeniem wieku wpisów.
Obsługuje poziomy logowania: 'log', 'warn', 'error'.
Wpisy są przechowywane w pamięci i mogą być filtrowane, czyszczone lub eksportowane.
Zasady:
-------
✅ Dozwolone:
  - record(level, msg, ...args)
  - cleanup()
  - getHistory({clone})
  - clearHistory()
  - setMaxAge(ms)
  - filterByLevel(level)
  - recordOnce(level, msg, ...args)
❌ Niedozwolone:
  - logika aplikacji (business logic)
  - operacje sieciowe, DOM, storage
TODO:
  - exportHistory(format)

---

Bufor wpisów logowania.
Każdy wpis zawiera znacznik czasu, poziom, wiadomość i dodatkowe argumenty.

**@type** *`{Array<{timestamp: number, level: 'log'|'warn'|'error', msg: string, args: any[]}`*

```javascript
  static buffer = [];
```

---

Maksymalny wiek wpisów w milisekundach.
Wpisy starsze niż ta wartość są usuwane przy każdym logowaniu i odczycie.

**@type** *`{number}`*

```javascript
  static maxAgeMs = 5 * 60 * 1000; // 5 minut
```

---

## setMaxAge()

Ustawia nowy limit wieku wpisów i natychmiast czyści stare.

**_@param_** *`{number}`* _**ms**_  nowy limit wieku w milisekundach

```javascript
  static setMaxAge(ms) {
    this.maxAgeMs = ms;
    this.cleanup();
  }
```

---

## record()

Dodaje wpis do bufora i wypisuje go w konsoli z odpowiednim stylem.

**_@param_** *`{'log'|'warn'|'error'}`* _**level**_  poziom logowania
**_@param_** *`{string}`* _**msg**_  wiadomość do wyświetlenia
**_@param_** *`{...any}`* _**args**_  dodatkowe dane (np. obiekty, błędy)

```javascript
  static record(level, msg, ...args) {
    const emojiLevels = { log: "🌍", warn: "⚠️", error: "‼️" };
    const timestamp = Date.now();

    this.buffer.push({ timestamp, level, msg, args });
    this.cleanup();

    const styleMap = {
      log: "color: #444",
      warn: "color: orange",
      error: "color: red; font-weight: bold",
    };

    const style = styleMap[level] || "";
    const displayMsg = `${emojiLevels[level] || ""} ${msg}`;
    console[level](`%c[${new Date(timestamp).toLocaleTimeString()}] ${displayMsg}`, style, ...args);
  }
```

---

## cleanup()

Usuwa wpisy starsze niż maxAgeMs.
Jeśli maxAgeMs <= 0, czyści cały bufor.

```javascript
  static cleanup() {
    if (this.maxAgeMs <= 0) {
      this.buffer = [];
      return;
    }
    const cutoff = Date.now() - this.maxAgeMs;
    this.buffer = this.buffer.filter((e) => e.timestamp >= cutoff);
  }
```

---

## filterByLevel()

Zwraca wpisy danego poziomu logowania.

**_@param_** *`{'log'|'warn'|'error'}`* _**level**_  poziom do filtrowania

**@returns** *`{Array<{timestamp: number, msg: string, args: any[]}`*  >}

```javascript
  static filterByLevel(level) {
    this.cleanup();
    return this.buffer
      .filter((e) => e.level === level)
      .map(({ timestamp, msg, args }) => ({ timestamp, msg, args }));
  }
```

---

## getHistory()

Zwraca całą historię wpisów.
Jeśli clone = true, zwraca głęboką kopię wpisów.
@param {boolean} [clone=false] - czy zwrócić kopię wpisów

**@returns** *`{Array<{timestamp: number, level: string, msg: string, args: any[]}`*  >}

```javascript
  static getHistory(clone = false) {
    this.cleanup();
    if (!clone) return [...this.buffer];
    return this.buffer.map((entry) => structuredClone(entry));
  }
```

---

## clearHistory()

Czyści cały bufor logów bez względu na wiek wpisów.

```javascript
  static clearHistory() {
    this.buffer = [];
  }
```

---

## recordOnce()

Dodaje wpis tylko jeśli nie istnieje już wpis o tym samym poziomie i wiadomości.

**_@param_** *`{'log'|'warn'|'error'}`* _**level**_  poziom logowania
**_@param_** *`{string}`* _**msg**_  wiadomość
**_@param_** *`{...any}`* _**args**_  dodatkowe dane

```javascript
  static recordOnce(level, msg, ...args) {
    if (!this.buffer.some((e) => e.level === level && e.msg === msg)) {
      this.record(level, msg, ...args);
    }
  }
```

---

## Pełny kod klasy
```javascript
class LoggerService {
  static buffer = [];

  static maxAgeMs = 5 * 60 * 1000; // 5 minut

  static setMaxAge(ms) {
    this.maxAgeMs = ms;
    this.cleanup();
  }

  static record(level, msg, ...args) {
    const emojiLevels = { log: "🌍", warn: "⚠️", error: "‼️" };
    const timestamp = Date.now();

    this.buffer.push({ timestamp, level, msg, args });
    this.cleanup();

    const styleMap = {
      log: "color: #444",
      warn: "color: orange",
      error: "color: red; font-weight: bold",
    };

    const style = styleMap[level] || "";
    const displayMsg = `${emojiLevels[level] || ""} ${msg}`;
    console[level](`%c[${new Date(timestamp).toLocaleTimeString()}] ${displayMsg}`, style, ...args);
  }

  static cleanup() {
    if (this.maxAgeMs <= 0) {
      this.buffer = [];
      return;
    }
    const cutoff = Date.now() - this.maxAgeMs;
    this.buffer = this.buffer.filter((e) => e.timestamp >= cutoff);
  }

  static filterByLevel(level) {
    this.cleanup();
    return this.buffer
      .filter((e) => e.level === level)
      .map(({ timestamp, msg, args }) => ({ timestamp, msg, args }));
  }

  static getHistory(clone = false) {
    this.cleanup();
    if (!clone) return [...this.buffer];
    return this.buffer.map((entry) => structuredClone(entry));
  }

  static clearHistory() {
    this.buffer = [];
  }

  static recordOnce(level, msg, ...args) {
    if (!this.buffer.some((e) => e.level === level && e.msg === msg)) {
      this.record(level, msg, ...args);
    }
  }
}
```