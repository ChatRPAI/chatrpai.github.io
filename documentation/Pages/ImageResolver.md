# ImageResolver

=============
Narzędzie do wyszukiwania istniejących obrazów na podstawie tagów.
Obsługuje permutacje nazw plików, cache wyników oraz preload obrazów.
Zasady:
-------
✅ Dozwolone:
  - resolve(tags, opts?): Promise`<string[]>`
  - resolveBest(tags, opts?): Promise`<string>`
  - clearCache(): void
  - preload(url): void
❌ Niedozwolone:
  - Renderowanie DOM (poza preload `<img>`)
  - Logika UI lub biznesowa
  - Zależności od klas domenowych
TODO:
  - setBasePath(path: string)
  - setExtensions(exts: string[])
  - getCacheStats(): { hits: number, misses: number }
  - resolveAll(tags: string[]): Promise`<{ found: string[], missing: string[] }>`

---
