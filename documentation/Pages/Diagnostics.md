# Diagnostics

Diagnostics.runAll();         // wszystko, grupy rozwinięte
Diagnostics.runEachGroup();   // każda grupa osobno
Diagnostics.runGroup("Utils"); // tylko grupa "Utils"
Diagnostics.runSummary();     // tylko zbiorcze podsumowanie
Diagnostics.getGroups();      // ["Utils", "BackendAPI", "ChatManager", ...]

---

## expect()

Fluent API do asercji w testach.
Przykład użycia:
```
Diagnostics.expect(value).toBe(expected);
Diagnostics.expect(value).toBeType("string");
Diagnostics.expect(array).toInclude(item);
Diagnostics.expect(value).toBeTruthy();
Diagnostics.expect(value).toBeFalsy();
Diagnostics.expect(value).toBeGreaterThan(min);
```

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
    ChatManagerModule(context),       // tylko na stronie czatu
    ClearImageCacheButtonModule(),    // feature
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