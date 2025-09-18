# UserManager

# UserManager
Statyczna klasa do zarządzania nazwą użytkownika w aplikacji.
Umożliwia zapis, odczyt i czyszczenie imienia użytkownika oraz dynamiczną podmianę placeholderów w tekstach.
Integruje się z polem input `#user_name`, umożliwiając automatyczny zapis zmian.
## Zasady:
  
✅ Odpowiedzialność:
  - Przechowywanie i odczytywanie imienia użytkownika z AppStorageManager
  - Obsługa pola input `#user_name` (wypełnianie i nasłuchiwanie zmian)
  - Podmiana placeholderów w tekstach (np. `{{user}}`)
 
❌ Niedozwolone:
  - Przechowywanie innych danych użytkownika niż imię
  - Logika niezwiązana z nazwą użytkownika
  - Modyfikacja innych pól formularza
 
API:
----
- `setName(name: string)` — zapisuje imię użytkownika
- `getName(): string` — odczytuje imię użytkownika
- `hasName(): boolean` — sprawdza, czy imię jest ustawione
- `clearName()` — usuwa zapisane imię
- `getStorageType(): "localStorage"|"cookie"` — zwraca typ użytej pamięci
- `init(dom: Dom)` — podłącza pole `#user_name` do automatycznego zapisu
- `replacePlaceholders(text: string, map?: Record`<string,string>`): string` — podmienia `{{user}}` i inne placeholdery
   
Zależności:
 - `AppStorageManager`: zapis i odczyt danych
 - `Dom`: dostęp do pola input `#user_name`
 
TODO:
 - Obsługa walidacji imienia (np. długość, znaki)
 - Integracja z systemem profili (jeśli powstanie)
 - Obsługa wielu pól z placeholderami w DOM

---



**@type** *`{string}`*

```javascript
  static storageKey = "user_name";
```

---

## setName()

Zapisuje imię użytkownika w AppStorageManager.

**_@param_** *`{string}`* _**name**_  Imię użytkownika.

```javascript
  static setName(name) {
    AppStorageManager.set(this.storageKey, name.trim());
  }
```

---

## getName()

Odczytuje imię użytkownika z AppStorageManager.

**@returns** *`{string}`*  Imię użytkownika lub pusty string.

```javascript
  static getName() {
    const raw = AppStorageManager.getWithTTL(this.storageKey);
    return typeof raw === "string" ? raw : raw ?? "";
  }
```

---

## hasName()

Sprawdza, czy imię użytkownika jest ustawione.

**@returns** *`{boolean}`*  True, jeśli imię istnieje i nie jest puste.

```javascript
  static hasName() {
    return !!this.getName().trim();
  }
```

---

## clearName()

Usuwa zapisane imię użytkownika.

```javascript
  static clearName() {
    AppStorageManager.remove(this.storageKey);
  }
```

---

## getStorageType()

Zwraca typ pamięci, w której aktualnie przechowywane jest imię.

**@returns** *`{"localStorage"|"cookie"}`*

```javascript
  static getStorageType() {
    return AppStorageManager.type();
  }
```

---

## init()

Podłącza pole input #user_name:
- wypełnia istniejącą wartością,
- zapisuje każdą zmianę.

**_@param_** *`{Dom}`* _**dom**_  Instancja klasy Dom z metodą `q()`.

```javascript
  static init(dom) {
    const input = dom.q("#user_name");
    if (!input) return;
    input.value = this.getName();
    input.addEventListener("input", () => {
      this.setName(input.value);
    });
  }
```

---

## replacePlaceholders()

Podmienia placeholdery w tekście na aktualne imię użytkownika.
@param {Object`<string,string>`} [map] - Opcjonalna mapa dodatkowych placeholderów do podmiany.

**_@param_** *`{string}`* _**text**_  Tekst zawierający placeholdery (np. {{user}}).

**@returns** *`{string}`*  Tekst z podmienionymi wartościami.

```javascript
  static replacePlaceholders(text, map = {}) {
    const name = this.getName() || "Użytkowniku";
    let result = text.replace(/{{\s*user\s*}}/gi, name);
    for (const [key, value] of Object.entries(map)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
      result = result.replace(regex, value);
    }
    return result;
  }
```

---

## Pełny kod klasy
```javascript
class UserManager {
  static storageKey = "user_name";

  static setName(name) {
    AppStorageManager.set(this.storageKey, name.trim());
  }

  static getName() {
    const raw = AppStorageManager.getWithTTL(this.storageKey);
    return typeof raw === "string" ? raw : raw ?? "";
  }

  static hasName() {
    return !!this.getName().trim();
  }

  static clearName() {
    AppStorageManager.remove(this.storageKey);
  }

  static getStorageType() {
    return AppStorageManager.type();
  }

  static init(dom) {
    const input = dom.q("#user_name");
    if (!input) return;
    input.value = this.getName();
    input.addEventListener("input", () => {
      this.setName(input.value);
    });
  }

  static replacePlaceholders(text, map = {}) {
    const name = this.getName() || "Użytkowniku";
    let result = text.replace(/{{\s*user\s*}}/gi, name);
    for (const [key, value] of Object.entries(map)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
      result = result.replace(regex, value);
    }
    return result;
  }
}
```