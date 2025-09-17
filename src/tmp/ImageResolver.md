# 📦 ImageResolver

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
- ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
- ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty

ImageResolver
=============
Resolver obrazów na podstawie tagów:
- Generuje permutacje nazw
- Sprawdza dostępność przez cache, localStorage, HEAD
- Preloaduje znalezione obrazy


---
## 🔧 Metody

### `preloadImages(urls)`

Obsługiwane rozszerzenia plików


### `generateCombinations(tags)`

Generuje permutacje tagów połączone znakiem '_'.

**Parametry:**
- `tags` (`string[]`): Lista tagów.

---
## 🔗 Zależności

- `ImageResolver`