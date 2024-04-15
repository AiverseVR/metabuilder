AFRAME.registerComponent("name-tag", {
  init: function () {
    this.rig = document.querySelector("#cameraRig");
  },
  tick: function () {
    this.el.object3D.rotation.y = this.rig.object3D.rotation.y;
    this.el.object3D.rotation.x = this.rig.object3D.rotation.x;
    this.el.object3D.rotation.z = this.rig.object3D.rotation.z;
  },
});
