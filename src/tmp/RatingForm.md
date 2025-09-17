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