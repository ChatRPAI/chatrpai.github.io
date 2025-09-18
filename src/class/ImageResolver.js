/**
 * # ImageResolver
 * Narzędzie do wyszukiwania istniejących obrazów na podstawie tagów.
 * Obsługuje permutacje nazw plików, cache wyników oraz preload obrazów.
 *
 * # Zasady:
 *  
 * ✅ Dozwolone:
 *   - resolve(tags, opts?): Promise<string[]>
 *   - resolveBest(tags, opts?): Promise<string>
 *   - clearCache(): void
 *   - preload(url): void
 *  
 * ❌ Niedozwolone:
 *   - Renderowanie DOM (poza preload <img>)
 *   - Logika UI lub biznesowa
 *   - Zależności od klas domenowych
 *  
 * TODO:
 *   - setBasePath(path: string)
 *   - setExtensions(exts: string[])
 *   - getCacheStats(): { hits: number, misses: number }
 *   - resolveAll(tags: string[]): Promise<{ found: string[], missing: string[] }>
 */
class ImageResolver {
  /**
   * Bazowa ścieżka do folderu z obrazami
   * @type {string}
   */
  static basePath = "/static/NarrativeIMG/";

  /**
   * Lista rozszerzeń (bez kropki) do wyszukiwania obrazów w kolejności indeksu
   * @type {string[]}
   */
  static extensions = ["jpg", "jpeg", "png", "gif", "webp"];

  /**
   * Prefiks klucza cache w AppStorageManager.
   * Wartość: JSON.stringify({ exists: boolean, ts: number })
   * @type {string}
   */
  static cachePrefix = "img-exists:";

  /**
   * Czas ważności negatywnego cache (ms). Po upływie — ponowne sprawdzenie.
   * @type {number}
   */
  static negativeCacheTTL = 60 * 60 * 1000; // 1h

  /**
   * Zwraca listę istniejących URL-i obrazów pasujących do tagów, w kolejności priorytetu:
   * - pełna lista tagów (exact),
   * - wszystkie podzbiory (od największych do najmniejszych) i ich permutacje,
   * - maksymalnie `maxResults` wyników.
   *
   * @param {string[]} tags - Lista tagów (1–5)
   * @param {{ maxResults?: number }} [opts]
   * @returns {Promise<string[]>}
   */
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

  /**
   * Zwraca pierwszy istniejący URL według tej samej polityki co resolve().
   * @param {string[]} tags
   * @param {{ maxResults?: number }} [opts]
   * @returns {Promise<string>}
   */
  static async resolveBest(tags, opts = {}) {
    const arr = await this.resolve(tags, { maxResults: 1, ...opts });
    return arr[0] || "";
  }

  /**
   * Sprawdza, czy dany URL istnieje — używając AppStorageManager (pozytywny/negatywny cache)
   * oraz fetch HEAD. Negatywny cache wygasa po negativeCacheTTL.
   *
   * @param {string} url
   * @returns {Promise<boolean>}
   * @private
   */
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

  /**
   * Preloaduje obraz w przeglądarce (niewidoczny <img>).
   * @param {string} url
   */
  static preload(url) {
    if (!url) return;
    const img = new Image();
    img.src = url;
    img.style.display = "none";
    document.body.appendChild(img);
  }

  /**
   * Czyści wpisy cache (zarówno pozytywne, jak i negatywne).
   */
  static clearCache() {
    AppStorageManager.keys()
      .filter((k) => k.startsWith(this.cachePrefix))
      .forEach((k) => AppStorageManager.remove(k));
  }

  /**
   * Zwraca wszystkie kombinacje k-elementowe z tablicy.
   * @param {string[]} arr
   * @param {number} k
   * @returns {string[][]}
   * @private
   */
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

  /**
   * Zwraca wszystkie permutacje elementów tablicy.
   * @param {string[]} arr
   * @returns {string[][]}
   * @private
   */
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
