import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { RNG } from './rng';
import { blocks } from './blocks';

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshLambertMaterial({
  color: 0x00ff00,
});

export class World extends THREE.Group {
  data = [];
  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    },
  };
  constructor(size = { width: 64, height: 20 }) {
    super();
    this.size = size;
  }

  generate() {
    this.initializeTerrain();
    this.generateTerrain();
    this.generateMeshes();
  }

  /*
   * initializing world terrain data
   */
  initializeTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  generateTerrain() {
    const rng = new RNG(this.params.seed);
    const simplex = new SimplexNoise(rng);
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        const noiseValue = simplex.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );
        const scaledNoise =
          this.params.terrain.offset +
          this.params.terrain.magnitude * noiseValue;

        let height = this.size.height * scaledNoise;
        height = Math.max(
          0,
          Math.min(Math.floor(height), this.size.height - 1)
        );
        for (let y = 0; y <= height; y++) {
          if (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else if (y < height) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  generateMeshes() {
    this.clear();

    const maxCount = this.size.width * this.size.height * this.size.width;
    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    mesh.count = 0;

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;
          const instanceId = mesh.count;
          const blockType = Object.values(blocks).find((x) => x.id === blockId);
          if (blockId !== blocks.empty.id && !this.isBlockObscured(x, y, z)) {
            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockId(x, y, z, instanceId);
            console.log(blockType.color);
            mesh.setColorAt(instanceId, new THREE.Color(blockType.color));
            mesh.count++;
          }
        }
      }
    }
    this.add(mesh);
  }

  /**
   * check if the (x,y,z) cords are in bounds
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean} true if in bounds, false otherwise
   * */
  inbounds(x, y, z) {
    if (
      x >= 0 &&
      x < this.size.width &&
      y >= 0 &&
      y < this.size.height &&
      z >= 0 &&
      z < this.size.width
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets the block data at (x,y,z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {object|null} The block data or null if out of bounds
   * */
  getBlock(x, y, z) {
    if (this.inbounds(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  }

  /**
   * Sets the block id
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {null}
   * */
  setBlockId(x, y, z, id) {
    if (this.inbounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
   * Returns true if this block is completely hidden by other blocks
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  isBlockObscured(x, y, z) {
    const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
    const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
    const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

    // If any of the block's sides is exposed, it is not obscured
    if (
      up === blocks.empty.id ||
      down === blocks.empty.id ||
      left === blocks.empty.id ||
      right === blocks.empty.id ||
      forward === blocks.empty.id ||
      back === blocks.empty.id
    ) {
      return false;
    } else {
      return true;
    }
  }
}
