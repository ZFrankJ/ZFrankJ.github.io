const fallback = document.getElementById("data-analytics-portable-fallback");
const reader = document.getElementById("data-analytics-portable-reader");

// The outer shell, catalog, and title never belong to the replaceable renderer.
function revealReader() {
  if (document.body.classList.contains("report-ready")) return;
  const marker = document.querySelector(".site-topbar")?.getBoundingClientRect().bottom || 80;
  const anchor = [...fallback.querySelectorAll("[data-artifact-block-id]")]
    .find(block => block.getBoundingClientRect().bottom > marker);
  const offset = anchor?.getBoundingClientRect().top;
  const replacement = anchor && reader.querySelector(`[data-artifact-block-id="${anchor.dataset.artifactBlockId}"]`);
  const keepPosition = scrollY > 0 && replacement;

  // Commit visibility, IDs, and the reading position before the browser paints.
  fallback.querySelectorAll("[data-artifact-block-id]").forEach(block => block.removeAttribute("id"));
  fallback.removeAttribute("data-reading-active");
  fallback.setAttribute("aria-hidden", "true");
  fallback.setAttribute("inert", "");
  reader.setAttribute("data-reading-active", "");
  reader.removeAttribute("aria-hidden");
  reader.removeAttribute("inert");
  document.body.classList.add("report-ready");
  if (keepPosition) scrollBy({ top: replacement.getBoundingClientRect().top - offset, behavior: "instant" });
  reader.dispatchEvent(new CustomEvent("reading:ready", { bubbles: true }));
}

reader.addEventListener("reading:enhanced-ready", revealReader, { once: true });
