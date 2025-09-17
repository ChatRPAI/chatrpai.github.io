# ChatManager

===========
Główna warstwa logiki aplikacji — łączy widoki UI z backendem.
Odpowiada za obsługę promptów, edycji i oceniania wiadomości.
Integruje się z `ChatUIView`, `ChatEditView`, `BackendAPI`, `ImageResolver` i `LoggerService`.
Zasady:
-------
✅ Odpowiedzialność:
  - Obsługa promptów, edycji, oceniania
  - Przekazywanie danych między widokami a BackendAPI
  - Aktualizacja UI przez `ChatUIView` i `ChatEditView`
❌ Niedozwolone:
  - Renderowanie HTML bezpośrednio
  - Mutowanie danych poza `dataset`/`msgEl`
  - Logika domenowa (np. interpretacja tagów)
API:
----
• `constructor({ dom })` — inicjalizuje widoki i podpina zdarzenia
• `init()` — aktywuje widoki i podpina zdarzenia edycji/oceny
• `sendPrompt(prompt: string)` — wysyła prompt do backendu i renderuje odpowiedź
• `sendEdit(msgEl, editedText, tags, imageUrl, sessionId)` — przesyła edytowaną wiadomość
• `sendRating({ messageId, sessionId, ratings })` — przesyła ocenę wiadomości
Zależności:
 - `ChatUIView`: widok głównego czatu
 - `ChatEditView`: widok edycji wiadomości
 - `BackendAPI`: komunikacja z backendem
 - `ImageResolver`: rozwiązywanie ilustracji
 - `LoggerService`: logowanie błędów

---

## constructor

Inicjalizuje widoki UI i podpina zdarzenia.

**_@param_** *`{{ dom: Dom }}`* _**context**_  Kontekst aplikacji z referencjami DOM.

```javascript
  constructor(context) {
    const { dom } = context;
    this.chatView = new ChatUIView(
      dom.chatContainer,
      dom.inputArea,
      dom.prompt
    );

    this.promptVal = {
      promptEl: dom.prompt,
      errorEl: dom.promptError,
      warningEl: dom.promptWarning,
    };

    this.editView = new ChatEditView(dom);

    this.chatView.onEditRequested = (msgEl, text, id, ts, sessionId) =>
      this.editView.enableEdit(msgEl, text, id, ts, sessionId);

    this.chatView.onRatingSubmit = (msgEl) => this.ratingView.open(msgEl);
  }
```

---

## init()

Inicjalizuje widoki i podpina zdarzenia walidacji promptu oraz edycji i oceny.

```javascript
  init() {
    const { promptEl, errorEl, warningEl } = this.promptVal;
    let hadInput = false;

    const syncUI = (text) => {
      const raw = typeof text === "string" ? text : promptEl.value;
      const trimmed = raw.trim();
      const len = raw.length;

      // licznik znaków
      warningEl.textContent = `${len}/${PromptValidator.maxLength} znaków`;

      // klasa długości
      if (len > PromptValidator.maxLength) {
        warningEl.classList.add("error-text-length");
      } else {
        warningEl.classList.remove("error-text-length");
      }

      // walidacja
      const { valid, errors } = PromptValidator.validate(raw);

      // filtr błędów
      const isEmpty = trimmed.length === 0;
      const filteredErrors = errors.filter((msg) => {
        const isEmptyError = msg.startsWith("Prompt nie może być pusty");
        if (isEmptyError) return hadInput && isEmpty;
        return true;
      });

      errorEl.textContent = filteredErrors.join(" ");
      return { valid, filteredErrors };
    };

    // startowa synchronizacja
    const initialText = promptEl.value || "";
    if (initialText.length > 0) hadInput = true;
    syncUI(initialText);

    // live feedback
    promptEl.addEventListener("input", () => {
      const len = promptEl.value.length;
      if (len > 0) hadInput = true;

      const { filteredErrors } = syncUI();
      if (len > 0) {
        const keep = filteredErrors.filter(
          (e) => !e.startsWith("Prompt nie może być pusty")
        );
        errorEl.textContent = keep.join(" ");
      }
    });

    // walidacja na submit – zwraca true/false
    this.chatView.onPromptSubmit = (text) => {
      const raw = text;
      const trimmed = raw.trim();
      const len = raw.length;
      const { valid } = PromptValidator.validate(raw);
      const { filteredErrors } = syncUI(raw);

      if (!valid) {
        const empty = trimmed.length === 0;
        const onlyEmptyError =
          filteredErrors.length === 1 &&
          filteredErrors[0].startsWith("Prompt nie może być pusty");

        if (empty && !hadInput) {
          return false; // odrzucone – brak wcześniejszego inputu
        }

        errorEl.textContent = filteredErrors.join(" ");
        if (len > PromptValidator.maxLength) {
          warningEl.classList.add("error-text-length");
        }
        return false; // odrzucone – błędy walidacji
      }

      warningEl.classList.remove("error-text-length");
      errorEl.textContent = "";
      this.sendPrompt(raw);
      return true; // zaakceptowane – ChatUIView wyczyści pole
    };

    this.chatView.init();

    this.editView.onEditSubmit = (msgEl, txt, tags, imageUrl) =>
      this.sendEdit(msgEl, txt, tags, imageUrl);

    this.editView.onEditCancel = (msgEl, data) => {
      this.chatView.hydrateAIMessage(msgEl, data);
    };

    this.chatView.onRatingSubmit = (payload) => {
      this.sendRating(payload);
    };
  }
```

---
