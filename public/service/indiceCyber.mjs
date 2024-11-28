import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const idService = $('.page-service').data('id-service');
  const { indiceCyber, noteMax } = lisDonneesPartagees('donnees-indice-cyber');
  const { indiceCyberPersonnalise } = lisDonneesPartagees(
    'donnees-indice-cyber-personnalise'
  );

  const brancheOnglets = () => {
    const $onglets = $('.conteneur-indice-cyber .onglets .onglet');
    const $tousContenus = $('.contenu-global');

    function basculeOnglets() {
      $onglets.removeClass('actif');
      $(this).addClass('actif');

      $tousContenus.hide();
      const idCible = $(this).data('cible');
      $(`#${idCible}`).show();
    }

    $onglets.on('click', basculeOnglets);
  };

  const brancheNavigationOngletDepuisURL = () => {
    const $onglets = $('.conteneur-indice-cyber .onglets .onglet');
    const $tousContenus = $('.contenu-global');

    const recherche = new URLSearchParams(window.location.search);
    if (recherche.has('onglet')) {
      const cible = recherche.get('onglet');

      $onglets.removeClass('actif');
      $(`.onglet[data-cible=${cible}]`).addClass('actif');

      $tousContenus.hide();
      $(`#${cible}`).show();
    }
  };

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber', {
      detail: { indiceCyber, noteMax, idService },
    })
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-indice-cyber-personnalise', {
      detail: { indiceCyberPersonnalise, noteMax, idService },
    })
  );
  brancheOnglets();
  brancheNavigationOngletDepuisURL();
});
