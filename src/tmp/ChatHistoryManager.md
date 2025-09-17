# 📦 ChatHistoryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatHistoryManager` buforuje historię czatu i synchronizuje ją z backendem
- ✅ Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- ✅ Wykorzystuje `localStorage` z kontrolą świeżości cache
- ✅ Posiada dobrze wydzielone metody prywatne: `_loadCache()`, `_saveCache()`, `_isCacheFresh()`, `_fetchHistoryFromServer()`
- ✅ Możliwość dodania metod: `clearCache()`, `forceRefresh()`, `getLastMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest przejrzysty i dobrze rozdzielony

ChatHistoryManager
==================
Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
- Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- Chroni przed nadmiernym ruchem sieciowym


---
## 🔧 Metody

### `_loadCache()`

Inicjalizuje sesję czatu.

**Parametry:**
- `sessionId` (`string`): Identyfikator sesji z backendu.

### `_saveCache()`

Zapisuje historię do localStorage.


### `_isCacheFresh()`

Sprawdza, czy cache jest świeży.


---
## 🔗 Zależności

- `ChatHistoryManager`