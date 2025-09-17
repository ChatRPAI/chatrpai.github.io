---

### requirements.txt

Aktualna zawartość pliku requirements.txt:

```txt
flask
torch
transformers
```
## Instrukcja konfiguracji środowiska dla projektu Bielik AI

### Wymagania sprzętowe

- Karta graficzna: minimum NVIDIA RTX 3060 z 12 GB VRAM (do uruchomienia modelu AI).
- Zainstalowane sterowniki GPU oraz narzędzia CUDA (np. CUDA Toolkit, cuDNN) zgodne z wersją PyTorch.

---

### Instalacja globalna (Windows)

1. Zainstaluj Pythona 3.10+ (zalecane 3.11 lub 3.12).
2. Zainstaluj wymagane biblioteki:
	```
	pip install flask torch transformers
	```
	Jeśli korzystasz z GPU, zainstaluj PyTorch z obsługą CUDA zgodnie z instrukcją na stronie: https://pytorch.org/get-started/locally/

3. Wybierz czy projekt ma być interpretowany globalnie czy wirtualnie w **VS Code** `Ctrl + Shift + P`
	```
	Python: Select Interpreter
	```

---

### Instalacja w środowisku wirtualnym (rekomendowane)

1. Utwórz środowisko:
	```
	python -m venv venv
	```
2. Aktywuj środowisko:
	```
	.\venv\Scripts\activate
	```
3. Zainstaluj wymagane pakiety:
	```
	pip install flask torch transformers
	```

---

### Dodatkowe uwagi

- Upewnij się, że katalogi `Bielik-7B-Instruct-v0.1/` oraz `static/NarrativeIMG/` są wykluczone z repozytorium (patrz .gitignore).
- Do działania modelu wymagane są pliki z katalogu `Bielik-7B-Instruct-v0.1/`.
- Jeśli korzystasz z GPU, sprawdź poprawność instalacji CUDA poleceniem:
	```
	python -c "import torch; print(torch.cuda.is_available())"
	```
- Projekt korzysta z bibliotek: Flask, torch (PyTorch), transformers (HuggingFace), oraz standardowych bibliotek Pythona.


## Pliki uruchomieniowe

- `app.py` - główna aplikacja

- `builderJS.py` - budowniczy skryptów z zależności klas (`./static/data/class/`) na podstawie `init_***.js` z katalogu `./static/data/config/` do użytku w `./static/data/` i dokumentację klas do `./static/data/tmp/`

- `dev.py` - mokap standardowych odpowiedzi backendu dla testowania tylko frontendu
