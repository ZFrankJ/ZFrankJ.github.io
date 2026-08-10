const backRow = document.querySelector(".report-site-back-row");
const fallback = document.querySelector("#data-analytics-portable-fallback");
const reader = document.querySelector("#data-analytics-portable-reader");

function placeBackRowInFallback() {
  const header = fallback?.querySelector(".portable-page-header");
  if (!backRow || !header) return;
  header.insertAdjacentElement("afterend", backRow);
  backRow.classList.add("is-placed");
}

function placeBackRowInReader() {
  const cover = reader
    ?.querySelector('[data-artifact-block-id^="01-from-scripts"]')
    ?.closest(".analytics-layout-row");
  if (!backRow || !cover) return false;
  cover.insertAdjacentElement("afterend", backRow);
  backRow.classList.add("is-placed");
  return true;
}

function buildReaderLayout() {
  if (!window.matchMedia("(min-width: 761px)").matches) return true;

  const stack = reader?.querySelector(".report-block-stack");
  if (!stack) return false;
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

function syncReaderLayout() {
  if (!placeBackRowInReader()) return false;
  return buildReaderLayout();
}

placeBackRowInFallback();

if (!syncReaderLayout() && reader) {
  const observer = new MutationObserver(() => {
    if (!syncReaderLayout()) return;
    observer.disconnect();
  });
  observer.observe(reader, { childList: true, subtree: true });
}

window.addEventListener("data-analytics-portable-reader-ready", syncReaderLayout, { once: true });
document.addEventListener("data-analytics-portable-reader-ready", syncReaderLayout, { once: true });
