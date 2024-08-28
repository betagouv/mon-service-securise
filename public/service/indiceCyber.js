$(() => {
  const idService = $('.page-service').data('id-service');
  const { indiceCyber, noteMax } = JSON.parse(
    $('#donnees-indice-cyber').text()
  );
  const { indiceCyberPersonnalise } = JSON.parse(
    $('#donnees-indice-cyber-personnalise').text()
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
});
