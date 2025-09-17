# RequestRetryManager

===================
Warstwa odpornościowa dla zapytań HTTP z kontrolą retry i backoffem.
Zapewnia ponawianie zapytań w przypadku błędów sieciowych lub odpowiedzi serwera,
które kwalifikują się do ponowienia (retryable), z kontrolą liczby prób, odstępów
i maksymalnego czasu trwania operacji.
Zasady:
-------
✅ Dozwolone:
  - Wielokrotne próby `fetch` z kontrolą limitu, odstępu i łącznego czasu.
  - Decyzja, czy błąd/odpowiedź jest retryowalna.
  - Wywołanie zdarzenia `onRetry` (np. do telemetrii lub logowania).
  - Parametryzacja backoffu (bazowe opóźnienie, mnożnik, jitter).
❌ Niedozwolone:
  - Logika UI lub domenowa.
  - Transformacje payloadu/JSON (to rola warstwy BackendAPI).
  - Obsługa specyficznych formatów odpowiedzi.
API:
----
• `static isRetryable(errOrRes): boolean`
   - Sprawdza, czy błąd lub odpowiedź kwalifikuje się do ponowienia.
   - Retry przy:
       • Błędach sieciowych (`TypeError` z `fetch`)
       • Kodach HTTP 5xx
       • Kodzie HTTP 429 (Too Many Requests)
   - Brak retry przy:
       • Kodach HTTP 4xx (poza 429)
       • Odpowiedziach `ok === true`
• `static async fetchWithRetry(input, init?, retries?, baseDelay?, options?): Promise`<Response>``
   - Wykonuje `fetch` z mechanizmem retry i backoffem z jitterem.
   - Parametry:
       • `input` — URL lub obiekt `Request`
       • `init` — opcje `fetch` (method, headers, body itd.)
       • `retries` — maksymalna liczba ponowień (bez pierwszej próby)
       • `baseDelay` — bazowe opóźnienie (ms) dla backoffu
       • `options`:
           - `silent` — jeśli true, logowanie na poziomie `log` zamiast `warn`
           - `maxTotalTime` — twardy limit łącznego czasu (ms)
           - `onRetry(info)` — callback wywoływany przy każdej próbie ponowienia
           - `factor` — mnożnik backoffu (domyślnie 2)
           - `jitter` — odchylenie losowe [0..1] (domyślnie 0.2)
Mechanizm backoffu:
-------------------
 - Opóźnienie = `baseDelay * factor^(attempt-1)` ± `jitter`
 - Jitter wprowadza losowe odchylenie, aby uniknąć skoków ruchu (thundering herd)
 - Przed każdą próbą sprawdzany jest limit `maxTotalTime`
Obsługa błędów:
---------------
 - Błąd nieretryowalny → natychmiastowe przerwanie i rzucenie wyjątku
 - Wyczerpanie liczby retry → rzucenie ostatniego błędu
 - Przekroczenie `maxTotalTime` → rzucenie ostatniego błędu
Telemetria/logowanie:
---------------------
 - Każdy retry logowany przez `LoggerService.record()` na poziomie `warn` lub `log` (silent)
 - Możliwość podpięcia własnego callbacka `onRetry` z informacjami o próbie

---
