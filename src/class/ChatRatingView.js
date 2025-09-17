/**
 * ChatRatingView
 * ==============
 * Komponent UI odpowiedzialny za wyświetlanie i obsługę panelu ocen wiadomości AI.
 * 
 * Funkcje:
 * --------
 *  - Renderuje panel ocen w formie <details> z listą kryteriów i suwakami (range input)
 *  - Obsługuje zmianę wartości suwaków (aktualizacja widocznej wartości)
 *  - Po kliknięciu "Wyślij ocenę" zbiera wszystkie wartości i przekazuje je w callbacku `onSubmit`
 *  - Zapobiega duplikowaniu panelu ocen w tej samej wiadomości
 * 
 * Zasady:
 * -------
 * ✅ Odpowiedzialność:
 *   - Tworzenie i osadzanie elementów DOM panelu ocen
 *   - Obsługa interakcji użytkownika (zmiana wartości, wysyłka oceny)
 * 
 * ❌ Niedozwolone:
 *   - Samodzielne wysyłanie ocen do backendu (od tego jest logika wyżej)
 *   - Modyfikowanie innych elementów wiadomości poza panelem ocen
 * 
 * API:
 * ----
 * • `constructor(msgEl, onSubmit)` — tworzy panel ocen w podanym elemencie wiadomości
 * • `render(msgEl)` — renderuje panel ocen (wywoływane automatycznie w konstruktorze)
 * 
 * Callbacki:
 * ----------
 * • `onSubmit(payload)` — wywoływany po kliknięciu "Wyślij ocenę"
 *    - payload: {
 *        messageId: string,
 *        sessionId: string,
 *        ratings: { [kryterium]: number }
 *      }
 */
class ChatRatingView {
  /**
   * @param {HTMLElement} msgEl - Element wiadomości, do którego ma zostać dodany panel ocen
   * @param {function(object):void} [onSubmit] - Callback wywoływany po wysłaniu oceny
   */
  constructor(msgEl, onSubmit) {
    if (!(msgEl instanceof HTMLElement)) return;
    this.onSubmit = onSubmit || null;

    /**
     * Lista kryteriów oceniania
     * @type {{key: string, label: string}[]}
     */
    this.criteria = [
      { key: "Narrative", label: "Narracja" },
      { key: "Style", label: "Styl" },
      { key: "Logic", label: "Logika" },
      { key: "Quality", label: "Jakość" },
      { key: "Emotions", label: "Emocje" }
    ];

    this.render(msgEl);
  }

  /**
   * Renderuje panel ocen w wiadomości.
   * @param {HTMLElement} msgEl - Element wiadomości
   */
  render(msgEl) {
    // Unikamy duplikatów panelu ocen
    if (msgEl.querySelector("details.rating-form")) return;

    const details = document.createElement("details");
    details.className = "rating-form";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Oceń odpowiedź ⭐";
    details.appendChild(summary);

    const header = document.createElement("h3");
    header.textContent = "Twoja ocena:";
    details.appendChild(header);

    // Tworzenie wierszy z suwakami dla każdego kryterium
    this.criteria.forEach(({ key, label }) => {
      const row = document.createElement("label");
      row.className = "rating-row";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = `${label}: `;
      row.appendChild(labelSpan);

      const input = document.createElement("input");
      input.type = "range";
      input.min = "1";
      input.max = "5";
      input.value = "3";
      input.name = key;

      const val = document.createElement("span");
      val.textContent = input.value;
      input.addEventListener("input", () => (val.textContent = input.value));

      row.append(input, val);
      details.appendChild(row);
    });

    // Przycisk wysyłki oceny
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Wyślij ocenę";
    btn.addEventListener("click", () => {
      const ratings = {};
      this.criteria.forEach(({ key }) => {
        ratings[key] = Number(details.querySelector(`[name="${key}"]`).value);
      });
      const payload = {
        messageId: msgEl.dataset.msgId,
        sessionId: msgEl.dataset.sessionId,
        ratings
      };
      this.onSubmit?.(payload);
    });
    details.appendChild(btn);

    // Panel trafia do stopki wiadomości lub bezpośrednio do elementu
    const footer = msgEl.querySelector(".msg-footer") || msgEl;
    footer.appendChild(details);
  }
}
