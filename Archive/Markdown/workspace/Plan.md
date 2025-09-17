Dziękuję, Kamil — to bardzo trafna uwaga i świetnie, że ją podnosisz. Twój projekt nie tylko operuje na warstwie tekstowej, ale też na **logice świata**, gdzie każda zmiana sceny, obecność postaci i narracja mają swoje reguły. Poniżej znajdziesz **doprecyzowaną wersję streszczenia projektu**, uwzględniającą Twoje poprawki i rozszerzenia:

---

## 🧠 **Cel projektu**
Stworzyć lokalny silnik narracyjny RP z interakcją tekstową przez przeglądarkę, oparty na lokalnym modelu AI (Bielik-7B-Instruct), z pełną kontrolą nad światem, postaciami, scenami i historią. Projekt ma działać offline, bez cenzury, z możliwością rozbudowy o wizualizację i pamięć sesji.

---

## 🔧 **Techniczne założenia**
- **Model AI**: `Bielik-7B-Instruct-v0.1`, uruchamiany lokalnie na GPU (RTX 3060)
- **Backend**: Python + Flask jako serwer API
- **Frontend**: HTML/CSS/JS z interfejsem czatu, dymkami postaci, avatarami
- **Format odpowiedzi**: Markdown
- **Dane postaci/lokalizacji**: JSON/TXT
- **Pamięć sesji**: zapisywana lokalnie jako pliki tymczasowe

---

## 🧩 **Mechanika narracyjna**

### 🔄 Zarządzanie postaciami
- **Aktywne postacie**: lista `activeCharacters[]` aktualizowana na podstawie narracji
- **Dołączanie/wykluczanie**: AI może zasugerować zmianę składu sceny (np. „Lilith opuściła komnatę”) → system aktualizuje listę
- **Narrator**: zawsze obecny, może inicjować sceny, streszczać wydarzenia, wprowadzać nowe postacie

### 🧠 Zarządzanie sceną
- **Scena** = lokalizacja + aktywne postacie + kontekst narracyjny
- AI może zmienić scenę → system aktualizuje `currentLocation` i `activeCharacters`
- Zmiana sceny może narzucać nowy skład postaci (np. teleportacja, sen, retrospekcja)

---

## 🔄 **Logika iteracyjna (funkcje vs. AI)**

| Etap | Realizowane przez | Opis |
|------|-------------------|------|
| Identyfikacja postaci i lokalizacji | Funkcja (regex/tagi) | Wyszukiwanie nazw i miejsc w wiadomości użytkownika |
| Weryfikacja aktywności postaci | Funkcja + AI | Sprawdzenie, czy postać nadal uczestniczy w scenie |
| Aktualizacja sceny | AI + funkcja | AI sugeruje zmianę → system aktualizuje dane |
| Generowanie tagów obrazów | AI | Na podstawie sceny: `[postać] [lokalizacja] [czynność] [emocja]` |
| Streszczenie czatu | AI | Co 10–20 wiadomości → streszczenie + kluczowe fakty |
| Budowanie promptu | Funkcja | Łączenie danych: postacie, lokalizacja, streszczenie, wiadomość |
| Generowanie odpowiedzi | AI | Odpowiedź w stylu narracyjnym, Markdown, bez cenzury |

---

## 📁 **Struktura projektu**
```
/projekt-rp/
├── /characters/          # Dane postaci
├── /locations/           # Opisy miejsc
├── /images/              # Obrazki z tagami
├── /sessions/            # Historia czatu, streszczenia, fakty
├── app.py                # Flask backend
├── index.html            # Frontend
├── script.js             # Logika czatu
```

---

## 🧠 **Pomysły na rozwój**
- **Narrator jako osobna postać** z funkcją streszczenia i prowadzenia scen
- **System emocji i relacji** między postaciami
- **Save/load sesji** z pełną pamięcią świata
- **Wizualizacja sceny** na podstawie tagów generowanych przez AI
- **Asynchroniczne generowanie wypowiedzi** dla każdej postaci z uwzględnieniem wypowiedzi innych

---

Jutro możemy zacząć od:
1. Załadowania modelu i testu generowania
2. Stworzenia klasy `Character`, `Location`, `NarrativeEngine`
3. Prototypu Flaskowego endpointu `/generate`
4. Testowej sceny z trzema postaciami i narratorem

Trzymam kciuki za Twój pociąg — a jutro ruszamy z kodem 🚂💻