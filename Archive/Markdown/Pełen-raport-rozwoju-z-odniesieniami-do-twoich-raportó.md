# Plan rozwojowy i raport projektu: _Chat RP AI_

---

**Spis treści**

- [Plan rozwojowy i raport projektu: _Chat RP AI_](#plan-rozwojowy-i-raport-projektu-chat-rp-ai)
  - [Funkcjonalności do dodania](#funkcjonalności-do-dodania)
  - [Analiza i feedback raportów twojej analizy poszczególnych klas](#analiza-i-feedback-raportów-twojej-analizy-poszczególnych-klas)
    - [Klasa `App`](#klasa-app)
    - [Klasa `Utils`](#klasa-utils)
    - [Klasa `TagsPanel`](#klasa-tagspanel)
    - [Klasa `TagSelectorFactory`](#klasa-tagselectorfactory)
    - [PanelsController](#panelscontroller)
    - [Klasa `KeyboardManager`](#klasa-keyboardmanager)
    - [Klasa `ImageResolver`](#klasa-imageresolver)
    - [Klasa `GalleryLoader`](#klasa-galleryloader)
    - [Klasa `EditManager`](#klasa-editmanager)
    - [Klasa `Dom`](#klasa-dom)
    - [Klasa `Diagnostics`](#klasa-diagnostics)
    - [Klasa `ChatUI`](#klasa-chatui)
    - [Klasa `ChatManager`](#klasa-chatmanager)
    - [Klasa `BackendAPI`](#klasa-backendapi)

---

## Funkcjonalności do dodania

1. Wiadomości w czacie:
   - identyfikacja wiadomości i sesji czatu.
   - Bloki `.message` muszą zmienić strukturę, aby zawierały mini awatar wysyłającego, kolor z statycznej palety losowo wybrany i przypisany na całą sesję do danego sendera (dla user pozostaje #333)
   - Zmiana struktury .message nie widocznej dla użytkownika:
     - analiza wiadomości pod względem wystąpienia słów kluczowych dla tagów i zapisanie ich jako meta dane mp.: data-msg-tags w każdym bloku wiadomości.
     - analiza tagów i dopasowanie obrazu do wiadomości
     - naprawa utraty obrazka po ponownej edycji i brak uzupełnienia inputów (select mobilnie, datalist na desktopie) brakującymi tagami dla danych kategorii `["location", "character", "action", "nsfw", "emotion"]`
2. Ocena wiadomości wizualnie się rozjechała bo klasa "rating-form" jest nadawana na summary a nie details
3. endpoint /generate zwraca message_id i może ale nie musi zwracać session_id trzeba to wuzględnić w wysłaniu zapytań na endpointy /edit i /rate
4. Wiadomości docelowa będą w formacie markdown trzeba już na tym etapie się na to przygotować dopiąć link cdn do biblioteki js konwertującej markdown który bedzie renderowany w wiadomości ale dla edycji w textarea musi być format markdown wysłany z backendu
5. dynamiczne dla renderu wiadomości zamaina {{user}} na treść podaną w (która powina być przechowywana dodatkowo w cookies aby po odświerzeniu jej nie utracić):
    ```html
    <aside id="side-panel" class="bg-panel p-10 br-2">
    <label for="user_name" class="text-sm">
        Podaj swoje imię:
        <input
        type="text"
        id="user_name"
        class="form-element text-base w-full mt-10"
        placeholder="Twoje imię (max 20 znaków)"
        maxlength="20"
        />
    </label>
    </aside>
    ```
6. Przechowywanie sesji czatu w pamięci przeglądarki z uwzglednieniem jej identyfikatora i aktualizowaniem dla /generate i /edit oraz zapisanie udzielonej oceny rate
7. Poprawa przycisków np.: przycisk do edycji wiadomości nie ma stałej pozycji w wiadomości i jest zależny od długości tekstu
8. Nie nadpisywanie informacji o czasie gonerowania co występuje gdy wiadomość jest edytowana
9. Pisanie wiadomości powinno udostępnić interfejs komend `@`do jakiej postaci jest kierowana wypowiedź /setLocation(lokalizacja docelowa) komendy powinny wyświetlać toolbar z listą dostępnych opcji aby nie dało się mówić do postaci która nie istnieje w wątku lub przejść do lokalcji która też nie istnieje

## Analiza i feedback raportów twojej analizy poszczególnych klas

Przejrzę całość i odniosę się. Dokładna treść bedzie w pliku pełna-analiza-10-09.md

### Klasa `App`

Ta klasa powinna być jedynie inizializatorem i definiować zależności.
Wszelkie metody funkcjonalno użytkowe powinny zostać wyekstrahowane do faktycznych klas.

### Klasa `Utils`

Ta klasa ma pozostać statycznym zbiorem prostych nazrzędzi uproszczających kod w innych klasach udostępniając zoptymalizowane metody w najnowszych standardach JS.
Aktualnie jest w niej przynajmiej jedna metoda zdepresjonowana:
```
Element „(from: number, length?: number | undefined): string” jest przestarzały.ts(6385)
lib.es5.d.ts(522, 8): Deklaracja została oznaczona jako przestarzała w tym miejscu.
 See Real World Examples From GitHub

(method) String.substr(from: number, length?: number | undefined): string
Gets a substring beginning at the specified location and having the specified length.

@deprecated — A legacy feature for browser compatibility

@param from — The starting position of the desired substring. The index of the first character in the string is zero.

@param length — The number of characters to include in the returned substring.
```
> kontest:
```js
  /**
   * Generuje losowy identyfikator alfanumeryczny.
   *
   * @param {number} length - Długość identyfikatora (domyślnie 8).
   * @returns {string} Losowy identyfikator, np. "x9f3k2a1".
   */
  static randomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  }
```

### Klasa `TagsPanel`

odnosi się do sytuacji gdy edytuję wiadomość (patrz ## Funkcjonalności do dodania) jest komponet który musi być zależny od kontenera wiadomości bo każda wiuadomość może być edytowana niezależnie od siebie jego instancja jest tworzona po kliknieciu edytowania wiadomości i dostaje kontener rodzica jako rama funkcjonowania tylko w obrebie tego kontenera bez wpływania na inne. Wyseparowano część jego funkcjonalności takie jak ImageResolver i GaleryLoader bo odnoszą się do obrazów bazowanych na anglojęzycznych tagach. Zestaw pogrupowanych tagów może być zwracany przez backend przy pierwszym załadowaniu strony chatu czyli np.: poprzez inicjalizację klasy TagOptionsRegistry która pobierze tagi z endpoint i bedzie interfejsem do ich udostępnienia w cyklu życia aplikacji/strony (do puki nie zostanie odświeżona).
Wykorzystuje też Klasę TagSelectorFactory którego zadaniem jest przygotowanie elementów kategorii tagów do wyboru przez użytkownika z rozróżnieniem czy uruchomiono na desktopie czy na mobilce.
Czyszczenie tagów nie konicznie ma sens użytkowy. Brakuje automatycznego uzupełnienia inputów tagami z jeszcze nie istniejącej data-msg-tags i załadowanie aktualnie wybranego obrazu najlepiej nad tagPanel.


### Klasa `TagSelectorFactory`

Wspomniałem o niej już w Klasie `TagPanel` wiec odniosę się bardziej do twojich obserwacji a bardziej propozycji takie jak wielojęzyczność: nie chcę tegfo stosować ponieważ cały projekt jest w 100% po polsku jedynie tagi pozostają w języku angielskim by model podczas trenowania nauczył się że angielskie frazy ma nie odmieniać i stosować jako tagi dla kontekstu wygenerowanej wiadomości. Powinien się ograniczyć do zwrócenia odpowiednich inputów z tagami dla każdej z kategori (select dla mobilek, datalist dla desktopów)


### PanelsController

Chodzi o panele boczne. Jest to fajna klasa do wykorzystania na wielu web stronach a co za tym idzie do scalania w innych niż chat.js plikach powinna być oparta o strukturę html załadowanej strony.
Na razie działamy na stronie z chatowaniem ale w przyszłości pojawią się inne strony html na których mogą być od jednego lewego panelu bocznego do dwóch paneli bocznych (lewo, prawo).
Jak powinna zostać rozwinięta? Uważam że oprócz toggla klasy open który ładnie wysówa i wsówa dok panelu (zrealizowane poprzez css) powinien głównie przeanalizować zawartość i zarejestrować na elementach eventy by stały się funkcjonalne. Musi to analizować bo jak w strukturze html nie bedzie danego elementu to nie powinno się go rejestrować ani inicjować (aktualnie jest tam input z user_name) ale w kodzie podajże w App zapisałem sztywne dodanie czyszczenia localstorage zapytań http i obrazów. bedzie trzeba to przenieść i usupełnić strukturę html
Aktualnie gdy otwaraty jest jeden dok panelu bocznego i otworzę drugi to ten pierwszy się chowa. jest to funkcjonalność dla mobilek, wdesktoach chcę mieć możliwość otwarcia obu na raz ponieważ nic mi to nie zasłoni.
CSS dla kontekstu:
```css
/* === Przyciski pływające === */
.button-icon {
  position: fixed;
  top: 10px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  background-color: var(--color-hover);
  color: var(--color-text);
  border: none;
  border-radius: var(--br-2);
  z-index: 1001;
  padding: 5px;
  cursor: pointer;
}

#burger-toggle { left: 10px; }
#settings-toggle { right: 10px; }

/* === Panele boczne === */
#web-side-panel,
#side-panel {
  position: fixed;
  top: 60px;
  width: 250px;
  height: calc(100% - 60px);
  background-color: var(--color-panel);
  color: var(--color-text);
  padding: 10px;
  overflow-y: auto;
  transition: all 0.3s ease;
  z-index: 1000;
}

#web-side-panel { left: -270px; }
#side-panel { right: -270px; }

#web-side-panel.open { left: 0; }
#side-panel.open { right: 0; }

#side-panel button {
  background-color: var(--color-button);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
#side-panel button:hover { background-color: var(--color-button-hover); }
```

### Klasa `KeyboardManager`

W tej klasie zapisano bardzo ważny fix UX/UI dzieki czemu textarea na wpisanie wiadomości jest zawsze dokowana nad klawiaturą ekranową w urządzeniach mobilnych.
Devtools od firefox wiec pewnie na chromium też emulują agenta urządzeń mobilnych co testowałem w konsoli:
- Normal mode (Desktop):
```
/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
false
```
- Mobile mode:
```
/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
true
```
Ale niestety nie ma możliwości zaemulowania klawiaturki smartphona wiec wykouję zawsze dodatkowe testy na swoim Samsung galaxy a33.

### Klasa `ImageResolver`

Tak problem z byt dużą ilością zapytań http istnieje są wysyłane po dwa zapytania np.:
```
.....forest.jpg
.....forest.jpg
.....forest.png
.....forest.png
```
Zastosowano zapis istnienia danego pliku w pamięci localstorage przeglądarki oraz przycisk do jej wyczyszczenia gdy mamy plik forest.jpg i dodamy jeszcze plik forest.gif lub podmienimy go na nowy.

Same wyszukiwanie jest oparte o strategię znajdź obraz zawirającey tagi względem kategorii:
dla uzupełnionych tagów w dwuch inputach lokalizacja i postać (każdy jest sprawdzany dodatkow pod względem różnych rozszerzeń plików):
```
forest.rozszerzenie
forest_Litha.rozszerzenie
```
Nie wiem czy to dobra strategia. Nigdy nie będę znał jakie obrazy są na backendzie wiec przekształcenie szukania na zasadzie składowych tak jak wyżej do filtrowania może być nie wykonalne a napewno wiązało by się z ogromną ilością zapytań dla przypadku 300 obrazów każdy w różnym niezdefiniownaym rozszerzeniem.


### Klasa `GalleryLoader`

Zobaczyłeś problemy nie znając ImageResolver który sprawdza istnienie pliku.
Sama galeria nie powinna wysyłać zapytań na backend bo nie ma takiej potrzeby utworzenie i dodanie elementu <img> jest obsługiwane przez przeglądarki które same uzupełnią obraz poprzez zapytanie http lub pobranie z pamięci cache. od strony wizualnej raczej działa poprawnie.
oto powiązany css:
```css
/* === Panel tagów === */
.tag-panel {
  display: flex;
  flex-direction: column;
  background-color: #2d2d2d60;
  padding: 15px;
}
.tag-panel input {
  width: 100%;
  background-color: var(--color-input);
  color: #00e5ff;
  font-size: 1rem;
  border: 1px solid #ffffff55;
  padding: 3px;
}
.tag-panel label {
  font-size: 1.125rem;
  margin-bottom: 10px;
  color: #65b2bb;
}
.tag-panel #image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 450px;
}
.tag-panel img {
  height: auto;
  width: 90%;
  border: 2px solid var(--color-image-border);
  margin: 5px 0;
}
.tag-panel img:hover {
  border: 2px solid var(--color-image-hover);
  cursor: pointer;
}
.tag-panel input[type="radio"] { display: none; }

.image-option.selected img {
  border: 2px solid #49c28f;
  box-shadow: 0 0 5px rgba(73, 194, 143, 0.5);
}
```

### Klasa `EditManager`

jej brakujące działanie napisałem na początku pliku (patrz ## Funkcjonalności do dodania).

### Klasa `Dom`

Jak sama nazwa mówi ma to być guard dla DOM wszelkie zmiany powiny być poprzez Dom i rejestrowane. Moc nie jest potrzebny powiniśmy operować na faktycznym DOM (oczywiście poprzez klasę Dom 😉)

### Klasa `Diagnostics`

Została wytworzona ponieważ istniała funkcja pomocnicza w strukturalnym script.js przed refaktoryzacją gdy pisałem poprawną obsługę klawiatury wirtualnej i textarea wiadomości usera na mobilkach

Bardziej widzę tą klasę jako narzędzie developerskie dla mnie.

Np.: uruchomienie jedną komendą w konsoli wszystkich testów jednostkowych, jakośćiowych itd. by zwrócić wynik w formie tabeli 
|status ✅/❌ |nazwa testu |opis błędu|
|--|--|--|
|✅|testA||
|❌|testB|referencja do niewłaściwego typu: [object,Node]

oraz przedstawienie logów z nprz dedykowanej klasy Logger w przejrzystej formie tak maks do 5 min wstecz


### Klasa `ChatUI`

jej brakujące działanie napisałem na początku pliku (patrz ## Funkcjonalności do dodania).

### Klasa `ChatManager`

Kolejkownie promptów to fajny pomysł ponieważ może pozwolić na lepsze zastosowanie rozmowy z wieloma postaciami na raz i jest to rzecz bardziej backendowa. Frontend powinien wiedzieć że jakaś postać bedzie chaciała się wypowiedzieć wiec jej wiadomość powinna zostać dodana jako generowana i poczekać na wygenerowanie wiadomości całej kolejki by znowu user mógł pisać i wysłać prompt.

jej brakujące działanie napisałem na początku pliku (patrz ## Funkcjonalności do dodania).

### Klasa `BackendAPI`

Mock backendu nie jest potrzebny ponieważ mam wariant uruchomieniowy w trybie dev gdzie jest to właśnie Moc.
Ta klasa powina zarządzać zapytaniami do backendu.