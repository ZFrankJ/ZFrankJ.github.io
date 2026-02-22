const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const sessionSelect = document.getElementById("session-seconds");
const difficultySelect = document.getElementById("difficulty-mode");
const distanceBreakToggle = document.getElementById("distance-breaks");

const scoreEl = document.getElementById("score-value");
const livesEl = document.getElementById("lives-value");
const streakEl = document.getElementById("streak-value");
const accuracyEl = document.getElementById("accuracy-value");
const levelEl = document.getElementById("level-value");
const timeEl = document.getElementById("time-value");
const statusEl = document.getElementById("status-text");

const GAP_DIRECTIONS = ["up", "right", "down", "left"];
const SIZE_LEVELS = [10, 13, 16, 20, 25, 31, 37];
const TARGET_TOP_PADDING = 92;
const OVERLAY_Y_SHIFT = 40;
const SCORE_STORAGE_KEY = "focus_sprint_scores_v1";
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

function createDefaultScoreRecords() {
  return {
    easy: { best: 0, last: null },
    hard: { best: 0, last: null },
    extreme: { best: 0, last: null },
  };
}

function loadScoreRecords() {
  const fallback = createDefaultScoreRecords();
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    const sanitized = createDefaultScoreRecords();
    const difficulties = ["easy", "hard", "extreme"];
    for (let i = 0; i < difficulties.length; i += 1) {
      const key = difficulties[i];
      const row = parsed && parsed[key] ? parsed[key] : {};
      const best = Number(row.best);
      const last = Number(row.last);
      sanitized[key].best = Number.isFinite(best) && best >= 0 ? best : 0;
      sanitized[key].last = Number.isFinite(last) && last >= 0 ? last : null;
    }
    return sanitized;
  } catch (_err) {
    return fallback;
  }
}

function saveScoreRecords(records) {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(records));
  } catch (_err) {
    // Ignore storage errors so gameplay continues even in private modes.
  }
}

const state = {
  mode: "menu",
  score: 0,
  lives: 5,
  streak: 0,
  hits: 0,
  misses: 0,
  elapsed: 0,
  level: 1,
  sessionSeconds: 120,
  difficulty: "extreme",
  target: null,
  spawnTimer: 0,
  message: "Press Start to begin.",
  messageTimer: 0,
  blinkPromptTimer: 9,
  blinkWindow: 0,
  breakEnabled: false,
  breakEvery: 40,
  nextBreakAt: 40,
  breakTimer: 0,
  sessionComment: "",
  scoreRecords: loadScoreRecords(),
};

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function setMessage(text, duration = 1.5) {
  state.message = text;
  state.messageTimer = duration;
}

function accuracy() {
  const total = state.hits + state.misses;
  return total === 0 ? 0 : (state.hits / total) * 100;
}

function difficultyConfig() {
  return DIFFICULTY[state.difficulty] || DIFFICULTY.hard;
}

function resetState() {
  state.mode = "menu";
  state.score = 0;
  state.lives = 5;
  state.streak = 0;
  state.hits = 0;
  state.misses = 0;
  state.elapsed = 0;
  state.level = 1;
  state.sessionSeconds = Number(sessionSelect.value || 120);
  state.difficulty = String(difficultySelect.value || "extreme");
  state.target = null;
  state.spawnTimer = 0;
  state.message = "Press Start to begin.";
  state.messageTimer = 0;
  state.blinkPromptTimer = 9;
  state.blinkWindow = 0;
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

function scoreForHit(reactionSec) {
  const t = state.target;
  const levelBonus = Math.round(state.level * 1.7);
  const sizeBonus = Math.round((37 - t.r) / 2);
  const contrastBonus = Math.round((1 - t.contrast) * 18);
  const speedBonus = Math.max(0, Math.round(10 - reactionSec * 6));
  const streakBonus = Math.min(14, state.streak);
  return 10 + levelBonus + sizeBonus + contrastBonus + speedBonus + streakBonus;
}

function onCorrect() {
  const t = state.target;
  const reactionSec = t.maxTtl - t.ttl;
  const gained = scoreForHit(reactionSec);
  state.score += gained;
  state.streak += 1;
  state.hits += 1;
  setMessage("Perfect +" + gained, 0.85);
  state.target = null;
  state.spawnTimer = 0.12;
}

function onMistake(message) {
  state.lives -= 1;
  state.streak = 0;
  state.misses += 1;
  state.target = null;
  state.spawnTimer = 0.26;
  setMessage(message, 1.1);

  if (state.lives <= 0) {
    finishSession("Session ended: no lives left.");
  }
}

function scoreComparisonComment(difficulty, score, previousBest, previousLast) {
  const upper = difficulty.toUpperCase();
  if (previousLast === null) {
    return "First " + upper + " run recorded.";
  }
  if (score > previousBest) {
    return "New " + upper + " best: +" + (score - previousBest) + " over previous best.";
  }
  if (score > previousLast) {
    return "Above your last " + upper + " run by +" + (score - previousLast) + ".";
  }
  if (score === previousLast) {
    return "Matched your last " + upper + " run.";
  }
  return "Below your last " + upper + " run by " + (previousLast - score) + ".";
}

function finishSession(prefix) {
  state.mode = "done";
  const difficulty = state.difficulty;
  const row = state.scoreRecords[difficulty] || { best: 0, last: null };
  const previousBest = row.best;
  const previousLast = row.last;
  const comment = scoreComparisonComment(difficulty, state.score, previousBest, previousLast);
  const newBest = Math.max(previousBest, state.score);
  state.scoreRecords[difficulty] = { best: newBest, last: state.score };
  saveScoreRecords(state.scoreRecords);
  state.sessionComment = comment;
  setMessage(prefix + " " + comment, 999);
}

function handleDirectionInput(direction) {
  if (state.mode !== "running" || !state.target) {
    return;
  }
  if (state.target.gapDir === direction) {
    onCorrect();
  } else {
    onMistake("Wrong direction.");
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

  state.blinkPromptTimer -= dt;
  if (state.blinkPromptTimer <= 0) {
    state.blinkPromptTimer = randomRange(10.5, 15.5);
    state.blinkWindow = 3.6;
    setMessage("Blink twice then press B for bonus.", 3);
  }
  if (state.blinkWindow > 0) {
    state.blinkWindow -= dt;
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
  g.addColorStop(0, "#f8f7f4");
  g.addColorStop(1, "#efede8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.055)";
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
  const shade = Math.round(20 + (1 - target.contrast) * 170);
  const alphaIn = Math.min(1, target.age / 0.2);
  const alphaOut = Math.min(1, target.ttl / (target.maxTtl * 0.34));
  const alpha = Math.max(0, Math.min(1, alphaIn * alphaOut));
  const color = "rgba(" + shade + "," + shade + "," + shade + "," + alpha.toFixed(3) + ")";
  const size = target.r * 2;
  const unit = Math.max(1, size * 0.18);
  const stemX = -size * 0.32;
  const stemY = -size * 0.5;
  const stemW = unit;
  const stemH = size;
  const topY = -size * 0.5;
  const midY = -unit * 0.5;
  const botY = size * 0.5 - unit;
  const barW = size * 0.7;

  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.rotate(directionAngle(target.gapDir));
  ctx.fillStyle = color;
  ctx.fillRect(stemX, stemY, stemW, stemH);
  ctx.fillRect(stemX, topY, barW, unit);
  ctx.fillRect(stemX, midY, barW, unit);
  ctx.fillRect(stemX, botY, barW, unit);
  ctx.restore();
}

function drawCenteredOverlay(title, line1, line2 = "") {
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const baseY = canvas.height / 2 + OVERLAY_Y_SHIFT;

  ctx.textAlign = "center";
  ctx.fillStyle = "#20201d";
  ctx.font = "600 50px Optima";
  ctx.fillText(title, canvas.width / 2, baseY - 44);
  ctx.fillStyle = "#434238";
  ctx.font = "26px Optima";
  ctx.fillText(line1, canvas.width / 2, baseY + 4);
  if (line2) {
    ctx.fillText(line2, canvas.width / 2, baseY + 44);
  }
  if (state.mode === "done" && state.sessionComment) {
    ctx.font = "20px Optima";
    ctx.fillStyle = "#55534a";
    ctx.fillText(state.sessionComment, canvas.width / 2, baseY + 78);
  }
  ctx.textAlign = "left";
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
    const acc = Math.round(accuracy());
    drawCenteredOverlay("Session Complete", "Score " + state.score + "  Accuracy " + acc + "%", "Press Start for another run");
  }

  const timeLeft = Math.max(0, Math.ceil(state.sessionSeconds - state.elapsed));
  const acc = Math.round(accuracy());

  scoreEl.textContent = String(state.score);
  livesEl.textContent = String(state.lives);
  streakEl.textContent = String(state.streak);
  accuracyEl.textContent = acc + "%";
  levelEl.textContent = String(state.level);
  timeEl.textContent = timeLeft + "s";
  statusEl.textContent = state.message;
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const isSpace = event.code === "Space" || key === " ";

  if (isSpace) {
    event.preventDefault();
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

  if (key === "b" && state.mode === "running" && state.blinkWindow > 0) {
    state.score += 14;
    state.blinkWindow = 0;
    setMessage("Blink bonus +14", 1);
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

window.addEventListener("keydown", onKeyDown);

window.render_game_to_text = function renderGameToText() {
  const payload = {
    coordinateSystem: "origin at top-left, +x right, +y down",
    mode: state.mode,
    score: state.score,
    lives: state.lives,
    streak: state.streak,
    level: state.level,
    difficulty: state.difficulty,
    accuracy: Number(accuracy().toFixed(2)),
    timeRemaining: Number(Math.max(0, state.sessionSeconds - state.elapsed).toFixed(2)),
    bestScoreCurrentDifficulty: state.scoreRecords[state.difficulty]
      ? state.scoreRecords[state.difficulty].best
      : 0,
    lastScoreCurrentDifficulty: state.scoreRecords[state.difficulty]
      ? state.scoreRecords[state.difficulty].last
      : null,
    sessionComment: state.sessionComment,
    blinkWindow: Number(Math.max(0, state.blinkWindow).toFixed(2)),
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
