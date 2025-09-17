# BackendAPI

==========
Warstwa komunikacji z backendem HTTP — odporna na błędy sieciowe, spójna i centralnie konfigurowalna.
Umożliwia wysyłanie żądań POST/GET z automatycznym retry i backoffem.
Integruje się z `RequestRetryManager` i zarządza tokenem autoryzacyjnym.
Zasady:
-------
✅ Odpowiedzialność:
  - Budowanie żądań HTTP (URL, headers, body)
  - Dekodowanie odpowiedzi JSON
  - Obsługa błędów sieciowych i retry
  - Centralne zarządzanie baseURL i tokenem
❌ Niedozwolone:
  - Logika UI
  - Cache’owanie domenowe
  - Mutowanie danych biznesowych
API:
----
• `setBaseURL(url: string)` — ustawia bazowy adres backendu
• `setAuthToken(token: string|null)` — ustawia lub usuwa token autoryzacyjny
• `generate(prompt: string)` — wysyła prompt użytkownika
• `rate(ratings: object)` — przesyła oceny odpowiedzi AI
• `edit(editedText: string, tags: object, sessionId: string, msgId: string)` — przesyła edytowaną odpowiedź
• `postMessage({sender,text})` — przesyła wiadomość użytkownika
• `getTags()` — pobiera słownik tagów
Zależności:
 - `RequestRetryManager`: obsługuje retry i backoff
 - `LoggerService` (opcjonalnie): logowanie błędów

---
