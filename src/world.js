import * as THREE from 'three';
import { WorldChunk } from './worldChunk';
import { DataStore } from './dataStore';

export class World extends THREE.Group {
  asyncLoading = true; // If true, chunks will be generated in the background
  drawDistance = 3;
  chunkSize = {
    width: 64,
    height: 32,
  };
  params = {
    seed: 0,
    terrain: {
      scale: 40,
      magnitude: 0.15,
      offset: 0.25,
      waterHeight: 5,
    },
    trees: {
      frequency: 0.01,
      trunkHeight: {
        min: 6,
        max: 8,
      },
      canopy: {
        size: {
          min: 2,
          max: 4,
        },
        density: 0.5,
      },
    },
    clouds: {
      density: 0.1,
      scale: 30,
    },
  };

  dataStore = new DataStore();

  constructor(seed = 0) {
    super();
    this.loaded = false;
    this.proceduralGeneration = false;
    this.seed = seed;

    document.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'F1':
          this.save();
          break;
        case 'F2':
          this.load();
          break;
      }
    });
  }

  generate() {
    this.dataStore.clear();
    this.disposeChunks();
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const chunk = new WorldChunk(
          this.chunkSize,
          this.params,
          this.dataStore
        );
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
    this.loaded = true;
  }

  update(player) {
    if (!this.proceduralGeneration) {
      return;
    }
    const visibleChunks = this.getVisibleChunks(player);
    const chunksToAdd = this.getChunksToAdd(visibleChunks);
    this.removeUnusedChunks(visibleChunks);
    for (const chunk of chunksToAdd) {
      this.generateChunk(chunk.x, chunk.z);
    }
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

  /**
   * Returns an array containing the coordinates of the chunks that
   * are current visible to the player
   * @param {Player} player
   * @returns {{ x: number, z: number}[]}
   */
  getVisibleChunks(player) {
    // Get the coordinates of the chunk the player is currently in
    const coords = this.worldToChunkCoords(
      player.position.x,
      0,
      player.position.z
    );

    const visibleChunks = [];
    for (
      let x = coords.chunk.x - this.drawDistance;
      x <= coords.chunk.x + this.drawDistance;
      x++
    ) {
      for (
        let z = coords.chunk.z - this.drawDistance;
        z <= coords.chunk.z + this.drawDistance;
        z++
      ) {
        visibleChunks.push({ x, z });
      }
    }

    return visibleChunks;
  }

  /**
   * Returns an array containing the coordinates of the chunks that
   * are not yet loaded and need to be added to the scene
   * @param {{ x: number, z: number}[]} visibleChunks
   * @returns {{ x: number, z: number}[]}
   */
  getChunksToAdd(visibleChunks) {
    // Filter down visible chunks, removing ones that already exist
    return visibleChunks.filter((chunkToAdd) => {
      const chunkExists = this.children
        .map((obj) => obj.userData)
        .find(({ x, z }) => chunkToAdd.x === x && chunkToAdd.z === z);

      return !chunkExists;
    });
  }

  /**
   * Returns the block at the given coordinates
   * @param {number} x - The x coordinate of the block
   * @param {number} y - The y coordinate of the block
   * @param {number} z - The z coordinate of the block
   * @returns {Block|null} - The block at the given coordinates, or null if it doesn't exist
   */
  getBlock(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      return chunk.getBlock(coords.block.x, coords.block.y, coords.block.z);
    } else {
      return null;
    }
  }

  /**
   * Generates the chunk at the (x,z) coordinates
   * @param {number} x
   * @param {number} z
   */
  generateChunk(x, z) {
    const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
    chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
    chunk.userData = { x, z };

    if (this.asyncLoading) {
      requestIdleCallback(chunk.generate.bind(chunk), { timeout: 1000 });
    } else {
      console.log(`Generating chunk at X: ${x} Z: ${z}`);
      chunk.generate();
    }

    this.add(chunk);
    //console.log(`Creating chunk at X: ${x} Z: ${z}`);
  }

  /**
   * Adds a block at the given coordinates
   * @param {number} x - The x coordinate of the block
   * @param {number} y - The y coordinate of the block
   * @param {number} z - The z coordinate of the block
   * @param {number} blockId - The ID of the block to add
   */
  addBlock(x, y, z, blockId) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.addBlock(coords.block.x, coords.block.y, coords.block.z, blockId);

      // hide any adjacent blocks
      this.hideBlockIfNeeded(x - 1, y, z);
      this.hideBlockIfNeeded(x + 1, y, z);
      this.hideBlockIfNeeded(x, y - 1, z);
      this.hideBlockIfNeeded(x, y + 1, z);
      this.hideBlockIfNeeded(x, y, z - 1);
      this.hideBlockIfNeeded(x, y, z + 1);
    }
  }

  /**
   * Reveals the block at (x,y,z) by adding a new mesh instance
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  revealBlock(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.addBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }

  /**
   * Hides the block at (x,y,z) by removing the  new mesh instance
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  hideBlockIfNeeded(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    // remove the block instance if it is obscured
    if (
      chunk &&
      chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)
    ) {
      chunk.deleteBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }

  /**
   * Removes current loaded chunks that are no longer visible to the player
   * @param {{ x: number, z: number}[]} visibleChunks
   */
  removeUnusedChunks(visibleChunks) {
    // Filter current chunks, getting ones that don't exist in visible chunks
    const chunksToRemove = this.children.filter((obj) => {
      const { x, z } = obj.userData;
      const chunkExists = visibleChunks.find((visibleChunk) => {
        return visibleChunk.x === x && visibleChunk.z === z;
      });

      return !chunkExists;
    });

    for (const chunk of chunksToRemove) {
      chunk.disposeInstances();
      this.remove(chunk);
      console.log(
        `Removed chunk at X: ${chunk.userData.x} Z: ${chunk.userData.z}`
      );
    }
  }

  disposeChunks() {
    this.traverse((chunk) => {
      if (chunk.disposeInstances) {
        chunk.disposeInstances();
      }
    });
  }

  /**
   * Removes a block at the given coordinates
   * @param {number} x - The x coordinate of the block
   * @param {number} y - The y coordinate of the block
   * @param {number} z - The z coordinate of the block
   */
  removeBlock(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.removeBlock(coords.block.x, coords.block.y, coords.block.z);

      // Reveal any adjacent blocks that may have been exposed after the block at (x,y,z) was removed
      this.revealBlock(x - 1, y, z);
      this.revealBlock(x + 1, y, z);
      this.revealBlock(x, y - 1, z);
      this.revealBlock(x, y + 1, z);
      this.revealBlock(x, y, z - 1);
      this.revealBlock(x, y, z + 1);
    } else {
      console.warn(`Chunk at (${coords.chunk.x}, ${coords.chunk.z}) not found`);
    }
  }
  /**
   * Hides the block at (x,y,z) by removing the  new mesh instance
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  hideBlock(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (
      chunk &&
      chunk.isBlockObsured(coords.block.x, coords.block.y, coords.block.z)
    ) {
      chunk.deleteBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }

  /**
   * Saves the world data to local storage
   */
  save() {
    localStorage.setItem('minecraft_params', JSON.stringify(this.params));
    localStorage.setItem('minecraft_data', JSON.stringify(this.dataStore.data));
    alert('Game saved successfully');
  }

  /**
   * Loads the game from disk
   */
  load() {
    this.params = JSON.parse(localStorage.getItem('minecraft_params'));
    this.dataStore.data = JSON.parse(localStorage.getItem('minecraft_data'));
    alert('Game loaded successfully');
    this.regenerate();
  }
}
