# 📦 UserManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `UserManager` działa jako statyczny menedżer sesji użytkownika
- ✅ Docelowo planowana separacja metod:
• `setName`, `getName` → `UserStorage`
• `init(dom)` → `UserInputBinder`
• `replacePlaceholders(text)` → `TextInterpolator`
- ✅ Możliwość dodania metod: `hasName()`, `clearName()`, `getStorageType()`, `replacePlaceholders(text, map)`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami
- Wyjaśnić czym jest interpolacja tekstu

UserManager
===========
Statyczna klasa do zarządzania nazwą użytkownika:
- zapisuje w localStorage lub cookie (fallback),
- odczytuje nazwę użytkownika,
- podłącza pole input do automatycznego zapisu,
- podmienia placeholdery w tekstach.


---
## 🔧 Metody

### `setName(name)`

Klucz używany w localStorage i cookie


### `getName()`

Odczytuje imię użytkownika z localStorage lub cookie.


### `init(dom)`

Podłącza pole input #user_name:
- wypełnia istniejącą wartością,
- zapisuje każdą zmianę.

**Parametry:**
- `dom` (`Dom`): Instancja klasy Dom z metodą `q()`.

### `replacePlaceholders(text)`

Podmienia placeholder {{user}} w tekście na aktualne imię.

**Parametry:**
- `text` (`string`): Tekst zawierający placeholder.

---
## 🔗 Zależności

- `Dom`
- `UserManager`