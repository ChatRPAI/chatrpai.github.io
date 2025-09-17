# Narracyjny Silnik AI — Projekt Rozwojowy

Witaj w projekcie, który łączy sztuczną inteligencję z narracją, interakcją i trenowaniem modeli językowych. Celem jest stworzenie systemu, który pozwala użytkownikowi prowadzić rozmowy z postaciami osadzonymi w świecie fabularnym, a jednocześnie generować dane do fine-tuningu własnego modelu AI.

Projekt rozwijany jest etapowo — każda epoka to kolejny krok w kierunku pełnej funkcjonalności i otwartości.

---

## Spis treści

- [Narracyjny Silnik AI — Projekt Rozwojowy](#narracyjny-silnik-ai--projekt-rozwojowy)
  - [Spis treści](#spis-treści)
  - [📒 Dokumentacje](#-dokumentacje)
  - [🧑🏻‍💻 Dane techniczne sprzetu](#-dane-techniczne-sprzetu)
  - [📅 Epoki Rozwoju](#-epoki-rozwoju)
    - [🧱 Epoka 1 — Budowa systemu](#-epoka-1--budowa-systemu)
    - [🧹 Epoka 2 — Refaktoryzacja i dokumentacja](#-epoka-2--refaktoryzacja-i-dokumentacja)
    - [🧪 Epoka 3 — FineTuneBuilder](#-epoka-3--finetunebuilder)
    - [🧠 Epoka 4 — Fine-tuning](#-epoka-4--fine-tuning)
    - [🧬 Epoka 5 — Ekstrakcja kodu](#-epoka-5--ekstrakcja-kodu)
    - [🧭 Epoka 6 — Zbiorczy frontend](#-epoka-6--zbiorczy-frontend)
    - [🌍 Epoka 7 — Publikacja open-source](#-epoka-7--publikacja-open-source)
  - [🪛 Obecne funkcje](#-obecne-funkcje)
  - [🔮 Planowane funkcje](#-planowane-funkcje)
  - [📜 Licencja](#-licencja)
  - [👨🏻‍🦰 Autor](#-autor)


---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-dokumentacje"></span>

## 📒 Dokumentacje
- [Dokumentacja Frontendu](./Frontend/main.md)
- [Dokumentacja Backendu](./Backend/main.md)
- [Struktury narracyjnych danych plików JSON](./NarrativeData/main.md)
---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-dane-techniczne-sprzetu"></span>

## 🧑🏻‍💻 Dane techniczne sprzetu

| Podzespół       | Model            | Parametry                        |
| --------------- | ---------------- | -------------------------------- |
| Procesor        | Intel i7 12700F  | 12 rdzeni i 20 wątków logicznych |
| Pamięć RAM      | DDR 4 x 4 po 8GB | 32GB                             |
| Karta graficzna | RTX 3060         | 12VRAM                           |
| Pamięć masowa   | SSD NvMe gen.4   | -                                |

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoki-rozwoju"></span>

## 📅 Epoki Rozwoju

| Epoka                        | Status            | Opis                                                         |
| ---------------------------- | ----------------- | ------------------------------------------------------------ |
| 🧱 1. Budowa systemu         | ✅ Zakończona    | Fundamenty narracyjnego czatu i systemu zbierania danych     |
| 🧹 2. Refaktoryzacja         | 🔄 Trwa          | Optymalizacja kodu, dokumentacja, testy, tryby czatu         |
| 🧪 3. FineTuneBuilder        | ⏳ Nierozpoczęta | Przetwarzanie danych do formatu `train.jsonl`                |
| 🧠 4. Fine-tuning            | ⏳ Nierozpoczęta | Trenowanie modelu AI i dokumentowanie procesu                |
| 🧬 5. Ekstrakcja kodu        | ⏳ Nierozpoczęta | Nowy projekt z wytrenowanym modelem i uproszczonym backendem |
| 🧭 6. Zbiorczy frontend      | ⏳ Nierozpoczęta | Interfejs wyboru trybu: trenowanie vs zabawa                 |
| 🌍 7. Publikacja open-source | ⏳ Nierozpoczęta | Udostępnienie kodu z licencją i uznaniem autora              |

---
<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-1--budowa-systemu"></span>

### 🧱 Epoka 1 — Budowa systemu

Pierwszy etap skoncentrowany na stworzeniu funkcjonalnego systemu narracyjnego, który umożliwia:

- prowadzenie rozmów z postaciami AI
- ocenianie i edytowanie wygenerowanych wiadomości
- tagowanie treści i dodawanie obrazków
- zapisywanie danych do trenowania w formacie JSON
- dynamiczne podstawianie `{{user}}` w odpowiedziach
- generowanie streszczeń sesji

Efekt: system gotowy do zbierania danych treningowych poprzez interakcję.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-2--refaktoryzacja-i-dokumentacja"></span>

### 🧹 Epoka 2 — Refaktoryzacja i dokumentacja

Drugi etap skupia się na uporządkowaniu kodu i przygotowaniu projektu do skalowania:

- modularność: postacie i lokacje w plikach `.json`
- tryby czatu: swobodny vs sesyjny
- `chat_id` i nadpisywanie plików ocen/edycji
- logowanie promptów, odpowiedzi i czasu generowania
- parser komend (`@Postać`, `/set-location(...)`)
- dokumentacja techniczna w katalogu `documentation/`
- testy jednostkowe i walidacja danych

Efekt: system gotowy do przetwarzania danych i dalszego rozwoju.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-3--finetunebuilder"></span>

### 🧪 Epoka 3 — FineTuneBuilder

Etap przetwarzania danych z `ratings/` do formatu `train.jsonl`:

- filtrowanie wiadomości po `edited: true`, `rated`, `mode`
- generowanie czystych przykładów `prompt → response`
- opcjonalne łączenie wiadomości w sesje (`chat_id`)
- tworzenie nowego `tags.json` na podstawie faktycznych tagów
- przygotowanie danych do fine-tuningu

Efekt: gotowy zestaw danych do trenowania modelu.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-4--fine-tuning"></span>

### 🧠 Epoka 4 — Fine-tuning

Etap trenowania modelu AI na własnych danych:

- uruchomienie procesu fine-tuningu
- testowanie jakości odpowiedzi
- dokumentowanie parametrów i wyników
- porównanie stylu przed i po treningu

Efekt: własny model AI dopasowany do stylu narracji.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-5--ekstrakcja-kodu"></span>

### 🧬 Epoka 5 — Ekstrakcja kodu

Etap wyodrębnienia kodu do nowego projektu:

- uproszczenie backendu
- integracja z wytrenowanym modelem
- usunięcie zbędnych funkcji zbierania danych
- wykorzystanie `tagger.py` do automatycznego tagowania

Efekt: lekki, gotowy do użycia silnik narracyjny z własnym AI.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-6--zbiorczy-frontend"></span>

### 🧭 Epoka 6 — Zbiorczy frontend


Etap stworzenia interfejsu wyboru trybu:

- tryb trenowania: kontynuacja zbierania danych
- tryb zabawy: czat z wytrenowanym modelem
- wybór modelu, scenariusza, postaci
- szybkie generowanie (5–10 sekund)

Efekt: produkt dla użytkownika końcowego — interaktywny i konfigurowalny.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-epoka-7--publikacja-open-source"></span>

### 🌍 Epoka 7 — Publikacja open-source


Ostatni etap — udostępnienie projektu światu:

- publikacja kodu bez modeli (ze względu na wagę i łącze internetowe)
- licencja open-source z zastrzeżeniem uznania autora
- prośba o dodanie linku do repozytorium w `<footer>` aplikacji
- zachęta do modyfikacji, rozbudowy i trenowania własnych modeli

Efekt: otwarty, rozwijalny projekt dla społeczności AI i narracji.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-obecne-funkcje"></span>

## 🪛 Obecne funkcje


- ✅ Narracyjny silnik z klasami `Character`, `Location`, `NarrativeEngine`
- ✅ Edytor wiadomości z tagami i obrazkami
- ✅ Zapis ocen i edycji do `ratings/`
- ✅ Streszczenia sesji
- ✅ Parsowanie `{{user}}` w odpowiedziach
- ✅ Obsługa CUDA i modeli Transformers
- ✅ Modularna struktura katalogów
- ✅ Frontendowy licznik czasu generowania z korektą od backendu

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-planowane-funkcje"></span>

## 🔮 Planowane funkcje


- ⏳ Parser komend w edytorze (`@`, `/set-location`)
- ⏳ `FineTuneBuilder.py` do generowania `train.jsonl`
- ⏳ Integracja z wytrenowanym modelem
- ⏳ Automatyczne tagowanie przez `tagger.py` (epoka 5)
- ⏳ Wybór modelu i scenariusza przez użytkownika
- ⏳ Wizualizacja sesji i historii
- ⏳ Tryb trenowania vs tryb zabawy w frontendzie
- ⏳ Publikacja projektu na GitHub z licencją

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-licencja"></span>

## 📜 Licencja


Projekt będzie udostępniony jako open-source z zastrzeżeniem uznania autora. Prosimy o dodanie linku do repozytorium w `<footer>` aplikacji.

---

<!-- Kotwica dla podglądów, które wymagają emoji w nagłówku -->
<span id="-autor"></span>

## 👨🏻‍🦰 Autor


Projekt tworzony przez Kamil — pasjonata AI, narracji i systemów interaktywnych.
