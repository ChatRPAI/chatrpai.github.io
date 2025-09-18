# Context

Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług oraz
zapewnia wygodne gettery do najczęściej używanych komponentów.
- ✅ Dozwolone:
  - Rejestracja instancji usług i komponentów (np. Dom, Utils, UserManager)
  - Pobieranie zależności po nazwie lub przez getter
  - Dynamiczne dodawanie nowych zależności w trakcie działania
- ❌ Niedozwolone:
  - Tworzenie instancji usług na sztywno (to robi warstwa inicjalizacyjna)
  - Logika biznesowa lub UI
  - Operacje sieciowe

---

## constructor

Tworzy nowy kontekst z początkowym zestawem usług.

**_@param_** *`{Record<string, any>}`* _**services**_  mapa nazw → instancji

```javascript
  constructor(services = {}) {
    /** @private @type {Map<string, any>} */
    this._registry = new Map(Object.entries(services));
  }
```

---

## register()

    this._registry = new Map(Object.entries(services));
  }

  /**
Rejestruje nową lub nadpisuje istniejącą zależność.

**_@param_** *`{string}`* _**name**_  unikalna nazwa zależności

**_@param_** *`{any}`* _**instance**_  instancja lub obiekt usługi

```javascript
  register(name, instance) {
    this._registry.set(name, instance);
  }
```

---

## get()

Pobiera zarejestrowaną zależność po nazwie.

**_@param_** *`{string}`* _**name**_  nazwa zależności

**@returns** *`{any}`*  - instancja lub undefined

```javascript
  get(name) {
    return this._registry.get(name);
  }
```

---

## Pełny kod klasy

```javascript
class Context {
  constructor(services = {}) {
    this._registry = new Map(Object.entries(services));
  }

  register(name, instance) {
    this._registry.set(name, instance);
  }

  get(name) {
    return this._registry.get(name);
  }

  get dom() {
    return this.get("dom");
  }
  get utils() {
    return this.get("utils");
  }
  get userManager() {
    return this.get("userManager");
  }
  get diagnostics() {
    return this.get("diagnostics");
  }
  get backendAPI() {
    return this.get("backendAPI");
  }
}
```