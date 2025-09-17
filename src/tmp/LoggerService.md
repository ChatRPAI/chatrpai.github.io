# 📦 LoggerService

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `LoggerService` działa jako buforowany logger z historią
- ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
- ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

LoggerService
=============
Centralny logger aplikacji:
- Buforuje wpisy z poziomem i timestampem
- Czyści wpisy starsze niż 5 minut
- Pozwala pobrać historię i ją wyczyścić


---
## 🔧 Metody

### `record(level, msg, ...args)`

Bufor wpisów logowania


### `cleanup()`

Usuwa wpisy starsze niż `maxAgeMs`.


### `getHistory({ clone = false } = {})`

Zwraca historię logów z bufora.


### `clearHistory()`

Czyści cały bufor logów.


---
## 🔗 Zależności

- `LoggerService`