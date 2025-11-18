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
  const avecDecrireV2 = lisDonneesPartagees('avec-decrire-v2');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord', {
      detail: {
        estSuperviseur,
        modeVisiteGuidee,
        profilUtilisateurComplet,
        dateInscriptionUtilisateur,
        avecPromotionDeMsc,
        avecDecrireV2,
      },
    })
  );

  const afficheExplicationNouveauReferentiel = lisDonneesPartagees(
    'affiche-explication-nouveau-referentiel'
  );
  if (afficheExplicationNouveauReferentiel) {
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-explication-nouveau-referentiel')
    );
  }

  const requete = new URLSearchParams(window.location.search);

  if (requete.has('rapportTeleversement'))
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-rapport-televersement-services')
    );

  if (requete.has('rapportTeleversementV2'))
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-rapport-televersement-services-v2')
    );
});
