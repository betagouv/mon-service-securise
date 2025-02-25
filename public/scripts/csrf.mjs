import lanceDecompteDeconnexion from '../modules/deconnexion.js';
import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const { token } = lisDonneesPartagees('infos-csrf');
  axios.defaults.headers.common['X-CSRF-Token'] = token;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        typeof error?.response?.data === 'string' &&
        error?.response?.data?.includes('CSRF token mismatch')
      ) {
        lanceDecompteDeconnexion(0);
      }
      return Promise.reject(error);
    }
  );
});
