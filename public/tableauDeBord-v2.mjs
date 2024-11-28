import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { estSuperviseur } = lisDonneesPartagees('utilisateur-superviseur');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const visiteGuideeActive =
    etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;
  const modeVisiteGuidee =
    visiteGuideeActive && etatVisiteGuidee.utilisateurCourant.profilComplet;

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord', {
      detail: { estSuperviseur, modeVisiteGuidee },
    })
  );
});
