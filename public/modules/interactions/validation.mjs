import {
  brancheValidationCasesACocher,
  declencheValidationCasesACocher,
} from './brancheValidationCasesACocher.mjs';

// Tous les champs de formulaires reçoivent la classe "touche" au moment d'un changement (input, change)
// Cette classe permet d'afficher les messages d'erreurs sur tous les `input.touche:invalid`
// Au moment de la validation du formulaire, on ajoute la classe `.touche` sur tous les champs,
// afin de forcer l'affichage des champs en erreur.

const EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE = 'afficheErreursSiNecessaire';

const brancheConteneur = (selecteurConteneur) => {
  $('input, select, textarea', selecteurConteneur).each((_index, champ) => {
    $(champ).on('input', () => $(champ).addClass('touche'));
    if (champ.type === 'radio' || champ.type === 'checkbox') {
      $(champ).on('change', (e) => $(e.target).siblings().addClass('touche'));
    }
    $(champ).on('invalid', (e) => e.preventDefault());
  });
};

const brancheValidation = (selecteurFormulaire) => {
  $(selecteurFormulaire).on(
    EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE,
    (evenement) => {
      if (!evenement.target.reportValidity()) {
        $('.intouche', selecteurFormulaire).removeClass('intouche');
      }
    }
  );

  brancheConteneur(selecteurFormulaire);
  brancheValidationCasesACocher();
};

const declencheScrollSurErreur = (selecteurFormulaire) => {
  const champAvecErreur = $(
    'input:invalid, select:invalid',
    selecteurFormulaire
  );
  if (champAvecErreur.length) {
    let element = $(champAvecErreur[0]);
    if (element.parents('label').length)
      element = $(element.parents('label')[0]);
    else if (element.parents('fieldset').length)
      element = $(element.parents('fieldset')[0]);
    element[0].scrollIntoView({ behavior: 'smooth' });
  }
};

const marqueTousChampsCommeTouches = (selecteurFormulaire) => {
  $('input, select, textarea', selecteurFormulaire).each((_index, champ) => {
    $(champ).addClass('touche');
  });
};

const declencheValidation = (selecteurFormulaire) => {
  marqueTousChampsCommeTouches();
  declencheValidationCasesACocher();
  $(selecteurFormulaire).trigger(EVENEMENT_AFFICHE_ERREURS_SI_NECESSAIRE);
  declencheScrollSurErreur(selecteurFormulaire);
};

export { brancheConteneur, brancheValidation, declencheValidation };
