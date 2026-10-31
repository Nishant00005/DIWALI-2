import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = (s) => document.querySelector(s);
const ui = {
  score: $('#score'), coins: $('#coins'), best: $('#best'),
  nitro: $('#nitro div'), start: $('#start'),
  over: $('#over'), final: $('#final')
};

let best = Number(localStorage.getItem('neon-racer-3d-best') || 0);
ui.best.textContent = best;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030e);
scene.fog = new THREE.FogExp2(0x06071b, 0.018);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 220);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
$('#app').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x468cff, 0x16001b, 2));
const sun = new THREE.DirectionalLight(0xb9dcff, 2);
sun.position.set(4, 12, 5);
scene.add(sun);

for (const [color, x, z] of [[0xff22cc, -7, -5], [0x00eaff, 7, 4]]) {
  const light = new THREE.PointLight(color, 28, 38, 2);
  light.position.set(x, 4, z);
  scene.add(light);
}

function add(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

const road = add(new THREE.PlaneGeometry(18, 260),
  new THREE.MeshStandardMaterial({ color: 0x07101d, metalness: 0.8, roughness: 0.3 }));
road.rotation.x = -Math.PI / 2;
road.position.z = -90;

const ground = add(new THREE.PlaneGeometry(55, 260),
  new THREE.MeshStandardMaterial({ color: 0x090318 }));
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.05, -90);

const lines = [];
for (let z = 8; z > -230; z -= 12) {
  for (const x of [-3, 3]) {
    const line = add(new THREE.BoxGeometry(0.12, 0.04, 5),
      new THREE.MeshBasicMaterial({ color: 0x00eaff }));
    line.position.set(x, 0.03, z);
    lines.push(line);
  }
}

for (const x of [-9.2, 9.2]) {
  const rail = add(new THREE.BoxGeometry(0.12, 0.25, 260),
    new THREE.MeshBasicMaterial({ color: 0xff2fd0 }));
  rail.position.set(x, 0.2, -90);
}

const city = new THREE.Group();
scene.add(city);

for (let i = 0; i < 70; i++) {
  const h = 3 + Math.random() * 16;
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(2 + Math.random() * 3, h, 3 + Math.random() * 4),
    new THREE.MeshStandardMaterial({
      color: 0x080b22,
      emissive: i % 3 ? 0x001c3b : 0x2a0029,
      emissiveIntensity: 1.6,
      metalness: 0.7
    })
  );
  building.position.set((i % 2 ? 1 : -1) * (13 + Math.random() * 8), h / 2, -8 - Math.floor(i / 2) * 7);
  city.add(building);
}

function makeCar(color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x090b18, metalness: 0.8, roughness: 0.25,
    emissive: color, emissiveIntensity: 1.5
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.62, 3.7), material);
  body.position.y = 0.58;
  group.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.52, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x06152c, metalness: 1, roughness: 0.08 }));
  cabin.position.set(0, 1.05, -0.15);
  group.add(cabin);

  return group;
}

function makeBike(color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x07101f, metalness: 0.85, roughness: 0.2,
    emissive: color, emissiveIntensity: 1.8
  });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 2.55), material);
  frame.position.y = 0.72;
  frame.rotation.x = -0.14;
  group.add(frame);

  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 10), material);
  tank.scale.set(1, 0.7, 1.35);
  tank.position.set(0, 0.94, -0.15);
  group.add(tank);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.85),
    new THREE.MeshStandardMaterial({ color: 0x090914, roughness: 0.7 }));
  seat.position.set(0, 0.92, 0.75);
  group.add(seat);

  for (const z of [-1.18, 1.18]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.19, 16),
      new THREE.MeshStandardMaterial({ color: 0x030305, roughness: 0.8 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.42, z);
    group.add(wheel);
  }

  const handlebar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.08), material);
  handlebar.position.set(0, 1.23, -0.94);
  group.add(handlebar);

  return group;
}

const player = makeBike(0x00d9ff);
player.position.set(0, 0.02, 3.5);
scene.add(player);

const glow = new THREE.PointLight(0x00eaff, 12, 8, 2);
glow.position.set(0, 0.2, 1);
player.add(glow);

const lanes = [-5.3, 0, 5.3];
const traffic = [];
const coins = [];
const keys = {};
const clock = new THREE.Clock();

let running = false;
let score = 0;
let coinCount = 0;
let nitro = 100;
let carTimer = 0;
let coinTimer = 0;

function spawnTraffic() {
  const car = makeCar([0xff2fd0, 0xa862ff, 0xff5238][Math.floor(Math.random() * 3)]);
  car.position.set(lanes[Math.floor(Math.random() * 3)], 0.02, -82);
  car.userData.speed = 20 + Math.random() * 11;
  scene.add(car);
  traffic.push(car);
}

function spawnCoin() {
  const coin = new THREE.Mesh(
    new THREE.TorusGeometry(0.43, 0.12, 8, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd52c })
  );
  coin.rotation.y = Math.PI / 2;
  coin.position.set(lanes[Math.floor(Math.random() * 3)], 1.1, -78);
  scene.add(coin);
  coins.push(coin);
}

function updateUI() {
  ui.score.textContent = Math.floor(score);
  ui.coins.textContent = coinCount;
  ui.nitro.style.width = `${nitro}%`;
}

function resetGame() {
  for (const list of [traffic, coins]) while (list.length) scene.remove(list.pop());
  score = 0;
  coinCount = 0;
  nitro = 100;
  carTimer = 0;
  coinTimer = 0;
  player.position.x = 0;
  updateUI();
}

function endGame() {
  running = false;
  best = Math.max(best, Math.floor(score));
  localStorage.setItem('neon-racer-3d-best', best);
  ui.best.textContent = best;
  ui.final.textContent = `SCORE ${Math.floor(score)}  //  COINS ${coinCount}`;
  ui.over.classList.remove('hide');
}

function startGame() {
  ui.start.classList.add('hide');
  ui.over.classList.add('hide');
  resetGame();
  running = true;
  clock.getDelta();
}

function setControl(name, pressed) {
  keys[name] = pressed;
}

addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') setControl('left', true);
  if (key === 'arrowright' || key === 'd') setControl('right', true);
  if (key === ' ' || key === 'shift') setControl('nitro', true);
});

addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') setControl('left', false);
  if (key === 'arrowright' || key === 'd') setControl('right', false);
  if (key === ' ' || key === 'shift') setControl('nitro', false);
});

document.querySelectorAll('nav button').forEach((button) => {
  ['pointerdown', 'pointerup', 'pointerleave'].forEach((name) => {
    button.addEventListener(name, (event) => {
      event.preventDefault();
      setControl(button.dataset.key, name === 'pointerdown');
    });
  });
});

$('#startButton').onclick = startGame;
$('#restartButton').onclick = startGame;

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const boosting = running && keys.nitro && nitro > 0;
  const speed = boosting ? 42 : 25;

  if (running) {
    nitro = Math.max(0, Math.min(100, nitro + (boosting ? -29 : 5) * delta));

    const steer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    player.position.x = THREE.MathUtils.clamp(player.position.x + steer * delta * 9, -7.1, 7.1);
    player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -steer * 0.18, 0.12);
    glow.intensity = boosting ? 25 : 12;

    lines.forEach((line) => {
      line.position.z += speed * delta;
      if (line.position.z > 12) line.position.z -= 240;
    });

    city.children.forEach((building) => {
      building.position.z += speed * delta * 0.65;
      if (building.position.z > 12) building.position.z -= 252;
    });

    if ((carTimer += delta) > 1.05) {
      spawnTraffic();
      carTimer = 0;
    }

    if ((coinTimer += delta) > 1.25) {
      spawnCoin();
      coinTimer = 0;
    }

    for (let i = traffic.length - 1; i >= 0; i--) {
      const car = traffic[i];
      car.position.z += (speed + car.userData.speed) * delta;

      if (car.position.z > 12) {
        scene.remove(car);
        traffic.splice(i, 1);
      } else if (Math.abs(car.position.z - player.position.z) < 2.2 &&
                 Math.abs(car.position.x - player.position.x) < 1.5) {
        endGame();
      }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      coin.position.z += (speed + 19) * delta;
      coin.rotation.z += delta * 6;

      if (coin.position.z > 12) {
        scene.remove(coin);
        coins.splice(i, 1);
      } else if (Math.abs(coin.position.z - player.position.z) < 1.8 &&
                 Math.abs(coin.position.x - player.position.x) < 1.35) {
        scene.remove(coin);
        coins.splice(i, 1);
        coinCount++;
        score += 50;
      }
    }

    score += delta * (boosting ? 33 : 18);
    updateUI();
  }

  camera.position.lerp(new THREE.Vector3(player.position.x * 0.42, 5.2, 11.8), 0.075);
  camera.lookAt(player.position.x * 0.25, 0.7, -9);
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();