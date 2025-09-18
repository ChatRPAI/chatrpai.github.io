# SenderRegistry

Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
Umożliwia rotacyjne przypisywanie kolorów z palety oraz zarządzanie rejestrem.
## Zasady:
- ✅ Dozwolone:
  - Mapowanie nadawca → indeks → klasa CSS
  - Rotacja indeksów po przekroczeniu długości palety
  - Przechowywanie stanu w Map
- ❌ Niedozwolone:
  - Operacje na DOM
  - Logika aplikacyjna (np. renderowanie wiadomości)
  - Zlecenia sieciowe, localStorage, fetch

---

Lista dostępnych klas CSS dla nadawców.
Kolory są przypisywane rotacyjnie na podstawie indeksu.

**@type** *`{string[]}`*

```javascript
  static palette = [
```

---

Rejestr przypisań nadawca → indeks palety.

**@type** *`{Map<string, number>}`*

```javascript
  static registry = new Map();
```

---

Licznik rotacyjny dla kolejnych nadawców.
Wykorzystywany do wyznaczania indeksu w palecie.

**@type** *`{number}`*

```javascript
  static nextIndex = 0;
```

---

## getClass()

Zwraca klasę CSS dla danego nadawcy.
Jeśli nadawca nie był wcześniej zarejestrowany, przypisuje mu nową klasę z palety.

**_@param_** *`{string}`* _**sender**_  Nazwa nadawcy

**@returns** *`{string}`*  - Klasa CSS przypisana nadawcy

```javascript
  static getClass(sender) {
    if (!sender || typeof sender !== "string") return "sender-color-default";

    if (!this.registry.has(sender)) {
      const index = this.nextIndex % this.palette.length;
      this.registry.set(sender, index);
      this.nextIndex++;
    }

    const idx = this.registry.get(sender);
    return this.palette[idx];
  }
```

---

## reset()

Czyści rejestr nadawców i resetuje licznik.
Używane np. przy resecie czatu.

```javascript
  static reset() {
    this.registry.clear();
    this.nextIndex = 0;
  }
```

---

## hasSender()

Sprawdza, czy nadawca jest już zarejestrowany.

**_@param_** *`{string}`* _**sender**_  Nazwa nadawcy

**@returns** *`{boolean}`*  - Czy nadawca istnieje w rejestrze

```javascript
  static hasSender(sender) {
    return this.registry.has(sender);
  }
```

---

## getSenderIndex()

Zwraca indeks przypisany nadawcy w palecie.

**_@param_** *`{string}`* _**sender**_  Nazwa nadawcy

**@returns** *`{number | undefined}`*  - Indeks w palecie lub undefined

```javascript
  static getSenderIndex(sender) {
    return this.registry.get(sender);
  }
```

---

## getPalette()

Zwraca aktualną paletę kolorów.

**@returns** *`{string[]}`*  - Kopia tablicy z klasami CSS

```javascript
  static getPalette() {
    return [...this.palette];
  }
```

---

## setPalette()

Ustawia nową paletę kolorów i resetuje rejestr.

**_@param_** *`{string[]}`* _**newPalette**_  Nowa lista klas CSS

```javascript
  static setPalette(newPalette) {
    if (Array.isArray(newPalette) && newPalette.length > 0) {
      this.palette = newPalette;
      this.reset();
    }
  }
```

---

## Pełny kod klasy

```javascript
class SenderRegistry {
  static palette = [
    "sender-color-1",
    "sender-color-2",
    "sender-color-3",
    "sender-color-4",
    "sender-color-5",
    "sender-color-6",
    "sender-color-7",
    "sender-color-8",
    "sender-color-9",
    "sender-color-10",
    "sender-color-11",
    "sender-color-12",
    "sender-color-13",
    "sender-color-14",
  ];

  static registry = new Map();

  static nextIndex = 0;

  static getClass(sender) {
    if (!sender || typeof sender !== "string") return "sender-color-default";

    if (!this.registry.has(sender)) {
      const index = this.nextIndex % this.palette.length;
      this.registry.set(sender, index);
      this.nextIndex++;
    }

    const idx = this.registry.get(sender);
    return this.palette[idx];
  }

  static reset() {
    this.registry.clear();
    this.nextIndex = 0;
  }

  static hasSender(sender) {
    return this.registry.has(sender);
  }

  static getSenderIndex(sender) {
    return this.registry.get(sender);
  }

  static getPalette() {
    return [...this.palette];
  }

  static setPalette(newPalette) {
    if (Array.isArray(newPalette) && newPalette.length > 0) {
      this.palette = newPalette;
      this.reset();
    }
  }
}
```