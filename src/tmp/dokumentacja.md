# 📦 BackendAPI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
- ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
- ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
- ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony

BackendAPI
==========
Warstwa komunikacji z backendem:
- Obsługuje generowanie odpowiedzi, ocenianie i edycję
- Wykorzystuje `fetch` z metodą POST i JSON


---
## 🔧 Metody

### `generate(prompt)`

Wysyła prompt użytkownika do backendu.


### `rate(ratings)`

Przesyła oceny odpowiedzi AI.


### `edit(editedText, tags)`

Przesyła edytowaną odpowiedź z tagami.


### `postMessage({ sender, text })`

Przesyła wiadomość użytkownika do backendu.


### `getTags()`

Pobiera słownik tagów z backendu.


---
## 🔗 Zależności

- `BackendAPI`
- `RequestRetryManager`

---

# 📦 ChatHistoryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatHistoryManager` buforuje historię czatu i synchronizuje ją z backendem
- ✅ Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- ✅ Wykorzystuje `localStorage` z kontrolą świeżości cache
- ✅ Posiada dobrze wydzielone metody prywatne: `_loadCache()`, `_saveCache()`, `_isCacheFresh()`, `_fetchHistoryFromServer()`
- ✅ Możliwość dodania metod: `clearCache()`, `forceRefresh()`, `getLastMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest przejrzysty i dobrze rozdzielony

ChatHistoryManager
==================
Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
- Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- Chroni przed nadmiernym ruchem sieciowym


---
## 🔧 Metody

### `_loadCache()`

Inicjalizuje sesję czatu.

**Parametry:**
- `sessionId` (`string`): Identyfikator sesji z backendu.

### `_saveCache()`

Zapisuje historię do localStorage.


### `_isCacheFresh()`

Sprawdza, czy cache jest świeży.


---
## 🔗 Zależności

- `ChatHistoryManager`

---

# 📦 ChatManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
- ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
- ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
- ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony

ChatManager
===========
Centralny kontroler logiki czatu:
- Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
- Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy

---
## 🧬 Konstruktor

/**
Tworzy instancję ChatManager.
⚙️ *@param {ChatUI}* - Interfejs czatu.
⚙️ *@param {BackendAPI}* - Komunikacja z backendem.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
/

```js
constructor(chatUI, backendAPI, dom) {
this.chatUI = chatUI;
    this.backendAPI = backendAPI;
    this.dom = dom;
}
```

---
## 🔧 Metody

### `sendPrompt()`

Wysyła prompt użytkownika i obsługuje odpowiedź AI.


---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `LoggerService`

---

# 📦 ChatUI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
- ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
- ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
- ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny

ChatUI
======
Kontroler interfejsu czatu:
- Renderuje wiadomości użytkownika i AI
- Obsługuje edycję, ocenę, błędy, ładowanie
- Waliduje prompt i przewija widok

---
## 🧬 Konstruktor

/**
Tworzy instancję ChatUI.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
⚙️ *@param {EditManager}* - Manager edycji wiadomości.
⚙️ *@param {BackendAPI}* - Interfejs komunikacji z backendem.
/

```js
constructor(domInstance, editManager, backendAPI) {
this.dom = domInstance;
    this.editManager = editManager;
    this.backendAPI = backendAPI;
    this.attachPromptLengthWatcher();
}
```

---
## 🔧 Metody

### `addUserMessage(text, id)`

Dodaje wiadomość użytkownika do czatu.


### `attachPromptLengthWatcher()`

Obserwuje długość promptu i aktywuje walidację.


### `addAIMessage({ id, sender, text, tags, duration, avatarUrl, timestamp })`

Dodaje wiadomość AI z avatarami, tagami i przyciskiem edycji.


### `_createBase(type, text, id, tags = [], duration = 0)`

Tworzy bazowy wrapper wiadomości.


### `addLoadingMessage()`

Dodaje wiadomość tymczasową z animacją ładowania.


### `showError(msgEl)`

Wyświetla komunikat błędu w wiadomości AI.


### `addRatingForm(msgEl)`

Dodaje przycisk edycji do wiadomości.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.


### `hydrateAIMessage(msgEl, data)`

Hydratuje wiadomość AI i dodaje formularz oceny.


---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `EditManager`
- `PromptValidator`
- `RatingForm`
- `SenderRegistry`
- `UserManager`
- `Utils`

---

# 📦 Diagnostics


---
## 🔧 Metody

### `wait(ms)`

Zwraca Promise, który rozwiązuje się po określonym czasie.
Przydatne do testów asynchronicznych.

**Parametry:**
- `ms` (`number`): Liczba milisekund do odczekania.

---
## 🔗 Zależności

- `Diagnostics`

---

# 📦 Dom

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `Dom` centralizuje dostęp do elementów interfejsu
- ✅ Ułatwia testowanie, refaktoryzację i spójność struktury HTML
- ✅ Obsługuje walidację i logowanie braków przez `LoggerService`
- ✅ Możliwość dodania metod: `exists()`, `refresh()`, `getAll()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
- 💡 Należy ją przeanalizować pod kątem działania na różnych strukturach HTML/DOM w których nie musi być zawarte nigdy np.: "#chat-container"

Dom
===
Centralny rejestr elementów interfejsu:
- Pobiera i przechowuje referencje do komponentów UI
- Obsługuje walidację i logowanie braków

---
## 🧬 Konstruktor

/**
Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.
/

```js
constructor() {
/** @type {HTMLElement} Główny wrapper aplikacji */
    this.app = this.q("#app");

    /** @type {HTMLElement} Kontener historii czatu */
    this.chatWrapper = this.q("#chat-wrapper");

    /** @type {HTMLElement} Scrollowalny obszar wiadomości */
    this.chatContainer = this.q("#chat-container");

    /** @type {HTMLFormElement} Formularz wysyłania wiadomości */
    this.inputArea = this.q("#input-area");

    /** @type {HTMLTextAreaElement} Pole tekstowe wiadomości */
    this.prompt = this.q("#prompt");

    /** @type {HTMLButtonElement} Przycisk otwierający panel nawigacyjny */
    this.burgerToggle = this.q("#burger-toggle");

    /** @type {HTMLElement} Panel boczny z linkami */
    this.webSidePanel = this.q("#web-side-panel");

    /** @type {HTMLButtonElement} Przycisk otwierający panel ustawień */
    this.settingsToggle = this.q("#settings-toggle");

    /** @type {HTMLElement} Panel boczny z ustawieniami */
    this.settingSidePanel = this.q("#setting-side-panel");

    /** @type {HTMLTemplateElement} Szablon panelu tagów */
    this.tagPanelTemplate = this.q("#tag-panel-template");
}
```

---
## 🔧 Metody

### `q(selector)`


### `qa(selector)`

Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.

---
## 🔗 Zależności

- `Dom`
- `LoggerService`

---

# 📦 EditManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditManager` obsługuje pełny proces edycji wiadomości AI w interfejsie czatu
- ✅ Integruje się z `Dom`, `BackendAPI`, `LoggerService`, `GalleryLoader`, `TagsPanel`, `EditValidator`, `Utils`
- ✅ Obsługuje tryb edycji, walidację, zapis, anulowanie i renderowanie wiadomości
- ✅ Możliwość dodania metod: `disableEdit()`, `setSessionId()`, `validateBeforeSubmit()`
- ⚠️ Mapowanie tagów na kategorie powinno być oparte o dane JSON z backendu (np. `tag-location`, `tag-character`, ...)
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony

EditManager
===========
Kontroler procesu edycji wiadomości AI:
- Renderuje edytor, tagi, galerię
- Waliduje dane i wysyła do backendu
- Renderuje zaktualizowaną wiadomość

---
## 🧬 Konstruktor

/**
Tworzy instancję EditManager.
⚙️ *@param {Dom}* - Referencje do elementów DOM.
⚙️ *@param {BackendAPI}* - Interfejs komunikacji z backendem.
⚙️ *@param {LoggerService}* - Logger aplikacji.
/

```js
constructor(dom, backendAPI, logger) {
this.dom = dom;
    this.backendAPI = backendAPI;
    this.logger = logger;
}
```

---
## 🔧 Metody

### `enableEdit(msgElement, originalText, messageId, sessionId)`

Włącza tryb edycji dla wiadomości AI.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `originalText` (`string`): Oryginalna treść wiadomości.
- `messageId` (`string`): ID wiadomości.
- `sessionId` (`string`): ID sesji.

### `submitEdit(params)`

Wysyła edytowaną wiadomość do backendu i renderuje ją.

**Parametry:**
- `params` (`Object`): Parametry edycji.

### `getSelectedTags(tagPanel)`

Renderuje wiadomość AI do DOM.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `data` (`Object`): Dane wiadomości.

### `renderImages(tagPanel)`

Renderuje obrazy na podstawie tagów.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.

---
## 🔗 Zależności

- `BackendAPI`
- `Dom`
- `EditManager`
- `EditValidator`
- `GalleryLoader`
- `ImageResolver`
- `LoggerService`
- `SenderRegistry`
- `TagsPanel`
- `UserManager`
- `Utils`

---

# 📦 EditValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
- ✅ Zwraca wynik walidacji i listę błędów
- ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

EditValidator
=============
Walidator treści edytowanej wiadomości i tagów:
- Tekst nie może być pusty ani za długi
- Tagi nie mogą przekraczać limitu znaków


---
## 🔧 Metody

### `validate(text, tags)`

Maksymalna długość tekstu


---
## 🔗 Zależności

- `EditValidator`

---

# 📦 GalleryLoader

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `GalleryLoader` renderuje obrazy w galerii na podstawie tagów lub danych z API
- ✅ Obsługuje fallbacki, komunikaty, selekcję i błędy
- ✅ Integruje się z `ImageResolver`, `Utils`, `LoggerService`
- ⚠️ Brakuje metody `renderImages(urls)` — musi być zdefiniowana, bo jest wywoływana
- ✅ Możliwość dodania metod: `setLogger()`, `setGallerySelector()`, `destroy()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i czytelny

GalleryLoader
=============
Loader obrazów do galerii:
- Renderuje obrazy z tagów i z API
- Obsługuje komunikaty, błędy, selekcję
- Integruje się z `ImageResolver`, `Utils`, `LoggerService`

---
## 🧬 Konstruktor

/**
Tworzy instancję loadera.
⚙️ *@param {HTMLElement}* - Kontener zawierający `#image-gallery`.
/

```js
constructor(container) {
if (!(container instanceof HTMLElement)) {
      const actualType =
        container === null
          ? "null"
          : Array.isArray(container)
          ? "Array"
          : container?.constructor?.name || typeof container;

      throw new Error(
        `[GalleryLoader] Przekazany kontener nie jest elementem DOM. ` +
          `Otrzymano: ${actualType} → ${String(container)}`
      );
    }

    /** @type {HTMLElement|null} Element galerii obrazów */
    this.gallery = container.querySelector("#image-gallery");
}
```

---
## 🔧 Metody

### `clearGallery()`


### `showMessage(message)`

Wyświetla komunikat w galerii.

**Parametry:**
- `message` (`string`): Tekst komunikatu.

### `renderImages(urls)`

Renderuje obrazy w galerii na podstawie przekazanych URLi.
Każdy obraz jest opakowany w `<label>` z ukrytym `input[type="radio"]`,
umożliwiającym wybór i podświetlenie.

**Parametry:**
- `urls` (`string[]`): Lista URLi obrazów do wyświetlenia.

### `renderFromTags(tags)`

Renderuje obrazy na podstawie tagów.

**Parametry:**
- `tags` (`string[]`): Lista tagów.

### `highlightSelected(selectedWrapper)`

Podświetla wybrany obraz.

**Parametry:**
- `selectedWrapper` (`HTMLElement`): Element `<label>` z obrazem.

### `loadFromAPI(endpoint, params = {})`

Pobiera dane z API i renderuje obrazy.

**Parametry:**
- `endpoint` (`string`): Ścieżka API.
- `params` (`Object`): Parametry zapytania.

---
## 🔗 Zależności

- `GalleryLoader`
- `ImageResolver`
- `LoggerService`
- `Utils`

---

# 📦 ImageResolver

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
- ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
- ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty

ImageResolver
=============
Resolver obrazów na podstawie tagów:
- Generuje permutacje nazw
- Sprawdza dostępność przez cache, localStorage, HEAD
- Preloaduje znalezione obrazy


---
## 🔧 Metody

### `preloadImages(urls)`

Obsługiwane rozszerzenia plików


### `generateCombinations(tags)`

Generuje permutacje tagów połączone znakiem '_'.

**Parametry:**
- `tags` (`string[]`): Lista tagów.

---
## 🔗 Zależności

- `ImageResolver`

---

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

---

# 📦 LoggerService

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `LoggerService` działa jako buforowany logger z historią
- ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
- ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

LoggerService
=============
Centralny logger aplikacji:
- Buforuje wpisy z poziomem i timestampem
- Czyści wpisy starsze niż 5 minut
- Pozwala pobrać historię i ją wyczyścić


---
## 🔧 Metody

### `record(level, msg, ...args)`

Bufor wpisów logowania


### `cleanup()`

Usuwa wpisy starsze niż `maxAgeMs`.


### `getHistory({ clone = false } = {})`

Zwraca historię logów z bufora.


### `clearHistory()`

Czyści cały bufor logów.


---
## 🔗 Zależności

- `LoggerService`

---

# 📦 PanelsController

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PanelsController` działa jako kontroler widoczności paneli bocznych
- ✅ Obsługuje toggle, open, close, init i zapewnia wyłączność paneli
- ✅ Możliwość dodania metod: `addPanel()`, `isPanelOpen()`, `getOpenPanel()`, `destroy()`
- 💡 Na mobile: tylko jeden panel może być otwarty jednocześnie, wszystkie są domyślnie zamknięte po odświeżeniu
- 💡 Na desktopie: panele nie zasłaniają treści, więc mogą być otwarte równolegle
- 💡 Panel `setting-side-panel` powinien być otwarty lub zamknięty zależnie od ciasteczka — użytkownik decyduje
- 💡 Warto dodać stałą `cookiePanels = ['setting-side-panel']` i obsłużyć ich stan przy `init()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty

PanelsController
================
Kontroler widoczności paneli bocznych aplikacji:
- Obsługuje otwieranie, zamykanie i przełączanie paneli
- Zapewnia, że tylko jeden panel może być otwarty
- Integruje się z klasą `Dom` i `Utils`

---
## 🧬 Konstruktor

/**
Tworzy instancję kontrolera paneli.
⚙️ *@param {Dom}* - Instancja klasy Dom z referencjami do elementów.
/

```js
constructor(domInstance) {
/** @type {Dom} Referencje do elementów DOM */
    this.dom = domInstance;

    /**
     * @type {Array<{button: HTMLElement, panel: HTMLElement}>}
     * Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
     */
    this.panels = [
      { button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
      { button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
    ];
}
```

---
## 🔧 Metody

### `init()`


### `openPanel(panel)`

Otwiera wskazany panel i zamyka pozostałe.

**Parametry:**
- `panel` (`HTMLElement`): Panel do otwarcia.

### `closePanel(panel)`

Zamyka wskazany panel.

**Parametry:**
- `panel` (`HTMLElement`): Panel do zamknięcia.

### `togglePanel(panel)`

Przełącza stan panelu.

**Parametry:**
- `panel` (`HTMLElement`): Panel do przełączenia.

### `closeAllPanels()`

Zamyka wszystkie panele.


---
## 🔗 Zależności

- `Dom`
- `PanelsController`
- `Utils`

---

# 📦 PromptValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PromptValidator` działa jako walidator treści promptów
- ✅ Obsługuje typ, długość i niedozwolone znaki
- ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty

PromptValidator
===============
Walidator treści promptów:
- Sprawdza typ (string)
- Sprawdza długość w granicach [minLength, maxLength]
- Sprawdza obecność niedozwolonych znaków


---
## 🔧 Metody

### `validate(prompt)`

Minimalna długość promptu


---
## 🔗 Zależności

- `PromptValidator`

---

# 📦 RatingForm

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RatingForm` działa jako komponent oceny odpowiedzi
- ✅ Renderuje formularz z suwakami i obsługuje interakcję
- ✅ Przekazuje wynik do `onSubmit`, obsługuje toggle/close/destroy
- ✅ Możliwość dodania metod: `setRatings()`, `isOpen()`, `validate()`, `getCriteriaKeys()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty

RatingForm
==========
Komponent formularza oceny odpowiedzi:
- Renderuje formularz z suwakami dla różnych kryteriów
- Obsługuje interakcję i aktualizację wartości
- Przekazuje wynik do `onSubmit`
- Obsługuje toggle, close i destroy

---
## 🧬 Konstruktor

/**
Tworzy formularz oceny pod podanym elementem wiadomości.
⚙️ *@param {HTMLElement}* - Element wiadomości, pod którym pojawi się formularz.
⚙️ *@param {Function}* - Callback wywoływany po kliknięciu "Wyślij ocenę".
/

```js
constructor(msgEl, onSubmit) {
this.msgEl    = msgEl;
    this.onSubmit = onSubmit;
    this._render();
}
```

---
## 🔧 Metody

### `_render()`

Renderuje formularz w DOM


### `_submit()`

Zbiera wartości suwaków i przekazuje do `onSubmit`


### `_getRatings()`

Zwraca obiekt ocen z wartościami suwaków.


### `toggle()`

Przełącza widoczność formularza


### `close()`

Zamyka formularz


### `destroy()`

Usuwa formularz z DOM i czyści referencję


---
## 🔗 Zależności

- `RatingForm`

---

# 📦 RequestRetryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
- ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
- ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty

RequestRetryManager
===================
Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.


---
## 🔗 Zależności

- `RequestRetryManager`

---

# 📦 SenderRegistry

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
- ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
- ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
- ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę

SenderRegistry
==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
- Każdy nadawca otrzymuje klasę z palety
- Przypisania są zapamiętywane w `Map`
- Indeksy rotują, by nie przekroczyć długości palety


---
## 🔧 Metody

### `getClass(sender)`

Paleta dostępnych klas CSS


---
## 🔗 Zależności

- `SenderRegistry`

---

# 📦 TagSelectorFactory

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `TagSelectorFactory` działa jako fabryka komponentów tagów
- ✅ Docelowo planowana separacja metod:
• `createTagField()` → `TagFieldRenderer`
• `getLabelText()` → `TagLabelDictionary`
• `replaceTagField()` → `TagFieldReplacer`
- ✅ Możliwość dodania metod: `createTagField(name, options, type)`, `getTagFieldType()`, `getAvailableTags(name)`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami

TagSelectorFactory
==================
Fabryka komponentów tagów:
- Tworzy pola tagów (`select` lub `input + datalist`) zależnie od urządzenia
- Generuje etykiety
- Umożliwia dynamiczną podmianę pola w kontenerze


---
## 🔧 Metody

### `createTagField(name, options)`

Tworzy pole tagu z etykietą i opcjami.
W zależności od urządzenia zwraca `select` lub `input + datalist`.

**Parametry:**
- `name` (`string`): Nazwa pola tagu.
- `options` (`string[]`): Lista dostępnych opcji.

### `getLabelText(name)`

Zwraca tekst etykiety dla danego pola tagu.

**Parametry:**
- `name` (`string`): Nazwa pola.

### `replaceTagField(container, name, options)`

Podmienia istniejące pole tagu w kontenerze na nowe.
Dodatkowo resetuje autofill przez `blur()` i `setSelectionRange()`.

**Parametry:**
- `container` (`HTMLElement`): Kontener DOM.
- `name` (`string`): Nazwa pola tagu.
- `options` (`string[]`): Lista nowych opcji.

---
## 🔗 Zależności

- `TagSelectorFactory`
- `Utils`

---

# 📦 TagsPanel

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `TagsPanel` działa jako kontroler komponentu tagów + integracja z galerią
- ✅ Docelowo planowana separacja metod:
• `buildTagFields()` → `TagFieldBuilder`
• `init(onChange)` → `TagEventBinder`
• `notifyTagsChanged()` → `GallerySyncService`
• `getSelectedTags()` / `getTagList()` → `TagStateManager`
• `clearTags()` → `TagResetService`
- ✅ Możliwość dodania metod: `setTags()`, `disableTags()`, `validateTags()`, `getTagOptions()`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami

TagsPanel
=========
Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
- Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
- Obsługuje zmiany użytkownika i aktualizuje galerię
- Umożliwia odczyt i czyszczenie tagów

---
## 🧬 Konstruktor

/**
Tworzy instancję panelu tagów.
⚙️ *@param {HTMLElement}* - Element DOM, do którego zostanie podłączony panel.
/

```js
constructor(container) {
if (!(container instanceof HTMLElement)) {
      const actualType =
        container === null
          ? "null"
          : Array.isArray(container)
          ? "Array"
          : container?.constructor?.name || typeof container;

      throw new Error(
        `[TagsPanel] Przekazany kontener nie jest elementem DOM. ` +
          `Otrzymano: ${actualType} → ${String(container)}`
      );
    }

    /** @type {HTMLElement} Kontener panelu tagów */
    this.container = container;

    /** @type {GalleryLoader} Loader galerii obrazów */
    this.onTagsChanged = null; // callback z zewnątrz

    /** @type {Object.<string, HTMLElement>} Referencje do pól tagów */
    this.fields = {};

    this.buildTagFields();
    this.notifyTagsChanged();

    /** @type {HTMLElement} Element galerii obrazów */
    const gallery = document.createElement("div");
    gallery.id = "image-gallery";
    gallery.className = "gallery-grid mt-10";
    this.container.appendChild(gallery);
    this.gallery = gallery;
}
```

---
## 🔧 Metody

### `q(selector)`


### `buildTagFields()`

Tworzy pola tagów dynamicznie z użyciem `TagSelectorFactory`.
Wstawia je do kontenera i zapisuje referencje w `this.fields`.


### `init(onChange)`

Inicjalizuje nasłuchiwanie zmian w polach tagów.

**Parametry:**
- `onChange` (`Function`): Funkcja wywoływana przy każdej zmianie tagów.

### `getSelectedTags()`

Zwraca aktualnie wybrane tagi jako obiekt.


### `getTagList()`

Zwraca aktualnie wybrane tagi jako tablicę stringów.
Pomija puste wartości.


### `notifyTagsChanged()`

Aktualizuje galerię obrazów na podstawie aktualnych tagów.
Wywołuje `GalleryLoader.renderFromTags()`.


### `clearTags()`

Czyści wszystkie pola tagów.
Ustawia ich wartość na pustą i aktualizuje galerię.


### `setTagOptions(tagOptionsFromBackend)`

Zastępuje opcje tagów i przebudowuje pola na podstawie słownika z backendu.
Oczekuje kluczy w postaci "tag-location", "tag-character", ... (tak jak w tags.json).
Zachowuje this.gallery, jeśli już istnieje (pola mają być przed galerią).


### `applyDefaultsFromDataTags(dataTags, tagOptionsFromBackend)`

Ustawia domyślne wartości inputów na podstawie data-tags (np. "cave_kissing")
i słownika tagów z backendu. Jeśli jakiś tag nie występuje w żadnej kategorii — pomijamy.


---
## 🔗 Zależności

- `GalleryLoader`
- `LoggerService`
- `TagSelectorFactory`
- `TagsPanel`
- `Utils`

---

# 📦 UserManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `UserManager` działa jako statyczny menedżer sesji użytkownika
- ✅ Docelowo planowana separacja metod:
• `setName`, `getName` → `UserStorage`
• `init(dom)` → `UserInputBinder`
• `replacePlaceholders(text)` → `TextInterpolator`
- ✅ Możliwość dodania metod: `hasName()`, `clearName()`, `getStorageType()`, `replacePlaceholders(text, map)`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami
- Wyjaśnić czym jest interpolacja tekstu

UserManager
===========
Statyczna klasa do zarządzania nazwą użytkownika:
- zapisuje w localStorage lub cookie (fallback),
- odczytuje nazwę użytkownika,
- podłącza pole input do automatycznego zapisu,
- podmienia placeholdery w tekstach.


---
## 🔧 Metody

### `setName(name)`

Klucz używany w localStorage i cookie


### `getName()`

Odczytuje imię użytkownika z localStorage lub cookie.


### `init(dom)`

Podłącza pole input #user_name:
- wypełnia istniejącą wartością,
- zapisuje każdą zmianę.

**Parametry:**
- `dom` (`Dom`): Instancja klasy Dom z metodą `q()`.

### `replacePlaceholders(text)`

Podmienia placeholder {{user}} w tekście na aktualne imię.

**Parametry:**
- `text` (`string`): Tekst zawierający placeholder.

---
## 🔗 Zależności

- `Dom`
- `UserManager`

---

# 📦 Utils

FEEDBACK KAMILA (11.09.2025)
=============================
- ✅ Klasa `Utils` działa jako statyczny zestaw narzędzi — nie wymaga instancji
- ✅ Docelowo planowana separacja metod do modułów:
• `throttle`, `debounce` → `TimingUtils`
• `formatDate`, `clamp`, `randomId` → `DataUtils`
• `safeQuery`, `createButton` → `DOMUtils`
• `isMobile` → `EnvUtils` / `DeviceDetector`
• `checkImageExists` → `ResourceUtils` / `ImageValidator`
- ✅ Możliwość dodania metod: `once`, `retry`, `wait`, `escapeHTML`, `parseQueryParams`
- ❌ Refaktoryzacja nastąpi po pełnym pokryciu testami

Utils
=====
Klasa zawierająca zestaw statycznych metod pomocniczych wykorzystywanych w całej aplikacji.
Nie wymaga instancjonowania — wszystkie metody są dostępne bezpośrednio przez `Utils`.

Oferuje funkcje związane z:
- optymalizacją wywołań (throttle, debounce),
- manipulacją danymi (formatowanie dat, ograniczanie wartości, generowanie ID),
- obsługą DOM (bezpieczne pobieranie elementów, tworzenie przycisków),
- detekcją środowiska (mobilność),
- sprawdzaniem dostępności zasobów (obrazów).


---
## 🔧 Metody

### `throttle(fn, limit)`

Ogranicza częstotliwość wywołań funkcji — zapewnia, że funkcja `fn` nie zostanie wywołana częściej niż co `limit` milisekund.

**Parametry:**
- `fn` (`Function`): Funkcja do ograniczenia.
- `limit` (`number`): Minimalny odstęp czasu w ms.

### `debounce(fn, delay)`

Opóźnia wywołanie funkcji do momentu, aż minie określony czas od ostatniego wywołania.
Przydatne np. przy obsłudze inputów, scrolla, resize.

**Parametry:**
- `fn` (`Function`): Funkcja do opóźnienia.
- `delay` (`number`): Czas opóźnienia w ms.

### `formatDate(date)`

Formatuje datę do czytelnego formatu zgodnego z lokalizacją `pl-PL`.

**Parametry:**
- `date` (`Date|string|number`): Obiekt Date, timestamp lub string.

### `clamp(value, min, max)`

Ogranicza wartość do podanego zakresu [min, max].

**Parametry:**
- `value` (`number`): Wartość wejściowa.
- `min` (`number`): Minimalna wartość.
- `max` (`number`): Maksymalna wartość.

### `randomId(length = 8)`

Generuje losowy identyfikator alfanumeryczny.


### `isMobile()`

Sprawdza, czy użytkownik korzysta z urządzenia mobilnego na podstawie `navigator.userAgent`.
Wypisuje wynik detekcji w konsoli.


### `safeQuery(selector)`

Bezpieczne pobieranie elementu DOM.
Jeśli element nie istnieje, wypisuje ostrzeżenie w konsoli.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `createButton(label, onClick)`

Tworzy przycisk HTML z podanym tekstem i funkcją obsługi kliknięcia.

**Parametry:**
- `label` (`string`): Tekst przycisku.
- `onClick` (`Function`): Funkcja wywoływana po kliknięciu.

---
## 🔗 Zależności

- `LoggerService`
- `Utils`

---

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