# TagSelectorFactory

==================
Fabryka elementów UI do wyboru tagów.
Tworzy pola wyboru w dwóch wariantach w zależności od środowiska:
 • Mobile → `<select>` z listą opcji
 • Desktop → `<input>` z przypisanym `<datalist>`
Zasady:
-------
✅ Dozwolone:
  - Generowanie elementów formularza dla tagów
  - Nadawanie etykiet polom na podstawie słownika
  - Obsługa wariantu mobilnego i desktopowego
❌ Niedozwolone:
  - Walidacja wybranych tagów
  - Operacje sieciowe
  - Bezpośrednia integracja z backendem
TODO:
  - Obsługa pól wielokrotnego wyboru (multi-select)
  - Dodanie atrybutów dostępności (ARIA)
  - Możliwość ustawiania placeholderów w trybie desktop
Refaktoryzacja?:
  - Ujednolicenie API metod `create` i `createTagField`
  - Wydzielenie generatora opcji do osobnej metody

---
