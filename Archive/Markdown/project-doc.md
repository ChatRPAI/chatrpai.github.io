# 📘 Dokumentacja projektu

Ten plik zawiera pełną dokumentację klas JavaScript wygenerowaną automatycznie na podstawie kodu źródłowego.

Zadawaj mi pytania dotyczące projektu. Jak np.: `Czy możesz mi podać kod klasy/metody xyz?` Tak aby refaktoryzacja była łatwiejsza i lepsza.

---

## 📦 BackendAPI

# 📦 BackendAPI

BackendAPI
==========
Klasa odpowiedzialna za komunikację z backendem aplikacji.
Stanowi warstwę abstrakcji nad interfejsem HTTP i obsługuje:
- generowanie odpowiedzi na podstawie promptu użytkownika,
- przesyłanie ocen wygenerowanych odpowiedzi,
- edycję odpowiedzi z uwzględnieniem tagów.
Wszystkie metody wykorzystują `fetch` z metodą POST i przesyłają dane w formacie JSON.

Zależności:
- Klasa nie posiada zależności zewnętrznych, ale jest wykorzystywana przez komponenty frontendowe takie jak `ChatManager`, `EditManager` czy `ChatUI`,
które korzystają z jej metod do komunikacji z serwerem.


---

## 📦 ChatManager

# 📦 ChatManager

ChatManager
===========
Klasa odpowiedzialna za zarządzanie przepływem wiadomości między użytkownikiem, interfejsem czatu (ChatUI) i backendem (BackendAPI).
Stanowi centralny kontroler logiki czatu, łącząc warstwę UI z warstwą komunikacji serwerowej.
Obsługuje:
- odczytanie promptu od użytkownika,
- wysłanie zapytania do backendu,
- wyświetlenie odpowiedzi AI,
- obsługę błędów,
- dodanie opcji edycji i oceny odpowiedzi.

Zależności:
- `ChatUI`: odpowiada za manipulację interfejsem użytkownika (dodawanie wiadomości, komunikatów, przycisków).
- `BackendAPI`: odpowiada za komunikację z serwerem (generowanie odpowiedzi, przesyłanie ocen, edycja).
- `Dom`: dostarcza referencje do elementów DOM (np. pole promptu).

---
## 🔧 Metody

### `constructor(chatUI, backendAPI, dom)`

Tworzy instancję klasy ChatManager z dostępem do interfejsu czatu, API backendu i elementów DOM.

**Parametry:**
- `chatUI` (`ChatUI`): Instancja klasy ChatUI, odpowiedzialna za warstwę wizualną czatu.
- `backendAPI` (`BackendAPI`): Instancja klasy BackendAPI, odpowiedzialna za komunikację z backendem.
- `dom` (`Dom`): Instancja klasy Dom, zawierająca referencje do elementów DOM.


---

## 📦 ChatUI

# 📦 ChatUI

ChatUI
======
Klasa odpowiedzialna za zarządzanie warstwą wizualną czatu.
Obsługuje:
- dodawanie wiadomości użytkownika i AI,
- wyświetlanie komunikatów ładowania i błędów,
- aktualizację odpowiedzi AI,
- dodawanie przycisku edycji i formularza oceny,
- przewijanie widoku do ostatniej wiadomości.

Zależności:
- `Dom`: dostarcza referencje do kontenera czatu i innych elementów DOM.
- `EditManager`: obsługuje tryb edycji wiadomości AI.
- `Utils`: dostarcza funkcje pomocnicze (np. tworzenie przycisków).
- `app.backendAPI`: wykorzystywany w formularzu oceny do przesyłania danych.

---
## 🔧 Metody

### `constructor(domInstance, editManager)`

Tworzy instancję klasy ChatUI z dostępem do elementów DOM i menedżera edycji.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.
- `editManager` (`EditManager`): Instancja klasy EditManager do obsługi edycji wiadomości.

### `addMessage(type, text)`

Dodaje wiadomość do kontenera czatu.
Tworzy element `<div>` z klasą `message` i typem (`user` lub `ai`).

**Parametry:**
- `type` (`string`): Typ wiadomości (`user` lub `ai`).
- `text` (`string`): Treść wiadomości.

### `addLoadingMessage()`

Dodaje wiadomość tymczasową informującą o generowaniu odpowiedzi.
Aktualizuje tekst co sekundę, pokazując czas oczekiwania.


### `updateAIMessage(msgEl, response, duration)`

Aktualizuje wiadomość AI po zakończeniu generowania.
Wstawia czas generowania i odpowiedź w formacie HTML.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości do aktualizacji.
- `response` (`string`): Treść odpowiedzi AI.
- `duration` (`number`): Czas generowania w sekundach.

### `showError(msgEl)`

Wyświetla komunikat błędu w wiadomości AI.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości do aktualizacji.

### `addEditButton(msgEl, originalText, messageId = "msg-temp", sessionId = "session-temp")`

Dodaje przycisk edycji do wiadomości.
Wywołuje EditManager.enableEdit() z przekazanym tekstem.

**Parametry:**
- `msgEl` (`HTMLElement`): Element wiadomości, do którego dodawany jest przycisk.
- `originalText` (`string`): Oryginalna treść wiadomości.

### `addRatingForm()`

Dodaje formularz oceny odpowiedzi AI.
Formularz zawiera suwaki dla pięciu kryteriów oraz przycisk wysyłania.
Po kliknięciu wysyła dane do backendu.


### `scrollToBottom()`

Przewija widok czatu do ostatniej wiadomości.



---

## 📦 Diagnostics

# 📦 Diagnostics

Diagnostics
===========
Klasa odpowiedzialna za zbieranie i prezentowanie informacji diagnostycznych o stanie aplikacji.
Umożliwia:
- odczyt parametrów widoku (viewport, scroll, wysokości elementów),
- wyświetlanie danych w konsoli,
- wstawianie danych do pola tekstowego (np. #prompt),
- szybkie uruchomienie pełnej diagnostyki.

Zależności:
- `Dom`: klasa dostarczająca referencje do elementów DOM, takich jak `chatWrapper`, `inputArea`, `prompt`.
Instancja `Dom` musi być przekazana do konstruktora, aby `Diagnostics` mogła odczytywać pozycje i rozmiary elementów.

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję klasy Diagnostics z dostępem do elementów DOM.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `collectData()`

Zbiera dane diagnostyczne z bieżącego stanu aplikacji.
Odczytuje parametry z `visualViewport`, `window`, `document`, `body` oraz pozycje elementów DOM.

- `timestamp`: {string} aktualny czas w formacie HH:MM:SS,
- `visualViewportHeight`: {number} wysokość widocznego obszaru viewportu,
- `visualViewportOffsetTop`: {number} przesunięcie viewportu od góry,
- `visualViewportOffsetLeft`: {number} przesunięcie viewportu od lewej,
- `windowInnerHeight`: {number} wysokość okna wewnętrznego,
- `windowOuterHeight`: {number} wysokość okna zewnętrznego,
- `documentClientHeight`: {number} wysokość dokumentu HTML,
- `bodyClientHeight`: {number} wysokość elementu body,
- `wrapperOffsetTop`: {number} pozycja górna kontenera czatu,
- `wrapperOffsetBottom`: {number} pozycja dolna kontenera czatu,
- `wrapperHeight`: {number} wysokość kontenera czatu,
- `inputAreaOffsetTop`: {number} pozycja górna pola wejściowego,
- `inputAreaOffsetBottom`: {number} pozycja dolna pola wejściowego,
- `inputAreaHeight`: {number} wysokość pola wejściowego,
- `scrollY`: {number} aktualna pozycja scrolla pionowego,
- `scrollX`: {number} aktualna pozycja scrolla poziomego.


### `logToConsole()`

Wyświetla dane diagnostyczne w konsoli w formie tabeli.
Używa `console.table()` dla czytelnej prezentacji.


### `outputToPrompt()`

Wstawia dane diagnostyczne do pola tekstowego (np. #prompt).
Formatowane jako lista klucz-wartość z jednostką `px`.
Jeśli wartość jest `null` lub `undefined`, zostaje zaokrąglona do 0.


### `run()`

Uruchamia pełną diagnostykę:
- wyświetla dane w konsoli (`console.table`),
- wstawia dane do pola tekstowego (#prompt).



---

## 📦 Dom

# 📦 Dom

Dom
===
Centralna klasa odpowiedzialna za dostęp do elementów DOM w aplikacji.
Umożliwia:
- jednolite i bezpieczne pobieranie elementów interfejsu,
- przechowywanie referencji do najczęściej używanych komponentów,
- ograniczenie wielokrotnego wyszukiwania tych samych selektorów,
- łatwą modyfikację struktury HTML bez konieczności zmian w wielu miejscach kodu.

Zależności:
- Klasa nie posiada zależności zewnętrznych, ale jest wykorzystywana przez inne komponenty aplikacji,
takie jak `ChatUI`, `ChatManager`, `Diagnostics`, `EditManager`, które korzystają z jej referencji do elementów DOM.

---
## 🔧 Metody

### `constructor()`

Tworzy instancję klasy Dom i inicjalizuje referencje do elementów interfejsu.
Wszystkie elementy są pobierane raz i przechowywane jako właściwości instancji.
W przypadku braku elementu, wypisywane jest ostrzeżenie w konsoli.


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
this.sidePanel = this.q("#side-panel");

/** @type {HTMLTemplateElement} Szablon panelu tagów */
this.tagPanelTemplate = this.q("#tag-panel-template");
}

/**
Skrót do `document.querySelector` z walidacją.
Pobiera pierwszy element pasujący do selektora CSS.
Jeśli element nie zostanie znaleziony, wypisuje ostrzeżenie w konsoli.

**Parametry:**
- `selector` (`string`): Selektor CSS elementu.

### `qa(selector)`

Skrót do `document.querySelectorAll`.
Pobiera wszystkie elementy pasujące do selektora CSS.

**Parametry:**
- `selector` (`string`): Selektor CSS elementów.


---

## 📦 EditManager

# 📦 EditManager

EditManager
===========
Klasa odpowiedzialna za obsługę procesu edycji wiadomości AI w interfejsie czatu.
Umożliwia:
- uruchomienie trybu edycji inline (textarea, tagi, galeria obrazów),
- dynamiczne renderowanie obrazów na podstawie wybranych tagów,
- zapisanie zmian do backendu,
- anulowanie edycji i przywrócenie pierwotnej wiadomości.

Zależności:
- `Dom`: dostarcza dostęp do szablonu panelu tagów (`tagPanelTemplate`) oraz innych elementów DOM.
- `BackendAPI`: umożliwia przesyłanie edytowanej wiadomości i tagów do backendu.
- `GalleryLoader`: renderuje obrazy na podstawie URLi wygenerowanych przez `ImageResolver`.
- `TagsPanel`: zarządza dynamicznymi polami tagów i aktualizacją galerii.
- `ImageResolver`: generuje listę dostępnych obrazów na podstawie kombinacji tagów.
- `Utils`: dostarcza funkcje pomocnicze, m.in. tworzenie przycisków.

---
## 🔧 Metody

### `constructor(dom, backendAPI)`

Tworzy instancję klasy EditManager.

**Parametry:**
- `dom` (`Dom`): Instancja klasy Dom z dostępem do szablonu panelu tagów.
- `backendAPI` (`BackendAPI`): Instancja klasy BackendAPI do komunikacji z serwerem.

### `enableEdit(msgElement, originalText, messageId, sessionId)`

Uruchamia tryb edycji dla wskazanej wiadomości.
Tworzy interfejs edycji zawierający:
- pole tekstowe z oryginalną treścią,
- panel tagów,
- galerię obrazów,
- przyciski zapisu i anulowania.

**Parametry:**
- `msgElement` (`HTMLElement`): Element wiadomości do edycji.
- `originalText` (`string`): Oryginalna treść wiadomości.
- `messageId` (`string`): Identyfikator wiadomości (do backendu).
- `sessionId` (`string`): Identyfikator sesji (do backendu).

### `getSelectedTags(tagPanel)`

Pobiera aktualnie wybrane tagi z panelu.

**Parametry:**
- `tagPanel` (`HTMLElement`): Kontener zawierający pola tagów.

### `attachTagListeners(tagPanel, imageGallery)`

Podłącza nasłuchiwanie zmian w polach tagów.
Po każdej zmianie aktualizowana jest galeria obrazów.

**Parametry:**
- `tagPanel` (`HTMLElement`): Kontener z polami tagów.
- `imageGallery` (`HTMLElement`): Element galerii obrazów.


---

## 📦 GalleryLoader

# 📦 GalleryLoader

GalleryLoader
=============
Klasa odpowiedzialna za ładowanie i renderowanie obrazów w galerii znajdującej się w przekazanym kontenerze DOM.
Obsługuje:
- czyszczenie galerii,
- wyświetlanie komunikatów informacyjnych,
- renderowanie obrazów z URLi,
- pobieranie danych z API i aktualizację widoku,
- integrację z tagami i wybór obrazów przez użytkownika.

Zależności:
- `ImageResolver`: generuje listę URLi obrazów na podstawie tagów.
- `Utils`: dostarcza funkcje pomocnicze (np. tworzenie przycisków, debounce).
- `HTMLElement` z `#image-gallery` musi istnieć w przekazanym kontenerze.

---
## 🔧 Metody

### `constructor(container)`

Tworzy instancję loadera i lokalizuje element galerii w przekazanym kontenerze.
@throws {Error} Jeśli przekazany kontener nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Kontener panelu tagów zawierający galerię.

### `clearGallery()`

this.gallery = container.querySelector("#image-gallery");
}

/**
Czyści zawartość galerii — usuwa wszystkie dzieci z elementu `#image-gallery`.


### `showMessage(message)`

Wyświetla komunikat tekstowy w galerii.
Czyści poprzednią zawartość i dodaje nowy element z wiadomością.

**Parametry:**
- `message` (`string`): Tekst komunikatu do wyświetlenia.

### `renderImages(urls)`

Renderuje obrazy na podstawie tagów (z użyciem ImageResolver).
Pobiera listę URLi i przekazuje je do metody renderującej.
/
async renderFromTags(tags) {
const urls = await ImageResolver.resolve(tags);
this.renderImages(urls);
}

/**
Renderuje obrazy w galerii na podstawie przekazanych URLi.
Każdy obraz jest dodawany jako element `<img>` z atrybutem `loading="lazy"`,
opakowany w `<label>` z ukrytym `input[type="radio"]` umożliwiającym wybór.

**Parametry:**
- `tags` (`string[]`): Lista tagów do przetworzenia.
- `urls` (`string[]`): Tablica URLi obrazów do wyświetlenia.

### `highlightSelected(selectedWrapper)`

Podświetla wybrany obraz w galerii.
Usuwa klasę `selected` ze wszystkich obrazów i dodaje ją do wybranego.

**Parametry:**
- `selectedWrapper` (`HTMLElement`): Element `<label>` zawierający wybrany obraz.


---

## 📦 ImageResolver

# 📦 ImageResolver

ImageResolver
=============
Klasa odpowiedzialna za generowanie listy dostępnych obrazów na podstawie kombinacji tagów.
Obsługuje:
- tworzenie nazw plików z tagów,
- sprawdzanie dostępności obrazów (z cache, localStorage lub przez zapytanie HEAD),
- preloadowanie obrazów do przeglądarki,
- optymalizację zapytań przez pamięć podręczną.

Zależności:
- `fetch`: do wykonywania zapytań HEAD w celu sprawdzenia dostępności obrazów.
- `localStorage`: do trwałego cache'owania wyników dostępności obrazów między sesjami.
- `Image`: do preloadowania obrazów w tle.
- Współpracuje z klasą `GalleryLoader`, która renderuje obrazy na podstawie URLi zwróconych przez `resolve()`.


---

## 📦 KeyboardManager

# 📦 KeyboardManager

KeyboardManager
===============
Klasa odpowiedzialna za zarządzanie pozycjonowaniem interfejsu w momencie pojawienia się klawiatury ekranowej.
Jej głównym celem jest zapewnienie, że pole wprowadzania wiadomości (`#input-area`) pozostaje widoczne nad klawiaturą,
szczególnie na urządzeniach mobilnych i w przeglądarkach takich jak Firefox, które wymagają dodatkowego fixu.

Zależności:
- `Dom`: klasa dostarczająca referencje do elementów DOM, w tym `inputArea`.
- `visualViewport`: API przeglądarki służące do wykrywania zmian w widocznej części viewportu.
- `navigator.userAgent`: używany do wykrycia przeglądarki Firefox i zastosowania odpowiedniego workaroundu.

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję KeyboardManager z dostępem do elementów DOM.
Wykrywa, czy użytkownik korzysta z przeglądarki Firefox.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `init()`

this.dom = domInstance;

/** @type {boolean} Flaga wykrywająca przeglądarkę Firefox */
this.isFirefox = /firefox/i.test(navigator.userAgent);
}

/**
Inicjalizuje nasłuchiwanie zdarzeń związanych z klawiaturą ekranową.
Używa API `visualViewport` do wykrywania zmian rozmiaru i scrolla.
Jeśli API jest niedostępne, wypisuje ostrzeżenie w konsoli.


### `updatePosition()`

Aktualizuje pozycję pola `input-area`, tak aby znajdowało się nad klawiaturą.
Oblicza wysokość klawiatury na podstawie różnicy między `window.innerHeight` a `visualViewport.height + offsetTop`.
Ustawia wartość `bottom` w stylach CSS dla `input-area`.
Dodatkowo stosuje fix dla Firefoksa, który może mieć problemy z przewijaniem.



---

## 📦 PanelsController

# 📦 PanelsController

PanelsController
================
Klasa odpowiedzialna za zarządzanie panelami bocznymi aplikacji.
Obsługuje:
- otwieranie i zamykanie paneli (np. menu nawigacyjne, ustawienia),
- przełączanie widoczności paneli na podstawie interakcji użytkownika,
- zapewnienie, że tylko jeden panel może być otwarty w danym momencie.

Zależności:
- `Dom`: klasa dostarczająca referencje do elementów DOM, takich jak przyciski (`burgerToggle`, `settingsToggle`)
oraz kontenery paneli (`webSidePanel`, `sidePanel`).
- Panele są identyfikowane przez klasę CSS `open`, która kontroluje ich widoczność.

---
## 🔧 Metody

### `constructor(domInstance)`

Tworzy instancję kontrolera paneli i rejestruje powiązania przycisków z panelami.

**Parametry:**
- `domInstance` (`Dom`): Instancja klasy Dom z referencjami do elementów.

### `init()`

this.dom = domInstance;

/**
Lista par: przycisk → panel, które będą obsługiwane przez kontroler.
/
this.panels = [
{ button: this.dom.burgerToggle, panel: this.dom.webSidePanel },
{ button: this.dom.settingsToggle, panel: this.dom.sidePanel },
];
}

/**
Inicjalizuje nasłuchiwanie kliknięć w przyciski paneli.
Po kliknięciu przycisku wywoływana jest funkcja przełączająca widoczność panelu.


### `openPanel(panel)`

Otwiera wskazany panel i zamyka wszystkie pozostałe.
Dodaje klasę `open` do wybranego panelu.

**Parametry:**
- `panel` (`HTMLElement`): Panel do otwarcia.

### `closePanel(panel)`

Zamyka wskazany panel.
Usuwa klasę `open` z danego panelu.

**Parametry:**
- `panel` (`HTMLElement`): Panel do zamknięcia.

### `togglePanel(panel)`

Przełącza stan panelu — jeśli jest otwarty, zostanie zamknięty; jeśli zamknięty, zostanie otwarty.
Zapewnia, że tylko jeden panel może być otwarty w danym momencie.

**Parametry:**
- `panel` (`HTMLElement`): Panel do przełączenia.

### `closeAllPanels()`

Zamyka wszystkie panele w aplikacji.
Usuwa klasę `open` ze wszystkich zarejestrowanych paneli.



---

## 📦 TagSelectorFactory

# 📦 TagSelectorFactory

TagSelectorFactory
==================
Klasa odpowiedzialna za tworzenie komponentów wyboru tagów w interfejsie użytkownika.
Dostosowuje typ komponentu do urządzenia:
- na urządzeniach mobilnych generuje element `<select>`,
- na desktopie generuje pole `<input>` z powiązanym `<datalist>`.

Obsługuje:
- dynamiczne źródła opcji dla każdego pola tagu,
- etykiety opisowe dla pól,
- integrację z klasą `TagsPanel`, która zarządza całością panelu tagów.

Zależności:
- `Utils.isMobile()`: wykorzystywane do detekcji typu urządzenia i wyboru odpowiedniego komponentu.
- `TagsPanel`: klasa, która wykorzystuje `TagSelectorFactory` do generowania pól tagów.


---

## 📦 TagsPanel

# 📦 TagsPanel

TagsPanel
=========
Klasa odpowiedzialna za zarządzanie panelem tagów w interfejsie użytkownika.
Obsługuje:
- dynamiczne tworzenie pól tagów (lokalizacja, postać, czynność, emocja, NSFW),
- reagowanie na zmiany wartości tagów i przekazywanie ich do callbacka,
- aktualizację galerii obrazów na podstawie wybranych tagów,
- czyszczenie pól tagów,
- integrację z `TagSelectorFactory`, `GalleryLoader` i `ImageResolver`.

Zależności:
- `TagSelectorFactory`: generuje komponenty tagów (`<select>` lub `<input list>`), zależnie od urządzenia.
- `GalleryLoader`: renderuje obrazy na podstawie tagów.
- `ImageResolver`: wykorzystywany pośrednio przez `GalleryLoader` do generowania URLi obrazów.
- `Utils.debounce()`: ogranicza częstotliwość aktualizacji galerii przy zmianach tagów.

---
## 🔧 Metody

### `constructor(container, galleryLoader)`

Tworzy instancję klasy TagsPanel.
Inicjalizuje kontener, loader galerii, pola tagów oraz galerię obrazów.

@throws {Error} Jeśli przekazany kontener nie jest elementem DOM.

**Parametry:**
- `container` (`HTMLElement`): Kontener panelu tagów (np. sklonowany z <template>).
- `galleryLoader` (`GalleryLoader`): Instancja klasy GalleryLoader do renderowania obrazów.

### `q(selector)`

this.container = container;

/** @type {GalleryLoader} Loader galerii obrazów */
this.galleryLoader = galleryLoader;

/** @type {Object.<string, HTMLElement>} Referencje do pól tagów */
this.fields = {};

this.buildTagFields();
this.refreshGallery();

/** @type {HTMLElement} Element galerii obrazów */
const gallery = document.createElement("div");
gallery.id = "image-gallery";
gallery.className = "gallery-grid mt-10";
this.container.appendChild(gallery);
this.gallery = gallery;
}

/**
Skrót do `querySelector` w obrębie kontenera.
Jeśli element nie zostanie znaleziony, wypisuje ostrzeżenie.

**Parametry:**
- `selector` (`string`): Selektor CSS.

### `buildTagFields()`

Tworzy pola tagów dynamicznie z użyciem `TagSelectorFactory`.
Wstawia je do kontenera i zapisuje referencje w `this.fields`.


### `init(onChange)`

Inicjalizuje nasłuchiwanie zmian w polach tagów.
Po każdej zmianie wywoływany jest callback i aktualizowana jest galeria.

**Parametry:**
- `onChange` (`Function`): Funkcja wywoływana przy każdej zmianie tagów.

### `getSelectedTags()`

Zwraca aktualnie wybrane tagi jako obiekt.


### `getTagList()`

Zwraca aktualnie wybrane tagi jako tablicę stringów.
Pomija puste wartości.


### `refreshGallery()`

Aktualizuje galerię obrazów na podstawie aktualnych tagów.
Wywołuje `GalleryLoader.renderFromTags()`.


### `clearTags()`

Czyści wszystkie pola tagów.
Ustawia ich wartość na pustą i aktualizuje galerię.



---

## 📦 Utils

# 📦 Utils

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

Zależności:
- `window`, `navigator.userAgent`: wykorzystywane do detekcji środowiska.
- `document`: używany do manipulacji DOM.
- `fetch`: do sprawdzania dostępności obrazów przez zapytania HEAD.


---

## 📦 init_chat.js

# 🚀 Dokumentacja: init_chat.js

Plik inicjalizacyjny aplikacji. Odpowiada za uruchomienie klas i konfigurację interfejsu.

Zawiera definicję klasy `App`.


---
## 📦 Klasa `App`

# 📦 App

App
===
Główna klasa aplikacji, odpowiedzialna za inicjalizację i integrację wszystkich modułów frontendowych.
Obsługuje:
- tworzenie instancji klas pomocniczych i kontrolerów,
- rejestrowanie zdarzeń globalnych,
- uruchamianie interfejsu czatu, paneli bocznych, edycji wiadomości, diagnostyki,
- renderowanie panelu tagów i zarządzanie pamięcią podręczną obrazów.

Zależności:
- `Dom`: dostarcza referencje do elementów DOM.
- `Utils`: zbiór funkcji pomocniczych (np. debounce, createButton).
- `BackendAPI`: komunikacja z backendem (generowanie, edycja, ocena).
- `KeyboardManager`: zarządzanie pozycjonowaniem pola tekstowego względem klawiatury ekranowej.
- `PanelsController`: obsługa paneli bocznych (menu, ustawienia).
- `EditManager`: tryb edycji wiadomości AI.
- `ChatUI`: interfejs czatu.
- `ChatManager`: logika przepływu wiadomości.
- `Diagnostics`: zbieranie danych o stanie aplikacji.
- `TagsPanel`, `GalleryLoader`: obsługa tagów i dynamicznej galerii obrazów.

---
## 🔧 Metody

### `constructor()`

Tworzy instancję aplikacji i inicjalizuje wszystkie moduły.
Moduły są tworzone i powiązane ze sobą w odpowiedniej kolejności.


### `addClearImageCacheButton()`

Dodaje przycisk do panelu ustawień umożliwiający wyczyszczenie pamięci podręcznej obrazów.
Usuwa wpisy `img-exists:*` z `localStorage` i wyświetla komunikat z liczbą usuniętych rekordów.


### `renderTagPanel(targetSelector = "#side-panel")`

Wstawia zawartość szablonu `<template class="tag-panel-template">` do wskazanego kontenera DOM.
Inicjalizuje `TagsPanel` i `GalleryLoader` na podstawie wstawionego panelu.

**Parametry:**
- `targetSelector` (`string`): Selektor miejsca, w którym ma się pojawić panel (domyślnie `#side-panel`).

### `initTagModules()`

Inicjalizuje moduły zależne od panelu tagów.
Tworzy instancje `TagsPanel` i `GalleryLoader` oraz rejestruje callback aktualizujący galerię.


### `init()`

Uruchamia aplikację:
- inicjalizuje menedżery klawiatury i paneli,
- rejestruje zdarzenia globalne (submit, Ctrl+Enter),
- dodaje przycisk czyszczenia pamięci obrazów,
- wypisuje komunikat o gotowości aplikacji.



---
## 🔧 Używane klasy

- `BackendAPI`
- `ChatManager`
- `ChatUI`
- `Diagnostics`
- `Dom`
- `EditManager`
- `GalleryLoader`
- `KeyboardManager`
- `PanelsController`
- `TagsPanel`
- `Utils`

---
## 🧩 Wywoływane metody `app`

- `app.init()`

---

## 🧱 Plan rozwojowy – refaktoryzacja i wzorce projektowe

### 🎯 Cel główny

Przekształcenie istniejącego kodu proceduralnego w modularną architekturę obiektową opartą na klasach, z zastosowaniem wzorców projektowych, tak aby:

- zwiększyć czytelność i skalowalność kodu,
- ułatwić testowanie i rozbudowę,
- oddzielić odpowiedzialności i zależności,
- umożliwić dalszy rozwój aplikacji w sposób kontrolowany.

---

### 🧩 Refaktoryzacja kodu do klas

| Obszar funkcjonalny          | Obecny stan                            | Plan refaktoryzacji                           |
| ---------------------------- | -------------------------------------- | --------------------------------------------- |
| DOM globalny (`DOM`)         | Obiekt z referencjami                  | Zastąpiony przez klasę `Dom` (✅ już gotowa)  |
| Obsługa promptu i wiadomości | Funkcje `sendPrompt`, `appendMessage`  | Przeniesione do `ChatManager` i `ChatUI` (✅) |
| Edycja wiadomości            | Funkcja `enableEdit`                   | Wydzielenie klasy `EditManager`               |
| Obsługa tagów                | Funkcje `getSelectedTags`, `clearTags` | Zastąpione przez `TagsPanel` (✅)             |
| Galeria obrazów              | Funkcja `findMatchingImagesAndRender`  | Refaktoryzacja do `ImageResolver`             |
| Formularz oceny              | Funkcja `appendRatingForm`             | Przeniesienie do `RatingForm` jako klasy      |
| Obsługa klawiatury ekranowej | Funkcja `updateForKeyboard`            | Zastąpiona przez `KeyboardManager` (✅)       |
| Przycisk edycji              | Funkcja `createButton`                 | Przeniesienie do `Utils.createButton` (✅)    |

---

### 🧠 Wzorce projektowe do zastosowania

| Wzorzec           | Zastosowanie                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| Singleton         | Klasa `Dom` jako pojedyncza instancja dostępna globalnie                    |
| Factory           | `TagSelectorFactory` do tworzenia komponentów tagów (datalist/select)       |
| Mediator          | `ChatManager` jako pośrednik między UI, backendem i DOM                     |
| Observer / PubSub | `EditManager`, `TagsPanel`, `RatingForm` do komunikacji między komponentami |
| Command           | Obsługa edycji wiadomości jako komendy z możliwością cofania                |
| Adapter           | `BackendAPI` jako warstwa komunikacji z backendem                           |
| Strategy          | Walidacja tagów, wybór obrazów, tryby renderowania                          |
| Decorator         | Rozszerzanie `Diagnostics` o logowanie, mockowanie, testowanie              |

---

### 🔧 Brakujące funkcjonalności do uzupełnienia

| Funkcja                       | Status    | Plan działania                                       |
| ----------------------------- | --------- | ---------------------------------------------------- |
| Edycja wiadomości z tagami    | Częściowo | Wydzielenie `EditManager`, integracja z `BackendAPI` |
| Dynamiczna galeria obrazów    | Częściowo | Refaktoryzacja do `ImageResolver`                    |
| Ocena odpowiedzi AI           | Częściowo | Przeniesienie do klasy `RatingForm`                  |
| Obsługa mobilna tagów         | Ręcznie   | Automatyzacja przez `TagSelectorFactory`             |
| Historia czatu                | Brak      | Dodanie `ChatHistoryManager`                         |
| Tryb testowy / mockowanie API | Brak      | Wprowadzenie `MockBackendAPI`                        |
| Logger i śledzenie błędów     | Brak      | Dodanie `LoggerService`                              |

---

### 📦 Proponowane nowe klasy

| Klasa                | Cel                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `EditManager`        | Obsługa procesu edycji wiadomości, tagów i obrazów                                                            |
| `ImageResolver`      | Logika wyszukiwania i renderowania obrazów na podstawie tagów                                                 |
| `RatingForm`         | Komponent formularza oceny odpowiedzi AI                                                                      |
| `TagSelectorFactory` | Tworzenie komponentów tagów zależnie od urządzenia                                                            |
| `LoggerService`      | Centralne logowanie błędów i zdarzeń diagnostycznych                                                          |
| `ChatHistoryManager` | Przechowywanie i odczyt historii czatu                                                                        |
| `MockBackendAPI`     | Symulacja odpowiedzi backendu do testów i trybu offline                                                       |
| `TagOptionsRegistry` | Centralizuje źródła opcji tagów i pozwala na ich dynamiczne pobieranie (np. z API, pliku JSON, lokalStorage). |

## 🛠️ Kod przed refaktoryzacją

```js
const DOM = {
  // Te zmienne są teraz null na początku
  chatContainer: null,
  promptInput: null,
  userNameInput: null,
  tagPanelTemplate: null,
};

let currentUserName = "Kira";
const MAX_USERNAME_LENGTH = 20;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// Nowe zdarzenie: poczekaj, aż cały DOM zostanie załadowany
document.addEventListener("DOMContentLoaded", () => {
  // Inicjalizuj stałe DOM dopiero po załadowaniu całej strony
  DOM.chatContainer = document.getElementById("chat-container");
  DOM.promptInput = document.getElementById("prompt");
  DOM.userNameInput = document.querySelector("#user_name");
  DOM.tagPanelTemplate = document.querySelector(".tag-panel-template");

  // Listenery zdarzeń
  DOM.userNameInput.maxLength = MAX_USERNAME_LENGTH;
  DOM.userNameInput.placeholder = `Twoje imię (max ${MAX_USERNAME_LENGTH} znaków)`;
  DOM.userNameInput.addEventListener("input", setUserName);
});

document.getElementById("prompt").addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") {
    sendPrompt();
    e.preventDefault();
  }
});

document.querySelector("#settings-toggle").addEventListener("click", () => {
  document.querySelector("#side-panel").classList.toggle("open");
  if (window.innerWidth <= 768) {
    document.querySelector("#web-side-panel").classList.remove("open");
  }
});
document.querySelector("#burger-toggle").addEventListener("click", () => {
  document.querySelector("#web-side-panel").classList.toggle("open");
  if (window.innerWidth <= 768) {
    document.querySelector("#side-panel").classList.remove("open");
  }
});


function updateForKeyboard() {
  const vv = window.visualViewport;
  const input = document.getElementById("input-area");
  if (!vv || !input) return;

  const keyboard = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
  input.style.bottom = keyboard ? `${keyboard}px` : '0px';
}

window.visualViewport?.addEventListener("resize", updateForKeyboard);
window.visualViewport?.addEventListener("scroll", updateForKeyboard);
window.addEventListener("load", updateForKeyboard);



// // Listenery zdarzeń
// DOM.userNameInput.maxLength = MAX_USERNAME_LENGTH;
// DOM.userNameInput.placeholder = `Twoje imię (max ${MAX_USERNAME_LENGTH} znaków)`;
// DOM.userNameInput.addEventListener("input", setUserName);

// Funkcje pomocnicze
function setUserName() {
  const value = DOM.userNameInput.value.trim();
  if (value) {
    currentUserName = value;
  }
}

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text.replaceAll("{{user}}", currentUserName);
  DOM.chatContainer.appendChild(msg);

  if (sender === "ai") {
    const editBtn = createButton("✏️ Edytuj", () => enableEdit(msg, text));
    msg.appendChild(editBtn);
  }

  DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.onclick = onClick;
  return btn;
}

async function checkImageExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// Główne funkcje
async function sendPrompt() {
  const prompt = DOM.promptInput.value.trim();
  if (!prompt) return;

  DOM.promptInput.value = "";
  DOM.promptInput.disabled = true;
  appendMessage(prompt, "user");

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message ai";
  DOM.chatContainer.appendChild(loadingMsg);

  let secondsElapsed = 0;
  loadingMsg.innerText = `⏳ Generowanie odpowiedzi... (0s)`;

  const timer = setInterval(() => {
    secondsElapsed++;
    loadingMsg.innerText = `⏳ Generowanie odpowiedzi... (${secondsElapsed}s)`;
  }, 1000);

  const startTime = Date.now();

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    clearInterval(timer);

    loadingMsg.innerHTML = `⏱️ Czas generowania: ${duration} sekundy<br><br>${data.response}`;
    DOM.promptInput.disabled = false;

    const editBtn = createButton("✏️ Edytuj", () =>
      enableEdit(loadingMsg, data.response)
    );
    loadingMsg.appendChild(editBtn);
    appendRatingForm();
  } catch (err) {
    clearInterval(timer);
    loadingMsg.innerText = "❌ Błąd generowania odpowiedzi.";
    console.error("Błąd:", err);
    DOM.promptInput.disabled = false;
  }
}

function appendRatingForm() {
  const form = document.createElement("details");
  form.innerHTML = `
    <summary>Ocena⭐</summary>
    <div class="rating-form">
      <h3>Oceń odpowiedź AI</h3>
      <label><span>Narracja:</span><input type="range" min="0" max="5" id="continuity"></label>
      <label><span>Styl:</span><input type="range" min="0" max="5" id="style"></label>
      <label><span>Logika:</span><input type="range" min="0" max="5" id="logic"></label>
      <label><span>Jakość:</span><input type="range" min="0" max="5" id="expectation"></label>
      <label><span>Emocje:</span><input type="range" min="0" max="5" id="emotion"></label>
      <button onclick="submitRating()">Zapisz ocenę</button>
    </div>
  `;
  DOM.chatContainer.appendChild(form);
}

async function submitRating() {
  const ratings = {
    continuity: parseInt(document.getElementById("continuity").value),
    style: parseInt(document.getElementById("style").value),
    logic: parseInt(document.getElementById("logic").value),
    expectation: parseInt(document.getElementById("expectation").value),
    emotion: parseInt(document.getElementById("emotion").value),
  };

  try {
    await fetch("/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings }),
    });
    alert("Ocena zapisana! 👍");
  } catch (err) {
    console.error("Błąd zapisu oceny:", err);
    alert("Nie udało się zapisać oceny. 😞");
  }
}
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

if (isMobile) {
  document
    .querySelector("textarea#prompt")
    .setAttribute("placeholder", "Wpisz wiadomość...");
}

function replaseDatalistAsSelectIfIsMobile() {
  if (!isMobile) return;

  const tagPanel = document.querySelector(".tag-panel");
  // Map input id to placeholder for default option
  const placeholders = {
    "tag-location": "Nie wybrano lokalizacji",
    "tag-character": "Nie wybrano postaci",
    "tag-action": "Nie wybrano czynności",
    "tag-nsfw": "Nie wybrano czynności NSFW",
    "tag-emotion": "Nie wybrano emocji",
  };

  tagPanel.querySelectorAll("input[list]").forEach((input) => {
    const datalistId = input.getAttribute("list");
    const datalist = document.getElementById(datalistId);

    const select = document.createElement("select");
    select.id = input.id;
    select.classList.add("tag-select-mobile");

    // Default option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = placeholders[input.id] || "Nie wybrano";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    datalist.querySelectorAll("option").forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.value;
      select.appendChild(opt);
    });

    input.replaceWith(select);
  });
}

function enableEdit(msgElement, originalText) {
  msgElement.innerHTML = "";

  const textarea = document.createElement("textarea");
  textarea.value = originalText;
  textarea.rows = 6;
  textarea.className = "form-element textarea-base w-full fix-w-full mt-10";

  const tagPanelTemplate = DOM.tagPanelTemplate.content.cloneNode(true);
  const tagPanel = document.createElement("div");
  tagPanel.className = "tag-panel";
  tagPanel.appendChild(tagPanelTemplate);

  const imageGallery = tagPanel.querySelector("#image-gallery");

  const saveBtn = createButton("💾 Zapisz", async () => {
    const selectedTags = ["location", "character", "action", "nsfw", "emotion"]
      .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
      .filter(Boolean);
    const selectedImage = tagPanel.querySelector(
      "input[name='image']:checked"
    )?.value;

    await submitEdit(textarea.value, selectedTags, msgElement, selectedImage);
  });

  const cancelBtn = createButton("❌ Anuluj", () => {
    msgElement.innerHTML = "";
    msgElement.innerText = originalText;
    const editBtn = createButton("✏️ Edytuj", () =>
      enableEdit(msgElement, originalText)
    );
    msgElement.appendChild(editBtn);
  });

  msgElement.appendChild(textarea);
  msgElement.appendChild(tagPanel);
  msgElement.appendChild(saveBtn);
  msgElement.appendChild(cancelBtn);

  // Re-attach event listeners to the new, cloned elements
  ["location", "character", "action", "nsfw", "emotion"].forEach((id) => {
    const el = tagPanel.querySelector(`#tag-${id}`);
    if (!el) return;
    replaseDatalistAsSelectIfIsMobile();

    const eventType = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventType, () => {
      const currentTags = ["location", "character", "action", "nsfw", "emotion"]
        .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
        .filter(Boolean);
      findMatchingImagesAndRender(currentTags, imageGallery);
    });
  });

  // Initial render of images
  const initialTags = ["location", "character", "action", "nsfw", "emotion"]
    .map((id) => tagPanel.querySelector(`#tag-${id}`)?.value.trim())
    .filter(Boolean);
  findMatchingImagesAndRender(initialTags, imageGallery);
}

// Function to find images and render them
async function findMatchingImagesAndRender(tags, galleryElement) {
  galleryElement.innerHTML = "";
  const combinations = [];
  for (let i = tags.length; i > 0; i--) {
    combinations.push(tags.slice(0, i).join("_"));
  }

  for (const base of combinations) {
    for (const ext of IMAGE_EXTENSIONS) {
      const src = `/static/NarrativeIMG/${base}${ext}`;
      if (await checkImageExists(src)) {
        const label = document.createElement("label");
        label.className = "image-label";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "image";
        radio.value = src;
        radio.style.display = "none";

        const img = document.createElement("img");
        img.src = src;
        img.width = 100; //Do wywalenia
        img.height = 100; //Do wywalenia
        img.className = "img-responsive br-2 mt-10";
        img.style.transition = "border-color 0.3s";

        radio.addEventListener("change", () => {
          const allImages = galleryElement.querySelectorAll("img");
          allImages.forEach((i) => (i.style.border = "2px solid transparent"));
          img.style.border = "2px solid #49c28f";
        });

        label.appendChild(radio);
        label.appendChild(img);
        galleryElement.appendChild(label);
      }
    }
  }
}

async function submitEdit(editedText, tags, msgElement, imageUrl) {
  try {
    await fetch("/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edited: editedText, tags }),
    });

    alert("Poprawiona wersja zapisana! 👍");

    msgElement.innerHTML = "";

    const finalText = document.createElement("div");
    finalText.innerText = editedText;
    msgElement.appendChild(finalText);

    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.width = 400;
      img.className = "img-responsive br-2 mt-10";

      msgElement.appendChild(img);
    }

    const editBtn = createButton("✏️ Edytuj", () =>
      enableEdit(msgElement, editedText)
    );
    msgElement.appendChild(editBtn);
  } catch (err) {
    console.error("Błąd zapisu edycji:", err);
    alert("Nie udało się zapisać edycji. 😞");
  }
}

```
