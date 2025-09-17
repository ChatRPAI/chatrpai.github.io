# 📦 EditValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
- ✅ Zwraca wynik walidacji i listę błędów
- ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

EditValidator
=============
Walidator treści edytowanej wiadomości i tagów:
- Tekst nie może być pusty ani za długi
- Tagi nie mogą przekraczać limitu znaków


---
## 🔧 Metody

### `validate(text, tags)`

Maksymalna długość tekstu


---
## 🔗 Zależności

- `EditValidator`