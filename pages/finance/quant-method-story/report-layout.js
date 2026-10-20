const root = document.documentElement;
const contentRoot = document.getElementById("root");
let ready = false;

function syncTheme() {
  const light = root.classList.contains("theme-light");
  const theme = light ? "light" : "dark";
  root.dataset.appAppearance = theme;
  root.dataset.colorScheme = theme;
  root.style.colorScheme = theme;
  root.style.setProperty("--lightningcss-light", light ? "initial" : " ");
  root.style.setProperty("--lightningcss-dark", light ? " " : "initial");
  document.querySelector('meta[name="theme-color"]').content = light ? "#fdf8e8" : "#0a1628";
}

function revealJournal() {
  if (ready || !contentRoot.querySelector(".method-story")) return;
  ready = true;
  syncTheme();
  contentObserver.disconnect();
  contentRoot.dispatchEvent(new CustomEvent("reading:ready", { bubbles: true }));
}

const contentObserver = new MutationObserver(revealJournal);
contentObserver.observe(contentRoot, { childList: true, subtree: true });
new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ["class"] });
syncTheme();
revealJournal();
