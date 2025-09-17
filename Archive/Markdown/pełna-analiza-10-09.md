# Twoje Raporty poszczególnych klas

---

**Spis treści**

- [Twoje Raporty poszczególnych klas](#twoje-raporty-poszczególnych-klas)
- [📦 Klasa `App` – analiza strukturalna](#-klasa-app--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `App`](#-wzorce-projektowe-w-app)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia)
  - [📦 Proponowane klasy wspierające `App`](#-proponowane-klasy-wspierające-app)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej)
- [📦 Klasa `Utils` – analiza strukturalna](#-klasa-utils--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `Utils`](#-wzorce-projektowe-w-utils)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-1)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-1)
  - [📦 Proponowane klasy wspierające `Utils`](#-proponowane-klasy-wspierające-utils)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-1)
- [📦 Klasa `TagsPanel` – analiza strukturalna](#-klasa-tagspanel--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `TagsPanel`](#-wzorce-projektowe-w-tagspanel)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-2)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-2)
  - [📦 Proponowane klasy wspierające `TagsPanel`](#-proponowane-klasy-wspierające-tagspanel)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-2)
- [📦 Klasa `TagSelectorFactory` – analiza strukturalna](#-klasa-tagselectorfactory--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `TagSelectorFactory`](#-wzorce-projektowe-w-tagselectorfactory)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-3)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-3)
  - [📦 Proponowane klasy wspierające `TagSelectorFactory`](#-proponowane-klasy-wspierające-tagselectorfactory)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-3)
- [📦 Klasa `PanelsController` – analiza strukturalna](#-klasa-panelscontroller--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `PanelsController`](#-wzorce-projektowe-w-panelscontroller)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-4)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-4)
  - [📦 Proponowane klasy wspierające `PanelsController`](#-proponowane-klasy-wspierające-panelscontroller)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-4)
- [📦 Klasa `KeyboardManager` – analiza strukturalna](#-klasa-keyboardmanager--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `KeyboardManager`](#-wzorce-projektowe-w-keyboardmanager)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-5)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-5)
  - [📦 Proponowane klasy wspierające `KeyboardManager`](#-proponowane-klasy-wspierające-keyboardmanager)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-5)
- [📦 Klasa `ImageResolver` – analiza strukturalna](#-klasa-imageresolver--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `ImageResolver`](#-wzorce-projektowe-w-imageresolver)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-6)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-6)
  - [📦 Proponowane klasy wspierające `ImageResolver`](#-proponowane-klasy-wspierające-imageresolver)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-6)
- [📦 Klasa `GalleryLoader` – analiza strukturalna](#-klasa-galleryloader--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `GalleryLoader`](#-wzorce-projektowe-w-galleryloader)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-7)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-7)
  - [📦 Proponowane klasy wspierające `GalleryLoader`](#-proponowane-klasy-wspierające-galleryloader)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-7)
- [📦 Klasa `EditManager` – analiza strukturalna](#-klasa-editmanager--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `EditManager`](#-wzorce-projektowe-w-editmanager)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-8)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-8)
  - [📦 Proponowane klasy wspierające `EditManager`](#-proponowane-klasy-wspierające-editmanager)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-8)
- [📦 Klasa `Dom` – analiza strukturalna](#-klasa-dom--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `Dom`](#-wzorce-projektowe-w-dom)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-9)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-9)
  - [📦 Proponowane klasy wspierające `Dom`](#-proponowane-klasy-wspierające-dom)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-9)
- [📦 Klasa `Diagnostics` – analiza strukturalna](#-klasa-diagnostics--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `Diagnostics`](#-wzorce-projektowe-w-diagnostics)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-10)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-10)
  - [📦 Proponowane klasy wspierające `Diagnostics`](#-proponowane-klasy-wspierające-diagnostics)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-10)
- [📦 Klasa `ChatUI` – analiza strukturalna](#-klasa-chatui--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `ChatUI`](#-wzorce-projektowe-w-chatui)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-11)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-11)
  - [📦 Proponowane klasy wspierające `ChatUI`](#-proponowane-klasy-wspierające-chatui)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-11)
- [📦 Klasa `ChatManager` – analiza strukturalna](#-klasa-chatmanager--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `ChatManager`](#-wzorce-projektowe-w-chatmanager)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-12)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-12)
  - [📦 Proponowane klasy wspierające `ChatManager`](#-proponowane-klasy-wspierające-chatmanager)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-12)
- [📦 Klasa `BackendAPI` – analiza strukturalna](#-klasa-backendapi--analiza-strukturalna)
  - [🧠 Wzorce projektowe w `BackendAPI`](#-wzorce-projektowe-w-backendapi)
  - [⚠️ Potencjalne problemy i miejsca do optymalizacji](#️-potencjalne-problemy-i-miejsca-do-optymalizacji-13)
  - [🧩 Funkcjonalności do uzupełnienia](#-funkcjonalności-do-uzupełnienia-13)
  - [📦 Proponowane klasy wspierające `BackendAPI`](#-proponowane-klasy-wspierające-backendapi)
  - [✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej](#-status-refaktoryzacji-względem-wersji-pre-refaktoryzacyjnej-13)

---

# 📦 Klasa `App` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Fasada aplikacji – centralny punkt inicjalizacji i integracji modułów       |
| **Zależności**       | 11 klas: `Dom`, `Utils`, `BackendAPI`, `KeyboardManager`, `PanelsController`, `EditManager`, `ChatUI`, `ChatManager`, `Diagnostics`, `TagsPanel`, `GalleryLoader` |
| **Metody**           | `constructor`, `addClearImageCacheButton`, `renderTagPanel`, `initTagModules`, `init` |
| **Zdarzenia DOM**    | `submit`, `keydown` (Ctrl+Enter)                                             |
| **Zastosowane wzorce** | Fasada, Mediator, Kompozycja, Singleton (Dom), Adapter (BackendAPI)        |
| **Stan refaktoryzacji** | ✅ W pełni obiektowa, dobrze oddzielona od logiki UI i backendu            |

---

## 🧠 Wzorce projektowe w `App`

| Wzorzec        | Zastosowanie w `App`                                      |
|----------------|------------------------------------------------------------|
| **Fasada**     | Centralna klasa spinająca wszystkie moduły                 |
| **Mediator**   | Pośredniczy między `ChatManager`, `EditManager`, `PanelsController` |
| **Kompozycja** | Tworzy instancje klas i przekazuje zależności              |
| **Adapter**    | `BackendAPI` jako warstwa komunikacji                      |
| **Singleton**  | `Dom` jako globalny dostęp do elementów DOM                |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| `addClearImageCacheButton()`   | Bezpośredni dostęp do DOM – można przenieść do `SettingsPanel` lub `CacheManager` |
| `renderTagPanel()`             | Duplikuje logikę z `initTagModules()` – warto ujednolicić                      |
| `init()`                       | Rejestruje zdarzenia bezpośrednio – można wydzielić do `EventBinder`          |
| Brak testowalności             | Brak interfejsów lub mocków dla zależności                                     |
| Brak trybu testowego           | Nie obsługuje `MockBackendAPI` ani `LoggerService`                            |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Historia czatu                   | ❌ Brak    | Dodać `ChatHistoryManager`                         |
| Logger błędów i zdarzeń          | ❌ Brak    | Dodać `LoggerService`                              |
| Tryb testowy / offline           | ❌ Brak    | Wprowadzić `MockBackendAPI`                        |
| Obsługa użytkownika              | ❌ Brak    | Wydzielić `UserManager`                            |
| Dynamiczne źródła tagów          | ❌ Brak    | Dodać `TagOptionsRegistry`                         |
| Obsługa zdarzeń DOM              | 🔶 Ręcznie | Wydzielić do `EventBinder`                         |

---

## 📦 Proponowane klasy wspierające `App`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `SettingsPanel`     | Obsługa UI panelu ustawień, w tym czyszczenia cache                  |
| `EventBinder`       | Rejestracja zdarzeń DOM w sposób modularny                           |
| `LoggerService`     | Centralne logowanie błędów i zdarzeń                                 |
| `MockBackendAPI`    | Tryb offline / testowy dla backendu                                  |
| `ChatHistoryManager`| Przechowywanie i odczyt historii czatu                               |
| `UserManager`       | Obsługa imienia użytkownika, preferencji                             |
| `TagOptionsRegistry`| Dynamiczne źródła opcji tagów (np. z API, JSON, lokalStorage)        |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `sendPrompt()`                 | Przeniesiona do `ChatManager` (✅)        |
| `appendMessage()`              | Przeniesiona do `ChatUI` (✅)             |
| `createButton()`               | Przeniesiona do `Utils` (✅)              |
| `enableEdit()`                 | Przeniesiona do `EditManager` (✅)        |
| `checkImageExists()`           | Przeniesiona do `ImageResolver` (✅)      |
| `appendRatingForm()`           | Wymaga klasy `RatingForm` (❌)            |
| `submitRating()`               | Wymaga klasy `RatingForm` (❌)            |
| `updateForKeyboard()`          | Zastąpiona przez `KeyboardManager` (✅)   |

---

# 📦 Klasa `Utils` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Zbiór funkcji pomocniczych wykorzystywanych globalnie                        |
| **Typ**              | Klasa statyczna (nie wymaga instancji)                                       |
| **Metody**           | 10 metod: `throttle`, `debounce`, `formatDate`, `clamp`, `randomId`, `isMobile`, `safeQuery`, `createButton`, `checkImageExists` |
| **Zależności**       | `window`, `navigator`, `document`, `fetch`                                   |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, dobrze zorganizowana                                |

---

## 🧠 Wzorce projektowe w `Utils`

| Wzorzec        | Zastosowanie w `Utils`                                      |
|----------------|-------------------------------------------------------------|
| **Singleton**  | Dostęp globalny bez instancji                               |
| **Utility**    | Klasa narzędziowa z funkcjami pomocniczymi                  |
| **Adapter**    | `checkImageExists()` jako warstwa nad `fetch HEAD`         |
| **Factory**    | `createButton()` jako uproszczony komponent DOM            |
| **Strategy (potencjalny)** | `throttle` / `debounce` jako strategie wywołań funkcji |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| `isMobile()`                   | Opiera się na `userAgent` – warto dodać fallback lub rozszerzyć o `window.innerWidth` |
| `checkImageExists()`           | Brak cache lub retry logic – można zintegrować z `ImageResolver`               |
| `createButton()`               | Brak możliwości stylizacji lub atrybutów – warto rozszerzyć o opcje            |
| Brak testowalności             | Funkcje operują bezpośrednio na DOM i `fetch` – warto dodać mockowalne warstwy |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Logger błędów                    | ❌ Brak    | Dodać `LoggerService` zamiast `console.warn`       |
| Obsługa stylów DOM               | ❌ Brak    | Rozszerzyć `createButton()` o `className`, `style` |
| Cache obrazów                   | ❌ Brak    | Wydzielić do `ImageCacheManager` lub `ImageResolver` |
| Obsługa zdarzeń globalnych      | ❌ Brak    | Wydzielić do `EventBinder`                         |

---

## 📦 Proponowane klasy wspierające `Utils`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `LoggerService`     | Centralne logowanie błędów i ostrzeżeń                               |
| `ImageCacheManager` | Cache i dostępność obrazów                                           |
| `EventBinder`       | Rejestracja zdarzeń DOM w sposób modularny                           |
| `DomBuilder`        | Tworzenie komponentów DOM z opcjami stylizacji i atrybutów           |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `createButton()`               | Przeniesiona do `Utils` (✅)              |
| `checkImageExists()`           | Przeniesiona do `Utils` (✅)              |
| `debounce()` / `throttle()`    | Dodane jako nowe funkcje (🆕)             |
| `safeQuery()`                  | Zastępuje bezpośrednie `document.querySelector` (✅) |

---

# 📦 Klasa `TagsPanel` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Zarządzanie panelem tagów i aktualizacją galerii obrazów                     |
| **Typ**              | Komponent UI z logiką interakcji i renderowania                              |
| **Metody**           | `constructor`, `q`, `buildTagFields`, `init`, `getSelectedTags`, `getTagList`, `refreshGallery`, `clearTags` |
| **Zależności**       | `TagSelectorFactory`, `GalleryLoader`, `ImageResolver`, `Utils.debounce`     |
| **Stan refaktoryzacji** | ✅ W pełni obiektowa, dobrze wydzielona z logiki głównej aplikacji          |

---

## 🧠 Wzorce projektowe w `TagsPanel`

| Wzorzec        | Zastosowanie w `TagsPanel`                                      |
|----------------|------------------------------------------------------------------|
| **Kompozycja** | Wstrzykiwanie `GalleryLoader` jako zależności                    |
| **Factory**    | `TagSelectorFactory` do tworzenia pól tagów                     |
| **Observer**   | `init()` rejestruje callback na zmiany tagów                    |
| **Strategy (pośrednio)** | `GalleryLoader` wybiera sposób renderowania obrazów         |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| `buildTagFields()`             | Twardo zakodowane opcje tagów – warto wydzielić do `TagOptionsRegistry`       |
| `refreshGallery()`             | Brak obsługi błędów lub pustych wyników – warto dodać fallback                |
| `clearTags()`                  | Brak animacji lub potwierdzenia – UX może być surowy                         |
| Brak testowalności             | Silne sprzężenie z DOM – warto dodać interfejs do mockowania                 |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Dynamiczne źródła tagów          | ❌ Brak    | Dodać `TagOptionsRegistry`                         |
| Obsługa błędów renderowania      | ❌ Brak    | Rozszerzyć `GalleryLoader` o fallback              |
| Reset tagów z animacją           | ❌ Brak    | Rozszerzyć `clearTags()` o UX feedback             |
| Tryb zaawansowany (np. multi-tag)| ❌ Brak    | Dodać `AdvancedTagPanel` jako rozszerzenie         |

---

## 📦 Proponowane klasy wspierające `TagsPanel`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `TagOptionsRegistry`| Centralne źródło opcji tagów (np. z API, JSON, lokalStorage)         |
| `AdvancedTagPanel`  | Rozszerzona wersja z obsługą wielu tagów, grup, filtrów              |
| `TagValidator`      | Walidacja i normalizacja wartości tagów                              |
| `TagStateManager`   | Przechowywanie i odtwarzanie stanu tagów (np. z historii)            |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `createTagFields()`            | Przeniesiona do `TagsPanel.buildTagFields()` (✅) |
| `onTagChange()`                | Zastąpiona przez `init(onChange)` (✅)    |
| `renderGalleryFromTags()`     | Przeniesiona do `refreshGallery()` (✅)   |
| `clearTagFields()`            | Przeniesiona do `clearTags()` (✅)        |

---

# 📦 Klasa `TagSelectorFactory` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Fabryka komponentów tagów zależnych od środowiska (mobile vs desktop)        |
| **Typ**              | Klasa statyczna (utility factory)                                            |
| **Metody**           | `createTagField`, `getLabelText`, `replaceTagField`                          |
| **Zależności**       | `Utils.isMobile()`, `document.createElement`, `TagsPanel`                    |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, dobrze zorganizowana                                |

---

## 🧠 Wzorce projektowe w `TagSelectorFactory`

| Wzorzec        | Zastosowanie w `TagSelectorFactory`                                      |
|----------------|--------------------------------------------------------------------------|
| **Factory**    | Tworzy komponenty tagów na podstawie typu urządzenia                    |
| **Strategy (implicit)** | Wybór między `<select>` a `<input>` + `<datalist>` jako strategia UI |
| **Adapter (pośrednio)** | Abstrakcja nad DOM API                                           |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| `getLabelText()`               | Twardo zakodowane etykiety – warto wydzielić do `TagOptionsRegistry`          |
| `replaceTagField()`            | Brak animacji lub zachowania stanu – może powodować utratę danych            |
| Brak testowalności             | Operuje bezpośrednio na DOM – warto dodać interfejs do mockowania             |
| Brak obsługi błędów            | Nie sprawdza, czy `container` zawiera poprawny element                       |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Dynamiczne źródła etykiet        | ❌ Brak    | Dodać `TagLabelRegistry`                           |
| Obsługa wielojęzyczności         | ❌ Brak    | Rozszerzyć `getLabelText()` o lokalizację          |
| Zachowanie stanu pola            | ❌ Brak    | Dodanie `TagStateManager`                          |
| Walidacja wartości               | ❌ Brak    | Dodać `TagValidator`                               |

---

## 📦 Proponowane klasy wspierające `TagSelectorFactory`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `TagOptionsRegistry`| Centralne źródło opcji tagów                                         |
| `TagLabelRegistry`  | Obsługa etykiet i lokalizacji                                        |
| `TagValidator`      | Walidacja i normalizacja wartości tagów                              |
| `TagStateManager`   | Przechowywanie i odtwarzanie stanu tagów                             |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `createTagField()`             | Przeniesiona do `TagSelectorFactory` (✅) |
| `getLabelText()`               | Nowa funkcja – wcześniej hardcoded (🆕)   |
| `replaceTagField()`            | Nowa funkcja – wcześniej ręczne nadpisywanie (🆕) |

---

# 📦 Klasa `PanelsController` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Zarządzanie widocznością paneli bocznych (menu, ustawienia)                  |
| **Typ**              | Kontroler UI                                                                  |
| **Metody**           | `constructor`, `init`, `openPanel`, `closePanel`, `togglePanel`, `closeAllPanels` |
| **Zależności**       | `Dom` (referencje do przycisków i paneli), `HTMLElement`, `classList`         |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, dobrze zorganizowana                                |

---

## 🧠 Wzorce projektowe w `PanelsController`

| Wzorzec        | Zastosowanie w `PanelsController`                                      |
|----------------|------------------------------------------------------------------------|
| **Controller** | Steruje interakcją użytkownika z panelami                              |
| **Mediator (częściowo)** | Pośredniczy między DOM a logiką widoczności paneli           |
| **Singleton (pośrednio)** | Współpracuje z `Dom` jako globalnym źródłem referencji       |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak animacji paneli           | Przełączanie klas `open` jest natychmiastowe – warto dodać płynne przejścia   |
| Brak obsługi stanu aplikacji   | Nie zapisuje, który panel był otwarty – brak integracji z `AppStateManager`   |
| Brak testowalności             | Operuje bezpośrednio na DOM – warto dodać interfejs do mockowania             |
| Brak rozszerzalności           | Lista paneli jest zakodowana na sztywno – warto umożliwić dynamiczną rejestrację |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Dynamiczna rejestracja paneli    | ❌ Brak    | Dodać `registerPanel(button, panel)`               |
| Obsługa stanu otwartego panelu   | ❌ Brak    | Dodać `AppStateManager` lub `PanelStateTracker`    |
| Animacje otwierania/zamykania    | ❌ Brak    | Rozszerzyć o klasy CSS z przejściami               |
| Obsługa trybu mobilnego          | ❌ Brak    | Integracja z `Utils.isMobile()`                    |

---

## 📦 Proponowane klasy wspierające `PanelsController`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `PanelStateTracker` | Przechowywanie informacji o aktualnie otwartym panelu                |
| `PanelRegistry`     | Dynamiczne zarządzanie panelami i ich przyciskami                    |
| `PanelAnimator`     | Obsługa animacji otwierania/zamykania paneli                         |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `togglePanel()`                | Przeniesiona do `PanelsController` (✅)   |
| `closeAllPanels()`             | Przeniesiona do `PanelsController` (✅)   |
| Obsługa kliknięć               | Zastąpiona przez `init()` (✅)            |

---

# 📦 Klasa `KeyboardManager` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Zarządzanie pozycjonowaniem pola tekstowego względem klawiatury ekranowej    |
| **Typ**              | Menedżer systemowy reagujący na zmiany viewportu                             |
| **Metody**           | `constructor`, `init`, `updatePosition`                                      |
| **Zależności**       | `Dom`, `window.visualViewport`, `navigator.userAgent`                        |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje funkcję `updateForKeyboard` z wersji starej |

---

## 🧠 Wzorce projektowe w `KeyboardManager`

| Wzorzec        | Zastosowanie w `KeyboardManager`                                      |
|----------------|------------------------------------------------------------------------|
| **Observer**   | Reaguje na zdarzenia `resize` i `scroll` z `visualViewport`           |
| **Adapter**    | Abstrakcja nad różnicami przeglądarek (Firefox workaround)            |
| **Controller** | Steruje pozycjonowaniem elementu UI na podstawie stanu systemowego    |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Firefox workaround             | Ustawia `scrollTop = 0` bez warunku – może kolidować z innymi komponentami    |
| Brak testowalności             | Operuje bezpośrednio na `window` i `document` – warto dodać interfejs do mockowania |
| Brak obsługi dynamicznych elementów | Zakłada obecność `inputArea` – warto dodać retry lub obserwator DOM         |
| Brak integracji z `Utils.isMobile()` | Można połączyć z detekcją urządzenia dla lepszej kontroli                   |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Obsługa innych przeglądarek      | ❌ Brak    | Rozszerzyć o Safari, Chrome na iOS itd.            |
| Integracja z `AppStateManager`   | ❌ Brak    | Przechowywanie ostatniej pozycji interfejsu        |
| Obsługa dynamicznych elementów   | ❌ Brak    | Dodanie `MutationObserver` lub retry logic         |
| Tryb testowy                     | ❌ Brak    | Wprowadzenie `MockViewport` do testów              |

---

## 📦 Proponowane klasy wspierające `KeyboardManager`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `ViewportObserver`  | Abstrakcja nad `visualViewport` z możliwością testowania             |
| `AppStateManager`   | Przechowywanie stanu UI, np. pozycji `inputArea`                     |
| `KeyboardFixRegistry` | Zbiór workaroundów dla różnych przeglądarek                        |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `updateForKeyboard()`          | Zastąpiona przez `KeyboardManager.updatePosition()` (✅) |
| `window.visualViewport.addEventListener(...)` | Przeniesione do `KeyboardManager.init()` (✅) |

---

# 📦 Klasa `ImageResolver` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Generowanie listy dostępnych obrazów na podstawie kombinacji tagów           |
| **Typ**              | Klasa statyczna (utility resolver)                                           |
| **Metody**           | `resolve`, `checkImageExists`, `preloadImages`, `generateCombinations`       |
| **Zależności**       | `fetch`, `localStorage`, `Image`, współpraca z `GalleryLoader`               |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje funkcję `findMatchingImagesAndRender` z wersji starej |

---

## 🧠 Wzorce projektowe w `ImageResolver`

| Wzorzec        | Zastosowanie w `ImageResolver`                                      |
|----------------|---------------------------------------------------------------------|
| **Strategy**   | Generowanie kombinacji tagów jako strategia wyszukiwania obrazów   |
| **Adapter**    | `checkImageExists()` jako warstwa nad `fetch HEAD`                 |
| **Cache**      | `imageCache` i `localStorage` jako pamięć podręczna                |
| **Singleton (implicit)** | Statyczna klasa z globalnym dostępem do metod i stanu    |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak limitu zapytań HEAD       | Może generować zbyt wiele zapytań – warto dodać throttling                    |
| Brak obsługi błędów preloadu   | `Image.src` nie raportuje błędów – warto dodać fallback                       |
| Brak testowalności             | Operuje bezpośrednio na `fetch`, `localStorage`, `Image`                      |
| Brak integracji z `TagOptionsRegistry` | Kombinacje tagów są generowane lokalnie – warto ustandaryzować źródła |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Limitowanie zapytań HEAD         | ❌ Brak    | Dodać `Utils.throttle()` lub `RequestQueueManager` |
| Obsługa błędów preloadu          | ❌ Brak    | Rozszerzyć `preloadImages()` o `onerror`           |
| Integracja z tagami dynamicznymi | ❌ Brak    | Połączyć z `TagOptionsRegistry`                    |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockImageResolver`                     |

---

## 📦 Proponowane klasy wspierające `ImageResolver`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `RequestQueueManager` | Kolejkowanie i limitowanie zapytań HEAD                            |
| `MockImageResolver` | Symulacja dostępności obrazów do testów                             |
| `ImageValidator`    | Walidacja URLi i rozszerzeń obrazów                                 |
| `TagOptionsRegistry`| Centralne źródło opcji tagów i ich kombinacji                       |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `findMatchingImagesAndRender()`| Zastąpiona przez `ImageResolver.resolve()` (✅) |
| `checkImageExists()`           | Przeniesiona do `ImageResolver` (✅)      |
| `preloadImages()`              | Nowa funkcja – wcześniej brak preloadu (🆕) |
| `generateCombinations()`       | Nowa funkcja – wcześniej kombinacje były ręczne (🆕) |

---

# 📦 Klasa `GalleryLoader` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Renderowanie i zarządzanie galerią obrazów na podstawie tagów lub danych z API |
| **Typ**              | Komponent UI z logiką renderowania i interakcji                              |
| **Metody**           | `constructor`, `clearGallery`, `showMessage`, `renderFromTags`, `renderImages`, `highlightSelected`, `loadFromAPI` |
| **Zależności**       | `ImageResolver`, `Utils`, `HTMLElement`, `fetch`, `window.location.origin`   |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, dobrze zorganizowana                                |

---

## 🧠 Wzorce projektowe w `GalleryLoader`

| Wzorzec        | Zastosowanie w `GalleryLoader`                                      |
|----------------|---------------------------------------------------------------------|
| **Controller** | Steruje renderowaniem i interakcją z galerią                        |
| **Strategy (pośrednio)** | Wybór źródła danych: tagi (`ImageResolver`) vs API (`loadFromAPI`) |
| **Observer (implicit)** | Reaguje na kliknięcia obrazów i aktualizuje stan wyboru    |
| **Adapter**    | Abstrakcja nad strukturą danych z API                               |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak obsługi błędów renderowania | `renderImages()` nie sprawdza poprawności URLi ani błędów ładowania obrazów |
| Brak testowalności             | Operuje bezpośrednio na DOM i `fetch` – warto dodać interfejs do mockowania  |
| Brak integracji z `AppStateManager` | Nie zapisuje wybranego obrazu – brak trwałości wyboru                     |
| Brak animacji lub UX feedback  | Przełączanie obrazów jest natychmiastowe – warto dodać efekt zaznaczenia     |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Obsługa błędów ładowania obrazów | ❌ Brak    | Rozszerzyć `renderImages()` o `onerror`            |
| Zachowanie wyboru obrazu         | ❌ Brak    | Dodać `AppStateManager` lub `ImageSelectionStore`  |
| Animacje i UX feedback           | ❌ Brak    | Rozszerzyć `highlightSelected()` o efekty wizualne |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockGalleryLoader`                     |

---

## 📦 Proponowane klasy wspierające `GalleryLoader`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `ImageSelectionStore` | Przechowywanie wybranego obrazu                                     |
| `MockGalleryLoader` | Symulacja renderowania do testów                                     |
| `GalleryAnimator`   | Obsługa animacji i efektów przejścia                                 |
| `GalleryErrorHandler` | Obsługa błędów ładowania obrazów                                   |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `findMatchingImagesAndRender()`| Zastąpiona przez `renderFromTags()` (✅)  |
| `renderImageGallery()`         | Zastąpiona przez `renderImages()` (✅)    |
| `showGalleryMessage()`         | Zastąpiona przez `showMessage()` (✅)     |
| `loadGalleryFromAPI()`         | Zastąpiona przez `loadFromAPI()` (✅)     |

---

# 📦 Klasa `EditManager` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Obsługa trybu edycji wiadomości AI w interfejsie czatu                       |
| **Typ**              | Komponent UI z logiką edycji, renderowania i komunikacji z backendem         |
| **Metody**           | `constructor`, `enableEdit`, `getSelectedTags`, `attachTagListeners`, `renderImages`, `submitEdit` |
| **Zależności**       | `Dom`, `BackendAPI`, `GalleryLoader`, `TagsPanel`, `ImageResolver`, `Utils`  |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje funkcję `enableEdit()` z wersji starej     |

---

## 🧠 Wzorce projektowe w `EditManager`

| Wzorzec        | Zastosowanie w `EditManager`                                      |
|----------------|-------------------------------------------------------------------|
| **Controller** | Steruje interfejsem edycji i przepływem danych                    |
| **Factory (pośrednio)** | Tworzy komponenty edycji (textarea, tagi, galeria)       |
| **Strategy (pośrednio)** | `ImageResolver` jako strategia wyboru obrazów           |
| **Command (do wdrożenia)** | Możliwość cofania edycji i przywracania stanu         |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak zarządzania stanem edycji | Nie zapisuje stanu edycji – warto dodać `EditStateManager`                    |
| Brak walidacji danych          | Nie sprawdza długości tekstu, poprawności tagów – warto dodać `EditValidator` |
| Brak testowalności             | Operuje bezpośrednio na DOM – warto dodać interfejs do mockowania             |
| Brak modularności UI           | Cały interfejs tworzony inline – warto wydzielić do `EditFormBuilder`         |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Cofanie edycji                   | ❌ Brak    | Wdrożyć wzorzec `Command`                          |
| Walidacja treści i tagów        | ❌ Brak    | Dodać `EditValidator`                              |
| Historia edycji                 | ❌ Brak    | Dodać `EditHistoryManager`                         |
| Tryb testowy                    | ❌ Brak    | Wprowadzić `MockEditManager`                       |
| Obsługa błędów renderowania     | ❌ Brak    | Rozszerzyć `renderImages()` o fallback             |

---

## 📦 Proponowane klasy wspierające `EditManager`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `EditStateManager`  | Przechowywanie stanu edycji i cofania zmian                          |
| `EditValidator`     | Walidacja treści, tagów i wyboru obrazu                              |
| `EditFormBuilder`   | Tworzenie komponentów UI edycji                                      |
| `MockEditManager`   | Symulacja edycji do testów                                           |
| `EditHistoryManager`| Historia zmian i cofania edycji                                      |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `enableEdit()`                 | Przeniesiona do `EditManager.enableEdit()` (✅) |
| `submitEdit()`                 | Przeniesiona do `EditManager.submitEdit()` (✅) |
| `renderImagesFromTags()`       | Zastąpiona przez `renderImages()` (✅)    |
| `attachTagListeners()`         | Nowa funkcja – wcześniej inline (🆕)       |

---

# 📦 Klasa `Dom` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Centralny dostęp do elementów DOM w aplikacji                                |
| **Typ**              | Singleton / Service                                                          |
| **Metody**           | `constructor`, `q`, `qa`                                                     |
| **Zależności**       | `document.querySelector`, `document.querySelectorAll`                        |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje globalny obiekt `DOM` z wersji starej     |

---

## 🧠 Wzorce projektowe w `Dom`

| Wzorzec        | Zastosowanie w `Dom`                                      |
|----------------|-----------------------------------------------------------|
| **Singleton**  | Jedna instancja dostępna globalnie                        |
| **Service Locator** | Dostarcza referencje do elementów interfejsu         |
| **Adapter**    | Abstrakcja nad `document.querySelector` z walidacją      |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak dynamicznej aktualizacji  | Elementy są pobierane tylko raz – nie reaguje na zmiany DOM                   |
| Brak testowalności             | Operuje bezpośrednio na `document` – warto dodać interfejs do mockowania     |
| Brak obsługi błędów krytycznych| Wypisuje tylko `console.warn` – warto dodać `LoggerService`                  |
| Brak integracji z `MutationObserver` | Nie wykrywa dynamicznie dodanych elementów                                 |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Dynamiczne odświeżanie DOM       | ❌ Brak    | Dodać `refresh()` lub `observe()`                  |
| Obsługa błędów krytycznych       | ❌ Brak    | Zintegrować z `LoggerService`                      |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockDom`                               |
| Obsługa wielu instancji          | ❌ Brak    | Rozważyć `DomContext` dla izolowanych środowisk    |

---

## 📦 Proponowane klasy wspierające `Dom`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `LoggerService`     | Centralne logowanie błędów i ostrzeżeń                               |
| `MockDom`           | Symulacja DOM do testów jednostkowych                                |
| `DomContext`        | Obsługa wielu środowisk DOM (np. dla testów A/B)                     |
| `DomObserver`       | Monitorowanie zmian w strukturze DOM                                 |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `DOM.chatContainer`            | Przeniesiona do `Dom.chatContainer` (✅)  |
| `DOM.promptInput`              | Przeniesiona do `Dom.prompt` (✅)         |
| `DOM.tagPanelTemplate`         | Przeniesiona do `Dom.tagPanelTemplate` (✅) |
| `document.getElementById(...)` | Zastąpione przez `Dom.q(...)` (✅)        |

---

# 📦 Klasa `Diagnostics` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Zbieranie i prezentowanie danych o stanie interfejsu i viewportu             |
| **Typ**              | Narzędzie developerskie / komponent diagnostyczny                            |
| **Metody**           | `constructor`, `collectData`, `logToConsole`, `outputToPrompt`, `run`        |
| **Zależności**       | `Dom`, `window`, `document`, `visualViewport`, `console`, `prompt`           |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, gotowa do rozszerzeń i testów                        |

---

## 🧠 Wzorce projektowe w `Diagnostics`

| Wzorzec        | Zastosowanie w `Diagnostics`                                      |
|----------------|-------------------------------------------------------------------|
| **Decorator (do wdrożenia)** | Możliwość rozszerzenia o logowanie, mockowanie, testowanie |
| **Adapter**    | Abstrakcja nad `window`, `document`, `visualViewport`             |
| **Service**    | Dostarcza dane diagnostyczne do innych komponentów                |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak trybu testowego           | Operuje bezpośrednio na `window` i `document` – warto dodać `MockViewport`    |
| Brak integracji z loggerem     | Używa `console.table()` – warto zintegrować z `LoggerService`                 |
| Brak historii diagnostycznej   | Dane są jednorazowe – warto dodać `DiagnosticsHistoryManager`                 |
| Brak walidacji danych          | Nie sprawdza, czy elementy DOM istnieją – może prowadzić do błędów runtime    |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Historia diagnostyki             | ❌ Brak    | Dodać `DiagnosticsHistoryManager`                  |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockDiagnostics`                       |
| Eksport danych                   | ❌ Brak    | Dodanie `DiagnosticsExporter` (np. do JSON)        |
| Integracja z loggerem           | ❌ Brak    | Zastąpić `console.table()` przez `LoggerService`   |

---

## 📦 Proponowane klasy wspierające `Diagnostics`

| Klasa                   | Rola                                                                 |
|-------------------------|----------------------------------------------------------------------|
| `LoggerService`         | Centralne logowanie danych diagnostycznych                          |
| `MockDiagnostics`       | Symulacja danych do testów                                          |
| `DiagnosticsHistoryManager` | Przechowywanie historii pomiarów diagnostycznych              |
| `DiagnosticsExporter`   | Eksport danych do pliku lub API                                     |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `console.table()`              | Zastąpione przez `logToConsole()` (✅)    |
| `outputToPrompt()`             | Nowa funkcja – wcześniej brak (🆕)         |
| `run()`                        | Nowa funkcja – agreguje diagnostykę (🆕)   |

---

# 📦 Klasa `ChatUI` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Zarządzanie warstwą wizualną czatu: wiadomości, ładowanie, edycja, ocena     |
| **Typ**              | Komponent UI                                                                 |
| **Metody**           | `constructor`, `addMessage`, `addLoadingMessage`, `updateAIMessage`, `showError`, `addEditButton`, `addRatingForm`, `scrollToBottom` |
| **Zależności**       | `Dom`, `EditManager`, `Utils`, `app.backendAPI`                              |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje funkcje `appendMessage`, `appendRatingForm` |

---

## 🧠 Wzorce projektowe w `ChatUI`

| Wzorzec        | Zastosowanie w `ChatUI`                                      |
|----------------|--------------------------------------------------------------|
| **Controller** | Steruje interfejsem czatu i interakcjami użytkownika         |
| **Observer (implicit)** | Reaguje na kliknięcia i zmiany formularzy           |
| **Factory (pośrednio)** | Tworzy komponenty UI (przyciski, formularze)        |
| **Strategy (do wdrożenia)** | Możliwość wyboru stylu renderowania wiadomości  |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Błąd w `addRatingForm()`       | `submitBtn` dodaje listener do nieistniejącego `button` – powinien być samodzielnym przyciskiem |
| Brak testowalności             | Operuje bezpośrednio na DOM – warto dodać interfejs do mockowania             |
| Brak modularności UI           | Cały formularz oceny tworzony inline – warto wydzielić do `RatingForm`        |
| Brak walidacji danych          | Nie sprawdza poprawności wartości suwaków                                     |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Modularny formularz oceny        | ❌ Brak    | Wydzielenie do klasy `RatingForm`                  |
| Historia wiadomości              | ❌ Brak    | Dodać `ChatHistoryManager`                         |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockChatUI`                            |
| Stylizacja wiadomości            | ❌ Brak    | Dodać `MessageStyler`                              |

---

## 📦 Proponowane klasy wspierające `ChatUI`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `RatingForm`        | Obsługa formularza oceny AI                                          |
| `MockChatUI`        | Symulacja UI do testów                                               |
| `ChatHistoryManager`| Przechowywanie historii wiadomości                                   |
| `MessageStyler`     | Stylizacja i formatowanie wiadomości                                 |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `appendMessage()`              | Przeniesiona do `addMessage()` (✅)       |
| `appendRatingForm()`           | Przeniesiona do `addRatingForm()` (✅)    |
| `createButton()`               | Przeniesiona do `Utils.createButton()` (✅) |
| `enableEdit()`                 | Przeniesiona do `EditManager.enableEdit()` (✅) |

---

# 📦 Klasa `ChatManager` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Centralny kontroler logiki czatu – łączy UI (`ChatUI`) z backendem (`BackendAPI`) |
| **Typ**              | Mediator / Controller                                                        |
| **Metody**           | `constructor`, `sendPrompt`                                                  |
| **Zależności**       | `ChatUI`, `BackendAPI`, `Dom`                                                |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje funkcję `sendPrompt()` z wersji starej     |

---

## 🧠 Wzorce projektowe w `ChatManager`

| Wzorzec        | Zastosowanie w `ChatManager`                                      |
|----------------|-------------------------------------------------------------------|
| **Mediator**   | Pośredniczy między warstwą UI (`ChatUI`) a backendem (`BackendAPI`) |
| **Controller** | Steruje przepływem wiadomości i interakcjami                      |
| **Adapter (pośrednio)** | `BackendAPI` jako warstwa komunikacji z serwerem         |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak obsługi wielu wiadomości  | Obsługuje tylko jeden prompt naraz – brak kolejkowania                        |
| Brak walidacji długości promptu| Nie sprawdza limitów – warto dodać `PromptValidator`                          |
| Brak testowalności             | Silne sprzężenie z DOM i UI – warto dodać interfejs do mockowania             |
| Brak trybu offline             | Nie obsługuje `MockBackendAPI` – warto dodać warstwę proxy                    |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Kolejkowanie promptów            | ❌ Brak    | Dodać `PromptQueueManager`                         |
| Walidacja promptu                | ❌ Brak    | Dodać `PromptValidator`                            |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockBackendAPI`                        |
| Historia wiadomości              | ❌ Brak    | Integracja z `ChatHistoryManager`                  |

---

## 📦 Proponowane klasy wspierające `ChatManager`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `PromptValidator`   | Walidacja treści promptu (długość, znaki specjalne)                  |
| `PromptQueueManager`| Kolejkowanie i zarządzanie wieloma zapytaniami                       |
| `MockBackendAPI`    | Symulacja odpowiedzi backendu do testów                              |
| `ChatHistoryManager`| Przechowywanie historii wiadomości                                   |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `sendPrompt()`                 | Przeniesiona do `ChatManager.sendPrompt()` (✅) |
| `appendMessage()`              | Przeniesiona do `ChatUI.addMessage()` (✅) |
| `appendRatingForm()`           | Przeniesiona do `ChatUI.addRatingForm()` (✅) |
| `createButton()`               | Przeniesiona do `Utils.createButton()` (✅) |

---

# 📦 Klasa `BackendAPI` – analiza strukturalna

| Kryterium            | Ocena / Stan                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Rola**             | Warstwa komunikacji z backendem – generowanie, ocena, edycja odpowiedzi      |
| **Typ**              | Adapter / API Client                                                         |
| **Metody**           | `generate`, `rate`, `edit`                                                   |
| **Zależności**       | `fetch`, `JSON`, endpointy `/generate`, `/rate`, `/edit`                     |
| **Stan refaktoryzacji** | ✅ W pełni wydzielona, zastępuje bezpośrednie wywołania `fetch` w UI       |

---

## 🧠 Wzorce projektowe w `BackendAPI`

| Wzorzec        | Zastosowanie w `BackendAPI`                                      |
|----------------|------------------------------------------------------------------|
| **Adapter**    | Abstrakcja nad interfejsem HTTP                                  |
| **Facade**     | Prosty interfejs dla `ChatManager`, `EditManager`, `ChatUI`      |
| **Service**    | Dostarcza funkcje komunikacyjne jako niezależna warstwa          |

---

## ⚠️ Potencjalne problemy i miejsca do optymalizacji

| Obszar                         | Uwagi / Ryzyko                                                                 |
|--------------------------------|--------------------------------------------------------------------------------|
| Brak obsługi błędów sieciowych | Brak retry logic, brak obsługi timeoutów                                      |
| Brak testowalności             | Operuje bezpośrednio na `fetch` – warto dodać interfejs do mockowania         |
| Brak logowania błędów          | Rzuca wyjątek bez integracji z `LoggerService`                                |
| Brak obsługi tokenów/autoryzacji| Nie obsługuje nagłówków autoryzacyjnych – warto dodać `AuthManager`           |

---

## 🧩 Funkcjonalności do uzupełnienia

| Funkcja                          | Status    | Propozycja refaktoryzacji                          |
|----------------------------------|-----------|----------------------------------------------------|
| Retry logic                      | ❌ Brak    | Dodać `RequestRetryManager`                        |
| Obsługa tokenów/autoryzacji      | ❌ Brak    | Wprowadzić `AuthManager`                           |
| Tryb testowy                     | ❌ Brak    | Wprowadzić `MockBackendAPI`                        |
| Logowanie błędów                 | ❌ Brak    | Zintegrować z `LoggerService`                      |

---

## 📦 Proponowane klasy wspierające `BackendAPI`

| Klasa               | Rola                                                                 |
|---------------------|----------------------------------------------------------------------|
| `MockBackendAPI`    | Symulacja odpowiedzi backendu do testów                              |
| `RequestRetryManager`| Obsługa ponownych prób zapytań w razie błędów                       |
| `LoggerService`     | Centralne logowanie błędów HTTP                                      |
| `AuthManager`       | Obsługa tokenów, sesji i nagłówków autoryzacyjnych                   |

---

## ✅ Status refaktoryzacji względem wersji pre-refaktoryzacyjnej

| Funkcja z wersji starej        | Obecna lokalizacja / status               |
|--------------------------------|-------------------------------------------|
| `fetch("/generate")`          | Przeniesiona do `BackendAPI.generate()` (✅) |
| `fetch("/rate")`              | Przeniesiona do `BackendAPI.rate()` (✅)     |
| `fetch("/edit")`              | Przeniesiona do `BackendAPI.edit()` (✅)     |

---
