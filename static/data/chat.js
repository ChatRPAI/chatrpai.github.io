// 📦 LoggerService.js
/**
 * LoggerService
 * =============
 * Buforowany logger do środowiska przeglądarkowego z ograniczeniem wieku wpisów.
 * Obsługuje poziomy logowania: 'log', 'warn', 'error'.
 * Wpisy są przechowywane w pamięci i mogą być filtrowane, czyszczone lub eksportowane.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - record(level, msg, ...args)
 *   - cleanup()
 *   - getHistory({clone})
 *   - clearHistory()
 *   - setMaxAge(ms)
 *   - filterByLevel(level)
 *   - recordOnce(level, msg, ...args)
 *
 * ❌ Niedozwolone:
 *   - logika aplikacji (business logic)
 *   - operacje sieciowe, DOM, storage
 *
 * TODO:
 *   - exportHistory(format)
 */
class LoggerService {
  /**
   * Bufor wpisów logowania.
   * Każdy wpis zawiera znacznik czasu, poziom, wiadomość i dodatkowe argumenty.
   * @type {Array<{timestamp: number, level: 'log'|'warn'|'error', msg: string, args: any[]}>}
   */
  static buffer = [];

  /**
   * Maksymalny wiek wpisów w milisekundach.
   * Wpisy starsze niż ta wartość są usuwane przy każdym logowaniu i odczycie.
   * @type {number}
   */
  static maxAgeMs = 5 * 60 * 1000; // 5 minut

  /**
   * Ustawia nowy limit wieku wpisów i natychmiast czyści stare.
   * @param {number} ms - nowy limit wieku w milisekundach
   */
  static setMaxAge(ms) {
    this.maxAgeMs = ms;
    this.cleanup();
  }

  /**
   * Dodaje wpis do bufora i wypisuje go w konsoli z odpowiednim stylem.
   * @param {'log'|'warn'|'error'} level - poziom logowania
   * @param {string} msg - wiadomość do wyświetlenia
   * @param {...any} args - dodatkowe dane (np. obiekty, błędy)
   */
  static record(level, msg, ...args) {
    const emojiLevels = { log: "🌍", warn: "⚠️", error: "‼️" };
    const timestamp = Date.now();

    this.buffer.push({ timestamp, level, msg, args });
    this.cleanup();

    const styleMap = {
      log: "color: #444",
      warn: "color: orange",
      error: "color: red; font-weight: bold",
    };

    const style = styleMap[level] || "";
    const displayMsg = `${emojiLevels[level] || ""} ${msg}`;
    console[level](`%c[${new Date(timestamp).toLocaleTimeString()}] ${displayMsg}`, style, ...args);
  }

  /**
   * Usuwa wpisy starsze niż maxAgeMs.
   * Jeśli maxAgeMs <= 0, czyści cały bufor.
   */
  static cleanup() {
    if (this.maxAgeMs <= 0) {
      this.buffer = [];
      return;
    }
    const cutoff = Date.now() - this.maxAgeMs;
    this.buffer = this.buffer.filter((e) => e.timestamp >= cutoff);
  }

  /**
   * Zwraca wpisy danego poziomu logowania.
   * @param {'log'|'warn'|'error'} level - poziom do filtrowania
   * @returns {Array<{timestamp: number, msg: string, args: any[]}>}
   */
  static filterByLevel(level) {
    this.cleanup();
    return this.buffer
      .filter((e) => e.level === level)
      .map(({ timestamp, msg, args }) => ({ timestamp, msg, args }));
  }

  /**
   * Zwraca całą historię wpisów.
   * Jeśli clone = true, zwraca głęboką kopię wpisów.
   * @param {boolean} [clone=false] - czy zwrócić kopię wpisów
   * @returns {Array<{timestamp: number, level: string, msg: string, args: any[]}>}
   */
  static getHistory(clone = false) {
    this.cleanup();
    if (!clone) return [...this.buffer];
    return this.buffer.map((entry) => structuredClone(entry));
  }

  /**
   * Czyści cały bufor logów bez względu na wiek wpisów.
   */
  static clearHistory() {
    this.buffer = [];
  }

  /**
   * Dodaje wpis tylko jeśli nie istnieje już wpis o tym samym poziomie i wiadomości.
   * @param {'log'|'warn'|'error'} level - poziom logowania
   * @param {string} msg - wiadomość
   * @param {...any} args - dodatkowe dane
   */
  static recordOnce(level, msg, ...args) {
    if (!this.buffer.some((e) => e.level === level && e.msg === msg)) {
      this.record(level, msg, ...args);
    }
  }
}


// 📦 Diagnostics.js
/**
 * Diagnostics.runAll();         // wszystko, grupy rozwinięte
 * Diagnostics.runEachGroup();   // każda grupa osobno
 * Diagnostics.runGroup("Utils"); // tylko grupa "Utils"
 * Diagnostics.runSummary();     // tylko zbiorcze podsumowanie
 * Diagnostics.getGroups();      // ["Utils", "BackendAPI", "ChatManager", ...]
 */

class Diagnostics {
  static onlyOneRun = false; // Blokada wielokrotnego uruchomienia
  static tests = [];
  static currentGroup = "default";

  static describe(groupName, fn) {
    this.currentGroup = groupName;
    fn();
    this.currentGroup = "default";
  }

  static it(name, fn) {
    this.register(name, fn, this.currentGroup);
  }

  static expect(value) {
    return {
      toBe(expected) {
        Diagnostics.assertEqual(value, expected);
      },
      toBeType(type) {
        Diagnostics.assertType(value, type);
      },
      toInclude(item) {
        Diagnostics.assertArrayIncludes(value, item);
      },
      toBeTruthy() {
        if (!value)
          throw new Error(`Oczekiwano wartość truthy, otrzymano: ${value}`);
      },
      toBeFalsy() {
        if (value)
          throw new Error(`Oczekiwano wartość falsy, otrzymano: ${value}`);
      },
      toBeGreaterThan(min) {
        if (typeof value !== "number") {
          throw new Error(
            `Wartość musi być liczbą, otrzymano: ${typeof value}`
          );
        }
        if (value <= min) {
          throw new Error(`Oczekiwano wartości > ${min}, otrzymano: ${value}`);
        }
      },
    };
  }

  static assertArrayIncludes(arr, val) {
    if (!Array.isArray(arr)) throw new Error("Wartość nie jest tablicą");
    if (!arr.includes(val)) throw new Error(`Tablica nie zawiera: ${val}`);
  }

  static assertObjectHasKey(obj, key) {
    if (typeof obj !== "object" || obj === null)
      throw new Error("Wartość nie jest obiektem");
    if (!(key in obj)) throw new Error(`Brak klucza: ${key}`);
  }

  static register(name, fn, group = "default") {
    this.tests.push({ name, fn, group });
  }

  static getGroups() {
    return [...new Set(this.tests.map((t) => t.group))];
  }

  static testsMode(isStarted = true) {
    const existing = document.querySelector("#diagnostics-mode");
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.id = "diagnostics-mode";
    div.style = `
        position: fixed;
        color: #fbff5a;
        height: 100%;
        width: 100%;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5em;
      `;
    if (isStarted) {
      div.style.backgroundColor = "rgba(12, 187, 6, 0.7)";
      div.innerHTML = `<span>Trwa przeprowadzanie testów...</span>`;
      document.body.appendChild(div);
    } else {
      div.style.backgroundColor = "rgba(6, 160, 187, 0.3)";
      div.innerHTML = `<span>Testy zakończone. <br>Proszę sprawdzić konsolę i odświeżyć stronę.</span>`;
      document.body.appendChild(div);
    }
  }

  static grouped = {};
  static showResultsAll() {
    if (Object.keys(this.grouped).length === 0) {
      // kolorowe przedstawienie komend
      // Kolorowe przedstawienie komend
      const styleAll = "color: #51a088ff; font-weight: bold; font-size: 1.2em;";
      const styleGroup =
        "color: #b13dceff; font-weight: bold; font-size: 1.2em;";
      console.warn(
        "%c🧪 Diagnostics: Brak wyników testów do pokazania.\n%cUżyj:",
        "color: #ff9800; font-weight: bold;",
        `padding:2px 6px; border-radius:4px;`
      );
      console.info(
        "%cDiagnostics.runAll();",
        styleAll + " padding:2px 6px; border-radius:4px;"
      );
      console.info(
        '%cDiagnostics.runGroup("nazwa grupy");',
        styleGroup + " padding:2px 6px; border-radius:4px;"
      );
      return;
    }

    for (const [groupName, results] of Object.entries(this.grouped)) {
      console.group(`🧪 [${groupName}]`);

      const firstTable = results.slice(0, 10);
      const secondTable = results.slice(10);
      this.renderConsoleTableTestResults(firstTable);

      if (secondTable.length > 0) {
        this.renderConsoleTableTestResults(secondTable);
      }
      console.groupEnd();
    }
    this.summary();
  }

  static renderConsoleTableTestResults(results) {
    console.table(
      results.map((r) => ({
        Status: r.status,
        Test: r.name,
        Błąd: r.error || "—",
      }))
    );
  }

  static async runAll() {
    if (this.onlyOneRun) {
      console.warn(
        "🧪 Diagnostics: Testy już raz zostały uruchomione. Odśwież stronę i spróbuj ponownie."
      );
      this.showResultsAll();
      return;
    }
    this.grouped = {};
    for (const { name, fn, group } of this.tests) {
      this.testsMode(true);

      const result = await this.captureError(fn, name);
      if (!this.grouped[group]) this.grouped[group] = [];
      this.grouped[group].push(result);

      if (originalBodyHTML) {
        document.body.innerHTML = originalBodyHTML;
       const dom = new Dom();
  dom.init(htmlElements);

  // b) Context – rejestrujesz dokładnie to, czego chcesz użyć (instancje, nie klasy!)
  const context = new Context({
    diagnostics: Diagnostics,
    userManager: UserManager,
    dom,
    utils: Utils,
    backendAPI: BackendAPI,
  });

  // c) Skład modułów (to jest w 100% konfigurowalne per strona)
  const modules = [
    UserManagerModule(),
    VirtualKeyboardDockModule(dom),
    PanelsControllerModule(dom),
    ChatManagerModule(context),       // tylko na stronie czatu
    ClearImageCacheButtonModule(),    // feature
  ];

  // d) App dostaje Context + listę modułów, i tylko je odpala
  const app = new App(context, modules);

  await app.init();
      }
    }

    for (const [groupName, results] of Object.entries(this.grouped)) {
      console.group(`🧪 [${groupName}]`);
      this.renderConsoleTableTestResults(results);
      console.groupEnd();
    }

    this.summary();

    this.onlyOneRun = true;
    this.testsMode(false);
  }

  static summary() {
    const summary = [];
    for (const [groupName, results] of Object.entries(this.grouped)) {
      const passed = results.filter((r) => r.status === "✅").length;
      const failed = results.filter((r) => r.status === "❌").length;
      summary.push({ Group: groupName, Passed: passed, Failed: failed });
    }

    console.group("📊 Podsumowanie testów");
    console.table(summary);
    console.groupEnd();
  }

  static async runEachGroup() {
    const groups = this.getGroups();
    for (const group of groups) {
      await this.runGroup(group);
    }
  }

  static async runGroup(groupName) {
    if (this.onlyOneRun) {
      console.warn(
        "🧪 Diagnostics: Testy już raz zostały uruchomione. Odśwież stronę i spróbuj ponownie."
      );
      return;
    }
    this.testsMode(true);
    const results = [];
    for (const { name, fn, group } of this.tests) {
      if (group === groupName) {
        const result = await this.captureError(fn, name);
        results.push(result);
      }
    }

    if (results.length === 0) {
      console.warn(`🧪 Brak testów w grupie: ${groupName}`);
      return;
    }

    console.group(`🧪 Wyniki grupy: ${groupName}`);
    this.renderConsoleTableTestResults(results);
    console.groupEnd();
    this.onlyOneRun = true;
    this.testsMode(false);
  }

  static async captureError(fn, name) {
    try {
      await fn();
      return { status: "✅", name, error: "" };
    } catch (e) {
      return { status: "❌", name, error: e.message || String(e) };
    }
  }

  static assertEqual(a, b) {
    if (a !== b) throw new Error(`Oczekiwano ${b}, otrzymano ${a}`);
  }

  static assertType(value, type) {
    if (typeof value !== type)
      throw new Error(`Typ ${typeof value}, oczekiwano ${type}`);
  }

  static wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static resetEnv() {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }

  static filterFailed() {
    const failed = {};
    for (const [groupName, results] of Object.entries(this.grouped)) {
      const failedTests = results.filter((r) => r.status === "❌");
      if (failedTests.length > 0) {
        failed[groupName] = failedTests;
      }
    }
    return failed;
  }

  static showFailedAll() {
    const failed = this.filterFailed();

    if (Object.keys(failed).length === 0) {
      console.info("✅ Wszystkie testy zakończone sukcesem.");
      return;
    }

    for (const [groupName, results] of Object.entries(failed)) {
      console.group(`❌ [${groupName}]`);
      this.renderConsoleTableTestResults(results);
      console.groupEnd();
    }

    const summary = Object.entries(failed).map(([group, results]) => ({
      Grupa: group,
      Błędy: results.length,
    }));

    console.group("📊 Podsumowanie błędów");
    console.table(summary);
    console.groupEnd();
  }
}


// 📦 App.js
/**
 * App
 * ===
 * Główny koordynator cyklu życia aplikacji. Odpowiada za uruchamianie przekazanych modułów
 * w ustalonej kolejności. Sam nie tworzy modułów – dostaje je z warstwy inicjalizacyjnej
 * (np. init_chat.js) jako listę obiektów implementujących metodę `init(ctx)`.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Sekwencyjne uruchamianie modułów
 *   - Przekazywanie kontekstu (`Context`) do modułów
 *   - Obsługa modułów synchronicznych i asynchronicznych
 *
 * ❌ Niedozwolone:
 *   - Tworzenie instancji modułów na sztywno
 *   - Logika biznesowa lub UI
 *   - Bezpośrednia manipulacja DOM
 *
 * TODO:
 *   - Obsługa zatrzymywania modułów (`destroy()`)
 *   - Równoległe uruchamianie niezależnych modułów
 *   - Obsługa wyjątków w pojedynczych modułach bez przerywania całej inicjalizacji
 *
 * Refaktoryzacja?:
 *   - Wprowadzenie systemu priorytetów modułów
 *   - Integracja z loggerem do raportowania czasu inicjalizacji
 */
class App {
  /**
   * Tworzy instancję aplikacji.
   * @param {Context} context - kontener zależności
   * @param {Array<{ init: (ctx: Context) => void | Promise<void> }>} modules - lista modułów do uruchomienia
   */
  constructor(context, modules = []) {
    /** @type {Context} */
    this.ctx = context;
    /** @type {Array<{ init: (ctx: Context) => any }>} */
    this.modules = modules;
  }

  /**
   * Uruchamia wszystkie moduły w kolejności, przekazując im kontekst.
   * Obsługuje moduły synchroniczne i asynchroniczne.
   * @returns {Promise<void>}
   */
  async init() {
    LoggerService.record("log", "[App] Inicjalizacja aplikacji...");
    for (const m of this.modules) {
      if (m && typeof m.init === "function") {
        await m.init(this.ctx);
      }
    }
    LoggerService.record("log", "[App] Aplikacja gotowa.");
  }
}


// 📦 AppStorageManager.js
/**
 * AppStorageManager
 * ==============
 * Uniwersalny mediator przechowywania danych z automatycznym fallbackiem
 * z `localStorage` do `cookie` w przypadku braku dostępu lub błędu.
 * Obsługuje TTL w sekundach, czyszczenie wpisów z prefiksem,
 * oraz mechanizmy obronne przy przekroczeniu limitu pamięci (`QuotaExceededError`).
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Zapisywanie, odczytywanie i usuwanie danych w `localStorage` lub `cookie`
 *   - Obsługa TTL i czyszczenie danych tymczasowych
 *   - Reakcja na błędy pamięci i komunikacja z użytkownikiem
 *
 * ❌ Niedozwolone:
 *   - Wymuszanie prefiksów
 *   - Logika aplikacyjna (np. interpretacja danych)
 */
class AppStorageManager {
  /**
   * Sprawdza, czy `localStorage` jest dostępny i funkcjonalny.
   * Wykonuje testowy zapis i usunięcie wpisu.
   * @returns {boolean} True, jeśli można bezpiecznie używać `localStorage`.
   */
  static _hasLocalStorage() {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Zwraca typ aktualnie używanego magazynu.
   * @returns {"localStorage"|"cookie"} Typ aktywnego backendu.
   */
  static type() {
    return this._hasLocalStorage() ? "localStorage" : "cookie";
  }

  /**
   * Zapisuje wartość pod wskazanym kluczem z opcjonalnym TTL.
   * TTL wyrażony w sekundach. Domyślnie 30 dni (2592000 sekund).
   * Wartość jest serializowana do JSON.
   * 
   * @param {string} key - Klucz pod którym zapisywana jest wartość.
   * @param {any} value - Dowolna wartość do zapisania.
   * @param {number} [ttl=2592000] - Czas życia w sekundach.
   */
  static set(key, value, ttl = 2592000) {
    const now = Date.now();
    const payload = ttl
      ? { value, ts: now, ttl: ttl * 1000 }
      : value;

    const serialized = JSON.stringify(payload);

    if (this._hasLocalStorage()) {
      try {
        localStorage.setItem(key, serialized);
      } catch (err) {
        if (err.name === "QuotaExceededError") {
          this.purgeByPrefix("img-exists:");
          try {
            localStorage.setItem(key, serialized);
          } catch (e) {
            this._handleStorageFailure("localStorage", key, e);
          }
        } else {
          this._handleStorageFailure("localStorage", key, err);
        }
      }
    } else {
      let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(serialized)}; path=/`;
      if (ttl) {
        cookie += `; max-age=${ttl}`;
      }
      document.cookie = cookie;

      // Sprawdzenie skuteczności zapisu
      if (!document.cookie.includes(`${encodeURIComponent(key)}=`)) {
        this._handleStorageFailure("cookie", key);
      }
    }
  }

  /**
   * Odczytuje wartość spod wskazanego klucza.
   * Deserializuje JSON, jeśli to możliwe.
   * @param {string} key - Klucz do odczytu.
   * @returns {any|null} Wartość lub null, jeśli brak.
   */
  static get(key) {
    let raw = null;
    if (this._hasLocalStorage()) {
      raw = localStorage.getItem(key);
    } else {
      const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`));
      raw = match ? decodeURIComponent(match[1]) : null;
    }
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return raw;
    }
  }

  /**
   * Odczytuje wartość z TTL. Jeśli wygasła — usuwa i zwraca null.
   * @param {string} key - Klucz do odczytu.
   * @returns {any|null} Wartość lub null, jeśli wygasła lub nie istnieje.
   */
  static getWithTTL(key) {
    const raw = this.get(key);
    if (!raw || typeof raw !== "object") return raw;

    if (raw.ttl && raw.ts && Date.now() - raw.ts > raw.ttl) {
      this.remove(key);
      return null;
    }
    return raw.value ?? raw;
  }

  /**
   * Usuwa wartość spod wskazanego klucza.
   * @param {string} key - Klucz do usunięcia.
   */
  static remove(key) {
    if (this._hasLocalStorage()) {
      localStorage.removeItem(key);
    } else {
      document.cookie = `${encodeURIComponent(key)}=; max-age=0; path=/`;
    }
  }

  /**
   * Zwraca listę wszystkich kluczy z aktualnego backendu.
   * @returns {string[]} Tablica kluczy.
   */
  static keys() {
    if (this._hasLocalStorage()) {
      return Object.keys(localStorage);
    } else {
      return document.cookie
        .split(";")
        .map((c) => decodeURIComponent(c.split("=")[0].trim()))
        .filter((k) => k.length > 0);
    }
  }

  /**
   * Usuwa wszystkie wpisy z danym prefiksem.
   * @param {string} prefix - Prefiks kluczy do usunięcia.
   */
  static purgeByPrefix(prefix) {
    this.keys()
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => this.remove(k));
  }

  /**
   * Obsługuje błędy zapisu do pamięci (`QuotaExceededError` lub inne).
   * Informuje użytkownika i oferuje czyszczenie pamięci.
   * @param {"localStorage"|"cookie"} type - Typ pamięci.
   * @param {string} key - Klucz, który nie został zapisany.
   * @param {Error} [error] - Opcjonalny obiekt błędu.
   */
  static _handleStorageFailure(type, key, error) {
    LoggerService?.record("warn", `[AppStorageManager] ${type} niedostępny lub pełny przy zapisie ${key}`, error);

    const confirmed = window.confirm(
      `Pamięć ${type} jest pełna lub niedostępna. Czy chcesz ją wyczyścić, aby kontynuować?`
    );

    if (confirmed) {
      if (type === "localStorage") localStorage.clear();
      if (type === "cookie") {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      LoggerService?.record("info", `[AppStorageManager] ${type} wyczyszczony przez użytkownika.`);
    } else {
      LoggerService?.record("info", `[AppStorageManager] Użytkownik odmówił czyszczenia ${type}.`);
    }
  }
}


// 📦 BackendAPI.js
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


// 📦 ChatEditView.js
/**
 * ChatEditView
 * ============
 * Widok edycji wiadomości AI w czacie.
 * Odpowiada za:
 *  - Wyświetlenie formularza edycji (textarea + panel tagów + galeria obrazów)
 *  - Walidację treści i tagów
 *  - Obsługę zapisu i anulowania edycji
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Renderowanie UI edycji w miejscu wiadomości
 *   - Integracja z TagsPanel i GalleryLoader
 *   - Walidacja danych przed wysłaniem
 *   - Wywołanie callbacków `onEditSubmit` i `onEditCancel`
 *
 * ❌ Niedozwolone:
 *   - Bezpośrednia komunikacja z backendem (poza pobraniem listy tagów)
 *   - Mutowanie innych elementów UI poza edytowaną wiadomością
 *
 * API:
 * ----
 * • `constructor(dom)` — inicjalizuje widok z referencjami do DOM
 * • `enableEdit(msgElement, originalText, messageId, sessionId)` — uruchamia tryb edycji
 *
 * Wydarzenia (callbacki):
 * -----------------------
 * • `onEditSubmit(msgEl, editedText, tags, imageUrl, sessionId)` — wywoływane po kliknięciu "Zapisz"
 * • `onEditCancel(msgEl, data)` — wywoływane po kliknięciu "Anuluj"
 */
class ChatEditView {
  /**
   * @param {object} dom - Obiekt z referencjami do elementów DOM aplikacji
   */
  constructor(dom) {
    this.dom = dom;
    /** @type {function(HTMLElement,string,string[],string,string):void|null} */
    this.onEditSubmit = null;
    /** @type {function(HTMLElement,object):void|null} */
    this.onEditCancel = null;
  }

  /**
   * Uruchamia tryb edycji dla wiadomości AI.
   * @param {HTMLElement} msgElement - Element wiadomości do edycji
   * @param {string} originalText - Oryginalny tekst wiadomości
   * @param {string} messageId - ID wiadomości
   * @param {string} [sessionId] - ID sesji
   */
  async enableEdit(msgElement, originalText, messageId, sessionId) {
    // Zachowaj oryginalny HTML
    msgElement.dataset.originalHTML = msgElement.innerHTML;
    if (sessionId) {
      msgElement.dataset.sessionId = sessionId;
    }

    // Wyczyść zawartość i dodaj textarea
    msgElement.innerHTML = "";
    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.rows = 6;
    textarea.className = "form-element textarea-base w-full mt-4";

    const tagPanel = document.createElement("div");
    tagPanel.className = "tag-panel";
    msgElement.append(textarea, tagPanel);

    // Panel tagów + galeria
    const tagsPanel = new TagsPanel(tagPanel);
    const galleryLoader = new GalleryLoader(tagPanel);

    const rawTags = msgElement.dataset.tags || "";
    const tagOptions = await BackendAPI.getTags();

    tagsPanel.setTagOptions(tagOptions);
    tagsPanel.applyDefaultsFromDataTags(rawTags, tagOptions);

    let boot = true;
    tagsPanel.init(() => {
      if (!boot) galleryLoader.renderFromTags(tagsPanel.getTagList());
    });
    galleryLoader.renderFromTags(tagsPanel.getTagList());
    boot = false;

    // Przycisk zapisu
    const saveBtn = Utils.createButton("💾 Zapisz", async () => {
      const editedText = textarea.value.trim();
      const tags = tagsPanel.getTagList();

      const { valid, errors } = EditValidator.validate(editedText, tags);
      if (!valid) {
        LoggerService.record("warn", "[EditView] Błąd walidacji", errors);
        return;
      }

      // Preferuj wybór z galerii; fallback do resolvera
      let imageUrl = "";
      const chosen = tagPanel.querySelector('input[name="gallery-choice"]:checked');
      if (chosen && chosen.value) {
        imageUrl = chosen.value;
      } else {
        const urls = await ImageResolver.resolve(tags, { maxResults: 1 });
        imageUrl = urls[0] || "";
      }

      this.onEditSubmit?.(
        msgElement,
        editedText,
        tags,
        imageUrl,
        msgElement.dataset.sessionId
      );
    });
    saveBtn.classList.add("button-base");

    // Przycisk anulowania
    const cancelBtn = Utils.createButton("❌ Anuluj", () => {
      const data = {
        id: msgElement.dataset.msgId,
        sessionId: msgElement.dataset.sessionId || "sess-unknown",
        tags: (msgElement.dataset.tags || "").split("_").filter(Boolean),
        timestamp: msgElement.dataset.timestamp,
        originalText: msgElement.dataset.originalText,
        text: msgElement.dataset.originalText,
        sender: msgElement.dataset.sender || "AI",
        avatarUrl:
          msgElement.dataset.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png",
        generation_time: parseFloat(msgElement.dataset.generation_time) || 0,
        imageUrl: msgElement.dataset.imageUrl || "",
      };

      this.onEditCancel?.(msgElement, data);
    });
    cancelBtn.classList.add("button-base");

    msgElement.append(saveBtn, cancelBtn);
  }
}


// 📦 ChatManager.js
/**
 * ChatManager
 * ===========
 * Główna warstwa logiki aplikacji — łączy widoki UI z backendem.
 * Odpowiada za obsługę promptów, edycji i oceniania wiadomości.
 * Integruje się z `ChatUIView`, `ChatEditView`, `BackendAPI`, `ImageResolver` i `LoggerService`.
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Obsługa promptów, edycji, oceniania
 *   - Przekazywanie danych między widokami a BackendAPI
 *   - Aktualizacja UI przez `ChatUIView` i `ChatEditView`
 *
 * ❌ Niedozwolone:
 *   - Renderowanie HTML bezpośrednio
 *   - Mutowanie danych poza `dataset`/`msgEl`
 *   - Logika domenowa (np. interpretacja tagów)
 *
 * API:
 * ----
 * • `constructor({ dom })` — inicjalizuje widoki i podpina zdarzenia
 * • `init()` — aktywuje widoki i podpina zdarzenia edycji/oceny
 * • `sendPrompt(prompt: string)` — wysyła prompt do backendu i renderuje odpowiedź
 * • `sendEdit(msgEl, editedText, tags, imageUrl, sessionId)` — przesyła edytowaną wiadomość
 * • `sendRating({ messageId, sessionId, ratings })` — przesyła ocenę wiadomości
 *
 * Zależności:
 *  - `ChatUIView`: widok głównego czatu
 *  - `ChatEditView`: widok edycji wiadomości
 *  - `BackendAPI`: komunikacja z backendem
 *  - `ImageResolver`: rozwiązywanie ilustracji
 *  - `LoggerService`: logowanie błędów
 */
class ChatManager {
  /**
   * Inicjalizuje widoki UI i podpina zdarzenia.
   * @param {{ dom: Dom }} context - Kontekst aplikacji z referencjami DOM.
   */
  constructor(context) {
    const { dom } = context;
    this.chatView = new ChatUIView(
      dom.chatContainer,
      dom.inputArea,
      dom.prompt
    );

    this.promptVal = {
      promptEl: dom.prompt,
      errorEl: dom.promptError,
      warningEl: dom.promptWarning,
    };

    this.editView = new ChatEditView(dom);

    this.chatView.onEditRequested = (msgEl, text, id, ts, sessionId) =>
      this.editView.enableEdit(msgEl, text, id, ts, sessionId);

    this.chatView.onRatingSubmit = (msgEl) => this.ratingView.open(msgEl);
  }

  /**
   * Inicjalizuje widoki i podpina zdarzenia walidacji promptu oraz edycji i oceny.
   */
  init() {
    const { promptEl, errorEl, warningEl } = this.promptVal;
    let hadInput = false;

    const syncUI = (text) => {
      const raw = typeof text === "string" ? text : promptEl.value;
      const trimmed = raw.trim();
      const len = raw.length;

      // licznik znaków
      warningEl.textContent = `${len}/${PromptValidator.maxLength} znaków`;

      // klasa długości
      if (len > PromptValidator.maxLength) {
        warningEl.classList.add("error-text-length");
      } else {
        warningEl.classList.remove("error-text-length");
      }

      // walidacja
      const { valid, errors } = PromptValidator.validate(raw);

      // filtr błędów
      const isEmpty = trimmed.length === 0;
      const filteredErrors = errors.filter((msg) => {
        const isEmptyError = msg.startsWith("Prompt nie może być pusty");
        if (isEmptyError) return hadInput && isEmpty;
        return true;
      });

      errorEl.textContent = filteredErrors.join(" ");
      return { valid, filteredErrors };
    };

    // startowa synchronizacja
    const initialText = promptEl.value || "";
    if (initialText.length > 0) hadInput = true;
    syncUI(initialText);

    // live feedback
    promptEl.addEventListener("input", () => {
      const len = promptEl.value.length;
      if (len > 0) hadInput = true;

      const { filteredErrors } = syncUI();
      if (len > 0) {
        const keep = filteredErrors.filter(
          (e) => !e.startsWith("Prompt nie może być pusty")
        );
        errorEl.textContent = keep.join(" ");
      }
    });

    // walidacja na submit – zwraca true/false
    this.chatView.onPromptSubmit = (text) => {
      const raw = text;
      const trimmed = raw.trim();
      const len = raw.length;
      const { valid } = PromptValidator.validate(raw);
      const { filteredErrors } = syncUI(raw);

      if (!valid) {
        const empty = trimmed.length === 0;
        const onlyEmptyError =
          filteredErrors.length === 1 &&
          filteredErrors[0].startsWith("Prompt nie może być pusty");

        if (empty && !hadInput) {
          return false; // odrzucone – brak wcześniejszego inputu
        }

        errorEl.textContent = filteredErrors.join(" ");
        if (len > PromptValidator.maxLength) {
          warningEl.classList.add("error-text-length");
        }
        return false; // odrzucone – błędy walidacji
      }

      warningEl.classList.remove("error-text-length");
      errorEl.textContent = "";
      this.sendPrompt(raw);
      return true; // zaakceptowane – ChatUIView wyczyści pole
    };

    this.chatView.init();

    this.editView.onEditSubmit = (msgEl, txt, tags, imageUrl) =>
      this.sendEdit(msgEl, txt, tags, imageUrl);

    this.editView.onEditCancel = (msgEl, data) => {
      this.chatView.hydrateAIMessage(msgEl, data);
    };

    this.chatView.onRatingSubmit = (payload) => {
      this.sendRating(payload);
    };
  }

  /**
   * Wysyła prompt użytkownika do backendu i renderuje odpowiedź.
   * @param {string} prompt - Treść promptu.
   * @returns {Promise<void>}
   */
  async sendPrompt(prompt) {
    this.chatView.addUserMessage(prompt);
    const { msgEl, timer } = this.chatView.addLoadingMessage();
    try {
      const data = await BackendAPI.generate(prompt);

      // Rozwiąż URL ilustracji
      const urls = await ImageResolver.resolve(data.tags);
      data.imageUrl = urls[0] || "";

      // Renderuj odpowiedź AI
      this.chatView.hydrateAIMessage(msgEl, data);
    } catch (err) {
      this.chatView.showError(msgEl);
      LoggerService.record("error", "[ChatManager] sendPrompt", err);
    } finally {
      clearInterval(timer);
    }
  }

  /**
   * Przesyła edytowaną wiadomość do backendu i aktualizuje UI.
   * @param {HTMLElement} msgEl - Element wiadomości.
   * @param {string} editedText - Nowa treść.
   * @param {Record<string, any>} tags - Tagowanie wiadomości.
   * @param {string} imageUrl - URL ilustracji.
   * @param {string} [sessionId] - ID sesji (opcjonalne).
   * @returns {Promise<void>}
   */
  async sendEdit(msgEl, editedText, tags, imageUrl, sessionId) {
    this.chatView.hydrateAIMessage(
      msgEl,
      {
        id: msgEl.dataset.msgId,
        sessionId: sessionId || msgEl.dataset.sessionId,
        tags,
        timestamp: msgEl.dataset.timestamp,
        originalText: editedText,
        text: editedText,
        sender: msgEl.dataset.sender,
        avatarUrl: msgEl.dataset.avatarUrl,
        generation_time: Number.isFinite(
          parseFloat(msgEl.dataset.generation_time)
        )
          ? parseFloat(msgEl.dataset.generation_time)
          : 0,

        imageUrl,
      },
      true
    );

    try {
      await BackendAPI.edit(editedText, tags, sessionId, msgEl.dataset.msgId);
    } catch (err) {
      LoggerService.record("error", "[ChatManager] sendEdit", err);
    }
  }

  /**
   * Przesyła ocenę wiadomości do backendu.
   * @param {{ messageId: string, sessionId: string, ratings: Record<string, any> }} payload
   * @returns {Promise<void>}
   */
  async sendRating({ messageId, sessionId, ratings }) {
    try {
      await BackendAPI.rate({ messageId, sessionId, ratings });
    } catch (err) {
      LoggerService.record("error", "[ChatManager] sendRating", err);
    }
  }
}


// 📦 ChatRatingView.js
/**
 * ChatRatingView
 * ==============
 * Komponent UI odpowiedzialny za wyświetlanie i obsługę panelu ocen wiadomości AI.
 * 
 * Funkcje:
 * --------
 *  - Renderuje panel ocen w formie <details> z listą kryteriów i suwakami (range input)
 *  - Obsługuje zmianę wartości suwaków (aktualizacja widocznej wartości)
 *  - Po kliknięciu "Wyślij ocenę" zbiera wszystkie wartości i przekazuje je w callbacku `onSubmit`
 *  - Zapobiega duplikowaniu panelu ocen w tej samej wiadomości
 * 
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Tworzenie i osadzanie elementów DOM panelu ocen
 *   - Obsługa interakcji użytkownika (zmiana wartości, wysyłka oceny)
 * 
 * ❌ Niedozwolone:
 *   - Samodzielne wysyłanie ocen do backendu (od tego jest logika wyżej)
 *   - Modyfikowanie innych elementów wiadomości poza panelem ocen
 * 
 * API:
 * ----
 * • `constructor(msgEl, onSubmit)` — tworzy panel ocen w podanym elemencie wiadomości
 * • `render(msgEl)` — renderuje panel ocen (wywoływane automatycznie w konstruktorze)
 * 
 * Callbacki:
 * ----------
 * • `onSubmit(payload)` — wywoływany po kliknięciu "Wyślij ocenę"
 *    - payload: {
 *        messageId: string,
 *        sessionId: string,
 *        ratings: { [kryterium]: number }
 *      }
 */
class ChatRatingView {
  /**
   * @param {HTMLElement} msgEl - Element wiadomości, do którego ma zostać dodany panel ocen
   * @param {function(object):void} [onSubmit] - Callback wywoływany po wysłaniu oceny
   */
  constructor(msgEl, onSubmit) {
    if (!(msgEl instanceof HTMLElement)) return;
    this.onSubmit = onSubmit || null;

    /**
     * Lista kryteriów oceniania
     * @type {{key: string, label: string}[]}
     */
    this.criteria = [
      { key: "Narrative", label: "Narracja" },
      { key: "Style", label: "Styl" },
      { key: "Logic", label: "Logika" },
      { key: "Quality", label: "Jakość" },
      { key: "Emotions", label: "Emocje" }
    ];

    this.render(msgEl);
  }

  /**
   * Renderuje panel ocen w wiadomości.
   * @param {HTMLElement} msgEl - Element wiadomości
   */
  render(msgEl) {
    // Unikamy duplikatów panelu ocen
    if (msgEl.querySelector("details.rating-form")) return;

    const details = document.createElement("details");
    details.className = "rating-form";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Oceń odpowiedź ⭐";
    details.appendChild(summary);

    const header = document.createElement("h3");
    header.textContent = "Twoja ocena:";
    details.appendChild(header);

    // Tworzenie wierszy z suwakami dla każdego kryterium
    this.criteria.forEach(({ key, label }) => {
      const row = document.createElement("label");
      row.className = "rating-row";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = `${label}: `;
      row.appendChild(labelSpan);

      const input = document.createElement("input");
      input.type = "range";
      input.min = "1";
      input.max = "5";
      input.value = "3";
      input.name = key;

      const val = document.createElement("span");
      val.textContent = input.value;
      input.addEventListener("input", () => (val.textContent = input.value));

      row.append(input, val);
      details.appendChild(row);
    });

    // Przycisk wysyłki oceny
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Wyślij ocenę";
    btn.addEventListener("click", () => {
      const ratings = {};
      this.criteria.forEach(({ key }) => {
        ratings[key] = Number(details.querySelector(`[name="${key}"]`).value);
      });
      const payload = {
        messageId: msgEl.dataset.msgId,
        sessionId: msgEl.dataset.sessionId,
        ratings
      };
      this.onSubmit?.(payload);
    });
    details.appendChild(btn);

    // Panel trafia do stopki wiadomości lub bezpośrednio do elementu
    const footer = msgEl.querySelector(".msg-footer") || msgEl;
    footer.appendChild(details);
  }
}


// 📦 ChatUIView.js
/**
 * ChatUIView
 * ==========
 * Widok głównego interfejsu czatu.
 * Odpowiada za:
 *  - Obsługę formularza promptu (wysyłanie wiadomości użytkownika)
 *  - Renderowanie wiadomości użytkownika i AI
 *  - Wyświetlanie stanu ładowania odpowiedzi AI
 *  - Hydratację wiadomości AI danymi z backendu
 *  - Obsługę przycisku edycji i panelu ocen
 *  - Aktualizację treści wiadomości po edycji
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Manipulacja DOM w obrębie kontenera czatu
 *   - Obsługa zdarzeń UI (submit, ctrl+enter, kliknięcia)
 *   - Integracja z `UserManager`, `SenderRegistry`, `ChatRatingView`
 *
 * ❌ Niedozwolone:
 *   - Logika backendowa (wysyłanie żądań HTTP)
 *   - Walidacja treści (poza prostym sprawdzeniem pustego promptu)
 *
 * API:
 * ----
 * • `constructor(container, promptForm, promptInput)` — inicjalizuje widok
 * • `init()` — podpina obsługę formularza i skrótów klawiszowych
 * • `addUserMessage(text)` — dodaje wiadomość użytkownika do czatu
 * • `addLoadingMessage()` — dodaje placeholder ładowania odpowiedzi AI
 * • `hydrateAIMessage(msgEl, data, isEdited)` — renderuje wiadomość AI z danymi
 * • `showError(msgEl)` — pokazuje komunikat błędu w wiadomości AI
 * • `scrollToBottom()` — przewija czat na dół
 * • `updateMessage(msgEl, editedText, tags, imageUrl)` — aktualizuje treść wiadomości
 *
 * Callbacki:
 * ----------
 * • `onPromptSubmit(prompt: string)` — wywoływany po wysłaniu promptu
 * • `onEditRequested(msgEl, originalText, id, timestamp, sessionId)` — po kliknięciu "Edytuj"
 * • `onRatingSubmit(payload)` — po wysłaniu oceny wiadomości
 */
class ChatUIView {
  /**
   * @param {HTMLElement} container - Kontener wiadomości czatu
   * @param {HTMLFormElement} promptForm - Formularz promptu
   * @param {HTMLInputElement|HTMLTextAreaElement} promptInput - Pole wprowadzania promptu
   */
  constructor(container, promptForm, promptInput) {
    this.container = container;
    this.promptForm = promptForm;
    this.promptInput = promptInput;

    /** @type {(prompt: string)=>void} */
    this.onPromptSubmit = null;

    /** @type {(msgEl: HTMLElement, originalText: string, id: number, timestamp: string, sessionId: string)=>void} */
    this.onEditRequested = null;

    /** @type {(payload: object)=>void} */
    this.onRatingSubmit = null;
  }

  /**
   * Podpina obsługę formularza i skrótu Ctrl+Enter.
   */
  init() {
    this.promptForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = this.promptInput.value.trim();
      if (!t) return;
      const accepted = await this.onPromptSubmit?.(t);
      if (accepted) {
        this.promptInput.value = "";
      }
    });

    this.promptInput.addEventListener("keydown", async (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        const t = this.promptInput.value.trim();
        if (!t) return;
        const accepted = await this.onPromptSubmit?.(t);
        if (accepted) {
          this.promptInput.value = "";
        }
      }
    });
  }

  /**
   * Dodaje wiadomość użytkownika do czatu.
   * @param {string} text - Treść wiadomości
   */
  addUserMessage(text) {
    const el = document.createElement("div");
    el.className = "message user";
    el.innerHTML = `<span class="message-text">${UserManager.replacePlaceholders(
      text
    )}</span>`;
    this.container.appendChild(el);
    this.scrollToBottom();
  }

  /**
   * Dodaje placeholder ładowania odpowiedzi AI.
   * @returns {{msgEl: HTMLElement, timer: number}} - Element wiadomości i ID timera
   */
  addLoadingMessage() {
    const msgEl = document.createElement("article");
    msgEl.className = "message ai";
    msgEl.setAttribute("role", "article");

    msgEl.innerHTML = `
      <div class="msg-content msg-ai-loading">
        <div class="msg-text"><p>⏳ Generowanie odpowiedzi... (0s)</p></div>
      </div>
    `.trim();

    this.container.appendChild(msgEl);
    this.scrollToBottom();

    const timerP = msgEl.querySelector(".msg-ai-loading p");
    let seconds = 0;
    const timer = setInterval(() => {
      if (timerP) {
        timerP.textContent = `⏳ Generowanie odpowiedzi... (${++seconds}s)`;
      }
    }, 1000);

    return { msgEl, timer };
  }

  /**
   * Renderuje wiadomość AI z danymi.
   * @param {HTMLElement} msgEl - Element wiadomości
   * @param {object} data - Dane wiadomości
   * @param {boolean} [isEdited=false] - Czy wiadomość jest edytowana
   */
  hydrateAIMessage(msgEl, data, isEdited = false) {

    msgEl.classList.add("msg-fading-out");

    const sessionId = data.sessionId || "sess-unknown";
    const senderId = data.senderId || data.sender || "sender-unknown";

    if (data.id) {
      msgEl.dataset.msgId = data.id;
    } else {
      const messageNum = data.messageNumber || Date.now();
      msgEl.dataset.msgId = `${sessionId}_${senderId}_${messageNum}`;
    }

    msgEl.dataset.sessionId = sessionId;
    msgEl.dataset.tags = Array.isArray(data.tags)
      ? data.tags.join("_")
      : data.tags || "";
    msgEl.dataset.timestamp = data.timestamp || "";
    msgEl.dataset.originalText = data.originalText ?? data.text;
    msgEl.dataset.sender = data.sender || "AI";
    msgEl.dataset.avatarUrl =
      data.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png";
    msgEl.dataset.generation_time = String(
      Number.isFinite(data.generation_time) ? data.generation_time : 0
    );
    msgEl.dataset.imageUrl = data.imageUrl || "";

    const renderedText = UserManager.replacePlaceholders(data.text);
    const tagList = Array.isArray(data.tags)
      ? data.tags
      : (data.tags || "").split("_").filter(Boolean);

    msgEl.innerHTML = `
      <header class="msg-header">
        <div class="avatar-sender">
          <img src="${msgEl.dataset.avatarUrl}" alt="${
      msgEl.dataset.sender
    } Avatar">
          <strong>${msgEl.dataset.sender}</strong>
        </div>
      </header>
      <section class="msg-content ${SenderRegistry.getClass(
        msgEl.dataset.sender
      )}">
        <div class="msg-text">
          <p ${isEdited ? 'class="edited"' : ""}>${renderedText}</p>
          ${
            msgEl.dataset.imageUrl
              ? `<img src="${msgEl.dataset.imageUrl}" alt="${tagList.join(
                  " "
                )}">`
              : ""
          }
        </div>
      </section>
      <footer class="msg-footer">
        <time class="ai-msg-time" datetime="${msgEl.dataset.timestamp}">
          ⏱️ ${msgEl.dataset.generation_time}s | 🗓️ ${msgEl.dataset.timestamp}
        </time>
      </footer>
    `.trim();

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "form-element button-base msg-edit-btn";
    btn.textContent = "✏️ Edytuj";
    btn.addEventListener("click", () =>
      this.onEditRequested?.(
        msgEl,
        msgEl.dataset.originalText,
        msgEl.dataset.msgId,
        msgEl.dataset.timestamp,
        msgEl.dataset.sessionId
      )
    );
    msgEl.querySelector(".msg-footer").appendChild(btn);

    new ChatRatingView(msgEl, (payload) => this.onRatingSubmit?.(payload));

      msgEl.classList.remove("msg-fading-out");
      msgEl.classList.add("msg-fading-in");
    this.scrollToBottom();
  }

  /**
   * Pokazuje komunikat błędu w wiadomości AI.
   * @param {HTMLElement} msgEl - Element wiadomości
   */
  showError(msgEl) {
    msgEl.innerHTML = `<span class="message-text">❌ Błąd generowania odpowiedzi.</span>`;
    this.scrollToBottom();
  }

  /**
   * Przewija czat na dół.
   */
  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  /**
   * Aktualizuje treść wiadomości po edycji.
   * @param {HTMLElement} msgEl - Element wiadomości do zaktualizowania
   * @param {string} editedText - Nowa treść wiadomości
   * @param {string[]} [tags=[]] - Lista tagów powiązanych z wiadomością
   * @param {string} [imageUrl=""] - URL ilustracji powiązanej z wiadomością
   */
  updateMessage(msgEl, editedText, tags = [], imageUrl = "") {
    // Zaktualizuj tekst w elemencie <p>
    const p = msgEl.querySelector("section.msg-content .msg-text p");
    if (p) p.textContent = UserManager.replacePlaceholders(editedText);

    // Zaktualizuj dataset
    msgEl.dataset.tags = tags.join("_");
    msgEl.dataset.imageUrl = imageUrl;

    // Znajdź kontener tekstu
    const textDiv = msgEl.querySelector("section.msg-content .msg-text");
    if (!textDiv) return;

    // Obsługa obrazka
    let img = textDiv.querySelector("img");

    if (imageUrl) {
      if (!img) {
        img = document.createElement("img");
        textDiv.appendChild(img);
      }
      img.src = imageUrl;
      img.alt = tags.join(" ");
    } else if (img) {
      img.remove();
    }
  }
}


// 📦 Context.js
/**
 * Context
 * =======
 * Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług oraz
 * zapewnia wygodne gettery do najczęściej używanych komponentów.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Rejestracja instancji usług i komponentów (np. Dom, Utils, UserManager)
 *   - Pobieranie zależności po nazwie lub przez getter
 *   - Dynamiczne dodawanie nowych zależności w trakcie działania
 *
 * ❌ Niedozwolone:
 *   - Tworzenie instancji usług na sztywno (to robi warstwa inicjalizacyjna)
 *   - Logika biznesowa lub UI
 *   - Operacje sieciowe
 *
 * TODO:
 *   - Walidacja typów rejestrowanych instancji
 *   - Obsługa usuwania zależności
 *   - Wstrzykiwanie konfiguracji środowiskowej
 *
 * Refaktoryzacja?:
 *   - Rozszerzenie o mechanizm „scopes” dla izolacji modułów
 *   - Integracja z systemem eventów do powiadamiania o zmianach zależności
 */
class Context {
  /**
   * Tworzy nowy kontekst z początkowym zestawem usług.
   * @param {Record<string, any>} services - mapa nazw → instancji
   */
  constructor(services = {}) {
    /** @private @type {Map<string, any>} */
    this._registry = new Map(Object.entries(services));
  }

  /**
   * Rejestruje nową lub nadpisuje istniejącą zależność.
   * @param {string} name - unikalna nazwa zależności
   * @param {any} instance - instancja lub obiekt usługi
   */
  register(name, instance) { this._registry.set(name, instance); }

  /**
   * Pobiera zarejestrowaną zależność po nazwie.
   * @param {string} name - nazwa zależności
   * @returns {any} - instancja lub undefined
   */
  get(name) { return this._registry.get(name); }

  // Wygodne gettery (opcjonalne)
  get dom() { return this.get("dom"); }
  get utils() { return this.get("utils"); }
  get userManager() { return this.get("userManager"); }
  get diagnostics() { return this.get("diagnostics"); }
  get backendAPI() { return this.get("backendAPI"); }
}


// 📦 Dom.js
/**
 * Dom
 * ===
 * Centralny punkt dostępu do elementów DOM aplikacji.
 * Wymusza strukturę opartą na <main id="app"> jako kontenerze bazowym.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Przechowywanie i udostępnianie referencji do elementów
 *   - Wyszukiwanie elementów tylko wewnątrz <main id="app">
 *
 * ❌ Niedozwolone:
 *   - Operacje poza <main id="app">
 *   - Modyfikowanie struktury DOM globalnie
 *
 * TODO:
 *   - refresh()
 *   - observeMissing()
 *   - expose(selector)
 *
 * Refaktoryzacja?:
 *   - DomRefs → inicjalizacja i buforowanie
 *   - DomQuery → metody wyszukiwania
 *   - DomDiagnostics → logowanie braków
 */
class Dom {
  /**
   * Inicjalizuje klasę Dom z wymuszeniem kontenera <main id="app">
   * @param {string|HTMLElement} rootSelector - domyślnie "#app"
   */
  constructor(rootSelector = "#app") {
    this.rootSelector = rootSelector;
    this.root = null;
    this.refs = {};
  }

  /**
   * Inicjalizuje referencje do elementów wewnątrz <main id="app">
   * @param {Record<string, string>} refMap - mapa nazw do selektorów
   */
  init(refMap) {
    const rootCandidate = typeof this.rootSelector === "string"
      ? document.querySelector(this.rootSelector)
      : this.rootSelector;

    if (!(rootCandidate instanceof HTMLElement)) {
      LoggerService.record("error", "[Dom] Nie znaleziono <main id=\"app\">. Wymagana struktura HTML.");
      return;
    }

    if (rootCandidate.tagName !== "MAIN" || rootCandidate.id !== "app") {
      LoggerService.record("error", "[Dom] Kontener bazowy musi być <main id=\"app\">. Otrzymano:", rootCandidate);
      return;
    }

    this.root = rootCandidate;

    Object.entries(refMap).forEach(([name, selector]) => {
      const el = selector === this.rootSelector
        ? this.root
        : this.root.querySelector(selector);

      if (!el) {
        LoggerService.record("warn", `[Dom] Brak elementu: ${selector}`);
      }

      this.refs[name] = el || null;
      this[name] = el || null;
    });
  }

  /**
   * Wyszukuje element w obrębie <main id="app">
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  q(selector) {
    return this.root?.querySelector(selector) || null;
  }

  /**
   * Wyszukuje wszystkie elementy pasujące do selektora w obrębie <main id="app">
   * @param {string} selector
   * @returns {NodeListOf<HTMLElement>}
   */
  qa(selector) {
    return this.root?.querySelectorAll(selector) || [];
  }
}


// 📦 EditValidator.js
/**
 * EditValidator
 * =============
 * Walidator tekstu edytowanego przez AI oraz przypisanych tagów.
 * Sprawdza długość tekstu i tagów oraz obecność treści.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Stałe limitów: maxTextLength, maxTagLength
 *   - Metoda: validate(text, tags)
 *
 * ❌ Niedozwolone:
 *   - Operacje na DOM
 *   - Zlecenia sieciowe (fetch, localStorage)
 *   - Logika aplikacyjna (np. renderowanie, wysyłka)
 *   - Efekty uboczne (np. console.log, mutacje zewnętrznych obiektów)
 */
class EditValidator {
  /**
   * Maksymalna długość tekstu edycji.
   * Tekst dłuższy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static maxTextLength = 5000;

  /**
   * Maksymalna długość pojedynczego tagu.
   * Tag dłuższy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static maxTagLength = 300;

  /**
   * Waliduje tekst i tagi pod kątem pustki i długości.
   * - Tekst musi być niepusty po przycięciu.
   * - Tekst nie może przekraczać maxTextLength.
   * - Każdy tag musi być typu string i nie może przekraczać maxTagLength.
   *
   * @param {string} text - Edytowany tekst AI
   * @param {string[]} tags - Lista tagów
   * @returns {{ valid: boolean, errors: string[] }} - Obiekt z informacją o poprawności i listą błędów
   */
  static validate(text, tags) {
    const errors = [];

    // Przycięcie tekstu z obu stron
    const trimmedText = text.trim();
    const textLength = trimmedText.length;

    // Walidacja tekstu
    if (!textLength) {
      errors.push("Tekst edycji nie może być pusty.");
    } else if (textLength > this.maxTextLength) {
      errors.push(
        `Maksymalna długość tekstu to ${this.maxTextLength} znaków, otrzymano ${textLength}.`
      );
    }

    // Walidacja tagów
    for (const tag of tags) {
      if (typeof tag !== "string") continue; // ignoruj błędne typy
      if (tag.length > this.maxTagLength) {
        errors.push(
          `Tag "${tag}" przekracza limit ${this.maxTagLength} znaków (ma ${tag.length}).`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


// 📦 GalleryLoader.js
/**
 * GalleryLoader
 * =============
 * Komponent odpowiedzialny za renderowanie galerii obrazów w przekazanym kontenerze.
 * Współpracuje z ImageResolver w celu wyszukiwania obrazów na podstawie tagów.
 * Umożliwia wybór obrazu przez użytkownika (radio name="gallery-choice").
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Renderowanie obrazów w kontenerze
 *   - Współpraca z ImageResolver
 *   - Obsługa wyboru obrazu przez użytkownika
 *   - Pobieranie obrazów z API (GET)
 *
 * ❌ Niedozwolone:
 *   - Logika promptów, edycji, ocen
 *   - Połączenia z BackendAPI poza prostym GET
 *   - Mutacje globalnego stanu
 *
 * TODO:
 *   - setMaxImages(n)
 *   - disableSelection()
 *   - exposeSelected(): string | null
 *   - support multi-select mode
 *
 * Refaktoryzacja?:
 *   - Rozdzielenie na podkomponenty:
 *     • GalleryRenderer → renderowanie i czyszczenie
 *     • GallerySelector → obsługa wyboru i podświetlenia
 *     • GalleryFetcher → integracja z ImageResolver i API
 */
class GalleryLoader {
  /**
   * @param {HTMLElement|{galleryContainer?:HTMLElement}} [root] - Kontener lub obiekt z polem galleryContainer.
   */
  constructor(root) {
    /** @type {HTMLElement|null} */
    this.container = null;
    /** @type {HTMLElement|null} */
    this.gallery = null;
    if (root) this.setContainer(root.galleryContainer || root);
  }

  /**
   * Ustawia kontener galerii. Obsługuje:
   * - <div id="image-gallery"> jako bezpośrednią galerię,
   * - dowolny <div> (galeria = ten div),
   * - wrapper zawierający element #image-gallery.
   *
   * @param {HTMLElement} el - Element kontenera
   */
  setContainer(el) {
    if (!(el instanceof HTMLElement)) {
      LoggerService.record("error", "[GalleryLoader] setContainer: brak HTMLElement", el);
      return;
    }
    this.container = el;
    this.gallery = el.querySelector?.("#image-gallery") || el;
  }

  /**
   * Czyści zawartość galerii.
   */
  clearGallery() {
    if (this.gallery) this.gallery.innerHTML = "";
  }

  /**
   * Pokazuje komunikat w galerii, czyszcząc poprzednią zawartość.
   *
   * @param {string} message - Treść komunikatu
   */
  showMessage(message) {
    if (!this.gallery) return;
    this.clearGallery();
    const msg = document.createElement("div");
    msg.classList.add("gallery-message");
    msg.textContent = message;
    this.gallery.appendChild(msg);
  }

  /**
   * Renderuje obrazy jako label z ukrytym input[type=radio] name="gallery-choice".
   * Dzięki temu EditManager może odczytać wybór.
   *
   * @param {string[]} urls - Lista URL-i obrazów
   */
  renderImages(urls) {
    if (!this.gallery) return;
    this.clearGallery();
    urls.forEach((url, idx) => {
      const label = document.createElement("label");
      label.className = "image-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "gallery-choice";
      input.value = url;
      input.style.display = "none";

      const img = document.createElement("img");
      img.src = url;
      img.alt = `Obraz ${idx + 1}`;
      img.loading = "lazy";

      label.append(input, img);
      this.gallery.appendChild(label);
      label.addEventListener("click", () => this._highlight(label));
    });
  }

  /**
   * Renderuje obrazy na podstawie tagów, używając ImageResolver.resolve().
   *
   * @param {string[]} tags - Lista tagów
   * @returns {Promise<void>}
   */
  async renderFromTags(tags) {
    if (!this.gallery) {
      LoggerService.record("error", "[GalleryLoader] Brak container w renderFromTags");
      return;
    }
    try {
      const urls = await ImageResolver.resolve(tags, { maxResults: 6 });
      if (urls.length === 0) {
        this.showMessage("❌ Brak obrazu dla tych tagów");
        return;
      }
      this.renderImages(urls);
      await this.highlightSelected(tags);
    } catch (err) {
      LoggerService.record("error", "[GalleryLoader] renderFromTags error", err);
      this.showMessage("❌ Błąd renderowania galerii.");
    }
  }

  /**
   * Podświetla obraz dopasowany do aktualnych tagów (pierwszy pasujący).
   * Ustawia również stan zaznaczenia radio.
   *
   * @param {string[]} tags - Lista tagów
   * @returns {Promise<void>}
   */
  async highlightSelected(tags) {
    if (!this.gallery) return;
    const target = await ImageResolver.resolveBest(tags);
    if (!target) return;
    const items = this.gallery.querySelectorAll(".image-option");
    items.forEach((label) => {
      const img = label.querySelector("img");
      const match = img && (img.src.endsWith(target) || img.src.includes(target));
      label.classList.toggle("selected", !!match);
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = !!match;
    });
  }

  /**
   * Ładuje obrazy z API i renderuje listę URL-i.
   * Endpoint może zwrócić: string[] lub { images: string[] }.
   *
   * @param {string} endpoint - URL endpointu API
   * @param {Record<string,string>} [params] - Parametry zapytania
   * @returns {Promise<void>}
   */
  async loadFromAPI(endpoint, params = {}) {
    if (!this.gallery) return;
    try {
      this.showMessage("Ładowanie...");
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([k, v]) => v && url.searchParams.append(k, v));
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const images = Array.isArray(data) ? data : (Array.isArray(data.images) ? data.images : []);
      if (!images.length) return this.showMessage("Brak wyników.");
      this.renderImages(images);
    } catch (err) {
      LoggerService.record("error", "[GalleryLoader] Błąd ładowania obrazów", err);
      this.showMessage("❌ Błąd ładowania obrazów.");
    }
  }

  /**
   * Zaznacza wybraną opcję i odznacza pozostałe.
   *
   * @param {HTMLElement} selected - Element label z klasą .image-option
   * @private
   */
  _highlight(selected) {
    if (!this.gallery) return;
    this.gallery.querySelectorAll(".image-option").forEach((el) => el.classList.remove("selected"));
    selected.classList.add("selected");
    const radio = selected.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}


// 📦 ImageResolver.js
/**
 * ImageResolver
 * =============
 * Narzędzie do wyszukiwania istniejących obrazów na podstawie tagów.
 * Obsługuje permutacje nazw plików, cache wyników oraz preload obrazów.
 *
 * Zasady:
 * -------
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
  /** Bazowa ścieżka do folderu z obrazami */
  static basePath = "/static/NarrativeIMG/";

  /** Lista rozszerzeń (bez kropki) do wyszukiwania obrazów w kolejności indeksu */
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

    if (exists)
      LoggerService.record("log", `[ImageResolver] HEAD ✓ ${url}`);
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


// 📦 PanelsController.js
/**
 * PanelsController
 * ================
 * Menedżer widoczności paneli bocznych w aplikacji.
 * Zapewnia kontrolę nad otwieraniem, zamykaniem i przełączaniem paneli w interfejsie użytkownika.
 * Obsługuje tryb mobilny (wyłączność paneli) oraz desktopowy (współistnienie).
 * Utrzymuje stan wybranych paneli w cookie — tylko na desktopie.
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Rejestracja paneli i ich przycisków
 *   - Obsługa zdarzeń kliknięcia
 *   - Przełączanie widoczności paneli
 *   - Zapisywanie stanu paneli w cookie (desktop only)
 *
 * ❌ Niedozwolone:
 *   - Deklaracja paneli statycznie
 *   - Modyfikacja zawartości paneli
 *   - Logika niezwiązana z UI paneli
 *
 * API:
 * ----
 * • `constructor(dom, panels, persistentPanels)` — inicjalizacja z referencjami DOM
 * • `init()` — rejestruje nasłuchiwacze i przywraca stan (desktop only)
 * • `addPanel(button, panel, id)` — dodaje nową parę przycisk→panel
 * • `openPanel(panel)` — otwiera panel (z wyłącznością na mobile)
 * • `closePanel(panel)` — zamyka panel
 * • `togglePanel(panel)` — przełącza widoczność panelu
 * • `closeAllPanels()` — zamyka wszystkie panele
 * • `isPanelOpen(panel)` — sprawdza, czy panel jest otwarty
 * • `getOpenPanel()` — zwraca pierwszy otwarty panel
 * • `getOpenPanels()` — zwraca wszystkie otwarte panele
 * • `destroy()` — usuwa nasłuchiwacze i czyści zasoby
 *
 * Zależności:
 *  - `Dom`: dostarcza referencje do przycisków i paneli
 *  - `Utils.isMobile()`: wykrywa tryb mobilny
 *  - `AppStorageManager`: zapisuje i odczytuje stan paneli z cookie
 *  - `LoggerService`: loguje błędy i ostrzeżenia
 */
class PanelsController {
  /**
   * @param {Dom} dom - Instancja klasy Dom
   * @param {Array<{button: HTMLElement, panel: HTMLElement, id: string}>} panels - lista paneli
   * @param {string[]} persistentPanels - identyfikatory paneli, które mają być zapamiętywane (desktop only)
   */
  constructor(dom, panels = [], persistentPanels = []) {
    this.dom = dom;
    this.panels = panels;
    this.cookiePanels = new Set(persistentPanels);
    this._unbinders = new Map();
  }

  /**
   * Inicjalizuje nasłuchiwacze kliknięć i przywraca stan z cookie (desktop only).
   */
  init() {
    this.panels.forEach(({ button, panel, id }) => {
      if (!button || !panel) return;

      if (!Utils.isMobile() && this.cookiePanels.has(id)) {
        const saved = AppStorageManager.getWithTTL(`panel:${id}`);
        if (saved === true) panel.classList.add("open");
      }

      const handler = () => this.togglePanel(panel);
      button.addEventListener("click", handler);
      this._unbinders.set(button, () =>
        button.removeEventListener("click", handler)
      );
    });
  }

  /**
   * Otwiera panel. Na mobile zamyka inne.
   * @param {HTMLElement} panel
   */
  openPanel(panel) {
    if (Utils.isMobile()) {
      this.closeAllPanels();
    }
    panel.classList.add("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, true);
    }
  }

  /**
   * Zamyka panel.
   * @param {HTMLElement} panel
   */
  closePanel(panel) {
    panel.classList.remove("open");

    if (!Utils.isMobile() && this.cookiePanels.has(panel.id)) {
      AppStorageManager.set(`panel:${panel.id}`, false);
    }
  }

  /**
   * Przełącza widoczność panelu.
   * @param {HTMLElement} panel
   */
  togglePanel(panel) {
    if (!panel) return;
    const isOpen = panel.classList.contains("open");
    if (isOpen) {
      this.closePanel(panel);
    } else {
      this.openPanel(panel);
    }
  }

  /** Zamyka wszystkie panele. */
  closeAllPanels() {
    this.panels.forEach(({ panel }) => panel?.classList.remove("open"));
  }

  /**
   * Sprawdza, czy panel jest otwarty.
   * @param {HTMLElement} panel
   * @returns {boolean}
   */
  isPanelOpen(panel) {
    return !!panel?.classList.contains("open");
  }

  /**
   * Zwraca pierwszy otwarty panel.
   * @returns {HTMLElement|null}
   */
  getOpenPanel() {
    const item = this.panels.find(({ panel }) =>
      panel?.classList.contains("open")
    );
    return item?.panel || null;
  }

  /**
   * Zwraca wszystkie otwarte panele.
   * @returns {HTMLElement[]}
   */
  getOpenPanels() {
    return this.panels
      .map(({ panel }) => panel)
      .filter((p) => p && p.classList.contains("open"));
  }

  /**
   * Usuwa nasłuchiwacze i czyści zasoby.
   */
  destroy() {
    this._unbinders.forEach((off) => off?.());
    this._unbinders.clear();
  }
}


// 📦 PromptValidator.js
/**
 * PromptValidator
 * ===============
 * Walidator promptów użytkownika przed wysłaniem do AI.
 * Sprawdza typ, długość i obecność niedozwolonych znaków.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Stałe limitów: minLength, maxLength
 *   - Wzorzec niedozwolonych znaków: forbidden
 *   - Metoda: validate(prompt)
 *
 * ❌ Niedozwolone:
 *   - Operacje na DOM
 *   - Zlecenia sieciowe (fetch, localStorage)
 *   - Logika aplikacyjna (np. renderowanie, wysyłka)
 *   - Efekty uboczne (np. console.log, mutacje zewnętrznych obiektów)
 *
 * TODO:
 *   - setLimits()
 *   - addForbiddenPattern()
 *   - validateStrict()
 *   - getErrorSummary()
 */
class PromptValidator {
  /**
   * Minimalna długość promptu po przycięciu.
   * Prompt krótszy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static minLength = 1;

  /**
   * Maksymalna długość promptu po przycięciu.
   * Prompt dłuższy niż ta wartość zostanie uznany za niepoprawny.
   * @type {number}
   */
  static maxLength = 300;

  /**
   * Wzorzec niedozwolonych znaków w promptach.
   * Domyślnie: < oraz >
   * @type {RegExp}
   */
  static forbidden = /[<>]/;

  /**
   * Waliduje prompt użytkownika.
   * Sprawdza:
   * - czy jest typu string
   * - czy nie jest pusty po przycięciu
   * - czy mieści się w limicie długości
   * - czy nie zawiera niedozwolonych znaków
   *
   * @param {string} prompt - Tekst promptu od użytkownika
   * @returns {{ valid: boolean, errors: string[] }} - Obiekt z informacją o poprawności i listą błędów
   */
  static validate(prompt) {
    const errors = [];

    // Typ musi być string
    if (typeof prompt !== "string") {
      errors.push("Prompt musi być typu string.");
      return { valid: false, errors };
    }

    // Przycięcie spacji
    const trimmed = prompt.trim();
    const len = trimmed.length;

    // Walidacja długości
    if (len < this.minLength) {
      errors.push("Prompt nie może być pusty.");
    } else if (len > this.maxLength) {
      errors.push(
        `Maksymalna długość promptu to ${this.maxLength} znaków, otrzymano ${len}.`
      );
    }

    // Walidacja znaków
    if (this.forbidden.test(trimmed)) {
      errors.push("Prompt zawiera niedozwolone znaki: < lub >.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


// 📦 RequestRetryManager.js
/**
 * RequestRetryManager
 * ===================
 * Warstwa odpornościowa dla zapytań HTTP z kontrolą retry i backoffem.
 * Zapewnia ponawianie zapytań w przypadku błędów sieciowych lub odpowiedzi serwera,
 * które kwalifikują się do ponowienia (retryable), z kontrolą liczby prób, odstępów
 * i maksymalnego czasu trwania operacji.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Wielokrotne próby `fetch` z kontrolą limitu, odstępu i łącznego czasu.
 *   - Decyzja, czy błąd/odpowiedź jest retryowalna.
 *   - Wywołanie zdarzenia `onRetry` (np. do telemetrii lub logowania).
 *   - Parametryzacja backoffu (bazowe opóźnienie, mnożnik, jitter).
 *
 * ❌ Niedozwolone:
 *   - Logika UI lub domenowa.
 *   - Transformacje payloadu/JSON (to rola warstwy BackendAPI).
 *   - Obsługa specyficznych formatów odpowiedzi.
 *
 * API:
 * ----
 * • `static isRetryable(errOrRes): boolean`
 *    - Sprawdza, czy błąd lub odpowiedź kwalifikuje się do ponowienia.
 *    - Retry przy:
 *        • Błędach sieciowych (`TypeError` z `fetch`)
 *        • Kodach HTTP 5xx
 *        • Kodzie HTTP 429 (Too Many Requests)
 *    - Brak retry przy:
 *        • Kodach HTTP 4xx (poza 429)
 *        • Odpowiedziach `ok === true`
 *
 * • `static async fetchWithRetry(input, init?, retries?, baseDelay?, options?): Promise<Response>`
 *    - Wykonuje `fetch` z mechanizmem retry i backoffem z jitterem.
 *    - Parametry:
 *        • `input` — URL lub obiekt `Request`
 *        • `init` — opcje `fetch` (method, headers, body itd.)
 *        • `retries` — maksymalna liczba ponowień (bez pierwszej próby)
 *        • `baseDelay` — bazowe opóźnienie (ms) dla backoffu
 *        • `options`:
 *            - `silent` — jeśli true, logowanie na poziomie `log` zamiast `warn`
 *            - `maxTotalTime` — twardy limit łącznego czasu (ms)
 *            - `onRetry(info)` — callback wywoływany przy każdej próbie ponowienia
 *            - `factor` — mnożnik backoffu (domyślnie 2)
 *            - `jitter` — odchylenie losowe [0..1] (domyślnie 0.2)
 *
 * Mechanizm backoffu:
 * -------------------
 *  - Opóźnienie = `baseDelay * factor^(attempt-1)` ± `jitter`
 *  - Jitter wprowadza losowe odchylenie, aby uniknąć skoków ruchu (thundering herd)
 *  - Przed każdą próbą sprawdzany jest limit `maxTotalTime`
 *
 * Obsługa błędów:
 * ---------------
 *  - Błąd nieretryowalny → natychmiastowe przerwanie i rzucenie wyjątku
 *  - Wyczerpanie liczby retry → rzucenie ostatniego błędu
 *  - Przekroczenie `maxTotalTime` → rzucenie ostatniego błędu
 *
 * Telemetria/logowanie:
 * ---------------------
 *  - Każdy retry logowany przez `LoggerService.record()` na poziomie `warn` lub `log` (silent)
 *  - Możliwość podpięcia własnego callbacka `onRetry` z informacjami o próbie
 */
class RequestRetryManager {
  /**
   * Sprawdza, czy błąd lub odpowiedź nadaje się do ponowienia.
   *
   * Zasady:
   *  - Retry przy błędach sieciowych (`TypeError` z `fetch`)
   *  - Retry przy kodach HTTP 5xx i 429
   *  - Brak retry przy kodach 4xx (poza 429) i odpowiedziach `ok === true`
   *
   * @param {any} errOrRes - Obiekt błędu lub odpowiedzi `Response`
   * @returns {boolean} - true, jeśli można ponowić
   */
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

  /**
   * Wykonuje `fetch` z mechanizmem retry i backoffem z jitterem.
   *
   * @param {string|Request} input - URL lub obiekt `Request`
   * @param {RequestInit} [init={}] - Opcje `fetch` (method, headers, body itd.)
   * @param {number} [retries=3] - Maksymalna liczba ponowień (bez pierwszej próby)
   * @param {number} [baseDelay=800] - Bazowe opóźnienie (ms) dla backoffu
   * @param {{
   *   silent?: boolean,
   *   maxTotalTime?: number,     // twardy limit łącznego czasu (ms)
   *   onRetry?: (info:{
   *     attempt:number,
   *     retries:number,
   *     delay:number,
   *     reason:any,
   *     input:string|Request
   *   })=>void,
   *   factor?: number,           // mnożnik backoffu, domyślnie 2
   *   jitter?: number            // [0..1], odchylenie losowe, domyślnie 0.2
   * } } [options={}] - Parametry dodatkowe
   * @returns {Promise<Response>} - Odpowiedź `fetch`
   *
   * Przebieg:
   *  1. Wykonuje pierwsze żądanie `fetch`.
   *  2. Jeśli odpowiedź jest OK → zwraca ją.
   *  3. Jeśli odpowiedź/błąd jest retryowalny → ponawia do `retries` razy.
   *  4. Każde ponowienie ma opóźnienie wyliczone z backoffu + jitter.
   *  5. Jeśli przekroczono `maxTotalTime` → rzuca błąd.
   *  6. Wywołuje `onRetry` (jeśli podany) przy każdej próbie ponowienia.
   */
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
          // Błąd nieretryowalny — rzucamy od razu
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

        // Kolejna próba
        attempt += 1;

        // Exponential backoff + jitter
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
            // Ignorujemy błędy w callbacku onRetry
          }
        }

        // Odczekaj wyliczony czas przed kolejną próbą
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}


// 📦 SenderRegistry.js
/**
 * SenderRegistry
 * ==============
 * Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
 * Umożliwia rotacyjne przypisywanie kolorów z palety oraz zarządzanie rejestrem.
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Mapowanie nadawca → indeks → klasa CSS
 *   - Rotacja indeksów po przekroczeniu długości palety
 *   - Przechowywanie stanu w Map
 *
 * ❌ Niedozwolone:
 *   - Operacje na DOM
 *   - Logika aplikacyjna (np. renderowanie wiadomości)
 *   - Zlecenia sieciowe, localStorage, fetch
 */
class SenderRegistry {
  /**
   * Lista dostępnych klas CSS dla nadawców.
   * Kolory są przypisywane rotacyjnie na podstawie indeksu.
   * @type {string[]}
   */
  static palette = [
    "sender-color-1",
    "sender-color-2",
    "sender-color-3",
    "sender-color-4",
    "sender-color-5",
    "sender-color-6",
    "sender-color-7",
    "sender-color-8",
    "sender-color-9",
    "sender-color-10",
    "sender-color-11",
    "sender-color-12",
    "sender-color-13",
    "sender-color-14",
  ];

  /**
   * Rejestr przypisań nadawca → indeks palety.
   * @type {Map<string, number>}
   */
  static registry = new Map();

  /**
   * Licznik rotacyjny dla kolejnych nadawców.
   * Wykorzystywany do wyznaczania indeksu w palecie.
   * @type {number}
   */
  static nextIndex = 0;

  /**
   * Zwraca klasę CSS dla danego nadawcy.
   * Jeśli nadawca nie był wcześniej zarejestrowany, przypisuje mu nową klasę z palety.
   * @param {string} sender - Nazwa nadawcy
   * @returns {string} - Klasa CSS przypisana nadawcy
   */
  static getClass(sender) {
    if (!sender || typeof sender !== "string") return "sender-color-default";

    if (!this.registry.has(sender)) {
      const index = this.nextIndex % this.palette.length;
      this.registry.set(sender, index);
      this.nextIndex++;
    }

    const idx = this.registry.get(sender);
    return this.palette[idx];
  }

  /**
   * Czyści rejestr nadawców i resetuje licznik.
   * Używane np. przy resecie czatu.
   */
  static reset() {
    this.registry.clear();
    this.nextIndex = 0;
  }

  /**
   * Sprawdza, czy nadawca jest już zarejestrowany.
   * @param {string} sender - Nazwa nadawcy
   * @returns {boolean} - Czy nadawca istnieje w rejestrze
   */
  static hasSender(sender) {
    return this.registry.has(sender);
  }

  /**
   * Zwraca indeks przypisany nadawcy w palecie.
   * @param {string} sender - Nazwa nadawcy
   * @returns {number | undefined} - Indeks w palecie lub undefined
   */
  static getSenderIndex(sender) {
    return this.registry.get(sender);
  }

  /**
   * Zwraca aktualną paletę kolorów.
   * @returns {string[]} - Kopia tablicy z klasami CSS
   */
  static getPalette() {
    return [...this.palette];
  }

  /**
   * Ustawia nową paletę kolorów i resetuje rejestr.
   * @param {string[]} newPalette - Nowa lista klas CSS
   */
  static setPalette(newPalette) {
    if (Array.isArray(newPalette) && newPalette.length > 0) {
      this.palette = newPalette;
      this.reset();
    }
  }
}


// 📦 TagSelectorFactory.js
/**
 * TagSelectorFactory
 * ==================
 * Fabryka elementów UI do wyboru tagów.
 * Tworzy pola wyboru w dwóch wariantach w zależności od środowiska:
 *  • Mobile → <select> z listą opcji
 *  • Desktop → <input> z przypisanym <datalist>
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Generowanie elementów formularza dla tagów
 *   - Nadawanie etykiet polom na podstawie słownika
 *   - Obsługa wariantu mobilnego i desktopowego
 *
 * ❌ Niedozwolone:
 *   - Walidacja wybranych tagów
 *   - Operacje sieciowe
 *   - Bezpośrednia integracja z backendem
 *
 * TODO:
 *   - Obsługa pól wielokrotnego wyboru (multi-select)
 *   - Dodanie atrybutów dostępności (ARIA)
 *   - Możliwość ustawiania placeholderów w trybie desktop
 *
 * Refaktoryzacja?:
 *   - Ujednolicenie API metod `create` i `createTagField`
 *   - Wydzielenie generatora opcji do osobnej metody
 */
class TagSelectorFactory {
  /**
   * Słownik etykiet dla pól tagów.
   * Klucze odpowiadają nazwom pól, wartości to etykiety wyświetlane w UI.
   * @type {Record<string,string>}
   */
  static labels = {
    location: "Lokalizacja",
    character: "Postać",
    action: "Czynność",
    nsfw: "NSFW",
    emotion: "Emocja",
  };

  /**
   * Tworzy prosty element wyboru tagów (bez dodatkowych klas/stylów).
   * Używany do generowania pojedynczych selektorów w UI.
   *
   * @param {string} type - Typ pola (np. 'location', 'character').
   * @param {string[]} [options=[]] - Lista dostępnych opcji.
   * @returns {HTMLLabelElement} - Element <label> zawierający kontrolkę wyboru.
   */
  static create(type, options = []) {
    const labelEl = document.createElement("label");
    labelEl.textContent = this.labels[type] || type;

    if (Utils.isMobile()) {
      // Mobile: <select> z opcjami
      const select = document.createElement("select");
      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });
      labelEl.appendChild(select);
    } else {
      // Desktop: <input> + <datalist>
      const input = document.createElement("input");
      input.setAttribute("list", `${type}-list`);
      const datalist = document.createElement("datalist");
      datalist.id = `${type}-list`;
      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        datalist.appendChild(optionEl);
      });
      labelEl.append(input, datalist);
    }

    return labelEl;
  }

  /**
   * Tworzy kompletny element pola tagu z etykietą i kontrolką wyboru.
   * Używany w panelach tagów (np. TagsPanel) do renderowania pól kategorii.
   *
   * @param {string} name - Nazwa pola (np. "location", "character").
   * @param {string[]} [options=[]] - Lista opcji do wyboru.
   * @returns {HTMLLabelElement} - Gotowy element <label> z kontrolką.
   */
  static createTagField(name, options = []) {
    const labelEl = document.createElement("label");
    labelEl.className = "tag-field";
    labelEl.textContent = this.labels?.[name] || name;

    if (Utils.isMobile()) {
      // Mobile: <select> z pustą opcją na start
      const select = document.createElement("select");
      select.id = `tag-${name}`;
      select.name = name;

      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "-- wybierz --";
      select.appendChild(emptyOpt);

      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });

      labelEl.appendChild(select);
    } else {
      // Desktop: <input> + <datalist>
      const input = document.createElement("input");
      input.id = `tag-${name}`;
      input.name = name;
      input.setAttribute("list", `${name}-list`);

      const datalist = document.createElement("datalist");
      datalist.id = `${name}-list`;

      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        datalist.appendChild(optionEl);
      });

      labelEl.append(input, datalist);
    }

    return labelEl;
  }
}


// 📦 TagsPanel.js
/**
 * TagsPanel
 * =========
 * Komponent odpowiedzialny za renderowanie i obsługę pól tagów oraz synchronizację z galerią.
 * Integruje się z TagSelectorFactory i GalleryLoader, umożliwiając wybór tagów i podgląd obrazów.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Tworzenie i aktualizacja pól tagów
 *   - Synchronizacja z galerią
 *   - Emisja zmian tagów do świata zewnętrznego
 *   - Obsługa wartości domyślnych z data-tags
 *
 * ❌ Niedozwolone:
 *   - Walidacja promptów/tekstu
 *   - Operacje sieciowe (np. pobieranie tagów z backendu)
 *   - Logika edycji, ocen, renderowania wiadomości
 *
 * TODO:
 *   - setMaxTagsPerField(n)
 *   - disableFields()
 *   - exposeSelectedTags(): string[]
 *   - obsługa tagów wielokrotnego wyboru
 *
 * Refaktoryzacja?:
 *   - Rozdzielenie na podkomponenty:
 *     • TagsFieldManager → tworzenie i aktualizacja pól
 *     • TagsSync → synchronizacja z galerią
 *     • TagsDefaults → obsługa data-tags i presetów
 */
class TagsPanel {
  /**
   * Tworzy instancję panelu tagów.
   * @param {HTMLElement} container - Kontener DOM z miejscem na pola tagów i galerię.
   * @throws {Error} Gdy container nie jest HTMLElement.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      const actualType =
        container === null
          ? "null"
          : Array.isArray(container)
          ? "Array"
          : container?.constructor?.name || typeof container;

      throw new Error(
        `[TagsPanel] Przekazany kontener nie jest elementem DOM. Otrzymano: ${actualType} → ${String(
          container
        )}`
      );
    }

    /** @type {HTMLElement} */
    this.container = container;

    /** @type {{(tags:string[]):void}|null} */
    this.onTagsChanged = null;

    /** @type {Record<string, HTMLInputElement|HTMLSelectElement>} */
    this.fields = {};

    // 1) Zbuduj pola (domyślne — jeśli nie nadpiszesz setTagOptions)
    this.buildTagFields();

    // 2) Galeria pod spodem
    const gallery = document.createElement("div");
    gallery.id = "image-gallery";
    gallery.className = "gallery-grid mt-10";
    this.container.appendChild(gallery);

    /** @type {HTMLElement} */
    this.gallery = gallery;

    // 3) Podłącz GalleryLoader (kontener wielorazowy)
    this.galleryLoader = new GalleryLoader({ galleryContainer: gallery });
    this.galleryLoader.setContainer(gallery);

    // 4) Pierwsza emisja
    this.notifyTagsChanged();
  }

  /**
   * Skrót do querySelector w obrębie panelu.
   * @param {string} selector - CSS selektor
   * @returns {HTMLElement|null}
   */
  q(selector) {
    const el = this.container.querySelector(selector);
    if (!el) {
      LoggerService.record(
        "warn",
        `[TagsPanel] Nie znaleziono elementu: ${selector}`,
        this.container
      );
    }
    return el;
  }

  /**
   * Domyślna konstrukcja pól tagów (fallback, gdy nie użyjesz setTagOptions()).
   * W realu zwykle używasz setTagOptions(daneZBackendu).
   */
  buildTagFields() {
    const tagNames = ["location", "character", "action", "nsfw", "emotion"];
    const tagOptions = {
      location: ["forest", "castle", "cave", "village"],
      character: ["Lytha", "Aredia", "Xavier"],
      action: ["healing", "combat", "ritual"],
      nsfw: ["intimacy", "touch", "kiss"],
      emotion: ["joy", "sadness", "fear", "love"],
    };

    tagNames.forEach((name) => {
      const fieldWrapper = TagSelectorFactory.createTagField(
        name,
        tagOptions[name] || []
      );
      this.container.appendChild(fieldWrapper);
      const field =
        fieldWrapper.querySelector(`#tag-${name}`) ||
        fieldWrapper.querySelector("input, select");

      this.fields[name] = field;
    });
  }

  /**
   * Inicjalizuje nasłuchiwanie zmian w polach tagów.
   * @param {(tagsObj:Record<string,string>)=>void} onChange - Callback wywoływany przy zmianie
   */
  init(onChange) {
    const debouncedRefresh = Utils.debounce(
      () => this.notifyTagsChanged(),
      300
    );

    Object.values(this.fields).forEach((field) => {
      if (!field) return;
      const eventType = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventType, () => {
        if (typeof onChange === "function")
          onChange(this.getSelectedTagsObject());
        debouncedRefresh();
      });
    });
  }

  /**
   * Zwraca aktualne tagi jako obiekt {nazwaKategorii: wartość}.
   * @returns {Record<string,string>}
   */
  getSelectedTagsObject() {
    return Object.fromEntries(
      Object.entries(this.fields).map(([k, el]) => [k, el?.value || ""])
    );
  }

  /**
   * Zwraca aktualne tagi jako lista stringów (bez pustych).
   * @returns {string[]}
   */
  getTagList() {
    return Object.values(this.getSelectedTagsObject()).filter(Boolean);
  }

  /**
   * Emisja zmiany tagów i synchronizacja galerii.
   */
  notifyTagsChanged() {
    const list = this.getTagList();
    if (typeof this.onTagsChanged === "function") {
      this.onTagsChanged(list);
    }
    this.galleryLoader?.renderFromTags(list);
  }

  /**
   * Czyści wszystkie pola tagów i odświeża galerię.
   */
  clearTags() {
    Object.values(this.fields).forEach((field) => {
      if (field) field.value = "";
    });
    this.notifyTagsChanged();
  }

  /**
   * Zastępuje opcje tagów i przebudowuje pola na podstawie słownika z backendu.
   * Oczekuje kluczy w postaci "tag-location", "tag-character", ... (tak jak w tags.json).
   * Zachowuje this.gallery — pola idą przed galerią.
   *
   * @param {Record<string,string[]>} tagOptionsFromBackend
   */
  setTagOptions(tagOptionsFromBackend) {
    const toFieldName = (k) => (k.startsWith("tag-") ? k.slice(4) : k);

    Array.from(this.container.children).forEach((child) => {
      if (child !== this.gallery) this.container.removeChild(child);
    });

    this.fields = {};
    Object.entries(tagOptionsFromBackend).forEach(([backendKey, options]) => {
      const name = toFieldName(backendKey);
      const fieldWrapper = TagSelectorFactory.createTagField(
        name,
        options || []
      );
      if (this.gallery && this.gallery.parentElement === this.container) {
        this.container.insertBefore(fieldWrapper, this.gallery);
      } else {
        this.container.appendChild(fieldWrapper);
      }
      const field =
        fieldWrapper.querySelector(`#tag-${name}`) ||
        fieldWrapper.querySelector("input, select");

      this.fields[name] = field;
    });
  }

  /**
   * Ustawia wartości domyślne na podstawie data-tags (np. "cave_kissing")
   * i słownika tagów z backendu. Pomija tokeny, których nie ma w żadnej kategorii.
   *
   * @param {string} dataTags - np. "cave_kissing"
   * @param {Record<string,string[]>} tagOptionsFromBackend
   */
  applyDefaultsFromDataTags(dataTags, tagOptionsFromBackend) {
    if (!dataTags) return;

    const tokens = dataTags.split("_").filter(Boolean);
    const mapBackendKeyToField = (k) => (k.startsWith("tag-") ? k.slice(4) : k);

    for (const token of tokens) {
      for (const [backendKey, options] of Object.entries(
        tagOptionsFromBackend
      )) {
        if (Array.isArray(options) && options.includes(token)) {
          const fieldName = mapBackendKeyToField(backendKey);
          const field = this.fields[fieldName];
          if (field) field.value = token;
          break;
        }
      }
    }
  }
}


// 📦 UserManager.js
/**
 * UserManager
 * ===========
 * Statyczna klasa do zarządzania nazwą użytkownika w aplikacji.
 * Umożliwia zapis, odczyt i czyszczenie imienia użytkownika oraz dynamiczną podmianę placeholderów w tekstach.
 * Integruje się z polem input `#user_name`, umożliwiając automatyczny zapis zmian.
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Przechowywanie i odczytywanie imienia użytkownika z AppStorageManager
 *   - Obsługa pola input `#user_name` (wypełnianie i nasłuchiwanie zmian)
 *   - Podmiana placeholderów w tekstach (np. `{{user}}`)
 *
 * ❌ Niedozwolone:
 *   - Przechowywanie innych danych użytkownika niż imię
 *   - Logika niezwiązana z nazwą użytkownika
 *   - Modyfikacja innych pól formularza
 *
 * API:
 * ----
 * • `setName(name: string)` — zapisuje imię użytkownika
 * • `getName(): string` — odczytuje imię użytkownika
 * • `hasName(): boolean` — sprawdza, czy imię jest ustawione
 * • `clearName()` — usuwa zapisane imię
 * • `getStorageType(): "localStorage"|"cookie"` — zwraca typ użytej pamięci
 * • `init(dom: Dom)` — podłącza pole `#user_name` do automatycznego zapisu
 * • `replacePlaceholders(text: string, map?: Record<string,string>): string` — podmienia `{{user}}` i inne placeholdery
 *
 * Zależności:
 *  - `AppStorageManager`: zapis i odczyt danych
 *  - `Dom`: dostęp do pola input `#user_name`
 *
 * TODO:
 *  - Obsługa walidacji imienia (np. długość, znaki)
 *  - Integracja z systemem profili (jeśli powstanie)
 *  - Obsługa wielu pól z placeholderami w DOM
 */
class UserManager {
  /** @type {string} Klucz używany w AppStorageManager */
  static storageKey = "user_name";

  /**
   * Zapisuje imię użytkownika w AppStorageManager.
   * @param {string} name - Imię użytkownika.
   */
  static setName(name) {
    AppStorageManager.set(this.storageKey, name.trim());
  }

  /**
   * Odczytuje imię użytkownika z AppStorageManager.
   * @returns {string} Imię użytkownika lub pusty string.
   */
  static getName() {
    const raw = AppStorageManager.getWithTTL(this.storageKey);
    return typeof raw === "string" ? raw : raw ?? "";
  }

  /**
   * Sprawdza, czy imię użytkownika jest ustawione.
   * @returns {boolean} True, jeśli imię istnieje i nie jest puste.
   */
  static hasName() {
    return !!this.getName().trim();
  }

  /**
   * Usuwa zapisane imię użytkownika.
   */
  static clearName() {
    AppStorageManager.remove(this.storageKey);
  }

  /**
   * Zwraca typ pamięci, w której aktualnie przechowywane jest imię.
   * @returns {"localStorage"|"cookie"}
   */
  static getStorageType() {
    return AppStorageManager.type();
  }

  /**
   * Podłącza pole input #user_name:
   * - wypełnia istniejącą wartością,
   * - zapisuje każdą zmianę.
   * @param {Dom} dom - Instancja klasy Dom z metodą `q()`.
   */
  static init(dom) {
    const input = dom.q("#user_name");
    if (!input) return;
    input.value = this.getName();
    input.addEventListener("input", () => {
      this.setName(input.value);
    });
  }

  /**
   * Podmienia placeholdery w tekście na aktualne imię użytkownika.
   * @param {string} text - Tekst zawierający placeholdery (np. {{user}}).
   * @param {Object<string,string>} [map] - Opcjonalna mapa dodatkowych placeholderów do podmiany.
   * @returns {string} Tekst z podmienionymi wartościami.
   */
  static replacePlaceholders(text, map = {}) {
    const name = this.getName() || "Użytkowniku";
    let result = text.replace(/{{\s*user\s*}}/gi, name);
    for (const [key, value] of Object.entries(map)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
      result = result.replace(regex, value);
    }
    return result;
  }
}


// 📦 Utils.js
/**
 * Utils
 * =====
 * Zestaw funkcji pomocniczych wykorzystywanych w całej aplikacji.
 * Nie wymaga instancjonowania — wszystkie metody są dostępne statycznie.
 *
 * Zasady:
 * -------
 * ✅ Dozwolone:
 *   - Funkcje czyste: throttle, debounce, clamp, formatDate, randomId
 *   - Operacje na DOM: safeQuery, createButton
 *   - Detekcja środowiska: isMobile
 *   - Sprawdzenie dostępności zasobów: checkImageExists
 *
 * ❌ Niedozwolone:
 *   - Logika aplikacyjna (np. renderowanie wiadomości)
 *   - Zależności od klas domenowych (ChatManager, BackendAPI itd.)
 *   - Mutacje globalnego stanu
 *   - Efekty uboczne poza LoggerService
 *
 * TODO:
 *   - once(fn)
 *   - retry(fn, attempts)
 *   - escapeHTML(str)
 *   - parseQueryParams(url)
 *   - wait(ms)
 */
const Utils = {
  /**
   * Ogranicza wywołanie funkcji do max raz na `limit` ms.
   * @param {Function} fn - Funkcja do ograniczenia
   * @param {number} limit - Minimalny odstęp między wywołaniami (ms)
   * @returns {Function} - Funkcja z throttlingiem
   */
  throttle(fn, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * Opóźnia wywołanie funkcji do momentu, gdy przestanie być wywoływana przez `delay` ms.
   * @param {Function} fn - Funkcja do opóźnienia
   * @param {number} delay - Czas oczekiwania po ostatnim wywołaniu (ms)
   * @returns {Function} - Funkcja z debounce
   */
  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Ogranicza wartość do zakresu [min, max].
   * @param {number} val - Wartość wejściowa
   * @param {number} min - Minimalna wartość
   * @param {number} max - Maksymalna wartość
   * @returns {number} - Wartość ograniczona do zakresu
   */
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  /**
   * Formatuje datę jako string HH:MM:SS (bez AM/PM).
   * @param {Date} date - Obiekt daty
   * @returns {string} - Sformatowany czas
   */
  formatDate(date) {
    return date.toLocaleTimeString("pl-PL", { hour12: false });
  },

  /**
   * Generuje losowy identyfikator (np. do elementów DOM, wiadomości).
   * @returns {string} - Losowy identyfikator
   */
  randomId() {
    return Math.random().toString(36).substr(2, 9);
  },

  /**
   * Bezpieczne pobranie elementu DOM.
   * Jeśli element nie istnieje, loguje ostrzeżenie.
   * @param {string} selector - CSS selektor
   * @returns {HTMLElement|null} - Znaleziony element lub null
   */
  safeQuery(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      LoggerService.record("warn", `Brak elementu dla selektora: ${selector}`);
    }
    return el;
  },

  /**
   * Tworzy przycisk z tekstem i handlerem kliknięcia.
   * @param {string} label - Tekst przycisku
   * @param {Function} onClick - Funkcja obsługująca kliknięcie
   * @returns {HTMLButtonElement} - Gotowy element przycisku
   */
  createButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = "form-element";
    btn.addEventListener("click", onClick);
    return btn;
  },

  /**
   * Detekcja urządzenia mobilnego na podstawie user-agenta i szerokości okna.
   * @returns {boolean} - Czy urządzenie jest mobilne
   */
  isMobile() {
    const uaMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );
    const narrow = window.innerWidth < 768;
    const mobile = uaMobile && narrow;
    LoggerService.record("log", "Detekcja urządzenia mobilnego:", mobile);
    return mobile;
  },
};


// 📦 VirtualKeyboardDock.js
/**
 * VirtualKeyboardDock
 * ===================
 * Komponent odpowiedzialny za dostosowanie położenia elementu docka (np. paska narzędzi, przycisków)
 * w momencie pojawienia się lub zniknięcia wirtualnej klawiatury na urządzeniach mobilnych.
 *
 * Funkcje:
 * --------
 *  - Nasłuchuje zdarzeń `focus` i `blur` na polach tekstowych, aby wykryć aktywację klawiatury.
 *  - Reaguje na zdarzenia `resize`/`visualViewport`/`keyboardchange` w celu aktualizacji pozycji docka.
 *  - Ustawia odpowiedni `bottom` docka tak, aby nie był zasłaniany przez klawiaturę.
 *  - Ukrywa dock, gdy klawiatura jest schowana (opcjonalnie).
 *
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Manipulacja stylem docka w reakcji na zmiany widoczności klawiatury.
 *   - Obsługa zdarzeń wejściowych i zmian rozmiaru widoku.
 *
 * ❌ Niedozwolone:
 *   - Modyfikowanie innych elementów UI poza dockiem.
 *   - Wysyłanie żądań sieciowych.
 *
 * API:
 * ----
 * • `constructor(dockEl)` — inicjalizuje obiekt z referencją do elementu docka.
 * • `init()` — podpina nasłuchy zdarzeń i ustawia początkowy stan.
 * • `updatePosition()` — oblicza i ustawia pozycję docka względem dolnej krawędzi okna/viewportu.
 * • `show()` — pokazuje dock.
 * • `hide()` — ukrywa dock.
 */
class VirtualKeyboardDock {
  /**
   * @param {HTMLElement} dockEl - Element docka, który ma być pozycjonowany.
   */
 constructor(dockEl, forceEnable = false) {
  this.dock = dockEl;
  this.isVisible = false;
  this.boundUpdate = this.updatePosition.bind(this);
  this.forceEnable = forceEnable;
}
  /**
   * Podpina nasłuchy zdarzeń i ustawia początkową pozycję docka.
   */
  init() {
    if (!this.forceEnable && Utils.isMobile() === false) return;
    // Obsługa focus/blur na polach tekstowych
    document.addEventListener("focusin", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        this.show();
      }
    });
    document.addEventListener("focusout", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        this.hide();
      }
    });

    // Obsługa zmiany rozmiaru okna / viewportu
    window.addEventListener("resize", this.boundUpdate);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.boundUpdate);
    }
  }

  /**
   * Aktualizuje pozycję docka względem dolnej krawędzi okna.
   */
  updatePosition() {
    if (!this.isVisible) return;
    const offset = window.visualViewport
      ? window.innerHeight - window.visualViewport.height
      : 0;
    this.dock.style.bottom = `${offset}px`;
  }

  /**
   * Pokazuje dock i aktualizuje jego pozycję.
   */
  show() {
    this.isVisible = true;
    this.dock.style.display = "block";
    this.updatePosition();
  }

  /**
   * Ukrywa dock.
   */
  hide() {
    this.isVisible = false;
    this.dock.style.display = "none";
    this.dock.style.bottom = "0px";
  }
}


// 🚀 init_chat.js
// init_chat.js

// 1) Konfiguracja selektorów DOM
const htmlElements = {
  app: "#app",
  chatWrapper: "#chat-wrapper",
  chatContainer: "#chat-container",
  inputArea: "#input-area",
  prompt: "#prompt",
  promptDesc: "#prompt-desc",
  promptError: ".prompt-error",
  promptWarning: ".max-text-length-warning",
  submitButton: 'form#input-area button[type="submit"]',
  burgerToggle: "#burger-toggle",
  webSidePanel: "#web-side-panel",
  settingsToggle: "#settings-toggle",
  settingSidePanel: "#setting-side-panel",
  userNameInput: "#user_name",
};

// 2) „Adaptery” – lekkie moduły wpinane do App

// 2a) User manager jako moduł lifecycle
function UserManagerModule() {
  return {
    init(ctx) {
      if (ctx.userManager && typeof ctx.userManager.init === "function") {
        ctx.userManager.init(ctx.dom);
      }
    },
  };
}

// 2b) Virtual keyboard dock moduł
function VirtualKeyboardDockModule(dom) {
  const vk = new VirtualKeyboardDock(dom);
  return {
    init() { vk.init(); }
  };
}

// 2c) Panels controller moduł (konfiguracja tylko tutaj)
function PanelsControllerModule(dom) {
  const pc = new PanelsController(
    dom,
    [
      { button: dom.burgerToggle,   panel: dom.webSidePanel,     id: "web-side-panel" },
      { button: dom.settingsToggle, panel: dom.settingSidePanel, id: "setting-side-panel" },
    ],
    ["setting-side-panel"]
  );
  return {
    init() { pc.init(); }
  };
}

// 2d) Chat manager moduł (tylko na tej stronie)
function ChatManagerModule(ctx) {
  // ChatManager potrzebuje Context, bo czyta ctx.dom itd.
  const cm = new ChatManager(ctx);
  return {
    init() { cm.init(); }
  };
}

// 2e) Przycisk czyszczenia cache obrazów (feature moduł)
function ClearImageCacheButtonModule() {
  return {
    init(ctx) {
      const wrapper = document.createElement("div");
      wrapper.className = "mt-20";

      const label = document.createElement("label");
      label.className = "text-sm block mb-5";
      label.textContent = "Pamięć obrazów:";

      const btn = ctx.utils.createButton("🧹 Wyczyść pamięć obrazów", () => {
        let cleared = 0;
        // W niektórych przeglądarkach Object.keys(localStorage) nie iteruje jak oczekujesz; użyj klasycznej pętli:
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("img-exists:")) {
            localStorage.removeItem(key);
            cleared++;
          }
        }
        alert(`Wyczyszczono ${cleared} wpisów z pamięci obrazów.`);
      });

      btn.className = "form-element text-base mt-5 w-full button-base";
      wrapper.append(label, btn);
      ctx.dom.settingSidePanel.appendChild(wrapper);
    }
  };
}


let originalBodyHTML = document.body.innerHTML;
// 3) Start aplikacji
window.addEventListener("load", async () => {
  // a) Dom
  const dom = new Dom();
  dom.init(htmlElements);

  // b) Context – rejestrujesz dokładnie to, czego chcesz użyć (instancje, nie klasy!)
  const context = new Context({
    diagnostics: Diagnostics,
    userManager: UserManager,
    dom,
    utils: Utils,
    backendAPI: BackendAPI,
  });

  // c) Skład modułów (to jest w 100% konfigurowalne per strona)
  const modules = [
    UserManagerModule(),
    VirtualKeyboardDockModule(dom),
    PanelsControllerModule(dom),
    ChatManagerModule(context),       // tylko na stronie czatu
    ClearImageCacheButtonModule(),    // feature
  ];

  // d) App dostaje Context + listę modułów, i tylko je odpala
  const app = new App(context, modules);

  await app.init();
});


// 📦 DiagnosticsTests.js
document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // Diagnostics
  // ============================================================

  Diagnostics.describe("Diagnostics", () => {
    Diagnostics.it("register() dodaje test do listy", () => {
      const originalTests = [...Diagnostics.tests];
      Diagnostics.tests = [];
      Diagnostics.register("test1", () => {});
      Diagnostics.expect(Diagnostics.tests.length).toBe(1);
      Diagnostics.expect(Diagnostics.tests[0].name).toBe("test1");
      Diagnostics.tests = originalTests;
    });

    Diagnostics.it("describe() ustawia grupę dla testów", () => {
      const originalTests = [...Diagnostics.tests];
      Diagnostics.tests = [];
      Diagnostics.describe("GrupaTestowa", () => {
        Diagnostics.it("test w grupie", () => {});
      });
      Diagnostics.expect(Diagnostics.tests[0].group).toBe("GrupaTestowa");
      Diagnostics.tests = originalTests;
    });

    Diagnostics.it("getGroups() zwraca unikalne grupy testowe", () => {
      const originalTests = [...Diagnostics.tests];
      Diagnostics.tests = [];
      Diagnostics.register("a", () => {}, "A");
      Diagnostics.register("b", () => {}, "B");
      Diagnostics.register("c", () => {}, "A");
      const groups = Diagnostics.getGroups();
      Diagnostics.expect(groups.includes("A")).toBeTruthy();
      Diagnostics.expect(groups.includes("B")).toBeTruthy();
      Diagnostics.expect(groups.length).toBe(2);
      Diagnostics.tests = originalTests;
    });

    Diagnostics.it("expect().toBe porównuje wartości", () => {
      Diagnostics.expect(42).toBe(42);
    });

    Diagnostics.it("expect().toBeType sprawdza typ", () => {
      Diagnostics.expect("abc").toBeType("string");
    });

    Diagnostics.it("expect().toInclude sprawdza obecność w tablicy", () => {
      Diagnostics.expect(["a", "b", "c"]).toInclude("b");
    });

    Diagnostics.it("expect().toBeTruthy przechodzi dla wartości true", () => {
      Diagnostics.expect(1).toBeTruthy();
    });

    Diagnostics.it("expect().toBeFalsy przechodzi dla wartości false", () => {
      Diagnostics.expect("").toBeFalsy();
    });

    Diagnostics.it("assertArrayIncludes() rzuca błąd gdy brak elementu", () => {
      let threw = false;
      try {
        Diagnostics.assertArrayIncludes(["x", "y"], "z");
      } catch (e) {
        threw = true;
      }
      Diagnostics.expect(threw).toBe(true);
    });

    Diagnostics.it("assertObjectHasKey() sprawdza obecność klucza", () => {
      Diagnostics.assertObjectHasKey({ foo: 1 }, "foo");
    });

    Diagnostics.it("captureError() zwraca status ❌ dla błędu", async () => {
      const result = await Diagnostics.captureError(() => {
        throw new Error("fail");
      }, "Test błędu");
      Diagnostics.expect(result.status).toBe("❌");
      Diagnostics.expect(result.name).toBe("Test błędu");
      Diagnostics.expect(result.error).toBe("fail");
    });

    Diagnostics.it(
      "captureError() zwraca status ✅ dla poprawnego testu",
      async () => {
        const result = await Diagnostics.captureError(() => {}, "Test OK");
        Diagnostics.expect(result.status).toBe("✅");
        Diagnostics.expect(result.name).toBe("Test OK");
        Diagnostics.expect(result.error).toBe("");
      }
    );

    Diagnostics.it("wait() odczekuje podany czas", async () => {
      const start = Date.now();
      await Diagnostics.wait(100);
      const elapsed = Date.now() - start;
      Diagnostics.expect(elapsed >= 90).toBeTruthy();
    });

    Diagnostics.it("resetEnv() czyści localStorage", () => {
      localStorage.setItem("x", "1");
      Diagnostics.resetEnv();
      Diagnostics.expect(localStorage.getItem("x")).toBe(null);
    });
  });

  // =============================================================
  // Testy LoggerService
  // =============================================================

  Diagnostics.describe("LoggerService", () => {
    Diagnostics.it("getHistory() zwraca aktualny stan bufora", () => {
      LoggerService.clearHistory();
      LoggerService.record("log", "test");
      const hist = LoggerService.getHistory();
      Diagnostics.expect(hist.length).toBe(1);
      Diagnostics.expect(hist[0].msg).toBe("test");
    });

    Diagnostics.it(
      "getHistory({clone:true}) tworzy niezależną kopię wpisów i args",
      () => {
        LoggerService.clearHistory();
        const originalArg = { a: 1 };
        LoggerService.record("error", "Błąd testowy", originalArg);
        const cloned = LoggerService.getHistory(true);
        originalArg.a = 999;
        Diagnostics.expect(cloned[0].args[0].a).toBe(1);
        cloned[0].msg = "Zmieniony";
        const direct = LoggerService.getHistory();
        Diagnostics.expect(direct[0].msg).toBe("Błąd testowy");
      }
    );

    Diagnostics.it("clearHistory() usuwa wpisy niezależnie od poziomu", () => {
      LoggerService.record("warn", "ostrzeżenie");
      LoggerService.record("error", "błąd");
      LoggerService.clearHistory();
      const hist = LoggerService.getHistory();
      Diagnostics.expect(hist.length).toBe(0);
    });

    Diagnostics.it("record() dodaje wpis dla poziomu 'log'", () => {
      LoggerService.clearHistory();
      LoggerService.record("log", "Log testowy", { info: true });
      const hist = LoggerService.getHistory();
      Diagnostics.expect(hist[0].level).toBe("log");
      Diagnostics.expect(hist[0].msg).toBe("Log testowy");
      Diagnostics.expect(hist[0].args[0].info).toBe(true);
    });

    Diagnostics.it("record() dodaje wpis dla poziomu 'warn'", () => {
      LoggerService.clearHistory();
      LoggerService.record("warn", "Ostrzeżenie", { warning: true });
      const hist = LoggerService.getHistory();
      Diagnostics.expect(hist[0].level).toBe("warn");
      Diagnostics.expect(hist[0].msg).toBe("Ostrzeżenie");
      Diagnostics.expect(hist[0].args[0].warning).toBe(true);
    });

    Diagnostics.it("record() dodaje wpis dla poziomu 'error'", () => {
      LoggerService.clearHistory();
      const err = new Error("Błąd testowy");
      LoggerService.record("error", "Przechwycony błąd:", err);
      const hist = LoggerService.getHistory();
      Diagnostics.expect(hist[0].level).toBe("error");
      Diagnostics.expect(hist[0].msg).toBe("Przechwycony błąd:");
      Diagnostics.expect(hist[0].args[0].message).toBe("Błąd testowy");
    });

    Diagnostics.it("recordOnce() działa dla różnych poziomów", () => {
      LoggerService.clearHistory();
      LoggerService.recordOnce("warn", "Powtarzalne ostrzeżenie");
      LoggerService.recordOnce("warn", "Powtarzalne ostrzeżenie");
      LoggerService.recordOnce("error", "Powtarzalny błąd");
      LoggerService.recordOnce("error", "Powtarzalny błąd");
      const hist = LoggerService.getHistory();
      Diagnostics.expect(hist.length).toBe(2);
      Diagnostics.expect(hist[0].level).toBe("warn");
      Diagnostics.expect(hist[1].level).toBe("error");
    });

    Diagnostics.it("filterByLevel() zwraca tylko wpisy danego typu", () => {
      LoggerService.clearHistory();
      LoggerService.record("log", "Log");
      LoggerService.record("warn", "Warn");
      LoggerService.record("error", "Error");
      const errors = LoggerService.filterByLevel("error");
      Diagnostics.expect(errors.length).toBe(1);
      Diagnostics.expect(errors[0].msg).toBe("Error");
    });

    Diagnostics.it(
      "setMaxAge() ustawia limit i cleanup() usuwa stare wpisy",
      () => {
        LoggerService.clearHistory();
        const oldTimestamp = Date.now() - 10000;
        LoggerService.buffer.push({
          timestamp: oldTimestamp,
          level: "log",
          msg: "stary wpis",
          args: [],
        });
        LoggerService.record("log", "nowy wpis");
        LoggerService.setMaxAge(5000); // 5 sekund
        const hist = LoggerService.getHistory();
        Diagnostics.expect(hist.length).toBe(1);
        Diagnostics.expect(hist[0].msg).toBe("nowy wpis");
      }
    );
  });

  Diagnostics.describe("EditValidator", () => {
    Diagnostics.it("validate() odrzuca pusty tekst", () => {
      const { valid, errors } = EditValidator.validate("", []);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.includes("Tekst edycji nie może być pusty.")
      ).toBeTruthy();
    });

    Diagnostics.it("validate() odrzuca tekst z samymi spacjami", () => {
      const { valid, errors } = EditValidator.validate("     ", []);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.includes("Tekst edycji nie może być pusty.")
      ).toBeTruthy();
    });

    Diagnostics.it("validate() odrzuca tekst przekraczający limit", () => {
      const longText = "x".repeat(EditValidator.maxTextLength + 1);
      const { valid, errors } = EditValidator.validate(longText, []);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.some((e) => e.includes("Maksymalna długość"))
      ).toBeTruthy();
    });

    Diagnostics.it("validate() akceptuje poprawny tekst bez tagów", () => {
      const { valid, errors } = EditValidator.validate(
        "To jest poprawny tekst.",
        []
      );
      Diagnostics.expect(valid).toBe(true);
      Diagnostics.expect(errors.length).toBe(0);
    });

    Diagnostics.it("validate() odrzuca tag przekraczający limit", () => {
      const longTag = "y".repeat(EditValidator.maxTagLength + 1);
      const { valid, errors } = EditValidator.validate("Poprawny tekst", [
        longTag,
      ]);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(errors.some((e) => e.includes("Tag"))).toBeTruthy();
    });

    Diagnostics.it("validate() odrzuca zestaw z jednym błędnym tagiem", () => {
      const okTag = "forest";
      const badTag = "z".repeat(EditValidator.maxTagLength + 5);
      const { valid, errors } = EditValidator.validate("Tekst OK", [
        okTag,
        badTag,
      ]);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(errors.length).toBe(1);
    });

    Diagnostics.it(
      "validate() akceptuje tekst i tagi na granicy długości",
      () => {
        const text = "a".repeat(EditValidator.maxTextLength);
        const tag = "b".repeat(EditValidator.maxTagLength);
        const { valid, errors } = EditValidator.validate(text, [tag]);
        Diagnostics.expect(valid).toBe(true);
        Diagnostics.expect(errors.length).toBe(0);
      }
    );

    Diagnostics.it("validate() ignoruje tagi niebędące stringiem", () => {
      const { valid, errors } = EditValidator.validate("Poprawny tekst", [
        null,
        123,
        "ok",
      ]);
      Diagnostics.expect(valid).toBe(true);
      Diagnostics.expect(errors.length).toBe(0);
    });
  });

  // =============================================================
  // Testy PromptValidator
  // =============================================================

  Diagnostics.describe("PromptValidator", () => {
    Diagnostics.it("validate() odrzuca prompt jako liczbę", () => {
      const { valid, errors } = PromptValidator.validate(123);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.includes("Prompt musi być typu string.")
      ).toBeTruthy();
    });

    Diagnostics.it("validate() odrzuca pusty prompt", () => {
      const { valid, errors } = PromptValidator.validate("");
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.includes("Prompt nie może być pusty.")
      ).toBeTruthy();
    });

    Diagnostics.it(
      "validate() odrzuca prompt przekraczający limit długości",
      () => {
        const long = "x".repeat(PromptValidator.maxLength + 1);
        const { valid, errors } = PromptValidator.validate(long);
        Diagnostics.expect(valid).toBe(false);
        Diagnostics.expect(
          errors.some((e) => e.includes("Maksymalna długość"))
        ).toBeTruthy();
      }
    );

    Diagnostics.it("validate() odrzuca prompt z niedozwolonymi znakami", () => {
      const { valid, errors } = PromptValidator.validate("To jest <prompt>");
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.includes("Prompt zawiera niedozwolone znaki: < lub >.")
      ).toBeTruthy();
    });

    Diagnostics.it("validate() akceptuje poprawny prompt", () => {
      const { valid, errors } = PromptValidator.validate(
        "To jest poprawny prompt."
      );
      Diagnostics.expect(valid).toBe(true);
      Diagnostics.expect(errors.length).toBe(0);
    });

    Diagnostics.it("validate() akceptuje prompt na granicy długości", () => {
      const prompt = "a".repeat(PromptValidator.maxLength);
      const { valid, errors } = PromptValidator.validate(prompt);
      Diagnostics.expect(valid).toBe(true);
      Diagnostics.expect(errors.length).toBe(0);
    });

    Diagnostics.it("validate() ignoruje spacje na początku i końcu", () => {
      const prompt = "   Poprawny prompt   ";
      const { valid, errors } = PromptValidator.validate(prompt);
      Diagnostics.expect(valid).toBe(true);
      Diagnostics.expect(errors.length).toBe(0);
    });

    Diagnostics.it("validate() odrzuca prompt z samymi spacjami", () => {
      const prompt = "     ";
      const { valid, errors } = PromptValidator.validate(prompt);
      Diagnostics.expect(valid).toBe(false);
      Diagnostics.expect(
        errors.includes("Prompt nie może być pusty.")
      ).toBeTruthy();
    });
  });

  // =============================================================
  // Testy SenderRegistry
  // =============================================================

  Diagnostics.describe("SenderRegistry", () => {
    Diagnostics.it("getClass() przypisuje klasę CSS nowemu nadawcy", () => {
      SenderRegistry.reset();
      const cls = SenderRegistry.getClass("Alice");
      Diagnostics.expect(typeof cls).toBeType("string");
      Diagnostics.expect(cls.startsWith("sender-color-")).toBeTruthy();
    });

    Diagnostics.it(
      "getClass() zwraca tę samą klasę dla tego samego nadawcy",
      () => {
        SenderRegistry.reset();
        const first = SenderRegistry.getClass("Bob");
        const second = SenderRegistry.getClass("Bob");
        Diagnostics.expect(first).toBe(second);
      }
    );

    Diagnostics.it(
      "getClass() rotuje indeks po przekroczeniu długości palety",
      () => {
        SenderRegistry.reset();
        const paletteLength = SenderRegistry.getPalette().length;
        for (let i = 0; i < paletteLength; i++) {
          SenderRegistry.getClass("User" + i);
        }
        const rotated = SenderRegistry.getClass("ExtraUser");
        Diagnostics.expect(rotated).toBe(SenderRegistry.getPalette()[0]);
      }
    );

    Diagnostics.it(
      "getClass() zwraca domyślną klasę dla nieprawidłowego nadawcy",
      () => {
        const cls1 = SenderRegistry.getClass(null);
        const cls2 = SenderRegistry.getClass(123);
        Diagnostics.expect(cls1).toBe("sender-color-default");
        Diagnostics.expect(cls2).toBe("sender-color-default");
      }
    );

    Diagnostics.it("reset() czyści rejestr i licznik", () => {
      SenderRegistry.getClass("Charlie");
      SenderRegistry.reset();
      Diagnostics.expect(SenderRegistry.hasSender("Charlie")).toBeFalsy();
      Diagnostics.expect(SenderRegistry.getSenderIndex("Charlie")).toBe(
        undefined
      );
    });

    Diagnostics.it(
      "hasSender() zwraca true dla zarejestrowanego nadawcy",
      () => {
        SenderRegistry.reset();
        SenderRegistry.getClass("Dana");
        Diagnostics.expect(SenderRegistry.hasSender("Dana")).toBe(true);
      }
    );

    Diagnostics.it("getSenderIndex() zwraca poprawny indeks", () => {
      SenderRegistry.reset();
      const expectedIndex = SenderRegistry.nextIndex; // powinno być 0 po resecie
      SenderRegistry.getClass("Eve");
      const idx = SenderRegistry.getSenderIndex("Eve");
      Diagnostics.expect(idx).toBeType("number");
      Diagnostics.expect(idx).toBe(expectedIndex);
    });

    Diagnostics.it("getPalette() zwraca kopię palety", () => {
      const palette = SenderRegistry.getPalette();
      Diagnostics.expect(Array.isArray(palette)).toBe(true);
      Diagnostics.expect(palette.length).toBe(SenderRegistry.palette.length);
    });

    Diagnostics.it("setPalette() nadpisuje paletę i resetuje rejestr", () => {
      SenderRegistry.reset();
      const newPalette = ["x1", "x2", "x3"];
      SenderRegistry.getClass("Frank");
      SenderRegistry.setPalette(newPalette);
      const cls = SenderRegistry.getClass("Frank");
      Diagnostics.expect(SenderRegistry.getPalette()).toInclude("x1");
      Diagnostics.expect(cls).toBe("x1");
    });

    Diagnostics.it(
      "setPalette() ignoruje pustą lub niepoprawną wartość",
      () => {
        const original = SenderRegistry.getPalette();
        SenderRegistry.setPalette([]);
        Diagnostics.expect(SenderRegistry.getPalette().length).toBe(
          original.length
        );

        SenderRegistry.setPalette(null);
        Diagnostics.expect(SenderRegistry.getPalette().length).toBe(
          original.length
        );
      }
    );
  });

  // =============================================================
  // Testy Utils
  // =============================================================

  Diagnostics.describe("Utils", () => {
    Diagnostics.it("clamp() ogranicza wartość do zakresu", () => {
      Diagnostics.expect(Utils.clamp(5, 1, 10)).toBe(5);
      Diagnostics.expect(Utils.clamp(-5, 0, 100)).toBe(0);
      Diagnostics.expect(Utils.clamp(150, 0, 100)).toBe(100);
    });

    Diagnostics.it("formatDate() zwraca poprawny format HH:MM:SS", () => {
      const date = new Date("2025-09-15T12:34:56");
      const formatted = Utils.formatDate(date);
      Diagnostics.expect(typeof formatted).toBe("string");
      Diagnostics.expect(formatted.includes(":")).toBeTruthy();
    });

    Diagnostics.it("randomId() generuje niepusty string", () => {
      const id = Utils.randomId();
      Diagnostics.expect(typeof id).toBe("string");
      Diagnostics.expect(id.length).toBeGreaterThan(0);
    });

    Diagnostics.it("throttle() ogranicza wywołania funkcji", async () => {
      let count = 0;
      const throttled = Utils.throttle(() => count++, 100);
      throttled();
      throttled();
      throttled();
      await Diagnostics.wait(150);
      throttled();
      Diagnostics.expect(count).toBe(2);
    });

    Diagnostics.it("debounce() opóźnia wywołanie funkcji", async () => {
      let count = 0;
      const debounced = Utils.debounce(() => count++, 100);
      debounced();
      debounced();
      debounced();
      await Diagnostics.wait(150);
      Diagnostics.expect(count).toBe(1);
    });

    Diagnostics.it(
      "safeQuery() zwraca null dla nieistniejącego selektora",
      () => {
        const el = Utils.safeQuery("#nie-istnieje");
        Diagnostics.expect(el).toBe(null);
      }
    );

    Diagnostics.it(
      "createButton() tworzy przycisk z tekstem i handlerem",
      () => {
        let clicked = false;
        const btn = Utils.createButton("Kliknij mnie", () => (clicked = true));
        Diagnostics.expect(btn.tagName).toBe("BUTTON");
        Diagnostics.expect(btn.textContent).toBe("Kliknij mnie");
        btn.click();
        Diagnostics.expect(clicked).toBe(true);
      }
    );

    Diagnostics.it("isMobile() zwraca boolean", () => {
      const result = Utils.isMobile();
      Diagnostics.expect(typeof result).toBe("boolean");
    });
  });

  // =============================================================
  // Testy ImageResolver
  // =============================================================

  Diagnostics.describe("ImageResolver", () => {
    Diagnostics.it(
      "resolve() zwraca pustą tablicę dla pustych tagów",
      async () => {
        const result = await ImageResolver.resolve([]);
        Diagnostics.expect(Array.isArray(result)).toBe(true);
        Diagnostics.expect(result.length).toBe(0);
      }
    );

    Diagnostics.it("resolve() generuje poprawne URL-e dla tagów", async () => {
      const urls = await ImageResolver.resolve(["forest", "night"], {
        maxResults: 10,
      });
      Diagnostics.expect(Array.isArray(urls)).toBe(true);
      Diagnostics.expect(urls.every((u) => typeof u === "string")).toBeTruthy();
    });

    Diagnostics.it(
      "resolveBest() zwraca pojedynczy URL lub pusty string",
      async () => {
        const url = await ImageResolver.resolveBest(["magic", "castle"]);
        Diagnostics.expect(typeof url).toBe("string");
      }
    );

    Diagnostics.it("preload() tworzy niewidoczny obraz", () => {
      const url = "/static/NarrativeIMG/test.jpg";
      ImageResolver.preload(url);
      const imgs = [...document.querySelectorAll("img")].filter((i) =>
        i.src.includes("test.jpg")
      );
      Diagnostics.expect(imgs.length > 0).toBeTruthy();
      Diagnostics.expect(imgs[0].style.display).toBe("none");
    });

    Diagnostics.it("clearCache() usuwa wpisy z AppStorageManager", () => {
      const key = ImageResolver.cachePrefix + "dummy.jpg";
      AppStorageManager.set(key, { exists: true, ts: Date.now() });
      ImageResolver.clearCache();
      const value = AppStorageManager.get(key);
      Diagnostics.expect(value === undefined || value === null).toBe(true);
    });

    Diagnostics.it("_combinations() generuje poprawne podzbiory", () => {
      const comb = ImageResolver._combinations(["a", "b", "c"], 2);
      Diagnostics.expect(Array.isArray(comb)).toBe(true);
      Diagnostics.expect(comb.length).toBe(3); // ab, ac, bc
    });

    Diagnostics.it("_permutations() generuje poprawne permutacje", () => {
      const perms = ImageResolver._permutations(["x", "y"]);
      Diagnostics.expect(perms.length).toBe(2); // xy, yx
      Diagnostics.expect(perms.some((p) => p.join("_") === "x_y")).toBeTruthy();
    });
  });

  // =============================================================
  // Testy GalleryLoader
  // =============================================================

  Diagnostics.describe("GalleryLoader", () => {
    Diagnostics.it("constructor() ustawia kontener i galerię", () => {
      const wrapper = document.createElement("div");
      const gallery = document.createElement("div");
      gallery.id = "image-gallery";
      wrapper.appendChild(gallery);

      const loader = new GalleryLoader(wrapper);
      Diagnostics.expect(loader.container).toBe(wrapper);
      Diagnostics.expect(loader.gallery).toBe(gallery);
    });

    Diagnostics.it(
      "setContainer() ustawia galerię jako #image-gallery lub fallback",
      () => {
        const div = document.createElement("div");
        const inner = document.createElement("div");
        inner.id = "image-gallery";
        div.appendChild(inner);

        const loader = new GalleryLoader();
        loader.setContainer(div);
        Diagnostics.expect(loader.gallery).toBe(inner);
      }
    );

    Diagnostics.it("clearGallery() usuwa zawartość galerii", () => {
      const gallery = document.createElement("div");
      gallery.id = "image-gallery";
      gallery.innerHTML = "<p>Test</p>";
      const loader = new GalleryLoader(gallery);
      loader.clearGallery();
      Diagnostics.expect(gallery.innerHTML).toBe("");
    });

    Diagnostics.it("showMessage() wyświetla komunikat", () => {
      const gallery = document.createElement("div");
      gallery.id = "image-gallery";
      const loader = new GalleryLoader(gallery);
      loader.showMessage("Brak wyników");
      const msg = gallery.querySelector(".gallery-message");
      Diagnostics.expect(msg.textContent).toBe("Brak wyników");
    });

    Diagnostics.it("renderImages() tworzy poprawne elementy", () => {
      const gallery = document.createElement("div");
      gallery.id = "image-gallery";
      const loader = new GalleryLoader(gallery);
      loader.renderImages(["/a.jpg", "/b.jpg"]);
      const labels = gallery.querySelectorAll(".image-option");
      Diagnostics.expect(labels.length).toBe(2);
      const radios = gallery.querySelectorAll('input[type="radio"]');
      Diagnostics.expect(radios.length).toBe(2);
    });

    Diagnostics.it("highlightSelected() zaznacza pasujący obraz", async () => {
      const originalResolveBest = ImageResolver.resolveBest;
      try {
        const gallery = document.createElement("div");
        gallery.id = "image-gallery";
        const loader = new GalleryLoader(gallery);
        loader.renderImages(["/static/NarrativeIMG/forest_night.jpg"]);

        ImageResolver.resolveBest = async () =>
          "/static/NarrativeIMG/forest_night.jpg";

        await loader.highlightSelected(["forest", "night"]);
        const selected = gallery.querySelector(".selected");
        Diagnostics.expect(selected).toBeTruthy();
        const checked = selected.querySelector('input[type="radio"]')?.checked;
        Diagnostics.expect(checked).toBe(true);
      } finally {
        ImageResolver.resolveBest = originalResolveBest;
      }
    });

    Diagnostics.it("loadFromAPI() renderuje obrazy z API", async () => {
      const originalFetch = window.fetch;
      try {
        const gallery = document.createElement("div");
        gallery.id = "image-gallery";
        const loader = new GalleryLoader(gallery);

        window.fetch = async () => ({
          ok: true,
          json: async () => ["/x.jpg", "/y.jpg"],
        });

        await loader.loadFromAPI("/mock-endpoint");
        const imgs = gallery.querySelectorAll("img");
        Diagnostics.expect(imgs.length).toBe(2);
      } finally {
        window.fetch = originalFetch;
      }
    });

    Diagnostics.it("_highlight() zaznacza wybrany obraz", () => {
      const gallery = document.createElement("div");
      gallery.id = "image-gallery";
      const loader = new GalleryLoader(gallery);

      const label1 = document.createElement("label");
      label1.className = "image-option";
      const radio1 = document.createElement("input");
      radio1.type = "radio";
      label1.appendChild(radio1);
      gallery.appendChild(label1);

      const label2 = document.createElement("label");
      label2.className = "image-option";
      const radio2 = document.createElement("input");
      radio2.type = "radio";
      label2.appendChild(radio2);
      gallery.appendChild(label2);

      loader._highlight(label2);
      Diagnostics.expect(label2.classList.contains("selected")).toBe(true);
      Diagnostics.expect(radio2.checked).toBe(true);
      Diagnostics.expect(label1.classList.contains("selected")).toBe(false);
      Diagnostics.expect(radio1.checked).toBe(false);
    });
  });

  // =============================================================
  // Testy TagsPanel - tryb desktop
  // =============================================================

  Diagnostics.describe("TagsPanel (desktop)", () => {
    Diagnostics.it("constructor() tworzy pola i galerię", () => {
      const container = document.createElement("div");
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const panel = new TagsPanel(container);

      Diagnostics.expect(panel.container).toBe(container);
      Diagnostics.expect(panel.gallery instanceof HTMLElement).toBe(true);
      Diagnostics.expect(Object.keys(panel.fields).length).toBeGreaterThan(0);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it("q() zwraca element z kontenera", () => {
      const container = document.createElement("div");
      const input = document.createElement("input");
      input.id = "tag-location";
      container.appendChild(input);
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const panel = new TagsPanel(container);
      const result = panel.q("#tag-location");
      Diagnostics.expect(result).toBe(input);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "getSelectedTagsObject() zwraca obiekt z wartościami pól",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;
        const panel = new TagsPanel(container);
        Object.values(panel.fields).forEach((f) => (f.value = "test"));
        const tags = panel.getSelectedTagsObject();
        Diagnostics.expect(typeof tags).toBe("object");
        Diagnostics.expect(Object.values(tags).every((v) => v === "test")).toBe(
          true
        );
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it("getTagList() filtruje puste wartości", () => {
      const container = document.createElement("div");
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const panel = new TagsPanel(container);
      panel.fields.location.value = "forest";
      panel.fields.character.value = "";
      const list = panel.getTagList();
      Diagnostics.expect(list).toInclude("forest");
      Diagnostics.expect(list.includes("")).toBe(false);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it("clearTags() czyści pola i synchronizuje galerię", () => {
      const container = document.createElement("div");
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const panel = new TagsPanel(container);
      Object.values(panel.fields).forEach((f) => (f.value = "x"));
      panel.clearTags();
      const tags = panel.getTagList();
      Diagnostics.expect(tags.length).toBe(0);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "setTagOptions() przebudowuje pola na podstawie backendu",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;
        const panel = new TagsPanel(container);
        const options = {
          "tag-location": ["forest", "desert"],
          "tag-emotion": ["joy", "anger"],
        };
        panel.setTagOptions(options);
        Diagnostics.expect(Object.keys(panel.fields)).toInclude("location");
        Diagnostics.expect(Object.keys(panel.fields)).toInclude("emotion");
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "applyDefaultsFromDataTags() ustawia wartości z data-tags",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;
        const panel = new TagsPanel(container);
        const options = {
          "tag-location": ["cave", "castle"],
          "tag-nsfw": ["kiss", "touch"],
        };
        panel.setTagOptions(options);
        panel.applyDefaultsFromDataTags("cave_kiss", options);
        Diagnostics.expect(panel.fields.location.value).toBe("cave");
        Diagnostics.expect(panel.fields.nsfw.value).toBe("kiss");
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it("init() wywołuje onChange i debounce", async () => {
      const container = document.createElement("div");
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const panel = new TagsPanel(container);
      let called = false;
      panel.init(() => (called = true));
      panel.fields.location.value = "castle";
      panel.fields.location.dispatchEvent(new Event("input"));
      await Diagnostics.wait(350);
      Diagnostics.expect(called).toBe(true);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "notifyTagsChanged() wywołuje onTagsChanged i renderuje galerię",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;
        const panel = new TagsPanel(container);
        let received = null;
        panel.onTagsChanged = (tags) => (received = tags);
        panel.fields.location.value = "forest";
        panel.notifyTagsChanged();
        Diagnostics.expect(received).toInclude("forest");
        Utils.isMobile = originalIsMobile;
      }
    );
  });

  // ==========================================================
  // Testy TagsPanel - tryb mobilny
  // ==========================================================

  // =============================================================
  // Testy TagsPanel – tryb mobilny
  // =============================================================

  Diagnostics.describe("TagsPanel (mobile)", () => {
    Diagnostics.it("constructor()  (mobile)  tworzy pola i galerię", () => {
      const container = document.createElement("div");
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => true;
      const panel = new TagsPanel(container);

      Diagnostics.expect(panel.container).toBe(container);
      Diagnostics.expect(panel.gallery instanceof HTMLElement).toBe(true);
      Diagnostics.expect(Object.keys(panel.fields).length).toBeGreaterThan(0);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it("q()  (mobile)  zwraca element z kontenera", () => {
      const container = document.createElement("div");
      const select = document.createElement("select");
      select.id = "tag-location";
      container.appendChild(select);
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => true;
      const panel = new TagsPanel(container);
      const result = panel.q("#tag-location");
      Diagnostics.expect(result).toBe(select);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "getSelectedTagsObject()  (mobile)  zwraca obiekt z wartościami pól",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;

        const panel = new TagsPanel(container);

        // Zbuduj mapę oczekiwanych wartości zależnie od typu kontrolki
        const expected = {};
        for (const [name, el] of Object.entries(panel.fields)) {
          if (!el) continue;

          if (el.tagName === "SELECT") {
            // Ustaw pierwszą sensowną opcję (pomijamy pustą)
            const firstOpt = el.querySelector('option[value]:not([value=""])');
            if (firstOpt) {
              el.value = firstOpt.value;
              expected[name] = firstOpt.value;
            } else {
              // fallback: jeśli jakimś cudem brak opcji, zostaw pustą
              el.value = "";
              expected[name] = "";
            }
            // Zasymuluj zmianę (nie jest konieczne dla tego testu, ale bezpieczne)
            el.dispatchEvent(new Event("change"));
          } else {
            // input
            el.value = "test";
            expected[name] = "test";
            el.dispatchEvent(new Event("input"));
          }
        }

        const tags = panel.getSelectedTagsObject();

        // Każde pole powinno zgadzać się z tym, co ustawiliśmy
        const allMatch = Object.entries(expected).every(
          ([k, v]) => tags[k] === v
        );
        Diagnostics.expect(allMatch).toBe(true);

        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it("getTagList()  (mobile)  filtruje puste wartości", () => {
      const container = document.createElement("div");
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => true;
      const panel = new TagsPanel(container);
      panel.fields.location.value = "forest";
      panel.fields.character.value = "";
      const list = panel.getTagList();
      Diagnostics.expect(list).toInclude("forest");
      Diagnostics.expect(list.includes("")).toBe(false);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "clearTags()  (mobile)  czyści pola i synchronizuje galerię",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;
        const panel = new TagsPanel(container);
        Object.values(panel.fields).forEach((f) => (f.value = "x"));
        panel.clearTags();
        const tags = panel.getTagList();
        Diagnostics.expect(tags.length).toBe(0);
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "setTagOptions()  (mobile)  przebudowuje pola na podstawie backendu",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;
        const panel = new TagsPanel(container);
        const options = {
          "tag-location": ["forest", "desert"],
          "tag-emotion": ["joy", "anger"],
        };
        panel.setTagOptions(options);
        Diagnostics.expect(Object.keys(panel.fields)).toInclude("location");
        Diagnostics.expect(Object.keys(panel.fields)).toInclude("emotion");
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "applyDefaultsFromDataTags()  (mobile)  ustawia wartości z data-tags",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;
        const panel = new TagsPanel(container);
        const options = {
          "tag-location": ["cave", "castle"],
          "tag-nsfw": ["kiss", "touch"],
        };
        panel.setTagOptions(options);
        panel.applyDefaultsFromDataTags("cave_kiss", options);
        Diagnostics.expect(panel.fields.location.value).toBe("cave");
        Diagnostics.expect(panel.fields.nsfw.value).toBe("kiss");
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "init()  (mobile)  wywołuje onChange i debounce",
      async () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;
        const panel = new TagsPanel(container);
        let called = false;
        panel.init(() => (called = true));
        panel.fields.location.value = "castle";
        panel.fields.location.dispatchEvent(new Event("change")); // mobile: select → change
        await Diagnostics.wait(350);
        Diagnostics.expect(called).toBe(true);
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "notifyTagsChanged()  (mobile) wywołuje onTagsChanged i renderuje galerię",
      () => {
        const container = document.createElement("div");
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;
        const panel = new TagsPanel(container);
        let received = null;
        panel.onTagsChanged = (tags) => (received = tags);
        panel.fields.location.value = "forest";
        panel.notifyTagsChanged();
        Diagnostics.expect(received).toInclude("forest");
        Utils.isMobile = originalIsMobile;
      }
    );
  });

  /// =====================================================================
  // Testy Dom
  // =============================================================

  Diagnostics.describe("Dom", () => {
    Diagnostics.it("inicjalizuje root jako <main id='app'>", () => {
      const main = document.createElement("main");
      main.id = "app";
      document.body.insertBefore(main, document.body.firstChild);

      const dom = new Dom();
      dom.init({});
      Diagnostics.expect(dom.root.tagName).toBe("MAIN");
      Diagnostics.expect(dom.root.id).toBe("app");
    });

    Diagnostics.it("odrzuca root jeśli nie jest <main id='app'>", () => {
      const div = document.createElement("div");
      div.id = "app";
      document.body.insertBefore(div, document.body.firstChild);

      const dom = new Dom();
      dom.init({});
      Diagnostics.expect(dom.root).toBe(null);
    });

    Diagnostics.it("przypisuje referencje z refMap", () => {
      const main = document.createElement("main");
      main.id = "app";
      const el = document.createElement("div");
      el.id = "chat-container";
      main.appendChild(el);
      document.body.insertBefore(main, document.body.firstChild);

      const dom = new Dom();
      dom.init({ chatContainer: "#chat-container" });

      Diagnostics.expect(dom.chatContainer).toBe(el);
      Diagnostics.expect(dom.refs.chatContainer).toBe(el);
    });

    Diagnostics.it("obsługuje selector === rootSelector", () => {
      const main = document.createElement("main");
      main.id = "app";
      document.body.insertBefore(main, document.body.firstChild);

      const dom = new Dom();
      dom.init({ root: "#app" });

      Diagnostics.expect(dom.root).toBe(main);
    });

    Diagnostics.it("q() zwraca element wewnątrz root", () => {
      const main = document.createElement("main");
      main.id = "app";
      const el = document.createElement("div");
      el.className = "test-el";
      main.appendChild(el);
      document.body.insertBefore(main, document.body.firstChild);

      const dom = new Dom();
      dom.init({});
      const result = dom.q(".test-el");

      Diagnostics.expect(result).toBe(el);
    });

    Diagnostics.it("qa() zwraca listę elementów wewnątrz root", () => {
      const main = document.createElement("main");
      main.id = "app";
      const el1 = document.createElement("div");
      el1.className = "multi";
      const el2 = document.createElement("div");
      el2.className = "multi";
      main.append(el1, el2);
      document.body.insertBefore(main, document.body.firstChild);

      const dom = new Dom();
      dom.init({});
      const result = dom.qa(".multi");

      Diagnostics.expect(result.length).toBe(2);
      Diagnostics.expect(result[0]).toBe(el1);
      Diagnostics.expect(result[1]).toBe(el2);
    });
  });

  // =============================================================
  // Testy PanelsController
  // =============================================================

  Diagnostics.describe("PanelsController", () => {
    Diagnostics.it(
      "przywraca stan panelu z AppStorageManager na desktopie",
      () => {
        Utils.isMobile = () => false;

        const panel = document.createElement("div");
        panel.id = "setting-side-panel";
        const button = document.createElement("button");

        document.body.append(panel, button);
        AppStorageManager.set("panel:setting-side-panel", true);

        const dom = new Dom();
        dom.root = document.body;

        const ctrl = new PanelsController(
          dom,
          [{ button, panel, id: "setting-side-panel" }],
          ["setting-side-panel"]
        );

        ctrl.init();
        Diagnostics.expect(panel.classList.contains("open")).toBe(true);
      }
    );

    Diagnostics.it("nie przywraca stanu panelu na mobile", () => {
      Utils.isMobile = () => true;

      const panel = document.createElement("div");
      panel.id = "setting-side-panel";
      const button = document.createElement("button");

      document.body.append(panel, button);
      AppStorageManager.set("panel:setting-side-panel", true);

      const dom = new Dom();
      dom.root = document.body;

      const ctrl = new PanelsController(
        dom,
        [{ button, panel, id: "setting-side-panel" }],
        ["setting-side-panel"]
      );

      ctrl.init();
      Diagnostics.expect(panel.classList.contains("open")).toBe(false);
    });

    Diagnostics.it("togglePanel() przełącza widoczność panelu", () => {
      const panel = document.createElement("div");
      panel.id = "web-side-panel";
      const button = document.createElement("button");

      document.body.append(panel, button);

      const dom = new Dom();
      dom.root = document.body;

      const ctrl = new PanelsController(dom, [
        { button, panel, id: "web-side-panel" },
      ]);

      ctrl.init();
      button.click();
      Diagnostics.expect(panel.classList.contains("open")).toBe(true);

      button.click();
      Diagnostics.expect(panel.classList.contains("open")).toBe(false);
    });

    Diagnostics.it("openPanel() zamyka inne panele na mobile", () => {
      Utils.isMobile = () => true;

      const p1 = document.createElement("div");
      p1.id = "panel-1";
      const p2 = document.createElement("div");
      p2.id = "panel-2";
      const b1 = document.createElement("button");
      const b2 = document.createElement("button");

      document.body.append(p1, p2, b1, b2);

      const dom = new Dom();
      dom.root = document.body;

      const ctrl = new PanelsController(dom, [
        { button: b1, panel: p1, id: "panel-1" },
        { button: b2, panel: p2, id: "panel-2" },
      ]);

      ctrl.init();
      b1.click();
      Diagnostics.expect(p1.classList.contains("open")).toBe(true);
      Diagnostics.expect(p2.classList.contains("open")).toBe(false);

      b2.click();
      Diagnostics.expect(p1.classList.contains("open")).toBe(false);
      Diagnostics.expect(p2.classList.contains("open")).toBe(true);
    });

    Diagnostics.it(
      "closePanel() zapisuje false w AppStorageManager na desktopie",
      () => {
        Utils.isMobile = () => false;

        const panel = document.createElement("div");
        panel.id = "setting-side-panel";
        panel.classList.add("open");

        const dom = new Dom();
        dom.root = document.body;

        const ctrl = new PanelsController(
          dom,
          [{ button: null, panel, id: "setting-side-panel" }],
          ["setting-side-panel"]
        );

        ctrl.closePanel(panel);
        const saved = AppStorageManager.get("panel:setting-side-panel");
        Diagnostics.expect(saved.value).toBe(false);
      }
    );

    Diagnostics.it("getOpenPanels() zwraca wszystkie otwarte panele", () => {
      const p1 = document.createElement("div");
      p1.classList.add("open");
      const p2 = document.createElement("div");
      p2.classList.add("open");

      const dom = new Dom();
      dom.root = document.body;

      const ctrl = new PanelsController(dom, [
        { button: null, panel: p1, id: "p1" },
        { button: null, panel: p2, id: "p2" },
      ]);

      const open = ctrl.getOpenPanels();
      Diagnostics.expect(open.length).toBe(2);
      Diagnostics.expect(open.includes(p1)).toBeTruthy();
      Diagnostics.expect(open.includes(p2)).toBeTruthy();
    });

    Diagnostics.it("destroy() usuwa nasłuchiwacze kliknięć", () => {
      const panel = document.createElement("div");
      panel.id = "web-side-panel";
      const button = document.createElement("button");

      document.body.append(panel, button);

      const dom = new Dom();
      dom.root = document.body;

      const ctrl = new PanelsController(dom, [
        { button, panel, id: "web-side-panel" },
      ]);

      ctrl.init();
      ctrl.destroy();

      button.click(); // nie powinno już działać
      Diagnostics.expect(panel.classList.contains("open")).toBe(false);
    });
  });

  // =============================================================
  // Testy UserManager
  // =============================================================

  Diagnostics.describe("UserManager", () => {
    Diagnostics.it("setName() zapisuje imię użytkownika", () => {
      UserManager.setName("Kamil");
      const stored = AppStorageManager.getWithTTL("user_name");
      Diagnostics.expect(stored).toBe("Kamil");
    });

    Diagnostics.it("getName() zwraca zapisane imię", () => {
      AppStorageManager.set("user_name", "Ala");
      const name = UserManager.getName();
      Diagnostics.expect(name).toBe("Ala");
    });

    Diagnostics.it("hasName() zwraca true jeśli imię istnieje", () => {
      AppStorageManager.set("user_name", "Basia");
      Diagnostics.expect(UserManager.hasName()).toBe(true);
    });

    Diagnostics.it("hasName() zwraca false jeśli imię puste", () => {
      AppStorageManager.set("user_name", "   ");
      Diagnostics.expect(UserManager.hasName()).toBe(false);
    });

    Diagnostics.it("clearName() usuwa imię z pamięci", () => {
      AppStorageManager.set("user_name", "Zenek");
      UserManager.clearName();
      Diagnostics.expect(AppStorageManager.get("user_name")).toBe(null);
    });

    Diagnostics.it("getStorageType() zwraca typ pamięci", () => {
      const type = UserManager.getStorageType();
      Diagnostics.expect(["localStorage", "cookie"]).toInclude(type);
    });

    Diagnostics.it("init() podłącza input i zapisuje zmiany", () => {
      const input = document.createElement("input");
      input.id = "user_name";
      document.body.insertBefore(input, document.body.firstChild);

      AppStorageManager.set("user_name", "Ola");

      const dom = new Dom();
      dom.root = document.body;

      UserManager.init(dom);
      Diagnostics.expect(input.value).toBe("Ola");

      input.value = "Zosia";
      input.dispatchEvent(new Event("input"));
      Diagnostics.expect(AppStorageManager.get("user_name").value).toBe(
        "Zosia"
      );
    });

    Diagnostics.it("replacePlaceholders() podmienia {{user}} na imię", () => {
      AppStorageManager.set("user_name", "Kamil");
      const result = UserManager.replacePlaceholders("Witaj, {{user}}!");
      Diagnostics.expect(result).toBe("Witaj, Kamil!");
    });

    Diagnostics.it(
      "replacePlaceholders() używa domyślnego imienia jeśli brak",
      () => {
        AppStorageManager.remove("user_name");
        const result = UserManager.replacePlaceholders("Cześć, {{user}}!");
        Diagnostics.expect(result).toBe("Cześć, Użytkowniku!");
      }
    );

    Diagnostics.it("replacePlaceholders() obsługuje dodatkowe mapy", () => {
      AppStorageManager.set("user_name", "Kamil");
      const result = UserManager.replacePlaceholders(
        "{{user}}, masz {{count}} wiadomości.",
        {
          count: "5",
        }
      );
      Diagnostics.expect(result).toBe("Kamil, masz 5 wiadomości.");
    });
  });

  // =============================================================
  // Testy AppStorageManager
  // =============================================================

  Diagnostics.describe("AppStorageManager", () => {
    Diagnostics.it(
      "set() zapisuje dane z TTL i getWithTTL() je odczytuje",
      () => {
        AppStorageManager.set("test:ttl", "ABC", 1); // 1 sekunda
        const value = AppStorageManager.getWithTTL("test:ttl");
        Diagnostics.expect(value).toBe("ABC");
      }
    );

    Diagnostics.it("getWithTTL() usuwa dane po wygaśnięciu TTL", async () => {
      AppStorageManager.set("test:expired", "XYZ", 1); // 1 sekunda
      await Diagnostics.wait(1100); // poczekaj aż wygaśnie
      const value = AppStorageManager.getWithTTL("test:expired");
      Diagnostics.expect(value).toBe(null);
    });

    Diagnostics.it("get() odczytuje dane bez TTL", () => {
      AppStorageManager.set("test:plain", { foo: "bar" });
      Diagnostics.expect(AppStorageManager.get("test:plain").value.foo).toBe(
        "bar"
      );
    });

    Diagnostics.it("remove() usuwa dane", () => {
      AppStorageManager.set("test:remove", "DEL");
      AppStorageManager.remove("test:remove");
      const value = AppStorageManager.get("test:remove");
      Diagnostics.expect(value).toBe(null);
    });

    Diagnostics.it("keys() zwraca zapisane klucze", () => {
      AppStorageManager.set("test:key1", "A");
      AppStorageManager.set("test:key2", "B");
      const keys = AppStorageManager.keys();
      Diagnostics.expect(keys.includes("test:key1")).toBeTruthy();
      Diagnostics.expect(keys.includes("test:key2")).toBeTruthy();
    });

    Diagnostics.it("purgeByPrefix() usuwa wpisy z prefiksem", () => {
      AppStorageManager.set("img-exists:1", true);
      AppStorageManager.set("img-exists:2", true);
      AppStorageManager.set("other:1", true);
      AppStorageManager.purgeByPrefix("img-exists:");
      Diagnostics.expect(AppStorageManager.get("img-exists:1")).toBe(null);
      Diagnostics.expect(AppStorageManager.get("img-exists:2")).toBe(null);
      Diagnostics.expect(AppStorageManager.get("other:1").value).toBe(true);
    });

    Diagnostics.it("type() zwraca poprawny typ pamięci", () => {
      const type = AppStorageManager.type();
      Diagnostics.expect(["localStorage", "cookie"]).toInclude(type);
    });

    Diagnostics.it("fallback na cookie działa przy braku localStorage", () => {
      const original = AppStorageManager._hasLocalStorage;
      AppStorageManager._hasLocalStorage = () => false;

      AppStorageManager.set("cookie:test", "ciasteczko", 60);
      const value = AppStorageManager.get("cookie:test");
      Diagnostics.expect(value.value).toBe("ciasteczko");

      AppStorageManager._hasLocalStorage = original;
    });

    Diagnostics.it("get() odczytuje dane z cookie", () => {
      const original = AppStorageManager._hasLocalStorage;
      AppStorageManager._hasLocalStorage = () => false;

      AppStorageManager.set("cookie:manual", "ciastko", 60);
      const value = AppStorageManager.get("cookie:manual");
      Diagnostics.expect(value.value).toBe("ciastko");

      AppStorageManager._hasLocalStorage = original;
    });

    Diagnostics.it("🧹 reset środowiska po testach", () => {
      Diagnostics.resetEnv();
      Diagnostics.expect(AppStorageManager.keys().length).toBe(0);
    });
  });

  // =============================================================
  // Testy BackendAPI
  // =============================================================

  Diagnostics.describe("BackendAPI", () => {
    Diagnostics.it("setBaseURL() ustawia poprawny adres względny", () => {
      BackendAPI.setBaseURL("/");
      Diagnostics.expect(BackendAPI.baseURL).toBe("");
      const full = BackendAPI._url("/generate");
      Diagnostics.expect(full).toBe("/generate");
    });

    Diagnostics.it("setAuthToken() ustawia token", () => {
      BackendAPI.setAuthToken("abc123");
      Diagnostics.expect(BackendAPI.authToken).toBe("abc123");
    });

    Diagnostics.it("_url() składa pełny adres", () => {
      BackendAPI.setBaseURL("/");
      const full = BackendAPI._url("/generate");
      Diagnostics.expect(full).toBe("/generate");
    });

    Diagnostics.it("_headers() zawiera Content-Type i Authorization", () => {
      BackendAPI.setAuthToken("xyz");
      const headers = BackendAPI._headers();
      Diagnostics.expect(headers["Content-Type"]).toBe("application/json");
      Diagnostics.expect(headers["Authorization"]).toBe("Bearer xyz");
    });

    Diagnostics.it("generate() wysyła poprawne dane", async () => {
      const original = RequestRetryManager.fetchWithRetry;
      try {
        RequestRetryManager.fetchWithRetry = async (url, init) => {
          Diagnostics.expect(url.endsWith("/generate")).toBeTruthy();
          const body = JSON.parse(init.body);
          Diagnostics.expect(body.prompt).toBe("Hello world");
          return { ok: true, json: async () => ({ reply: "Hi!" }) };
        };
        const res = await BackendAPI.generate("Hello world");
        Diagnostics.expect(res.reply).toBe("Hi!");
      } finally {
        RequestRetryManager.fetchWithRetry = original;
      }
    });

    Diagnostics.it("rate() przesyła oceny", async () => {
      const original = RequestRetryManager.fetchWithRetry;
      try {
        RequestRetryManager.fetchWithRetry = async (url, init) => {
          Diagnostics.expect(url.endsWith("/rate")).toBeTruthy();
          const body = JSON.parse(init.body);
          Diagnostics.expect(body.score).toBe(5);
          return { ok: true, json: async () => ({ status: "ok" }) };
        };
        const res = await BackendAPI.rate({ score: 5 });
        Diagnostics.expect(res.status).toBe("ok");
      } finally {
        RequestRetryManager.fetchWithRetry = original;
      }
    });

    Diagnostics.it("edit() przesyła edytowaną treść i tagi", async () => {
      const original = RequestRetryManager.fetchWithRetry;
      try {
        RequestRetryManager.fetchWithRetry = async (url, init) => {
          const body = JSON.parse(init.body);
          Diagnostics.expect(body.editedText).toBe("Poprawiona treść");
          Diagnostics.expect(body.tags.topic).toBe("AI");
          Diagnostics.expect(body.sessionId).toBe("sess1");
          Diagnostics.expect(body.msgId).toBe("msg42");
          return { ok: true, json: async () => ({ edited: true }) };
        };
        const res = await BackendAPI.edit(
          "Poprawiona treść",
          { topic: "AI" },
          "sess1",
          "msg42"
        );
        Diagnostics.expect(res.edited).toBe(true);
      } finally {
        RequestRetryManager.fetchWithRetry = original;
      }
    });

    Diagnostics.it("postMessage() przesyła wiadomość", async () => {
      const original = RequestRetryManager.fetchWithRetry;
      try {
        RequestRetryManager.fetchWithRetry = async (url, init) => {
          const body = JSON.parse(init.body);
          Diagnostics.expect(body.sender).toBe("Kamil");
          Diagnostics.expect(body.text).toBe("Cześć!");
          return { ok: true, json: async () => ({ received: true }) };
        };
        const res = await BackendAPI.postMessage({
          sender: "Kamil",
          text: "Cześć!",
        });
        Diagnostics.expect(res.received).toBe(true);
      } finally {
        RequestRetryManager.fetchWithRetry = original;
      }
    });

    Diagnostics.it("getTags() pobiera dane z /tags", async () => {
      const original = RequestRetryManager.fetchWithRetry;
      try {
        RequestRetryManager.fetchWithRetry = async (url, init) => {
          Diagnostics.expect(url.endsWith("/tags")).toBeTruthy();
          return { ok: true, json: async () => ({ tags: ["ai", "code"] }) };
        };
        const res = await BackendAPI.getTags();
        Diagnostics.expect(res.tags.includes("ai")).toBeTruthy();
      } finally {
        RequestRetryManager.fetchWithRetry = original;
      }
    });

    Diagnostics.it("_safeJson() zwraca pusty obiekt przy błędzie", async () => {
      const fakeRes = {
        json: async () => {
          throw new Error("fail");
        },
      };
      const result = await BackendAPI._safeJson(fakeRes);
      Diagnostics.expect(typeof result).toBe("object");
    });

    Diagnostics.it("_safeText() zwraca pusty string przy błędzie", async () => {
      const fakeRes = {
        text: async () => {
          throw new Error("fail");
        },
      };
      const result = await BackendAPI._safeText(fakeRes);
      Diagnostics.expect(result).toBe("");
    });
  });

  // =============================================================
  // Testy ChatManager
  // =============================================================

  Diagnostics.describe("ChatManager", () => {
    const promptText = "Jak działa silnik rakietowy?";
    const editedText = "Silnik rakietowy działa na zasadzie reakcji gazów.";
    const tags = ["fizyka", "technologia"];

    Diagnostics.it(
      "sendPrompt() dodaje wiadomość użytkownika i renderuje odpowiedź AI",
      async () => {
        const dom = new Dom();
        dom.init(htmlElements);

        const context = new Context({ dom });
        const manager = new ChatManager(context);
        manager.init();

        await manager.sendPrompt(promptText);

        const messages = dom.chatContainer.querySelectorAll(".message.ai");
        Diagnostics.expect(messages.length).toBeGreaterThan(0);

        const last = messages[messages.length - 1];
        const textEl = last.querySelector(".msg-text p");
        Diagnostics.expect(textEl?.textContent.length).toBeGreaterThan(0);
      }
    );

    Diagnostics.it("sendEdit() aktualizuje wiadomość AI", async () => {
      const dom = new Dom();
      dom.init(htmlElements);

      const context = new Context({ dom });
      const manager = new ChatManager(context);
      manager.init();

      await manager.sendPrompt("Wiadomość testowa użytkownika");
      const msgEl = dom.chatContainer.querySelector(".message.ai");

      await manager.sendEdit(
        msgEl,
        editedText,
        tags,
        "/static/NarrativeIMG/Avatars/Lytha.png",
        msgEl.dataset.sessionId
      );

      const textEl = msgEl.querySelector(".msg-text p");
      Diagnostics.expect(textEl?.classList.contains("edited")).toBeTruthy();
    });

    Diagnostics.it("sendRating() przesyła ocenę wiadomości", async () => {
      const dom = new Dom();
      dom.init(htmlElements);

      const context = new Context({ dom });
      const manager = new ChatManager(context);
      manager.init();

      await manager.sendPrompt(promptText);
      const msgEl = dom.chatContainer.querySelector(".message.ai");

      const payload = {
        messageId: msgEl.dataset.msgId,
        sessionId: msgEl.dataset.sessionId,
        ratings: { trafność: 5, styl: 4 },
      };

      await manager.sendRating(payload);

      Diagnostics.expect(true).toBeTruthy();
    });

    Diagnostics.it("init() aktywuje widoki i podpina zdarzenia", () => {
      const dom = new Dom();
      dom.init(htmlElements);

      const context = new Context({ dom });
      const manager = new ChatManager(context);
      manager.init();

      Diagnostics.expect(typeof manager.chatView.onPromptSubmit).toBe(
        "function"
      );
      Diagnostics.expect(typeof manager.editView.onEditSubmit).toBe("function");
    });
  });

  // =============================================================
  // Testy ChatEditView
  // =============================================================

  Diagnostics.describe("ChatEditView", () => {
    Diagnostics.it(
      "enableEdit() renderuje formularz edycji z textarea i panelami",
      async () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.tags = "forest_night";
        msgEl.innerHTML = "<p>Oryginalny tekst</p>";

        const view = new ChatEditView({});
        await view.enableEdit(msgEl, "Oryginalny tekst", "msg1", "sess1");

        const textarea = msgEl.querySelector("textarea");
        Diagnostics.expect(textarea.value).toBe("Oryginalny tekst");

        const tagPanel = msgEl.querySelector(".tag-panel");
        Diagnostics.expect(tagPanel).toBeTruthy();

        const saveBtn = [...msgEl.querySelectorAll("button")].find((b) =>
          b.textContent.includes("Zapisz")
        );
        Diagnostics.expect(saveBtn).toBeTruthy();

        const cancelBtn = [...msgEl.querySelectorAll("button")].find((b) =>
          b.textContent.includes("Anuluj")
        );
        Diagnostics.expect(cancelBtn).toBeTruthy();
      }
    );

    Diagnostics.it(
      "kliknięcie Anuluj wywołuje onEditCancel z poprawnymi danymi",
      async () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.msgId = "125";
        msgEl.dataset.sessionId = "sess-123";
        msgEl.dataset.tags = "forest_night";
        msgEl.dataset.timestamp = "2025-09-11 16:12:00";
        msgEl.dataset.originalText = "Oryginalny tekst";
        msgEl.dataset.sender = "AI";
        msgEl.dataset.avatarUrl = "/static/NarrativeIMG/Avatars/AI.png";
        msgEl.dataset.generation_time = "20.5";
        msgEl.dataset.imageUrl = "/static/NarrativeIMG/forest.jpeg";

        const view = new ChatEditView({});
        let cancelData = null;
        view.onEditCancel = (el, data) => {
          cancelData = data;
        };

        await view.enableEdit(msgEl, "Oryginalny tekst", "msg1", "sess1");

        const cancelBtn = [...msgEl.querySelectorAll("button")].find((b) =>
          b.textContent.includes("Anuluj")
        );
        cancelBtn.click();

        Diagnostics.expect(cancelData.id).toBe("125");
        Diagnostics.expect(cancelData.tags.includes("forest")).toBeTruthy();
        Diagnostics.expect(cancelData.imageUrl).toBe(
          "/static/NarrativeIMG/forest.jpeg"
        );
      }
    );

    Diagnostics.it(
      "kliknięcie Zapisz wywołuje onEditSubmit z poprawnymi argumentami",
      async () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.sessionId = "sess-123";
        msgEl.dataset.tags = "forest_night";

        const view = new ChatEditView({});
        let submitArgs = null;
        view.onEditSubmit = (...args) => {
          submitArgs = args;
        };

        await view.enableEdit(msgEl, "Tekst do edycji", "msg1", "sess-123");

        // Ustaw dane w formularzu
        const textarea = msgEl.querySelector("textarea");
        textarea.value = "Nowy tekst";

        // Symuluj brak wyboru w galerii, żeby wymusić fallback do ImageResolver
        const originalResolve = ImageResolver.resolve;
        try {
          ImageResolver.resolve = async () => ["/mocked/image.jpg"];

          const saveBtn = [...msgEl.querySelectorAll("button")].find((b) =>
            b.textContent.includes("Zapisz")
          );
          await saveBtn.click();

          Diagnostics.expect(submitArgs[1]).toBe("Nowy tekst"); // editedText
          Diagnostics.expect(Array.isArray(submitArgs[2])).toBe(true); // tags
          Diagnostics.expect(submitArgs[3]).toBe("/mocked/image.jpg"); // imageUrl
          Diagnostics.expect(submitArgs[4]).toBe("sess-123"); // sessionId
        } finally {
          ImageResolver.resolve = originalResolve;
        }
      }
    );

    Diagnostics.it(
      "nie wywołuje onEditSubmit przy błędzie walidacji",
      async () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.tags = "forest_night";

        const view = new ChatEditView({});
        let called = false;
        view.onEditSubmit = () => {
          called = true;
        };

        // Mock walidatora, żeby wymusić błąd
        const originalValidate = EditValidator.validate;
        try {
          EditValidator.validate = () => ({ valid: false, errors: ["Błąd"] });

          await view.enableEdit(msgEl, "Tekst", "msg1", "sess1");
          const saveBtn = [...msgEl.querySelectorAll("button")].find((b) =>
            b.textContent.includes("Zapisz")
          );
          await saveBtn.click();

          Diagnostics.expect(called).toBeFalsy();
        } finally {
          EditValidator.validate = originalValidate;
        }
      }
    );
  });

  // =============================================================
  // Testy ChatUIView
  // =============================================================

  Diagnostics.describe("ChatUIView", () => {
Diagnostics.it(
  "init() wywołuje onPromptSubmit po submit formularza",
  async () => {
    const container = document.createElement("div");
    const form = document.createElement("form");
    const input = document.createElement("input");
    form.appendChild(input);

    const view = new ChatUIView(container, form, input);
    let calledPrompt = null;
    view.onPromptSubmit = (t) => {
      calledPrompt = t;
      return true;
    };

    view.init();
    input.value = "Test prompt";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await Promise.resolve(); // pozwól wykonać się async handlerowi

    Diagnostics.expect(calledPrompt).toBe("Test prompt");
    Diagnostics.expect(input.value).toBe("");
  }
);

Diagnostics.it("init() wywołuje onPromptSubmit po Ctrl+Enter", async () => {
  const container = document.createElement("div");
  const form = document.createElement("form");
  const input = document.createElement("textarea");
  form.appendChild(input);

  const view = new ChatUIView(container, form, input);
  let calledPrompt = null;
  view.onPromptSubmit = (t) => {
    calledPrompt = t;
    return true;
  };

  view.init();
  input.value = "CtrlEnter test";
  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      bubbles: true,
    })
  );

  await Promise.resolve();

  Diagnostics.expect(calledPrompt).toBe("CtrlEnter test");
  Diagnostics.expect(input.value).toBe("");
});


    Diagnostics.it("addUserMessage() dodaje wiadomość użytkownika", () => {
      const container = document.createElement("div");
      const view = new ChatUIView(container, null, null);

      view.addUserMessage("Hello AI");
      const msg = container.querySelector(".message.user .message-text");
      Diagnostics.expect(msg.textContent.includes("Hello AI")).toBeTruthy();
    });

    Diagnostics.it(
      "addLoadingMessage() dodaje placeholder i zwraca timer",
      () => {
        const container = document.createElement("div");
        const view = new ChatUIView(container, null, null);

        const { msgEl, timer } = view.addLoadingMessage();
        Diagnostics.expect(msgEl.classList.contains("ai")).toBeTruthy();
        Diagnostics.expect(typeof timer).toBe("number");
        clearInterval(timer);
      }
    );

    Diagnostics.it(
      "hydrateAIMessage() ustawia dataset i renderuje treść",
      () => {
        const container = document.createElement("div");
        const view = new ChatUIView(container, null, null);

        const msgEl = document.createElement("article");
        const data = {
          id: "msg-1",
          sessionId: "sess-1",
          tags: ["forest"],
          timestamp: "2025-09-11 16:12:00",
          originalText: "Oryginalny tekst",
          text: "Tekst AI",
          sender: "AI",
          avatarUrl: "/static/NarrativeIMG/Avatars/AI.png",
          generation_time: 5.5,
          imageUrl: "/static/NarrativeIMG/forest.png",
        };

        let editCalled = false;
        view.onEditRequested = () => {
          editCalled = true;
        };
        let ratingCalled = false;
        view.onRatingSubmit = () => {
          ratingCalled = true;
        };

        view.hydrateAIMessage(msgEl, data);

        Diagnostics.expect(msgEl.dataset.msgId).toBe("msg-1");
        Diagnostics.expect(msgEl.querySelector("p").textContent).toBe(
          "Tekst AI"
        );
        Diagnostics.expect(
          msgEl.querySelector(".msg-text img").src.includes("forest.png")
        ).toBeTruthy();

        // Kliknięcie Edytuj
        msgEl.querySelector(".msg-edit-btn").click();
        Diagnostics.expect(editCalled).toBeTruthy();
      }
    );

    Diagnostics.it("showError() wyświetla komunikat błędu", () => {
      const container = document.createElement("div");
      const view = new ChatUIView(container, null, null);

      const msgEl = document.createElement("div");
      view.showError(msgEl);
      Diagnostics.expect(
        msgEl.textContent.includes("Błąd generowania")
      ).toBeTruthy();
    });

    Diagnostics.it("updateMessage() aktualizuje tekst, tagi i obrazek", () => {
      const container = document.createElement("div");
      const view = new ChatUIView(container, null, null);

      const msgEl = document.createElement("article");
      msgEl.innerHTML = `
      <section class="msg-content">
        <div class="msg-text"><p>Stary tekst</p></div>
      </section>
    `;

      view.updateMessage(msgEl, "Nowy tekst", ["tag1", "tag2"], "/img.jpg");

      Diagnostics.expect(msgEl.querySelector("p").textContent).toBe(
        "Nowy tekst"
      );
      Diagnostics.expect(msgEl.dataset.tags).toBe("tag1_tag2");
      Diagnostics.expect(
        msgEl.querySelector("img").src.includes("/img.jpg")
      ).toBeTruthy();

      // Usunięcie obrazka
      view.updateMessage(msgEl, "Jeszcze inny tekst", ["tag3"], "");
      Diagnostics.expect(msgEl.querySelector("img")).toBeFalsy();
    });
  });

  // =============================================================
  // Testy ChatRatingView
  // =============================================================

  Diagnostics.describe("ChatRatingView", () => {
    Diagnostics.it("renderuje panel ocen z wszystkimi kryteriami", () => {
      const msgEl = document.createElement("article");
      msgEl.dataset.msgId = "msg-1";
      msgEl.dataset.sessionId = "sess-1";

      const view = new ChatRatingView(msgEl);

      const details = msgEl.querySelector("details.rating-form");
      Diagnostics.expect(details).toBeTruthy();

      const rows = details.querySelectorAll(".rating-row");
      Diagnostics.expect(rows.length).toBe(5); // Narracja, Styl, Logika, Jakość, Emocje

      const inputs = details.querySelectorAll('input[type="range"]');
      Diagnostics.expect(inputs.length).toBe(5);
      Diagnostics.expect(
        [...inputs].every((i) => i.value === "3")
      ).toBeTruthy();
    });

    Diagnostics.it(
      "aktualizuje wartość wyświetlaną przy suwaku po zmianie",
      () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.msgId = "msg-2";
        msgEl.dataset.sessionId = "sess-2";

        new ChatRatingView(msgEl);

        const firstInput = msgEl.querySelector('input[name="Narrative"]');
        const valSpan = firstInput.nextElementSibling;

        firstInput.value = "5";
        firstInput.dispatchEvent(new Event("input"));

        Diagnostics.expect(valSpan.textContent).toBe("5");
      }
    );

    Diagnostics.it(
      "kliknięcie 'Wyślij ocenę' wywołuje onSubmit z poprawnym payloadem",
      () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.msgId = "msg-3";
        msgEl.dataset.sessionId = "sess-3";

        let submittedPayload = null;
        new ChatRatingView(msgEl, (payload) => {
          submittedPayload = payload;
        });

        // Zmieniamy wartości suwaków
        msgEl.querySelectorAll('input[type="range"]').forEach((input, idx) => {
          input.value = String(idx + 1); // 1, 2, 3, 4, 5
        });

        const btn = msgEl.querySelector("button");
        btn.click();

        Diagnostics.expect(submittedPayload.messageId).toBe("msg-3");
        Diagnostics.expect(submittedPayload.sessionId).toBe("sess-3");
        Diagnostics.expect(Object.keys(submittedPayload.ratings).length).toBe(
          5
        );
        Diagnostics.expect(submittedPayload.ratings.Narrative).toBe(1);
        Diagnostics.expect(submittedPayload.ratings.Emotions).toBe(5);
      }
    );

    Diagnostics.it(
      "nie renderuje panelu ocen drugi raz dla tej samej wiadomości",
      () => {
        const msgEl = document.createElement("article");
        msgEl.dataset.msgId = "msg-4";
        msgEl.dataset.sessionId = "sess-4";

        new ChatRatingView(msgEl);
        new ChatRatingView(msgEl); // próba ponownego renderu

        const details = msgEl.querySelectorAll("details.rating-form");
        Diagnostics.expect(details.length).toBe(1);
      }
    );
  });

  // =============================================================
  // Testy VirtualKeyboardDock
  // =============================================================

  Diagnostics.describe("VirtualKeyboardDock", () => {
    Diagnostics.it("inicjalizuje się z przekazanym elementem docka", () => {
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const dockEl = document.createElement("div");
      const vkd = new VirtualKeyboardDock(dockEl, true);
      Diagnostics.expect(vkd.dock).toBe(dockEl);
      Diagnostics.expect(vkd.isVisible).toBe(false);
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "show() ustawia dock jako widoczny i aktualizuje pozycję",
      () => {
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;
        const dockEl = document.createElement("div");
        const vkd = new VirtualKeyboardDock(dockEl, true);
        vkd.show();
        Diagnostics.expect(vkd.isVisible).toBe(true);
        Diagnostics.expect(dockEl.style.display).toBe("block");
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it("hide() ustawia dock jako ukryty i resetuje bottom", () => {
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const dockEl = document.createElement("div");
      const vkd = new VirtualKeyboardDock(dockEl, true);
      vkd.show();
      vkd.hide();
      Diagnostics.expect(vkd.isVisible).toBe(false);
      Diagnostics.expect(dockEl.style.display).toBe("none");
      Diagnostics.expect(dockEl.style.bottom).toBe("0px");
      Utils.isMobile = originalIsMobile;
    });

    Diagnostics.it(
      "updatePosition() ustawia bottom przy widocznym docku",
      () => {
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;
        const dockEl = document.createElement("div");
        const vkd = new VirtualKeyboardDock(dockEl, true);
        vkd.isVisible = true;
        const originalVV = window.visualViewport;
        window.visualViewport = { height: window.innerHeight - 50 };
        vkd.updatePosition();
        Diagnostics.expect(dockEl.style.bottom).toBe("50px");
        window.visualViewport = originalVV;
        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it("init() podpina nasłuchy focus/blur i resize", () => {
      const originalIsMobile = Utils.isMobile;
      Utils.isMobile = () => false;
      const dockEl = document.createElement("div");
      const vkd = new VirtualKeyboardDock(dockEl, true);
      vkd.init();

      const input = document.createElement("input");
      document.body.appendChild(input);

      input.dispatchEvent(new Event("focusin", { bubbles: true }));
      Diagnostics.expect(dockEl.style.display).toBe("block");

      input.dispatchEvent(new Event("focusout", { bubbles: true }));
      Diagnostics.expect(dockEl.style.display).toBe("none");
      Utils.isMobile = originalIsMobile;
    });
  });

  // =============================================================
  // Testy TagSelectorFactory - tryb desktop
  // =============================================================

  Diagnostics.describe("TagSelectorFactory (desktop)", () => {
    Diagnostics.it(
      "create() (desktop) tworzy label z inputem i datalistą",
      () => {
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;

        const label = TagSelectorFactory.create("location", [
          "forest",
          "castle",
        ]);
        const input = label.querySelector("input");
        const datalist = label.querySelector("datalist");

        Diagnostics.expect(label.tagName).toBe("LABEL");
        Diagnostics.expect(input).toBeTruthy();
        Diagnostics.expect(datalist).toBeTruthy();
        Diagnostics.expect(datalist.querySelectorAll("option").length).toBe(2);

        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "createTagField() (desktop) tworzy label z inputem i datalistą z id",
      () => {
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => false;

        const label = TagSelectorFactory.createTagField("location", ["forest"]);
        const input = label.querySelector(`#tag-location`);
        const datalist = label.querySelector(`#location-list`);

        Diagnostics.expect(label.classList.contains("tag-field")).toBe(true);
        Diagnostics.expect(input).toBeTruthy();
        Diagnostics.expect(datalist).toBeTruthy();
        Diagnostics.expect(datalist.querySelector("option").value).toBe(
          "forest"
        );

        Utils.isMobile = originalIsMobile;
      }
    );
  });
  // =============================================================
  // Testy TagSelectorFactory - tryb mobile
  // =============================================================

  Diagnostics.describe("TagSelectorFactory (mobile)", () => {
    Diagnostics.it(
      "create() (mobile) tworzy label z selectem i opcjami",
      () => {
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;

        const label = TagSelectorFactory.create("location", [
          "forest",
          "castle",
        ]);
        const select = label.querySelector("select");

        Diagnostics.expect(select).toBeTruthy();
        Diagnostics.expect(select.querySelectorAll("option").length).toBe(2);
        Diagnostics.expect(select.querySelector("option").value).toBe("forest");

        Utils.isMobile = originalIsMobile;
      }
    );

    Diagnostics.it(
      "createTagField() (mobile) tworzy label z selectem i pustą opcją",
      () => {
        const originalIsMobile = Utils.isMobile;
        Utils.isMobile = () => true;

        const label = TagSelectorFactory.createTagField("location", ["forest"]);
        const select = label.querySelector(`#tag-location`);
        const options = select.querySelectorAll("option");

        Diagnostics.expect(label.classList.contains("tag-field")).toBe(true);
        Diagnostics.expect(select).toBeTruthy();
        Diagnostics.expect(options.length).toBe(2); // pusty + forest
        Diagnostics.expect(options[0].value).toBe("");
        Diagnostics.expect(options[1].value).toBe("forest");

        Utils.isMobile = originalIsMobile;
      }
    );
  });

  // =============================================================
  // Testy RequestRetryManager – poprawione mockowanie fetch
  // =============================================================

  Diagnostics.describe("RequestRetryManager", () => {
    Diagnostics.it("isRetryable() zwraca true dla Response 5xx i 429", () => {
      const res500 = new Response(null, { status: 500 });
      const res429 = new Response(null, { status: 429 });
      Diagnostics.expect(RequestRetryManager.isRetryable(res500)).toBe(true);
      Diagnostics.expect(RequestRetryManager.isRetryable(res429)).toBe(true);
    });

    Diagnostics.it(
      "isRetryable() zwraca false dla Response 2xx i 4xx (poza 429)",
      () => {
        const res200 = new Response(null, { status: 200 });
        const res404 = new Response(null, { status: 404 });
        Diagnostics.expect(RequestRetryManager.isRetryable(res200)).toBe(false);
        Diagnostics.expect(RequestRetryManager.isRetryable(res404)).toBe(false);
      }
    );

    Diagnostics.it(
      "isRetryable() zwraca true dla TypeError (błąd sieci)",
      () => {
        const err = new TypeError("Network error");
        Diagnostics.expect(RequestRetryManager.isRetryable(err)).toBe(true);
      }
    );

    Diagnostics.it("isRetryable() zwraca false dla innych błędów", () => {
      const err = new Error("Inny błąd");
      Diagnostics.expect(RequestRetryManager.isRetryable(err)).toBe(false);
    });

    Diagnostics.it(
      "fetchWithRetry() zwraca odpowiedź OK bez retry",
      async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async () => new Response("ok", { status: 200 });

        const res = await RequestRetryManager.fetchWithRetry("/test");
        Diagnostics.expect(res.ok).toBe(true);

        globalThis.fetch = originalFetch;
      }
    );

    Diagnostics.it(
      "fetchWithRetry() ponawia przy błędzie sieciowym i kończy sukcesem",
      async () => {
        Diagnostics.resetEnv();
        await Diagnostics.wait(50); // lub więcej, zależnie od retryDelay

        const originalFetch = globalThis.fetch;
        let calls = 0;
        globalThis.fetch = async () => {
          calls++;
          if (calls < 2) throw new TypeError("Network error");
          return new Response("ok", { status: 200 });
        };

        const res = await RequestRetryManager.fetchWithRetry(
          "/test",
          {},
          1,
          10,
          { jitter: 0 }
        );
        Diagnostics.expect(res.ok).toBe(true);
        Diagnostics.expect(calls).toBe(2);

        globalThis.fetch = originalFetch;
      }
    );

    Diagnostics.it(
      "fetchWithRetry() ponawia przy 5xx i kończy sukcesem",
      async () => {
        const originalFetch = globalThis.fetch;
        let calls = 0;
        globalThis.fetch = async () => {
          calls++;
          if (calls < 2) return new Response(null, { status: 500 });
          return new Response("ok", { status: 200 });
        };

        const res = await RequestRetryManager.fetchWithRetry(
          "/test",
          {},
          3,
          10,
          { jitter: 0 }
        );
        Diagnostics.expect(res.ok).toBe(true);
        Diagnostics.expect(calls).toBe(2);

        globalThis.fetch = originalFetch;
      }
    );

    Diagnostics.it(
      "fetchWithRetry() wywołuje onRetry przy ponowieniu",
      async () => {
        const originalFetch = globalThis.fetch;
        let first = true;
        globalThis.fetch = async () => {
          if (first) {
            first = false;
            throw new TypeError("Network error");
          }
          return new Response("ok", { status: 200 });
        };

        let onRetryCalled = false;
        const res = await RequestRetryManager.fetchWithRetry(
          "/test",
          {},
          3,
          10,
          {
            jitter: 0,
            onRetry: (info) => {
              onRetryCalled = true;
              Diagnostics.expect(info.attempt).toBe(1);
              Diagnostics.expect(info.retries).toBe(3);
              Diagnostics.expect(info.delay).toBeGreaterThanOrEqual(0);
              Diagnostics.expect(info.reason).toBeInstanceOf(TypeError);
            },
          }
        );

        Diagnostics.expect(res.ok).toBe(true);
        Diagnostics.expect(onRetryCalled).toBe(true);

        globalThis.fetch = originalFetch;
      }
    );

    Diagnostics.it(
      "fetchWithRetry() przerywa po przekroczeniu maxTotalTime",
      async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async () => {
          throw new TypeError("Network error");
        };

        let threw = false;
        try {
          await RequestRetryManager.fetchWithRetry("/test", {}, 5, 1000, {
            jitter: 0,
            maxTotalTime: 10, // bardzo niski limit
          });
        } catch {
          threw = true;
        }
        Diagnostics.expect(threw).toBe(true);

        globalThis.fetch = originalFetch;
      }
    );

    Diagnostics.it(
      "fetchWithRetry() przerywa po wyczerpaniu retry",
      async () => {
        const originalFetch = globalThis.fetch;
        let calls = 0;
        globalThis.fetch = async () => {
          calls++;
          throw new TypeError("Network error");
        };

        let threw = false;
        try {
          await RequestRetryManager.fetchWithRetry("/test", {}, 2, 10, {
            jitter: 0,
          });
        } catch {
          threw = true;
        }
        Diagnostics.expect(threw).toBe(true);
        Diagnostics.expect(calls).toBe(3); // 1 próba + 2 retry

        globalThis.fetch = originalFetch;
      }
    );
  });

  // =============================================================
  // Testy Context
  // =============================================================
  Diagnostics.describe("Context", () => {
    Diagnostics.it("pozwala rejestrować i pobierać zależności", () => {
      const ctx = new Context();
      const dummy = { foo: "bar" };
      ctx.register("dummyService", dummy);
      Diagnostics.expect(ctx.get("dummyService")).toBe(dummy);
    });

    Diagnostics.it("zwraca zależności przez gettery", () => {
      const fakeDom = {};
      const fakeUtils = {};
      const fakeUserManager = {};
      const fakeDiagnostics = {};
      const fakeBackendAPI = {};

      const ctx = new Context({
        dom: fakeDom,
        utils: fakeUtils,
        userManager: fakeUserManager,
        diagnostics: fakeDiagnostics,
        backendAPI: fakeBackendAPI,
      });

      Diagnostics.expect(ctx.dom).toBe(fakeDom);
      Diagnostics.expect(ctx.utils).toBe(fakeUtils);
      Diagnostics.expect(ctx.userManager).toBe(fakeUserManager);
      Diagnostics.expect(ctx.diagnostics).toBe(fakeDiagnostics);
      Diagnostics.expect(ctx.backendAPI).toBe(fakeBackendAPI);
    });
  });

  // =============================================================
  // Testy App – wersja z flags + await na App.init()
  // =============================================================
  Diagnostics.describe("App", () => {
    Diagnostics.it(
      "wywołuje init na wszystkich modułach i dodaje przycisk czyszczenia cache",
      async () => {
        const flags = {
          vkInit: false,
          pcInit: false,
          cmInit: false,
          umInit: false,
        };

        const fakeDom = { settingSidePanel: document.createElement("div") };
        const fakeUtils = {
          createButton: (label, onClick) => {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.addEventListener("click", onClick);
            return btn;
          },
        };

        const ctx = new Context({
          dom: fakeDom,
          utils: fakeUtils,
          userManager: {
            init: () => {
              flags.umInit = true;
            },
          },
        });

        // Moduły (mogą być synchroniczne; App.init i tak obsługuje Promise)
        const vkModule = {
          init: () => {
            flags.vkInit = true;
          },
        };
        const pcModule = {
          init: () => {
            flags.pcInit = true;
          },
        };
        const cmModule = {
          init: () => {
            flags.cmInit = true;
          },
        };
        const umModule = {
          init: () => {
            ctx.userManager.init();
          },
        };
        const clearBtnModule = {
          init: () => {
            const btn = ctx.utils.createButton(
              "🧹 Wyczyść pamięć obrazów",
              () => {}
            );
            ctx.dom.settingSidePanel.appendChild(btn);
          },
        };

        const app = new App(ctx, [
          vkModule,
          pcModule,
          cmModule,
          umModule,
          clearBtnModule,
        ]);

        // KLUCZ: czekamy aż App skończy odpalać moduły
        await app.init();

        Diagnostics.expect(flags.vkInit).toBe(true);
        Diagnostics.expect(flags.pcInit).toBe(true);
        Diagnostics.expect(flags.cmInit).toBe(true);
        Diagnostics.expect(flags.umInit).toBe(true);

        const btn = fakeDom.settingSidePanel.querySelector("button");
        Diagnostics.expect(btn).toBeTruthy();
        Diagnostics.expect(
          btn.textContent.includes("Wyczyść pamięć obrazów")
        ).toBeTruthy();
      }
    );

    Diagnostics.it("moduł tagów ustawia callback i tworzy moduły", async () => {
      const fakeDom = {};
      const ctx = new Context({ dom: fakeDom, utils: {} });

      let callbackSet = false;
      const tagsModule = {
        init: () => {
          const fakeTagsPanel = {
            init: (cb) => {
              callbackSet = typeof cb === "function";
            },
          };
          const fakeGalleryLoader = {};
          ctx.tagsPanel = fakeTagsPanel;
          ctx.galleryLoader = fakeGalleryLoader;
          fakeTagsPanel.init(() => {});
        },
      };

      const app = new App(ctx, [tagsModule]);
      await app.init();

      Diagnostics.expect(callbackSet).toBe(true);
      Diagnostics.expect(ctx.tagsPanel).toBeTruthy();
      Diagnostics.expect(ctx.galleryLoader).toBeTruthy();
    });
  });
});

