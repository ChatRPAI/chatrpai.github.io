/*
fileMD - służy do przechowywania zawartości pliku .md
content - przechowuje referencję do elementu z id="content"
onceLoaded_index - zmienna logiczna, która przechowuje informację o tym, czy plik _index.md został już załadowany jest to tak zwana flaga, która zapobiega wielokrotnemu ładowaniu pliku _index.md
*/
const reduceChars = /:|<|>| >|< |"/g;
const webTitle = document.title;
let fileMD = "";
const content = document.querySelector("#content");
let onceLoaded_index = false;

const failureFetchFileIndex = 0;

// Jednorazowe załadowanie pliku _index.md
if (!onceLoaded_index) {
  loadPage("_index");
  onceLoaded_index = true;
}

// Funkcja loadPage, która pobiera plik .md z katalogu Pages i przetwarza go na html
// oraz za pierwszym razem generuje menu nawigacyjne Dokumentacji gdy target jest równy _index

function loadPage(target) {
  fetch(`Pages/${target}.md`)
    .then((response) => response.text())
    .then((data) => {
      // Załadowanie zawartości pliku .md do zmiennej global
      fileMD = data;

      // Sprawdzenie czy target jest równy _index aby jednorazowo przygotować menu nawigacyjne Dokumentacji
      if (target === "_index") {
        setupIndexPage();
        scrollToSection("header-0");
        changeActiveNav(target);
      }
    })
    .catch(() => {
      errorFetchFilePage();
    });
}

// Funkcja setupIndexPage, która przygotowuje menu nawigacyjne Dokumentacji
function setupIndexPage() {
  // Przetworzenie pliku .md na html
  let html_index = marked.parse(fileMD);
  // Usunięcie zawartości menu nawigacyjnego Dokumentacji
  document.querySelector("nav>ul").innerHTML = "";

  // Tablica obiektów zawierająca regex oraz replacement, które są wykorzystywane do zamiany tagów html na tagi listy
  const replacements = [
    { regex: /<h1>/g, replacement: '<li><a href="#">' },
    { regex: /<\/h1>/g, replacement: "</a></li>" },
    { regex: /<h4>/g, replacement: '<li class="module">' },
    { regex: /<\/h2>/g, replacement: "</a></li>" },
    { regex: /<details>/g, replacement: "<li><details>" },
    { regex: /<\/summary>/g, replacement: "</summary><ul>" },
    { regex: /<\/details>/g, replacement: "</ul></details></li>" },
  ];

  // Zamiana tagów html(h1 i h4,) na tagi listy (li) i poprawienie struktury dla przypadków z tagami details i summary
  replacements.forEach(({ regex, replacement }) => {
    html_index = html_index.replace(regex, replacement);
  });

  // Usuniecie zawartości menu nawigacyjnego Dokumentacji
  document.querySelector("nav>ul").innerHTML = html_index;

  // Załadowanie kontentu na podstawie adresu URL
  urlSeter();
  window.addEventListener("hashchange", urlSeter);
  // Nadanie funkcjonalności dla głównego menu nawigacyjnego Dokumentacji
  document.querySelectorAll("nav>ul li").forEach((li, index) => {
    let target; // Zmienna pomocnicza, do przechowywania lokalizacji pliku .md
    const aTag = li.querySelector("a"); // Zmienna pomocnicza

    // Sprawdzenie czy element li jest elementem details, jeżeli tak to to w linku href dodaj jego nazwę jako lokalizację do katalogu o tej samej nazwie
    if (
      li.parentElement.parentElement.tagName === "DETAILS" &&
      li.parentElement.tagName !== "SUMMARY"
    ) {
      aTag.href = `#${
        li.parentElement.parentElement.querySelector("summary").innerText
      }/${aTag.lastChild.textContent
        .replace(reduceChars, "")
        .replace("  ", " ")}`;

      target = aTag.href.split("#")[1] + "/" + aTag.href.split("#")[2];
    } else if (aTag) {
      aTag.href = `#${aTag.innerText
        .replace(reduceChars, "")
        .replace("  ", " ")}`;
      target = aTag.innerText;
    }

    // Nadanie zdarzenia click na element li do przełączania treści strony
    li.addEventListener("click", function (event) {
      // Przerywa propagację zdarzenia aby nie wywołać zdarzenia click na rodzicu, tylko na klikniętym elemencie li, gdy rodzicem jest details
      event.stopPropagation();

      // Przypisanie ścieżki do pliku .md zgodnie z lokalizacją
      let target = this.querySelector("a").href.split("#")[1];

      // Przypisanie pierwszego elementu znajdującego się nad kliknietym elementem li, który posiada klasę module
      const moduleName = findPreviousModule(this)?.innerText.split(":")[0];
      // Jeżeli nazwa modułu istnieje i pierwszy element tablicy zdekodowanego targetu jest różny od nazwy modułu to dodaj nazwę modułu do targetu
      if (moduleName && decodeURI(target.split("/")[0]) !== moduleName) {
        target = `${moduleName}/${target}`;
      } else {
        // Zmienna pomocnicza, która przechowuje referencję do rodzica rodzica rodzica elementu li
        const parentNav = this.parentElement.parentElement.parentElement;
        // Przypisanie pierwszego elementu znajdującego się nad kliknietym elementem `parentNav`, który posiada klasę module
        const parentModuleName =
          findPreviousModule(parentNav)?.innerText.split(":")[0];
        // Jeżeli stary target jest równy nowemu target i rodzic modułu istnieje oraz pierwszy element tablicy zdekodowanego targetu jest różny od nazwy modułu to dodaj nazwę modułu do targetu
        if (
          parentModuleName &&
          decodeURI(target.split("/")[0]) !== parentModuleName
        ) {
          target = `${parentModuleName}/${target}`;
        }
      }

      // Uzupełnienie adresu URL
      this.querySelector("a").href = `#${target}`;

      // Pobranie zawartości pliku .md zgodnie z lokalizacją
      fetch(`Pages/${target}.md`)
        .then((response) => response.text())
        .then((data) => {
          // Załadowanie zawartości pliku .md do zmiennej globalnej fileMD
          fileMD = data;
          // Wywołanie funkcji generującej stronę
          setupPage(target);
          setupNavSidebar();
          scrollToSection("#header-0");
        })
        .catch(() => {
          errorFetchFilePage();
        });
    });
  });
  wrapNonBreakingSpace(document.querySelector("nav>ul"));
}

// Funkcja findPreviousModule, która zwraca pierwszy element znajdujący się nad elementem, który posiada klasę module
function findPreviousModule(element) {
  let previousElement = element.previousElementSibling; // Przypisanie pierwszego elementu znajdującego się nad elementem
  // Pętla while, która przechodzi przez wszystkie elementy znajdujące się nad elementem i sprawdza czy element posiada klasę module jeżeli tak to zwraca ten element
  while (previousElement) {
    if (previousElement.classList.contains("module")) {
      return previousElement;
    }
    previousElement = previousElement.previousElementSibling;
  }
  return null;
}

// Funkcja urlSeter, która na podstawie adresu URL ścieżki pobiera zawartość pliku .md
function urlSeter() {
  let targetPage;
  const url = window.location.href;

  let target =
    url.split("#")[1] || document.querySelector("nav>ul>li>a").innerText;
  target = decodeURI(target)
    .replace(reduceChars, "")
    .replace("  ", " ")
    .split("/");

  // Jeśli target ma tylko 1 element, spróbuj znaleźć brakujący moduł
  if (target.length === 1) {
    const matchingLink = Array.from(
      document.querySelectorAll("nav>ul li a")
    ).find((a) => a.innerText.replace(reduceChars, "").trim() === target[0]);

    if (matchingLink) {
      const module = findPreviousModule(
        matchingLink.parentElement
      )?.innerText.split(":")[0];
      if (module) {
        target.unshift(module);
      }
    }
  }

  // Przypisanie lokalizacji pliku .md zgodnie z długością tablicy target
  switch (target.length) {
    case 1:
      targetPage = target[0];
      break;
    case 2:
      targetPage = `${target[0]}/${target[1]}`;
      break;
    case 3:
      targetPage = `${target[0]}/${target[1]}/${target[2]}`;
      break;
    default:
      targetPage = target;
  }

  // Pobranie zawartości pliku .md zgodnie z lokalizacją i wywołanie funkcji generującej stronę
  fetch(`Pages/${targetPage}.md`)
    .then((response) => response.text())
    .then((data) => {
      fileMD = data;
      setupPage(targetPage);
      setupNavSidebar();
    })
    .catch(() => {
      errorFetchFilePage();
    });
}

// Funkcja changeActiveNav, która zmienia aktywny element menu nawigacyjnego Dokumentacji
function changeActiveNav(targetPage) {
  let targetPageArray = targetPage.split("/");
  targetPage = targetPageArray[targetPageArray.length - 1];
  targetPage = decodeURI(targetPage);

  // Znalezienie elementu menu nawigacyjnego, który zawiera w sobie nazwę pliku .md
  const targetElement = Array.from(document.querySelectorAll("nav>ul a")).find(
    (a) => {
      if (
        a.textContent.replace(reduceChars, "").replace("  ", " ") === targetPage
      )
        return a;
    }
  );
  // Jeżeli element istnieje to usuń klasę active ze wszystkich elementów menu nawigacyjnego i dodaj ją do elementu, który zawiera w sobie nazwę pliku .md
  if (targetElement) {
    console.log(
      `Zmieniam aktywny element menu nawigacyjnego na: ${targetElement.textContent}`
    );
    document
      .querySelectorAll("nav>ul li")
      .forEach((li) => li.classList.remove("active"));
    targetElement.parentElement.classList.add("active");
    const details = targetElement.parentElement.parentElement.parentElement;
    if (details.tagName === "DETAILS") {
      if (!details.hasAttribute("open")) {
        details.setAttribute("open", "");
      }

      details.querySelector("summary>li").classList.add("active");
    }
  }
}


// Funkcja setupPage, która przygotowuje stronę na podstawie zawartości pliku .md
function setupPage(targetPage) {
  // Przetworzenie pliku .md na html
  const htmlContent = marked.parse(fileMD);
  document.getElementById("content").innerHTML = htmlContent;
  // Dodanie kolorowania składni do bloków kodu
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
  //dodanie nagłówka do kodu
  setHeaderCodeSmallBlockStyle();
  // Dodanie przycisków kopiuj do bloków kodu
  addCopyButtons();

  // Inicjalizacja zakładek i podpowiedzi
  initializeTabs();
  initializeHints();
  // Zmiana aktywnego elementu menu nawigacyjnego
  changeActiveNav(targetPage);
  renderMathInElement(content);
  setTittle();
  removeEmptyTHead();

  document.querySelectorAll("p>span>span").forEach((span) => {
    if (
      span.parentElement.parentElement.firstChild.nodeName === "SPAN" &&
      span.parentElement.parentElement.parentElement.nodeName !== "LI" &&
      span.classList.contains("katex-display")
    ) {
      span.style = "display: block!important";
    }
  });

  document.querySelectorAll("h1, h2, h3").forEach((header) => {
    if (!header.parentElement.getAttribute("data-hint")) {
      const brElement = document.createElement("br");
      //dodanie po header znaczniku br
      header.parentNode.insertBefore(brElement, header.nextSibling);
    }
  });
  wrapNonBreakingSpace(content);

  // Zmiana niewidocznego phantom elementu kaTeX na pusty span o szerokości 0.2rem
  document.querySelectorAll(".mord").forEach((span) => {
    if (span.style.color === "transparent") {
      span.textContent = "";
      span.style = "width: 0.3rem;display: inline-block;";
    }
  });
}

function removeEmptyTHead() {
  let notEmptyTHead = false;
  document.querySelectorAll("thead").forEach((thead) => {
    thead.querySelectorAll("th").forEach((th) => {
      if (th.innerText.trim() !== "") {
        notEmptyTHead = true;
      }
    });
    if (!notEmptyTHead) {
      thead.remove();
    }
  });
}

function setTittle() {
  try {
    document.title =
      webTitle + ": " + document.querySelector("#content h1").innerText;
  } catch (error) {
    const targetPage = window.location.href.split("/");
    changeActiveNav(targetPage[targetPage.length - 1]);

    const links = document.querySelectorAll("li.active");
    links[links.length - 1].click();
    document.title = webTitle;
  }
}

function setHeaderCodeSmallBlockStyle() {
  document.querySelectorAll("pre code").forEach((block) => {
    const codeHeader = block.closest("pre").previousElementSibling;
    if (
      codeHeader &&
      (codeHeader.tagName === "SMALL" ||
        (codeHeader.tagName === "P" &&
          codeHeader.children[0] &&
          codeHeader.children[0].tagName === "SMALL"))
    ) {
      codeHeader.classList.add("code-header");
    }
  });
}

// Funkcja addCopyButtons, która dodaje przyciski kopiuj do bloków kodu
function addCopyButtons() {
  document.querySelectorAll("pre").forEach((pre) => {
    const button = document.createElement("button");
    button.className = "copy-button";
    button.innerText = "Kopiuj";

    // Zdarzenie click na przycisku kopiuj
    button.addEventListener("click", () => {
      const code = pre.querySelector("code").innerText;

      // Skopiowanie kodu do schowka i zmiana tekstu przycisku na Skopiowano! na 1s
      navigator.clipboard.writeText(code).then(() => {
        button.innerText = "Skopiowano!";
        setTimeout(() => {
          button.innerText = "Kopiuj";
        }, 1000);
      });
    });

    // Dodanie stworzonego przycisku kopiuj do bloku kodu
    pre.insertBefore(button, pre.firstChild);
  });
  brakesColored();
  selectAllCodeContentDoubleClick();
}

// Funkcja initializeTabs, która inicjalizuje zakładki
function initializeTabs() {
  // Znalezienie wszystkich kontenerów z zakładkami
  document.querySelectorAll("[data-tabs]").forEach((tabContainer) => {
    const tabs = tabContainer.querySelector(".tabs");
    const tabButtons = tabs.querySelectorAll("b");
    const tabContents = tabContainer.querySelectorAll("div:not(.tabs)");

    // Dodanie funkcjonalności przełączania zakładek
    tabButtons.forEach((tabButton, index) => {
      if (index === 0) tabButton.classList.add("active");
      tabButton.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        tabButton.classList.add("active");
        tabContents[index].classList.add("active");
        // setHeaderCodeSmallBlockStyle()
      });
    });
  });
}

// Funkcja initializeHints, która inicjalizuje podpowiedzi (Specjalnie wystylizowane fragmenty dokumentacji)
function initializeHints() {
  document.querySelectorAll("[data-hint]").forEach((hint) => {
    const hintType = hint.getAttribute("data-hint");
    // Nadanie klasy w zależności od typu podpowiedzi
    hint.classList.add(`hint-${hintType}`);
  });
}

// Funkcja scrollToSection, która przewija stronę do odpowiedniej sekcji w sposób płynny dzięki opcji behavior: "smooth"
function scrollToSection(id) {
  const section = document.querySelector(id);
  if (!section) return;
  const offsetTop = Math.abs(section.offsetParent.offsetTop - section.offsetTop - 85);


  window.scrollTo({
    top: offsetTop,
    behavior: "smooth",
  });
}

// Funkcja setupNavSidebar, która przygotowuje nawigację boczną wygenerowanej strony
function setupNavSidebar() {
  const navS_ul = document.querySelector("nav.sidebar ul");
  if (!navS_ul) {
    console.error("Nie znaleziono elementu nawigacji bocznej!");
    return;
  }
  navS_ul.innerHTML = "";

  // Znalezienie wszystkich nagłówków pierwszego drugiego i trzeciego stopnia w najwyższym zagnieżdżeniu w elemencie o id="content"
  const headers = document.querySelectorAll(
    "#content > h1, #content > h2, #content > h3"
  );

  headers.forEach((header, index) => {
    // Nadanie id dla nagłówków w content
    header.id = `header-${index}`;
    const li = document.createElement("li");

    // Nadanie klasy wcięcia w menu bocznym w zależności od typu nagłówka
    if (header.tagName === "H2") li.classList.add("indent-h2");
    else if (header.tagName === "H3") li.classList.add("indent-h3");

    // Dodanie linków do nagłówków w menu bocznym
    li.innerHTML = `<a href="#${header.id}">${header.innerText}</a>`;
    // Dodanie klasy active do pierwszego elementu w menu bocznym
    if (index === 0) li.classList.add("active");
    navS_ul.appendChild(li);
  });

  // Dodanie funkcjonalności nawigacji bocznej
  const sections = document.querySelectorAll(
    "#content > h1, #content > h2, #content > h3"
  );
  const navLi = document.querySelectorAll("nav.sidebar ul li");
  let isScrolling = false;

  // Dodanie zdarzenia click na elementy menu bocznego
  navLi.forEach((li) => {
    li.addEventListener("click", function (event) {
      event.preventDefault();
      const targetId = this.querySelector("a").getAttribute("href");
      //#####################################################################################################################
      //# OPCJONALNE: Wyłączenie stylu przewijania po każdym elemencie aż do zakończenia przewijania do odpowiedniej sekcji #
      //#####################################################################################################################
      isScrolling = true;
      //#####################################################################################################################
      scrollToSection(targetId);

      navLi.forEach((li) => li.classList.remove("active"));
      this.classList.add("active");
      scrollSidebarToActive(".sidebar");
      //#####################################################################################################################
      //# OPCJONALNE: Wyłączenie stylu przewijania po każdym elemencie aż do zakończenia przewijania do odpowiedniej sekcji #
      //#####################################################################################################################
      setTimeout(() => {
        isScrolling = false;
      }, 1000);
      //#####################################################################################################################
    });
  });

  navLi[0].click(); // Automatyczne kliknięcie w pierwszy element menu bocznego, aby ustawić aktywny element i przewinąć do pierwszej sekcji

  // Dodanie zdarzenia scroll na okno przeglądarki do zmiany aktywnego elementu menu bocznego w zależności od przewijanej sekcji
  window.addEventListener("scroll", () => {
    if (isScrolling) return;

    let current = "";

    // Sprawdzenie, która sekcja jest aktualnie przewijana
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 60; // 60px to wysokość <header>
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    // Zmiana aktywnego elementu menu bocznego w zależności od przewijanej sekcji
    navLi.forEach((li) => {
      li.classList.remove("active");
      if (li.querySelector("a").getAttribute("href") === `#${current}`) {
        li.classList.add("active");
      }
    });

    // Fix dla aktywacji ostatniego elementu menu bocznego gdy przewijamy stronę na sam dół a ostatnia sekcja jest za krótka aby nagłówek był na górze okna przeglądarki
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (documentHeight === scrollPosition) {
      navLi.forEach((li) => li.classList.remove("active"));
      navLi[navLi.length - 1].classList.add("active");
    }
    scrollSidebarToActive(".sidebar");
  });
  switchPositionSidebar();
  scrollSidebarToActive(""); // Przewija nawigację boczną do aktywnego elementu, aby zawsze był widoczny
}

// Funkcja scrollSidebarToActive, która przewija nawigację boczną do aktywnego elementu aby zawsze był widoczny
function scrollSidebarToActive(navName) {
  const sidebar = document.querySelector("nav" + navName);
  const activeItem = sidebar?.querySelector("li.active");
  if (sidebar && activeItem) {
    const sidebarRect = sidebar.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();

    if (
      activeRect.top < sidebarRect.top ||
      activeRect.bottom > sidebarRect.bottom
    ) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function showLoadingPage(show, message) {
  const loadingPage = document.querySelector("#loading-doc-page");
  const loadingMessage = document.querySelector(".loading-message");
  if (message) {
    loadingMessage.innerText = message;
  }
  if (show) {
    loadingPage.style.display = "flex";
  } else {
    loadingPage.style.display = "none";
  }
}

function checkLibrariesLoaded() {
  if (typeof marked === "undefined") {
    showLoadingPage(true, "Ładowanie komponentu konwersji treści: marked...");
    return;
  }
  if (typeof hljs === "undefined") {
    showLoadingPage(
      true,
      "Ładowanie komponentu formatowania kodu: highlight.js..."
    );
    return;
  }
  if (typeof renderMathInElement === "undefined") {
    showLoadingPage(
      true,
      "Ładowanie komponentu zapisów matematycznych: KaTeX..."
    );
    return;
  }
  if (document.querySelector("#content").querySelectorAll("*").length == 0) {
    showLoadingPage(true, "Ładowanie treści strony...");
    return;
  }

  // All libraries are loaded and content is present
  clearInterval(intervalId); // Stop checking
  showLoadingPage(false, "");
}

showLoadingPage(true, "Ładowanie komponentów...");

const intervalId = setInterval(checkLibrariesLoaded, 300); // Check every 300ms

// Fixed plus signs getting separated in "C++" words

function wrapNonBreakingSpace(node) {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      // Zmień tylko tekstowe węzły
      const text = child.textContent;
      const replacedText = text.replace(
        /C\+\+/g,
        '<span style="white-space: nowrap;">C++</span>'
      );
      if (replacedText !== text) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = replacedText;
        while (tempDiv.firstChild) {
          child.before(tempDiv.firstChild);
        }
        child.remove();
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // Dla elementów a, zmień tylko tekst, nie href
      if (child.tagName === "A") {
        const hrefValue = child.getAttribute("href");
        wrapNonBreakingSpace(child);
        child.setAttribute("href", hrefValue);
      } else {
        wrapNonBreakingSpace(child);
      }
    }
  });
}

// Funkcja switchPositionSidebar, która zmienia pozycję nawigacji bocznej w zależności od jej wysokości

function switchPositionSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  const sidebarList = sidebar?.querySelector("ul");

  if (sidebar && sidebarList) {
    const listHeight = sidebarList.scrollHeight;
    const windowHeight = window.innerHeight;

    if (listHeight > windowHeight - 150) {
      sidebar.style.position = "sticky";
    } else {
      sidebar.style.position = "fixed";
    }
  }
}

function errorFetchFilePage() {
  window.stop(); // Zatrzymuje dalsze ładowanie strony oraz pobieranie zasobu zwracającego błąd 404 lub 500

  document.querySelector("#content").innerHTML = `
  <div class="error-loading-markdown-page">
  <h1>Błąd ładowania strony</h1>
  <img src="../documentation/data/error.jpg" alt="Error Icon">
  <p>Nie udało się załadować strony. Sprawdź, czy link URL jest poprawny.</p>
  `;
  document.title = "Błąd ładowania strony";
}

// document.addEventListener('keydown', function (e) {
//   if (e.ctrlKey && e.key === 'p') {
//     e.preventDefault(); // Zatrzymuje domyślne okno drukowania
//     window.print();     // Wywołuje drukowanie z zastosowaniem stylów
//   }
// });
// document.addEventListener('keydown', function (e) {
//   if (e.ctrlKey && e.key === 's') {
//     e.preventDefault(); // Zatrzymuje domyślne okno zapisywania
//     window.print();     // Wywołuje drukowanie z zastosowaniem stylów
//   }
// });

function brakesColored() {
  const colors = [
    "#61a6ef", // niebieski
    "#7fffff", // cyjan
    "#98c379", // zielony
    "#e5c07b", // żółty
    "#d19a66", // pomarańczowy
    "#e06c75", // czerwony
    "#c678dd", // fioletowy
  ];

  const openBrackets = "([{";
  const closeBrackets = ")]}";

  let codeElements = document.querySelectorAll("code");
  let preCodeElements = document.querySelectorAll("pre code");

  codeElements = [...codeElements, ...preCodeElements];

  codeElements.forEach((block) => {
    const html = block.innerHTML;
    const stack = [];
    let result = "";
    let i = 0;

    while (i < html.length) {
      if (html[i] === "<") {
        // Przepisz cały tag HTML bez zmian
        const tagEnd = html.indexOf(">", i);
        result += html.slice(i, tagEnd + 1);
        i = tagEnd + 1;
        continue;
      }

      const char = html[i];

      if (openBrackets.includes(char)) {
        const level = stack.length % colors.length;
        stack.push(level);
        result += `<span style="color: ${colors[level]}">${char}</span>`;
      } else if (closeBrackets.includes(char)) {
        const level = stack.pop() ?? 0;
        result += `<span style="color: ${colors[level]}">${char}</span>`;
      } else {
        result += char;
      }

      i++;
    }

    block.innerHTML = result;
  });
}

function selectAllCodeContentDoubleClick() {
  document.querySelectorAll("code").forEach((codeEl) => {
    codeEl.addEventListener("dblclick", () => {
      const range = document.createRange();
      range.selectNodeContents(codeEl);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    });
  });
}
