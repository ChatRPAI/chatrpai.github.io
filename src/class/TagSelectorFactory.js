/**
 *
 * Fabryka elementów UI do wyboru tagów.
 * Tworzy pola wyboru w dwóch wariantach w zależności od środowiska:
 *  - Mobile → <select> z listą opcji
 *  - Desktop → <input> z przypisanym <datalist>
 *
 * ## Zasady:
 *
 * - ✅ Dozwolone:
 *   - Generowanie elementów formularza dla tagów
 *   - Nadawanie etykiet polom na podstawie słownika
 *   - Obsługa wariantu mobilnego i desktopowego
 *
 * - ❌ Niedozwolone:
 *   - Walidacja wybranych tagów
 *   - Operacje sieciowe
 *   - Bezpośrednia integracja z backendem
 */
class TagSelectorFactory {
  /**
   * Słownik etykiet dla pól tagów.
   * Klucze odpowiadają nazwom pól, wartości to etykiety wyświetlane w UI.
   * @type {Record<string,string>}
   */
  static labels = {
    location: "Lokalizacja",
    character: "Postać",
    action: "Czynność",
    nsfw: "NSFW",
    emotion: "Emocja",
  };

  /**
   * Tworzy prosty element wyboru tagów (bez dodatkowych klas/stylów).
   * Używany do generowania pojedynczych selektorów w UI.
   *
   * @param {string} type - Typ pola (np. 'location', 'character').
   * @param {string[]} [options=[]] - Lista dostępnych opcji.
   * @returns {HTMLLabelElement} - Element <label> zawierający kontrolkę wyboru.
   */
  static create(type, options = []) {
    const labelEl = document.createElement("label");
    labelEl.textContent = this.labels[type] || type;

    if (Utils.isMobile()) {
      // Mobile: <select> z opcjami
      const select = document.createElement("select");
      options.forEach((opt) => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });
      labelEl.appendChild(select);
    } else {
      // Desktop: <input> + <datalist>
      const input = document.createElement("input");
      input.setAttribute("list", `${type}-list`);
      const datalist = document.createElement("datalist");
      datalist.id = `${type}-list`;
      options.forEach((opt) => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        datalist.appendChild(optionEl);
      });
      labelEl.append(input, datalist);
    }

    return labelEl;
  }

  /**
   * Tworzy kompletny element pola tagu z etykietą i kontrolką wyboru.
   * Używany w panelach tagów (np. TagsPanel) do renderowania pól kategorii.
   *
   * @param {string} name - Nazwa pola (np. "location", "character").
   * @param {string[]} [options=[]] - Lista opcji do wyboru.
   * @returns {HTMLLabelElement} - Gotowy element <label> z kontrolką.
   */
  static createTagField(name, options = []) {
    const labelEl = document.createElement("label");
    labelEl.className = "tag-field";
    labelEl.textContent = this.labels?.[name] || name;

    if (Utils.isMobile()) {
      // Mobile: <select> z pustą opcją na start
      const select = document.createElement("select");
      select.id = `tag-${name}`;
      select.name = name;

      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "-- wybierz --";
      select.appendChild(emptyOpt);

      options.forEach((opt) => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });

      labelEl.appendChild(select);
    } else {
      // Desktop: <input> + <datalist>
      const input = document.createElement("input");
      input.id = `tag-${name}`;
      input.name = name;
      input.setAttribute("list", `${name}-list`);

      const datalist = document.createElement("datalist");
      datalist.id = `${name}-list`;

      options.forEach((opt) => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        datalist.appendChild(optionEl);
      });

      labelEl.append(input, datalist);
    }

    return labelEl;
  }
}
