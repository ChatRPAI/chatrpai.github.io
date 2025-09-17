# 📦 BackendAPI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
- ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
- ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
- ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
/

/**
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



---
## 🔗 Zależności

- `JSON`
- `RequestRetryManager`
- `res`

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
/


/**
ChatHistoryManager
==================
Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
- Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- Chroni przed nadmiernym ruchem sieciowym

---
## 🔧 Metody

### `_loadCache()`

Inicjalizuje sesję czatu.
/
static async init(sessionId) {
this.sessionId = sessionId;
this._loadCache();
// Jeśli cache wygasł, przeładuj z serwera
if (!this._isCacheFresh()) {
await this._fetchHistoryFromServer();
}
}

/**
Pobiera historię wiadomości z cache lub backendu.
/
static async getHistory() {
if (this._isCacheFresh()) {
return this._history;
}
await this._fetchHistoryFromServer();
return this._history;
}

/**
Dodaje wiadomość do sesji i zapisuje ją w cache.
/
static async appendMessage(msg) {
const res = await fetch(`/api/sessions/${this.sessionId}/messages`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(msg),
});
const saved = await res.json();
this._history.push(saved);
this._saveCache();
return saved;
}



/**
Wczytuje historię z localStorage.
@private

**Parametry:**
- `sessionId` (`string`): Identyfikator sesji z backendu.
- `msg` (`{ sender: string, text: string }`): Wiadomość do zapisania.

### `_saveCache()`

Zapisuje historię do localStorage.
@private


### `_isCacheFresh()`

Sprawdza, czy cache jest świeży.
@private



---
## 🔗 Zależności

- `Date`
- `JSON`
- `_history`
- `localStorage`
- `res`
- `this`

---

# 📦 ChatManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
- ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
- ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
- ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony
/

/**
ChatManager
===========
Centralny kontroler logiki czatu:
- Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
- Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy

---
## 🔧 Metody

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.

### `sendPrompt()`

Wysyła prompt użytkownika i obsługuje odpowiedź AI.



---
## 🔗 Zależności

- `Date`
- `LoggerService`
- `aiMsg`
- `backendAPI`
- `chatUI`
- `dom`
- `prompt`
- `this`
- `userMsg`
- `value`

---

# 📦 ChatUI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
- ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
- ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
- ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny
/

/**
ChatUI
======
Kontroler interfejsu czatu:
- Renderuje wiadomości użytkownika i AI
- Obsługuje edycję, ocenę, błędy, ładowanie
- Waliduje prompt i przewija widok

---
## 🔧 Metody

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

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

Dodaje przycisk edycji do wiadomości. */
addEditButton(
msgEl,
originalText,
messageId = "msg-temp",
sessionId = "session-temp"
) {
const btn = Utils.createButton("✏️ Edytuj", () => {
this.editManager.enableEdit(msgEl, originalText, messageId, sessionId);
});
msgEl.appendChild(btn);
}

/** Dodaje formularz oceny wiadomości AI.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.


### `hydrateAIMessage(msgEl, data)`

Hydratuje wiadomość AI i dodaje formularz oceny.



---
## 🔗 Zależności

- `PromptValidator`
- `RatingForm`
- `SenderRegistry`
- `UserManager`
- `Utils`
- `_ratingForm`
- `avatar`
- `backendAPI`
- `chatContainer`
- `classList`
- `content`
- `dataset`
- `document`
- `dom`
- `editBtn`
- `editManager`
- `el`
- `errorMsgEl`
- `form`
- `img`
- `info`
- `inputArea`
- `msg`
- `msgEl`
- `odpowiedzi`
- `p`
- `style`
- `tags`
- `textarea`
- `this`
- `time`
- `txt`
- `value`

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

- `Error`
- `Object`
- `Promise`
- `console`
- `e`
- `r`
- `results`
- `tests`
- `this`

---

# 📦 Diagnostik

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
/


/**
Dom
===
Centralny rejestr elementów interfejsu:
- Pobiera i przechowuje referencje do komponentów UI
- Obsługuje walidację i logowanie braków

---
## 🔧 Metody

### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `q(selector)`

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

/**
Pobiera pierwszy element pasujący do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `qa(selector)`

Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.


---
## 🔗 Zależności

- `LoggerService`
- `document`
- `this`

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
/



/**
EditManager
===========
Kontroler procesu edycji wiadomości AI:
- Renderuje edytor, tagi, galerię
- Waliduje dane i wysyła do backendu
- Renderuje zaktualizowaną wiadomość

---
## 🔧 Metody

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

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

### `renderAIInto(msgElement, { id, sender, text, tags = [], duration = "0", avatarUrl, imageUrl })`

Renderuje wiadomość AI do DOM.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `data` (`Object`): Dane wiadomości.

### `getSelectedTags(tagPanel)`

Pobiera wybrane tagi z panelu.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.

### `renderImages(tagPanel)`

Renderuje obrazy na podstawie tagów.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.


---
## 🔗 Zależności

- `AI`
- `EditValidator`
- `GalleryLoader`
- `ImageResolver`
- `Object`
- `SenderRegistry`
- `TagsPanel`
- `UserManager`
- `Utils`
- `avatar`
- `backendAPI`
- `cancelBtn`
- `classList`
- `content`
- `dataset`
- `document`
- `editBtn`
- `errors`
- `galleryLoader`
- `img`
- `mapped`
- `msgElement`
- `p`
- `params`
- `saveBtn`
- `tagPanel`
- `tags`
- `tagsPanel`
- `targetEl`
- `textarea`
- `this`
- `time`
- `txt`
- `updated`
- `value`

---

# 📦 EditValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
- ✅ Zwraca wynik walidacji i listę błędów
- ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
EditValidator
=============
Walidator treści edytowanej wiadomości i tagów:
- Tekst nie może być pusty ani za długi
- Tagi nie mogą przekraczać limitu znaków

---
## 🔧 Metody

### `static maxTextLength()`

Maksymalna długość tekstu


### `static maxTagLength()`

Maksymalna długość pojedynczego tagu


### `validate(text, tags)`

Maksymalna długość tekstu */
static maxTextLength = 500;
/** Maksymalna długość pojedynczego tagu */
static maxTagLength = 300;

/**
Waliduje tekst i tagi.

**Parametry:**
- `text` (`string`): Treść wiadomości.
- `tags` (`string[]`): Lista tagów.


---
## 🔗 Zależności

- `errors`
- `pusty`
- `t`
- `tags`
- `text`
- `this`

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
/
/**
GalleryLoader
=============
Loader obrazów do galerii:
- Renderuje obrazy z tagów i z API
- Obsługuje komunikaty, błędy, selekcję
- Integruje się z `ImageResolver`, `Utils`, `LoggerService`

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `clearGallery()`

this.gallery = container.querySelector("#image-gallery");
}

/** Czyści zawartość galerii.


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

- `Array`
- `DOM`
- `Error`
- `ImageResolver`
- `Object`
- `Set`
- `URL`
- `all`
- `classList`
- `comboUrls`
- `container`
- `data`
- `document`
- `el`
- `gallery`
- `img`
- `input`
- `location`
- `logger`
- `msg`
- `obrazów`
- `res`
- `searchParams`
- `selectedWrapper`
- `singleUrls`
- `style`
- `this`
- `url`
- `urls`
- `window`
- `wrapper`
- `wyników`
- `Ładowanie`

---

# 📦 ImageResolver

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
- ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
- ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty
/

/**
ImageResolver
=============
Resolver obrazów na podstawie tagów:
- Generuje permutacje nazw
- Sprawdza dostępność przez cache, localStorage, HEAD
- Preloaduje znalezione obrazy

---
## 🔧 Metody

### `static extensions()`

Obsługiwane rozszerzenia plików


### `static basePath()`

Ścieżka bazowa do folderu z obrazami


### `static imageCache()`

Cache dostępności obrazów


### `static inFlight()`

Bufor zapytań w trakcie


### `static preloadRegistry()`

Rejestr preloadowanych obrazów


### `preloadImages(urls)`

Obsługiwane rozszerzenia plików */
static extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
/** Ścieżka bazowa do folderu z obrazami */
static basePath = "/static/NarrativeIMG/";
/** Cache dostępności obrazów */
static imageCache = new Map();
/** Bufor zapytań w trakcie */
static inFlight = new Map();
/** Rejestr preloadowanych obrazów */
static preloadRegistry = new Set();

/**
Zwraca listę istniejących obrazów pasujących do tagów.
/
static async resolve(tags, { maxResults = 2, logger = null } = {}) {
const combos = this.generateCombinations(tags);
const results = [];

for (const combo of combos) {
for (const ext of this.extensions) {
const url = this.basePath + combo + ext;
if (await this.checkImageExists(url, logger)) {
results.push(url);
break;
}
}
}

this.preloadImages(results);
return results;
}

/**
Sprawdza, czy obraz istnieje.
/
static async checkImageExists(url, logger = null) {
if (this.imageCache.has(url)) {
if (this.imageCache.get(url) && logger) {
logger.record("log", `[ImageResolver] Cache (in-memory) ✔ ${url}`);
}
return this.imageCache.get(url);
}

if (this.inFlight.has(url)) {
if (logger) {
logger.record("log", `[ImageResolver] Dedup in-flight HEAD: ${url}`);
}
return this.inFlight.get(url);
}

const promise = (async () => {
const stored = localStorage.getItem(`img-exists:${url}`);
if (stored === "true") {
this.imageCache.set(url, true);
if (logger) {
logger.record("log", `[ImageResolver] Cache (localStorage) ✔ ${url}`);
}
return true;
}

try {
const res = await fetch(url, { method: "HEAD" });
if (res.ok) {
localStorage.setItem(`img-exists:${url}`, "true");
this.imageCache.set(url, true);
if (logger) {
logger.record("log", `[ImageResolver] HEAD ✔ ${url}`);
}
return true;
} else {
this.imageCache.set(url, false);
return false;
}
} catch (err) {
this.imageCache.set(url, false);
if (logger) {
logger.record("error", `[ImageResolver] HEAD error ${url}`, err);
}
return false;
}
})();

this.inFlight.set(url, promise);
const exists = await promise;
this.inFlight.delete(url);
return exists;
}

/**
Preloaduje obrazy do przeglądarki.

**Parametry:**
- `tags` (`string[]`): Lista tagów.
- `options` (`object`): Opcje dodatkowe.
- `url` (`string`): URL obrazu.
- `logger` (`object`): Logger (opcjonalnie).
- `urls` (`string[]`): Lista URLi do preloadu.

### `generateCombinations(tags)`

Generuje permutacje tagów połączone znakiem '_'.

**Parametry:**
- `tags` (`string[]`): Lista tagów.


---
## 🔗 Zależności

- `Image`
- `Map`
- `Set`
- `imageCache`
- `img`
- `inFlight`
- `localStorage`
- `logger`
- `newPrefix`
- `prefix`
- `preloadRegistry`
- `remaining`
- `res`
- `results`
- `this`
- `urls`

---

# 📦 KeyboardManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `KeyboardManager` dba o widoczność pola `#input-area` nad klawiaturą ekranową
- ✅ Obsługuje `visualViewport`, `scroll`, `resize` i workaround dla Firefoksa
- ✅ Możliwość dodania metod: `destroy()`, `setTarget()`, `isKeyboardVisible()`, `debug()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
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
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `init()`

this.dom = domInstance;

/** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
this.isFirefox = /firefox/i.test(navigator.userAgent);
}

/** Inicjalizuje nasłuchiwacze `resize` i `scroll`.


### `updatePosition()`

Aktualizuje pozycję pola `input-area` nad klawiaturą.



---
## 🔗 Zależności

- `LoggerService`
- `Math`
- `body`
- `document`
- `documentElement`
- `dom`
- `i`
- `inputArea`
- `navigator`
- `niedostępne`
- `style`
- `this`
- `updatePosition`
- `visualViewport`
- `vv`
- `window`

---

# 📦 LoggerService

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `LoggerService` działa jako buforowany logger z historią
- ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
- ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
LoggerService
=============
Centralny logger aplikacji:
- Buforuje wpisy z poziomem i timestampem
- Czyści wpisy starsze niż 5 minut
- Pozwala pobrać historię i ją wyczyścić

---
## 🔧 Metody

### `static buffer()`

Bufor wpisów logowania


### `static maxAgeMs()`

Maksymalny wiek wpisów w ms (domyślnie 5 minut)


### `record(level, msg, ...args)`

Bufor wpisów logowania */
static buffer = [];
/** Maksymalny wiek wpisów w ms (domyślnie 5 minut) */
static maxAgeMs = 5 * 60 * 1000;

/**
Dodaje wpis do bufora i loguje do konsoli.

**Parametry:**
- `level` (`'log'|'warn'|'error'`): Poziom logowania.
- `msg` (`string`): Treść komunikatu.

### `cleanup()`

Usuwa wpisy starsze niż `maxAgeMs`.


### `getHistory({ clone = false } = {})`

Zwraca historię logów z bufora.


### `clearHistory()`

Czyści cały bufor logów.



---
## 🔗 Zależności

- `Array`
- `Date`
- `buffer`
- `e`
- `entry`
- `this`

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
/


/**
PanelsController
================
Kontroler widoczności paneli bocznych aplikacji:
- Obsługuje otwieranie, zamykanie i przełączanie paneli
- Zapewnia, że tylko jeden panel może być otwarty
- Integruje się z klasą `Dom` i `Utils`

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `init()`

this.dom = domInstance;

/**
Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
/
this.panels = [
{ button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
{ button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
];
}

/** Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.


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

- `Utils`
- `button`
- `classList`
- `dom`
- `panel`
- `panels`
- `this`

---

# 📦 PromptValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PromptValidator` działa jako walidator treści promptów
- ✅ Obsługuje typ, długość i niedozwolone znaki
- ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
PromptValidator
===============
Walidator treści promptów:
- Sprawdza typ (string)
- Sprawdza długość w granicach [minLength, maxLength]
- Sprawdza obecność niedozwolonych znaków

---
## 🔧 Metody

### `static minLength()`

Minimalna długość promptu


### `static maxLength()`

Maksymalna długość promptu


### `validate(prompt)`

Minimalna długość promptu */
static minLength = 1;
/** Maksymalna długość promptu */
static maxLength = 300;

/**
Waliduje prompt.

**Parametry:**
- `prompt` (`string`): Treść promptu do sprawdzenia.


---
## 🔗 Zależności

- `errors`
- `prompt`
- `pusty`
- `tekstem`
- `this`

---

# 📦 RatingForm

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RatingForm` działa jako komponent oceny odpowiedzi
- ✅ Renderuje formularz z suwakami i obsługuje interakcję
- ✅ Przekazuje wynik do `onSubmit`, obsługuje toggle/close/destroy
- ✅ Możliwość dodania metod: `setRatings()`, `isOpen()`, `validate()`, `getCriteriaKeys()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/
/**
RatingForm
==========
Komponent formularza oceny odpowiedzi:
- Renderuje formularz z suwakami dla różnych kryteriów
- Obsługuje interakcję i aktualizację wartości
- Przekazuje wynik do `onSubmit`
- Obsługuje toggle, close i destroy

---
## 🔧 Metody

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

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

- `Array`
- `btn`
- `criteria`
- `details`
- `document`
- `header`
- `inp`
- `input`
- `label_val`
- `msgEl`
- `row`
- `summary`
- `this`
- `val`

---

# 📦 RequestRetryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
- ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
- ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/

/**
RequestRetryManager
===================
Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.


---
## 🔗 Zależności

- `Error`
- `Promise`
- `logger`
- `res`

---

# 📦 SenderRegistry

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
- ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
- ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
- ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę
/
/**
SenderRegistry
==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
- Każdy nadawca otrzymuje klasę z palety
- Przypisania są zapamiętywane w `Map`
- Indeksy rotują, by nie przekroczyć długości palety

---
## 🔧 Metody

### `static palette()`

Paleta dostępnych klas CSS


### `static map()`

Mapa przypisań: sender → index


### `static idx()`

Aktualny indeks w palecie


### `getClass(sender)`

Paleta dostępnych klas CSS */
static palette = ['msg-ai-1','msg-ai-2','msg-ai-3','msg-ai-4','msg-ai-5'];

/** Mapa przypisań: sender → index */
static map = new Map();

/** Aktualny indeks w palecie */
static idx = 0;

/**
Zwraca klasę CSS dla podanego nadawcy.
Jeśli nadawca nie był wcześniej zarejestrowany, przypisuje mu kolejną klasę z palety.

**Parametry:**
- `sender` (`string`): Identyfikator nadawcy.


---
## 🔗 Zależności

- `Map`
- `map`
- `palette`
- `this`

---

# 📦 SessionManager

SessionManager
==============
Pobiera całą sesję czatu z backendu i buforuje w localStorage przez określony czas.
Oferuje metody:
- init(sessionId)
- getHistory()  // z cache lub fetch
- appendMessage(message) // zapis do server + cache

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
/
/**
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

- `Utils`
- `container`
- `datalist`
- `document`
- `el`
- `input`
- `label`
- `old`
- `option`
- `options`
- `parentElement`
- `select`
- `this`

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
/
/**
TagsPanel
=========
Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
- Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
- Obsługuje zmiany użytkownika i aktualizuje galerię
- Umożliwia odczyt i czyszczenie tagów

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `q(selector)`

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

/**
Skrót do `querySelector` w obrębie kontenera.

**Parametry:**
- `selector` (`string`): Selektor CSS.

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



---
## 🔗 Zależności

- `Array`
- `DOM`
- `Error`
- `LoggerService`
- `Object`
- `TagSelectorFactory`
- `Utils`
- `container`
- `document`
- `field`
- `fieldWrapper`
- `fields`
- `gallery`
- `tagNames`
- `this`

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
/
/**
UserManager
===========
Statyczna klasa do zarządzania nazwą użytkownika:
- zapisuje w localStorage lub cookie (fallback),
- odczytuje nazwę użytkownika,
- podłącza pole input do automatycznego zapisu,
- podmienia placeholdery w tekstach.

---
## 🔧 Metody

### `static storageKey()`

Klucz używany w localStorage i cookie


### `setName(name)`

Klucz używany w localStorage i cookie */
static storageKey = 'user_name';

/**
Zapisuje imię użytkownika w localStorage lub cookie (fallback).

**Parametry:**
- `name` (`string`): Imię użytkownika.

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

- `RegExp`
- `cookie`
- `document`
- `dom`
- `input`
- `localStorage`
- `text`
- `this`
- `value`

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
/

/**
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

- `Date`
- `LoggerService`
- `Math`
- `btn`
- `console`
- `d`
- `document`
- `fn`
- `i`
- `id`
- `navigator`
- `res`

---

# 📦 BackendAPI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
- ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
- ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
- ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
/

/**
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



---
## 🔗 Zależności

- `JSON`
- `RequestRetryManager`
- `res`

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
/


/**
ChatHistoryManager
==================
Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
- Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- Chroni przed nadmiernym ruchem sieciowym

---
## 🔧 Metody

### `_loadCache()`

Inicjalizuje sesję czatu.
/
static async init(sessionId) {
this.sessionId = sessionId;
this._loadCache();
// Jeśli cache wygasł, przeładuj z serwera
if (!this._isCacheFresh()) {
await this._fetchHistoryFromServer();
}
}

/**
Pobiera historię wiadomości z cache lub backendu.
/
static async getHistory() {
if (this._isCacheFresh()) {
return this._history;
}
await this._fetchHistoryFromServer();
return this._history;
}

/**
Dodaje wiadomość do sesji i zapisuje ją w cache.
/
static async appendMessage(msg) {
const res = await fetch(`/api/sessions/${this.sessionId}/messages`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(msg),
});
const saved = await res.json();
this._history.push(saved);
this._saveCache();
return saved;
}



/**
Wczytuje historię z localStorage.
@private

**Parametry:**
- `sessionId` (`string`): Identyfikator sesji z backendu.
- `msg` (`{ sender: string, text: string }`): Wiadomość do zapisania.

### `_saveCache()`

Zapisuje historię do localStorage.
@private


### `_isCacheFresh()`

Sprawdza, czy cache jest świeży.
@private



---
## 🔗 Zależności

- `Date`
- `JSON`
- `_history`
- `localStorage`
- `res`
- `this`

---

# 📦 ChatManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
- ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
- ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
- ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony
/

/**
ChatManager
===========
Centralny kontroler logiki czatu:
- Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
- Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy

---
## 🔧 Metody

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.

### `sendPrompt()`

Wysyła prompt użytkownika i obsługuje odpowiedź AI.



---
## 🔗 Zależności

- `Date`
- `LoggerService`
- `aiMsg`
- `backendAPI`
- `chatUI`
- `dom`
- `prompt`
- `this`
- `userMsg`
- `value`

---

# 📦 ChatUI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
- ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
- ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
- ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny
/

/**
ChatUI
======
Kontroler interfejsu czatu:
- Renderuje wiadomości użytkownika i AI
- Obsługuje edycję, ocenę, błędy, ładowanie
- Waliduje prompt i przewija widok

---
## 🔧 Metody

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

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

Dodaje przycisk edycji do wiadomości. */
addEditButton(
msgEl,
originalText,
messageId = "msg-temp",
sessionId = "session-temp"
) {
const btn = Utils.createButton("✏️ Edytuj", () => {
this.editManager.enableEdit(msgEl, originalText, messageId, sessionId);
});
msgEl.appendChild(btn);
}

/** Dodaje formularz oceny wiadomości AI.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.


### `hydrateAIMessage(msgEl, data)`

Hydratuje wiadomość AI i dodaje formularz oceny.



---
## 🔗 Zależności

- `PromptValidator`
- `RatingForm`
- `SenderRegistry`
- `UserManager`
- `Utils`
- `_ratingForm`
- `avatar`
- `backendAPI`
- `chatContainer`
- `classList`
- `content`
- `dataset`
- `document`
- `dom`
- `editBtn`
- `editManager`
- `el`
- `errorMsgEl`
- `form`
- `img`
- `info`
- `inputArea`
- `msg`
- `msgEl`
- `odpowiedzi`
- `p`
- `style`
- `tags`
- `textarea`
- `this`
- `time`
- `txt`
- `value`

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

- `Error`
- `Object`
- `Promise`
- `console`
- `e`
- `r`
- `results`
- `tests`
- `this`

---

# 📦 Diagnostik

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
/


/**
Dom
===
Centralny rejestr elementów interfejsu:
- Pobiera i przechowuje referencje do komponentów UI
- Obsługuje walidację i logowanie braków

---
## 🔧 Metody

### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `q(selector)`

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

/**
Pobiera pierwszy element pasujący do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `qa(selector)`

Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.


---
## 🔗 Zależności

- `LoggerService`
- `document`
- `this`

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
/



/**
EditManager
===========
Kontroler procesu edycji wiadomości AI:
- Renderuje edytor, tagi, galerię
- Waliduje dane i wysyła do backendu
- Renderuje zaktualizowaną wiadomość

---
## 🔧 Metody

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

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

### `renderAIInto(msgElement, { id, sender, text, tags = [], duration = "0", avatarUrl, imageUrl })`

Renderuje wiadomość AI do DOM.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `data` (`Object`): Dane wiadomości.

### `getSelectedTags(tagPanel)`

Pobiera wybrane tagi z panelu.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.

### `renderImages(tagPanel)`

Renderuje obrazy na podstawie tagów.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.


---
## 🔗 Zależności

- `AI`
- `EditValidator`
- `GalleryLoader`
- `ImageResolver`
- `Object`
- `SenderRegistry`
- `TagsPanel`
- `UserManager`
- `Utils`
- `avatar`
- `backendAPI`
- `cancelBtn`
- `classList`
- `content`
- `dataset`
- `document`
- `editBtn`
- `errors`
- `galleryLoader`
- `img`
- `mapped`
- `msgElement`
- `p`
- `params`
- `saveBtn`
- `tagPanel`
- `tags`
- `tagsPanel`
- `targetEl`
- `textarea`
- `this`
- `time`
- `txt`
- `updated`
- `value`

---

# 📦 EditValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
- ✅ Zwraca wynik walidacji i listę błędów
- ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
EditValidator
=============
Walidator treści edytowanej wiadomości i tagów:
- Tekst nie może być pusty ani za długi
- Tagi nie mogą przekraczać limitu znaków

---
## 🔧 Metody

### `static maxTextLength()`

Maksymalna długość tekstu


### `static maxTagLength()`

Maksymalna długość pojedynczego tagu


### `validate(text, tags)`

Maksymalna długość tekstu */
static maxTextLength = 500;
/** Maksymalna długość pojedynczego tagu */
static maxTagLength = 300;

/**
Waliduje tekst i tagi.

**Parametry:**
- `text` (`string`): Treść wiadomości.
- `tags` (`string[]`): Lista tagów.


---
## 🔗 Zależności

- `errors`
- `pusty`
- `t`
- `tags`
- `text`
- `this`

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
/
/**
GalleryLoader
=============
Loader obrazów do galerii:
- Renderuje obrazy z tagów i z API
- Obsługuje komunikaty, błędy, selekcję
- Integruje się z `ImageResolver`, `Utils`, `LoggerService`

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `clearGallery()`

this.gallery = container.querySelector("#image-gallery");
}

/** Czyści zawartość galerii.


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

- `Array`
- `DOM`
- `Error`
- `ImageResolver`
- `Object`
- `Set`
- `URL`
- `all`
- `classList`
- `comboUrls`
- `container`
- `data`
- `document`
- `el`
- `gallery`
- `img`
- `input`
- `location`
- `logger`
- `msg`
- `obrazów`
- `res`
- `searchParams`
- `selectedWrapper`
- `singleUrls`
- `style`
- `this`
- `url`
- `urls`
- `window`
- `wrapper`
- `wyników`
- `Ładowanie`

---

# 📦 ImageResolver

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
- ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
- ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty
/

/**
ImageResolver
=============
Resolver obrazów na podstawie tagów:
- Generuje permutacje nazw
- Sprawdza dostępność przez cache, localStorage, HEAD
- Preloaduje znalezione obrazy

---
## 🔧 Metody

### `static extensions()`

Obsługiwane rozszerzenia plików


### `static basePath()`

Ścieżka bazowa do folderu z obrazami


### `static imageCache()`

Cache dostępności obrazów


### `static inFlight()`

Bufor zapytań w trakcie


### `static preloadRegistry()`

Rejestr preloadowanych obrazów


### `preloadImages(urls)`

Obsługiwane rozszerzenia plików */
static extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
/** Ścieżka bazowa do folderu z obrazami */
static basePath = "/static/NarrativeIMG/";
/** Cache dostępności obrazów */
static imageCache = new Map();
/** Bufor zapytań w trakcie */
static inFlight = new Map();
/** Rejestr preloadowanych obrazów */
static preloadRegistry = new Set();

/**
Zwraca listę istniejących obrazów pasujących do tagów.
/
static async resolve(tags, { maxResults = 2, logger = null } = {}) {
const combos = this.generateCombinations(tags);
const results = [];

for (const combo of combos) {
for (const ext of this.extensions) {
const url = this.basePath + combo + ext;
if (await this.checkImageExists(url, logger)) {
results.push(url);
break;
}
}
}

this.preloadImages(results);
return results;
}

/**
Sprawdza, czy obraz istnieje.
/
static async checkImageExists(url, logger = null) {
if (this.imageCache.has(url)) {
if (this.imageCache.get(url) && logger) {
logger.record("log", `[ImageResolver] Cache (in-memory) ✔ ${url}`);
}
return this.imageCache.get(url);
}

if (this.inFlight.has(url)) {
if (logger) {
logger.record("log", `[ImageResolver] Dedup in-flight HEAD: ${url}`);
}
return this.inFlight.get(url);
}

const promise = (async () => {
const stored = localStorage.getItem(`img-exists:${url}`);
if (stored === "true") {
this.imageCache.set(url, true);
if (logger) {
logger.record("log", `[ImageResolver] Cache (localStorage) ✔ ${url}`);
}
return true;
}

try {
const res = await fetch(url, { method: "HEAD" });
if (res.ok) {
localStorage.setItem(`img-exists:${url}`, "true");
this.imageCache.set(url, true);
if (logger) {
logger.record("log", `[ImageResolver] HEAD ✔ ${url}`);
}
return true;
} else {
this.imageCache.set(url, false);
return false;
}
} catch (err) {
this.imageCache.set(url, false);
if (logger) {
logger.record("error", `[ImageResolver] HEAD error ${url}`, err);
}
return false;
}
})();

this.inFlight.set(url, promise);
const exists = await promise;
this.inFlight.delete(url);
return exists;
}

/**
Preloaduje obrazy do przeglądarki.

**Parametry:**
- `tags` (`string[]`): Lista tagów.
- `options` (`object`): Opcje dodatkowe.
- `url` (`string`): URL obrazu.
- `logger` (`object`): Logger (opcjonalnie).
- `urls` (`string[]`): Lista URLi do preloadu.

### `generateCombinations(tags)`

Generuje permutacje tagów połączone znakiem '_'.

**Parametry:**
- `tags` (`string[]`): Lista tagów.


---
## 🔗 Zależności

- `Image`
- `Map`
- `Set`
- `imageCache`
- `img`
- `inFlight`
- `localStorage`
- `logger`
- `newPrefix`
- `prefix`
- `preloadRegistry`
- `remaining`
- `res`
- `results`
- `this`
- `urls`

---

# 📦 KeyboardManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `KeyboardManager` dba o widoczność pola `#input-area` nad klawiaturą ekranową
- ✅ Obsługuje `visualViewport`, `scroll`, `resize` i workaround dla Firefoksa
- ✅ Możliwość dodania metod: `destroy()`, `setTarget()`, `isKeyboardVisible()`, `debug()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
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
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `init()`

this.dom = domInstance;

/** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
this.isFirefox = /firefox/i.test(navigator.userAgent);
}

/** Inicjalizuje nasłuchiwacze `resize` i `scroll`.


### `updatePosition()`

Aktualizuje pozycję pola `input-area` nad klawiaturą.



---
## 🔗 Zależności

- `LoggerService`
- `Math`
- `body`
- `document`
- `documentElement`
- `dom`
- `i`
- `inputArea`
- `navigator`
- `niedostępne`
- `style`
- `this`
- `updatePosition`
- `visualViewport`
- `vv`
- `window`

---

# 📦 LoggerService

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `LoggerService` działa jako buforowany logger z historią
- ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
- ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
LoggerService
=============
Centralny logger aplikacji:
- Buforuje wpisy z poziomem i timestampem
- Czyści wpisy starsze niż 5 minut
- Pozwala pobrać historię i ją wyczyścić

---
## 🔧 Metody

### `static buffer()`

Bufor wpisów logowania


### `static maxAgeMs()`

Maksymalny wiek wpisów w ms (domyślnie 5 minut)


### `record(level, msg, ...args)`

Bufor wpisów logowania */
static buffer = [];
/** Maksymalny wiek wpisów w ms (domyślnie 5 minut) */
static maxAgeMs = 5 * 60 * 1000;

/**
Dodaje wpis do bufora i loguje do konsoli.

**Parametry:**
- `level` (`'log'|'warn'|'error'`): Poziom logowania.
- `msg` (`string`): Treść komunikatu.

### `cleanup()`

Usuwa wpisy starsze niż `maxAgeMs`.


### `getHistory({ clone = false } = {})`

Zwraca historię logów z bufora.


### `clearHistory()`

Czyści cały bufor logów.



---
## 🔗 Zależności

- `Array`
- `Date`
- `buffer`
- `e`
- `entry`
- `this`

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
/


/**
PanelsController
================
Kontroler widoczności paneli bocznych aplikacji:
- Obsługuje otwieranie, zamykanie i przełączanie paneli
- Zapewnia, że tylko jeden panel może być otwarty
- Integruje się z klasą `Dom` i `Utils`

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `init()`

this.dom = domInstance;

/**
Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
/
this.panels = [
{ button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
{ button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
];
}

/** Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.


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

- `Utils`
- `button`
- `classList`
- `dom`
- `panel`
- `panels`
- `this`

---

# 📦 PromptValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PromptValidator` działa jako walidator treści promptów
- ✅ Obsługuje typ, długość i niedozwolone znaki
- ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
PromptValidator
===============
Walidator treści promptów:
- Sprawdza typ (string)
- Sprawdza długość w granicach [minLength, maxLength]
- Sprawdza obecność niedozwolonych znaków

---
## 🔧 Metody

### `static minLength()`

Minimalna długość promptu


### `static maxLength()`

Maksymalna długość promptu


### `validate(prompt)`

Minimalna długość promptu */
static minLength = 1;
/** Maksymalna długość promptu */
static maxLength = 300;

/**
Waliduje prompt.

**Parametry:**
- `prompt` (`string`): Treść promptu do sprawdzenia.


---
## 🔗 Zależności

- `errors`
- `prompt`
- `pusty`
- `tekstem`
- `this`

---

# 📦 RatingForm

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RatingForm` działa jako komponent oceny odpowiedzi
- ✅ Renderuje formularz z suwakami i obsługuje interakcję
- ✅ Przekazuje wynik do `onSubmit`, obsługuje toggle/close/destroy
- ✅ Możliwość dodania metod: `setRatings()`, `isOpen()`, `validate()`, `getCriteriaKeys()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/
/**
RatingForm
==========
Komponent formularza oceny odpowiedzi:
- Renderuje formularz z suwakami dla różnych kryteriów
- Obsługuje interakcję i aktualizację wartości
- Przekazuje wynik do `onSubmit`
- Obsługuje toggle, close i destroy

---
## 🔧 Metody

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

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

- `Array`
- `btn`
- `criteria`
- `details`
- `document`
- `header`
- `inp`
- `input`
- `label_val`
- `msgEl`
- `row`
- `summary`
- `this`
- `val`

---

# 📦 RequestRetryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
- ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
- ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/

/**
RequestRetryManager
===================
Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.


---
## 🔗 Zależności

- `Error`
- `Promise`
- `logger`
- `res`

---

# 📦 SenderRegistry

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
- ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
- ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
- ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę
/
/**
SenderRegistry
==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
- Każdy nadawca otrzymuje klasę z palety
- Przypisania są zapamiętywane w `Map`
- Indeksy rotują, by nie przekroczyć długości palety

---
## 🔧 Metody

### `static palette()`

Paleta dostępnych klas CSS


### `static map()`

Mapa przypisań: sender → index


### `static idx()`

Aktualny indeks w palecie


### `getClass(sender)`

Paleta dostępnych klas CSS */
static palette = ['msg-ai-1','msg-ai-2','msg-ai-3','msg-ai-4','msg-ai-5'];

/** Mapa przypisań: sender → index */
static map = new Map();

/** Aktualny indeks w palecie */
static idx = 0;

/**
Zwraca klasę CSS dla podanego nadawcy.
Jeśli nadawca nie był wcześniej zarejestrowany, przypisuje mu kolejną klasę z palety.

**Parametry:**
- `sender` (`string`): Identyfikator nadawcy.


---
## 🔗 Zależności

- `Map`
- `map`
- `palette`
- `this`

---

# 📦 SessionManager

SessionManager
==============
Pobiera całą sesję czatu z backendu i buforuje w localStorage przez określony czas.
Oferuje metody:
- init(sessionId)
- getHistory()  // z cache lub fetch
- appendMessage(message) // zapis do server + cache

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
/
/**
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

- `Utils`
- `container`
- `datalist`
- `document`
- `el`
- `input`
- `label`
- `old`
- `option`
- `options`
- `parentElement`
- `select`
- `this`

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
/
/**
TagsPanel
=========
Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
- Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
- Obsługuje zmiany użytkownika i aktualizuje galerię
- Umożliwia odczyt i czyszczenie tagów

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `q(selector)`

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

/**
Skrót do `querySelector` w obrębie kontenera.

**Parametry:**
- `selector` (`string`): Selektor CSS.

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



---
## 🔗 Zależności

- `Array`
- `DOM`
- `Error`
- `LoggerService`
- `Object`
- `TagSelectorFactory`
- `Utils`
- `container`
- `document`
- `field`
- `fieldWrapper`
- `fields`
- `gallery`
- `tagNames`
- `this`

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
/
/**
UserManager
===========
Statyczna klasa do zarządzania nazwą użytkownika:
- zapisuje w localStorage lub cookie (fallback),
- odczytuje nazwę użytkownika,
- podłącza pole input do automatycznego zapisu,
- podmienia placeholdery w tekstach.

---
## 🔧 Metody

### `static storageKey()`

Klucz używany w localStorage i cookie


### `setName(name)`

Klucz używany w localStorage i cookie */
static storageKey = 'user_name';

/**
Zapisuje imię użytkownika w localStorage lub cookie (fallback).

**Parametry:**
- `name` (`string`): Imię użytkownika.

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

- `RegExp`
- `cookie`
- `document`
- `dom`
- `input`
- `localStorage`
- `text`
- `this`
- `value`

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
/

/**
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

- `Date`
- `LoggerService`
- `Math`
- `btn`
- `console`
- `d`
- `document`
- `fn`
- `i`
- `id`
- `navigator`
- `res`

---

# 📦 BackendAPI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
- ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
- ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
- ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
/

/**
BackendAPI
==========
Warstwa komunikacji z backendem:
- Obsługuje generowanie odpowiedzi, ocenianie i edycję
- Wykorzystuje `fetch` z metodą POST i JSON


---
## 🔗 Zależności

- `JSON`
- `RequestRetryManager`
- `res`

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
/


/**
ChatHistoryManager
==================
Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
- Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- Chroni przed nadmiernym ruchem sieciowym


---
## 🔗 Zależności

- `Date`
- `JSON`
- `_history`
- `localStorage`
- `res`
- `this`

---

# 📦 ChatManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
- ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
- ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
- ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony
/

/**
ChatManager
===========
Centralny kontroler logiki czatu:
- Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
- Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy

---
## 🔧 Metody

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.


---
## 🔗 Zależności

- `Date`
- `LoggerService`
- `aiMsg`
- `backendAPI`
- `chatUI`
- `dom`
- `prompt`
- `this`
- `userMsg`
- `value`

---

# 📦 ChatUI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
- ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
- ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
- ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny
/

/**
ChatUI
======
Kontroler interfejsu czatu:
- Renderuje wiadomości użytkownika i AI
- Obsługuje edycję, ocenę, błędy, ładowanie
- Waliduje prompt i przewija widok

---
## 🔧 Metody

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

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

Dodaje przycisk edycji do wiadomości. */
addEditButton(
msgEl,
originalText,
messageId = "msg-temp",
sessionId = "session-temp"
) {
const btn = Utils.createButton("✏️ Edytuj", () => {
this.editManager.enableEdit(msgEl, originalText, messageId, sessionId);
});
msgEl.appendChild(btn);
}

/** Dodaje formularz oceny wiadomości AI.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.


### `hydrateAIMessage(msgEl, data)`

Hydratuje wiadomość AI i dodaje formularz oceny.



---
## 🔗 Zależności

- `PromptValidator`
- `RatingForm`
- `SenderRegistry`
- `UserManager`
- `Utils`
- `_ratingForm`
- `avatar`
- `backendAPI`
- `chatContainer`
- `classList`
- `content`
- `dataset`
- `document`
- `dom`
- `editBtn`
- `editManager`
- `el`
- `errorMsgEl`
- `form`
- `img`
- `info`
- `inputArea`
- `msg`
- `msgEl`
- `odpowiedzi`
- `p`
- `style`
- `tags`
- `textarea`
- `this`
- `time`
- `txt`
- `value`

---

# 📦 Diagnostics


---
## 🔗 Zależności

- `Error`
- `Object`
- `Promise`
- `console`
- `e`
- `r`
- `results`
- `tests`
- `this`

---

# 📦 Diagnostik

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
/


/**
Dom
===
Centralny rejestr elementów interfejsu:
- Pobiera i przechowuje referencje do komponentów UI
- Obsługuje walidację i logowanie braków

---
## 🔧 Metody

### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `q(selector)`

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

/**
Pobiera pierwszy element pasujący do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `qa(selector)`

Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.


---
## 🔗 Zależności

- `LoggerService`
- `document`
- `this`

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
/



/**
EditManager
===========
Kontroler procesu edycji wiadomości AI:
- Renderuje edytor, tagi, galerię
- Waliduje dane i wysyła do backendu
- Renderuje zaktualizowaną wiadomość

---
## 🔧 Metody

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

### `renderAIInto(msgElement, { id, sender, text, tags = [], duration = "0", avatarUrl, imageUrl })`

Włącza tryb edycji dla wiadomości AI.
/
async enableEdit(msgElement, originalText, messageId, sessionId) {
const rawTags = (msgElement.dataset.tags || "").split("_").filter(Boolean);
const mapped = { location:"", character:"", action:"", nsfw:"", emotion:"" };
for (const t of rawTags) {
const cat = categorizeTag(t);
if (cat && !mapped[cat]) mapped[cat] = t;
}

msgElement.innerHTML = "";

const textarea = document.createElement("textarea");
textarea.value = originalText;
textarea.rows = 6;
textarea.className = "form-element textarea-base w-full fix-w-full mt-10";

const tagPanel = document.createElement("div");
tagPanel.className = "tag-panel";

const galleryLoader = new GalleryLoader(tagPanel);
const tagsPanel = new TagsPanel(tagPanel);

let bootstrapping = true;
tagsPanel.init(() => {
if (bootstrapping) return;
galleryLoader.renderFromTags(tagsPanel.getTagList());
});

const $ = (sel) => tagPanel.querySelector(sel);
$("#tag-location").value  = mapped.location  || "";
$("#tag-character").value = mapped.character || "";
$("#tag-action").value    = mapped.action    || "";
$("#tag-nsfw").value      = mapped.nsfw      || "";
$("#tag-emotion").value   = mapped.emotion   || "";

galleryLoader.renderFromTags(Object.values(mapped).filter(Boolean));
bootstrapping = false;

const saveBtn = Utils.createButton("💾 Zapisz", async () => {
const tags = this.getSelectedTags(tagPanel);
const selectedImage = tagPanel.querySelector("input[name='image']:checked")?.value;
const { valid, errors } = EditValidator.validate(textarea.value, tags);
if (!valid) {
alert(`Błąd edycji: ${errors.join("\n")}`);
return;
}
await this.submitEdit({
editedText: textarea.value,
tags,
imageUrl: selectedImage,
msgElement,
originalText,
messageId,
sessionId,
});
});
saveBtn.classList.add("button-base");

const cancelBtn = Utils.createButton("❌ Anuluj", () => {
this.renderAIInto(msgElement, {
id: messageId,
sender: msgElement._snapshot?.sender || "AI",
text: originalText,
tags: rawTags,
duration: msgElement._snapshot?.duration || "0",
avatarUrl: msgElement._snapshot?.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png",
});
});
cancelBtn.classList.add("button-base");

msgElement.appendChild(textarea);
msgElement.appendChild(tagPanel);
msgElement.appendChild(saveBtn);
msgElement.appendChild(cancelBtn);
}

/**
Wysyła edytowaną wiadomość do backendu i renderuje ją.
/
async submitEdit(params) {
const updated = await this.backendAPI.edit({
editedText: params.editedText,
tags: params.tags,
imageUrl: params.imageUrl,
messageId: params.messageId,
sessionId: params.sessionId,
});

const targetEl = params.msgElement;
this.renderAIInto(targetEl, {
id: updated.id || targetEl.dataset.msgId || "msg-temp",
sender: updated.sender || (targetEl._snapshot?.sender ?? "AI"),
text: updated.text,
tags: updated.tags || [],
duration: targetEl._snapshot?.timeText?.match(/(\d+(?:\.\d+)?)s/)?.[1] || "0",
avatarUrl: updated.avatarUrl || (targetEl._snapshot?.avatarUrl ?? "/static/NarrativeIMG/Avatars/AI.png"),
imageUrl: params.imageUrl,
});
}
/**
Renderuje wiadomość AI do DOM.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `originalText` (`string`): Oryginalna treść wiadomości.
- `messageId` (`string`): ID wiadomości.
- `sessionId` (`string`): ID sesji.
- `params` (`Object`): Parametry edycji.
- `msgElement` (`HTMLElement`): Element wiadomości.
- `data` (`Object`): Dane wiadomości.

### `getSelectedTags(tagPanel)`

Pobiera wybrane tagi z panelu.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.


---
## 🔗 Zależności

- `AI`
- `EditValidator`
- `GalleryLoader`
- `ImageResolver`
- `Object`
- `SenderRegistry`
- `TagsPanel`
- `UserManager`
- `Utils`
- `avatar`
- `backendAPI`
- `cancelBtn`
- `classList`
- `content`
- `dataset`
- `document`
- `editBtn`
- `errors`
- `galleryLoader`
- `img`
- `mapped`
- `msgElement`
- `p`
- `params`
- `saveBtn`
- `tagPanel`
- `tags`
- `tagsPanel`
- `targetEl`
- `textarea`
- `this`
- `time`
- `txt`
- `updated`
- `value`

---

# 📦 EditValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
- ✅ Zwraca wynik walidacji i listę błędów
- ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
EditValidator
=============
Walidator treści edytowanej wiadomości i tagów:
- Tekst nie może być pusty ani za długi
- Tagi nie mogą przekraczać limitu znaków

---
## 🔧 Metody

### `static maxTextLength()`

Maksymalna długość tekstu


### `static maxTagLength()`

Maksymalna długość pojedynczego tagu



---
## 🔗 Zależności

- `errors`
- `pusty`
- `t`
- `tags`
- `text`
- `this`

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
/
/**
GalleryLoader
=============
Loader obrazów do galerii:
- Renderuje obrazy z tagów i z API
- Obsługuje komunikaty, błędy, selekcję
- Integruje się z `ImageResolver`, `Utils`, `LoggerService`

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `clearGallery()`

this.gallery = container.querySelector("#image-gallery");
}

/** Czyści zawartość galerii.


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

### `highlightSelected(selectedWrapper)`

Renderuje obrazy na podstawie tagów.
/
async renderFromTags(tags) {
const gallery =
this.gallery || this.container.querySelector("#image-gallery");
if (!gallery) return;

// 1) kombinacje (jak masz)
const comboUrls = await ImageResolver.resolve(tags, {
logger: this.logger,
});

// 2) fallback: pojedyncze tagi
const singleUrls = [];
for (const t of tags) {
for (const ext of ImageResolver.extensions) {
const url = `${ImageResolver.basePath}${t}${ext}`;
// minimalizacja HEAD: sprawdzaj tylko jeśli nie ma w combo
if (
!comboUrls.includes(url) &&
(await ImageResolver.checkImageExists(url))
) {
singleUrls.push(url);
break;
}
}
}

const unique = Array.from(new Set([...comboUrls, ...singleUrls]));
this.renderImages(unique);
}

/**
Podświetla wybrany obraz.

**Parametry:**
- `tags` (`string[]`): Lista tagów.
- `selectedWrapper` (`HTMLElement`): Element `<label>` z obrazem.


---
## 🔗 Zależności

- `Array`
- `DOM`
- `Error`
- `ImageResolver`
- `Object`
- `Set`
- `URL`
- `all`
- `classList`
- `comboUrls`
- `container`
- `data`
- `document`
- `el`
- `gallery`
- `img`
- `input`
- `location`
- `logger`
- `msg`
- `obrazów`
- `res`
- `searchParams`
- `selectedWrapper`
- `singleUrls`
- `style`
- `this`
- `url`
- `urls`
- `window`
- `wrapper`
- `wyników`
- `Ładowanie`

---

# 📦 ImageResolver

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
- ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
- ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty
/

/**
ImageResolver
=============
Resolver obrazów na podstawie tagów:
- Generuje permutacje nazw
- Sprawdza dostępność przez cache, localStorage, HEAD
- Preloaduje znalezione obrazy

---
## 🔧 Metody

### `static extensions()`

Obsługiwane rozszerzenia plików


### `static basePath()`

Ścieżka bazowa do folderu z obrazami


### `static imageCache()`

Cache dostępności obrazów


### `static inFlight()`

Bufor zapytań w trakcie


### `static preloadRegistry()`

Rejestr preloadowanych obrazów



---
## 🔗 Zależności

- `Image`
- `Map`
- `Set`
- `imageCache`
- `img`
- `inFlight`
- `localStorage`
- `logger`
- `newPrefix`
- `prefix`
- `preloadRegistry`
- `remaining`
- `res`
- `results`
- `this`
- `urls`

---

# 📦 KeyboardManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `KeyboardManager` dba o widoczność pola `#input-area` nad klawiaturą ekranową
- ✅ Obsługuje `visualViewport`, `scroll`, `resize` i workaround dla Firefoksa
- ✅ Możliwość dodania metod: `destroy()`, `setTarget()`, `isKeyboardVisible()`, `debug()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
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
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `init()`

this.dom = domInstance;

/** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
this.isFirefox = /firefox/i.test(navigator.userAgent);
}

/** Inicjalizuje nasłuchiwacze `resize` i `scroll`.


### `updatePosition()`

Aktualizuje pozycję pola `input-area` nad klawiaturą.



---
## 🔗 Zależności

- `LoggerService`
- `Math`
- `body`
- `document`
- `documentElement`
- `dom`
- `i`
- `inputArea`
- `navigator`
- `niedostępne`
- `style`
- `this`
- `updatePosition`
- `visualViewport`
- `vv`
- `window`

---

# 📦 LoggerService

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `LoggerService` działa jako buforowany logger z historią
- ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
- ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
LoggerService
=============
Centralny logger aplikacji:
- Buforuje wpisy z poziomem i timestampem
- Czyści wpisy starsze niż 5 minut
- Pozwala pobrać historię i ją wyczyścić

---
## 🔧 Metody

### `static buffer()`

Bufor wpisów logowania


### `static maxAgeMs()`

Maksymalny wiek wpisów w ms (domyślnie 5 minut)



---
## 🔗 Zależności

- `Array`
- `Date`
- `buffer`
- `e`
- `entry`
- `this`

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
/


/**
PanelsController
================
Kontroler widoczności paneli bocznych aplikacji:
- Obsługuje otwieranie, zamykanie i przełączanie paneli
- Zapewnia, że tylko jeden panel może być otwarty
- Integruje się z klasą `Dom` i `Utils`

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `init()`

this.dom = domInstance;

/**
Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
/
this.panels = [
{ button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
{ button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
];
}

/** Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.


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

- `Utils`
- `button`
- `classList`
- `dom`
- `panel`
- `panels`
- `this`

---

# 📦 PromptValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PromptValidator` działa jako walidator treści promptów
- ✅ Obsługuje typ, długość i niedozwolone znaki
- ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
PromptValidator
===============
Walidator treści promptów:
- Sprawdza typ (string)
- Sprawdza długość w granicach [minLength, maxLength]
- Sprawdza obecność niedozwolonych znaków

---
## 🔧 Metody

### `static minLength()`

Minimalna długość promptu


### `static maxLength()`

Maksymalna długość promptu



---
## 🔗 Zależności

- `errors`
- `prompt`
- `pusty`
- `tekstem`
- `this`

---

# 📦 RatingForm

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RatingForm` działa jako komponent oceny odpowiedzi
- ✅ Renderuje formularz z suwakami i obsługuje interakcję
- ✅ Przekazuje wynik do `onSubmit`, obsługuje toggle/close/destroy
- ✅ Możliwość dodania metod: `setRatings()`, `isOpen()`, `validate()`, `getCriteriaKeys()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/
/**
RatingForm
==========
Komponent formularza oceny odpowiedzi:
- Renderuje formularz z suwakami dla różnych kryteriów
- Obsługuje interakcję i aktualizację wartości
- Przekazuje wynik do `onSubmit`
- Obsługuje toggle, close i destroy

---
## 🔧 Metody

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

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

- `Array`
- `btn`
- `criteria`
- `details`
- `document`
- `header`
- `inp`
- `input`
- `label_val`
- `msgEl`
- `row`
- `summary`
- `this`
- `val`

---

# 📦 RequestRetryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
- ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
- ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/

/**
RequestRetryManager
===================
Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.


---
## 🔗 Zależności

- `Error`
- `Promise`
- `logger`
- `res`

---

# 📦 SenderRegistry

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
- ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
- ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
- ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę
/
/**
SenderRegistry
==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
- Każdy nadawca otrzymuje klasę z palety
- Przypisania są zapamiętywane w `Map`
- Indeksy rotują, by nie przekroczyć długości palety

---
## 🔧 Metody

### `static palette()`

Paleta dostępnych klas CSS


### `static map()`

Mapa przypisań: sender → index


### `static idx()`

Aktualny indeks w palecie



---
## 🔗 Zależności

- `Map`
- `map`
- `palette`
- `this`

---

# 📦 SessionManager

SessionManager
==============
Pobiera całą sesję czatu z backendu i buforuje w localStorage przez określony czas.
Oferuje metody:
- init(sessionId)
- getHistory()  // z cache lub fetch
- appendMessage(message) // zapis do server + cache

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
/
/**
TagSelectorFactory
==================
Fabryka komponentów tagów:
- Tworzy pola tagów (`select` lub `input + datalist`) zależnie od urządzenia
- Generuje etykiety
- Umożliwia dynamiczną podmianę pola w kontenerze


---
## 🔗 Zależności

- `Utils`
- `container`
- `datalist`
- `document`
- `el`
- `input`
- `label`
- `old`
- `option`
- `options`
- `parentElement`
- `select`
- `this`

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
/
/**
TagsPanel
=========
Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
- Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
- Obsługuje zmiany użytkownika i aktualizuje galerię
- Umożliwia odczyt i czyszczenie tagów

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `q(selector)`

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

/**
Skrót do `querySelector` w obrębie kontenera.

**Parametry:**
- `selector` (`string`): Selektor CSS.

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



---
## 🔗 Zależności

- `Array`
- `DOM`
- `Error`
- `LoggerService`
- `Object`
- `TagSelectorFactory`
- `Utils`
- `container`
- `document`
- `field`
- `fieldWrapper`
- `fields`
- `gallery`
- `tagNames`
- `this`

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
/
/**
UserManager
===========
Statyczna klasa do zarządzania nazwą użytkownika:
- zapisuje w localStorage lub cookie (fallback),
- odczytuje nazwę użytkownika,
- podłącza pole input do automatycznego zapisu,
- podmienia placeholdery w tekstach.

---
## 🔧 Metody

### `static storageKey()`

Klucz używany w localStorage i cookie



---
## 🔗 Zależności

- `RegExp`
- `cookie`
- `document`
- `dom`
- `input`
- `localStorage`
- `text`
- `this`
- `value`

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
/

/**
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
## 🔗 Zależności

- `Date`
- `LoggerService`
- `Math`
- `btn`
- `console`
- `d`
- `document`
- `fn`
- `i`
- `id`
- `navigator`
- `res`

---

# 📦 BackendAPI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
- ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
- ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
- ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
/

/**
BackendAPI
==========
Warstwa komunikacji z backendem:
- Obsługuje generowanie odpowiedzi, ocenianie i edycję
- Wykorzystuje `fetch` z metodą POST i JSON


---
## 🔗 Zależności

- `JSON`
- `RequestRetryManager`
- `res`

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
/


/**
ChatHistoryManager
==================
Buforuje historię czatu w `localStorage` i synchronizuje ją z backendem.
- Obsługuje inicjalizację sesji, pobieranie historii i dodawanie wiadomości
- Chroni przed nadmiernym ruchem sieciowym


---
## 🔗 Zależności

- `Date`
- `JSON`
- `_history`
- `localStorage`
- `res`
- `this`

---

# 📦 ChatManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatManager` centralizuje logikę przepływu wiadomości między UI, backendem i DOM
- ✅ Obsługuje pełny cykl: walidacja → wysyłka → ładowanie → renderowanie → ocena → błędy
- ✅ Integruje się z `ChatUI`, `BackendAPI`, `Dom`, `LoggerService`
- ✅ Możliwość dodania metod: `sendPromptWithRetry()`, `abortPrompt()`, `sendPromptWithStreaming()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest spójny i dobrze rozdzielony
/

/**
ChatManager
===========
Centralny kontroler logiki czatu:
- Łączy UI (`ChatUI`) z backendem (`BackendAPI`)
- Obsługuje wysyłkę promptu, renderowanie odpowiedzi i błędy

---
## 🔧 Metody

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję ChatManager.

**Parametry:**
- `chatUI` (`ChatUI`): Interfejs czatu.
- `backendAPI` (`BackendAPI`): Komunikacja z backendem.
- `dom` (`Dom`): Referencje do elementów DOM.


---
## 🔗 Zależności

- `Date`
- `LoggerService`
- `aiMsg`
- `backendAPI`
- `chatUI`
- `dom`
- `prompt`
- `this`
- `userMsg`
- `value`

---

# 📦 ChatUI

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ChatUI` obsługuje pełny cykl życia wiadomości w interfejsie czatu
- ✅ Integruje się z `Dom`, `EditManager`, `BackendAPI`, `UserManager`, `SenderRegistry`, `PromptValidator`, `Utils`, `RatingForm`
- ✅ Obsługuje dodawanie wiadomości, edycję, ocenę, błędy, ładowanie i walidację promptu
- ✅ Możliwość dodania metod: `clearChat()`, `focusPrompt()`, `disableRating()`, `renderSystemMessage()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i spójny
/

/**
ChatUI
======
Kontroler interfejsu czatu:
- Renderuje wiadomości użytkownika i AI
- Obsługuje edycję, ocenę, błędy, ładowanie
- Waliduje prompt i przewija widok

---
## 🔧 Metody

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

### `constructor(domInstance, editManager, backendAPI)`

Tworzy instancję ChatUI.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.
- `editManager` (`EditManager`): Manager edycji wiadomości.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.

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

Dodaje przycisk edycji do wiadomości. */
addEditButton(
msgEl,
originalText,
messageId = "msg-temp",
sessionId = "session-temp"
) {
const btn = Utils.createButton("✏️ Edytuj", () => {
this.editManager.enableEdit(msgEl, originalText, messageId, sessionId);
});
msgEl.appendChild(btn);
}

/** Dodaje formularz oceny wiadomości AI.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.


### `hydrateAIMessage(msgEl, data)`

Hydratuje wiadomość AI i dodaje formularz oceny.



---
## 🔗 Zależności

- `PromptValidator`
- `RatingForm`
- `SenderRegistry`
- `UserManager`
- `Utils`
- `_ratingForm`
- `avatar`
- `backendAPI`
- `chatContainer`
- `classList`
- `content`
- `dataset`
- `document`
- `dom`
- `editBtn`
- `editManager`
- `el`
- `errorMsgEl`
- `form`
- `img`
- `info`
- `inputArea`
- `msg`
- `msgEl`
- `odpowiedzi`
- `p`
- `style`
- `tags`
- `textarea`
- `this`
- `time`
- `txt`
- `value`

---

# 📦 Diagnostics


---
## 🔗 Zależności

- `Error`
- `Object`
- `Promise`
- `console`
- `e`
- `r`
- `results`
- `tests`
- `this`

---

# 📦 Diagnostik

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
/


/**
Dom
===
Centralny rejestr elementów interfejsu:
- Pobiera i przechowuje referencje do komponentów UI
- Obsługuje walidację i logowanie braków

---
## 🔧 Metody

### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.


### `q(selector)`

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

/**
Pobiera pierwszy element pasujący do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `qa(selector)`

Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS.


---
## 🔗 Zależności

- `LoggerService`
- `document`
- `this`

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
/



/**
EditManager
===========
Kontroler procesu edycji wiadomości AI:
- Renderuje edytor, tagi, galerię
- Waliduje dane i wysyła do backendu
- Renderuje zaktualizowaną wiadomość

---
## 🔧 Metody

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

### `constructor(dom, backendAPI, logger)`

Tworzy instancję EditManager.

**Parametry:**
- `dom` (`Dom`): Referencje do elementów DOM.
- `backendAPI` (`BackendAPI`): Interfejs komunikacji z backendem.
- `logger` (`LoggerService`): Logger aplikacji.

### `renderAIInto(msgElement, { id, sender, text, tags = [], duration = "0", avatarUrl, imageUrl })`

Włącza tryb edycji dla wiadomości AI.
/
async enableEdit(msgElement, originalText, messageId, sessionId) {
const rawTags = (msgElement.dataset.tags || "").split("_").filter(Boolean);
const mapped = { location:"", character:"", action:"", nsfw:"", emotion:"" };
for (const t of rawTags) {
const cat = categorizeTag(t);
if (cat && !mapped[cat]) mapped[cat] = t;
}

msgElement.innerHTML = "";

const textarea = document.createElement("textarea");
textarea.value = originalText;
textarea.rows = 6;
textarea.className = "form-element textarea-base w-full fix-w-full mt-10";

const tagPanel = document.createElement("div");
tagPanel.className = "tag-panel";

const galleryLoader = new GalleryLoader(tagPanel);
const tagsPanel = new TagsPanel(tagPanel);

let bootstrapping = true;
tagsPanel.init(() => {
if (bootstrapping) return;
galleryLoader.renderFromTags(tagsPanel.getTagList());
});

const $ = (sel) => tagPanel.querySelector(sel);
$("#tag-location").value  = mapped.location  || "";
$("#tag-character").value = mapped.character || "";
$("#tag-action").value    = mapped.action    || "";
$("#tag-nsfw").value      = mapped.nsfw      || "";
$("#tag-emotion").value   = mapped.emotion   || "";

galleryLoader.renderFromTags(Object.values(mapped).filter(Boolean));
bootstrapping = false;

const saveBtn = Utils.createButton("💾 Zapisz", async () => {
const tags = this.getSelectedTags(tagPanel);
const selectedImage = tagPanel.querySelector("input[name='image']:checked")?.value;
const { valid, errors } = EditValidator.validate(textarea.value, tags);
if (!valid) {
alert(`Błąd edycji: ${errors.join("\n")}`);
return;
}
await this.submitEdit({
editedText: textarea.value,
tags,
imageUrl: selectedImage,
msgElement,
originalText,
messageId,
sessionId,
});
});
saveBtn.classList.add("button-base");

const cancelBtn = Utils.createButton("❌ Anuluj", () => {
this.renderAIInto(msgElement, {
id: messageId,
sender: msgElement._snapshot?.sender || "AI",
text: originalText,
tags: rawTags,
duration: msgElement._snapshot?.duration || "0",
avatarUrl: msgElement._snapshot?.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png",
});
});
cancelBtn.classList.add("button-base");

msgElement.appendChild(textarea);
msgElement.appendChild(tagPanel);
msgElement.appendChild(saveBtn);
msgElement.appendChild(cancelBtn);
}

/**
Wysyła edytowaną wiadomość do backendu i renderuje ją.
/
async submitEdit(params) {
const updated = await this.backendAPI.edit({
editedText: params.editedText,
tags: params.tags,
imageUrl: params.imageUrl,
messageId: params.messageId,
sessionId: params.sessionId,
});

const targetEl = params.msgElement;
this.renderAIInto(targetEl, {
id: updated.id || targetEl.dataset.msgId || "msg-temp",
sender: updated.sender || (targetEl._snapshot?.sender ?? "AI"),
text: updated.text,
tags: updated.tags || [],
duration: targetEl._snapshot?.timeText?.match(/(\d+(?:\.\d+)?)s/)?.[1] || "0",
avatarUrl: updated.avatarUrl || (targetEl._snapshot?.avatarUrl ?? "/static/NarrativeIMG/Avatars/AI.png"),
imageUrl: params.imageUrl,
});
}
/**
Renderuje wiadomość AI do DOM.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości.
- `originalText` (`string`): Oryginalna treść wiadomości.
- `messageId` (`string`): ID wiadomości.
- `sessionId` (`string`): ID sesji.
- `params` (`Object`): Parametry edycji.
- `msgElement` (`HTMLElement`): Element wiadomości.
- `data` (`Object`): Dane wiadomości.

### `getSelectedTags(tagPanel)`

Pobiera wybrane tagi z panelu.

**Parametry:**
- `tagPanel` (`HTMLElement`): Panel tagów.


---
## 🔗 Zależności

- `AI`
- `EditValidator`
- `GalleryLoader`
- `ImageResolver`
- `Object`
- `SenderRegistry`
- `TagsPanel`
- `UserManager`
- `Utils`
- `avatar`
- `backendAPI`
- `cancelBtn`
- `classList`
- `content`
- `dataset`
- `document`
- `editBtn`
- `errors`
- `galleryLoader`
- `img`
- `mapped`
- `msgElement`
- `p`
- `params`
- `saveBtn`
- `tagPanel`
- `tags`
- `tagsPanel`
- `targetEl`
- `textarea`
- `this`
- `time`
- `txt`
- `updated`
- `value`

---

# 📦 EditValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `EditValidator` waliduje tekst i tagi pod kątem długości i pustki
- ✅ Zwraca wynik walidacji i listę błędów
- ✅ Możliwość dodania metod: `setMaxTextLength()`, `requireTags()`, `validateTagFormat()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
EditValidator
=============
Walidator treści edytowanej wiadomości i tagów:
- Tekst nie może być pusty ani za długi
- Tagi nie mogą przekraczać limitu znaków

---
## 🔧 Metody

### `static maxTextLength()`

Maksymalna długość tekstu


### `static maxTagLength()`

Maksymalna długość pojedynczego tagu



---
## 🔗 Zależności

- `errors`
- `pusty`
- `t`
- `tags`
- `text`
- `this`

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
/
/**
GalleryLoader
=============
Loader obrazów do galerii:
- Renderuje obrazy z tagów i z API
- Obsługuje komunikaty, błędy, selekcję
- Integruje się z `ImageResolver`, `Utils`, `LoggerService`

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `constructor(container)`

Tworzy instancję loadera.

**Parametry:**
- `container` (`HTMLElement`): Kontener zawierający `#image-gallery`.

### `clearGallery()`

this.gallery = container.querySelector("#image-gallery");
}

/** Czyści zawartość galerii.


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

### `highlightSelected(selectedWrapper)`

Renderuje obrazy na podstawie tagów.
/
async renderFromTags(tags) {
const gallery =
this.gallery || this.container.querySelector("#image-gallery");
if (!gallery) return;

// 1) kombinacje (jak masz)
const comboUrls = await ImageResolver.resolve(tags, {
logger: this.logger,
});

// 2) fallback: pojedyncze tagi
const singleUrls = [];
for (const t of tags) {
for (const ext of ImageResolver.extensions) {
const url = `${ImageResolver.basePath}${t}${ext}`;
// minimalizacja HEAD: sprawdzaj tylko jeśli nie ma w combo
if (
!comboUrls.includes(url) &&
(await ImageResolver.checkImageExists(url))
) {
singleUrls.push(url);
break;
}
}
}

const unique = Array.from(new Set([...comboUrls, ...singleUrls]));
this.renderImages(unique);
}

/**
Podświetla wybrany obraz.

**Parametry:**
- `tags` (`string[]`): Lista tagów.
- `selectedWrapper` (`HTMLElement`): Element `<label>` z obrazem.


---
## 🔗 Zależności

- `Array`
- `DOM`
- `Error`
- `ImageResolver`
- `Object`
- `Set`
- `URL`
- `all`
- `classList`
- `comboUrls`
- `container`
- `data`
- `document`
- `el`
- `gallery`
- `img`
- `input`
- `location`
- `logger`
- `msg`
- `obrazów`
- `res`
- `searchParams`
- `selectedWrapper`
- `singleUrls`
- `style`
- `this`
- `url`
- `urls`
- `window`
- `wrapper`
- `wyników`
- `Ładowanie`

---

# 📦 ImageResolver

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `ImageResolver` generuje i preloaduje obrazy na podstawie tagów
- ✅ Obsługuje permutacje, cache, localStorage, HEAD, deduplikację i logger
- ✅ Możliwość dodania metod: `setBasePath()`, `clearCache()`, `resolveSingle()`, `getStats()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest dobrze rozdzielony i zamknięty
/

/**
ImageResolver
=============
Resolver obrazów na podstawie tagów:
- Generuje permutacje nazw
- Sprawdza dostępność przez cache, localStorage, HEAD
- Preloaduje znalezione obrazy

---
## 🔧 Metody

### `static extensions()`

Obsługiwane rozszerzenia plików


### `static basePath()`

Ścieżka bazowa do folderu z obrazami


### `static imageCache()`

Cache dostępności obrazów


### `static inFlight()`

Bufor zapytań w trakcie


### `static preloadRegistry()`

Rejestr preloadowanych obrazów



---
## 🔗 Zależności

- `Image`
- `Map`
- `Set`
- `imageCache`
- `img`
- `inFlight`
- `localStorage`
- `logger`
- `newPrefix`
- `prefix`
- `preloadRegistry`
- `remaining`
- `res`
- `results`
- `this`
- `urls`

---

# 📦 KeyboardManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `KeyboardManager` dba o widoczność pola `#input-area` nad klawiaturą ekranową
- ✅ Obsługuje `visualViewport`, `scroll`, `resize` i workaround dla Firefoksa
- ✅ Możliwość dodania metod: `destroy()`, `setTarget()`, `isKeyboardVisible()`, `debug()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
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
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `constructor(domInstance)`

Tworzy instancję KeyboardManager.

**Parametry:**
- `domInstance` (`Dom`): Referencje do elementów DOM.

### `init()`

this.dom = domInstance;

/** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
this.isFirefox = /firefox/i.test(navigator.userAgent);
}

/** Inicjalizuje nasłuchiwacze `resize` i `scroll`.


### `updatePosition()`

Aktualizuje pozycję pola `input-area` nad klawiaturą.



---
## 🔗 Zależności

- `LoggerService`
- `Math`
- `body`
- `document`
- `documentElement`
- `dom`
- `i`
- `inputArea`
- `navigator`
- `niedostępne`
- `style`
- `this`
- `updatePosition`
- `visualViewport`
- `vv`
- `window`

---

# 📦 LoggerService

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `LoggerService` działa jako buforowany logger z historią
- ✅ Obsługuje poziomy logowania, czyszczenie i pobieranie historii
- ✅ Możliwość dodania metod: `setMaxAge()`, `filterByLevel()`, `exportHistory()`, `recordOnce()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
LoggerService
=============
Centralny logger aplikacji:
- Buforuje wpisy z poziomem i timestampem
- Czyści wpisy starsze niż 5 minut
- Pozwala pobrać historię i ją wyczyścić

---
## 🔧 Metody

### `static buffer()`

Bufor wpisów logowania


### `static maxAgeMs()`

Maksymalny wiek wpisów w ms (domyślnie 5 minut)



---
## 🔗 Zależności

- `Array`
- `Date`
- `buffer`
- `e`
- `entry`
- `this`

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
/


/**
PanelsController
================
Kontroler widoczności paneli bocznych aplikacji:
- Obsługuje otwieranie, zamykanie i przełączanie paneli
- Zapewnia, że tylko jeden panel może być otwarty
- Integruje się z klasą `Dom` i `Utils`

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `init()`

this.dom = domInstance;

/**
Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
/
this.panels = [
{ button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
{ button: this.dom.settingsToggle, panel: this.dom.settingSidePanel },
];
}

/** Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.


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

- `Utils`
- `button`
- `classList`
- `dom`
- `panel`
- `panels`
- `this`

---

# 📦 PromptValidator

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `PromptValidator` działa jako walidator treści promptów
- ✅ Obsługuje typ, długość i niedozwolone znaki
- ✅ Możliwość dodania metod: `setLimits()`, `addForbiddenPattern()`, `validateStrict()`, `getErrorSummary()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest prosty i zamknięty
/

/**
PromptValidator
===============
Walidator treści promptów:
- Sprawdza typ (string)
- Sprawdza długość w granicach [minLength, maxLength]
- Sprawdza obecność niedozwolonych znaków

---
## 🔧 Metody

### `static minLength()`

Minimalna długość promptu


### `static maxLength()`

Maksymalna długość promptu



---
## 🔗 Zależności

- `errors`
- `prompt`
- `pusty`
- `tekstem`
- `this`

---

# 📦 RatingForm

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RatingForm` działa jako komponent oceny odpowiedzi
- ✅ Renderuje formularz z suwakami i obsługuje interakcję
- ✅ Przekazuje wynik do `onSubmit`, obsługuje toggle/close/destroy
- ✅ Możliwość dodania metod: `setRatings()`, `isOpen()`, `validate()`, `getCriteriaKeys()`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/
/**
RatingForm
==========
Komponent formularza oceny odpowiedzi:
- Renderuje formularz z suwakami dla różnych kryteriów
- Obsługuje interakcję i aktualizację wartości
- Przekazuje wynik do `onSubmit`
- Obsługuje toggle, close i destroy

---
## 🔧 Metody

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

### `constructor(msgEl, onSubmit)`

Tworzy formularz oceny pod podanym elementem wiadomości.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, pod którym pojawi się formularz.
- `onSubmit` (`Function`): Callback wywoływany po kliknięciu "Wyślij ocenę".

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

- `Array`
- `btn`
- `criteria`
- `details`
- `document`
- `header`
- `inp`
- `input`
- `label_val`
- `msgEl`
- `row`
- `summary`
- `this`
- `val`

---

# 📦 RequestRetryManager

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `RequestRetryManager` działa jako warstwa odpornościowa dla zapytań HTTP
- ✅ Obsługuje retry, opóźnienie, logowanie i konfigurację
- ✅ Możliwość dodania metod: `isRetryable(err)`, `fetchWithBackoff(...)`, `onRetry(...)`, `maxTotalTime`
- ❌ Refaktoryzacja nie jest konieczna — kod jest czytelny i zamknięty
/

/**
RequestRetryManager
===================
Zapewnia automatyczne ponawianie zapytań HTTP z określoną liczbą prób i opóźnieniem.


---
## 🔗 Zależności

- `Error`
- `Promise`
- `logger`
- `res`

---

# 📦 SenderRegistry

FEEDBACK KAMILA (12.09.2025)
=============================
- ✅ Klasa `SenderRegistry` działa jako rejestr kolorów nadawców
- ✅ Prosty mechanizm rotacji indeksów i zapamiętywania klas
- ✅ Możliwość dodania metod: `reset()`, `getPalette()`, `setPalette()`, `hasSender()`, `getSenderIndex()`
- ❌ Refaktoryzacja nie jest konieczna — klasa spełnia swoją rolę
/
/**
SenderRegistry
==============
Rejestr przypisujący klasę CSS (kolor) każdemu nadawcy wiadomości.
- Każdy nadawca otrzymuje klasę z palety
- Przypisania są zapamiętywane w `Map`
- Indeksy rotują, by nie przekroczyć długości palety

---
## 🔧 Metody

### `static palette()`

Paleta dostępnych klas CSS


### `static map()`

Mapa przypisań: sender → index


### `static idx()`

Aktualny indeks w palecie



---
## 🔗 Zależności

- `Map`
- `map`
- `palette`
- `this`

---

# 📦 SessionManager

SessionManager
==============
Pobiera całą sesję czatu z backendu i buforuje w localStorage przez określony czas.
Oferuje metody:
- init(sessionId)
- getHistory()  // z cache lub fetch
- appendMessage(message) // zapis do server + cache

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
/
/**
TagSelectorFactory
==================
Fabryka komponentów tagów:
- Tworzy pola tagów (`select` lub `input + datalist`) zależnie od urządzenia
- Generuje etykiety
- Umożliwia dynamiczną podmianę pola w kontenerze


---
## 🔗 Zależności

- `Utils`
- `container`
- `datalist`
- `document`
- `el`
- `input`
- `label`
- `old`
- `option`
- `options`
- `parentElement`
- `select`
- `this`

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
/
/**
TagsPanel
=========
Komponent zarządzający polami tagów i synchronizacją z galerią obrazów.
- Tworzy dynamiczne pola tagów z użyciem `TagSelectorFactory`
- Obsługuje zmiany użytkownika i aktualizuje galerię
- Umożliwia odczyt i czyszczenie tagów

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `constructor(container)`

Tworzy instancję panelu tagów.
@throws {Error} Jeśli `container` nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Element DOM, do którego zostanie podłączony panel.

### `q(selector)`

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

/**
Skrót do `querySelector` w obrębie kontenera.

**Parametry:**
- `selector` (`string`): Selektor CSS.

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



---
## 🔗 Zależności

- `Array`
- `DOM`
- `Error`
- `LoggerService`
- `Object`
- `TagSelectorFactory`
- `Utils`
- `container`
- `document`
- `field`
- `fieldWrapper`
- `fields`
- `gallery`
- `tagNames`
- `this`

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
/
/**
UserManager
===========
Statyczna klasa do zarządzania nazwą użytkownika:
- zapisuje w localStorage lub cookie (fallback),
- odczytuje nazwę użytkownika,
- podłącza pole input do automatycznego zapisu,
- podmienia placeholdery w tekstach.

---
## 🔧 Metody

### `static storageKey()`

Klucz używany w localStorage i cookie



---
## 🔗 Zależności

- `RegExp`
- `cookie`
- `document`
- `dom`
- `input`
- `localStorage`
- `text`
- `this`
- `value`

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
/

/**
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
## 🔗 Zależności

- `Date`
- `LoggerService`
- `Math`
- `btn`
- `console`
- `d`
- `document`
- `fn`
- `i`
- `id`
- `navigator`
- `res`

---

# 🚀 Dokumentacja: init_chat.js

Plik inicjalizacyjny aplikacji. Odpowiada za uruchomienie klas i konfigurację interfejsu.

Zawiera definicję klasy `App`.


---
## 📦 Klasa `App`

# 📦 App

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
/


/**
Context
=======
Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.
/
class Context {
constructor() {
this._registry = new Map();
this.register("logger", LoggerService);
this.register("diagnostics", Diagnostics);
this.register("userManager", UserManager);
this.register("dom", new Dom());
this.register("utils", Utils);
this.register("backendAPI", new BackendAPI());
}

register(name, instance) {
this._registry.set(name, instance);
}

get(name) {
return this._registry.get(name);
}

get logger()      { return this.get("logger"); }
get diagnostics() { return this.get("diagnostics"); }
get userManager() { return this.get("userManager"); }
get dom()         { return this.get("dom"); }
get utils()       { return this.get("utils"); }
get backendAPI()  { return this.get("backendAPI"); }
}

/**
App
===
Fasada aplikacji:
- inicjalizuje moduły (klawiatura, panele, edycja, UI, manager czatu),
- rejestruje zdarzenia globalne (submit, Ctrl+Enter),
- zarządza cyklem życia (init, destroy),
- udostępnia metodę addClearImageCacheButton do wyczyszczenia cache obrazów.

---
## 🔧 Metody

### `constructor(context)`


### `constructor(context)`


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



---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Context`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `Map`
- `Object`
- `PanelsController`
- `TagsPanel`
- `_registry`
- `aplikacji`
- `app`
- `btn`
- `chatManager`
- `ctx`
- `document`
- `dom`
- `e`
- `galleryLoader`
- `gotowa`
- `inputArea`
- `key`
- `keyboardManager`
- `label`
- `localStorage`
- `logger`
- `obrazów`
- `panelsController`
- `prompt`
- `settingSidePanel`
- `tagsPanel`
- `this`
- `userManager`
- `utils`
- `wrapper`

---
## 🔧 Używane klasy

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `PanelsController`
- `TagsPanel`

---
## 🧩 Wywoływane metody `app`

- `app.init()`

---

# 🚀 Dokumentacja: init_chat.js

Plik inicjalizacyjny aplikacji. Odpowiada za uruchomienie klas i konfigurację interfejsu.

Zawiera definicję klasy `App`.


---
## 📦 Klasa `App`

# 📦 App

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
/


/**
Context
=======
Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.
/
class Context {
constructor() {
this._registry = new Map();
this.register("logger", LoggerService);
this.register("diagnostics", Diagnostics);
this.register("userManager", UserManager);
this.register("dom", new Dom());
this.register("utils", Utils);
this.register("backendAPI", new BackendAPI());
}

register(name, instance) {
this._registry.set(name, instance);
}

get(name) {
return this._registry.get(name);
}

get logger()      { return this.get("logger"); }
get diagnostics() { return this.get("diagnostics"); }
get userManager() { return this.get("userManager"); }
get dom()         { return this.get("dom"); }
get utils()       { return this.get("utils"); }
get backendAPI()  { return this.get("backendAPI"); }
}

/**
App
===
Fasada aplikacji:
- inicjalizuje moduły (klawiatura, panele, edycja, UI, manager czatu),
- rejestruje zdarzenia globalne (submit, Ctrl+Enter),
- zarządza cyklem życia (init, destroy),
- udostępnia metodę addClearImageCacheButton do wyczyszczenia cache obrazów.

---
## 🔧 Metody

### `constructor(context)`


### `constructor(context)`


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



---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Context`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `Map`
- `Object`
- `PanelsController`
- `TagsPanel`
- `_registry`
- `aplikacji`
- `app`
- `btn`
- `chatManager`
- `ctx`
- `document`
- `dom`
- `e`
- `galleryLoader`
- `gotowa`
- `inputArea`
- `key`
- `keyboardManager`
- `label`
- `localStorage`
- `logger`
- `obrazów`
- `panelsController`
- `prompt`
- `settingSidePanel`
- `tagsPanel`
- `this`
- `userManager`
- `utils`
- `wrapper`

---
## 🔧 Używane klasy

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `PanelsController`
- `TagsPanel`

---
## 🧩 Wywoływane metody `app`

- `app.init()`

---

# 🚀 Dokumentacja: init_chat.js

Plik inicjalizacyjny aplikacji. Odpowiada za uruchomienie klas i konfigurację interfejsu.

Zawiera definicję klasy `App`.


---
## 📦 Klasa `App`

# 📦 App

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
/


/**
Context
=======
Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.
/
class Context {
constructor() {
this._registry = new Map();
this.register("logger", LoggerService);
this.register("diagnostics", Diagnostics);
this.register("userManager", UserManager);
this.register("dom", new Dom());
this.register("utils", Utils);
this.register("backendAPI", new BackendAPI());
}

register(name, instance) {
this._registry.set(name, instance);
}

get(name) {
return this._registry.get(name);
}

get logger()      { return this.get("logger"); }
get diagnostics() { return this.get("diagnostics"); }
get userManager() { return this.get("userManager"); }
get dom()         { return this.get("dom"); }
get utils()       { return this.get("utils"); }
get backendAPI()  { return this.get("backendAPI"); }
}

/**
App
===
Fasada aplikacji:
- inicjalizuje moduły (klawiatura, panele, edycja, UI, manager czatu),
- rejestruje zdarzenia globalne (submit, Ctrl+Enter),
- zarządza cyklem życia (init, destroy),
- udostępnia metodę addClearImageCacheButton do wyczyszczenia cache obrazów.

---
## 🔧 Metody

### `constructor(context)`


### `constructor(context)`


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



---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Context`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `Map`
- `Object`
- `PanelsController`
- `TagsPanel`
- `_registry`
- `aplikacji`
- `app`
- `btn`
- `chatManager`
- `ctx`
- `document`
- `dom`
- `e`
- `galleryLoader`
- `gotowa`
- `inputArea`
- `key`
- `keyboardManager`
- `label`
- `localStorage`
- `logger`
- `obrazów`
- `panelsController`
- `prompt`
- `settingSidePanel`
- `tagsPanel`
- `this`
- `userManager`
- `utils`
- `wrapper`

---
## 🔧 Używane klasy

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `PanelsController`
- `TagsPanel`

---
## 🧩 Wywoływane metody `app`

- `app.init()`

---

# 🚀 Dokumentacja: init_chat.js

Plik inicjalizacyjny aplikacji. Odpowiada za uruchomienie klas i konfigurację interfejsu.

Zawiera definicję klasy `App`.


---
## 📦 Klasa `App`

# 📦 App

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
/


/**
Context
=======
Kontener zależności aplikacji. Przechowuje i udostępnia instancje usług.
/
class Context {
constructor() {
this._registry = new Map();
this.register("logger", LoggerService);
this.register("diagnostics", Diagnostics);
this.register("userManager", UserManager);
this.register("dom", new Dom());
this.register("utils", Utils);
this.register("backendAPI", new BackendAPI());
}

register(name, instance) {
this._registry.set(name, instance);
}

get(name) {
return this._registry.get(name);
}

get logger()      { return this.get("logger"); }
get diagnostics() { return this.get("diagnostics"); }
get userManager() { return this.get("userManager"); }
get dom()         { return this.get("dom"); }
get utils()       { return this.get("utils"); }
get backendAPI()  { return this.get("backendAPI"); }
}

/**
App
===
Fasada aplikacji:
- inicjalizuje moduły (klawiatura, panele, edycja, UI, manager czatu),
- rejestruje zdarzenia globalne (submit, Ctrl+Enter),
- zarządza cyklem życia (init, destroy),
- udostępnia metodę addClearImageCacheButton do wyczyszczenia cache obrazów.

---
## 🔧 Metody

### `constructor(context)`


### `constructor(context)`


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



---
## 🔗 Zależności

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Context`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `Map`
- `Object`
- `PanelsController`
- `TagsPanel`
- `_registry`
- `aplikacji`
- `app`
- `btn`
- `chatManager`
- `ctx`
- `document`
- `dom`
- `e`
- `galleryLoader`
- `gotowa`
- `inputArea`
- `key`
- `keyboardManager`
- `label`
- `localStorage`
- `logger`
- `obrazów`
- `panelsController`
- `prompt`
- `settingSidePanel`
- `tagsPanel`
- `this`
- `userManager`
- `utils`
- `wrapper`

---
## 🔧 Używane klasy

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `PanelsController`
- `TagsPanel`

---
## 🧩 Wywoływane metody `app`

- `app.init()`