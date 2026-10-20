// Shared catalog behavior. The catalog and layout themselves are present in HTML.
export function initReadingLayout(reading) {
  const catalog = reading.querySelector("[data-reading-catalog]");
  const content = reading.querySelector("[data-reading-content]");
  const links = [...catalog.querySelectorAll('a[href^="#"]')];
  let frame = 0;
  let preferredHash = location.hash;
  let landedTarget = null;

  function targetForHash(hash) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
    const active = content.querySelector("[data-reading-active]") || content;
    return id ? active.querySelector(`[id="${CSS.escape(id)}"]`) : null;
  }

  function setActive(hash) {
    for (const link of links) {
      if (link.hash === hash) {
        link.setAttribute("aria-current", "location");
        if (catalog.scrollHeight > catalog.clientHeight) {
          const box = catalog.getBoundingClientRect(), item = link.getBoundingClientRect();
          if (item.top < box.top + 8) catalog.scrollTop += item.top - box.top - 8;
          else if (item.bottom > box.bottom - 8) catalog.scrollTop += item.bottom - box.bottom + 8;
        }
      }
      else link.removeAttribute("aria-current");
    }
  }

  function land(hash, smooth = false) {
    const target = targetForHash(hash);
    if (!target) return false;
    landedTarget = target;
    if (smooth) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "start", behavior: smooth && !reduceMotion ? "smooth" : "instant" });
    setActive(hash);
    return true;
  }

  function sync() {
    frame = 0;
    if (preferredHash) {
      const target = targetForHash(preferredHash);
      if (target && target !== landedTarget) land(preferredHash);
      if (target) { setActive(preferredHash); return; }
    }
    const chapters = links.map(link => ({ link, target: targetForHash(link.hash) })).filter(chapter => chapter.target);
    if (!chapters.length) return;
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const marker = (document.querySelector(".site-topbar")?.getBoundingClientRect().bottom || 80) + 24;
    const thresholds = chapters.map(chapter => Math.min(maximum, Math.max(0, scrollY + chapter.target.getBoundingClientRect().top - marker)));
    // Keep short chapters at the end independently selectable.
    const interval = Math.min(160, Math.max(96, innerHeight * .12), thresholds.at(-1) / Math.max(1, chapters.length - 1));
    for (let index = thresholds.length - 2; index >= 0; index--) {
      thresholds[index] = Math.max(0, Math.min(thresholds[index], thresholds[index + 1] - interval));
    }
    let active = 0;
    for (let index = 1; index < chapters.length; index++) if (scrollY + .5 >= thresholds[index]) active = index;
    if (maximum > 0 && maximum - scrollY < 4) active = chapters.length - 1;
    setActive(chapters[active].link.hash);
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(sync); }
  function clearPreferred() { preferredHash = ""; landedTarget = null; schedule(); }
  catalog.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    preferredHash = link.hash;
    history.pushState(null, "", link.hash);
    land(link.hash, true);
    schedule();
  });
  window.addEventListener("hashchange", () => { preferredHash = location.hash; landedTarget = null; schedule(); });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("wheel", clearPreferred, { passive: true });
  window.addEventListener("touchstart", clearPreferred, { passive: true });
  window.addEventListener("keydown", event => {
    if (event.target.closest?.("input,textarea,select,[contenteditable=true]")) return;
    if (["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "].includes(event.key)) clearPreferred();
  });
  reading.addEventListener("reading:ready", schedule);
  new MutationObserver(schedule).observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-reading-active"] });
  new ResizeObserver(schedule).observe(content);
  schedule();
}

document.querySelectorAll("[data-reading]").forEach(initReadingLayout);
