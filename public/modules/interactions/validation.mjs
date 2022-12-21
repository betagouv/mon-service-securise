import brancheValidationCasesACocher from './brancheValidationCasesACocher.mjs';

const EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE = 'afficheErreursSiNecessaire';

const brancheConteneur = (selecteurConteneur) => {
  $('input, select, textarea', selecteurConteneur).each((_index, champ) => {
    $(champ).addClass('intouche');
    $(champ).on('input', () => {
      $(champ).removeClass('intouche');
    });
    if (champ.type === 'radio' || champ.type === 'checkbox') {
      $(champ).on('change', (evenement) => $(evenement.target).siblings().removeClass('intouche'));
    }
    $(champ).on('invalid', (evenement) => {
      evenement.preventDefault();
    });
  });
};

const brancheValidation = (selecteurFormulaire) => {
  $(selecteurFormulaire).on(EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE, (evenement) => {
    if (!evenement.target.reportValidity()) {
      $('.intouche', selecteurFormulaire).removeClass('intouche');
    }
  });

  brancheConteneur(selecteurFormulaire);
  brancheValidationCasesACocher();
};

const declencheValidation = (selecteurFormulaire) => {
  $(selecteurFormulaire).trigger(EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE);
};

export { brancheConteneur, brancheValidation, declencheValidation };
