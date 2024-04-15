function toastError(message) {
  return Toastify({
    text: message,
    position: 'center',
    style: {
      background: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))',
    },
  }).showToast();
}

axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.message;
    if (error.response) {
      if (error.response.status === 401) {
        message = 'Please login to continue';
        window.location.href = '/auth/login';
      }
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
    }
    toastError(message);
    return Promise.reject(error);
  },
);

function copyContentToClipboard(content, message = 'Copied to clipboard') {
  const el = document.createElement('textarea');
  el.value = content;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  Toastify({
    text: message,
    position: 'center',
  }).showToast();
}

function getSpaceUrl(slug) {
  return window.location.origin + '/spaces/' + slug;
}
