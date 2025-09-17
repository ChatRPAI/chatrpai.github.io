# LoggerService

=============
Buforowany logger do środowiska przeglądarkowego z ograniczeniem wieku wpisów.
Obsługuje poziomy logowania: 'log', 'warn', 'error'.
Wpisy są przechowywane w pamięci i mogą być filtrowane, czyszczone lub eksportowane.
Zasady:
-------
✅ Dozwolone:
  - record(level, msg, ...args)
  - cleanup()
  - getHistory({clone})
  - clearHistory()
  - setMaxAge(ms)
  - filterByLevel(level)
  - recordOnce(level, msg, ...args)
❌ Niedozwolone:
  - logika aplikacji (business logic)
  - operacje sieciowe, DOM, storage
TODO:
  - exportHistory(format)

---
