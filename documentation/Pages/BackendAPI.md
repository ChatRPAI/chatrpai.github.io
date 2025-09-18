# BackendAPI

==========
Warstwa komunikacji z backendem HTTP — odporna na błędy sieciowe, spójna i centralnie konfigurowalna.
Umożliwia wysyłanie żądań POST/GET z automatycznym retry i backoffem.
Integruje się z `RequestRetryManager` i zarządza tokenem autoryzacyjnym.
Zasady:
-------
✅ Odpowiedzialność:
  - Budowanie żądań HTTP (URL, headers, body)
  - Dekodowanie odpowiedzi JSON
  - Obsługa błędów sieciowych i retry
  - Centralne zarządzanie baseURL i tokenem
❌ Niedozwolone:
  - Logika UI
  - Cache’owanie domenowe
  - Mutowanie danych biznesowych
API:
----
- `setBaseURL(url: string)` — ustawia bazowy adres backendu
- `setAuthToken(token: string|null)` — ustawia lub usuwa token autoryzacyjny
- `generate(prompt: string)` — wysyła prompt użytkownika
- `rate(ratings: object)` — przesyła oceny odpowiedzi AI
- `edit(editedText: string, tags: object, sessionId: string, msgId: string)` — przesyła edytowaną odpowiedź
- `postMessage({sender,text})` — przesyła wiadomość użytkownika
- `getTags()` — pobiera słownik tagów
Zależności:
 - `RequestRetryManager`: obsługuje retry i backoff
 - `LoggerService` (opcjonalnie): logowanie błędów

---

static baseURL = "";



```javascript
  static authToken = null;
```

---

## setBaseURL()

Ustawia bazowy adres względny backendu.

**_@param_** *`{string}`* _**url**_  Adres URL bez końcowego slasha.

```javascript
static setBaseURL(url) {
  if (!url || url === "/") {
    // tryb względny — używamy hosta, z którego załadowano front
    this.baseURL = "";
  } else {
    // czyścimy końcowe slashe
    this.baseURL = url.replace(/\/+$/, "");
  }
}
```

---

## setAuthToken()

Ustawia lub usuwa token autoryzacyjny.

**_@param_** *`{string|null}`* _**token**_  Token Bearer lub null.

```javascript
  static setAuthToken(token) {
    this.authToken = token || null;
  }
```

---

## _url()

Składa pełny URL względem baseURL.
@private

**_@param_** *`{string}`* _**path**_  Ścieżka względna (np. "/generate").

**@returns** *`{string}`*  Pełny URL.

```javascript
  static _url(path) {
    if (!this.baseURL) return path;
    return `${this.baseURL}${path.startsWith("/") ? "" : "/"}${path}`;
  }
```

---

## _headers()

Buduje nagłówki HTTP z Content-Type, Accept i Authorization.
@param {Record`<string,string>`} [extra] - Dodatkowe nagłówki.
@private

**@returns** *`{HeadersInit}`*  Nagłówki HTTP.

```javascript
  static _headers(extra = {}) {
    const h = {
      Accept: "application/json",
      ...extra,
    };
    if (!("Content-Type" in h)) h["Content-Type"] = "application/json";
    if (this.authToken) h["Authorization"] = `Bearer ${this.authToken}`;
    return h;
  }
```

---

## _postJson()

Wysyła żądanie POST z JSON i odbiera JSON z retry.
@param {RequestInit} [init] - Dodatkowe opcje fetch.
@private

**_@param_** *`{string}`* _**path**_  Ścieżka żądania.
**_@param_** *`{any}`* _**body**_  Treść żądania.

**@returns** *`{Promise<any>}`*  Odpowiedź z backendu.

```javascript
  static async _postJson(path, body, init = {}) {
    const res = await RequestRetryManager.fetchWithRetry(
      this._url(path),
      {
        method: "POST",
        headers: this._headers(init.headers || {}),
        body: JSON.stringify(body),
        ...init,
      },
      3, // liczba prób
      800, // opóźnienie początkowe
      { maxTotalTime: 15_000 }
    );
    if (!res.ok) {
      const text = await BackendAPI._safeText(res);
      throw new Error(`POST ${path} -> HTTP ${res.status}: ${text}`);
    }
    return BackendAPI._safeJson(res);
  }
```

---

## _getJson()

Wysyła żądanie GET i odbiera JSON z retry.
@param {RequestInit} [init] - Dodatkowe opcje fetch.
@private

**_@param_** *`{string}`* _**path**_  Ścieżka żądania.

**@returns** *`{Promise<any>}`*  Odpowiedź z backendu.

```javascript
  static async _getJson(path, init = {}) {
    const res = await RequestRetryManager.fetchWithRetry(
      this._url(path),
      {
        method: "GET",
        headers: this._headers(init.headers || {}),
        ...init,
      },
      3,
      800,
      { maxTotalTime: 15_000 }
    );
    if (!res.ok) {
      const text = await BackendAPI._safeText(res);
      throw new Error(`GET ${path} -> HTTP ${res.status}: ${text}`);
    }
    return BackendAPI._safeJson(res);
  }
```

---

## _safeJson()

Bezpieczny parser JSON — zwraca pusty obiekt przy błędzie.
@private

**_@param_** *`{Response}`* _**res**_  Odpowiedź HTTP.

**@returns** *`{Promise<any>}`*  Parsowany JSON lub pusty obiekt.

```javascript
  static async _safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
```

---

## _safeText()

Bezpieczny odczyt tekstu — zwraca pusty string przy błędzie.
@private

**_@param_** *`{Response}`* _**res**_  Odpowiedź HTTP.

**@returns** *`{Promise<string>}`*  Tekst odpowiedzi.

```javascript
  static async _safeText(res) {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }
```

---

## generate()

Wysyła prompt użytkownika do backendu.

**_@param_** *`{string}`* _**prompt**_  Treść promptu.

**@returns** *`{Promise<any>}`*  Odpowiedź z backendu.

```javascript
  static async generate(prompt) {
    return this._postJson("/generate", { prompt });
  }
```

---

## rate()

Przesyła oceny odpowiedzi AI.

**_@param_** *`{Record<string, any>}`* _**ratings**_  Obiekt ocen.

**@returns** *`{Promise<any>}`*  Odpowiedź z backendu.

```javascript
  static async rate(ratings) {
    return this._postJson("/rate", ratings);
  }
```

---

## edit()

Przesyła edytowaną odpowiedź z tagami.

**_@param_** *`{string}`* _**editedText**_  Nowa treść.
**_@param_** *`{Record<string, any>}`* _**tags**_  Obiekt tagów.
**_@param_** *`{string}`* _**sessionId**_  ID sesji.
**_@param_** *`{string}`* _**msgId**_  ID wiadomości.

**@returns** *`{Promise<any>}`*  Odpowiedź z backendu.

```javascript
  static async edit(editedText, tags, sessionId, msgId) {
    return this._postJson("/edit", { editedText, tags, sessionId, msgId });
  }
```

---

## postMessage()

Przesyła wiadomość użytkownika do backendu.

**_@param_** *`{{ sender: string, text: string }}`* _**message**_  Nadawca i treść.

**@returns** *`{Promise<any>}`*  Odpowiedź z backendu.

```javascript
  static async postMessage({ sender, text }) {
    return this._postJson("/messages", { sender, text });
  }
```

---

## getTags()

Pobiera słownik tagów z backendu.

**@returns** *`{Promise<any>}`*  Lista tagów.

```javascript
  static async getTags() {
    return this._getJson("/tags");
  }
```

---

## Pełny kod klasy
```javascript
class BackendAPI {
  static baseURL = "";

  static authToken = null;

static setBaseURL(url) {
  if (!url || url === "/") {
    this.baseURL = "";
  } else {
    this.baseURL = url.replace(/\/+$/, "");
  }
}


  static setAuthToken(token) {
    this.authToken = token || null;
  }

  static _url(path) {
    if (!this.baseURL) return path;
    return `${this.baseURL}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  static _headers(extra = {}) {
    const h = {
      Accept: "application/json",
      ...extra,
    };
    if (!("Content-Type" in h)) h["Content-Type"] = "application/json";
    if (this.authToken) h["Authorization"] = `Bearer ${this.authToken}`;
    return h;
  }

  static async _postJson(path, body, init = {}) {
    const res = await RequestRetryManager.fetchWithRetry(
      this._url(path),
      {
        method: "POST",
        headers: this._headers(init.headers || {}),
        body: JSON.stringify(body),
        ...init,
      },
      3, // liczba prób
      800, // opóźnienie początkowe
      { maxTotalTime: 15_000 }
    );
    if (!res.ok) {
      const text = await BackendAPI._safeText(res);
      throw new Error(`POST ${path} -> HTTP ${res.status}: ${text}`);
    }
    return BackendAPI._safeJson(res);
  }

  static async _getJson(path, init = {}) {
    const res = await RequestRetryManager.fetchWithRetry(
      this._url(path),
      {
        method: "GET",
        headers: this._headers(init.headers || {}),
        ...init,
      },
      3,
      800,
      { maxTotalTime: 15_000 }
    );
    if (!res.ok) {
      const text = await BackendAPI._safeText(res);
      throw new Error(`GET ${path} -> HTTP ${res.status}: ${text}`);
    }
    return BackendAPI._safeJson(res);
  }

  static async _safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }

  static async _safeText(res) {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }


  static async generate(prompt) {
    return this._postJson("/generate", { prompt });
  }

  static async rate(ratings) {
    return this._postJson("/rate", ratings);
  }

  static async edit(editedText, tags, sessionId, msgId) {
    return this._postJson("/edit", { editedText, tags, sessionId, msgId });
  }

  static async postMessage({ sender, text }) {
    return this._postJson("/messages", { sender, text });
  }

  static async getTags() {
    return this._getJson("/tags");
  }
}
```