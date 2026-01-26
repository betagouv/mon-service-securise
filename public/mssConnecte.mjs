import initialiseComportementModale from './modules/interactions/modale.mjs';
import lisDonneesPartagees from './modules/donneesPartagees.mjs';
import { lanceDecompteDeconnexion } from './modules/deconnexion.js';

$(() => {
  initialiseComportementModale($('.rideau#deconnexion'));

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-centre-notifications')
  );

  document.body.dispatchEvent(new CustomEvent('svelte-recharge-tiroir'));

  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  if (etatVisiteGuidee.dejaTerminee === false) {
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-visite-guidee', {
        detail: etatVisiteGuidee,
      })
    );
  }

  $('lab-anssi-centre-aide').on('lienclique', (e) => {
    if (e.detail.target.id === 'centre-aide-visite-guidee') {
      axios
        .post('/api/visiteGuidee/reinitialise')
        .then(() => {
          window.location.href = '/tableauDeBord';
        })
        /* eslint-disable no-console */
        .catch(() =>
          console.warn('Impossible de réinitialiser la visite guidée')
        );
    }
  });

  lanceDecompteDeconnexion();
});
