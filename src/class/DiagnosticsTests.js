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
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );

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
