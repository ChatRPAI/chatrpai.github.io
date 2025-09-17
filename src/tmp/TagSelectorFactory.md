# 📦 TagSelectorFactory

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `TagSelectorFactory` działa jako fabryka komponentów tagów
- ✅ Docelowo planowana separacja metod:
• `createTagField()` → `TagFieldRenderer`
• `getLabelText()` → `TagLabelDictionary`
• `replaceTagField()` → `TagFieldReplacer`
- ✅ Możliwość dodania metod: `createTagField(name, options, type)`, `getTagFieldType()`, `getAvailableTags(name)`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami

TagSelectorFactory
==================
Fabryka komponentów tagów:
- Tworzy pola tagów (`select` lub `input + datalist`) zależnie od urządzenia
- Generuje etykiety
- Umożliwia dynamiczną podmianę pola w kontenerze


---
## 🔧 Metody

### `createTagField(name, options)`

Tworzy pole tagu z etykietą i opcjami.
W zależności od urządzenia zwraca `select` lub `input + datalist`.

**Parametry:**
- `name` (`string`): Nazwa pola tagu.
- `options` (`string[]`): Lista dostępnych opcji.

### `getLabelText(name)`

Zwraca tekst etykiety dla danego pola tagu.

**Parametry:**
- `name` (`string`): Nazwa pola.

### `replaceTagField(container, name, options)`

Podmienia istniejące pole tagu w kontenerze na nowe.
Dodatkowo resetuje autofill przez `blur()` i `setSelectionRange()`.

**Parametry:**
- `container` (`HTMLElement`): Kontener DOM.
- `name` (`string`): Nazwa pola tagu.
- `options` (`string[]`): Lista nowych opcji.

---
## 🔗 Zależności

- `TagSelectorFactory`
- `Utils`