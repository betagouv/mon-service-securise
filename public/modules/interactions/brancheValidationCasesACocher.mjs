const brancheValidationGroupeCasesACocher = ($groupeCasesACocher) => {
  const $toutesCasesACocher = $('input:checkbox', $groupeCasesACocher);

  const verifieEtatCasesACocher = () => {
    const messageErreur =
      $toutesCasesACocher.filter(':checked').length === 0
        ? 'Erreur de saisie'
        : '';
    $toutesCasesACocher.each((_, caseACocher) => {
      caseACocher.setCustomValidity(messageErreur);
      caseACocher.reportValidity();
    });
  };

  verifieEtatCasesACocher();
  $toutesCasesACocher.on('change', () => verifieEtatCasesACocher());
};

const brancheValidationCasesACocher = () => {
  $('fieldset.casesACocher[required]').each((_, $groupeCasesACocher) => {
    brancheValidationGroupeCasesACocher($groupeCasesACocher);
  });
};

export default brancheValidationCasesACocher;
