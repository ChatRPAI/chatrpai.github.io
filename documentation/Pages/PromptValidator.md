# PromptValidator

===============
Walidator promptów użytkownika przed wysłaniem do AI.
Sprawdza typ, długość i obecność niedozwolonych znaków.
Zasady:
-------
✅ Dozwolone:
  - Stałe limitów: minLength, maxLength
  - Wzorzec niedozwolonych znaków: forbidden
  - Metoda: validate(prompt)
❌ Niedozwolone:
  - Operacje na DOM
  - Zlecenia sieciowe (fetch, localStorage)
  - Logika aplikacyjna (np. renderowanie, wysyłka)
  - Efekty uboczne (np. console.log, mutacje zewnętrznych obiektów)
TODO:
  - setLimits()
  - addForbiddenPattern()
  - validateStrict()
  - getErrorSummary()

---
