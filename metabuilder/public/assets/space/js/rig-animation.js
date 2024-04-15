// ////////////////////////////
// DYNAMICALLY RIGGING AVATAR MESH
// ////////////////////////////
const LoopMode = {
  once: THREE.LoopOnce,
  repeat: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong,
};
function wildcardToRegExp(s) {
  return new RegExp(`^${s.split(/\*+/).map(regExpEscape).join('.*')}$`);
}
function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
AFRAME.registerComponent('rig-animation', {
  schema: {
    gender: {
      default: 'm',
      type: 'string',
    },
    clip: {
      default: '*',
      type: 'string',
    },
    duration: {
      default: 0,
      type: 'number',
    },
    clampWhenFinished: {
      default: !1,
      type: 'boolean',
    },
    crossFadeDuration: {
      default: 0,
      type: 'number',
    },
    loop: {
      default: 'repeat',
      oneOf: Object.keys(LoopMode),
    },
    repetitions: {
      default: 1 / 0,
      min: 0,
    },
    timeScale: {
      default: 1,
    },
  },
  init() {
    this.mixer = null;
    this.activeActions = [];
    const gender = this.data.gender;
    this.model = this.el.getObject3D('mesh');
    const loader = new THREE.ObjectLoader();
    const tryToLoad = () => {
      this.model &&
        fetch(`/assets/space/models/animations-${gender}.json`)
          .then((res) => res.json())
          .then((data) => {
            this.model.animations = [];
            const animations = loader.parseAnimations(data.animations);
            this.model.animations = Object.values(animations);
          })
          .then(() => this.load())
          .catch(console.log);
    };

    if (this.model) {
      tryToLoad();
    } else {
      this.el.addEventListener('model-loaded', (e) => {
        this.model = e.detail.model;
        tryToLoad();
      });
    }
  },
  load() {
    const { el } = this;
    this.mixer = new THREE.AnimationMixer(this.model);
    this.mixer.addEventListener('loop', (e) => {
      el.emit('animation-loop', {
        action: e.action,
        loopDelta: e.loopDelta,
      });
    });
    this.mixer.addEventListener('finished', (e) => {
      el.emit('animation-finished', {
        action: e.action,
        direction: e.direction,
      });
    });
    this.data.clip && this.update({});
  },
  remove() {
    this.mixer && this.mixer.stopAllAction();
  },
  update(prevData) {
    if (!prevData) return;
    const { data } = this;
    const changes = AFRAME.utils.diff(data, prevData);
    if ('clip' in changes) {
      return this.stopAction(), void (data.clip && this.playAction());
    }
    this.activeActions.forEach((action) => {
      'duration' in changes && data.duration && action.setDuration(data.duration),
        'clampWhenFinished' in changes && (action.clampWhenFinished = data.clampWhenFinished),
        ('loop' in changes || 'repetitions' in changes) && action.setLoop(LoopMode[data.loop], data.repetitions),
        'timeScale' in changes && action.setEffectiveTimeScale(data.timeScale);
    });
  },
  stopAction() {
    const { data } = this;
    for (let i = 0; i < this.activeActions.length; i++)
      data.crossFadeDuration ? this.activeActions[i].fadeOut(data.crossFadeDuration) : this.activeActions[i].stop();
    this.activeActions = [];
  },
  playAction() {
    if (!this.mixer) return;
    const { model } = this;
    const { data } = this;
    const clips = model.animations || (model.geometry || {}).animations || [];
    if (!clips.length) return;

    const re = wildcardToRegExp(data.clip);
    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);
        (action.enabled = !0),
          (action.clampWhenFinished = data.clampWhenFinished),
          data.duration && action.setDuration(data.duration),
          data.timeScale !== 1 && action.setEffectiveTimeScale(data.timeScale),
          action.setLoop(LoopMode[data.loop], data.repetitions).fadeIn(data.crossFadeDuration).play(),
          this.activeActions.push(action);
      }
    }
  },
  tick(t, dt) {
    this.mixer && !Number.isNaN(dt) && this.mixer.update(dt / 1e3);
  },
});
