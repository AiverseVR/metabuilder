/**
 * Movement Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

const COMPONENT_SUFFIX = "-controls",
  MAX_DELTA = 0.2, // ms
  EPS = 10e-6;

AFRAME.registerComponent("my-movement-controls", {
  /*******************************************************************
   * Schema
   */

  dependencies: ["rotation"],
  schema: {
    enabled: { default: true },
    controls: { default: ["gamepad", "trackpad", "keyboard", "touch"] },
    speed: { default: 0.125, min: 0 },
    fly: { default: false },
    constrainToNavMesh: { default: false },
    camera: { default: "[movement-controls] [camera]", type: "selector" },
    gender: { default: "m" },
    isSitting: { default: false },
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    this.avatar = document.querySelector("#avatar");
    this.avatar.setAttribute("rig-animation", `gender:${this.data.gender};clip:IDLE;loop:repeat;crossFadeDuration:0.2`);
    this.isMoving = false;
    this.isRunning = false;
    if (!this.avatar) {
      console.warn("Avatar not found");
    }

    const el = this.el;
    if (!this.data.camera) {
      this.data.camera = el.querySelector("[camera]");
    }
    this.velocityCtrl = null;

    this.velocity = new THREE.Vector3();
    this.heading = new THREE.Quaternion();

    // Navigation
    this.navGroup = null;
    this.navNode = null;

    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    } else {
      el.sceneEl.addEventListener("loaded", this.injectControls.bind(this));
    }

    /// ////////////////////////////// TOUCHSCREEN SETUP //////////////////////////////////////////
    this.handleTouch = (e) => {
      this.isMoving = true;
      if (!this.usingTouch) {
        this.usingTouch = true;
      }
      const { screenX, screenY } = e.touches[0];
      this.positionRaw = { x: screenX, y: screenY };
      this.startPositionRaw = this.startPositionRaw || this.positionRaw;
    };
    this.clearTouch = (e) => {
      this.startPositionRaw = null;
      this.isMoving = false;
    };
    window.addEventListener("touchstart", this.handleTouch);
    window.addEventListener("touchmove", this.handleTouch);
    window.addEventListener("touchend", this.clearTouch);

    const overlay = document.getElementById("overlay");
    this.joystickParent = document.createElement("div");
    this.joystickParent.classList.add("joystick-container", "absolute-fill", "shadowed");
    this.joystickPosition = document.createElement("div");
    this.joystickPosition.classList.add("joystick", "position");
    this.joystickParent.appendChild(this.joystickPosition);
    this.joystickOrigin = document.createElement("div");
    this.joystickOrigin.classList.add("joystick", "origin", "visible");
    this.joystickParent.appendChild(this.joystickOrigin);
    // overlay.appendChild(this.joystickParent);

    /// ////////////////////////////// KEYBOARD SETUP //////////////////////////////////////////
    const handleKeyDown = (e) => {
      if (["arrowup", "w"].includes(e.key.toLowerCase())) {
        this.fwd = true;
      }
      if (["arrowdown", "s"].includes(e.key.toLowerCase())) {
        this.back = true;
      }
      if (["arrowleft", "a"].includes(e.key.toLowerCase())) {
        this.left = true;
      }
      if (["arrowright", "d"].includes(e.key.toLowerCase())) {
        this.right = true;
      }
      if (["shift"].includes(e.key.toLowerCase())) {
        this.isRunning = true;
      }
      if (!this.usingKeyboard) {
        this.usingKeyboard = true;
      }
    };
    const handleKeyUp = (e) => {
      if (["arrowup", "w"].includes(e.key.toLowerCase())) {
        this.fwd = false;
      }
      if (["arrowdown", "s"].includes(e.key.toLowerCase())) {
        this.back = false;
      }
      if (["arrowleft", "a"].includes(e.key.toLowerCase())) {
        this.left = false;
      }
      if (["arrowright", "d"].includes(e.key.toLowerCase())) {
        this.right = false;
      }
      if (["shift"].includes(e.key.toLowerCase())) {
        this.isRunning = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  },

  update: function (prevData) {
    const el = this.el;
    const data = this.data;
    const nav = el.sceneEl.systems.nav;
    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    }
    if (nav && data.constrainToNavMesh !== prevData.constrainToNavMesh) {
      data.constrainToNavMesh ? nav.addAgent(this) : nav.removeAgent(this);
    }
  },

  injectControls: function () {
    const data = this.data;
    var name;

    for (let i = 0; i < data.controls.length; i++) {
      name = data.controls[i] + COMPONENT_SUFFIX;
      if (!this.el.components[name]) {
        this.el.setAttribute(name, "");
      }
    }
  },

  updateNavLocation: function () {
    this.navGroup = null;
    this.navNode = null;
  },

  /*******************************************************************
   * Tick
   */

  tick: (function () {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const clampedEnd = new THREE.Vector3();
    let targetCameraY = 0;

    return function (t, dt) {
      if (!dt) return;

      const el = this.el;
      const data = this.data;
      const avatar = this.avatar;
      const camera = data.camera;

      if (!data.enabled) return;

      const startPositionRaw = this.startPositionRaw;
      const positionRaw = this.positionRaw;

      // console.log(startPositionRaw);
      if (startPositionRaw) {
        const isDesktop = window.matchMedia("(min-width: 961px)").matches;
        const maxRawDistance = Math.min(window.innerWidth, window.innerHeight) / (isDesktop ? 12 : 6.5);

        let rawOffsetX = positionRaw.x - startPositionRaw.x;
        let rawOffsetY = positionRaw.y - startPositionRaw.y;
        const rawDistance = Math.sqrt(rawOffsetX ** 2 + rawOffsetY ** 2);
        // console.log(rawOffsetX, rawOffsetY);
        if (rawDistance > maxRawDistance) {
          // Normalize to maxRawDistance
          rawOffsetX *= maxRawDistance / rawDistance;
          rawOffsetY *= maxRawDistance / rawDistance;
        }
        const widthScale = 100 / window.innerWidth;
        const heightScale = 100 / window.innerHeight;
        this.joystickParent.classList.add("visible");
        this.joystickOrigin.style.left = `${startPositionRaw.x * widthScale}%`;
        this.joystickOrigin.style.top = `${startPositionRaw.y * heightScale}%`;
        this.joystickPosition.style.left = `${(startPositionRaw.x + rawOffsetX) * widthScale}%`;
        this.joystickPosition.style.top = `${(startPositionRaw.y + rawOffsetY) * heightScale}%`;
        this.offsetX = rawOffsetX / maxRawDistance;
        this.offsetY = rawOffsetY / maxRawDistance;
      }

      this.checkInput();

      this.updateVelocityCtrl();
      const velocityCtrl = this.velocityCtrl;
      const velocity = this.velocity;

      if (data.isSitting) {
        if (this.isMoving && this.fwd) {
          this.el.emit("stand-up");
          return;
        }
        avatar.object3D.rotation.y = Math.PI;
        avatar.setAttribute(
          "rig-animation",
          `gender:${this.data.gender};clip:SITTING;loop:repeat;crossFadeDuration:0.2`
        );
        return;
      }

      if (!velocityCtrl) {
        avatar.setAttribute("rig-animation", `gender:${this.data.gender};clip:IDLE;loop:repeat;crossFadeDuration:0.2`);
        return;
      }

      // Update velocity. If FPS is too low, reset.
      if (dt / 1000 > MAX_DELTA) {
        velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (data.constrainToNavMesh && velocityCtrl.isNavMeshConstrained !== false) {
        if (velocity.lengthSq() < EPS) {
          return;
        }
        if (!this.isMoving) {
          this.isMoving = true;
        }
        avatar.setAttribute(
          "rig-animation",
          `gender:${this.data.gender};clip:${this.isRunning ? "RUNNING" : "WALKING"};loop:repeat;crossFadeDuration:0.2`
        );
        // this.checkInput();
        const cameraY = camera.object3D.rotation.y;
        let joystickRot = Math.atan2(this.forward, this.side);
        joystickRot -= cameraY;
        targetCameraY = -joystickRot - Math.PI / 2;
        if (this.usingKeyboard) {
          avatar.object3D.rotation.y = targetCameraY;
        }

        start.copy(el.object3D.position);
        end
          .copy(velocity)
          .multiplyScalar(dt / 1000)
          .add(start);

        const nav = el.sceneEl.systems.nav;
        this.navGroup = this.navGroup === null ? nav.getGroup(start) : this.navGroup;
        this.navNode = this.navNode || nav.getNode(start, this.navGroup);
        this.navNode = nav.clampStep(start, end, this.navGroup, this.navNode, clampedEnd);
        el.object3D.position.copy(clampedEnd);
      } else if (el.hasAttribute("velocity")) {
        // avatar.setAttribute(
        //   "rig-animation",
        //   `gender:${this.data.gender};clip:${
        //     this.isRunning ? "RUNNING" : "WALKING"
        //   };loop:repeat;crossFadeDuration:0.2`
        // );
        // el.setAttribute("velocity", velocity);
      } else {
        avatar.setAttribute(
          "rig-animation",
          `gender:${this.data.gender};clip:${
            this.isMoving ? (this.isRunning ? "RUNNING" : "WALKING") : "IDLE"
          };loop:repeat;crossFadeDuration:0.2`
        );
        el.object3D.position.x += (velocity.x * dt) / 1000;
        el.object3D.position.y += (velocity.y * dt) / 1000;
        el.object3D.position.z += (velocity.z * dt) / 1000;

        const cameraY = camera.object3D.rotation.y;
        let joystickRot = Math.atan2(this.forward, this.side);
        joystickRot -= cameraY;
        targetCameraY = -joystickRot - Math.PI / 2;
        if (this.usingKeyboard) {
          avatar.object3D.rotation.y = targetCameraY;
        }
      }
    };
  })(),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function () {
    const data = this.data;
    if (data.enabled) {
      for (let i = 0, l = data.controls.length; i < l; i++) {
        const control = this.el.components[data.controls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
      this.velocityCtrl = null;
      // throw new Error("No active velocity control found");
    }
  },

  updateVelocity: (function () {
    const vector2 = new THREE.Vector2();
    const quaternion = new THREE.Quaternion();

    return function (dt) {
      let dVelocity;
      const el = this.el;
      const control = this.velocityCtrl;
      const velocity = this.velocity;
      const data = this.data;

      if (control) {
        if (control.getVelocityDelta) {
          dVelocity = control.getVelocityDelta(dt);
        } else if (control.getVelocity) {
          velocity.copy(control.getVelocity());
          return;
        } else if (control.getPositionDelta) {
          velocity.copy(control.getPositionDelta(dt).multiplyScalar(1000 / dt));
          return;
        } else {
          throw new Error("Incompatible movement controls: ", control);
        }
      }

      if (el.hasAttribute("velocity") && !data.constrainToNavMesh) {
        velocity.copy(this.el.getAttribute("velocity"));
      }

      if (dVelocity && data.enabled) {
        const cameraEl = data.camera;

        // Rotate to heading
        quaternion.copy(cameraEl.object3D.quaternion);
        quaternion.premultiply(el.object3D.quaternion);
        dVelocity.applyQuaternion(quaternion);

        const factor = dVelocity.length();
        const speed = this.data.speed * (this.isRunning ? 2.5 : 1);
        if (data.fly) {
          velocity.copy(dVelocity);
          velocity.multiplyScalar(speed * 16.66667);
        } else {
          vector2.set(dVelocity.x, dVelocity.z);
          vector2.setLength(factor * speed * 16.66667);
          velocity.x = vector2.x;
          velocity.z = vector2.y;
        }
      }
    };
  })(),
  checkInput: (function () {
    const sensitivity = 0.3;
    return function () {
      if (this.usingKeyboard) {
        if (!this.fwd && !this.back && !this.left && !this.right) {
          this.usingKeyboard = false;
          this.isMoving = false;
          return;
        }
        // diagonal controls
        if (this.fwd && this.left) {
          this.forward = -Math.min(Math.max(-1, -1), 1);
          this.side = -Math.min(Math.max(-1, -1), 1);
        }
        if (this.fwd && this.right) {
          this.forward = -Math.min(Math.max(-1, -1), 1);
          this.side = -Math.min(Math.max(-1, 1), 1);
        }
        if (this.back && this.left) {
          this.forward = -Math.min(Math.max(-1, 1), 1);
          this.side = -Math.min(Math.max(-1, -1), 1);
        }
        if (this.back && this.right) {
          this.forward = -Math.min(Math.max(-1, 1), 1);
          this.side = -Math.min(Math.max(-1, 1), 1);
        }
        // cardinal controls
        if (this.fwd && !this.left && !this.right) {
          this.forward = -Math.min(Math.max(-1, -1), 1);
          this.side = 0;
        }
        if (this.back && !this.left && !this.right) {
          this.forward = -Math.min(Math.max(-1, 1), 1);
          this.side = 0;
        }
        if (this.left && !this.fwd && !this.back) {
          this.forward = 0;
          this.side = -Math.min(Math.max(-1, -1), 1);
        }
        if (this.right && !this.fwd && !this.back) {
          this.forward = 0;
          this.side = -Math.min(Math.max(-1, 1), 1);
        }
        this.isMoving = true;
        return;
      }
      if (this.usingTouch) {
        if (
          this.offsetY > sensitivity ||
          this.offsetY < -sensitivity ||
          this.offsetX < -sensitivity ||
          this.offsetX > sensitivity
        ) {
          this.forward = -Math.min(Math.max(-1, this.offsetY), 1);
          this.side = -Math.min(Math.max(-1, this.offsetX), 1);
          // console.log(this.forward, this.side);
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
        return;
      }
    };
  })(),
});
