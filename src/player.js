import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import { blocks } from './blocks.js';

const CENTER_SCREEN = new THREE.Vector2();

export class Player {
  maxSpeed = 10;
  input = new THREE.Vector3();
  velocity = new THREE.Vector3();
  #worldVelocity = new THREE.Vector3();
  onGround = false;
  jumpSpeed = 10;
  radius = 0.5;
  height = 1.75;

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  controls = new PointerLockControls(this.camera, document.body);
  cameraHelper = new THREE.CameraHelper(this.camera);

  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0,
    3
  );

  selectedCoords = null;
  activeBlockId = blocks.grass.id;

  /**
   * @params {THREE.scene}
   * */
  constructor(scene, audioSettings = null) {
    this.audioSettings = audioSettings;
    this.camera.position.set(40, 30, 27);
    this.camera.rotation.y = -Math.PI / 2;
    this.cameraHelper.visible = false;

    scene.add(this.camera);
    scene.add(this.cameraHelper);

    // Set raycaster to use layer 0 so it doesn't interact with water mesh on layer 1
    this.raycaster.layers.set(0);
    this.camera.layers.enable(1);

    // Wireframe mesh visualizing the player's bounding cylinder
    this.boundsHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );

    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    this.controls.addEventListener('lock', function () {
      console.log('locked');
      document.getElementById('overlay').style.visibility = 'hidden';
    });

    this.controls.addEventListener('unlock', function () {
      document.getElementById('overlay').style.visibility = 'visible';
    });

    const selectionMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.3,
    });
    const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial);
    scene.add(this.selectionHelper);
  }

  applyInputs(dt) {
    if (this.controls.isLocked === true) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;
      this.controls.moveRight(this.velocity.x * dt);
      this.controls.moveForward(this.velocity.z * dt);
      this.position.y += this.velocity.y * dt;
    }

    document.getElementById('player-position').innerHTML = this.toString(
      this.camera.position
    );
  }

  /**
   * Updates the position of the player's bounding cylinder helper
   */
  updateBoundsHelper() {
    this.boundsHelper.position.copy(this.camera.position);
    this.boundsHelper.position.y -= this.height / 2;
  }

  /**
   *
   * @type {THREE.Vecto3}
   */
  get position() {
    return this.camera.position;
  }

  /**
   * Returns the velocity of the player in world coordinates
   * @returns {THREE.Vector3}
   */
  get worldVelocity() {
    this.#worldVelocity.copy(this.velocity);
    this.#worldVelocity.applyEuler(
      new THREE.Euler(0, this.camera.rotation.y, 0)
    );
    return this.#worldVelocity;
  }

  update(world) {
    this.updateRaycaster(world);
  }

  updateRaycaster(world) {
    this.raycaster.setFromCamera(CENTER_SCREEN, this.camera);
    const intersects = this.raycaster.intersectObject(world, true);
    // console.log(intersects);

    if (intersects.length > 0) {
      const intersection = intersects[0];

      // get the position of the chunk that the block is in
      const chunk = intersection.object.parent;

      // get transformation matrix of the intersected block
      const blockMatrix = new THREE.Matrix4();
      intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

      // extract the poistion from the block's transformation matrix
      this.selectedCoords = chunk.position.clone();
      this.selectedCoords.applyMatrix4(blockMatrix);

      // if we are adding a block to the world, move the selection indicator
      // ->>> to the nearest adjacent block
      if (this.activeBlockId !== blocks.empty.id) {
        this.selectedCoords.add(intersection.normal);
      }

      this.selectionHelper.position.copy(this.selectedCoords);
      this.selectionHelper.visible = true;
    } else {
      this.selectedCoords = null;
      this.selectionHelper.visible = false;
    }
  }

  /**
   * Applies a change in velocity 'dv' that is specified in the world frame
   * @param {THREE.Vector3} dv
   */
  applyWorldDeltaVelocity(dv) {
    dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
    this.velocity.add(dv);
  }

  /**
   * Event handler for 'keyup' event
   * @param {KeyboardEvent} event
   */
  onKeyDown(event) {
    if (!this.controls.isLocked && event.code !== 'Escape') {
      this.controls.lock();
    }

    switch (event.code) {
      case 'Digit0':
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
        // Update the selected toolbar icon
        document
          .getElementById(`toolbar-${this.activeBlockId}`)
          ?.classList.remove('selected');
        document
          .getElementById(`toolbar-${event.key}`)
          ?.classList.add('selected');
        this.activeBlockId = Number(event.key);
        console.log(`activeBlockId = ${event.key}`);
        break;
      case 'KeyW':
        this.input.z = this.maxSpeed;
        break;
      case 'KeyA':
        this.input.x = -this.maxSpeed;
        break;
      case 'KeyS':
        this.input.z = -this.maxSpeed;
        break;
      case 'KeyD':
        this.input.x = this.maxSpeed;
        break;
      case 'KeyR':
        if (this.repeat) break;
        this.position.set(50, 11, 27);
        this.velocity.set(0, 0, 0);
        break;
      case 'KeyM':
        if (event.repeat) break;
        if (this.audioSettings) {
          if (this.audioSettings.isPlaying) {
            this.audioSettings.pause();
          } else {
            this.audioSettings.play();
          }
        }
        break;
      case 'Space':
        if (this.onGround) {
          this.velocity.y += this.jumpSpeed;
        }
        break;
    }
  }

  /**
   * Event handler for 'keyup' event
   * @param {KeyboardEvent} event
   */
  onKeyUp(event) {
    switch (event.code) {
      case 'Escape':
        if (event.repeat) return;
        // Only unlock if currently locked
        if (this.controls.isLocked) {
          this.controls.unlock();
        } else {
          this.controls.lock();
        }
        break;
      case 'KeyW':
        this.input.z = 0;
        break;
      case 'KeyA':
        this.input.x = 0;
        break;
      case 'KeyS':
        this.input.z = 0;
        break;
      case 'KeyD':
        this.input.x = 0;
        break;
    }
  }

  /**
   * Returns player position in a readable string form
   * @returns {string}
   */
  toString() {
    let str = '';
    str += `X: ${this.position.x.toFixed(3)} `;
    str += `Y: ${this.position.y.toFixed(3)} `;
    str += `Z: ${this.position.z.toFixed(3)}`;
    return str;
  }
}
