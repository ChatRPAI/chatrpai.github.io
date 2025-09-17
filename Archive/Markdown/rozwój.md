## 🧱 Plan rozwojowy – refaktoryzacja i wzorce projektowe

### 🎯 Cel główny

Przekształcenie istniejącego kodu proceduralnego w modularną architekturę obiektową opartą na klasach, z zastosowaniem wzorców projektowych, tak aby:

- zwiększyć czytelność i skalowalność kodu,
- ułatwić testowanie i rozbudowę,
- oddzielić odpowiedzialności i zależności,
- umożliwić dalszy rozwój aplikacji w sposób kontrolowany.

---

### 🧩 Refaktoryzacja kodu do klas

| Obszar funkcjonalny          | Obecny stan                            | Plan refaktoryzacji                           |
| ---------------------------- | -------------------------------------- | --------------------------------------------- |
| DOM globalny (`DOM`)         | Obiekt z referencjami                  | Zastąpiony przez klasę `Dom` (✅ już gotowa)  |
| Obsługa promptu i wiadomości | Funkcje `sendPrompt`, `appendMessage`  | Przeniesione do `ChatManager` i `ChatUI` (✅) |
| Edycja wiadomości            | Funkcja `enableEdit`                   | Wydzielenie klasy `EditManager`               |
| Obsługa tagów                | Funkcje `getSelectedTags`, `clearTags` | Zastąpione przez `TagsPanel` (✅)             |
| Galeria obrazów              | Funkcja `findMatchingImagesAndRender`  | Refaktoryzacja do `ImageResolver`             |
| Formularz oceny              | Funkcja `appendRatingForm`             | Przeniesienie do `RatingForm` jako klasy      |
| Obsługa klawiatury ekranowej | Funkcja `updateForKeyboard`            | Zastąpiona przez `KeyboardManager` (✅)       |
| Przycisk edycji              | Funkcja `createButton`                 | Przeniesienie do `Utils.createButton` (✅)    |

---

### 🧠 Wzorce projektowe do zastosowania

| Wzorzec           | Zastosowanie                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| Singleton         | Klasa `Dom` jako pojedyncza instancja dostępna globalnie                    |
| Factory           | `TagSelectorFactory` do tworzenia komponentów tagów (datalist/select)       |
| Mediator          | `ChatManager` jako pośrednik między UI, backendem i DOM                     |
| Observer / PubSub | `EditManager`, `TagsPanel`, `RatingForm` do komunikacji między komponentami |
| Command           | Obsługa edycji wiadomości jako komendy z możliwością cofania                |
| Adapter           | `BackendAPI` jako warstwa komunikacji z backendem                           |
| Strategy          | Walidacja tagów, wybór obrazów, tryby renderowania                          |
| Decorator         | Rozszerzanie `Diagnostics` o logowanie, mockowanie, testowanie              |

---

### 🔧 Brakujące funkcjonalności do uzupełnienia

| Funkcja                       | Status    | Plan działania                                       |
| ----------------------------- | --------- | ---------------------------------------------------- |
| Edycja wiadomości z tagami    | Częściowo | Wydzielenie `EditManager`, integracja z `BackendAPI` |
| Dynamiczna galeria obrazów    | Częściowo | Refaktoryzacja do `ImageResolver`                    |
| Ocena odpowiedzi AI           | Częściowo | Przeniesienie do klasy `RatingForm`                  |
| Obsługa mobilna tagów         | Ręcznie   | Automatyzacja przez `TagSelectorFactory`             |
| Historia czatu                | Brak      | Dodanie `ChatHistoryManager`                         |
| Tryb testowy / mockowanie API | Brak      | Wprowadzenie `MockBackendAPI`                        |
| Logger i śledzenie błędów     | Brak      | Dodanie `LoggerService`                              |

---

### 📦 Proponowane nowe klasy

| Klasa                | Cel                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `EditManager`        | Obsługa procesu edycji wiadomości, tagów i obrazów                                                            |
| `ImageResolver`      | Logika wyszukiwania i renderowania obrazów na podstawie tagów                                                 |
| `RatingForm`         | Komponent formularza oceny odpowiedzi AI                                                                      |
| `TagSelectorFactory` | Tworzenie komponentów tagów zależnie od urządzenia                                                            |
| `LoggerService`      | Centralne logowanie błędów i zdarzeń diagnostycznych                                                          |
| `ChatHistoryManager` | Przechowywanie i odczyt historii czatu                                                                        |
| `MockBackendAPI`     | Symulacja odpowiedzi backendu do testów i trybu offline                                                       |
| `TagOptionsRegistry` | Centralizuje źródła opcji tagów i pozwala na ich dynamiczne pobieranie (np. z API, pliku JSON, lokalStorage). |
