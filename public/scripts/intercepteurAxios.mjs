import { afficheModaleDeconnexion } from '../modules/deconnexion.js';

$(() => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.cause === 'TOKEN_EXPIRE'
      ) {
        afficheModaleDeconnexion();
      }
      return Promise.reject(error);
    }
  );
});
