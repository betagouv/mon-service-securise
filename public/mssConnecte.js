import { initialiseComportementModale } from './modules/interactions/modale.mjs';
import lanceDecompteDeconnexion from './modules/deconnexion.js';

$(() => {
  initialiseComportementModale($('.rideau#deconnexion'));

  axios.get('/api/dureeSession')
    .then((reponse) => {
      const duree = parseInt(reponse.data.dureeSession, 10);
      if (!duree) {
        return Promise.reject();
      }
      return lanceDecompteDeconnexion(duree);
    })
    /* eslint-disable no-console */
    .catch(() => console.warn("Impossible d'initialiser la modale de déconnexion, causé par une erreur pendant la récupération du délai de déconnexion"));
  /* eslint-enable no-console */
});
