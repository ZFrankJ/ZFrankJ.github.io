/**
 * Liquid Lens UI Effect
 *
 * A reusable component that applies a subtle, full-screen liquid distortion effect.
 * Features:
 * - Instant, smooth mouse tracking.
 * - Click Reaction: Symmetric (+6 Hover <-> -6 Click).
 * - Full Depth Click: Short clicks force full -6 depth before returning.
 * - Scroll Wave: Massive Uniform Wave Front (50x width, 15x scale).
 */

export const LiquidLens = {
  active: false,
  target: null,
  svgNode: null,
  cleanup: null,
  frameId: null,
  scrollTimer: null,
  targetSelector: "body",

  init(targetSelector = "body") {
    let target = document.querySelector(targetSelector);
    if (!target && targetSelector !== "body") {
      target = document.documentElement;
    }
    if (!target) {
      console.error(`LiquidLens: Target element '${targetSelector}' not found.`);
      return;
    }

    if (this.active) {
      this.destroy();
    }

    this.targetSelector = targetSelector;
    this.target = target;

    // 1. Inject SVG Filter
    this.injectSVG();

    // 2. Generate Lens Map (Static Sprite)
    const lensMapUrl = this.createLensMap();
    const feImage = document.getElementById("liquid-lens-map");
    if (!feImage) {
      console.error("LiquidLens: Missing feImage node.");
      return;
    }
    feImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", lensMapUrl);

    // 3. Apply CSS to Target
    target.style.filter = "url(#liquid-lens-filter)";
    target.style.willChange = "filter";
    if (getComputedStyle(target).backgroundColor === "rgba(0, 0, 0, 0)") {
      target.style.backgroundColor = "#fff";
    }

    // 4. Start Animation Loop
    this.startAnimation(target);
    this.active = true;
  },

  injectSVG() {
    if (document.getElementById("liquid-lens-filter")) {
      // Reuse existing filter if present
      this.svgNode = document.getElementById("liquid-lens-filter").closest("svg");
      return;
    }

    const svgHTML = `
      <svg style="position: absolute; width: 0; height: 0; pointer-events: none;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <filter id="liquid-lens-filter" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
            <!-- preserveAspectRatio="none" allows us to stretch the lens into a wave -->
            <feImage id="liquid-lens-map" result="lens" xlink:href="" width="2000" height="2000" x="0" y="0" preserveAspectRatio="none" />
            <feDisplacementMap
              id="liquid-lens-displacement"
              in="SourceGraphic"
              in2="lens"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    `;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = svgHTML.trim();
    this.svgNode = wrapper.firstElementChild;
    document.body.appendChild(this.svgNode);
  },

  createLensMap() {
    const size = 2000;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(128, 128, 128)";
    ctx.fillRect(0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    const center = size / 2;
    const radius = size / 2;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const t = dist / radius;
          // Smooth Cosine Falloff
          const strength = 0.5 * (1 + Math.cos(t * Math.PI));

          const dirX = dx / (dist || 1);
          const dirY = dy / (dist || 1);

          // Invert direction for magnification (Convex base state)
          const red = -dirX * strength * 127 + 128;
          const green = -dirY * strength * 127 + 128;

          const index = (y * size + x) * 4;
          data[index] = red;
          data[index + 1] = green;
          data[index + 2] = 128;
          data[index + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  },

  startAnimation(targetWrapper) {
    const feImage = document.getElementById("liquid-lens-map");
    const displacementMap = document.getElementById("liquid-lens-displacement");
    if (!feImage || !displacementMap) {
      console.error("LiquidLens: filter parts missing.");
      return;
    }

    // State
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    // Lens Dimensions
    const baseSize = Math.max(window.innerWidth * 3, window.innerHeight * 3, 2400);
    let currentWidth = baseSize;
    let currentHeight = baseSize;

    // Click Logic
    const scaleHover = 6;
    const scaleClick = -6;
    let targetScale = scaleHover;
    let currentScale = scaleHover;

    // Click Sequence Logic
    let mouseDownTime = 0;
    let isClickSequence = false;
    let clickSequencePhase = "idle"; // 'going-down', 'going-up', 'idle'

    // Scroll Logic
    let isScrolling = false;
    this.scrollTimer = null;

    const listeners = [];
    const addListener = (el, evt, handler, opts) => {
      el.addEventListener(evt, handler, opts);
      listeners.push([el, evt, handler, opts]);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseDown = () => {
      targetScale = scaleClick;
      mouseDownTime = Date.now();

      // Interrupt any ongoing sequence
      isClickSequence = false;
      clickSequencePhase = "idle";
    };

    const handleMouseUp = () => {
      const duration = Date.now() - mouseDownTime;

      // If click was short (< 200ms), force full depth sequence
      if (duration < 200) {
        isClickSequence = true;
        clickSequencePhase = "going-down";
        targetScale = scaleClick; // Ensure we keep aiming for -6
      } else {
        // Long hold, just return to hover
        targetScale = scaleHover;
        isClickSequence = false;
        clickSequencePhase = "idle";
      }
    };

    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    addListener(document, "mousemove", handleMouseMove);
    addListener(document, "mousedown", handleMouseDown);
    addListener(document, "mouseup", handleMouseUp);
    addListener(window, "scroll", handleScroll);

    const animate = () => {
      // 1. Mouse Tracking (Instant/Fast)
      currentX += (mouseX - currentX) * 0.6;
      currentY += (mouseY - currentY) * 0.6;

      // 2. Scroll Wave Logic (Uniform)
      const waveWidth = Math.max(window.innerWidth * 50, baseSize * 1.2);
      const waveHeight = baseSize * 1.2;

      const targetWidth = isScrolling ? waveWidth : baseSize;
      const targetHeight = isScrolling ? waveHeight : baseSize;

      currentWidth += (targetWidth - currentWidth) * 0.1;
      currentHeight += (targetHeight - currentHeight) * 0.1;

      // 3. Click & Scroll Scale Logic
      let activeTargetScale = targetScale;
      let interpolationFactor = 0.5; // Faster Symmetric Speed (2x of 0.25)

      if (isScrolling) {
        activeTargetScale = 15;
        interpolationFactor = 0.15;
      } else if (isClickSequence) {
        if (clickSequencePhase === "going-down") {
          activeTargetScale = scaleClick; // Aim for -6

          // Check if we reached full depth
          if (Math.abs(currentScale - scaleClick) < 0.5) {
            clickSequencePhase = "going-up";
            targetScale = scaleHover; // Now aim for +6
          }
        } else if (clickSequencePhase === "going-up") {
          activeTargetScale = scaleHover; // Aim for +6

          // Sequence complete when close to hover
          if (Math.abs(currentScale - scaleHover) < 0.1) {
            isClickSequence = false;
            clickSequencePhase = "idle";
          }
        }
      }

      currentScale += (activeTargetScale - currentScale) * interpolationFactor;

      // 4. Update SVG Attributes
      const rect = targetWrapper.getBoundingClientRect();

      let finalX = currentX;
      if (isScrolling) {
        finalX = window.innerWidth / 2;
      }

      const x = finalX - rect.left - currentWidth / 2;
      const y = currentY - rect.top - currentHeight / 2;

      feImage.setAttribute("x", x);
      feImage.setAttribute("y", y);
      feImage.setAttribute("width", currentWidth);
      feImage.setAttribute("height", currentHeight);

      displacementMap.setAttribute("scale", currentScale);

      this.frameId = requestAnimationFrame(animate);
    };

    this.frameId = requestAnimationFrame(animate);

    this.cleanup = () => {
      listeners.forEach(([el, evt, handler, opts]) => el.removeEventListener(evt, handler, opts));
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
      clearTimeout(this.scrollTimer);
    };
  },

  destroy() {
    if (!this.active) return;
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    if (this.target) {
      this.target.style.filter = "";
      this.target.style.willChange = "";
    }
    if (this.svgNode?.parentNode) {
      this.svgNode.parentNode.removeChild(this.svgNode);
    }
    this.svgNode = null;
    this.target = null;
    this.active = false;
  },

  toggle(targetSelector = "body") {
    if (this.active) {
      this.destroy();
      return false;
    }
    this.init(targetSelector);
    return true;
  }
};
