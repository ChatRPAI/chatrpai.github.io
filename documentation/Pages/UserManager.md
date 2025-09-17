# UserManager

===========
Statyczna klasa do zarządzania nazwą użytkownika w aplikacji.
Umożliwia zapis, odczyt i czyszczenie imienia użytkownika oraz dynamiczną podmianę placeholderów w tekstach.
Integruje się z polem input `#user_name`, umożliwiając automatyczny zapis zmian.
Zasady:
-------
✅ Odpowiedzialność:
  - Przechowywanie i odczytywanie imienia użytkownika z AppStorageManager
  - Obsługa pola input `#user_name` (wypełnianie i nasłuchiwanie zmian)
  - Podmiana placeholderów w tekstach (np. `{{user}}`)
❌ Niedozwolone:
  - Przechowywanie innych danych użytkownika niż imię
  - Logika niezwiązana z nazwą użytkownika
  - Modyfikacja innych pól formularza
API:
----
• `setName(name: string)` — zapisuje imię użytkownika
• `getName(): string` — odczytuje imię użytkownika
• `hasName(): boolean` — sprawdza, czy imię jest ustawione
• `clearName()` — usuwa zapisane imię
• `getStorageType(): "localStorage"|"cookie"` — zwraca typ użytej pamięci
• `init(dom: Dom)` — podłącza pole `#user_name` do automatycznego zapisu
• `replacePlaceholders(text: string, map?: Record`<string,string>`): string` — podmienia `{{user}}` i inne placeholdery
Zależności:
 - `AppStorageManager`: zapis i odczyt danych
 - `Dom`: dostęp do pola input `#user_name`
TODO:
 - Obsługa walidacji imienia (np. długość, znaki)
 - Integracja z systemem profili (jeśli powstanie)
 - Obsługa wielu pól z placeholderami w DOM

---
