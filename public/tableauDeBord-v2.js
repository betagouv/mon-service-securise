$(() => {
  const { estSuperviseur } = JSON.parse($('#utilisateur-superviseur').text());
  const etatVisiteGuidee = JSON.parse($('#etat-visite-guidee').text());
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
