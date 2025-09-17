# 🚀 Moduł startowy: `chat`


# 📦 Context

FEEDBACK KAMILA (11.09.2025)
=============================
- ✅ Gettery, settery i dynamiczna rejestracja zależności → wdrażamy
- ❌ Separacja kontekstu na moduły → zbędna
- ✅ Przeniesienie metod do odpowiednich klas → po testach
• `addClearImageCacheButton()` → docelowo do `PanelsController`
• `initTagModules()` → docelowo do `TagsPanel` lub `TagManager`
- ✅ Cykle życia aplikacji (init/destroy) → wdrożone
- ❌ Obsługa błędów inicjalizacji → pominięta (testy konstruktorów)
- ✅ Rejestracja eventów jako osobna klasa → zaplanowane
- ✅ Tryb debug zawsze aktywny

Context
=======
Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.

---
## 🧬 Konstruktor

/**
FEEDBACK KAMILA (11.09.2025)
=============================
- ✅ Gettery, settery i dynamiczna rejestracja zależności → wdrażamy
- ❌ Separacja kontekstu na moduły → zbędna
- ✅ Przeniesienie metod do odpowiednich klas → po testach
• `addClearImageCacheButton()` → docelowo do `PanelsController`
• `initTagModules()` → docelowo do `TagsPanel` lub `TagManager`
- ✅ Cykle życia aplikacji (init/destroy) → wdrożone
- ❌ Obsługa błędów inicjalizacji → pominięta (testy konstruktorów)
- ✅ Rejestracja eventów jako osobna klasa → zaplanowane
- ✅ Tryb debug zawsze aktywny
Context
=======
Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.
/

```js
constructor() {
this._registry = new Map();
    this.register("logger", LoggerService);
    this.register("diagnostics", Diagnostics);
    this.register("userManager", UserManager);
    this.register("dom", new Dom());
    this.register("utils", Utils);
    this.register("backendAPI", new BackendAPI());
}
```

# 📦 App

App
===
Fasada aplikacji:
- inicjalizuje moduły (klawiatura, panele, edycja, UI, manager czatu),
- rejestruje zdarzenia globalne (submit, Ctrl+Enter),
- zarządza cyklem życia (init, destroy),
- udostępnia metodę addClearImageCacheButton do wyczyszczenia cache obrazów.

---
## 🧬 Konstruktor

/**
⚙️ *@param {Context} context*
/

```js
constructor(context) {
this.ctx = context;
    this.keyboardManager  = new KeyboardManager(this.ctx.dom);
    this.panelsController = new PanelsController(this.ctx.dom);
    this.editManager      = new EditManager(this.ctx.dom, this.ctx.backendAPI, this.ctx.logger);
    this.chatUI           = new ChatUI(this.ctx.dom, this.editManager);
    this.chatManager      = new ChatManager(this.chatUI, this.ctx.backendAPI, this.ctx.dom);
}
```

---
## 🔧 Metody

### `addClearImageCacheButton()`

Dodaje przycisk do panelu ustawień umożliwiający wyczyszczenie pamięci obrazów.


### `initTagModules()`

Inicjalizuje moduły tagów i galerię obrazów.


### `init()`

Uruchamia aplikację:
- klawiatura, panele, userManager,
- rejestruje submit i Ctrl+Enter,
- dodaje clear-image-button.


### `destroy()`

Zatrzymuje aplikację i czyści zasoby.
(rejestrowane wywołania, timery, event listeners itp.)



```js

const context = new Context();
const app     = new App(context);
app.init();

```