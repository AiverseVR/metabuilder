const domain = window.location.hostname;
const serverUrl = `https://3d-server.${domain}`;

AFRAME.registerComponent('naf-dynamic-room', {
  init: function () {
    var el = this.el;
    var networkedComp = {
      room: roomId,
      adapter: 'easyrtc', // or easyrtc
      audio: false,
      video: false,
      serverUrl: 'https://3d.metaworldz.dev',
      debug: true,
      connectOnLoad: false,
    };
    el.setAttribute('networked-scene', networkedComp);
    console.log('naf-dynamic-room', networkedComp);
  },
});

function setupNafComponents() {
  NAF.schemas.getComponentsOriginal = NAF.schemas.getComponents;

  NAF.schemas.getComponents = (template) => {
    if (!NAF.schemas.hasTemplate('#avatar-template')) {
      NAF.schemas.add({
        template: '#avatar-template',
        components: ['position', 'rotation', 'gltf-model', 'rig-animation'],
      });
    }

    if (!NAF.schemas.hasTemplate('#player-template')) {
      NAF.schemas.add({
        template: '#player-template',
        components: ['position', 'rotation'],
      });
    }

    if (!NAF.schemas.hasTemplate('#name-template')) {
      NAF.schemas.add({
        template: '#name-template',
        components: ['value', 'position', 'align', 'width'],
      });
    }

    const components = NAF.schemas.getComponentsOriginal(template);
    return components;
  };
}
