import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { estSuperviseur } = lisDonneesPartagees('utilisateur-superviseur');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const visiteGuideeActive =
    etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;
  const modeVisiteGuidee = visiteGuideeActive;
  const profilUtilisateurComplet =
    etatVisiteGuidee.utilisateurCourant.profilComplet;
  const dateInscriptionUtilisateur = new Date(
    etatVisiteGuidee.utilisateurCourant.dateInscription
  );

  const avecPromotionDeMsc = lisDonneesPartagees('avec-promotion-de-msc');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord', {
      detail: {
        estSuperviseur,
        modeVisiteGuidee,
        profilUtilisateurComplet,
        dateInscriptionUtilisateur,
        avecPromotionDeMsc,
      },
    })
  );
});
