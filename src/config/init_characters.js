// init_chat.js

// 1) Konfiguracja selektorów DOM
const htmlElements = {
  app: "#app",
  burgerToggle: "#burger-toggle",
  webSidePanel: "#web-side-panel",
};



// 2c) Panels controller moduł (konfiguracja tylko tutaj)
function PanelsControllerModule(dom) {
  const pc = new PanelsController(
    dom,
    [
      { button: dom.burgerToggle,   panel: dom.webSidePanel,     id: "web-side-panel" },
    ],
    []
  );
  return {
    init() { pc.init(); }
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
    dom,
    utils: Utils,
    backendAPI: BackendAPI,
  });

  // c) Skład modułów (to jest w 100% konfigurowalne per strona)
  const modules = [
    PanelsControllerModule(dom),
  ];

  // d) App dostaje Context + listę modułów, i tylko je odpala
  const app = new App(context, modules);

  await app.init();
});
