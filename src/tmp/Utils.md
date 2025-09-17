# 📦 Utils

FEEDBACK KAMILA (11.09.2025)
=============================
- ✅ Klasa `Utils` działa jako statyczny zestaw narzędzi — nie wymaga instancji
- ✅ Docelowo planowana separacja metod do modułów:
• `throttle`, `debounce` → `TimingUtils`
• `formatDate`, `clamp`, `randomId` → `DataUtils`
• `safeQuery`, `createButton` → `DOMUtils`
• `isMobile` → `EnvUtils` / `DeviceDetector`
• `checkImageExists` → `ResourceUtils` / `ImageValidator`
- ✅ Możliwość dodania metod: `once`, `retry`, `wait`, `escapeHTML`, `parseQueryParams`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami

Utils
=====
Klasa zawierająca zestaw statycznych metod pomocniczych wykorzystywanych w całej aplikacji.
Nie wymaga instancjonowania — wszystkie metody są dostępne bezpośrednio przez `Utils`.

Oferuje funkcje związane z:
- optymalizacją wywołań (throttle, debounce),
- manipulacją danymi (formatowanie dat, ograniczanie wartości, generowanie ID),
- obsługą DOM (bezpieczne pobieranie elementów, tworzenie przycisków),
- detekcją środowiska (mobilność),
- sprawdzaniem dostępności zasobów (obrazów).


---
## 🔧 Metody

### `throttle(fn, limit)`

Ogranicza częstotliwość wywołań funkcji — zapewnia, że funkcja `fn` nie zostanie wywołana częściej niż co `limit` milisekund.

**Parametry:**
- `fn` (`Function`): Funkcja do ograniczenia.
- `limit` (`number`): Minimalny odstęp czasu w ms.

### `debounce(fn, delay)`

Opóźnia wywołanie funkcji do momentu, aż minie określony czas od ostatniego wywołania.
Przydatne np. przy obsłudze inputów, scrolla, resize.

**Parametry:**
- `fn` (`Function`): Funkcja do opóźnienia.
- `delay` (`number`): Czas opóźnienia w ms.

### `formatDate(date)`

Formatuje datę do czytelnego formatu zgodnego z lokalizacją `pl-PL`.

**Parametry:**
- `date` (`Date|string|number`): Obiekt Date, timestamp lub string.

### `clamp(value, min, max)`

Ogranicza wartość do podanego zakresu [min, max].

**Parametry:**
- `value` (`number`): Wartość wejściowa.
- `min` (`number`): Minimalna wartość.
- `max` (`number`): Maksymalna wartość.

### `randomId(length = 8)`

Generuje losowy identyfikator alfanumeryczny.


### `isMobile()`

Sprawdza, czy użytkownik korzysta z urządzenia mobilnego na podstawie `navigator.userAgent`.
Wypisuje wynik detekcji w konsoli.


### `safeQuery(selector)`

Bezpieczne pobieranie elementu DOM.
Jeśli element nie istnieje, wypisuje ostrzeżenie w konsoli.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `createButton(label, onClick)`

Tworzy przycisk HTML z podanym tekstem i funkcją obsługi kliknięcia.

**Parametry:**
- `label` (`string`): Tekst przycisku.
- `onClick` (`Function`): Funkcja wywoływana po kliknięciu.

---
## 🔗 Zależności

- `LoggerService`
- `Utils`