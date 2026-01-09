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

  const afficheExplicationNouveauReferentiel = lisDonneesPartagees(
    'affiche-explication-nouveau-referentiel'
  );
  const afficheExplicationFinCompteLegacy = lisDonneesPartagees(
    'affiche-explication-fin-compte-legacy'
  );
  const afficheExplicationUtilisationMFA = lisDonneesPartagees(
    'affiche-explication-utilisation-mfa'
  );
  if (!visiteGuideeActive) {
    // On donne priorité à la modale de fin des comptes legacy
    if (afficheExplicationFinCompteLegacy)
      document.body.dispatchEvent(
        new CustomEvent('svelte-recharge-explication-fin-compte-legacy')
      );
    // Puis à celle de l'utilisation du MFA
    else if (afficheExplicationUtilisationMFA)
      document.body.dispatchEvent(
        new CustomEvent('svelte-recharge-explication-utilisation-mfa')
      );
    // Et enfin, au nouveau référentiel
    else if (afficheExplicationNouveauReferentiel)
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
