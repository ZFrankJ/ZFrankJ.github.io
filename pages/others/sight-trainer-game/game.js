const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const radarCanvas = document.getElementById("radar-canvas");
const radarCtx = radarCanvas.getContext("2d");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const sessionSelect = document.getElementById("session-seconds");
const difficultySelect = document.getElementById("difficulty-mode");
const distanceBreakToggle = document.getElementById("distance-breaks");

const totalDoneEl = document.getElementById("total-done-value");
const perMinuteEl = document.getElementById("per-minute-value");
const reactionEl = document.getElementById("reaction-value");
const accuracyEl = document.getElementById("accuracy-value");
const timeEl = document.getElementById("time-value");
const statusEl = document.getElementById("status-text");

const GAP_DIRECTIONS = ["up", "right", "down", "left"];
const SIZE_LEVELS = [10, 13, 16, 20, 25, 31, 37];
const TARGET_TOP_PADDING = 92;
const OVERLAY_Y_SHIFT = 40;
const RADAR_GOALS = {
  perMinute: 40,
  reactionSlow: 2.2,
  reactionFast: 0.25,
};
const METRIC_RECORD_STORAGE_KEY = "focus_sprint_metric_records_v1";
const BASE_PROFILE = {
  speed: 1,
  ttl: 1.8,
  contrasts: [1, 0.78, 0.6],
  levelRamp: 0.12,
};
const DIFFICULTY = {
  easy: { sizeScale: 1 },
  hard: { sizeScale: 0.5 },
  extreme: { sizeScale: 0.25 },
};

const state = {
  mode: "menu",
  hits: 0,
  misses: 0,
  responses: 0,
  reactionTotal: 0,
  elapsed: 0,
  level: 1,
  sessionSeconds: 120,
  difficulty: "extreme",
  target: null,
  spawnTimer: 0,
  message: "Press Start to begin.",
  messageTimer: 0,
  breakEnabled: false,
  breakEvery: 40,
  nextBreakAt: 40,
  breakTimer: 0,
  sessionComment: "",
};

function createEmptyRecord() {
  return {
    total: 0,
    perMinute: 0,
    reaction: null,
    accuracy: 0,
  };
}

function loadMetricRecords() {
  try {
    const raw = localStorage.getItem(METRIC_RECORD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function saveMetricRecords(records) {
  try {
    localStorage.setItem(METRIC_RECORD_STORAGE_KEY, JSON.stringify(records));
  } catch (_err) {
    // Ignore storage errors so private browsing does not affect gameplay.
  }
}

function recordKey() {
  return state.difficulty + "-" + state.sessionSeconds;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function themeValue(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function themeNumber(name, fallback) {
  const value = Number(themeValue(name, ""));
  return Number.isFinite(value) ? value : fallback;
}

function setMessage(text, duration = 1.5) {
  state.message = text;
  state.messageTimer = duration;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(rest).padStart(2, "0");
}

function accuracy() {
  const total = state.hits + state.misses;
  return total === 0 ? 0 : (state.hits / total) * 100;
}

function averageReaction() {
  return state.responses === 0 ? null : state.reactionTotal / state.responses;
}

function donePerMinute() {
  const elapsedMinutes = Math.max(1 / 60, Math.min(state.elapsed, state.sessionSeconds) / 60);
  return state.hits / elapsedMinutes;
}

function currentMetrics() {
  return {
    total: state.hits,
    perMinute: donePerMinute(),
    reaction: averageReaction(),
    accuracy: accuracy(),
  };
}

function formatMetrics(prefix, metrics) {
  return (
    prefix +
    " Total " +
    metrics.total +
    " | Avg/min " +
    metrics.perMinute.toFixed(1) +
    " | Reaction " +
    (metrics.reaction === null ? "--" : metrics.reaction.toFixed(2) + "s") +
    " | Accuracy " +
    Math.round(metrics.accuracy) +
    "%"
  );
}

function updateBestRecord(metrics) {
  const records = loadMetricRecords();
  const key = recordKey();
  const previous = Object.assign(createEmptyRecord(), records[key] || {});
  const next = {
    total: Math.max(previous.total || 0, metrics.total),
    perMinute: Math.max(previous.perMinute || 0, metrics.perMinute),
    reaction:
      metrics.reaction === null
        ? previous.reaction
        : previous.reaction === null || previous.reaction === undefined
          ? metrics.reaction
          : Math.min(previous.reaction, metrics.reaction),
    accuracy: Math.max(previous.accuracy || 0, metrics.accuracy),
  };
  records[key] = next;
  saveMetricRecords(records);
  return next;
}

function difficultyConfig() {
  return DIFFICULTY[state.difficulty] || DIFFICULTY.hard;
}

function resetState() {
  state.mode = "menu";
  state.hits = 0;
  state.misses = 0;
  state.responses = 0;
  state.reactionTotal = 0;
  state.elapsed = 0;
  state.level = 1;
  state.sessionSeconds = Number(sessionSelect.value || 120);
  state.difficulty = String(difficultySelect.value || "extreme");
  state.target = null;
  state.spawnTimer = 0;
  state.message = "Press Start to begin.";
  state.messageTimer = 0;
  state.breakEnabled = Boolean(distanceBreakToggle.checked);
  state.nextBreakAt = state.breakEvery;
  state.breakTimer = 0;
  state.sessionComment = "";
}

function startGame() {
  resetState();
  state.mode = "running";
  state.spawnTimer = 0.2;
  setMessage("Track the E direction and answer quickly.", 2.2);
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }
}

function spawnTarget() {
  const cfg = difficultyConfig();
  const levelScale = 1 + (state.level - 1) * BASE_PROFILE.levelRamp;
  const sizeShift = Math.min(2, Math.floor((state.level - 1) / 3));
  const sizePool = SIZE_LEVELS.slice(0, Math.max(3, SIZE_LEVELS.length - sizeShift));
  const easyRadius = choose(sizePool);
  const radius = Math.max(3, Math.round(easyRadius * cfg.sizeScale));
  const margin = radius + 20;
  const minY = radius + TARGET_TOP_PADDING;
  const maxY = canvas.height - radius;

  const baseSpeedX = randomRange(75, 130) * BASE_PROFILE.speed * levelScale;
  const baseSpeedY = randomRange(68, 122) * BASE_PROFILE.speed * levelScale;
  const ttl = Math.max(0.7, BASE_PROFILE.ttl - (state.level - 1) * 0.06);

  state.target = {
    x: randomRange(margin, canvas.width - margin),
    y: randomRange(Math.min(minY, maxY), maxY),
    r: radius,
    gapDir: choose(GAP_DIRECTIONS),
    contrast: choose(BASE_PROFILE.contrasts),
    ttl,
    maxTtl: ttl,
    vx: baseSpeedX * (Math.random() < 0.5 ? -1 : 1),
    vy: baseSpeedY * (Math.random() < 0.5 ? -1 : 1),
    wobbleAmp: randomRange(8, 18),
    wobbleFreq: randomRange(1.6, 2.6),
    wobblePhase: randomRange(0, Math.PI * 2),
    age: 0,
  };
}

function onCorrect(reactionSec) {
  state.responses += 1;
  state.reactionTotal += reactionSec;
  state.hits += 1;
  setMessage("Done in " + reactionSec.toFixed(2) + "s", 0.85);
  state.target = null;
  state.spawnTimer = 0.12;
}

function onMistake(message, reactionSec = null) {
  if (reactionSec !== null) {
    state.responses += 1;
    state.reactionTotal += reactionSec;
  }
  state.misses += 1;
  state.target = null;
  state.spawnTimer = 0.26;
  setMessage(message, 1.1);
}

function finishSession(prefix) {
  state.mode = "done";
  state.target = null;
  const metrics = currentMetrics();
  const best = updateBestRecord(metrics);
  state.sessionComment = formatMetrics("Best", best);
  setMessage(prefix + " " + formatMetrics("Current", metrics), 999);
}

function handleDirectionInput(direction) {
  if (state.mode !== "running" || !state.target) {
    return;
  }
  const reactionSec = state.target.maxTtl - state.target.ttl;
  if (state.target.gapDir === direction) {
    onCorrect(reactionSec);
  } else {
    onMistake("Wrong direction.", reactionSec);
  }
}

function togglePause() {
  if (state.mode === "running") {
    state.mode = "paused";
    setMessage("Paused.", 999);
  } else if (state.mode === "paused") {
    state.mode = "running";
    setMessage("Back in rhythm.", 0.8);
  }
}

function updateTarget(dt) {
  if (!state.target) {
    return;
  }

  const t = state.target;
  t.age += dt;
  t.wobblePhase += dt * t.wobbleFreq;
  t.x += t.vx * dt + Math.sin(t.wobblePhase) * t.wobbleAmp * dt;
  t.y += t.vy * dt + Math.cos(t.wobblePhase * 0.9) * t.wobbleAmp * dt;

  if (t.x <= t.r || t.x >= canvas.width - t.r) {
    t.vx *= -1;
    t.x = Math.max(t.r, Math.min(canvas.width - t.r, t.x));
  }
  const minY = t.r + TARGET_TOP_PADDING;
  const maxY = canvas.height - t.r;
  if (t.y <= minY || t.y >= maxY) {
    t.vy *= -1;
    t.y = Math.max(minY, Math.min(maxY, t.y));
  }

  t.ttl -= dt;
  if (t.ttl <= 0) {
    onMistake("Too slow.");
  }
}

function updateRunning(dt) {
  state.elapsed += dt;

  if (state.elapsed >= state.sessionSeconds) {
    finishSession("Session complete.");
    return;
  }

  state.level = Math.min(9, 1 + Math.floor(state.elapsed / 24));

  if (state.breakEnabled && state.elapsed >= state.nextBreakAt) {
    state.mode = "break";
    state.breakTimer = 20;
    state.nextBreakAt += state.breakEvery;
    setMessage("Look into real distance for 20 seconds.", 999);
    return;
  }

  state.spawnTimer -= dt;
  if (!state.target && state.spawnTimer <= 0) {
    spawnTarget();
  }

  updateTarget(dt);
}

function updateBreak(dt) {
  state.breakTimer -= dt;
  if (state.breakTimer <= 0) {
    state.mode = "running";
    state.breakTimer = 0;
    setMessage("Distance break complete.", 1.1);
  }
}

function update(dt) {
  if (state.messageTimer > 0 && state.messageTimer < 998) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0 && state.mode === "running") {
      state.message = "";
    }
  }

  if (state.mode === "running") {
    updateRunning(dt);
  } else if (state.mode === "break") {
    updateBreak(dt);
  }
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, themeValue("--canvas-top", "#f8f7f4"));
  g.addColorStop(1, themeValue("--canvas-bottom", "#efede8"));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = themeValue("--canvas-grid", "rgba(0, 0, 0, 0.055)");
  ctx.lineWidth = 1;
  const grid = 34;
  for (let x = 0; x <= canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function directionAngle(direction) {
  if (direction === "up") {
    return -Math.PI / 2;
  }
  if (direction === "right") {
    return 0;
  }
  if (direction === "down") {
    return Math.PI / 2;
  }
  return Math.PI;
}

function drawTarget(target) {
  const base = themeNumber("--target-base", 29);
  const range = themeNumber("--target-range", 160);
  const shade = Math.max(0, Math.min(255, Math.round(base + (1 - target.contrast) * range)));
  const alphaIn = Math.min(1, target.age / 0.2);
  const alphaOut = Math.min(1, target.ttl / (target.maxTtl * 0.34));
  const alpha = Math.max(0, Math.min(1, alphaIn * alphaOut));
  const color = "rgba(" + shade + "," + shade + "," + shade + "," + alpha.toFixed(3) + ")";
  const size = target.r * 2;
  const unit = Math.max(1, size * 0.18);
  const leftX = -size * 0.36;
  const topY = -size * 0.5;
  const midY = -unit * 0.5;
  const bottomY = size * 0.5;
  const bottomBarY = bottomY - unit;
  const stemRightX = leftX + unit;
  const longRightX = leftX + size * 0.72;
  const midRightX = leftX + size * 0.62;

  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.rotate(directionAngle(target.gapDir));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(leftX, topY);
  ctx.lineTo(longRightX, topY);
  ctx.lineTo(longRightX, topY + unit);
  ctx.lineTo(stemRightX, topY + unit);
  ctx.lineTo(stemRightX, midY);
  ctx.lineTo(midRightX, midY);
  ctx.lineTo(midRightX, midY + unit);
  ctx.lineTo(stemRightX, midY + unit);
  ctx.lineTo(stemRightX, bottomBarY);
  ctx.lineTo(longRightX, bottomBarY);
  ctx.lineTo(longRightX, bottomY);
  ctx.lineTo(leftX, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCenteredOverlay(title, line1, line2 = "") {
  ctx.fillStyle = themeValue("--overlay-bg", "rgba(255, 255, 255, 0.75)");
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const baseY = canvas.height / 2 + OVERLAY_Y_SHIFT;

  ctx.textAlign = "center";
  ctx.fillStyle = themeValue("--overlay-title", "#20201d");
  ctx.font = "600 50px Optima";
  ctx.fillText(title, canvas.width / 2, baseY - 44);
  ctx.fillStyle = themeValue("--overlay-text", "#434238");
  ctx.font = "26px Optima";
  ctx.fillText(line1, canvas.width / 2, baseY + 4);
  if (line2) {
    ctx.fillText(line2, canvas.width / 2, baseY + 44);
  }
  if (state.mode === "done" && state.sessionComment) {
    ctx.font = "20px Optima";
    ctx.fillStyle = themeValue("--overlay-text", "#55534a");
    ctx.fillText(state.sessionComment, canvas.width / 2, baseY + 78);
  }
  ctx.textAlign = "left";
}

function drawRadar() {
  const width = radarCanvas.width;
  const height = radarCanvas.height;
  const cx = width / 2;
  const cy = height / 2 + 18;
  const radius = Math.min(width, height) * 0.25;
  const labels = ["Speed", "Reaction", "Accuracy"];
  const axisCount = labels.length;
  const avgReaction = averageReaction();
  const speedScore =
    avgReaction === null
      ? 0
      : clamp01((RADAR_GOALS.reactionSlow - avgReaction) / (RADAR_GOALS.reactionSlow - RADAR_GOALS.reactionFast));
  const values = [
    clamp01(donePerMinute() / RADAR_GOALS.perMinute),
    speedScore,
    clamp01(accuracy() / 100),
  ];

  radarCtx.clearRect(0, 0, width, height);
  radarCtx.lineWidth = 1;
  radarCtx.textAlign = "center";
  radarCtx.textBaseline = "middle";
  radarCtx.fillStyle = themeValue("--muted", "#71695f");
  radarCtx.font = "14px Optima";
  radarCtx.fillText("Performance", cx, 22);

  for (let ring = 1; ring <= 3; ring += 1) {
    const r = (radius * ring) / 3;
    radarCtx.beginPath();
    for (let i = 0; i < axisCount; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / axisCount;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) {
        radarCtx.moveTo(x, y);
      } else {
        radarCtx.lineTo(x, y);
      }
    }
    radarCtx.closePath();
    radarCtx.strokeStyle = themeValue("--line", "#d7cec1");
    radarCtx.stroke();
  }

  for (let i = 0; i < axisCount; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / axisCount;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    radarCtx.strokeStyle = themeValue("--line", "#d7cec1");
    radarCtx.stroke();

    radarCtx.fillStyle = themeValue("--muted", "#71695f");
    radarCtx.font = "12px Optima";
    radarCtx.fillText(labels[i], cx + Math.cos(angle) * (radius + 22), cy + Math.sin(angle) * (radius + 18));
  }

  radarCtx.beginPath();
  for (let i = 0; i < values.length; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / values.length;
    const r = radius * values[i];
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      radarCtx.moveTo(x, y);
    } else {
      radarCtx.lineTo(x, y);
    }
  }
  radarCtx.closePath();
  radarCtx.fillStyle = "rgba(96, 125, 101, 0.26)";
  radarCtx.strokeStyle = themeValue("--accent", "#607d65");
  radarCtx.lineWidth = 2;
  radarCtx.fill();
  radarCtx.stroke();
}

function render() {
  drawBackground();

  if (state.target) {
    drawTarget(state.target);
  }

  if (state.mode === "menu") {
    drawCenteredOverlay("Focus Sprint Neo", "Press Start", "Match the E direction.");
  } else if (state.mode === "paused") {
    drawCenteredOverlay("Paused", "Press P to continue");
  } else if (state.mode === "break") {
    drawCenteredOverlay("Distance Break", "Look 20 feet away", Math.ceil(state.breakTimer) + "s");
  } else if (state.mode === "done") {
    drawCenteredOverlay(
      "Time Complete",
      "Total " + state.hits + "  Avg/min " + donePerMinute().toFixed(1),
      "Reaction " + (averageReaction() === null ? "--" : averageReaction().toFixed(2) + "s") + "  Accuracy " + Math.round(accuracy()) + "%"
    );
  }

  const timeLeft = Math.max(0, Math.ceil(state.sessionSeconds - state.elapsed));
  const acc = Math.round(accuracy());
  const avgReaction = averageReaction();

  totalDoneEl.textContent = String(state.hits);
  perMinuteEl.textContent = donePerMinute().toFixed(1);
  reactionEl.textContent = avgReaction === null ? "--" : avgReaction.toFixed(2) + "s";
  accuracyEl.textContent = acc + "%";
  timeEl.textContent = formatTime(timeLeft);
  statusEl.textContent = state.message;
  drawRadar();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const isSpace = event.code === "Space" || key === " ";
  const gameplayKeys = ["arrowup", "arrowright", "arrowdown", "arrowleft", "w", "a", "s", "d"];
  if (isSpace || gameplayKeys.includes(key)) {
    event.preventDefault();
  }

  if (isSpace) {
    if (state.mode === "menu" || state.mode === "done") {
      startGame();
    } else if (state.mode === "running" || state.mode === "paused") {
      togglePause();
    }
    return;
  }

  if (key === "p") {
    togglePause();
    return;
  }

  if (key === "f") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    return;
  }

  if (key === "enter" && (state.mode === "menu" || state.mode === "done")) {
    startGame();
    return;
  }

  if (state.mode !== "running") {
    return;
  }

  if (key === "arrowup" || key === "w") {
    handleDirectionInput("up");
  } else if (key === "arrowright" || key === "d") {
    handleDirectionInput("right");
  } else if (key === "arrowdown" || key === "s") {
    handleDirectionInput("down");
  } else if (key === "arrowleft" || key === "a") {
    handleDirectionInput("left");
  }
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", () => {
  resetState();
  render();
});

difficultySelect.addEventListener("change", () => {
  if (state.mode === "menu" || state.mode === "done") {
    state.difficulty = String(difficultySelect.value || "extreme");
    render();
  }
});

sessionSelect.addEventListener("change", () => {
  if (state.mode === "menu" || state.mode === "done") {
    state.sessionSeconds = Number(sessionSelect.value || 120);
    render();
  }
});

window.addEventListener("keydown", onKeyDown);

window.render_game_to_text = function renderGameToText() {
  const avgReaction = averageReaction();
  const payload = {
    coordinateSystem: "origin at top-left, +x right, +y down",
    mode: state.mode,
    totalDone: state.hits,
    misses: state.misses,
    responses: state.responses,
    level: state.level,
    difficulty: state.difficulty,
    accuracy: Number(accuracy().toFixed(2)),
    perMinuteDone: Number(donePerMinute().toFixed(2)),
    averageReactionSeconds: avgReaction === null ? null : Number(avgReaction.toFixed(3)),
    timeRemaining: Number(Math.max(0, state.sessionSeconds - state.elapsed).toFixed(2)),
    sessionComment: state.sessionComment,
    breakCountdown: Number(Math.max(0, state.breakTimer).toFixed(2)),
    target: state.target
      ? {
          x: Number(state.target.x.toFixed(1)),
          y: Number(state.target.y.toFixed(1)),
          radius: state.target.r,
          orientation: state.target.gapDir,
          ttl: Number(Math.max(0, state.target.ttl).toFixed(2)),
          contrast: state.target.contrast,
          alphaHint: Number(Math.min(1, state.target.age / 0.2).toFixed(2)),
          vx: Number(state.target.vx.toFixed(1)),
          vy: Number(state.target.vy.toFixed(1)),
        }
      : null,
  };
  return JSON.stringify(payload);
};

window.advanceTime = function advanceTime(ms) {
  const dt = 1 / 60;
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) {
    update(dt);
  }
  render();
};

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

resetState();
render();
requestAnimationFrame(loop);
