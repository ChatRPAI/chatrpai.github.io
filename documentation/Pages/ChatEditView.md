# ChatEditView

Widok edycji wiadomości AI w czacie.
Odpowiada za:
 - Wyświetlenie formularza edycji (textarea + panel tagów + galeria obrazów)
 - Walidację treści i tagów
 - Obsługę zapisu i anulowania edycji
## Zasady:
- ✅ Dozwolone:
  - Renderowanie UI edycji w miejscu wiadomości
  - Integracja z TagsPanel i GalleryLoader
  - Walidacja danych przed wysłaniem
  - Wywołanie callbacków `onEditSubmit` i `onEditCancel`
- ❌ Niedozwolone:
  - Bezpośrednia komunikacja z backendem (poza pobraniem listy tagów)
  - Mutowanie innych elementów UI poza edytowaną wiadomością

---

## constructor

**_@param_** *`{object}`* _**dom**_  Obiekt z referencjami do elementów DOM aplikacji

```javascript
  constructor(dom) {
    this.dom = dom;
    /** @type {function(HTMLElement,string,string[],string,string):void|null} */
    this.onEditSubmit = null;
    /** @type {function(HTMLElement,object):void|null} */
    this.onEditCancel = null;
  }
```

---

    this.onEditSubmit = null;

---

## enableEdit()

Uruchamia tryb edycji dla wiadomości AI.
@param {string} [sessionId] - ID sesji

**_@param_** *`{HTMLElement}`* _**msgElement**_  Element wiadomości do edycji

**_@param_** *`{string}`* _**originalText**_  Oryginalny tekst wiadomości

**_@param_** *`{string}`* _**messageId**_  ID wiadomości

```javascript
  async enableEdit(msgElement, originalText, messageId, sessionId) {
    // Zachowaj oryginalny HTML
    msgElement.dataset.originalHTML = msgElement.innerHTML;
    if (sessionId) {
      msgElement.dataset.sessionId = sessionId;
    }

    // Wyczyść zawartość i dodaj textarea
    msgElement.innerHTML = "";
    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.rows = 6;
    textarea.className = "form-element textarea-base w-full mt-4";

    const tagPanel = document.createElement("div");
    tagPanel.className = "tag-panel";
    msgElement.append(textarea, tagPanel);

    // Panel tagów + galeria
    const tagsPanel = new TagsPanel(tagPanel);
    const galleryLoader = new GalleryLoader(tagPanel);

    const rawTags = msgElement.dataset.tags || "";
    const tagOptions = await BackendAPI.getTags();

    tagsPanel.setTagOptions(tagOptions);
    tagsPanel.applyDefaultsFromDataTags(rawTags, tagOptions);

    let boot = true;
    tagsPanel.init(() => {
      if (!boot) galleryLoader.renderFromTags(tagsPanel.getTagList());
    });
    galleryLoader.renderFromTags(tagsPanel.getTagList());
    boot = false;

    // Przycisk zapisu
    const saveBtn = Utils.createButton("💾 Zapisz", async () => {
      const editedText = textarea.value.trim();
      const tags = tagsPanel.getTagList();

      const { valid, errors } = EditValidator.validate(editedText, tags);
      if (!valid) {
        LoggerService.record("warn", "[EditView] Błąd walidacji", errors);
        return;
      }

      // Preferuj wybór z galerii; fallback do resolvera
      let imageUrl = "";
      const chosen = tagPanel.querySelector(
        'input[name="gallery-choice"]:checked'
      );
      if (chosen && chosen.value) {
        imageUrl = chosen.value;
      } else {
        const urls = await ImageResolver.resolve(tags, { maxResults: 1 });
        imageUrl = urls[0] || "";
      }

      this.onEditSubmit?.(
        msgElement,
        editedText,
        tags,
        imageUrl,
        msgElement.dataset.sessionId
      );
    });
    saveBtn.classList.add("button-base");

    // Przycisk anulowania
    const cancelBtn = Utils.createButton("❌ Anuluj", () => {
      const data = {
        id: msgElement.dataset.msgId,
        sessionId: msgElement.dataset.sessionId || "sess-unknown",
        tags: (msgElement.dataset.tags || "").split("_").filter(Boolean),
        timestamp: msgElement.dataset.timestamp,
        originalText: msgElement.dataset.originalText,
        text: msgElement.dataset.originalText,
        sender: msgElement.dataset.sender || "AI",
        avatarUrl:
          msgElement.dataset.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png",
        generation_time: parseFloat(msgElement.dataset.generation_time) || 0,
        imageUrl: msgElement.dataset.imageUrl || "",
      };

      this.onEditCancel?.(msgElement, data);
    });
    cancelBtn.classList.add("button-base");

    msgElement.append(saveBtn, cancelBtn);
  }
```

---

## Pełny kod klasy

```javascript
class ChatEditView {
  constructor(dom) {
    this.dom = dom;
    this.onEditSubmit = null;
    this.onEditCancel = null;
  }

  async enableEdit(msgElement, originalText, messageId, sessionId) {
    msgElement.dataset.originalHTML = msgElement.innerHTML;
    if (sessionId) {
      msgElement.dataset.sessionId = sessionId;
    }

    msgElement.innerHTML = "";
    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.rows = 6;
    textarea.className = "form-element textarea-base w-full mt-4";

    const tagPanel = document.createElement("div");
    tagPanel.className = "tag-panel";
    msgElement.append(textarea, tagPanel);

    const tagsPanel = new TagsPanel(tagPanel);
    const galleryLoader = new GalleryLoader(tagPanel);

    const rawTags = msgElement.dataset.tags || "";
    const tagOptions = await BackendAPI.getTags();

    tagsPanel.setTagOptions(tagOptions);
    tagsPanel.applyDefaultsFromDataTags(rawTags, tagOptions);

    let boot = true;
    tagsPanel.init(() => {
      if (!boot) galleryLoader.renderFromTags(tagsPanel.getTagList());
    });
    galleryLoader.renderFromTags(tagsPanel.getTagList());
    boot = false;

    const saveBtn = Utils.createButton("💾 Zapisz", async () => {
      const editedText = textarea.value.trim();
      const tags = tagsPanel.getTagList();

      const { valid, errors } = EditValidator.validate(editedText, tags);
      if (!valid) {
        LoggerService.record("warn", "[EditView] Błąd walidacji", errors);
        return;
      }

      let imageUrl = "";
      const chosen = tagPanel.querySelector(
        'input[name="gallery-choice"]:checked'
      );
      if (chosen && chosen.value) {
        imageUrl = chosen.value;
      } else {
        const urls = await ImageResolver.resolve(tags, { maxResults: 1 });
        imageUrl = urls[0] || "";
      }

      this.onEditSubmit?.(
        msgElement,
        editedText,
        tags,
        imageUrl,
        msgElement.dataset.sessionId
      );
    });
    saveBtn.classList.add("button-base");

    const cancelBtn = Utils.createButton("❌ Anuluj", () => {
      const data = {
        id: msgElement.dataset.msgId,
        sessionId: msgElement.dataset.sessionId || "sess-unknown",
        tags: (msgElement.dataset.tags || "").split("_").filter(Boolean),
        timestamp: msgElement.dataset.timestamp,
        originalText: msgElement.dataset.originalText,
        text: msgElement.dataset.originalText,
        sender: msgElement.dataset.sender || "AI",
        avatarUrl:
          msgElement.dataset.avatarUrl || "/static/NarrativeIMG/Avatars/AI.png",
        generation_time: parseFloat(msgElement.dataset.generation_time) || 0,
        imageUrl: msgElement.dataset.imageUrl || "",
      };

      this.onEditCancel?.(msgElement, data);
    });
    cancelBtn.classList.add("button-base");

    msgElement.append(saveBtn, cancelBtn);
  }
}
```