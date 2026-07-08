import lisDonneesPartagees from '../modules/donneesPartagees.mjs';
import { afficheModaleDeconnexion } from '../modules/deconnexion.js';

const HEADER_TOKEN_CSRF = 'X-CSRF-Token';

$(() => {
  const { token, hashIdUtilisateur } = lisDonneesPartagees('infos-csrf');
  axios.defaults.headers.common[HEADER_TOKEN_CSRF] = token;

  const afficheModaleEtJetteErreur = (error) => {
    afficheModaleDeconnexion();
    return Promise.reject(error);
  };

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const estMismatchCsrf =
        typeof error?.response?.data === 'string' &&
        error.response.data.includes('CSRF token mismatch');
      if (!estMismatchCsrf) return Promise.reject(error);

      const { config } = error;
      if (!config || config.dejaRejoueeApresMismatchCsrf) {
        return afficheModaleEtJetteErreur(error);
      }

      try {
        const { data } = await axios.get('/api/csrf');

        const memeUtilisateur = data.hashIdUtilisateur === hashIdUtilisateur;
        if (!hashIdUtilisateur || !memeUtilisateur) {
          return afficheModaleEtJetteErreur(error);
        }

        axios.defaults.headers.common[HEADER_TOKEN_CSRF] = data.token;
        config.dejaRejoueeApresMismatchCsrf = true;
        // La version d'axios 1.0.0 perd les en-têtes quand on rejoue une requête : on repart d'un objet brut.
        const headers =
          typeof config.headers?.toJSON === 'function'
            ? config.headers.toJSON()
            : { ...config.headers };
        headers[HEADER_TOKEN_CSRF] = data.token;
        return axios({ ...config, headers });
      } catch (e) {
        return afficheModaleEtJetteErreur(e);
      }
    }
  );
});
