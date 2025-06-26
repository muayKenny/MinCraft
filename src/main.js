import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { World } from './world';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { setupUI } from './ui';
import { Player } from './player';

// renderer
const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x80a0e0);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const orbitCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
orbitCamera.position.set(-32, 32, 32);

const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(32, 0, 32);
controls.update();

const stats = new Stats();
document.body.appendChild(stats.dom);

// scene setup
const scene = new THREE.Scene();

const player = new Player(scene);

function setupLights() {
  const sun = new THREE.DirectionalLight();
  sun.intensity = 1.5;
  sun.position.set(50, 50, 50);
  sun.castShadow = true;

  // Set the size of the sun's shadow box
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.001;
  sun.shadow.mapSize = new THREE.Vector2(512, 512);
  scene.add(sun);

  // scene.add(new THREE.CameraHelper(sun.shadow.camera));

  const ambient = new THREE.AmbientLight();
  ambient.intensity = 0.1;
  scene.add(ambient);
}

const world = new World();
world.generate();
scene.add(world);

// render loop
let previousTime = performance.now();
function animate() {
  const currentTime = performance.now();
  const dt = currentTime - previousTime;
  requestAnimationFrame(animate);
  player.applyInputs(dt);
  stats.update();
  renderer.render(
    scene,
    player.controls.isLocked ? player.camera : orbitCamera
  );

  previousTime = currentTime;
}

window.addEventListener('resize', () => {
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setupLights();
setupUI(world, player);
animate();
