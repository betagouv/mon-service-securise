import {
  brancheValidationCasesACocher,
  declencheValidationCasesACocher,
} from './brancheValidationCasesACocher.mjs';

const EVENEMENT_FORMULAIRE_MULTIPLE_VALIDE =
  'EVENEMENT_FORMULAIRE_MULTIPLE_VALIDE';

// Tous les champs de formulaires reçoivent la classe "touche" au moment d'un changement (input, change)
// Cette classe permet d'afficher les messages d'erreurs sur tous les `input.touche:invalid`
// Au moment de la validation du formulaire, on ajoute la classe `.touche` sur tous les champs,
// afin de forcer l'affichage des champs en erreur.

const renseigneLongueurActuelle = (champ, longueurActuelle) => {
  const $message = $(champ).siblings('.message-erreur[data-gabarit]');
  if (!$message.length) return;

  $message.text(
    $message.data('gabarit').replace('{longueur}', longueurActuelle)
  );
};

const valideMaxLength = (champ) => {
  const longueurMaximale = champ.maxLength;
  if (longueurMaximale < 0) return;

  const longueurActuelle = champ.value.length;
  champ.setCustomValidity(
    longueurActuelle > longueurMaximale ? 'Erreur de saisie' : ''
  );
  renseigneLongueurActuelle(champ, longueurActuelle);
};

const brancheConteneur = (selecteurConteneur) => {
  $('input, select, textarea', selecteurConteneur).each((_index, champ) => {
    valideMaxLength(champ);
    $(champ).on('input', () => {
      $(champ).addClass('touche');
      valideMaxLength(champ);
    });

    if (champ.type === 'radio' || champ.type === 'checkbox') {
      $(champ).on('change', (e) => $(e.target).siblings().addClass('touche'));
    }

    $(champ).on('invalid', (e) => e.preventDefault());
  });
};

const brancheValidation = (selecteurFormulaire) => {
  brancheConteneur(selecteurFormulaire);
  brancheValidationCasesACocher();
};

const declencheScrollSurErreur = (selecteurFormulaire) => {
  const champAvecErreur = $(
    'input:invalid, select:invalid, textarea:invalid',
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
  marqueTousChampsCommeTouches(selecteurFormulaire);
  declencheValidationCasesACocher(selecteurFormulaire);
  declencheScrollSurErreur(selecteurFormulaire);
};

const declencheValidationFormulairesMultiple = (
  selecteurConteneurFormulaires
) => {
  let tousFormulaireValides = true;
  let indicePremierFormulaireInvalide = null;
  $('form', selecteurConteneurFormulaires).each((index, element) => {
    if (!element.checkValidity()) {
      tousFormulaireValides = false;
      indicePremierFormulaireInvalide = index + 1;
    }
  });

  if (tousFormulaireValides)
    selecteurConteneurFormulaires.trigger(EVENEMENT_FORMULAIRE_MULTIPLE_VALIDE);

  return indicePremierFormulaireInvalide;
};

export {
  brancheConteneur,
  brancheValidation,
  declencheValidation,
  declencheValidationFormulairesMultiple,
  EVENEMENT_FORMULAIRE_MULTIPLE_VALIDE,
};
