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
  getChunk(chunkX, chunkZ) {
    return this.children.find(
      (chunk) => chunk.userData.x === chunkX && chunk.userData.z === chunkZ
    );
  }

  worldToChunkCoords(x, y, z) {
    const chunkCoords = {
      x: Math.floor(x / this.chunkSize.width),
      z: Math.floor(z / this.chunkSize.width),
    };
    const blockCoords = {
      x: x - chunkCoords.x * this.chunkSize.width,
      y,
      z: z - chunkCoords.z * this.chunkSize.width,
    };
    return {
      chunk: chunkCoords,
      block: blockCoords,
    };
  }

  getBlock(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      return chunk.getBlock(coords.block.x, coords.block.y, coords.block.z);
    } else {
      return null;
    }
  }

  disposeChunks() {
    this.traverse((chunk) => {
      if (chunk.disposeInstances) {
        chunk.disposeInstances();
      }
    });
  }
}
