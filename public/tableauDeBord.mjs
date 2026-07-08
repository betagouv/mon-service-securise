import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { estSuperviseur } = lisDonneesPartagees('utilisateur-superviseur');
  const { estAdmin } = lisDonneesPartagees('utilisateur-admin');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const avecGestionOrganisations = lisDonneesPartagees(
    'avec-gestion-organisations'
  );
  const visiteGuideeActive =
    etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;
  const modeVisiteGuidee = visiteGuideeActive;
  const profilUtilisateurComplet =
    etatVisiteGuidee.utilisateurCourant.profilComplet;

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord', {
      detail: {
        estSuperviseur,
        estAdmin,
        avecGestionOrganisations,
        modeVisiteGuidee,
        profilUtilisateurComplet,
      },
    })
  );

  const afficheExplicationNouveauReferentiel = lisDonneesPartagees(
    'affiche-explication-nouveau-referentiel'
  );
  const afficheExplicationUtilisationMFA = lisDonneesPartagees(
    'affiche-explication-utilisation-mfa'
  );
  if (!visiteGuideeActive) {
    // On donne priorité à la modale de l'utilisation du MFA
    if (afficheExplicationUtilisationMFA)
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

  if (requete.has('rapportTeleversementV2'))
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-rapport-televersement-services-v2')
    );
});
