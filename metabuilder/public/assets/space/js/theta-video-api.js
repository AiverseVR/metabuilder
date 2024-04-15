const signURL = () => {
  return fetch('/theta-video/sign-url', {
    method: 'POST',
  }).then((response) => response.json());
};

// signURL().then(console.log);
AFRAME.registerComponent('theta-video', {
  schema: {
    src: {
      default: '',
      parse: function (value) {
        return value;
      },
      stringify: function (value) {
        return value;
      },
      type: 'theta-video',
    },
    "theta-video-id": {
      type:"string"
    },
    "theta-video-service_account_id":{
      type:"string"
    },
    "source-url": {
      type: "string"
    }
  },
  type: 'theta-video',
  multiple: false,
  init: function () {},
  update: function () {
    // src = https://media.thetavideoapi.com/user_jvghp7e8q42cjb7f0g3s63iiyfg/srvacc_5vai4hu90fkinvf0m4vittm8i/video_vwjj2rtpe86ib1kbvjzjungvxv/master.m3u8
    // regex parse videoId = /\/video_(.*)\//g.exec(this.data.src)[1]
    if (this.data.src) {
      const player = (window.player = videojs('theta-player', {
        techOrder: ['theta_hlsjs', 'html5'],
        sources: [
          {
            src: this.data.src,
            type: 'application/vnd.apple.mpegurl',
            label: '1080p',
          },
        ],
        loop: true,
        autoplay: false,
        muted: true,
        controls: false,
      }));
      const videoEl = window.player.children()[0];
      const domVideoId = videoEl.id;
      // Create a-video element and append to scene
      const aVideoEl = document.createElement('a-video');
      aVideoEl.setAttribute('src', `#${domVideoId}`);
      aVideoEl.setAttribute('width', '1.6');
      aVideoEl.setAttribute('height', '0.9');
      this.el.appendChild(aVideoEl);
      player.play();
    }
    if (this.data['source-url']){
      const aVideoEl = document.createElement('a-video');
      aVideoEl.setAttribute('src', this.data['source-url']);
      aVideoEl.setAttribute('width', '1.6');
      aVideoEl.setAttribute('height', '0.9');
      this.el.appendChild(aVideoEl);
    }
  },
});

console.log(`theta-video-api.js loaded`);
