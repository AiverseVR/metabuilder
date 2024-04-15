const playerGlb = '/assets/space/models/633d9a093fc70071e8a9f874.glb';

function getQueryParams(key) {
  const params = {};
  window.location.search
    .slice(1)
    .split('&')
    .forEach((param) => {
      const [key, value] = param.split('=');
      params[key] = value;
    });
  if (key) {
    return params[key];
  }
  return params;
}

function openInspector() {
  setTimeout(() => {
    const sceneEl = document.querySelector('a-scene');
    sceneEl.components.inspector.openInspector();
  }, 1000);
}

const randomText = new Date().getTime().toString(36);
const randomPlayerName = (() => 'Player-' + randomText.substring(randomText.length - 4))();

async function onDOMContentLoaded() {
  setupNafComponents();
  const scene = document.querySelector('a-scene');
  // window.easyrtc.setUsername(randomPlayerName);
  // scene.emit('connect');

  spawnAvatar(playerGlb);
  const sceneEl = document.querySelector('a-scene');
  try {
    // &#x3D; is "="
    const entities = JSON.parse(entitiesEscaped.replace(/&quot;/g, '"').replace(/&#x3D;/g, '='));
    for (const entity of entities) {
      const entityEl = await createEntity(entity);
      sceneEl.appendChild(entityEl);
    }
  } catch (error) {
    alert(error.message);
  }
  if (getQueryParams('debug')) {
    sceneEl.hasLoaded ? openInspector() : sceneEl.addEventListener('loaded', openInspector);
  }
}

async function createEntity(entity) {
  const { id, components, position, rotation, scale, visible = true } = entity;
  const entityEl = document.createElement('a-entity');
  entityEl.id = id;
  entityEl.setAttribute('position', position);
  entityEl.setAttribute('rotation', rotation);
  entityEl.setAttribute('scale', scale);
  if (id === 'navmesh') {
    entityEl.setAttribute('visible', false);
  }
  for (const name in components) {
    const properties = components[name];
    entityEl.setAttribute(name, properties);
  }
  return entityEl;
}

const state = {};

const handleModelLoaded = (el, hasLoaded, callback) => {
  if (hasLoaded) {
    return (state.avatarLoadedPercentage = 100);
  }
  function onLoaded() {
    el.removeEventListener('model-loaded', onLoaded);
    state.avatarLoadedPercentage = 100;
    callback && callback();
  }
  return el.addEventListener('model-loaded', onLoaded);
};

const spawnAvatar = async (glbFile) => {
  state.avatarLoadedPercentage = 0;

  const gender = await getGender(glbFile);

  // Check scene is loaded
  const scene = document.querySelector('a-scene');

  // Create camera rig if not already created
  let cameraRig = document.querySelector('#cameraRig');
  if (!cameraRig) {
    cameraRig = createRigElement(gender);

    const cameraEl = createCameraRig();
    const avatarEl = createAvatar(glbFile);
    const nameEl = createName(randomPlayerName);

    cameraRig.appendChild(cameraEl);
    cameraRig.appendChild(avatarEl);
    cameraRig.appendChild(nameEl);

    handleModelLoaded(avatarEl, false, function () {
      cameraEl.setAttribute('camera', 'active', true);
    });
    scene.appendChild(cameraRig);
  } else {
    const currentAvatar = document.querySelector('#avatar');
    currentAvatar.setAttribute('gltf-model', `${glbFile}?t=${Date.now()}`);
    handleModelLoaded(currentAvatar, false);
    return get2DAvatar(glbFile);
  }
};

const getGender = async (glbFile) => {
  try {
    const jsonUrl = glbFile.replace('.glb', '.json');
    const response = await fetch(jsonUrl);
    const data = await response.json();
    // Masculine models are larger in size so they use a larger animation rig
    if (data.outfitGender === 'masculine') {
      return 'm';
    }
    return 'f';
  } catch (error) {
    alert('Failed to get gender');
    return 'f';
  }
};

const createRigElement = (gender) => {
  const { scale } = appConfig;
  const rig = document.createElement('a-entity');
  rig.id = 'cameraRig';
  rig.setAttribute('core-entity', '');
  rig.setAttribute('simple-navmesh-constraint', 'navmesh:#navmesh;fall:1;height:0;exclude:.navmesh-hole');
  rig.setAttribute('position', `${defaultSpawnPosition.x} ${defaultSpawnPosition.y} ${defaultSpawnPosition.z}`);
  rig.setAttribute('rotation', '0 0 0');
  if (scale) {
    rig.setAttribute('scale', `${0.9 * scale} ${0.9 * scale} ${0.9 * scale}`);
    rig.setAttribute('my-movement-controls', `gender:${gender};camera:#camera;speed:${0.125 * scale}`);
  } else {
    rig.setAttribute('my-movement-controls', `gender:${gender};camera:#camera;`);
  }
  if (spawnPoint && spawnPoint.split(' ').length === 3) {
    rig.setAttribute('position', spawnPoint);
  }
  rig.setAttribute('networked', 'template:#player-template;attachTemplateToLocal:false;');
  return rig;
};

const createCameraRig = () => {
  const { cameraPosition } = appConfig;
  const camera = document.createElement('a-entity');
  camera.id = 'camera';
  camera.setAttribute('core-entity', '');
  camera.setAttribute('raycaster', 'objects: [data-raycastable]');
  camera.setAttribute('camera', '');
  const position = `${cameraPosition.x} ${cameraPosition.y} ${cameraPosition.z}`;
  camera.setAttribute('position', position);
  camera.setAttribute('my-look-controls', '');
  camera.setAttribute('cursor', 'rayOrigin: mouse;');

  return camera;
};

const createAvatar = (glbFile) => {
  const avatar = document.createElement('a-entity');
  avatar.id = 'avatar';
  avatar.setAttribute('core-entity', '');
  avatar.setAttribute('position', '0 0 0');
  avatar.setAttribute('rotation', '0 180 0');
  avatar.setAttribute('gltf-model', glbFile);
  avatar.setAttribute('networked', 'template:#avatar-template;attachTemplateToLocal:false;');
  return avatar;
};

const createName = (name) => {
  const nameEl = document.createElement('a-text');
  nameEl.id = 'name';
  nameEl.setAttribute('core-entity', '');
  nameEl.setAttribute('position', '0 1.9 0');
  nameEl.setAttribute('value', name);
  nameEl.setAttribute('align', 'center');
  nameEl.setAttribute('width', '1.8');
  nameEl.setAttribute('networked', 'template:#name-template;attachTemplateToLocal:false;');
  return nameEl;
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
