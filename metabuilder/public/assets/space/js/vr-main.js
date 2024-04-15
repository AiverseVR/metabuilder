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

async function onDOMContentLoaded() {
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

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
