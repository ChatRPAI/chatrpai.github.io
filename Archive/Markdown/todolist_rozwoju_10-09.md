# Końcowy raport rozwoju i lista zadań

## 1. Podsumowanie stanu projektu

Na bazie trzech dokumentów mamy pełny obraz: `Klasy js.md` zawiera aktualny kod każdej klasy, `pełna-analiza-10-09.md` to szczegółowe raporty klas z oceną wzorców i braków, a `Pełen-raport-rozwoju-…` łączy te spostrzeżenia z planem działania. Wszystkie elementy funkcjonalne sprzed refaktoryzacji zostały odtworzone w obiektowej strukturze, ale wymaga ona dopracowania w obszarach walidacji, zarządzania stanem, testowalności i optymalizacji zapytań.

---

## 2. Kluczowe funkcjonalności do zaimplementowania

- [ ] obsługa identyfikatorów wiadomości i sesji oraz przechowywanie ich w ciasteczkach i localStorage  
- [ ] zmiana struktury bloku `.message` tak, by zawierał mini-awatar, kolor i metadane tagów  
- [ ] parser markdown w ChatUI, konwersja zapisu i wyświetlanie treści  
- [ ] walidacja promptu i edycji (PromptValidator, EditValidator) przed wysłaniem na backend  
- [ ] retry logic w BackendAPI i ImageResolver (RequestRetryManager)  
- [ ] centralne logowanie i buforowanie ostatnich 5 minut zdarzeń w Diagnostics wraz z metodą automatycznych testów (`checkFun`)  
- [ ] modularne formularze (RatingForm, EditFormBuilder) i ujednolicone zarządzanie formularzem oceny  

---

## 3. Główne priorytety – lista TODO

1. Utworzenie klas walidatorów: `PromptValidator`, `EditValidator`  
2. Dodanie mechanizmu retry: `RequestRetryManager` w `BackendAPI` i `ImageResolver`  
3. Wprowadzenie `LoggerService` i przekierowanie wszystkich `console.*` do jego API  
4. Refaktoryzacja formularza oceny do klasy `RatingForm` i test UI w `ChatUI`  
5. Implementacja `UserManager` z przechowywaniem imienia w cookies i zamianą `{{user}}`  
6. Zaprojektowanie `ChatHistoryManager` i `EditHistoryManager` oraz integracja z aktualnym UI  
7. Rozbudowa `Diagnostics` o bufor logów i tryb automatycznego testowania  
8. Uzupełnienie `PanelsController` o rejestrację dowolnej liczby paneli i opcjonalne otwieranie wielu równocześnie  
9. Integracja `buildJS.py` z nowymi klasami w katalogu `class/` i generacja dokumentacji init_*.js  
10. Dodanie wsparcia dla markdown w wiadomościach poprzez CDN i wbudowany parser  

---

## 4. Szczegółowy plan działań

### Etap 1: Fundamenty i infrastruktura  
- [ ] zaimplementować `LoggerService` i podmienić wszystkie `console.log/warn/error`  
- [ ] dodać `RequestRetryManager` w `BackendAPI.generate/rate/edit` i w `ImageResolver.checkImageExists`  
- [ ] stworzyć `PromptValidator` sprawdzający długość i niepustość promptu  
- [ ] stworzyć `EditValidator` walidujący treść edycji i dopasowanie tagów  

### Etap 2: Modularizacja UI  
- [ ] wydzielić `RatingForm` z UI ChatUI, zastępując inline-owy kod  
- [ ] stworzyć `EditFormBuilder`, generujący interfejs edycji wiadomości  
- [ ] dodać `UserManager` odpowiedzialny za zapis i pobór nazwy użytkownika z cookies  

### Etap 3: Zarządzanie stanem i historią  
- [ ] opracować `ChatHistoryManager`, rejestrujący każdą wysłaną i odebraną wiadomość  
- [ ] opracować `EditHistoryManager`, śledzący zmiany w edycji o możliwościach cofania  
- [ ] wdrożyć `AppStateManager` przechowujący stan otwartych paneli i pozycji interfejsu  

### Etap 4: Diagnostyka i testowanie  
- [ ] rozbudować `Diagnostics` o bufor listy zdarzeń i wyników testów  
- [ ] wdrożyć metodę `checkFun`, uruchamiającą scenariusze:  
  - [ ] symulacja submit/keydown/click  
  - [ ] weryfikacja poprawności renderu i stanu zmiennych  
- [ ] dodać interfejs eksportu diagnostyki w formacie JSON  

### Etap 5: Integracja i optymalizacja  
- [ ] zmodyfikować `buildJS.py`, aby uwzględniał nowe klasy i generował dokumentację init_*.js  
- [ ] zaimplementować `DomObserver` (MutationObserver) dla dynamicznego odświeżania referencji w `Dom`  
- [ ] zoptymalizować zapytania IMAGE: dodać throttle na HEAD i uniknąć duplikacji  

---

Jeżeli potrzebujesz dodatkowych wyjaśnień lub dostosowania harmonogramu, daj znać.