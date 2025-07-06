import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { World } from './world';
import { resources } from './blocks';

/**
 *
 * @param {World} world
 */
export function setupUI(
  world,
  player,
  physics,
  environmentSettings,
  bloomSettings,
  bloomPass,
  audioSettings
) {
  if (!window.location.hash.toLowerCase().includes('debug')) return;

  const gui = new GUI();

  // Environment folder
  const environmentFolder = gui.addFolder('Environment');
  const environmentMapNames = [
    'Fantasy Castles',
    'Anime Cherry Blossom',
    'Neon City Night',
    'Sci-Fi Skyscrapers',
  ];
  environmentFolder
    .add(environmentSettings, 'current', environmentMapNames)
    .name('Environment Map')
    .onChange((value) => {
      environmentSettings.loadEnvironmentMap(value);
    });
  environmentFolder.close();

  // Audio controls folder
  const audioFolder = gui.addFolder('Audio');
  audioFolder
    .add(audioSettings, 'volume', 0, 1, 0.01)
    .name('Volume')
    .onChange((value) => {
      audioSettings.setVolume(value);
    });

  // Create a custom controller for play/pause
  const audioControls = {
    'Play/Pause': function () {
      if (audioSettings.isPlaying) {
        audioSettings.pause();
      } else {
        audioSettings.play();
      }
    },
  };
  audioFolder.add(audioControls, 'Play/Pause');
  audioFolder.close();

  const playerFolder = gui.addFolder('Player');
  playerFolder.add(player, 'maxSpeed', 1, 20, 0.1).name('Max Speed');
  playerFolder.add(player, 'jumpSpeed', 1, 10, 0.1).name('Jump Speed');
  playerFolder.add(player.boundsHelper, 'visible').name('Show Player Bounds');
  playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Helper');
  playerFolder.close();

  const physicsFolder = gui.addFolder('Physics');
  physicsFolder.add(physics.helpers, 'visible').name('Visualize Collisions');
  physicsFolder.add(physics, 'simulationRate', 10, 1000).name('Sim Rate');
  physicsFolder.close();

  const worldFolder = gui.addFolder('World');
  worldFolder.add(world, 'drawDistance', 0, 5, 1).name('Draw Distance');
  // worldFolder
  //   .add(world, 'proceduralGeneration', false)
  //   .name('Procedural Generation');
  worldFolder.close();

  const terrainFolder = worldFolder.addFolder('Terrain');
  terrainFolder.add(world.params, 'seed', 0, 10000, 1).name('Seed');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('Offset');
  terrainFolder.close();

  const resourcesFolder = gui.addFolder('Resources');
  for (const resource of resources) {
    const resourceFolder = resourcesFolder.addFolder(resource.name);
    resourceFolder.add(resource, 'scarcity', 0, 1).name('Scarcity');
    const scaleFolder = resourceFolder.addFolder('Scale').close();
    scaleFolder.add(resource.scale, 'x', 10, 100).name('X Scale');
    scaleFolder.add(resource.scale, 'y', 10, 100).name('Y Scale');
    scaleFolder.add(resource.scale, 'z', 10, 100).name('Z Scale');
    resourceFolder.close();
  }
  resourcesFolder.close();
  // Bloom post-processing folder
  const bloomFolder = gui.addFolder('Bloom');
  bloomFolder
    .add(bloomSettings, 'strength', 0, 3, 0.1)
    .name('Strength')
    .onChange((value) => {
      bloomPass.strength = value;
    });
  bloomFolder
    .add(bloomSettings, 'radius', 0, 1, 0.01)
    .name('Radius')
    .onChange((value) => {
      bloomPass.radius = value;
    });
  bloomFolder
    .add(bloomSettings, 'threshold', 0, 1, 0.01)
    .name('Threshold')
    .onChange((value) => {
      bloomPass.threshold = value;
    });
  bloomFolder.close();

  terrainFolder.onChange((event) => {
    world.generate();
  });
  worldFolder.onChange((event) => {
    console.log('yo');
    world.generate();
  });
}
