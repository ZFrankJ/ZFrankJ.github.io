const fallback = document.querySelector("#data-analytics-portable-fallback");
const reader = document.querySelector("#data-analytics-portable-reader");

let layoutObserver = null;
let fallbackTimer = null;

function createReadingLayout(stack, navigation, children, sidebarLabel) {
  const layout = document.createElement("div");
  const sidebar = document.createElement("aside");
  const sticky = document.createElement("div");
  const main = document.createElement("div");

  layout.className = "report-reading-layout reading-layout";
  sidebar.className = "report-reading-sidebar reading-sidebar";
  sidebar.setAttribute("aria-label", sidebarLabel);
  sticky.className = "report-sidebar-sticky reading-sidebar-sticky";
  main.className = "report-reading-main reading-main";

  const catalog = navigation.querySelector("#report-chapter-navigation") || navigation;
  catalog.classList.add("chapter-catalog");
  stack.replaceChildren(layout);
  layout.append(sidebar, main);
  sidebar.append(sticky);
  sticky.append(navigation);
  children.filter((child) => child !== navigation).forEach((child) => main.append(child));
}

function buildFallbackLayout() {
  const stack = fallback?.querySelector(".portable-block-stack");
  if (!stack) return false;
  if (stack.querySelector(":scope > .report-reading-layout")) return true;

  const navigation = stack.querySelector(':scope > [data-artifact-block-id="report-chapter-navigation"]');
  if (!navigation) return false;

  const children = Array.from(stack.children);
  createReadingLayout(stack, navigation, children, "Article navigation");
  return true;
}

function buildReaderLayout() {
  const stack = reader?.querySelector(".report-block-stack");
  if (!stack) return false;
  if (stack.querySelector(":scope > .report-reading-layout")) return true;

  const navigationRow = stack
    .querySelector('[data-artifact-block-id="report-chapter-navigation"]')
    ?.closest(".analytics-layout-row");
  if (!navigationRow) return false;

  const children = Array.from(stack.children);
  createReadingLayout(stack, navigationRow, children, "Article navigation");
  return true;
}

buildFallbackLayout();

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
