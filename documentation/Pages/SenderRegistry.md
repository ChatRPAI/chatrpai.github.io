# SenderRegistry

==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
Umożliwia rotacyjne przypisywanie kolorów z palety oraz zarządzanie rejestrem.
Zasady:
-------
✅ Odpowiedzialność:
  - Mapowanie nadawca → indeks → klasa CSS
  - Rotacja indeksów po przekroczeniu długości palety
  - Przechowywanie stanu w Map
❌ Niedozwolone:
  - Operacje na DOM
  - Logika aplikacyjna (np. renderowanie wiadomości)
  - Zlecenia sieciowe, localStorage, fetch

---
