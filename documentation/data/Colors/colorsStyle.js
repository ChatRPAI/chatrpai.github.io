// Funkcja do pobierania wartości ciasteczka
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
  
  // Sprawdzenie, czy ciasteczko colorMode istnieje
  let colorMode = getCookie('colorMode');
  let themeSwitcher = document.querySelector('input#theme-switcher');
  if (!colorMode) {
    // Sprawdzenie ustawionego w systemie trybu
    let prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefersDarkMode) {
        // Utworzenie ciasteczka colorMode="dark"
        document.cookie = "colorMode=dark; path=/; max-age=31536000"; // Ciasteczko ważne przez rok
    }else{
        // Utworzenie ciasteczka colorMode="light"
        document.cookie = "colorMode=light; path=/; max-age=31536000"; // Ciasteczko ważne przez rok
    }
  }
  
  // Funkcja zmieniająca tryb kolorów
  function setColorMode() {
    // Sprawdzenie, czy ciasteczko colorMode istnieje
    colorMode = getCookie('colorMode');
  
    if (colorMode === 'dark') {
      // Ładowanie ciemnego motywu
      let link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../documentation/data/Colors/darkMode.css';
      document.head.appendChild(link);
    themeSwitcher.checked = true; // Ustawienie przełącznika na ciemny motyw
  } else {
      // Ładowanie jasnego motywu
      let link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../documentation/data/Colors/lightMode.css';
      document.head.appendChild(link);
      themeSwitcher.checked = false; // Ustawienie przełącznika na jasny motyw
  }

  }
  setColorMode();

  function changeColorMode(){
    // Zmiana trybu kolorów
    if (colorMode === 'dark') {
      // Zmiana na jasny motyw
      document.cookie = "colorMode=light; path=/; max-age=31536000"; // Ciasteczko ważne przez rok
      location.reload();
    } else {
      // Zmiana na ciemny motyw
      document.cookie = "colorMode=dark; path=/; max-age=31536000"; // Ciasteczko ważne przez rok
      location.reload();
    }
  }

  themeSwitcher.addEventListener('change', changeColorMode);


  