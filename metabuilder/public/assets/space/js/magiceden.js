AFRAME.registerComponent('magiceden-nft', {
  schema: {
    url: { type: 'string' },
  },
  init: function () {},
  update: function (oldData) {
    if (this.data.url !== oldData.url) {
      this.fetchNftDetails();
    }
  },
  fetchNftDetails: function () {
    const url = this.data.url;
    if (url === '') {
      return;
    }
    const isERC271NFT = url.match(/item-details\/([a-z0-9]+)\/0x(.*)/i);
    if (isERC271NFT) {
      alert('We currently only not support ERC721 NFTs');
      return;
    }
    const matches = url.match(/item-details\/([a-z0-9]+)/i);
    if (!matches) {
      alert('Invalid URL');
      return;
    }
    const apiURL = 'https://api-mainnet.magiceden.dev/v2/tokens/' + matches[1];
    const proxyUrl = '/proxy?url=' + encodeURIComponent(apiURL);
    fetch(proxyUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.image) {
          this.el.setAttribute('material', 'src', '/proxy?url=' + encodeURIComponent(data.image));
        }
      });
  },
});
