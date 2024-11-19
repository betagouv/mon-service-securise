import lanceDecompteDeconnexion from '../modules/deconnexion.js';

$(() => {
  const $infos = $('#infos-csrf');
  const { token } = JSON.parse($infos.text());
  axios.defaults.headers.common['X-CSRF-Token'] = token;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.data.includes('CSRF token mismatch')) {
        lanceDecompteDeconnexion(0);
      }
      return Promise.reject(error);
    }
  );
});
