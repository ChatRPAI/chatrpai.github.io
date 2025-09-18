# Diagnostics

Służy do definiowania, uruchamiania i raportowania testów jednostkowych
w aplikacji. Obsługuje grupowanie testów, asercje, tryb wizualny oraz raportowanie wyników
w konsoli.
Przykłady użycia:
- Diagnostics.runAll();           // uruchamia wszystkie testy
- Diagnostics.runEachGroup();     // uruchamia każdą grupę osobno
- Diagnostics.runGroup("Utils");  // uruchamia tylko grupę "Utils"
- Diagnostics.runSummary();       // pokazuje zbiorcze podsumowanie
- Diagnostics.getGroups();        // zwraca listę nazw grup

---

Blokada wielokrotnego uruchomienia testów.

**@type** *`{boolean}`*

```javascript
  static onlyOneRun = false; // Blokada wielokrotnego uruchomienia
```

---

Lista zarejestrowanych testów.

**@type** *`{Array<{ name: string, fn: Function, group: string }`*

```javascript
  static tests = [];
```

---

Aktualnie aktywna grupa testowa.

**@type** *`{string}`*

```javascript
  static currentGroup = "default";
```

---

## describe()

Definiuje grupę testów.

**_@param_** *`{string}`* _**groupName**_  Nazwa grupy

**_@param_** *`{Function}`* _**fn**_  Funkcja zawierająca testy

```javascript
  static describe(groupName, fn) {
    this.currentGroup = groupName;
    fn();
    this.currentGroup = "default";
  }
```

---

## it()

Rejestruje pojedynczy test w bieżącej grupie.

**_@param_** *`{string}`* _**name**_  Nazwa testu

**_@param_** *`{Function}`* _**fn**_  Funkcja testowa

```javascript
  static it(name, fn) {
    this.register(name, fn, this.currentGroup);
  }
```

---

## expect()

Fluent API do asercji w testach.
Przykład użycia:
- Diagnostics.expect(value).toBe(expected);
- Diagnostics.expect(value).toBeType("string");
- Diagnostics.expect(array).toInclude(item);
- Diagnostics.expect(value).toBeTruthy();
- Diagnostics.expect(value).toBeFalsy();
- Diagnostics.expect(value).toBeGreaterThan(min);

**_@param_** *`{*}`* _**value**_  Wartość do testowania

**@returns** *`{object}`*  - Obiekt z metodami asercji

```javascript
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
```

---

## assertArrayIncludes()

Sprawdza, czy tablica zawiera daną wartość.
@throws {Error} Jeśli tablica nie zawiera wartości

**_@param_** *`{Array}`* _**arr**_  Tablica

**_@param_** *`{*}`* _**val**_  Wartość oczekiwana

```javascript
  static assertArrayIncludes(arr, val) {
    if (!Array.isArray(arr)) throw new Error("Wartość nie jest tablicą");
    if (!arr.includes(val)) throw new Error(`Tablica nie zawiera: ${val}`);
  }
```

---

## assertObjectHasKey()

Sprawdza, czy obiekt zawiera dany klucz.
@throws {Error} Jeśli klucz nie istnieje

**_@param_** *`{object}`* _**obj**_  Obiekt

**_@param_** *`{string}`* _**key**_  Klucz

```javascript
  static assertObjectHasKey(obj, key) {
    if (typeof obj !== "object" || obj === null)
      throw new Error("Wartość nie jest obiektem");
    if (!(key in obj)) throw new Error(`Brak klucza: ${key}`);
  }
```

---

## register()

Rejestruje test w systemie.
@param {string} [group="default"] - Nazwa grupy

**_@param_** *`{string}`* _**name**_  Nazwa testu

**_@param_** *`{Function}`* _**fn**_  Funkcja testowa

```javascript
  static register(name, fn, group = "default") {
    this.tests.push({ name, fn, group });
  }
```

---

## getGroups()

Zwraca listę unikalnych nazw grup testowych.

**@returns** *`{string[]}`*  Lista nazw grup

```javascript
  static getGroups() {
    return [...new Set(this.tests.map((t) => t.group))];
  }
```

---

## testsMode()

Pokazuje tryb testowy na stronie (overlay).
@param {boolean} [isStarted=true] - Czy testy są aktywne

```javascript
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
```

---

Przechowuje wyniki testów pogrupowane według grup.

**@type** *`{Record<string, Array<{ name: string, status: string, error: string }`*

```javascript
  static grouped = {};
```

---

## showResultsAll()

Pokazuje wyniki wszystkich testów w konsoli.

```javascript
  static showResultsAll() {
    if (Object.keys(this.grouped).length === 0) {
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
```

---

## renderConsoleTableTestResults()

Renderuje tabelę wyników testów w konsoli.

**_@param_** *`{Array<{ name: string, status: string, error: string }>}`* _**results**_

```javascript
  static renderConsoleTableTestResults(results) {
    console.table(
      results.map((r) => ({
        Status: r.status,
        Test: r.name,
        Błąd: r.error || "—",
      }))
    );
  }
```

---

## runAll()

Uruchamia wszystkie grupy testów.

**@returns** *`{Promise<void>}`*

```javascript
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
          ChatManagerModule(context), // tylko na stronie czatu
          ClearImageCacheButtonModule(), // feature
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
```

---

## summary()

Pokazuje podsumowanie wyników testów.

```javascript
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
```

---

## runGroup()

Uruchamia testy tylko dla wybranej grupy.

**_@param_** *`{string}`* _**groupName**_  Nazwa grupy

**@returns** *`{Promise<void>}`*

```javascript
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
```

---

## captureError()

Przechwytuje błąd z testu i zwraca wynik.

**_@param_** *`{Function}`* _**fn**_  Funkcja testowa

**_@param_** *`{string}`* _**name**_  Nazwa testu

**@returns** *`{Promise<{ status: string, name: string, error: string }`*  >}

```javascript
  static async captureError(fn, name) {
    try {
      await fn();
      return { status: "✅", name, error: "" };
    } catch (e) {
      return { status: "❌", name, error: e.message || String(e) };
    }
  }
```

---

## assertEqual()

Sprawdza równość dwóch wartości.
@throws {Error} Jeśli wartości są różne

**_@param_** *`{*}`* _**a**_

**_@param_** *`{*}`* _**b**_

```javascript
  static assertEqual(a, b) {
    if (a !== b) throw new Error(`Oczekiwano ${b}, otrzymano ${a}`);
  }
```

---

## assertType()

Sprawdza typ wartości.
@throws {Error} Jeśli typ jest niezgodny

**_@param_** *`{*}`* _**value**_

**_@param_** *`{string}`* _**type**_

```javascript
  static assertType(value, type) {
    if (typeof value !== type)
      throw new Error(`Typ ${typeof value}, oczekiwano ${type}`);
  }
```

---

## wait()

Zwraca promisa, który rozwiązuje się po zadanym czasie.

**_@param_** *`{number}`* _**ms**_  Czas w milisekundach

**@returns** *`{Promise<void>}`*

```javascript
  static wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
```

---

## resetEnv()

Czyści środowisko testowe (localStorage, cookies).

```javascript
  static resetEnv() {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
```

---

## filterFailed()

Filtruje tylko nieudane testy.

**@returns** *`{Record<string, Array<{ name: string, status: string, error: string }`*  >>}

```javascript
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
```

---

## showFailedAll()

Pokazuje tylko nieudane testy w konsoli.

```javascript
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
```

---

## Pełny kod klasy

```javascript

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

        const context = new Context({
          diagnostics: Diagnostics,
          userManager: UserManager,
          dom,
          utils: Utils,
          backendAPI: BackendAPI,
        });

        const modules = [
          UserManagerModule(),
          VirtualKeyboardDockModule(dom),
          PanelsControllerModule(dom),
          ChatManagerModule(context), // tylko na stronie czatu
          ClearImageCacheButtonModule(), // feature
        ];

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
```