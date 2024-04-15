const createRpmAvatarFrame = () => {
  const rpmContainer = document.createElement('div');
  const frame = document.createElement('iframe');

  frame.setAttribute('allow', 'camera *; microphone *');
  frame.id = 'rpmIframe';

  rpmContainer.id = 'rpmContainer';
  rpmContainer.style.zIndex = '999';
  rpmContainer.appendChild(frame);

  document.body.prepend(rpmContainer);

  return frame;
};

function get2DAvatar(glbFile) {
  return fetch('https://render.readyplayer.me/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: glbFile,
      scene: 'fullbody-portrait-v1',
      armature: 'ArmatureTargetMale',
      blendShapes: { Wolf3D_Avatar: { mouthSmile: 0.2 } },
    }),
  })
    .then((response) => response.json())
    .then(({ renders }) => {
      document.querySelector('#avatar-2d').src = renders[0];
    })
    .catch((error) => {
      console.log('Failed to get 2D avatar');
    });
}

const displayRpmIframe = () => {
  const frame = createRpmAvatarFrame();
  const subdomain = 'metaworlds'; // Replace with your custom subdomain
  frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
};

function parseEvent(event) {
  try {
    if (typeof event.data === 'string') {
      return JSON.parse(event.data);
    }
    return event.data;
  } catch (error) {
    return null;
  }
}

async function onMessage(event) {
  const eventData = parseEvent(event);

  if (eventData?.source !== 'readyplayerme') {
    return;
  }

  // Susbribe to all events sent from Ready Player Me once frame is ready
  if (eventData.eventName === 'v1.frame.ready') {
    const rpmIframe = document.querySelector('#rpmIframe');
    if (rpmIframe) {
      rpmIframe.contentWindow?.postMessage(
        JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.**',
        }),
        '*',
      );
    }
  }

  // Get avatar GLB URL
  if (eventData.eventName === 'v1.avatar.exported') {
    console.log(`Avatar URL: ${eventData.data.url}`);
    spawnAvatar(eventData.data.url);
    // Hide readyplayerme frame
    const rpmContainer = document.querySelector('#rpmContainer');
    if (rpmContainer) {
      rpmContainer.remove();
    }
  }
}

window.addEventListener('message', onMessage);
