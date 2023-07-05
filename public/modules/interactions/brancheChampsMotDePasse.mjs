const brancheChampsMotDePasse = (selecteurFormulaire) => {
  const $champsMotDePasse = $('input[type="password"]', selecteurFormulaire);

  $champsMotDePasse.each((_, champ) => {
    const $boutonCacher = $('<span class="icone-voir-mot-de-passe"></span>');
    $boutonCacher.on('click', (evenement) => {
      evenement.preventDefault();
      const $bouton = $(evenement.target);
      $bouton.toggleClass('cacher');
      const estVisible = $bouton.hasClass('cacher');
      $(champ).attr('type', estVisible ? 'text' : 'password');
    });
    $(champ).after($boutonCacher);
  });
};

export default brancheChampsMotDePasse;
