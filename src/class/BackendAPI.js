/**
 * BackendAPI
 * ==========
 * Warstwa komunikacji z backendem HTTP — odporna na błędy sieciowe, spójna i centralnie konfigurowalna.
 * Umożliwia wysyłanie żądań POST/GET z automatycznym retry i backoffem.
 * Integruje się z `RequestRetryManager` i zarządza tokenem autoryzacyjnym.
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Budowanie żądań HTTP (URL, headers, body)
 *   - Dekodowanie odpowiedzi JSON
 *   - Obsługa błędów sieciowych i retry
 *   - Centralne zarządzanie baseURL i tokenem
 *
 * ❌ Niedozwolone:
 *   - Logika UI
 *   - Cache’owanie domenowe
 *   - Mutowanie danych biznesowych
 *
 * API:
 * ----
 * • `setBaseURL(url: string)` — ustawia bazowy adres backendu
 * • `setAuthToken(token: string|null)` — ustawia lub usuwa token autoryzacyjny
 * • `generate(prompt: string)` — wysyła prompt użytkownika
 * • `rate(ratings: object)` — przesyła oceny odpowiedzi AI
 * • `edit(editedText: string, tags: object, sessionId: string, msgId: string)` — przesyła edytowaną odpowiedź
 * • `postMessage({sender,text})` — przesyła wiadomość użytkownika
 * • `getTags()` — pobiera słownik tagów
 *
 * Zależności:
 *  - `RequestRetryManager`: obsługuje retry i backoff
 *  - `LoggerService` (opcjonalnie): logowanie błędów
 */
class BackendAPI {
  /** Bazowy adres backendu (np. "https://api.example.com") */
  static baseURL = "";

  /** Token autoryzacyjny Bearer */
  static authToken = null;

  /**
   * Ustawia bazowy adres względny backendu.
   * @param {string} url - Adres URL bez końcowego slasha.
   */
static setBaseURL(url) {
  if (!url || url === "/") {
    // tryb względny — używamy hosta, z którego załadowano front
    this.baseURL = "";
  } else {
    // czyścimy końcowe slashe
    this.baseURL = url.replace(/\/+$/, "");
  }
}


  /**
   * Ustawia lub usuwa token autoryzacyjny.
   * @param {string|null} token - Token Bearer lub null.
   */
  static setAuthToken(token) {
    this.authToken = token || null;
  }

  /**
   * Składa pełny URL względem baseURL.
   * @param {string} path - Ścieżka względna (np. "/generate").
   * @returns {string} Pełny URL.
   * @private
   */
  static _url(path) {
    if (!this.baseURL) return path;
    return `${this.baseURL}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  /**
   * Buduje nagłówki HTTP z Content-Type, Accept i Authorization.
   * @param {Record<string,string>} [extra] - Dodatkowe nagłówki.
   * @returns {HeadersInit} Nagłówki HTTP.
   * @private
   */
  static _headers(extra = {}) {
    const h = {
      Accept: "application/json",
      ...extra,
    };
    if (!("Content-Type" in h)) h["Content-Type"] = "application/json";
    if (this.authToken) h["Authorization"] = `Bearer ${this.authToken}`;
    return h;
  }

  /**
   * Wysyła żądanie POST z JSON i odbiera JSON z retry.
   * @param {string} path - Ścieżka żądania.
   * @param {any} body - Treść żądania.
   * @param {RequestInit} [init] - Dodatkowe opcje fetch.
   * @returns {Promise<any>} Odpowiedź z backendu.
   * @private
   */
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

  /**
   * Wysyła żądanie GET i odbiera JSON z retry.
   * @param {string} path - Ścieżka żądania.
   * @param {RequestInit} [init] - Dodatkowe opcje fetch.
   * @returns {Promise<any>} Odpowiedź z backendu.
   * @private
   */
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

  /**
   * Bezpieczny parser JSON — zwraca pusty obiekt przy błędzie.
   * @param {Response} res - Odpowiedź HTTP.
   * @returns {Promise<any>} Parsowany JSON lub pusty obiekt.
   * @private
   */
  static async _safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }

  /**
   * Bezpieczny odczyt tekstu — zwraca pusty string przy błędzie.
   * @param {Response} res - Odpowiedź HTTP.
   * @returns {Promise<string>} Tekst odpowiedzi.
   * @private
   */
  static async _safeText(res) {
    try {
      return await res.text();
    } catch {
      return "";
    }
  }

  // ── Publiczne metody API ───────────────────────────────────────────────────

  /**
   * Wysyła prompt użytkownika do backendu.
   * @param {string} prompt - Treść promptu.
   * @returns {Promise<any>} Odpowiedź z backendu.
   */
  static async generate(prompt) {
    return this._postJson("/generate", { prompt });
  }

  /**
   * Przesyła oceny odpowiedzi AI.
   * @param {Record<string, any>} ratings - Obiekt ocen.
   * @returns {Promise<any>} Odpowiedź z backendu.
   */
  static async rate(ratings) {
    return this._postJson("/rate", ratings);
  }

  /**
   * Przesyła edytowaną odpowiedź z tagami.
   * @param {string} editedText - Nowa treść.
   * @param {Record<string, any>} tags - Obiekt tagów.
   * @param {string} sessionId - ID sesji.
   * @param {string} msgId - ID wiadomości.
   * @returns {Promise<any>} Odpowiedź z backendu.
   */
  static async edit(editedText, tags, sessionId, msgId) {
    return this._postJson("/edit", { editedText, tags, sessionId, msgId });
  }

  /**
   * Przesyła wiadomość użytkownika do backendu.
   * @param {{ sender: string, text: string }} message - Nadawca i treść.
   * @returns {Promise<any>} Odpowiedź z backendu.
   */
  static async postMessage({ sender, text }) {
    return this._postJson("/messages", { sender, text });
  }

  /**
   * Pobiera słownik tagów z backendu.
   * @returns {Promise<any>} Lista tagów.
   */
  static async getTags() {
    return this._getJson("/tags");
  }
}
