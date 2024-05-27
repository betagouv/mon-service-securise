import {
  brancheValidationCasesACocher,
  declencheValidationCasesACocher,
} from './brancheValidationCasesACocher.mjs';

const brancheConteneur = (selecteurConteneur) => {
  $('input, select, textarea', selecteurConteneur).each((_index, champ) => {
    $(champ).on('invalid', (evenement) => {
      evenement.preventDefault();
    });
  });
};

const brancheValidation = (selecteurFormulaire) => {
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

const declencheValidation = (selecteurFormulaire) => {
  $(selecteurFormulaire)[0].reportValidity();
  declencheValidationCasesACocher();
  declencheScrollSurErreur(selecteurFormulaire);
};

export { brancheConteneur, brancheValidation, declencheValidation };
