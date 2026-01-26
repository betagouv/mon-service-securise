import lisDonneesPartagees from '../modules/donneesPartagees.mjs';
import { afficheModaleDeconnexion } from '../modules/deconnexion.js';

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
        afficheModaleDeconnexion();
      }
      return Promise.reject(error);
    }
  );
});
