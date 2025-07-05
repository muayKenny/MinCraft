import * as THREE from 'three';
import { WorldChunk } from './worldChunk';

export class World extends THREE.Group {
  chunkSize = {
    width: 64,
    height: 32,
  };
  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.5,
    },
  };

  constructor(seed = 0) {
    super();
    this.seed = seed;
  }

  generate() {
    // this.chunk = new WorldChunk(this.chunkSize, this.params);
    // this.chunk.generate();
    // this.add(this.chunk);
    this.disposeChunks();
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const chunk = new WorldChunk(this.chunkSize, this.params);
        chunk.position.set(
          x * this.chunkSize.width,
          0,
          z * this.chunkSize.width
        );
        chunk.generate();
        chunk.userData = {
          x,
          z,
        };
        this.add(chunk);
      }
    }
    this.chunk = this.children[0]; // For convenience, set the first chunk as the current chunk
  }

  /* getblock */
  getBlock(x, y, z) {
    return this.chunk.getBlock(x, y, z);
  }

  disposeChunks() {
    this.traverse((chunk) => {
      if (chunk.disposeInstances) {
        chunk.disposeInstances();
      }
    });
  }
}
