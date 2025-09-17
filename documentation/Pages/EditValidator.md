# EditValidator

=============
Walidator tekstu edytowanego przez AI oraz przypisanych tagów.
Sprawdza długość tekstu i tagów oraz obecność treści.
Zasady:
-------
✅ Dozwolone:
  - Stałe limitów: maxTextLength, maxTagLength
  - Metoda: validate(text, tags)
❌ Niedozwolone:
  - Operacje na DOM
  - Zlecenia sieciowe (fetch, localStorage)
  - Logika aplikacyjna (np. renderowanie, wysyłka)
  - Efekty uboczne (np. console.log, mutacje zewnętrznych obiektów)

---
