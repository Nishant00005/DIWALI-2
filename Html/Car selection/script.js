
"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);

const scoreEl = $("score");
const coinsEl = $("coins");
const speedEl = $("speed");
const bestEl = $("bestScore");
const overlay = $("mainOverlay");
const garage = $("garage");
const startBtn = $("startBtn");
const nitroBtn = $("nitroBtn");
const boostIndicator = $("boostIndicator");

let W = 0;
let H = 0;
let dpr = 1;

let running = false;
let gameOver = false;
let lastTime = 0;

let score = 0;
let coins = 0;
let best = loadBest();
let speed = 0;
let roadOffset = 0;
let spawnTimer = 0;
let coinTimer = 0;
let nitroTimer = 0;
let nitroCooldown = 0;

let player;
let traffic = [];
let roadCoins = [];
let carColor = "#39f5e4";

const keys = Object.create(null);

const BASE_SPEED = 290;
const MAX_SPEED = 500;
const NITRO_SPEED = 690;

function loadBest() {
  try {
    return Number(localStorage.getItem("neonRacerBest")) || 0;
  } catch {
    return 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem("neonRacerBest", String(best));
  } catch {
    // The game still works if browser storage is unavailable.
  }
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (player) {
    player.y = H * 0.79;
    player.x = clamp(player.x, W * 0.25, W * 0.75);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.addEventListener("resize", resize);

function resetGame() {
  score = 0;
  coins = 0;
  speed = BASE_SPEED;
  roadOffset = 0;
  spawnTimer = 0.6;
  coinTimer = 1;
  nitroTimer = 0;
  nitroCooldown = 0;
  traffic = [];
  roadCoins = [];

  player = {
    x: W / 2,
    y: H * 0.79,
    w: 38,
    h: 68
  };

  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });

  scoreEl.textContent = "0";
  coinsEl.textContent = "0";
  speedEl.textContent = String(Math.round(speed));
  bestEl.textContent = String(best);

  nitroBtn.classList.remove("active");
  boostIndicator.classList.remove("active");
}

function roadBounds(y) {
  const horizon = H * 0.22;
  const t = clamp((y - horizon) / Math.max(1, H - horizon), 0, 1);
  const halfWidth = W * (0.105 + 0.36 * t);

  return {
    left: W / 2 - halfWidth,
    right: W / 2 + halfWidth,
    width: halfWidth * 2,
    t
  };
}

function laneCenter(lane, y) {
  const bounds = roadBounds(y);
  return bounds.left + bounds.width * (lane + 0.5) / 3;
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#12283d");
  sky.addColorStop(0.32, "#436474");
  sky.addColorStop(0.33, "#285b46");
  sky.addColorStop(1, "#102c24");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Distant sun
  ctx.fillStyle = "#d0fff2";
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(W * 0.75, H * 0.13, Math.min(W, H) * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stylized roadside scenery
  for (let i = 0; i < 18; i++) {
    const y = ((i * 61 + roadOffset * 0.65) % (H + 61));
    const b = roadBounds(y);
    const size = 3 + b.t * 8;

    ctx.fillStyle = i % 2 ? "#39f5e4" : "#b2c3c9";
    ctx.globalAlpha = 0.35 + b.t * 0.5;
    ctx.fillRect(b.left - size * 2.4, y, size, size * 1.8);
    ctx.fillRect(b.right + size * 1.4, y, size, size * 1.8);
  }

  ctx.globalAlpha = 1;

  // Road trapezoid
  const top = roadBounds(H * 0.22);
  const bottom = roadBounds(H);

  ctx.fillStyle = "#252b35";
  ctx.beginPath();
  ctx.moveTo(top.left, H * 0.22);
  ctx.lineTo(top.right, H * 0.22);
  ctx.lineTo(bottom.right, H);
  ctx.lineTo(bottom.left, H);
  ctx.closePath();
  ctx.fill();

  // Road borders
  ctx.strokeStyle = "#c9f9f1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(top.left, H * 0.22);
  ctx.lineTo(bottom.left, H);
  ctx.moveTo(top.right, H * 0.22);
  ctx.lineTo(bottom.right, H);
  ctx.stroke();

  // Dashed lane markings
  const segment = 72;
  for (let y = -segment; y < H + segment; y += segment) {
    const yy = (y + roadOffset) % (H + segment);
    const b = roadBounds(yy);
    const markerH = 9 + b.t * 24;
    const markerW = 2 + b.t * 4;

    ctx.fillStyle = "#e5eee9";

    for (let lane = 1; lane <= 2; lane++) {
      const x = b.left + b.width * lane / 3;
      ctx.fillRect(x - markerW / 2, yy, markerW, markerH);
    }
  }
}

function drawCar(x, y, w, h, color, isPlayer = false) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = "#0008";
  ctx.beginPath();
  ctx.ellipse(0, h * 0.38, w * 0.7, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tires
  ctx.fillStyle = "#080c12";
  ctx.fillRect(-w * 0.56, -h * 0.32, w * 0.18, h * 0.30);
  ctx.fillRect(w * 0.38, -h * 0.32, w * 0.18, h * 0.30);
  ctx.fillRect(-w * 0.56, h * 0.15, w * 0.18, h * 0.28);
  ctx.fillRect(w * 0.38, h * 0.15, w * 0.18, h * 0.28);

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w * 0.38, h * 0.48);
  ctx.lineTo(-w * 0.47, h * 0.12);
  ctx.lineTo(-w * 0.34, -h * 0.38);
  ctx.lineTo(-w * 0.20, -h * 0.49);
  ctx.lineTo(w * 0.20, -h * 0.49);
  ctx.lineTo(w * 0.34, -h * 0.38);
  ctx.lineTo(w * 0.47, h * 0.12);
  ctx.lineTo(w * 0.38, h * 0.48);
  ctx.closePath();
  ctx.fill();

  // Rear glass
  ctx.fillStyle = "#142c41";
  ctx.beginPath();
  ctx.moveTo(-w * 0.25, -h * 0.19);
  ctx.lineTo(-w * 0.15, -h * 0.39);
  ctx.lineTo(w * 0.15, -h * 0.39);
  ctx.lineTo(w * 0.25, -h * 0.19);
  ctx.closePath();
  ctx.fill();

  // Brake lights
  ctx.fillStyle = "#ffdae0";
  ctx.fillRect(-w * 0.31, h * 0.32, w * 0.19, h * 0.08);
  ctx.fillRect(w * 0.12, h * 0.32, w * 0.19, h * 0.08);

  if (isPlayer) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-w * 0.035, -h * 0.23, w * 0.07, h * 0.38);

    if (nitroTimer > 0) {
      ctx.shadowColor = "#ff9e43";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#ff9e43";

      ctx.beginPath();
      ctx.moveTo(-w * 0.18, h * 0.43);
      ctx.lineTo(-w * 0.07, h * 0.43);
      ctx.lineTo(-w * 0.12, h * 0.75 + Math.random() * 8);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.07, h * 0.43);
      ctx.lineTo(w * 0.18, h * 0.43);
      ctx.lineTo(w * 0.12, h * 0.75 + Math.random() * 8);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawCoin(coin) {
  const pulse = 1 + Math.sin(performance.now() / 140 + coin.y) * 0.08;

  ctx.save();
  ctx.translate(coin.x, coin.y);
  ctx.scale(pulse, 1);

  ctx.shadowColor = "#ffc857";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ffc857";
  ctx.beginPath();
  ctx.arc(0, 0, coin.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#fff1ac";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, coin.r * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#76501b";
  ctx.font = `bold ${coin.r}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 0, 1);

  ctx.restore();
}

function spawnTraffic() {
  const lane = Math.floor(Math.random() * 3);
  const y = H * 0.26;

  traffic.push({
    lane,
    x: laneCenter(lane, y),
    y,
    w: 28,
    h: 51,
    color: ["#ff477e", "#ffc857", "#a78bfa", "#f1f5f9"][
      Math.floor(Math.random() * 4)
    ],
    passed: false
  });
}

function spawnCoin() {
  const lane = Math.floor(Math.random() * 3);
  const y = H * 0.26;

  roadCoins.push({
    lane,
    x: laneCenter(lane, y),
    y,
    r: 9
  });
}

function activateNitro() {
  if (!running || nitroTimer > 0 || nitroCooldown > 0) return;

  nitroTimer = 2.2;
  nitroCooldown = 5;
  nitroBtn.classList.add("active");
  boostIndicator.classList.add("active");
}

function update(dt) {
  if (!running) return;

  if (nitroTimer > 0) {
    nitroTimer = Math.max(0, nitroTimer - dt);
  }

  if (nitroCooldown > 0) {
    nitroCooldown = Math.max(0, nitroCooldown - dt);
  }

  if (nitroTimer === 0) {
    nitroBtn.classList.remove("active");
    boostIndicator.classList.remove("active");
  }

  const braking = keys.ArrowDown || keys.s || keys.S;
  const accelerating = keys.ArrowUp || keys.w || keys.W;

  let targetSpeed = MAX_SPEED;
  if (braking) targetSpeed = 180;
  else if (accelerating) targetSpeed = 430;

  if (nitroTimer > 0) targetSpeed = NITRO_SPEED;

  speed += (targetSpeed - speed) * Math.min(1, dt * 1.6);
  roadOffset = (roadOffset + speed * dt) % (H + 100);
  score += dt * speed * 0.065;

  const steer =
    (keys.ArrowRight || keys.d || keys.D ? 1 : 0) -
    (keys.ArrowLeft || keys.a || keys.A ? 1 : 0);

  player.x += steer * (290 + speed * 0.15) * dt;

  const bounds = roadBounds(player.y);
  player.x = clamp(
    player.x,
    bounds.left + player.w * 0.62,
    bounds.right - player.w * 0.62
  );

  // Spawn traffic
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnTraffic();
    spawnTimer = Math.max(0.48, 1.05 - score / 14000) +
      Math.random() * 0.35;
  }

  // Spawn coins
  coinTimer -= dt;
  if (coinTimer <= 0) {
    spawnCoin();
    coinTimer = 0.75 + Math.random() * 0.9;
  }

  // Move traffic and check collisions
  for (const car of traffic) {
    const relative = car.y / H;
    car.y += speed * dt * 0.55;
    car.x = laneCenter(car.lane, car.y);

    const scale = 0.55 + relative * 0.6;
    const cw = car.w * scale;
    const ch = car.h * scale;

    const hitX = Math.abs(player.x - car.x) < (player.w + cw) * 0.40;
    const hitY = Math.abs(player.y - car.y) < (player.h + ch) * 0.39;

    if (hitX && hitY) {
      finishGame();
      return;
    }

    if (!car.passed && car.y > player.y + player.h) {
      car.passed = true;
      score += 20;
    }
  }

  traffic = traffic.filter(car => car.y < H + 100);

  // Move and collect coins
  for (const coin of roadCoins) {
    const relative = coin.y / H;
    coin.y += speed * dt * 0.55;
    coin.x = laneCenter(coin.lane, coin.y);

    const scale = 0.65 + relative * 0.4;
    const closeX = Math.abs(player.x - coin.x) < player.w * 0.65;
    const closeY = Math.abs(player.y - coin.y) < player.h * 0.48;

    if (closeX && closeY) {
      coin.collected = true;
      coins += 1;
      score += 50;
      coinsEl.textContent = String(coins);
    }
  }

  roadCoins = roadCoins.filter(
    coin => !coin.collected && coin.y < H + 30
  );

  scoreEl.textContent = String(Math.floor(score));
  speedEl.textContent = String(Math.round(speed));
}

function render() {
  drawBackground();

  for (const coin of roadCoins) {
    drawCoin(coin);
  }

  for (const car of traffic) {
    const scale = 0.55 + (car.y / H) * 0.6;
    drawCar(car.x, car.y, car.w * scale, car.h * scale, car.color);
  }

  if (player) {
    drawCar(
      player.x,
      player.y,
      player.w,
      player.h,
      carColor,
      true
    );
  }
}

function finishGame() {
  running = false;
  gameOver = true;

  const finalScore = Math.floor(score);

  if (finalScore > best) {
    best = finalScore;
    saveBest();
  }

  bestEl.textContent = String(best);
  $("overlayTitle").innerHTML = 'RACE<br><span>OVER</span>';
  $("overlayMessage").textContent =
    `Score: ${finalScore} · Coins: ${coins} · Best: ${best}`;

  startBtn.textContent = "RACE AGAIN ↗";
  overlay.classList.remove("hidden");
  garage.classList.add("hidden");
  nitroBtn.classList.remove("active");
  boostIndicator.classList.remove("active");
}

function startGame() {
  resize();
  resetGame();

  gameOver = false;
  running = true;
  overlay.classList.add("hidden");
  garage.classList.add("hidden");
}

startBtn.addEventListener("click", startGame);

$("openGarage").addEventListener("click", () => {
  garage.classList.remove("hidden");
});

$("closeGarage").addEventListener("click", () => {
  garage.classList.add("hidden");
});

document.querySelectorAll("[data-color]").forEach(button => {
  button.addEventListener("click", () => {
    carColor = button.dataset.color;

    document.querySelectorAll("[data-color]").forEach(option => {
      option.classList.remove("selected");
    });

    button.classList.add("selected");
  });
});

// Keyboard controls
window.addEventListener("keydown", event => {
  const key = event.key;

  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "]
      .includes(key)
  ) {
    event.preventDefault();
  }

  keys[key] = true;
  keys[key.toLowerCase()] = true;

  if (key === " " && !event.repeat) {
    activateNitro();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key] = false;
  keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });
});

// Mobile controls
function bindHold(id, key) {
  const button = $(id);

  const release = event => {
    if (event) event.preventDefault();
    keys[key] = false;
  };

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    keys[key] = true;

    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture isn't required for the game to run.
    }
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

bindHold("leftBtn", "ArrowLeft");
bindHold("rightBtn", "ArrowRight");
bindHold("brakeBtn", "ArrowDown");

nitroBtn.addEventListener("pointerdown", event => {
  event.preventDefault();
  activateNitro();
});

nitroBtn.addEventListener("contextmenu", event => {
  event.preventDefault();
});

// Game loop
function loop(timestamp) {
  const dt = lastTime
    ? Math.min((timestamp - lastTime) / 1000, 0.035)
    : 0;

  lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

resize();
resetGame();
bestEl.textContent = String(best);
requestAnimationFrame(loop);
