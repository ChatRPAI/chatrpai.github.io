# 📐 Struktura HTML

[⬅️ Powrót na stronę główną](../README.md)  
[⬅️ Powrót do dokumentacji Frontendu](../Frontend/main.md)

---

- [📐 Struktura HTML](#-struktura-html)
  - [🔧 Główne komponenty](#-główne-komponenty)
    - [`<div id="app">`](#div-idapp)
    - [`<h1>AI RP Chat</h1>`](#h1ai-rp-chath1)
    - [`<div id="chat-wrapper">`](#div-idchat-wrapper)
    - [`<div id="chat-container">`](#div-idchat-container)
    - [`<form id="input-area">`](#form-idinput-area)
    - [`<p id="prompt-desc" hidden>`](#p-idprompt-desc-hidden)
    - [`<textarea id="prompt">`](#textarea-idprompt)
    - [`<button type="submit">`](#button-typesubmit)
    - [`<button id="burger-toggle">` i `<aside id="web-side-panel">`](#button-idburger-toggle-i-aside-idweb-side-panel)
    - [`<button id="settings-toggle">` i `<aside id="side-panel">`](#button-idsettings-toggle-i-aside-idside-panel)
    - [`<template class="tag-panel-template">`](#template-classtag-panel-template)
    - [`<script src="/static/data/script.js">`](#script-srcstaticdatascriptjs)
    - [`<script>` inline – `runDiagnostics()`](#script-inline--rundiagnostics)
  - [🧠 Uwagi techniczne](#-uwagi-techniczne)

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-główne-komponenty"></span>

## 🔧 Główne komponenty

### `<div id="app">`

- Główny kontener aplikacji.
- Obejmuje wszystkie elementy interfejsu: nagłówek, historię czatu, formularz wiadomości, panele boczne i szablony.
- Stylizacja (`position: fixed; inset: 0; overflow: hidden;`) zapewnia, że całość działa w obrębie jednego widoku, bez przewijania strony pod spodem.

---

### `<h1>AI RP Chat</h1>`

- Nagłówek aplikacji.
- Wyrównany do środka (`.text-center`), z marginesem górnym (`.mt-10`).

---

### `<div id="chat-wrapper">`

- Kontener dla historii czatu i formularza wiadomości.
- Wysokość wyznaczona przez `top: 60px` i `bottom: 120px` — miejsce na belkę i pole input.
- Umożliwia przewijanie historii czatu w wyznaczonym obszarze.

---

### `<div id="chat-container">`

- Wyświetla historię rozmowy (wiadomości użytkownika i AI).
- Atrybuty dostępności:
  - `role="log"`
  - `aria-live="polite"`
  - `aria-label="Historia rozmowy z AI"`
- Scrollowalny (`overflow-y: auto`), z dolnym paddingiem, aby ostatnia wiadomość nie była zasłonięta przez `#input-area`.

---

### `<form id="input-area">`

- Formularz wysyłania wiadomości do AI.
- Obsługuje wysyłanie przez kliknięcie przycisku lub skrót `Ctrl+Enter`.
- Nie przeładowuje strony (`return false` w `onsubmit`).
- Atrybuty dostępności:
  - `aria-label="Formularz wysyłania wiadomości do AI"`

---

### `<p id="prompt-desc" hidden>`

- Ukryty opis pola tekstowego, dostępny dla czytników ekranu.
- Informuje o komendach:
  - `@nazwa_postaci` — skierowanie wiadomości do postaci
  - `/set-location(nazwa)` — zmiana sceny

---

### `<textarea id="prompt">`

- Pole tekstowe do wpisywania wiadomości.
- Atrybuty:
  - `placeholder` z instrukcją
  - `aria-label`, `aria-describedby`
  - `title` z opisem
  - `aria-autocomplete="list"`
  - `required`, `autofocus`
  - `lang="pl"`

---

### `<button type="submit">`

- Przycisk wysyłający wiadomość.
- `aria-controls="chat-container"`
- Ikona `▷` dla lepszego UX na mobilkach.

---

### `<button id="burger-toggle">` i `<aside id="web-side-panel">`

- Przycisk otwiera panel nawigacyjny z linkami.
- Panel wysuwa się z lewej strony (`.open` → `left: 0`).

---

### `<button id="settings-toggle">` i `<aside id="side-panel">`

- Przycisk otwiera panel ustawień użytkownika.
- Panel wysuwa się z prawej strony (`.open` → `right: 0`).
- Zawiera pole `<input id="user_name">` do wpisania imienia.

---

### `<template class="tag-panel-template">`

- Szablon panelu tagowania wiadomości.
- Zawiera pola `<input list>` + `<datalist>` dla:
  - Lokalizacji (`#location-tags`)
  - Postaci (`#character-tags`)
  - Czynności nonNSFW (`#action-tags`)
  - Czynności NSFW (`#nsfw-tags`)
  - Emocji (`#emotion-tags`)
- Na dole galeria obrazów (`#image-gallery`).

---

### `<script src="/static/data/script.js">`

- Ładuje logikę frontendu (obsługa czatu, tagów, podpowiedzi).
- Współpracuje z funkcją pozycjonującą `#input-area` nad klawiaturą na mobilkach.

---

### `<script>` inline – `runDiagnostics()`

- Funkcja pomocnicza do diagnostyki layoutu.
- Zbiera dane o wymiarach viewportu, elementów i scrolla.
- Wynik wpisuje do `textarea#prompt`.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-uwagi-techniczne"></span>

## 🧠 Uwagi techniczne

- Struktura HTML jest semantyczna i zgodna z WCAG 2.1.
- Dostępność zapewniona przez `aria-*`, role i opisy.
- `#chat-wrapper` ma stałą wysokość między belką a inputem.
- `#input-area` jest pozycjonowany przez JS nad klawiaturą na mobilkach.
- Szablon tagów jest gotowy do dynamicznego klonowania przez JS.