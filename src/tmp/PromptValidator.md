# 📦 PromptValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PromptValidator` działa jako walidator treści promptów
- ✅ Obsługuje typ, długość i niedozwolone znaki
- ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

PromptValidator
===============
Walidator treści promptów:
- Sprawdza typ (string)
- Sprawdza długość w granicach [minLength, maxLength]
- Sprawdza obecność niedozwolonych znaków


---
## 🔧 Metody

### `validate(prompt)`

Minimalna długość promptu


---
## 🔗 Zależności

- `PromptValidator`