import lanceDecompteDeconnexion from '../modules/deconnexion.js';
import DUREE_SESSION from '../configuration.js';

$(() => {
  axios.interceptors.response.use(
    (response) => {
      lanceDecompteDeconnexion(DUREE_SESSION);
      return response;
    },
    (error) => {
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.cause === 'TOKEN_EXPIRE'
      ) {
        lanceDecompteDeconnexion(0);
      }
      return Promise.reject(error);
    }
  );
});
