# 📦 BackendAPI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
- ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
- ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
- ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony

BackendAPI
==========
Warstwa komunikacji z backendem:
- Obsługuje generowanie odpowiedzi, ocenianie i edycję
- Wykorzystuje `fetch` z metodą POST i JSON


---
## 🔧 Metody

### `generate(prompt)`

Wysyła prompt użytkownika do backendu.


### `rate(ratings)`

Przesyła oceny odpowiedzi AI.


### `edit(editedText, tags)`

Przesyła edytowaną odpowiedź z tagami.


### `postMessage({ sender, text })`

Przesyła wiadomość użytkownika do backendu.


### `getTags()`

Pobiera słownik tagów z backendu.


---
## 🔗 Zależności

- `BackendAPI`
- `RequestRetryManager`