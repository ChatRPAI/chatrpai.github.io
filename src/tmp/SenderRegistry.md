# 📦 SenderRegistry

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
- ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
- ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
- ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę

SenderRegistry
==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
- Każdy nadawca otrzymuje klasę z palety
- Przypisania są zapamiętywane w `Map`
- Indeksy rotują, by nie przekroczyć długości palety


---
## 🔧 Metody

### `getClass(sender)`

Paleta dostępnych klas CSS


---
## 🔗 Zależności

- `SenderRegistry`