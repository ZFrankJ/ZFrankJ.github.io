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

const LiquidLens = {
    init(targetSelector = 'body', options = {}) {
        // Allow calling with an options object only: LiquidLens.init({ targetSelector: '#app', inputProvider })
        let selector = targetSelector;
        let opts = options;
        if (typeof targetSelector === 'object' && targetSelector !== null) {
            opts = targetSelector;
            selector = targetSelector.targetSelector || 'body';
        }

        const target = document.querySelector(selector);
        if (!target) {
            console.error(`LiquidLens: Target element '${selector}' not found.`);
            return;
        }

        // 1. Inject SVG Filter
        this.injectSVG();

        // 2. Generate Lens Map (Static Sprite)
        const lensMapUrl = this.createLensMap();
        const feImage = document.getElementById('liquid-lens-map');
        feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', lensMapUrl);

        // 3. Apply CSS to Target
        target.style.filter = 'url(#liquid-lens-filter)';
        target.style.willChange = 'filter';
        if (getComputedStyle(target).backgroundColor === 'rgba(0, 0, 0, 0)') {
            target.style.backgroundColor = '#fff';
        }

        // 4. Start Animation Loop
        this.startAnimation(target, opts);
    },

    injectSVG() {
        const mapSize = 2800;
        const svgHTML = `
            <svg style="position: absolute; width: 0; height: 0; pointer-events: none;">
                <defs>
                    <filter id="liquid-lens-filter" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
                        <!-- preserveAspectRatio="none" allows us to stretch the lens into a wave -->
                        <feImage id="liquid-lens-map" result="lens" xlink:href="" width="${mapSize}" height="${mapSize}" x="0" y="0" preserveAspectRatio="none" />
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
        document.body.insertAdjacentHTML('beforeend', svgHTML);
    },

    createLensMap() {
        const size = 2800;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(128, 128, 128)';
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
                    const red = (-dirX * strength * 127) + 128;
                    const green = (-dirY * strength * 127) + 128;

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

    startAnimation(targetWrapper, options = {}) {
        const feImage = document.getElementById('liquid-lens-map');
        const displacementMap = document.getElementById('liquid-lens-displacement');

        // State
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX = mouseX;
        let currentY = mouseY;
        let lastInputX = mouseX;
        let lastInputY = mouseY;

        // Lens Dimensions
        const baseSize = 2000;
        let currentWidth = baseSize;
        let currentHeight = baseSize;
        let manualZoom = 1;

        // Click Logic
        const scaleHover = 6;
        const scaleClick = -6;
        let targetScale = scaleHover;
        let currentScale = scaleHover;

        // Click Sequence Logic
        let mouseDownTime = 0;
        let isClickSequence = false;
        let clickSequencePhase = 'idle'; // 'going-down', 'going-up', 'idle'
        let externalHold = false;

        // Scroll Logic
        let isScrolling = false;
        let scrollTimer = null;
        const scrollTimeoutMs = options.scrollTimeoutMs || 180;
        const scrollMotionPx = options.scrollMotionPx || 12; // minimum vertical motion to treat as intentional scroll
        let scrollBurst = 0;

        // External input provider (e.g., camera/gesture bridge)
        const getInput = typeof options.inputProvider === 'function' ? options.inputProvider : null;
        const allowPointer = typeof options.allowPointer === 'boolean' ? options.allowPointer : !getInput;

        // Listeners
        if (allowPointer) {
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
        }

        if (allowPointer) {
            document.addEventListener('mousedown', () => {
                targetScale = scaleClick;
                mouseDownTime = Date.now();

                // Interrupt any ongoing sequence
                isClickSequence = false;
                clickSequencePhase = 'idle';
            });
        }

        if (allowPointer) {
            document.addEventListener('mouseup', () => {
                const duration = Date.now() - mouseDownTime;

                // If click was short (< 200ms), force full depth sequence
                if (duration < 200) {
                    isClickSequence = true;
                    clickSequencePhase = 'going-down';
                    targetScale = scaleClick; // Ensure we keep aiming for -6
                } else {
                    // Long hold, just return to hover
                    targetScale = scaleHover;
                    isClickSequence = false;
                    clickSequencePhase = 'idle';
                }
            });
        }

        window.addEventListener('scroll', () => {
            isScrolling = true;
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                isScrolling = false;
            }, scrollTimeoutMs);
        });

        const applyExternalInput = () => {
            if (!getInput) return;
            const data = getInput() || {};

            const nextX = (typeof data.x === 'number' && isFinite(data.x)) ? data.x : mouseX;
            const nextY = (typeof data.y === 'number' && isFinite(data.y)) ? data.y : mouseY;

            const dyPx = Math.abs(nextY - lastInputY);
            const dxPx = Math.abs(nextX - lastInputX);

            mouseX = nextX;
            mouseY = nextY;

            if (typeof data.zoom === 'number' && isFinite(data.zoom)) {
                manualZoom = Math.max(0.4, Math.min(2.5, data.zoom));
            }

            if (data.scroll) {
                const duration = (typeof data.scroll === 'object' && typeof data.scroll.duration === 'number')
                    ? data.scroll.duration
                    : scrollTimeoutMs;

                // Require real motion to avoid false positives when all fingers are open/closed.
                const hasIntentMotion = dyPx > scrollMotionPx || dxPx > (scrollMotionPx * 0.5);
                if (hasIntentMotion) {
                    scrollBurst += 1;
                    if (scrollBurst >= 2) { // need at least two consecutive frames
                        isScrolling = true;
                        clearTimeout(scrollTimer);
                        scrollTimer = setTimeout(() => {
                            isScrolling = false;
                        }, duration);
                        scrollBurst = 0;
                    }
                }
            } else {
                scrollBurst = 0;
            }

            if (data.tap) {
                if (!isClickSequence) {
                    isClickSequence = true;
                    clickSequencePhase = 'going-down';
                    targetScale = scaleClick;
                }
            }

            if (typeof data.hold === 'boolean') {
                externalHold = data.hold;
                if (externalHold) {
                    targetScale = scaleClick;
                    isClickSequence = false;
                    clickSequencePhase = 'idle';
                } else if (!isClickSequence) {
                    targetScale = scaleHover;
                }
            }
            lastInputX = nextX;
            lastInputY = nextY;
        };

        const animate = () => {
            applyExternalInput();

            // 1. Cursor / input tracking (faster reaction)
            const chase = isScrolling ? 0.4 : 0.6;
            currentX += (mouseX - currentX) * chase;
            currentY += (mouseY - currentY) * chase;

            // 2. Scroll Wave Logic (Uniform)
            const waveWidth = Math.max(window.innerWidth * 50, baseSize * 1.25);
            const waveHeight = baseSize * 1.2;

            const userWidth = baseSize * manualZoom;
            const userHeight = baseSize * manualZoom;

            const targetWidth = isScrolling ? waveWidth : userWidth;
            const targetHeight = isScrolling ? waveHeight : userHeight;

            const sizeLerp = isScrolling ? 0.16 : 0.1;
            currentWidth += (targetWidth - currentWidth) * sizeLerp;
            currentHeight += (targetHeight - currentHeight) * sizeLerp;

            // 3. Click & Scroll Scale Logic
            let activeTargetScale = targetScale;
            let interpolationFactor = 0.5; // Faster Symmetric Speed (2x of 0.25)

            if (isScrolling) {
                activeTargetScale = 18;
                interpolationFactor = 0.2;
            } else if (isClickSequence) {
                if (clickSequencePhase === 'going-down') {
                    activeTargetScale = scaleClick; // Aim for -6

                    // Check if we reached full depth
                    if (Math.abs(currentScale - scaleClick) < 0.5) {
                        clickSequencePhase = 'going-up';
                        targetScale = scaleHover; // Now aim for +6
                    }
                } else if (clickSequencePhase === 'going-up') {
                    activeTargetScale = scaleHover; // Aim for +6

                    // Sequence complete when close to hover
                    if (Math.abs(currentScale - scaleHover) < 0.1) {
                        isClickSequence = false;
                        clickSequencePhase = 'idle';
                    }
                }
            } else if (externalHold) {
                activeTargetScale = scaleClick;
                interpolationFactor = 0.35;
            }

            currentScale += (activeTargetScale - currentScale) * interpolationFactor;

            // 4. Update SVG Attributes
            const rect = targetWrapper.getBoundingClientRect();

            const x = currentX - rect.left - (currentWidth / 2);
            const y = currentY - rect.top - (currentHeight / 2);

            feImage.setAttribute('x', x);
            feImage.setAttribute('y', y);
            feImage.setAttribute('width', currentWidth);
            feImage.setAttribute('height', currentHeight);

            displacementMap.setAttribute('scale', currentScale);

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
};
