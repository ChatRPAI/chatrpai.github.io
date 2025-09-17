# 📦 RequestRetryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
- ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
- ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty

RequestRetryManager
===================
Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.


---
## 🔗 Zależności

- `RequestRetryManager`