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
    }
  };
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
  ];

  // d) App dostaje Context + listę modułów, i tylko je odpala
  const app = new App(context, modules);

  await app.init();
});
