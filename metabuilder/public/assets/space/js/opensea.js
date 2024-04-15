AFRAME.registerComponent('opensea-nft', {
  schema: {
    url: { type: 'string' },
  },
  init: function () {
    if (this.data.url) {
      this.fetchNftDetails();
    }
  },
  update: function () {
    // console.log('opensea-nft updated', this.data);
    this.fetchNftDetails();
  },
  fetchNftDetails: function () {
    if (!this.data.url) {
      console.log('No URL provided');
      return;
    }
    console.log(this.data);
    //  https://opensea.io/assets/klaytn/0xab5a96f31e3d4196fd19f472e0d27e332c761835/1668
    // const url = 'https://opensea.io/assets/klaytn/0xab5a96f31e3d4196fd19f472e0d27e332c761835/1668';
    const url = this.data.url;
    const urlParts = url.split('/');
    const contractAddress = urlParts[5];
    const tokenId = urlParts[6];
    const apiUrl = `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}/?include_orders=false`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const imageUrl = data.image_url;
        this.el.setAttribute('open-url', { link: this.data.url });
        this.createOrUpdateImageComponent(imageUrl);
      });
  },
  createOrUpdateImageComponent: function (imageUrl) {
    const el = this.el;
    let imageEl = el.querySelector('a-image');
    if (!imageEl) {
      imageEl = document.createElement('a-image');
      el.appendChild(imageEl);
    }
    imageEl.setAttribute('src', imageUrl);
  },
});
