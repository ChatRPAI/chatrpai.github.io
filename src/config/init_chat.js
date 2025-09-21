// init_chat.js

// 1) Konfiguracja selektorów DOM
const htmlElements = {
  app: "#app",
  chatWrapper: "#chat-wrapper",
  chatContainer: "#chat-container",
  inputArea: "#input-area",
  prompt: "#prompt",
  promptDesc: "#prompt-desc",
  promptError: ".prompt-error",
  promptWarning: ".max-text-length-warning",
  submitButton: 'form#input-area button[type="submit"]',
  burgerToggle: "#burger-toggle",
  webSidePanel: "#web-side-panel",
  settingsToggle: "#settings-toggle",
  settingSidePanel: "#setting-side-panel",
  userNameInput: "#user_name",
};

// 2) „Adaptery” – lekkie moduły wpinane do App

// 2a) User manager jako moduł lifecycle
function UserManagerModule() {
  return {
    init(ctx) {
      if (ctx.userManager && typeof ctx.userManager.init === "function") {
        ctx.userManager.init(ctx.dom);
      }
    },
  };
}

// 2b) Virtual keyboard dock moduł
function VirtualKeyboardDockModule(dom) {
  const vk = new VirtualKeyboardDock(dom);
  return {
    init() { vk.init(); }
  };
}

// 2c) Panels controller moduł (konfiguracja tylko tutaj)
function PanelsControllerModule(dom) {
  const pc = new PanelsController(
    dom,
    [
      { button: dom.burgerToggle,   panel: dom.webSidePanel,     id: "web-side-panel" },
      { button: dom.settingsToggle, panel: dom.settingSidePanel, id: "setting-side-panel" },
    ],
    ["setting-side-panel"]
  );
  return {
    init() { pc.init(); }
  };
}

// 2d) Chat manager moduł (tylko na tej stronie)
function ChatManagerModule(ctx) {
  // ChatManager potrzebuje Context, bo czyta ctx.dom itd.
  const cm = new ChatManager(ctx);
  return {
    init() { cm.init(); }
  };
}

// 2e) Przycisk czyszczenia cache obrazów (feature moduł)
function ClearImageCacheButtonModule() {
  return {
    init(ctx) {
      const wrapper = document.createElement("div");
      wrapper.className = "mt-20";

      const label = document.createElement("label");
      label.className = "text-sm block mb-5";
      label.textContent = "Pamięć obrazów:";

      const btn = ctx.utils.createButton("🧹 Wyczyść pamięć obrazów", () => {
        let cleared = 0;
        // W niektórych przeglądarkach Object.keys(localStorage) nie iteruje jak oczekujesz; użyj klasycznej pętli:
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("img-exists:")) {
            localStorage.removeItem(key);
            cleared++;
          }
        }
        alert(`Wyczyszczono ${cleared} wpisów z pamięci obrazów.`);
      });

      btn.className = "form-element text-base mt-5 w-full button-base";
      wrapper.append(label, btn);
      ctx.dom.settingSidePanel.appendChild(wrapper);
      const hr = document.createElement("hr");
      ctx.dom.settingSidePanel.appendChild(hr);
    }
  };
}
function ratingModeChange(dom) {
  let isRatingMode = AppStorageManager.getWithTTL("ratingMode") === "1";
  const ratingElement = dom.settingSidePanel.querySelector("input[name='ratingMode']");

  // Bezpośrednie ustawienie stanu checkboxa na podstawie wartości w AppStorageManager
  if (ratingElement) {
    ratingElement.checked = isRatingMode;

    // Ustawienie klasy na chatContainer na podstawie stanu
    if (isRatingMode) {
      dom.chatContainer.classList.add("with-rating");
    } else {
      dom.chatContainer.classList.remove("with-rating");
    }

    // Dodanie nasłuchiwania na zdarzenie 'change'
    ratingElement.addEventListener("change", (e) => {
      const checked = e.target.checked;
      isRatingMode = checked ? "1" : "0";
      AppStorageManager.set("ratingMode", isRatingMode);

      if (checked) {
        dom.chatContainer.classList.add("with-rating");
      } else {
        dom.chatContainer.classList.remove("with-rating");
      }
    });
  }
}

function editingModeChange(dom) {
  let isEditingMode = AppStorageManager.getWithTTL("editingMode") === "1";
  const editingElement = dom.settingSidePanel.querySelector("input[name='editingMode']"); 
  // Bezpośrednie ustawienie stanu checkboxa na podstawie wartości w AppStorageManager
  if (editingElement) {
    editingElement.checked = isEditingMode;
    // Ustawienie klasy na chatContainer na podstawie stanu
    if (isEditingMode) {
      dom.chatContainer.classList.add("with-editing");
    } else {
      dom.chatContainer.classList.remove("with-editing");
    }
    // Dodanie nasłuchiwania na zdarzenie 'change'
    editingElement.addEventListener("change", (e) => {
      const checked = e.target.checked;
      isEditingMode = checked ? "1" : "0";
      AppStorageManager.set("editingMode", isEditingMode);
      if (checked) {
        dom.chatContainer.classList.add("with-editing");
      }
      else {
        dom.chatContainer.classList.remove("with-editing");
      }
    });
  }
}

let originalBodyHTML = document.body.innerHTML;
// 3) Start aplikacji
window.addEventListener("load", async () => {
  // a) Dom
  const dom = new Dom();
  dom.init(htmlElements);

  // b) Context – rejestrujesz dokładnie to, czego chcesz użyć (instancje, nie klasy!)
  const context = new Context({
    diagnostics: Diagnostics,
    userManager: UserManager,
    dom,
    utils: Utils,
    backendAPI: BackendAPI,
  });

  // c) Skład modułów (to jest w 100% konfigurowalne per strona)
  const modules = [
    UserManagerModule(),
    VirtualKeyboardDockModule(dom),
    PanelsControllerModule(dom),
    ChatManagerModule(context),       // tylko na stronie czatu
    ClearImageCacheButtonModule(),    // feature
    ratingModeChange(dom),
    editingModeChange(dom),
  ];

  // d) App dostaje Context + listę modułów, i tylko je odpala
  const app = new App(context, modules);

  await app.init();
});
