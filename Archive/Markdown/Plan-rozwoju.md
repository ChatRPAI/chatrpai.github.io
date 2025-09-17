Kamil, przygotowałem Ci **pełny raport porównawczy** na bazie obu plików — pokazuje on:

- **Jakie funkcjonalności były w starym kodzie (`zawartość-script.js`)**, a w refaktorze (`js-klasowy.md`) jeszcze ich nie ma lub są niepełne.
- **Jakie wzorce projektowe** można zastosować, żeby te braki uzupełnić w sposób spójny z nową architekturą.

---

## 📊 Raport braków i rekomendacji

| Obszar / Funkcja | Status w starym kodzie | Status w refaktorze | Brakujące elementy | Proponowany wzorzec / rozwiązanie |
|------------------|------------------------|---------------------|--------------------|------------------------------------|
| **Wysyłanie prompta (`sendPrompt`)** | Pełna funkcja async: blokada inputa, dodanie wiadomości usera, loading, fetch `/generate`, czas generowania, przycisk edycji, formularz oceny, obsługa błędów | Jest szkic w `ChatManager.sendPrompt()`, ale **brak** implementacji metod w `ChatUI` (`addLoadingMessage`, `updateAIMessage`, `showError`, `addEditButton`, `addRatingForm`) i brak klasy `BackendAPI` | Implementacja brakujących metod w `ChatUI` + klasa `BackendAPI` z metodą `generate()` | **Mediator** (`App` koordynuje `ChatManager` ↔ `ChatUI` ↔ `BackendAPI`), **Command** (wysyłka prompta jako komenda) |
| **Obsługa Ctrl+Enter** | EventListener na `keydown` w `#prompt` | Brak w `App` | Dodanie eventu w `App.init()` lub w `ChatManager` | **Mediator** – `App` nasłuchuje i wywołuje `chatManager.sendPrompt()` |
| **Formularz oceny (`appendRatingForm` / `submitRating`)** | Tworzenie `<details>` z inputami range, wysyłka `/rate` | Brak w refaktorze | Metoda `ChatUI.addRatingForm()` + `BackendAPI.rate()` | **Builder** (generowanie formularza), **Mediator** (App łączy UI z API) |
| **Edycja wiadomości (`enableEdit`)** | Tworzenie textarea, wstawienie panelu tagów z `<template>`, obsługa zapisu/anulowania, dynamiczne ładowanie obrazów, wysyłka `/edit` | Brak w refaktorze | Metody w `ChatUI` (`enableEdit`), klasa `BackendAPI.edit()`, integracja z `TagsPanel` i `GalleryLoader` | **Factory** (tworzenie panelu tagów), **Observer** (zmiana tagów → galeria), **Mediator** |
| **Ładowanie obrazów po tagach (`findMatchingImagesAndRender`)** | Funkcja async z HEAD-check, generowanie `<label>` z `<input type="radio">` i `<img>` | Częściowo w `GalleryLoader` (ładowanie z API), brak logiki HEAD-check i kombinacji tagów | Rozszerzenie `GalleryLoader` o tryb lokalny (HEAD-check) | **Strategy** (różne źródła obrazów: API vs lokalne pliki) |
| **Zamiana datalist na select na mobilu (`replaseDatalistAsSelectIfIsMobile`)** | Funkcja globalna, działa w `enableEdit` | Brak w refaktorze | Metoda w `TagsPanel` wywoływana w `init()` jeśli `Utils.isMobile()` | **Decorator** (modyfikacja UI w zależności od platformy) |
| **Ustawianie nazwy użytkownika (`setUserName`)** | Event input na `#user_name`, zapis do zmiennej globalnej | Brak w refaktorze | Metoda w `App` lub osobna klasa `UserSettings` | **Singleton** (przechowywanie ustawień użytkownika) |
| **Sprawdzanie istnienia obrazka (`checkImageExists`)** | Funkcja async HEAD | Brak w refaktorze | Metoda w `Utils` | **Utility** |
| **Tworzenie przycisków (`createButton`)** | Funkcja globalna | Brak w refaktorze | Metoda w `Utils` lub `ChatUI` | **Factory Method** |
| **Obsługa paneli bocznych** | Ręczne toggle w eventach click | Jest w `PanelsController` | OK | — |
| **Obsługa klawiatury ekranowej** | Funkcja `updateForKeyboard` + eventy | Jest w `KeyboardManager` | OK | — |

---

## 🧠 Wzorce projektowe do zastosowania

| Wzorzec | Gdzie zastosować | Cel |
|---------|-----------------|-----|
| **Mediator** | `App` jako centralny koordynator | Oddzielenie modułów (`ChatManager`, `ChatUI`, `BackendAPI`, `TagsPanel`) i kontrola przepływu zdarzeń |
| **Factory** | Tworzenie panelu tagów, przycisków | Uproszczenie tworzenia powtarzalnych elementów DOM |
| **Observer** | `TagsPanel` → `GalleryLoader` | Automatyczna reakcja na zmianę tagów |
| **Strategy** | `GalleryLoader` | Wybór źródła obrazów (API vs lokalne HEAD-check) |
| **Builder** | Formularz oceny | Łatwe generowanie złożonych struktur DOM |
| **Singleton** | `Dom`, `Utils`, `UserSettings` | Jedna instancja w całej aplikacji |
| **Decorator** | `TagsPanel` na mobilu | Dynamiczna modyfikacja UI w zależności od środowiska |

