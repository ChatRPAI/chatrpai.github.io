# 🎨 Dokumentacja CSS

[⬅️ Powrót na stronę główną](../README.md)  
[⬅️ Powrót do dokumentacji Frontendu](../Frontend/main.md)

---
System stylów w projekcie opiera się na **hybrydzie podejścia utility‑first** (małe, jednofunkcyjne klasy do layoutu, odstępów, kolorów, typografii) oraz **stylów komponentowych** (dedykowane reguły dla konkretnych elementów interfejsu).  
Dzięki temu można szybko budować layouty z gotowych klas, a jednocześnie utrzymać spójny wygląd większych bloków aplikacji.

---

- [🎨 Dokumentacja CSS](#-dokumentacja-css)
  - [Specjalne znaczniki i konstrukcje globalne](#specjalne-znaczniki-i-konstrukcje-globalne)
    - [`:root`](#root)
    - [`@media (prefers-color-scheme: light)`](#media-prefers-color-scheme-light)
    - [Reset i ustawienia globalne](#reset-i-ustawienia-globalne)
  - [Klasy komponentowe](#klasy-komponentowe)
    - [Struktura główna](#struktura-główna)
    - [Chat](#chat)
    - [Wiadomości](#wiadomości)
    - [Pole wprowadzania](#pole-wprowadzania)
    - [Formularz oceny](#formularz-oceny)
    - [Panel tagów](#panel-tagów)
    - [Sekcja rozwijana](#sekcja-rozwijana)
    - [Przyciski pływające](#przyciski-pływające)
    - [Panele boczne](#panele-boczne)
    - [Select mobilny](#select-mobilny)
    - [Responsywność](#responsywność)

---

## Specjalne znaczniki i konstrukcje globalne

### `:root`
- Definiuje zmienne kolorów, tła, akcentów, obramowań i innych elementów motywu.
- Umożliwia łatwą zmianę wyglądu całej aplikacji przez modyfikację jednej wartości.

### `@media (prefers-color-scheme: light)`
- Nadpisuje zmienne z `:root` dla trybu jasnego.
- Zapewnia automatyczne dostosowanie motywu do preferencji systemowych użytkownika.

### Reset i ustawienia globalne
- `html, body` — reset marginesów i paddingów, blokada przewijania strony, ustawienie koloru tła i tekstu z motywu.
- `overscroll-behavior: none` — zapobiega „przeciąganiu” widoku na urządzeniach dotykowych.

---

## Klasy komponentowe

### Struktura główna
- **`#app`** — główny kontener aplikacji, obejmuje wszystkie elementy interfejsu, utrzymuje layout w obrębie widoku.
- **`h1`** — nagłówek aplikacji, wyrównany do środka.

### Chat
- **`#chat-wrapper`** — obszar historii czatu, umieszczony pomiędzy nagłówkiem a polem wprowadzania wiadomości.
- **`#chat-container`** — przewijalny kontener na wiadomości, z dolnym odstępem, aby nie zasłaniało ich pole wprowadzania.

### Wiadomości
- **`.message`** — ogólny styl wiadomości (tło, marginesy, zaokrąglenia).
- **`.user`** — wariant wiadomości użytkownika (wyrównanie do prawej).
- **`.ai`** — wariant wiadomości AI (wyrównanie do lewej).

### Pole wprowadzania
- **`#input-area`** — formularz wysyłania wiadomości, dokowany na dole widoku.
- **`#input-area textarea`** — pole tekstowe, elastyczne w szerokości, minimalna wysokość.
- **`#input-area button`** — przycisk wysyłania, stały rozmiar, ikona.

### Formularz oceny
- **`.rating-form`** — kontener formularza oceny wiadomości, siatka dwóch kolumn.
- **`.rating-form h3`** — nagłówek sekcji oceny.
- **`.rating-form label`** — etykieta z kontrolką.
- **`.rating-form input[type="range"]`** — suwak oceny.
- **`.rating-form button`** — przycisk wysyłania oceny.

### Panel tagów
- **`.tag-panel`** — panel wyboru tagów z polami i galerią obrazów.
- **`.tag-panel input`** — pola wyboru tagów.
- **`.tag-panel label`** — etykiety pól.
- **`.tag-panel #image-gallery`** — siatka miniatur obrazów.
- **`.tag-panel img`** — obrazki w galerii.
- **`.tag-panel input[type="radio"]`** — ukryte przyciski radiowe.

### Sekcja rozwijana
- **`details`** — sekcja rozwijana.
- **`summary`** — nagłówek sekcji rozwijanej.
- **`.img-responsive`** — obrazek dopasowujący się do szerokości.
- **`.image-label`** — etykieta obrazu.

### Przyciski pływające
- **`.button-icon`** — przyciski otwierające panele boczne.
- **`#burger-toggle`** — przycisk otwierający panel nawigacyjny.
- **`#settings-toggle`** — przycisk otwierający panel ustawień.

### Panele boczne
- **`#web-side-panel`** — panel boczny z linkami, wysuwany z lewej.
- **`#side-panel`** — panel boczny z ustawieniami, wysuwany z prawej.
- **`.open`** — stan widoczny panelu.

### Select mobilny
- **`.tag-select-mobile`** — styl selecta mobilnego.

### Responsywność
- **`@media (max-width: 768px)`** — zmiana układu galerii na jedną kolumnę.

