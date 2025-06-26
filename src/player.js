import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

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

  /**
   * @params {THREE.scene}
   * */
  constructor(scene) {
    this.camera.position.set(32, 32, 32);
    this.cameraHelper.visible = false;

    scene.add(this.camera);
    scene.add(this.cameraHelper);

    // Wireframe mesh visualizing the player's bounding cylinder
    this.boundsHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );

    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
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
    switch (event.code) {
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
        this.position.set(32, 20, 32);
        this.velocity.set(0, 0, 0);
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
        if (event.repeat) break;
        if (this.controls.isLocked) {
          console.log('unlocking controls');
          this.controls.unlock();
        } else {
          console.log('locking controls');
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
