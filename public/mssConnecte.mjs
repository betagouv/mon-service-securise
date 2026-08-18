import initialiseComportementModale from './modules/interactions/modale.mjs';
import { lanceDecompteDeconnexion } from './modules/deconnexion.js';

$(() => {
  initialiseComportementModale($('.rideau#deconnexion'));

  document.body.dispatchEvent(new CustomEvent('svelte-recharge-tiroir'));

  $('lab-anssi-centre-aide').on('lienclique', (e) => {
    if (e.detail.target.id === 'centre-aide-visite-guidee') {
      window.location.href =
        '/tableauDeBord?avecModaleAccueilVisiteGuidee=true';
    }
  });

  lanceDecompteDeconnexion();
});
