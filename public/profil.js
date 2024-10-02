$(() => {
  const $donneesProfil = $('#donnees-profil');
  const { utilisateur, departements, estimationNombreServices } = JSON.parse(
    $donneesProfil.text()
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-profil', {
      detail: { utilisateur, departements, estimationNombreServices },
    })
  );
});
