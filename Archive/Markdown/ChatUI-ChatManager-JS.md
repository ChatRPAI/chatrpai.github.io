```js
/**
 * ChatManager
 * ===========
 * Klasa odpowiedzialna za zarządzanie przepływem wiadomości między użytkownikiem, interfejsem czatu (ChatUI) i backendem (BackendAPI).
 * Stanowi centralny kontroler logiki czatu, łącząc warstwę UI z warstwą komunikacji serwerowej.
 * Obsługuje:
 * - odczytanie promptu od użytkownika,
 * - wysłanie zapytania do backendu,
 * - wyświetlenie odpowiedzi AI,
 * - obsługę błędów,
 * - dodanie opcji edycji i oceny odpowiedzi.
 *
 * Zależności:
 * - `ChatUI`: odpowiada za manipulację interfejsem użytkownika (dodawanie wiadomości, komunikatów, przycisków).
 * - `BackendAPI`: odpowiada za komunikację z serwerem (generowanie odpowiedzi, przesyłanie ocen, edycja).
 * - `Dom`: dostarcza referencje do elementów DOM (np. pole promptu).
 */

class ChatManager {
  /**
   * Tworzy instancję klasy ChatManager z dostępem do interfejsu czatu, API backendu i elementów DOM.
   * @param {ChatUI} chatUI - Instancja klasy ChatUI, odpowiedzialna za warstwę wizualną czatu.
   * @param {BackendAPI} backendAPI - Instancja klasy BackendAPI, odpowiedzialna za komunikację z backendem.
   * @param {Dom} dom - Instancja klasy Dom, zawierająca referencje do elementów DOM.
   */
  constructor(chatUI, backendAPI, dom) {
    this.chatUI = chatUI;
    this.backendAPI = backendAPI;
    this.dom = dom;
  }

  /**
   * Wysyła prompt użytkownika do backendu i obsługuje odpowiedź.
   * Proces obejmuje:
   * - walidację i czyszczenie pola tekstowego,
   * - dodanie wiadomości użytkownika do czatu,
   * - wyświetlenie komunikatu ładowania,
   * - wysłanie zapytania do backendu,
   * - aktualizację wiadomości AI z odpowiedzią,
   * - dodanie przycisku edycji i formularza oceny,
   * - obsługę błędów i przywrócenie interaktywności pola tekstowego.
   *
   * @returns {Promise<void>}
   */
  async sendPrompt() {
    const prompt = this.dom.prompt.value.trim();
    if (!prompt) return;

    const name = UserManager.getName().trim();
    if (!name) {
      // możesz też użyć ChatUI.showError lub alert
      LoggerService.record("warn", "Nie wysłano promptu – brak imienia użytkownika");
      alert("Podaj swoje imię w panelu ustawień po prawej stronie.");
      // fokus na input
      const userInput = document.querySelector("#user_name");
      if (userInput) userInput.focus();
      return;
    }

    // Dezaktywuj pole i wyczyść
    this.dom.prompt.value = "";
    this.dom.prompt.disabled = true;

    // Dodaj wiadomość użytkownika
    this.chatUI.addMessage("user", prompt);

    // Dodaj komunikat ładowania
    const { msgEl, timer } = this.chatUI.addLoadingMessage();
    const startTime = Date.now();

    try {
      // Wyślij zapytanie do backendu
      const data = await this.backendAPI.generate(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      clearInterval(timer);

      // Zaktualizuj wiadomość AI
      this.chatUI.updateAIMessage(msgEl, data.response, duration);

      // Dodaj przycisk edycji i formularz oceny
      this.chatUI.addEditButton(msgEl, data.response);
      this.chatUI.addRatingForm(msgEl, this.backendAPI);
    } catch (err) {
      clearInterval(timer);
      this.chatUI.showError(msgEl);
      LoggerService.record("error", "[ChatManager] Błąd generowania:", err);
    } finally {
      // Przywróć interaktywność pola promptu
      this.dom.prompt.disabled = false;
    }
  }
}
```
```js
/**
 * ChatUI
 * ======
 * Klasa odpowiedzialna za zarządzanie warstwą wizualną czatu.
 * Obsługuje:
 * - dodawanie wiadomości użytkownika i AI,
 * - wyświetlanie komunikatów ładowania i błędów,
 * - aktualizację odpowiedzi AI,
 * - dodawanie przycisku edycji i formularza oceny,
 * - przewijanie widoku do ostatniej wiadomości.
 *
 * Zależności:
 * - `Dom`: dostarcza referencje do kontenera czatu i innych elementów DOM.
 * - `EditManager`: obsługuje tryb edycji wiadomości AI.
 * - `Utils`: dostarcza funkcje pomocnicze (np. tworzenie przycisków).
 * - `app.backendAPI`: wykorzystywany w formularzu oceny do przesyłania danych.
 */

class ChatUI {
  /**
   * Tworzy instancję klasy ChatUI z dostępem do elementów DOM i menedżera edycji.
   * @param {Dom} domInstance - Instancja klasy Dom z referencjami do elementów.
   * @param {EditManager} editManager - Instancja klasy EditManager do obsługi edycji wiadomości.
   */
  constructor(domInstance, editManager) {
    this.dom = domInstance;
    this.editManager = editManager;
    this.attachPromptLengthWatcher();
  }

  // ChatUI.js

  attachPromptLengthWatcher() {
    const textarea = this.dom.prompt;
    const info = this.dom.inputArea.querySelector(".max-text-length-warning");
    const form = this.dom.inputArea;
    const errorMsgEl = this.dom.inputArea.querySelector(".prompt-error");

    if (!textarea || !info || !form || !errorMsgEl) return;

    let isDirty = false; // czy użytkownik już edytował ręcznie?

    const update = () => {
      const value = textarea.value;
      const len = value.length;
      const { valid, errors } = PromptValidator.validate(value);

      // zawsze aktualizujemy licznik i stan przycisku
      info.textContent = `${len}/${PromptValidator.maxLength} znaków`;
      info.style.color = len > PromptValidator.maxLength ? "tomato" : "";
      form.querySelector('button[type="submit"]').disabled = !valid;

      // pokazujemy błąd tylko gdy isDirty==true i prompt jest nie-valid
      errorMsgEl.textContent = isDirty && !valid ? errors[0] : "";
    };

    // Gdy użytkownik coś wpisze/usuwa – ustawiamy isDirty i odpalamy update
    textarea.addEventListener("input", (e) => {
      isDirty = true;
      update();
    });

    // Po wysłaniu promptu textarea jest czyszczone przez ChatManager
    // Resetujemy isDirty i odpalamy update() tak, żeby znikły ewentualne błędy
    form.addEventListener("submit", () => {
      setTimeout(() => {
        isDirty = false;
        update();
      }, 0);
    });

    // startowe wywołanie – isDirty == false, więc nie ma błędu, ale licznik też się zaktualizuje
    update();
  }

  /**
   * Dodaje wiadomość do kontenera czatu.
   * Tworzy element `<div>` z klasą `message` i typem (`user` lub `ai`).
   * @param {string} type - Typ wiadomości (`user` lub `ai`).
   * @param {string} text - Treść wiadomości.
   */
  addMessage(type, text) {
    if (!this.dom.chatContainer) return;
    text = UserManager.replacePlaceholders(text);
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.textContent = text;
    this.dom.chatContainer.appendChild(msg);
    this.scrollToBottom();
  }

  /**
   * Dodaje wiadomość tymczasową informującą o generowaniu odpowiedzi.
   * Aktualizuje tekst co sekundę, pokazując czas oczekiwania.
   * @returns {{ msgEl: HTMLElement, timer: number }} Obiekt zawierający element wiadomości i identyfikator timera.
   */
  addLoadingMessage() {
    const msgEl = document.createElement("div");
    msgEl.classList.add("message", "ai");
    msgEl.textContent = "⏳ Generowanie odpowiedzi... (0s)";
    this.dom.chatContainer.appendChild(msgEl);
    this.scrollToBottom();

    let secondsElapsed = 0;
    const timer = setInterval(() => {
      secondsElapsed++;
      msgEl.textContent = `⏳ Generowanie odpowiedzi... (${secondsElapsed}s)`;
    }, 1000);

    return { msgEl, timer };
  }

  /**
   * Aktualizuje wiadomość AI po zakończeniu generowania.
   * Wstawia czas generowania i odpowiedź w formacie HTML.
   * @param {HTMLElement} msgEl - Element wiadomości do aktualizacji.
   * @param {string} response - Treść odpowiedzi AI.
   * @param {number} duration - Czas generowania w sekundach.
   */
  updateAIMessage(msgEl, response, duration) {
    response = UserManager.replacePlaceholders(response);
    msgEl.innerHTML = `⏱️ Czas generowania: ${duration}s<br><br>${response}`;
    this.scrollToBottom();
  }

  /**
   * Wyświetla komunikat błędu w wiadomości AI.
   * @param {HTMLElement} msgEl - Element wiadomości do aktualizacji.
   */
  showError(msgEl) {
    msgEl.textContent = "❌ Błąd generowania odpowiedzi.";
    this.scrollToBottom();
  }

  /**
   * Dodaje przycisk edycji do wiadomości.
   * Wywołuje EditManager.enableEdit() z przekazanym tekstem.
   * @param {HTMLElement} msgEl - Element wiadomości, do którego dodawany jest przycisk.
   * @param {string} originalText - Oryginalna treść wiadomości.
   * @param {string} [messageId="msg-temp"] - Identyfikator wiadomości (opcjonalny).
   * @param {string} [sessionId="session-temp"] - Identyfikator sesji (opcjonalny).
   */
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

  /**
   * Dodaje formularz oceny odpowiedzi AI.
   * Formularz zawiera suwaki dla pięciu kryteriów oraz przycisk wysyłania.
   * Po kliknięciu wysyła dane do backendu.
   */
  addRatingForm(msgEl) {
    // jeśli już założony na tym elemencie → toggle otwarcia
    if (msgEl._ratingForm) {
      msgEl._ratingForm.toggle();
      return;
    }

    // w przeciwnym razie twórz nowy dla tej wiadomości
    const form = new RatingForm(msgEl, async (ratings) => {
      try {
        await app.backendAPI.rate(ratings);
        alert("Ocena wysłana!");
      } catch {
        alert("Błąd wysyłania oceny");
      }
      // po wysłaniu zamykamy tylko ten formularz
      form.close();
    });

    // zapisujemy instancję na elemencie, by móc toggleować
    msgEl._ratingForm = form;
  }

  /**
   * Przewija widok czatu do ostatniej wiadomości.
   */
  scrollToBottom() {
    this.dom.chatContainer.scrollTop = this.dom.chatContainer.scrollHeight;
  }
}
````