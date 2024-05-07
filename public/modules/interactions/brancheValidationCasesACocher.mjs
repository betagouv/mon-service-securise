const declencheValidationCasesACocher = () => {
  $('fieldset.casesACocher[required]').each((_, $groupeCasesACocher) => {
    const $toutesCasesACocher = $('input:checkbox', $groupeCasesACocher);
    const messageErreur =
      $toutesCasesACocher.filter(':checked').length === 0
        ? 'Erreur de saisie'
        : '';
    $toutesCasesACocher.each((__, caseACocher) => {
      caseACocher.setCustomValidity(messageErreur);
      caseACocher.reportValidity();
    });
  });
};

const brancheValidationGroupeCasesACocher = ($groupeCasesACocher) => {
  const $toutesCasesACocher = $('input:checkbox', $groupeCasesACocher);
  $toutesCasesACocher.on('change', () => declencheValidationCasesACocher());
};

const brancheValidationCasesACocher = () => {
  $('fieldset.casesACocher[required]').each((_, $groupeCasesACocher) => {
    brancheValidationGroupeCasesACocher($groupeCasesACocher);
  });
};

export { brancheValidationCasesACocher, declencheValidationCasesACocher };
