# ImageResolver

# ImageResolver
Narzędzie do wyszukiwania istniejących obrazów na podstawie tagów.
Obsługuje permutacje nazw plików, cache wyników oraz preload obrazów.
# Zasady:
 
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

Bazowa ścieżka do folderu z obrazami

**@type** *`{string}`*

```javascript
  static basePath = "/static/NarrativeIMG/";
```

---

Lista rozszerzeń (bez kropki) do wyszukiwania obrazów w kolejności indeksu

**@type** *`{string[]}`*

```javascript
  static extensions = ["jpg", "jpeg", "png", "gif", "webp"];
```

---

Prefiks klucza cache w AppStorageManager.
Wartość: JSON.stringify({ exists: boolean, ts: number })

**@type** *`{string}`*

```javascript
  static cachePrefix = "img-exists:";
```

---

Czas ważności negatywnego cache (ms). Po upływie — ponowne sprawdzenie.

**@type** *`{number}`*

```javascript
  static negativeCacheTTL = 60 * 60 * 1000; // 1h
```

---

## resolve()

Zwraca listę istniejących URL-i obrazów pasujących do tagów, w kolejności priorytetu:
- pełna lista tagów (exact),
- wszystkie podzbiory (od największych do najmniejszych) i ich permutacje,
- maksymalnie `maxResults` wyników.
@param {{ maxResults?: number }} [opts]

**_@param_** *`{string[]}`* _**tags**_  Lista tagów (1–5)

**@returns** *`{Promise<string[]>}`*

```javascript
  static async resolve(tags, { maxResults = 4 } = {}) {
    if (!Array.isArray(tags) || tags.length === 0) return [];

    const candidates = [];
    const exact = tags.join("_");

    // 1) exact match
    for (const ext of this.extensions) {
      candidates.push(`${this.basePath}${exact}.${ext}`);
    }

    // 2) kombinacje i permutacje
    const uniq = new Set(candidates);
    for (let k = tags.length; k >= 1; k--) {
      for (const subset of this._combinations(tags, k)) {
        for (const perm of this._permutations(subset)) {
          const name = perm.join("_");
          if (name === exact) continue;
          for (const ext of this.extensions) {
            const url = `${this.basePath}${name}.${ext}`;
            if (!uniq.has(url)) {
              candidates.push(url);
              uniq.add(url);
            }
          }
        }
      }
    }

    // 3) HEAD + cache
    const results = [];
    for (const url of candidates) {
      if (await this._checkExists(url)) {
        results.push(url);
        if (results.length >= maxResults) break;
      }
    }
    return results;
  }
```

---

## resolveBest()

Zwraca pierwszy istniejący URL według tej samej polityki co resolve().
@param {{ maxResults?: number }} [opts]

**_@param_** *`{string[]}`* _**tags**_

**@returns** *`{Promise<string>}`*

```javascript
  static async resolveBest(tags, opts = {}) {
    const arr = await this.resolve(tags, { maxResults: 1, ...opts });
    return arr[0] || "";
  }
```

---

## _checkExists()

Sprawdza, czy dany URL istnieje — używając AppStorageManager (pozytywny/negatywny cache)
oraz fetch HEAD. Negatywny cache wygasa po negativeCacheTTL.
@private

**_@param_** *`{string}`* _**url**_

**@returns** *`{Promise<boolean>}`*

```javascript
  static async _checkExists(url) {
    const key = this.cachePrefix + url;
    const cached = AppStorageManager.getWithTTL(key);
    if (cached === true) return true;
    if (cached === false) return false;

    try {
      const res = await fetch(url, { method: "HEAD" });
      const exists = res.ok;
      AppStorageManager.set(key, exists, this.negativeCacheTTL / 1000);

      if (exists) LoggerService.record("log", `[ImageResolver] HEAD ✓ ${url}`);
      return exists;
    } catch (err) {
      AppStorageManager.set(key, false, this.negativeCacheTTL / 1000);
      LoggerService.record("error", `[ImageResolver] HEAD error ${url}`, err);
      return false;
    }
  }
```

---

## preload()

Preloaduje obraz w przeglądarce (niewidoczny `<img>`).

**_@param_** *`{string}`* _**url**_

```javascript
  static preload(url) {
    if (!url) return;
    const img = new Image();
    img.src = url;
    img.style.display = "none";
    document.body.appendChild(img);
  }
```

---

## clearCache()

Czyści wpisy cache (zarówno pozytywne, jak i negatywne).

```javascript
  static clearCache() {
    AppStorageManager.keys()
      .filter((k) => k.startsWith(this.cachePrefix))
      .forEach((k) => AppStorageManager.remove(k));
  }
```

---

## _combinations()

Zwraca wszystkie kombinacje k-elementowe z tablicy.
@private

**_@param_** *`{string[]}`* _**arr**_
**_@param_** *`{number}`* _**k**_

**@returns** *`{string[][]}`*

```javascript
  static _combinations(arr, k) {
    const res = [];
    (function rec(start, comb) {
      if (comb.length === k) return res.push(comb.slice());
      for (let i = start; i < arr.length; i++) {
        comb.push(arr[i]);
        rec(i + 1, comb);
        comb.pop();
      }
    })(0, []);
    return res;
  }
```

---

## _permutations()

Zwraca wszystkie permutacje elementów tablicy.
@private

**_@param_** *`{string[]}`* _**arr**_

**@returns** *`{string[][]}`*

```javascript
  static _permutations(arr) {
    const res = [];
    (function perm(a, l = 0) {
      if (l === a.length - 1) return res.push(a.slice());
      for (let i = l; i < a.length; i++) {
        [a[l], a[i]] = [a[i], a[l]];
        perm(a, l + 1);
        [a[l], a[i]] = [a[i], a[l]];
      }
    })(arr.slice(), 0);
    return res;
  }
```

---

## Pełny kod klasy
```javascript
class ImageResolver {
  static basePath = "/static/NarrativeIMG/";

  static extensions = ["jpg", "jpeg", "png", "gif", "webp"];

  static cachePrefix = "img-exists:";

  static negativeCacheTTL = 60 * 60 * 1000; // 1h

  static async resolve(tags, { maxResults = 4 } = {}) {
    if (!Array.isArray(tags) || tags.length === 0) return [];

    const candidates = [];
    const exact = tags.join("_");

    for (const ext of this.extensions) {
      candidates.push(`${this.basePath}${exact}.${ext}`);
    }

    const uniq = new Set(candidates);
    for (let k = tags.length; k >= 1; k--) {
      for (const subset of this._combinations(tags, k)) {
        for (const perm of this._permutations(subset)) {
          const name = perm.join("_");
          if (name === exact) continue;
          for (const ext of this.extensions) {
            const url = `${this.basePath}${name}.${ext}`;
            if (!uniq.has(url)) {
              candidates.push(url);
              uniq.add(url);
            }
          }
        }
      }
    }

    const results = [];
    for (const url of candidates) {
      if (await this._checkExists(url)) {
        results.push(url);
        if (results.length >= maxResults) break;
      }
    }
    return results;
  }

  static async resolveBest(tags, opts = {}) {
    const arr = await this.resolve(tags, { maxResults: 1, ...opts });
    return arr[0] || "";
  }

  static async _checkExists(url) {
    const key = this.cachePrefix + url;
    const cached = AppStorageManager.getWithTTL(key);
    if (cached === true) return true;
    if (cached === false) return false;

    try {
      const res = await fetch(url, { method: "HEAD" });
      const exists = res.ok;
      AppStorageManager.set(key, exists, this.negativeCacheTTL / 1000);

      if (exists) LoggerService.record("log", `[ImageResolver] HEAD ✓ ${url}`);
      return exists;
    } catch (err) {
      AppStorageManager.set(key, false, this.negativeCacheTTL / 1000);
      LoggerService.record("error", `[ImageResolver] HEAD error ${url}`, err);
      return false;
    }
  }

  static preload(url) {
    if (!url) return;
    const img = new Image();
    img.src = url;
    img.style.display = "none";
    document.body.appendChild(img);
  }

  static clearCache() {
    AppStorageManager.keys()
      .filter((k) => k.startsWith(this.cachePrefix))
      .forEach((k) => AppStorageManager.remove(k));
  }

  static _combinations(arr, k) {
    const res = [];
    (function rec(start, comb) {
      if (comb.length === k) return res.push(comb.slice());
      for (let i = start; i < arr.length; i++) {
        comb.push(arr[i]);
        rec(i + 1, comb);
        comb.pop();
      }
    })(0, []);
    return res;
  }

  static _permutations(arr) {
    const res = [];
    (function perm(a, l = 0) {
      if (l === a.length - 1) return res.push(a.slice());
      for (let i = l; i < a.length; i++) {
        [a[l], a[i]] = [a[i], a[l]];
        perm(a, l + 1);
        [a[l], a[i]] = [a[i], a[l]];
      }
    })(arr.slice(), 0);
    return res;
  }
}
```