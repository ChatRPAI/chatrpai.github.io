# ChatEditView

============
Widok edycji wiadomości AI w czacie.
Odpowiada za:
 - Wyświetlenie formularza edycji (textarea + panel tagów + galeria obrazów)
 - Walidację treści i tagów
 - Obsługę zapisu i anulowania edycji
Zasady:
-------
✅ Odpowiedzialność:
  - Renderowanie UI edycji w miejscu wiadomości
  - Integracja z TagsPanel i GalleryLoader
  - Walidacja danych przed wysłaniem
  - Wywołanie callbacków `onEditSubmit` i `onEditCancel`
❌ Niedozwolone:
  - Bezpośrednia komunikacja z backendem (poza pobraniem listy tagów)
  - Mutowanie innych elementów UI poza edytowaną wiadomością
API:
----
• `constructor(dom)` — inicjalizuje widok z referencjami do DOM
• `enableEdit(msgElement, originalText, messageId, sessionId)` — uruchamia tryb edycji
Wydarzenia (callbacki):
-----------------------
• `onEditSubmit(msgEl, editedText, tags, imageUrl, sessionId)` — wywoływane po kliknięciu "Zapisz"
• `onEditCancel(msgEl, data)` — wywoływane po kliknięciu "Anuluj"

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
