# AppStorageManager

Uniwersalny mediator przechowywania danych z automatycznym fallbackiem
z `localStorage` do `cookie` w przypadku braku dostępu lub błędu.
Obsługuje TTL w sekundach, czyszczenie wpisów z prefiksem,
oraz mechanizmy obronne przy przekroczeniu limitu pamięci (`QuotaExceededError`).
## Zasady:
- ✅ Dozwolone:
  - Zapisywanie, odczytywanie i usuwanie danych w `localStorage` lub `cookie`
  - Obsługa TTL i czyszczenie danych tymczasowych
  - Reakcja na błędy pamięci i komunikacja z użytkownikiem
- ❌ Niedozwolone:
  - Wymuszanie prefiksów
  - Logika aplikacyjna (np. interpretacja danych)

---

## _hasLocalStorage()

Sprawdza, czy `localStorage` jest dostępny i funkcjonalny.
Wykonuje testowy zapis i usunięcie wpisu.

**@returns** *`{boolean}`*  True, jeśli można bezpiecznie używać `localStorage`.

```javascript
  static _hasLocalStorage() {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
```

---

## type()

Zwraca typ aktualnie używanego magazynu.

**@returns** *`{"localStorage"|"cookie"}`*  Typ aktywnego backendu.

```javascript
  static type() {
    return this._hasLocalStorage() ? "localStorage" : "cookie";
  }
```

---

## set()

Zapisuje wartość pod wskazanym kluczem z opcjonalnym TTL.
TTL wyrażony w sekundach. Domyślnie 30 dni (2592000 sekund).
Wartość jest serializowana do JSON.
@param {number} [ttl=2592000] - Czas życia w sekundach.

**_@param_** *`{string}`* _**key**_  Klucz pod którym zapisywana jest wartość.

**_@param_** *`{any}`* _**value**_  Dowolna wartość do zapisania.

```javascript
  static set(key, value, ttl = 2592000) {
    const now = Date.now();
    const payload = ttl ? { value, ts: now, ttl: ttl * 1000 } : value;

    const serialized = JSON.stringify(payload);

    if (this._hasLocalStorage()) {
      try {
        localStorage.setItem(key, serialized);
      } catch (err) {
        if (err.name === "QuotaExceededError") {
          this.purgeByPrefix("img-exists:");
          try {
            localStorage.setItem(key, serialized);
          } catch (e) {
            this._handleStorageFailure("localStorage", key, e);
          }
        } else {
          this._handleStorageFailure("localStorage", key, err);
        }
      }
    } else {
      let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
        serialized
      )}; path=/`;
      if (ttl) {
        cookie += `; max-age=${ttl}`;
      }
      document.cookie = cookie;

      // Sprawdzenie skuteczności zapisu
      if (!document.cookie.includes(`${encodeURIComponent(key)}=`)) {
        this._handleStorageFailure("cookie", key);
      }
    }
  }
```

---

## get()

Odczytuje wartość spod wskazanego klucza.
Deserializuje JSON, jeśli to możliwe.

**_@param_** *`{string}`* _**key**_  Klucz do odczytu.

**@returns** *`{any|null}`*  Wartość lub null, jeśli brak.

```javascript
  static get(key) {
    let raw = null;
    if (this._hasLocalStorage()) {
      raw = localStorage.getItem(key);
    } else {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
      );
      raw = match ? decodeURIComponent(match[1]) : null;
    }
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return raw;
    }
  }
```

---

## getWithTTL()

Odczytuje wartość z TTL. Jeśli wygasła — usuwa i zwraca null.

**_@param_** *`{string}`* _**key**_  Klucz do odczytu.

**@returns** *`{any|null}`*  Wartość lub null, jeśli wygasła lub nie istnieje.

```javascript
  static getWithTTL(key) {
    const raw = this.get(key);
    if (!raw || typeof raw !== "object") return raw;

    if (raw.ttl && raw.ts && Date.now() - raw.ts > raw.ttl) {
      this.remove(key);
      return null;
    }
    return raw.value ?? raw;
  }
```

---

## remove()

Usuwa wartość spod wskazanego klucza.

**_@param_** *`{string}`* _**key**_  Klucz do usunięcia.

```javascript
  static remove(key) {
    if (this._hasLocalStorage()) {
      localStorage.removeItem(key);
    } else {
      document.cookie = `${encodeURIComponent(key)}=; max-age=0; path=/`;
    }
  }
```

---

## keys()

Zwraca listę wszystkich kluczy z aktualnego backendu.

**@returns** *`{string[]}`*  Tablica kluczy.

```javascript
  static keys() {
    if (this._hasLocalStorage()) {
      return Object.keys(localStorage);
    } else {
      return document.cookie
        .split(";")
        .map((c) => decodeURIComponent(c.split("=")[0].trim()))
        .filter((k) => k.length > 0);
    }
  }
```

---

## purgeByPrefix()

Usuwa wszystkie wpisy z danym prefiksem.

**_@param_** *`{string}`* _**prefix**_  Prefiks kluczy do usunięcia.

```javascript
  static purgeByPrefix(prefix) {
    this.keys()
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => this.remove(k));
  }
```

---

## _handleStorageFailure()

Obsługuje błędy zapisu do pamięci (`QuotaExceededError` lub inne).
Informuje użytkownika i oferuje czyszczenie pamięci.
@param {Error} [error] - Opcjonalny obiekt błędu.

**_@param_** *`{"localStorage"|"cookie"}`* _**type**_  Typ pamięci.

**_@param_** *`{string}`* _**key**_  Klucz, który nie został zapisany.

```javascript
  static _handleStorageFailure(type, key, error) {
    LoggerService?.record(
      "warn",
      `[AppStorageManager] ${type} niedostępny lub pełny przy zapisie ${key}`,
      error
    );

    const confirmed = window.confirm(
      `Pamięć ${type} jest pełna lub niedostępna. Czy chcesz ją wyczyścić, aby kontynuować?`
    );

    if (confirmed) {
      if (type === "localStorage") localStorage.clear();
      if (type === "cookie") {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });
      }
      LoggerService?.record(
        "info",
        `[AppStorageManager] ${type} wyczyszczony przez użytkownika.`
      );
    } else {
      LoggerService?.record(
        "info",
        `[AppStorageManager] Użytkownik odmówił czyszczenia ${type}.`
      );
    }
  }
```

---

## Pełny kod klasy

```javascript
class AppStorageManager {
  static _hasLocalStorage() {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static type() {
    return this._hasLocalStorage() ? "localStorage" : "cookie";
  }

  static set(key, value, ttl = 2592000) {
    const now = Date.now();
    const payload = ttl ? { value, ts: now, ttl: ttl * 1000 } : value;

    const serialized = JSON.stringify(payload);

    if (this._hasLocalStorage()) {
      try {
        localStorage.setItem(key, serialized);
      } catch (err) {
        if (err.name === "QuotaExceededError") {
          this.purgeByPrefix("img-exists:");
          try {
            localStorage.setItem(key, serialized);
          } catch (e) {
            this._handleStorageFailure("localStorage", key, e);
          }
        } else {
          this._handleStorageFailure("localStorage", key, err);
        }
      }
    } else {
      let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
        serialized
      )}; path=/`;
      if (ttl) {
        cookie += `; max-age=${ttl}`;
      }
      document.cookie = cookie;

      if (!document.cookie.includes(`${encodeURIComponent(key)}=`)) {
        this._handleStorageFailure("cookie", key);
      }
    }
  }

  static get(key) {
    let raw = null;
    if (this._hasLocalStorage()) {
      raw = localStorage.getItem(key);
    } else {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
      );
      raw = match ? decodeURIComponent(match[1]) : null;
    }
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return raw;
    }
  }

  static getWithTTL(key) {
    const raw = this.get(key);
    if (!raw || typeof raw !== "object") return raw;

    if (raw.ttl && raw.ts && Date.now() - raw.ts > raw.ttl) {
      this.remove(key);
      return null;
    }
    return raw.value ?? raw;
  }

  static remove(key) {
    if (this._hasLocalStorage()) {
      localStorage.removeItem(key);
    } else {
      document.cookie = `${encodeURIComponent(key)}=; max-age=0; path=/`;
    }
  }

  static keys() {
    if (this._hasLocalStorage()) {
      return Object.keys(localStorage);
    } else {
      return document.cookie
        .split(";")
        .map((c) => decodeURIComponent(c.split("=")[0].trim()))
        .filter((k) => k.length > 0);
    }
  }

  static purgeByPrefix(prefix) {
    this.keys()
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => this.remove(k));
  }

  static _handleStorageFailure(type, key, error) {
    LoggerService?.record(
      "warn",
      `[AppStorageManager] ${type} niedostępny lub pełny przy zapisie ${key}`,
      error
    );

    const confirmed = window.confirm(
      `Pamięć ${type} jest pełna lub niedostępna. Czy chcesz ją wyczyścić, aby kontynuować?`
    );

    if (confirmed) {
      if (type === "localStorage") localStorage.clear();
      if (type === "cookie") {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });
      }
      LoggerService?.record(
        "info",
        `[AppStorageManager] ${type} wyczyszczony przez użytkownika.`
      );
    } else {
      LoggerService?.record(
        "info",
        `[AppStorageManager] Użytkownik odmówił czyszczenia ${type}.`
      );
    }
  }
}
```