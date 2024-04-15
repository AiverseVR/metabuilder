AFRAME.registerComponent('open-url', {
  schema: {
    link: { type: 'string' },
  },
  init: function () {
    this.el.setAttribute('data-raycastable', '');
    this.el.addEventListener('click', (event) => {
      window.open(this.data.link, '_blank');
    });
  },
});
