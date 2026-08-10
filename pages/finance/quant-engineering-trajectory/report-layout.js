const fallback = document.querySelector("#data-analytics-portable-fallback");
const reader = document.querySelector("#data-analytics-portable-reader");

let layoutObserver = null;
let fallbackTimer = null;

function buildReaderLayout() {
  const stack = reader?.querySelector(".report-block-stack");
  if (!stack) return false;
  if (!window.matchMedia("(min-width: 761px)").matches) return true;
  if (stack.querySelector(":scope > .report-reading-layout")) return true;

  const navigationRow = stack
    .querySelector('[data-artifact-block-id="report-chapter-navigation"]')
    ?.closest(".analytics-layout-row");
  if (!navigationRow) return false;

  const children = Array.from(stack.children);
  const layout = document.createElement("div");
  const sidebar = document.createElement("aside");
  const main = document.createElement("div");

  layout.className = "report-reading-layout";
  sidebar.className = "report-reading-sidebar";
  sidebar.setAttribute("aria-label", "Article navigation");
  main.className = "report-reading-main";

  stack.replaceChildren(layout);
  layout.append(sidebar, main);
  sidebar.append(navigationRow);
  children.filter((child) => child !== navigationRow).forEach((child) => main.append(child));
  return true;
}

function revealReaderWhenReady() {
  if (reader?.getAttribute("aria-hidden") === "true") return false;
  if (!buildReaderLayout()) return false;

  clearTimeout(fallbackTimer);
  document.body.classList.add("report-ready");
  layoutObserver?.disconnect();
  layoutObserver = null;
  return true;
}

if (!revealReaderWhenReady() && reader) {
  layoutObserver = new MutationObserver(revealReaderWhenReady);
  layoutObserver.observe(reader, { attributes: true, childList: true, subtree: true });
}

window.addEventListener("data-analytics-portable-reader-ready", revealReaderWhenReady, { once: true });
document.addEventListener("data-analytics-portable-reader-ready", revealReaderWhenReady, { once: true });

fallbackTimer = window.setTimeout(() => {
  if (document.body.classList.contains("report-ready")) return;
  fallback?.classList.remove("portable-enhanced-hidden");
  document.body.classList.add("report-fallback-ready");
  layoutObserver?.disconnect();
  layoutObserver = null;
}, 5000);
