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

const brancheValidationPersonnalisee = (selecteurChampCible) => {
  $(selecteurChampCible).on('invalid', (evenement) => {
    evenement.preventDefault();
    const champSaisie = evenement.target;
    if (champSaisie.validity.customError) {
      const $champSaisieEnErreur = $(champSaisie);
      $champSaisieEnErreur.nextAll('.message-erreur-personnalise')
        .text(champSaisie.validationMessage);
      $champSaisieEnErreur.on('input', () => {
        $champSaisieEnErreur.nextAll('.message-erreur-personnalise')
          .text('');
        champSaisie.setCustomValidity('');
        champSaisie.reportValidity();
      });
    }
  });
};

const declencheErreurPersonnalisee = (selecteurChampCible, messageErreur) => {
  const htmlElement = $(selecteurChampCible)[0];
  htmlElement.setCustomValidity(messageErreur);
  htmlElement.reportValidity();
};

export {
  brancheValidation,
  brancheValidationPersonnalisee,
  declencheValidation,
  declencheErreurPersonnalisee,
};
