# 📦 KeyboardManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `KeyboardManager` dba o widoczność pola `#input-area` nad klawiaturą ekranową
- ✅ Obsługuje `visualViewport`, `scroll`, `resize` i workaround dla Firefoksa
- ✅ Możliwość dodania metod: `destroy()`, `setTarget()`, `isKeyboardVisible()`, `debug()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

KeyboardManager
===============
Klasa odpowiedzialna za zarządzanie pozycjonowaniem interfejsu w momencie pojawienia się klawiatury ekranowej.
Jej głównym celem jest zapewnienie, że pole wprowadzania wiadomości (`#input-area`) pozostaje widoczne nad klawiaturą,
szczególnie na urządzeniach mobilnych i w przeglądarkach takich jak Firefox, które wymagają dodatkowego fixu.

Zależności:
- `Dom`: klasa dostarczająca referencje do elementów DOM, w tym `inputArea`.
- `visualViewport`: API przeglądarki służące do wykrywania zmian w widocznej części viewportu.
- `navigator.userAgent`: używany do wykrycia przeglądarki Firefox i zastosowania odpowiedniego workaroundu.
/
/**
KeyboardManager
===============
Zarządza pozycją pola `#input-area` względem klawiatury ekranowej.
- Obsługuje `visualViewport` API
- Wykrywa Firefoksa i stosuje fix
- Integruje się z klasą `Dom`

---
## 🧬 Konstruktor

/**
Tworzy instancję KeyboardManager.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
/

```js
constructor(domInstance) {
/** @type {Dom} Referencje do elementów DOM */
    this.dom = domInstance;

    /** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
    this.isFirefox = /firefox/i.test(navigator.userAgent);
}
```

---
## 🔧 Metody

### `init()`


### `updatePosition()`

Aktualizuje pozycję pola `input-area` nad klawiaturą.


---
## 🔗 Zależności

- `Dom`
- `KeyboardManager`
- `LoggerService`