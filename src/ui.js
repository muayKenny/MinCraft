import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export function createUI(world) {
  const gui = new GUI();
  gui.add(world.size, 'width', 1, 128, 1).name('Width');
  gui.add(world.size, 'height', 1, 64, 1).name('Height');
  //   gui.add(world, 'threshold', 0, 1, 0.01).name('Noise');

  gui.onChange(() => {
    world.generate();
  });
}
