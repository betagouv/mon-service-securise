const EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE = 'afficheErreursSiNecessaire';

const brancheValidation = (selecteurFormulaire) => {
  $(selecteurFormulaire).on(EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE, (evenement) => {
    if (!evenement.target.reportValidity()) {
      $('.intouche', selecteurFormulaire).removeClass('intouche');
    }
  });

  $('input, select', selecteurFormulaire).each((_index, champ) => {
    $(champ).addClass('intouche');
    $(champ).on('input', () => {
      $(champ).removeClass('intouche');
    });
    if (champ.type === 'radio') {
      $(champ).on('change', (evenement) => $(evenement.target).siblings().removeClass('intouche'));
    }
    $(champ).on('invalid', (evenement) => {
      evenement.preventDefault();
    });
  });
};

const declencheValidation = (selecteurFormulaire) => {
  $(selecteurFormulaire).trigger(EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE);
};

export { brancheValidation, declencheValidation };
