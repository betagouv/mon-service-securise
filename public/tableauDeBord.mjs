import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const {
    estSuperviseur,
    estAdmin,
    prenomNom,
    aDejaVuEntierementVisiteGuidee,
  } = lisDonneesPartagees('utilisateur-connecte');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const avecGestionOrganisations = lisDonneesPartagees(
    'avec-gestion-organisations'
  );
  const visiteGuideeActive = etatVisiteGuidee.dejaTerminee === false;
  const profilUtilisateurComplet =
    etatVisiteGuidee.utilisateurCourant.profilComplet;

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord', {
      detail: {
        estSuperviseur,
        estAdmin,
        prenomNom,
        aDejaVuEntierementVisiteGuidee,
        avecGestionOrganisations,
        profilUtilisateurComplet,
      },
    })
  );

  const afficheExplicationNouveauReferentiel = lisDonneesPartagees(
    'affiche-explication-nouveau-referentiel'
  );
  if (!visiteGuideeActive && afficheExplicationNouveauReferentiel)
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-explication-nouveau-referentiel')
    );

  const requete = new URLSearchParams(window.location.search);

  if (requete.has('rapportTeleversementV2'))
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-rapport-televersement-services-v2')
    );
});
