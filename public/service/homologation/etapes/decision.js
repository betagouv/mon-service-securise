import brancheComportemenFormulaireEtape from '../formulaireEtape.mjs';

$(() => {
  const brancheTelechargement = () => {
    const $lien = $('.document-homologation', 'form');

    $lien.on('click', ({ target }) =>
      axios
        .put($(target).data('action-enregistrement'))
        .then(() => window.location.reload())
    );
  };

  brancheTelechargement();
  brancheComportemenFormulaireEtape(() => Promise.resolve());
});
