import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { World } from './world';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { setupUI } from './ui';
import { Player } from './player';
import { Physics } from './physics';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Game state
let gameStarted = false;

// renderer
const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x80a0e0);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

const textureLoader = new THREE.TextureLoader();

// Available environment maps
const environmentMaps = {
  'Fantasy Castles': '/environmentMaps/fantasy_lands_castles_at_night.jpg',
  'Anime Cherry Blossom':
    '/environmentMaps/anime_art_style_japan_streets_with_cherry_blossom_.jpg',
  'Neon City Night':
    '/environmentMaps/digital_painting_neon_city_night_orange_lights_.jpg',
  'Sci-Fi Skyscrapers':
    '/environmentMaps/scifi_white_sky_scrapers_in_clouds_at_day_time.jpg',
};

// Environment map settings
const environmentSettings = {
  current: 'Fantasy Castles',
  loadEnvironmentMap: function (mapName) {
    if (environmentMaps[mapName]) {
      const environmentMap = textureLoader.load(environmentMaps[mapName]);
      environmentMap.mapping = THREE.EquirectangularReflectionMapping;
      environmentMap.colorSpace = THREE.SRGBColorSpace;

      scene.background = environmentMap;
      scene.environment = environmentMap;
      this.current = mapName;
    }
  },
};

// Load initial environment map
environmentSettings.loadEnvironmentMap(environmentSettings.current);

// scene.fog = new THREE.Fog(0xcccccc, 10, 100);

// renderer.setClearColor(scene.fog.color, 1);
// Audio setup
const audio = new Audio(
  '/music/Crusade - Heavy Industry (online-audio-converter.com).ogg'
);
audio.loop = true;
audio.volume = 0.5;

const audioSettings = {
  isPlaying: false,
  volume: 0.5,
  play: function () {
    audio
      .play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch((err) => {
        console.log('Audio play failed:', err);
      });
  },
  pause: function () {
    audio.pause();
    this.isPlaying = false;
  },
  setVolume: function (volume) {
    audio.volume = volume;
    this.volume = volume;
  },
};

// Auto-play audio when user interacts with the page
let audioStarted = false;
function startAudio() {
  if (!audioStarted) {
    audioSettings.play();
    audioStarted = true;
  }
}

// Add event listeners for user interaction to start audio
document.addEventListener('click', startAudio);
document.addEventListener('keydown', startAudio);

const player = new Player(scene);
const physics = new Physics(scene);

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

// Post-processing setup
const composer = new EffectComposer(renderer);

// Render pass - renders the scene
const renderPass = new RenderPass(scene, orbitCamera);
composer.addPass(renderPass);

// Bloom pass - adds bloom effect
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.2, // strength
  0.4, // radius
  0.85 // threshold
);
composer.addPass(bloomPass);

// Output pass - for proper color output
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Bloom settings object for UI controls
const bloomSettings = {
  strength: 1.5,
  radius: 0.4,
  threshold: 0.85,
};

// const axesHelper = new THREE.AxesHelper(200);
// scene.add(axesHelper);

// render loop
let previousTime = performance.now();
function animate() {
  if (!gameStarted) return;
  
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const dt = (currentTime - previousTime) / 1000;
  physics.update(dt, player, world);

  player.applyInputs(dt);
  stats.update();

  // Update the camera for the render pass
  const activeCamera = player.controls.isLocked ? player.camera : orbitCamera;
  renderPass.camera = activeCamera;

  // Render with post-processing
  composer.render();

  previousTime = currentTime;
}

window.addEventListener('resize', () => {
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Game initialization function
function initializeGame() {
  if (gameStarted) return;
  
  gameStarted = true;
  
  // Hide menu and show game
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('app').appendChild(renderer.domElement);
  
  setupLights();
  setupUI(
    world,
    player,
    physics,
    environmentSettings,
    bloomSettings,
    bloomPass,
    audioSettings
  );
  animate();
  
  // Start audio when game begins
  startAudio();
}

// Menu event listeners
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-button');
  startButton.addEventListener('click', initializeGame);
});
