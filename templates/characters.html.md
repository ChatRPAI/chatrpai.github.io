<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <title>AI RP Chat</title>
    <link rel="stylesheet" href="/static/data/global-layout.css" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content"
    />

    <!-- Favicon -->
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="../static/favicons/favicon-16x16.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="../static/favicons/favicon-32x32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="48x48"
      href="../static/favicons/favicon-48x48.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="64x64"
      href="../static/favicons/favicon-64x64.png"
    />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="../static/favicons/apple-touch-icon.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="192x192"
      href="../static/favicons/android-chrome-192x192.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="512x512"
      href="../static/favicons/android-chrome-512x512.png"
    />
    <link rel="manifest" href="../static/favicons/site.webmanifest" />
  </head>
  <body class="bg-dark text-light flex flex-col items-center ov-fy-auto">
    <main id="app" class="flex flex-col items-center w-full h-full">
      <header id="app-header">
        <h1 class="text-center text-lg mt-10">AI RP Chat</h1>
      </header>

      <main id="character-selection" class="ov-fy-auto">

     <div class="filter-characters">
         <div class="search-container">
          <input
            type="text"
            id="searchInput"
            placeholder="Wpisz nazwę postaci..."
          />
          <ul id="suggestionsList"></ul>
        </div>

        <div class="filter-container">
          <button class="filter-btn" data-race="all">Wszystkie</button>
          <button class="filter-btn" data-race="Ork">Ork</button>
          <button class="filter-btn" data-race="Człowiek">Człowiek</button>
          <button class="filter-btn" data-race="Elf">Elf</button>
          <button class="filter-btn" data-race="Krasnolud">Krasnolud</button>
          <button class="filter-btn" data-race="Sukub">Sukub</button>
        </div>
     </div>
        <h2>Dostępne postacie</h2>

        <div class="character-grid">
          <!-- Karty postaci będą generowane dynamicznie tutaj -->
        </div>
      </main>

      <button id="burger-toggle" class="button-icon button-base">☰</button>
      <aside id="web-side-panel" class="bg-panel p-10 br-2">
        <h2 class="text-center text-lg mb-5">Nawigacja</h2>
        <nav class="flex flex-col gap-4">
          <a href="/" class="button-base button-primary text-center"
            >Strona główna</a
          >
          <a href="/chat" class="button-base button-primary text-center"
            >Czat</a
          >
          <a href="/settings" class="button-base button-primary text-center"
            >Ustawienia</a
          >
          <a href="/characters" class="button-base button-secondary text-center"
            >Postacie</a
          >
        </nav>
      </aside>

      <footer id="app-footer">
        <p class="text-center text-sm mb-5">
          &copy; 2024 AI RP Chat. Wszelkie prawa zastrzeżone.
        </p>
      </footer>
    </main>

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const characterCards = document.querySelectorAll(".character-card");

        characterCards.forEach((card) => {
          const descriptionButton = card.querySelector(
            'input[value="description"]'
          );
          const statsButton = card.querySelector('input[value="stats"]');
          const descriptionSection = card.querySelector(".description-section");
          const statsSection = card.querySelector(".stats-section");

          descriptionButton.addEventListener("change", function () {
            descriptionSection.style.display = "block";
            statsSection.style.display = "none";
          });

          statsButton.addEventListener("change", function () {
            statsSection.style.display = "block";
            descriptionSection.style.display = "none";
          });

          // Set initial states based on which radio button is checked
          if (descriptionButton.checked) {
            descriptionSection.style.display = "block";
            statsSection.style.display = "none";
          } else if (statsButton.checked) {
            statsSection.style.display = "block";
            descriptionSection.style.display = "none";
          }
        });
      });

      // Search and filter functionality

      // =====================================
      // Dane do wyszukiwania - Twoje postacie RPG
      // =====================================

      const characters = [
        {
          name: "Lytha",
          race: "Elf",
          class: "Uzdrowicielka",
          description:
        "Lytha to łagodna Elfka uzdrowicielka, znana ze swojej mądrości i empatii. Poświęciła swoje życie pomaganiu innym i leczeniu ran zarówno ciała, jak i duszy.",
          stats: {
        strength: 4,
        dexterity: 5,
        constitution: 4,
        intelligence: 5,
        wisdom: 6,
        charisma: 4,
          },
          portret: "../static/resources/char-1.png",
        },
        {
          name: "Aric",
          race: "Człowiek",
          class: "Wojownik",
          description:
        "Aric to odważny Człowiek Wojownik, znany ze swojej niezłomnej lojalności i mistrzostwa w posługiwaniu się mieczem. Jest symbolem nadziei w obliczu przeciwności.",
          stats: {
        strength: 7,
        dexterity: 5,
        constitution: 6,
        intelligence: 2,
        wisdom: 4,
        charisma: 4,
          },
          portret: "../static/resources/char-2.png",
        },
        {
          name: "Xardas Thrain",
          race: "Ork",
          class: "Czarnoksiężnik",
          description:
        "Xardas Thrain to przebiegły Ork Czarnoksiężnik, władający mroczną magią i starożytnymi sekretami. Budzi strach wśród wielu, krocząc niebezpieczną ścieżką w poszukiwaniu zakazanej wiedzy.",
          stats: {
        strength: 4,
        dexterity: 5,
        constitution: 4,
        intelligence: 8,
        wisdom: 4,
        charisma: 3,
          },
          portret: "../static/resources/char-3.png",
        },
        {
          name: "Grommash",
          race: "Ork",
          class: "Berserker",
          description:
        "Grommash to potężny Ork Berserker, znany ze swojej nieokiełznanej furii i umiejętności walki wręcz. Jego celem jest zdobycie chwały na polu bitwy i udowodnienie swojej siły.",
          stats: {
        strength: 8,
        dexterity: 4,
        constitution: 7,
        intelligence: 2,
        wisdom: 3,
        charisma: 4,
          },
          portret: "../static/resources/char-4.png",
        },
        {
          name: "Kael'thas",
          race: "Elf",
          class: "Czarodziej",
          description:
        "Kael'thas to utalentowany Elf Czarodziej, znany ze swojej biegłości w magii ognia. Jego ambicją jest zdobycie wiedzy o najpotężniejszych zaklęciach i artefaktach.",
          stats: {
        strength: 3,
        dexterity: 6,
        constitution: 4,
        intelligence: 8,
        wisdom: 4,
        charisma: 3,
          },
          portret: "../static/resources/char-5.png",
        },
        {
          name: "Jaina Proudmoore",
          race: "Człowiek",
          class: "Czarodziejka",
          description:
        "Jaina Proudmoore to potężna Człowiek Czarodziejka, znana ze swojej biegłości w magii lodu i wody. Jest jednym z najważniejszych sojuszników w walce z ciemnymi siłami.",
          stats: {
        strength: 2,
        dexterity: 4,
        constitution: 4,
        intelligence: 8,
        wisdom: 6,
        charisma: 4,
          },
          portret: "../static/resources/char-6.png",
        },
        {
          name: "Thrall",
          race: "Ork",
          class: "Szaman",
          description:
        "Thrall to mądry Ork Szaman, znany ze swojej więzi z naturą i duchami przodków. Jego celem jest przywrócenie równowagi w świecie i ochrona swojego ludu.",
          stats: {
        strength: 6,
        dexterity: 4,
        constitution: 5,
        intelligence: 4,
        wisdom: 6,
        charisma: 3,
          },
          portret: "../static/resources/char-7.png",
        },
        {
          name: "Malistaire",
          race: "Sukub",
          class: "Kapłanka",
          description:
        "Malistaire to tajemnicza Sukub Kapłanka, znana ze swojej zdolności do manipulacji i kontroli umysłów. Jej celem jest zdobycie władzy i wpływów w świecie ludzi i demonów.",
          stats: {
        strength: 3,
        dexterity: 5,
        constitution: 4,
        intelligence: 6,
        wisdom: 4,
        charisma: 6,
          },
          portret: "../static/resources/char-8.png",
        },
        {
          name: "Tirion Fordring",
          race: "Krasnolud",
          class: "Paladyn",
          description:
        "Tirion Fordring to szlachetny Krasnolud Paladyn, znany ze swojej niezłomnej wiary i poświęcenia w walce ze złem. Jego celem jest ochrona niewinnych i przywrócenie sprawiedliwości w świecie.",
          stats: {
        strength: 7,
        dexterity: 3,
        constitution: 5,
        intelligence: 4,
        wisdom: 5,
        charisma: 4,
          },
          portret: "../static/resources/char-9.png",
        },
      ];

      const searchInput = document.getElementById("searchInput");
      const suggestionsList = document.getElementById("suggestionsList");
      const characterGrid = document.querySelector(".character-grid");
      const filterBtns = document.querySelectorAll(".filter-btn");

      let currentFilter = "all";

      // Funkcja wyświetlająca sugestie podczas pisania
      function displaySuggestions(query) {
        suggestionsList.innerHTML = "";
        if (query.length === 0) {
          return;
        }

        const filteredData = characters.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

        filteredData.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item.name;
          li.addEventListener("click", () => {
            searchInput.value = item.name;
            suggestionsList.innerHTML = "";
            displayCharacters(item.name, currentFilter);
          });
          suggestionsList.appendChild(li);
        });
      }

      // Funkcja wyświetlająca ostateczną listę postaci
      function displayCharacters(query = "", filter = "all") {
        characterGrid.innerHTML = "";

        const filteredData = characters.filter((item) => {
          const nameMatch = item.name
            .toLowerCase()
            .includes(query.toLowerCase());
          const raceMatch = filter === "all" || item.race === filter;
          return nameMatch && raceMatch;
        });

        if (filteredData.length === 0) {
          characterGrid.innerHTML = "<li>Brak pasujących postaci.</li>";
          return;
        }

        filteredData.forEach((item) => {
          const card = createCharacterCard(item);
          characterGrid.appendChild(card);
        });
      }

      // Nasłuchiwanie na wpisywanie w polu wyszukiwania
      searchInput.addEventListener("input", (e) => {
        displaySuggestions(e.target.value);
        displayCharacters(e.target.value, currentFilter);
      });

      // Nasłuchiwanie na kliknięcia przycisków filtrujących
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          // Zmień klasę 'active' na przyciskach
          filterBtns.forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          currentFilter = e.target.dataset.race;
          displayCharacters(searchInput.value, currentFilter);
        });
      });

      // Początkowe wyświetlenie wszystkich postaci
      displayCharacters("", "all");

      // =====================================
      // Tworzenie kart postaci
      // =====================================

      function createCharacterCard(character) {
        const card = document.createElement("div");
        card.className = "character-card";
        card.innerHTML = `
            <!-- Character: ${character.name} -->
          <img src="${character.portret}" alt="${character.name}" />
          <h3>${character.name}</h3>
          <p class="class">${character.class}</p>
          <p class="race">${character.race}</p>

          <div class="content-toggle">
            <input
              type="radio"
              id="${character.name}-description"
              name="${character.name}-details"
              value="description"
              checked
            />
            <label for="${character.name}-description">Opis</label>

            <a href="#${character.name.split(" ").join("-")}-page" class="button-base button-primary">Edytuj</a>


            <input
              type="radio"
              id="${character.name}-stats"
              name="${character.name}-details"
              value="stats"
            />
            <label for="${character.name}-stats">Statystyki</label>
          </div>

          <div class="content-container">
            <div class="description-section">
              <p>
               ${character.description}
              </p>
            </div>

            <div class="stats-section">
              <ul class="stats">
                <li><strong>Siła:</strong> <em>${character.stats.strength}</em></li>
                <li><strong>Zręczność:</strong> <em>${character.stats.dexterity}</em></li>
                <li><strong>Wytrzymałość:</strong> <em>${character.stats.constitution}</em></li>
                <li><strong>Inteligencja:</strong> <em>${character.stats.intelligence}</em></li>
                <li><strong>Mądrość:</strong> <em>${character.stats.wisdom}</em></li>
                <li><strong>Charyzma:</strong> <em>${character.stats.charisma}</em></li>
              </ul>
            </div>
          </div>
    `;
    card.querySelector("a").addEventListener("click", () => {
      createEditPage(character);
    });

        return card;
      }

      // ====================================
      // Okno edycji postaci
      // ====================================

      function createEditPage(character) {
        const editPage = document.createElement("div");
        editPage.className = "edit-character-modal ";
        editPage.id = `${character.name.split(" ").join("-")}-page`;
        editPage.appendChild(editedCharPortret(character));
        editPage.appendChild(editedCharDescription(character));
        editPage.appendChild(editedCharImagesGallery(character));


        document.body.appendChild(editPage);
      }

      const races = ["Człowiek", "Elf", "Krasnolud", "Ork", "Sukub"];
      const classes = [
        "Wojownik",
        "Czarodziej",
        "Uzdrowicielka",
        "Berserker",
        "Czarnoksiężnik",
        "Czarodziejka",
        "Szaman",
        "Kapłanka",
        "Paladyn",
      ];

      function editedCharPortret(character) {
        const portretDiv = document.createElement("div");
        portretDiv.className = "edited-char-portret";
        portretDiv.innerHTML = `
          <div class="char-avatar">
            <img src="${character.portret}" alt="${character.name}" />
          </div>
          <button class="button-base button-secondary">Zmień awatar</button>
            <div>
              <input type="text" value="${character.name}" />
              <select id="raceSelect">
                ${races
                  .map(
                    (race) =>
                      `<option value="${race}" ${
                        race === character.race ? "selected" : ""
                      }>${race}</option>`
                  )
                  .join("")}
              </select>
              <select id="classSelect">
                ${classes
                  .map(
                    (className) =>
                      `<option value="${className}" ${
                        className === character.class ? "selected" : ""
                      }>${className}</option>`
                  )
                  .join("")}
              </select> 
            </div>
        `;

         const  selects = portretDiv.querySelectorAll("select");
        selects.forEach((select) => {
          select.addEventListener("change", () => {
            // Znajdź formularz w całym dokumencie, nie tylko w portretDiv
            const editForm = document.querySelector(".edit-character-modal .edit-form");
            if (editForm) {
              dungeonAndDragonsStatsConfigure(editForm);
            }
          });
        });

        return portretDiv;
      }

      function editedCharDescription(character) {
        const descDiv = document.createElement("div");
        descDiv.className = "edited-char-description";
        descDiv.innerHTML = `
          <a href="#" class="back-button button-base button-secondary" id="back-button">← Powrót</a>
          <h2>Edytuj postać: ${character.name}</h2>
          <form class="edit-form">
            <label for="description">Opis:</label>
            <textarea id="description" name="description">${character.description}</textarea>

            <h3>Statystyki</h3>
            <label for="strength">Siła:</label>
            <input type="number" id="strength" name="strength" value="${character.stats.strength}" />

            <label for="dexterity">Zręczność:</label>
            <input type="number" id="dexterity" name="dexterity" value="${character.stats.dexterity}" />

            <label for="constitution">Wytrzymałość:</label>
            <input type="number" id="constitution" name="constitution" value="${character.stats.constitution}" />

            <label for="intelligence">Inteligencja:</label>
            <input type="number" id="intelligence" name="intelligence" value="${character.stats.intelligence}" />

            <label for="wisdom">Mądrość:</label>
            <input type="number" id="wisdom" name="wisdom" value="${character.stats.wisdom}" />

            <label for="charisma">Charyzma:</label>
            <input type="number" id="charisma" name="charisma" value="${character.stats.charisma}" />

            <button type="submit" class="button-base button-primary">Zapisz zmiany</button>
          </form>
        `;
        descDiv
          .querySelector("#back-button")
          .addEventListener("click", (e) => {
            e.preventDefault();
            descDiv.parentElement.remove();
          });
         const editForm = descDiv.querySelector(".edit-form");
        dungeonAndDragonsStatsConfigure(editForm);

        return descDiv;
      }

      function editedCharImagesGallery(character) {
        const images = [
          "forest.png",
          "forest_healing.jpg",
          "forest_Lytha.jpeg",
          "forest_Lytha_healing.gif",
          "healing_forest.jpg",
          "dungeon_Lytha.png",
        ];
        const locations = ["forest", "village", "castle", "dungeon"];


        const galleryFilterByLocation = document.createElement("div");
        galleryFilterByLocation.className = "gallery-filter-by-location";
        galleryFilterByLocation.innerHTML = `
          <label for="locationSelect">Filtruj według lokalizacji:</label>
          <select id="locationSelect">
            <option value="all">Wszystkie</option>
            ${locations
              .map(
                (loc) =>
                  `<option value="${loc}">${loc.charAt(0).toUpperCase() + loc.slice(1)}</option>`
              )
              .join("")}
          </select>
        `;



        const galleryDiv = document.createElement("div");
        galleryDiv.className = "edited-char-images-gallery";
        galleryDiv.innerHTML = `
          <h3>Galeria obrazów postaci: ${character.name}</h3>
          <input type="file" id="imageUpload" />
         
        `;

        galleryDiv.appendChild(galleryFilterByLocation);

         const inputFile = galleryDiv.querySelector("#imageUpload");
        inputFile.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
           configureFileUpload(file, character.name);
          }
        });


        const imagesContainer = document.createElement("div");
        imagesContainer.className = "gallery-grid";
        galleryDiv.appendChild(imagesContainer);

        images.forEach((image) => {
          const imageItem = document.createElement("div");
          imageItem.className = "image-item";
          imageItem.innerHTML = `
            <img src="../static/NarrativeIMG/${image}" alt="${image}" />
            <button class="button-base button-secondary">Usuń</button>
          `;
          imagesContainer.appendChild(imageItem);
        });


        const locationSelect = galleryFilterByLocation.querySelector(
          "#locationSelect"
        );
        locationSelect.addEventListener("change", (e) => {
          const selectedLocation = e.target.value;
          const allImages = imagesContainer.querySelectorAll(".image-item");

          allImages.forEach((imgItem) => {
            const imgSrc = imgItem.querySelector("img").src.toLowerCase();
            if (selectedLocation === "all") {
              imgItem.style.display = "block";
            } else if (imgSrc.includes(selectedLocation)) {
              imgItem.style.display = "block";
            } else {
              imgItem.style.display = "none";
            }
          });
        });

        return galleryDiv;
      }



function configureFileUpload(file, characterName) {
  // Tutaj dodaj logikę obsługi przesyłania pliku
  // Możesz użyć FileReader do podglądu obrazu przed przesłaniem
  // lub wysłać plik bezpośrednio na serwer za pomocą fetch/AJAX

  // Przykład podglądu obrazu:
  const reader = new FileReader();
  reader.onload = function (e) {
    showImageUploadModal(file);
  };
  reader.readAsDataURL(file);
 // Ma sie pojawić nowe okiernko które wyświetli dany obrazek który został wybrany w input file 
 // następnie wymagane będzie uzuperłnienie z listy datalist|:
 // Postać ("tag-character")- to domyślnie będzie wypełnione imieniem postaci której edytujemy galerię i disabled
 // Lokalizacja ("tag-location")
 // Emocja ("tag-emotion")
 // Czynność ("tag-action")
 // NSFW ("tag-nsfw")
  const tags = {
  "tag-location": ["forest", "castle", "cave", "beach", "city"],
  "tag-character": ["Lytha", "Hestia", "Xardas", "Aria"],
  "tag-action": ["attack", "defend", "healing", "stealth"],
  "tag-nsfw": ["adult", "hugging", "kissing", "intimate"],
  "tag-emotion": ["happy", "sad", "angry", "surprised"]
};

  const modal = document.createElement("div");
  modal.className = "image-upload-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button button-base">&times;</span>
      <h2>Prześlij nowy obraz</h2>
      <img src="${URL.createObjectURL(file)}" alt="Preview" class="image-preview" />
      <form id="uploadForm">
        <label for="tag-character">Postać:</label>
        <input list="tag-character-list" id="tag-character" name="tag-character" value="${characterName}" disabled />
        <datalist id="tag-character-list">
          ${tags["tag-character"].map(tag => `<option value="${tag}">`).join('')}
        </datalist>

        <label for="tag-location">Lokalizacja:</label>
        <input list="tag-location-list" id="tag-location" name="tag-location" required />
        <datalist id="tag-location-list">
          ${tags["tag-location"].map(tag => `<option value="${tag}">`).join('')}
        </datalist>

        <label for="tag-emotion">Emocja:</label>
        <input list="tag-emotion-list" id="tag-emotion" name="tag-emotion"  />
        <datalist id="tag-emotion-list">
          ${tags["tag-emotion"].map(tag => `<option value="${tag}">`).join('')}
        </datalist>

        <label for="tag-action">Czynność:</label>
        <input list="tag-action-list" id="tag-action" name="tag-action"  />
        <datalist id="tag-action-list">
          ${tags["tag-action"].map(tag => `<option value="${tag}">`).join('')}
        </datalist>

        <label for="tag-nsfw">NSFW:</label>
        <input list="tag-nsfw-list" id="tag-nsfw" name="tag-nsfw"  />
        <datalist id="tag-nsfw-list">
          ${tags["tag-nsfw"].map(tag => `<option value="${tag}">`).join('')}
        </datalist>

        <button type="submit" class="button-base button-primary">Prześlij</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const requiredInputEmotion = modal.querySelector("#tag-emotion");
  const requiredInputAction = modal.querySelector("#tag-action");
  const requiredInputNsfw = modal.querySelector("#tag-nsfw");
  // jeden z nich musi być wypełniony
  function validateForm() {
    if (requiredInputEmotion.value || requiredInputAction.value || requiredInputNsfw.value) {
      return true;
    } else {
      alert("Proszę wypełnić przynajmniej jedno z pól: Emocja, Czynność lub NSFW.");
      return false;
    }
  }
  modal.querySelector("#uploadForm").addEventListener("submit", (e) => {
    if (!validateForm()) {
      e.preventDefault();
    }else{
      // Tutaj dodaj logikę przesyłania pliku i danych formularza na serwer
      alert("Obraz przesłany!");
      modal.remove();
    }
  });
  
  const closeButton = modal.querySelector(".close-button");
  closeButton.addEventListener("click", () => {
    modal.remove();
  });
  

}


function dungeonAndDragonsStatsConfigure(form) {
  // Sprawdź czy form istnieje
  if (!form) {
    console.error("Form element not found in dungeonAndDragonsStatsConfigure");
    return;
  }

  const stats = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
  const raceModifiers = {
    "Człowiek": { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    "Elf": { dexterity: 2, intelligence: 1 },
    "Krasnolud": { constitution: 2, wisdom: 1 },
    "Ork": { strength: 2, constitution: 1, intelligence: -1 },
    "Sukub": { charisma: 2, intelligence: 1, wisdom: -1 }
  };
  const classModifiers = {
    "Wojownik": { strength: 2, constitution: 1 },
    "Czarodziej": { intelligence: 2, wisdom: 1 },
    "Uzdrowicielka": { wisdom: 2, charisma: 1 },
    "Berserker": { strength: 2, dexterity: 1 },
    "Czarnoksiężnik": { intelligence: 2, charisma: 1 },
    "Czarodziejka": { intelligence: 2, wisdom: 1 },
    "Szaman": { wisdom: 2, constitution: 1 },
    "Kapłanka": { charisma: 2, wisdom: 1 },
    "Paladyn": { strength: 2, charisma: 1 }
  };

  const maxPoints = 28;
  let allocatedPoints = 0;

  function updateStats() {
    allocatedPoints = 0;
    
    // Znajdź selektory rasy i klasy w całym modalu edycji
    const raceSelect = document.querySelector(".edit-character-modal #raceSelect");
    const classSelect = document.querySelector(".edit-character-modal #classSelect");
    
    if (!raceSelect || !classSelect) {
      console.error("Race or class select not found in modal");
      return;
    }

    const selectedRace = raceSelect.options[raceSelect.selectedIndex].value;
    const selectedClass = classSelect.options[classSelect.selectedIndex].value;
    const raceModifier = raceModifiers[selectedRace] || {};
    const classModifier = classModifiers[selectedClass] || {};

    stats.forEach(stat => {
      const input = form.querySelector(`#${stat}`);
      if (!input) return;

      let baseValue = parseInt(input.value) || 0;

      // Ogranicz bazową wartość do zakresu 0-15 (stały zakres, bez względu na modyfikatory)
      if (baseValue < 0) baseValue = 0;
      if (baseValue > 15) baseValue = 15;
      input.value = baseValue;

      // Ustaw stałe min i max dla inputa HTML
      input.min = 0;
      input.max = 15;

      // Dodaj bazową wartość do sumy punktów (tylko bazowa, bez modyfikatorów)
      allocatedPoints += baseValue;

      // Oblicz modyfikatory dla tej statystyki
      const raceBonus = raceModifier[stat] || 0;
      const classBonus = classModifier[stat] || 0;
      const finalValue = baseValue + raceBonus + classBonus;

      // Wyświetl wartość końcową jako tooltip z rozpisaniem
      input.title = `Bazowa: ${baseValue} + Rasa: ${raceBonus} + Klasa: ${classBonus} = Końcowa: ${finalValue}`;
    });

    const pointsLeftElement = form.querySelector("#pointsLeft");
    if (pointsLeftElement) {
      const pointsLeft = maxPoints - allocatedPoints;
      pointsLeftElement.textContent = `Pozostałe punkty: ${pointsLeft}`;
      
      if (pointsLeft < 0) {
        pointsLeftElement.classList.add("text-red-500");
      } else {
        pointsLeftElement.classList.remove("text-red-500");
      }
    }
  }

  // Dodaj element wyświetlający pozostałe punkty
  if (!form.querySelector("#pointsLeft")) {
    form.innerHTML += `<p id="pointsLeft">Pozostałe punkty: ${maxPoints}</p>`;
  }

  // Dodaj nasłuchiwanie zmian w polach statystyk
  stats.forEach(stat => {
    const input = form.querySelector(`#${stat}`);
    if (input) {
      input.addEventListener("input", updateStats);
    }
  });

  // Początkowe wywołanie aktualizacji
  setTimeout(() => {
    updateStats();
  }, 100);
}

    </script>

    <script src="/static/data/characters.js"></script>
  </body>
</html>
