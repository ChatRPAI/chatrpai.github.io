# RequestRetryManager

Warstwa odpornościowa dla zapytań HTTP z kontrolą retry i backoffem.
Zapewnia ponawianie zapytań w przypadku błędów sieciowych lub odpowiedzi serwera,
które kwalifikują się do ponowienia (retryable), z kontrolą liczby prób, odstępów
i maksymalnego czasu trwania operacji.
## Zasady:
- ✅ Dozwolone:
  - Wielokrotne próby `fetch` z kontrolą limitu, odstępu i łącznego czasu.
  - Decyzja, czy błąd/odpowiedź jest retryowalna.
  - Wywołanie zdarzenia `onRetry` (np. do telemetrii lub logowania).
  - Parametryzacja backoffu (bazowe opóźnienie, mnożnik, jitter).
- ❌ Niedozwolone:
  - Logika UI lub domenowa.
  - Transformacje payloadu/JSON (to rola warstwy BackendAPI).
  - Obsługa specyficznych formatów odpowiedzi.

---

## isRetryable()

Sprawdza, czy błąd lub odpowiedź nadaje się do ponowienia.
## Zasady:
 - Retry przy błędach sieciowych (`TypeError` z `fetch`)
 - Retry przy kodach HTTP 5xx i 429
 - Brak retry przy kodach 4xx (poza 429) i odpowiedziach `ok === true`

**_@param_** *`{any}`* _**errOrRes**_  Obiekt błędu lub odpowiedzi `Response`

**@returns** *`{boolean}`*  - true, jeśli można ponowić

```javascript
  static isRetryable(errOrRes) {
    // Response
    if (errOrRes && typeof errOrRes === "object" && "ok" in errOrRes) {
      const res = /** @type {Response} */ (errOrRes);
      if (res.ok) return false;
      const s = res.status;
      return s === 429 || (s >= 500 && s <= 599);
    }
    // Error
    if (errOrRes instanceof Error) {
      // Fetch w razie problemów sieciowych rzuca zwykle TypeError
      return errOrRes.name === "TypeError";
    }
    return false;
  }
```

---

## fetchWithRetry()

Wykonuje `fetch` z mechanizmem retry i backoffem z jitterem.
@param {RequestInit} [init={}] - Opcje `fetch` (method, headers, body itd.)
@param {number} [retries=3] - Maksymalna liczba ponowień (bez pierwszej próby)
@param {number} [baseDelay=800] - Bazowe opóźnienie (ms) dla backoffu
@param {{
  silent?: boolean,
  maxTotalTime?: number,     // twardy limit łącznego czasu (ms)
  onRetry?: (info:{
    attempt:number,
    retries:number,
    delay:number,
    reason:any,
    input:string|Request
  })=>void,
  factor?: number,           // mnożnik backoffu, domyślnie 2
  jitter?: number            // [0..1], odchylenie losowe, domyślnie 0.2
} } [options={}] - Parametry dodatkowe
Przebieg:
 1. Wykonuje pierwsze żądanie `fetch`.
 2. Jeśli odpowiedź jest OK → zwraca ją.
 3. Jeśli odpowiedź/błąd jest retryowalny → ponawia do `retries` razy.
 4. Każde ponowienie ma opóźnienie wyliczone z backoffu + jitter.
 5. Jeśli przekroczono `maxTotalTime` → rzuca błąd.
 6. Wywołuje `onRetry` (jeśli podany) przy każdej próbie ponowienia.

**_@param_** *`{string|Request}`* _**input**_  URL lub obiekt `Request`

**@returns** *`{Promise<Response>}`*  - Odpowiedź `fetch`

```javascript
  static async fetchWithRetry(
    input,
    init = {},
```

---

## Pełny kod klasy

```javascript
class RequestRetryManager {
  static isRetryable(errOrRes) {
    if (errOrRes && typeof errOrRes === "object" && "ok" in errOrRes) {
      if (res.ok) return false;
      const s = res.status;
      return s === 429 || (s >= 500 && s <= 599);
    }
    if (errOrRes instanceof Error) {
      return errOrRes.name === "TypeError";
    }
    return false;
  }

  static async fetchWithRetry(
    input,
    init = {},
    retries = 3,
    baseDelay = 800,
    {
      silent = false,
      maxTotalTime = 15_000,
      onRetry = null,
      factor = 2,
      jitter = 0.2,
    } = {}
  ) {
    const start = Date.now();
    let attempt = 0;

    while (true) {
      try {
        const res = await fetch(input, init);
        if (!res.ok) {
          if (!this.isRetryable(res)) return res; // oddaj nie-OK bez retry — nie jest retryowalne
          throw res; // wymuś retry
        }
        return res;
      } catch (err) {
        if (!this.isRetryable(err)) {
          LoggerService.record(
            "error",
            "[RequestRetryManager] Non-retryable error",
            err
          );
          throw err;
        }

        if (attempt >= retries) {
          LoggerService.record(
            "error",
            `[RequestRetryManager] Wyczerpane retry dla: ${
              typeof input === "string" ? input : input.url
            }`,
            err
          );
          throw err;
        }

        attempt += 1;

        const exp = baseDelay * Math.pow(factor, attempt - 1);
        const delta = exp * jitter;
        const delay = Math.max(0, exp + (Math.random() * 2 - 1) * delta);

        if (Date.now() + delay - start > maxTotalTime) {
          LoggerService.record(
            "error",
            "[RequestRetryManager] Przekroczono maxTotalTime",
            { maxTotalTime }
          );
          throw err;
        }

        const level = silent ? "log" : "warn";
        LoggerService.record(
          level,
          `[RequestRetryManager] Retry ${attempt}/${retries} za ${Math.round(
            delay
          )}ms`,
          err
        );

        if (typeof onRetry === "function") {
          try {
            onRetry({ attempt, retries, delay, reason: err, input });
          } catch {
          }
        }

        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}
```