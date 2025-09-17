# AppStorageManager

==============
Uniwersalny mediator przechowywania danych z automatycznym fallbackiem
z `localStorage` do `cookie` w przypadku braku dostępu lub błędu.
Obsługuje TTL w sekundach, czyszczenie wpisów z prefiksem,
oraz mechanizmy obronne przy przekroczeniu limitu pamięci (`QuotaExceededError`).
Zasady:
-------
✅ Odpowiedzialność:
  - Zapisywanie, odczytywanie i usuwanie danych w `localStorage` lub `cookie`
  - Obsługa TTL i czyszczenie danych tymczasowych
  - Reakcja na błędy pamięci i komunikacja z użytkownikiem
❌ Niedozwolone:
  - Wymuszanie prefiksów
  - Logika aplikacyjna (np. interpretacja danych)

---
