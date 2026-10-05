(() => {
  const favicon = document.getElementById("site-favicon");
  const script = document.currentScript;
  if (!favicon || !script) return;

  favicon.dataset.light = new URL("../icons/paper-plane-day.svg", script.src).href;
  favicon.dataset.dark = new URL("../icons/paper-plane-night.svg", script.src).href;

  const systemQuery = window.matchMedia?.("(prefers-color-scheme: light)");

  function getThemeMode() {
    let mode = window.__fzThemeMode;
    if (!mode) {
      try {
        mode = localStorage.getItem("fz-theme");
      } catch {
        // A blocked preference store should not prevent the favicon from loading.
      }
    }
    return mode === "light" || mode === "dark" ? mode : "system";
  }

  function updateFavicon() {
    const mode = getThemeMode();
    const isLight = mode === "light" || (mode === "system" && systemQuery?.matches);
    favicon.href = favicon.dataset[isLight ? "light" : "dark"];
  }

  // Apply the saved choice in the head, before the main module initializes.
  updateFavicon();
  systemQuery?.addEventListener("change", () => {
    if (getThemeMode() === "system") updateFavicon();
  });
})();
