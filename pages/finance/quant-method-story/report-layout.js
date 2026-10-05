const root = document.documentElement;
const contentRoot = document.getElementById("root");
const chapterLinks = [...document.querySelectorAll(".journal-chapters a")];
let frame = 0;
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

function updateActiveChapter() {
  frame = 0;
  const chapters = chapterLinks.map(link => ({
    link,
    element: document.getElementById(link.hash.slice(1)),
  })).filter(chapter => chapter.element);
  if (!chapters.length) return;

  const marker = window.innerHeight * .26;
  let active = chapters[0];
  for (const chapter of chapters) {
    if (chapter.element.getBoundingClientRect().top <= marker) active = chapter;
  }
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  if (maximum - window.scrollY < 4) active = chapters.at(-1);
  for (const chapter of chapters) {
    if (chapter === active) chapter.link.setAttribute("aria-current", "location");
    else chapter.link.removeAttribute("aria-current");
  }
}

function scheduleActiveChapter() {
  if (!frame) frame = requestAnimationFrame(updateActiveChapter);
}

function revealJournal() {
  if (ready || !contentRoot.querySelector(".method-story")) return;
  ready = true;
  syncTheme();
  contentObserver.disconnect();
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ block: "start" });
  }
  scheduleActiveChapter();
}

const contentObserver = new MutationObserver(revealJournal);
contentObserver.observe(contentRoot, { childList: true, subtree: true });
new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ["class"] });
syncTheme();
revealJournal();
window.addEventListener("scroll", scheduleActiveChapter, { passive: true });
window.addEventListener("resize", scheduleActiveChapter);
window.addEventListener("hashchange", scheduleActiveChapter);
new ResizeObserver(scheduleActiveChapter).observe(contentRoot);

for (const link of chapterLinks) {
  link.addEventListener("click", event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.replaceState(history.state, "", link.hash);
    target.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    scheduleActiveChapter();
  });
}
