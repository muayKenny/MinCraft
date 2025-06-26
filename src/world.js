import * as THREE from 'three';
import { max } from 'three/tsl';

const geometry = new THREE.BoxGeometry();

const material = new THREE.MeshLambertMaterial({
  color: 0x00ff00,
});

export class World extends THREE.Group {
  data = [];
  constructor(size = { width: 64, height: 1 }) {
    super();
    this.size = size;
  }

  generate() {
    this.generateTerrain();
    console.log(this.data);
    this.generateMeshes();
  }

  generateTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({ id: 1, instanceId: null });
        }
        slice.push(row);
      }
      this.data.push(slice);
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

          if (blockId !== 0) {
            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }
    this.add(mesh);
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
}
