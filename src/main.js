import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { World } from './world';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { createUI } from './ui';

// renderer
const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x80a0e0);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.set(-12, 16, -12);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.update();

const stats = new Stats();
document.body.appendChild(stats.dom);

// scene setup
const scene = new THREE.Scene();

function setupLights() {
  const light1 = new THREE.DirectionalLight();
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight();
  light2.position.set(-1, -1, -1);
  scene.add(light2);

  const ambientLight = new THREE.AmbientLight(); // soft white light
  ambientLight.intensity = 0.1;
  scene.add(ambientLight);
}

const world = new World();
world.generate();
scene.add(world);

// render loop
function animate() {
  requestAnimationFrame(animate);
  stats.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setupLights();
createUI(world);
animate();
