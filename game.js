import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#game");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#start");
const scoreEl = document.querySelector("#score");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x05070f, 12, 42);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 5, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05070f, 1);

const hemiLight = new THREE.HemisphereLight(0x9ad8ff, 0x2b124a, 1.1);
scene.add(hemiLight);

const spotLight = new THREE.SpotLight(0x4ff3ff, 2.5, 50, Math.PI / 6, 0.3, 1);
spotLight.position.set(0, 18, 10);
spotLight.castShadow = true;
scene.add(spotLight);

const lanePositions = [-3, 0, 3];
const trackSegments = [];
const obstacles = [];
let speed = 0.35;
let score = 0;
let isRunning = false;
let jumpVelocity = 0;
let isJumping = false;
let targetLane = 1;

const runnerGroup = new THREE.Group();
const runnerMaterial = new THREE.MeshStandardMaterial({
  color: 0x7f5dff,
  emissive: 0x3b1fff,
  emissiveIntensity: 0.6,
  roughness: 0.4,
  metalness: 0.3,
});

const runnerBody = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.8, 0.8),
  runnerMaterial
);
runnerBody.position.y = 1.2;
const runnerHead = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 0.9, 0.9),
  new THREE.MeshStandardMaterial({
    color: 0x74fff0,
    emissive: 0x2ff7d9,
    emissiveIntensity: 0.9,
  })
);
runnerHead.position.y = 2.3;

runnerGroup.add(runnerBody, runnerHead);
scene.add(runnerGroup);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x0c1a34,
  roughness: 0.6,
  metalness: 0.1,
});

const laneLightMaterial = new THREE.MeshStandardMaterial({
  color: 0x2ddcff,
  emissive: 0x1fa8ff,
  emissiveIntensity: 0.9,
  roughness: 0.3,
  metalness: 0.4,
});

function createTrackSegment(z) {
  const segment = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 12), groundMaterial);
  base.position.y = -0.2;
  base.position.z = z;

  const laneLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 12), laneLightMaterial);
  laneLeft.position.set(-3, 0.05, z);
  const laneRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 12), laneLightMaterial);
  laneRight.position.set(3, 0.05, z);

  segment.add(base, laneLeft, laneRight);
  scene.add(segment);
  trackSegments.push(segment);
}

for (let i = 0; i < 8; i += 1) {
  createTrackSegment(-i * 12);
}

const obstacleMaterial = new THREE.MeshStandardMaterial({
  color: 0xff507a,
  emissive: 0xff2e63,
  emissiveIntensity: 0.6,
});

function spawnObstacle(z) {
  const obstacle = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), obstacleMaterial);
  const laneIndex = Math.floor(Math.random() * lanePositions.length);
  obstacle.position.set(lanePositions[laneIndex], 0.7, z);
  obstacle.userData = { laneIndex };
  scene.add(obstacle);
  obstacles.push(obstacle);
}

function resetGame() {
  obstacles.forEach((obstacle) => scene.remove(obstacle));
  obstacles.length = 0;
  trackSegments.forEach((segment) => scene.remove(segment));
  trackSegments.length = 0;
  for (let i = 0; i < 8; i += 1) {
    createTrackSegment(-i * 12);
  }
  runnerGroup.position.set(0, 0, 0);
  targetLane = 1;
  jumpVelocity = 0;
  isJumping = false;
  score = 0;
  speed = 0.35;
  scoreEl.textContent = "0";
  for (let i = 1; i <= 6; i += 1) {
    spawnObstacle(-20 - i * 10);
  }
}

function handleLaneChange(direction) {
  if (!isRunning) return;
  const nextLane = THREE.MathUtils.clamp(targetLane + direction, 0, lanePositions.length - 1);
  targetLane = nextLane;
}

function handleJump() {
  if (!isRunning || isJumping) return;
  isJumping = true;
  jumpVelocity = 0.35;
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    handleLaneChange(-1);
  }
  if (event.key === "ArrowRight") {
    handleLaneChange(1);
  }
  if (event.key === " " || event.key === "ArrowUp") {
    handleJump();
  }
});

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

window.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    handleLaneChange(deltaX > 0 ? 1 : -1);
  } else if (deltaY < -30) {
    handleJump();
  }
});

startButton.addEventListener("click", () => {
  resetGame();
  overlay.classList.add("hidden");
  isRunning = true;
});

function updateRunner() {
  const targetX = lanePositions[targetLane];
  runnerGroup.position.x += (targetX - runnerGroup.position.x) * 0.2;

  if (isJumping) {
    runnerGroup.position.y += jumpVelocity;
    jumpVelocity -= 0.02;
    if (runnerGroup.position.y <= 0) {
      runnerGroup.position.y = 0;
      isJumping = false;
      jumpVelocity = 0;
    }
  }
}

function updateTrack() {
  trackSegments.forEach((segment) => {
    segment.children.forEach((mesh) => {
      mesh.position.z += speed;
    });
  });

  const firstSegment = trackSegments[0];
  if (firstSegment.children[0].position.z > 6) {
    trackSegments.shift();
    firstSegment.children.forEach((mesh) => scene.remove(mesh));
    const lastSegment = trackSegments[trackSegments.length - 1];
    createTrackSegment(lastSegment.children[0].position.z - 12);
  }
}

function updateObstacles() {
  obstacles.forEach((obstacle) => {
    obstacle.position.z += speed;
  });

  if (obstacles[0] && obstacles[0].position.z > 8) {
    const old = obstacles.shift();
    scene.remove(old);
    const farthest = obstacles[obstacles.length - 1];
    spawnObstacle(farthest.position.z - 10 - Math.random() * 6);
  }
}

function checkCollisions() {
  const runnerBox = new THREE.Box3().setFromObject(runnerGroup);
  for (const obstacle of obstacles) {
    const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    if (runnerBox.intersectsBox(obstacleBox)) {
      isRunning = false;
      overlay.classList.remove("hidden");
      startButton.textContent = "Run Again";
      return;
    }
  }
}

function updateScore() {
  score += speed * 2.2;
  scoreEl.textContent = Math.floor(score).toString();
  if (score > 200 && speed < 0.55) {
    speed += 0.0005;
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (isRunning) {
    updateRunner();
    updateTrack();
    updateObstacles();
    checkCollisions();
    updateScore();
  }
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
