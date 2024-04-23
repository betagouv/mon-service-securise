import { initialiseComportementModale } from './modules/interactions/modale.mjs';
import brancheComportementModaleNouvelleFonctionnalite from './modules/modaleNouvellesFonctionnalites.mjs';
import lanceDecompteDeconnexion from './modules/deconnexion.js';

$(() => {
  initialiseComportementModale($('.rideau#deconnexion'));
  brancheComportementModaleNouvelleFonctionnalite(
    $('.modale-nouvelles-fonctionnalites')
  );

  const etatVisiteGuidee = JSON.parse($('#etat-visite-guidee').text());
  if (etatVisiteGuidee.dejaTerminee === false) {
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-visite-guidee', {
        detail: etatVisiteGuidee,
      })
    );
  }

  axios
    .get('/api/dureeSession')
    .then((reponse) => {
      const duree = parseInt(reponse.data.dureeSession, 10);
      if (!duree) {
        return Promise.reject();
      }
      return lanceDecompteDeconnexion(duree);
    })
    /* eslint-disable no-console */
    .catch(() =>
      console.warn(
        "Impossible d'initialiser la modale de déconnexion, causé par une erreur pendant la récupération du délai de déconnexion"
      )
    );
  /* eslint-enable no-console */
});
