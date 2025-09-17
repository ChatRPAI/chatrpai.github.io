# Architektura i zależności projektu

Poniżej masz uporządkowaną mapę modułów z Twojego scalonego pliku. Rozbiłem je na logiczne grupy, wskazałem zależności między klasami (kto kogo potrzebuje) oraz dodałem praktyczne wskazówki, jak wysyłać mi pliki partiami (w jakich paczkach, w jakiej kolejności), żebyśmy pracowali sprawnie i bez cykli zależności.

---

## Warstwa bazowa i narzędzia

- **LoggerService:** centralny logger z buforem i limitowaniem wieku wpisów.
  - Zależy od: nic.
  - Używają: praktycznie wszystkie moduły pomocniczo.

- **Diagnostics:** prosty runner testów jednostkowych (asserty, grupy, kolejki asynchroniczne, wait).
  - Zależy od: nic.
  - Używają: tylko testy (DiagnosticsTests).

- **Utils:** throttle, debounce, formatDate, clamp, randomId, safeQuery, createButton, isMobile, checkImageExists.
  - Zależy od: LoggerService (opcjonalnie do logów w isMobile).
  - Używają: UI i warstwa prezentacji (ChatUI, TagsPanel, PanelsController, EditManager, GalleryLoader).

- **SenderRegistry:** prosty rejestr kolorów/nadawców z rotacją.
  - Zależy od: nic.
  - Używają: ChatUI/EditManager (do klas CSS nadawcy).

- **PromptValidator:** walidacja promptu (typ, długość, niedozwolone znaki).
  - Zależy od: nic.
  - Używają: ChatUI (watcher inputu).

- **EditValidator:** walidacja tekstu edycji i tagów (granice znaków, pustość).
  - Zależy od: nic.
  - Używają: EditManager (przed submit).

---

## Warstwa zasobów i obrazów

- **ImageResolver:**
  - Zadania: generuje kombinacje tagów, sprawdza dostępność obrazów (HEAD + cache + localStorage), preload.
  - Zależy od: LoggerService (opcjonalnie do logów), localStorage/fetch.
  - Używają: EditManager (renderowanie), GalleryLoader (resolve + HEAD), ChatUI (fallback przy renderze AI jeśli nie podasz imageUrl).

- **GalleryLoader:**
  - Zadania: renderuje galerię, ładuje obrazy z API, podświetlanie wyboru, obsługa komunikatów.
  - Zależy od: ImageResolver, Utils (UI), LoggerService (opcjonalnie).
  - Używają: EditManager, TagsPanel (callbacki), App (opcjonalnie via initTagModules).

---

## Warstwa tagów

- **TagSelectorFactory:** fabryka pól tagów (select vs input+datalist) + label dictionary + replace field.
  - Zależy od: Utils (isMobile).
  - Używają: TagsPanel.

- **TagsPanel:**
  - Zadania: buduje pola, reaguje na zmiany, emituje listę tagów, integruje z galerią (poprzez callback).
  - Zależy od: TagSelectorFactory, Utils (debounce), LoggerService (ostrzeżenia).
  - Używają: EditManager (edytor), App (initTagModules).

---

## Warstwa użytkownika i DOM

- **UserManager:** storage nazwy użytkownika (localStorage/cookies), init inputu #user_name, interpolacja placeholderów.
  - Zależy od: DOM API, localStorage/cookies.
  - Używają: ChatUI/EditManager (replacePlaceholders w renderze).

- **Dom:** centralne uchwyty do elementów (#app, #chat-container, formularze, panele), loguje braki.
  - Zależy od: LoggerService (ostrzeżenia).
  - Używają: praktycznie wszystkie klasy z UI/Managerów.

- **KeyboardManager:** utrzymuje #input-area nad klawiaturą ekranową (visualViewport + fix dla Firefoksa).
  - Zależy od: Dom, LoggerService (warning).
  - Używają: App (init).

- **PanelsController:** logika paneli bocznych (toggle, open/close, wyłączność, stan początkowy).
  - Zależy od: Dom, Utils (isMobile).
  - Używają: App (init).

---

## Warstwa backendu i odporności

- **RequestRetryManager:** fetch z retry, opóźnienia, logowanie, wyjątki.
  - Zależy od: LoggerService (opcjonalnie przez parametry).
  - Używają: BackendAPI.

- **BackendAPI:** generate, rate, edit, postMessage, getTags.
  - Zależy od: RequestRetryManager (dla generate/rate/edit), fetch (dla postMessage/getTags).
  - Używają: ChatManager (generate/postMessage), ChatUI (rate — przez ChatManager, po poprawkach), EditManager (edit/getTags).

---

## Warstwa UI i kontrolerów

- **RatingForm:** komponent oceny (render suwaków, submit → callback).
  - Zależy od: DOM API (przyciski, inputy).
  - Używają: ChatUI (addRatingForm).

- **EditManager:**
  - Zadania: tryb edycji AI (textarea, panel tagów, galeria), walidacja, submit do backendu, rerender AI.
  - Zależy od: BackendAPI, LoggerService, TagsPanel, GalleryLoader, EditValidator, Utils, ImageResolver (pośrednio przez render).
  - Używają: ChatUI (przycisk „Edytuj”).

- **ChatUI:**
  - Zadania: render wiadomości user/AI, loader, błędy, walidacja promptu, rating form (przez RatingForm), hydracja AI.
  - Zależy od: Dom, EditManager, UserManager, SenderRegistry, PromptValidator, Utils, ImageResolver (fallback obrazów), [ChatManager po wstrzyknięciu setterem].
  - Używają: ChatManager (UI render), App (konstrukcja oraz setChatManager).

- **ChatManager:**
  - Zadania: cykl wysyłki promptu → loader → generate → render/hydrate → postMessage (AI) → obsługa błędów.
  - Zależy od: BackendAPI, ChatUI, Dom, LoggerService.
  - Używają: App (instancjonowanie + eventy).

---

## Bootstrap i kontener

- **Context:** rejestr zależności (logger, diagnostics, userManager, dom, utils, backendAPI).
  - Zależy od: nic (poza klasami, które wstrzykuje).
  - Używają: App.

- **App:** fasada i cykl życia (init keyboard, userManager, panels; eventy submit/ctrl+enter; clear image cache; setChatManager).
  - Zależy od: Context (wszystkie rejestrowane serwisy), KeyboardManager, PanelsController, EditManager, ChatUI, ChatManager, Utils.
  - Używają: entrypoint (init).

---

## Zależności między klasami w skrócie

Tabela: kto bezpośrednio używa kogo (→ oznacza „używa”)

| Moduł             | Zależy od (główne)                                         |
|-------------------|-------------------------------------------------------------|
| ChatManager       | ChatUI → BackendAPI → Dom → LoggerService                   |
| ChatUI            | Dom → EditManager → UserManager → SenderRegistry → Utils → PromptValidator → RatingForm → ImageResolver (fallback) |
| EditManager       | BackendAPI → LoggerService → TagsPanel → GalleryLoader → EditValidator → Utils → ImageResolver |
| BackendAPI        | RequestRetryManager (generate/rate/edit), fetch (inne)      |
| RequestRetryMgr   | LoggerService (opcjonalny logger)                           |
| TagsPanel         | TagSelectorFactory → Utils → LoggerService                  |
| TagSelectorFactory| Utils                                                       |
| GalleryLoader     | ImageResolver → Utils → LoggerService (opcjonalnie)         |
| ImageResolver     | LoggerService (opcjonalnie), localStorage, fetch            |
| UserManager       | localStorage/cookies                                        |
| Dom               | LoggerService                                               |
| PanelsController  | Dom → Utils                                                 |
| KeyboardManager   | Dom → LoggerService                                         |
| RatingForm        | DOM                                                         |
| PromptValidator   | —                                                           |
| EditValidator     | —                                                           |
| LoggerService     | —                                                           |
| Diagnostics       | —                                                           |
| Context           | Rejestruje: LoggerService, Diagnostics, UserManager, Dom, Utils, BackendAPI |
| App               | Context → KeyboardManager → PanelsController → EditManager → ChatUI → ChatManager |

Najważniejszy cykl do rozbrojenia przy inicjalizacji:
- ChatUI <-> ChatManager: rozwiązane przez setChatManager(chatManager) po utworzeniu obu instancji w App.

---

## Kolejność inicjalizacji i „paczki” do wysyłki

Żebyś mógł wysyłać klasy w osobnych plikach i żebym miał pełny kontekst, trzymaj się tej kolejności i grup:

1) Baza (najpierw)
- LoggerService.js
- Utils.js
- SenderRegistry.js
- PromptValidator.js
- EditValidator.js

2) Zasoby/obrazy
- ImageResolver.js
- GalleryLoader.js

3) Tagi
- TagSelectorFactory.js
- TagsPanel.js

4) Użytkownik i DOM
- UserManager.js
- Dom.js
- KeyboardManager.js
- PanelsController.js

5) Backend i odporność
- RequestRetryManager.js
- BackendAPI.js

6) UI i kontrolery
- RatingForm.js
- EditManager.js
- ChatUI.js
- ChatManager.js

7) Bootstrap
- Context.js
- App.js
- (opcjonalnie) Diagnostics.js i DiagnosticsTests.js

Dzięki temu każda warstwa będzie mieć już dostępne swoje zależności, a ja będę mógł odnosić się do konkretnych klas bez „missing reference”.

---

## Co wysyłać w każdym pliku (nagłówki + oczekiwane eksporty)

- LoggerService.js — export klasy
- Utils.js — export klasy
- SenderRegistry.js — export klasy
- PromptValidator.js — export klasy
- EditValidator.js — export klasy
- ImageResolver.js — export klasy + static extensions/basePath
- GalleryLoader.js — export klasy
- TagSelectorFactory.js — export klasy
- TagsPanel.js — export klasy
- UserManager.js — export klasy
- Dom.js — export klasy
- KeyboardManager.js — export klasy
- PanelsController.js — export klasy
- RequestRetryManager.js — export klasy (statyczne API)
- BackendAPI.js — export klasy
- RatingForm.js — export klasy
- EditManager.js — export klasy
- ChatUI.js — export klasy; metoda setChatManager(chatManager)
- ChatManager.js — export klasy
- Context.js — export klasy
- App.js — export klasy

Jeśli korzystasz z importów/eksportów ES, spójrz, czy te klasy są rzeczywiście samowystarczalne (nie zakładają globalnych symboli), bo w scalonej wersji wszystko było w jednym zakresie. Dla naszych analiz wystarczy, że wkleisz pojedyncze pliki w markdown, w tej kolejności.

---

## Dodatkowe uwagi (warto dopracować później)

- ChatUI.addRatingForm: po fixie z setChatManager używaj this.chatManager.backendAPI.rate(payload) — już działa, ale trzymajmy się wzorca przekazywania kontekstu przez App.
- ImageResolver.resolve: dobrze, że dodałeś priorytet exactCombo → teraz trafia w forest_healing.* jeśli istnieje.
- EditManager.renderAIInto: słusznie „async” i użycie ImageResolver.resolve przy braku imageUrl.
- App: prawidłowe rozbrojenie cyklu ChatUI <-> ChatManager przez setChatManager.

---

Jeśli chcesz, podeślę Ci gotowe szablony nagłówków plików (komentarz + export) dla każdej klasy, żeby w repo wyglądało to spójnie. A kiedy będziesz gotów — zacznij wysyłać mi pliki z grupy 1 (baza), potem 2 itd. Dzięki temu będę mógł od razu wskazywać precyzyjne zmiany w kontekście pełnych zależności.