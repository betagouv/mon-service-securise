import brancheSoumissionFormulaireUtilisateur from './modules/interactions/brancheSoumissionFormulaireUtilisateur.js';

$(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('ac')) {
    const { selectize } = $('#siretEntite-selectize')[0];
    $(document.body).on('recharge-siret-entite', (evt) => {
      const { options } = evt.originalEvent.detail;
      if (options && options.length > 0) {
        selectize.setValue(options[0].label, true);
      }
    });
    $('#prenom').val(urlParams.get('prenom'));
    $('#prenom').attr('disabled', true);
    $('#nom').val(urlParams.get('nom'));
    $('#nom').attr('disabled', true);
    $('#email').val(urlParams.get('email'));
    $('#email').attr('disabled', true);
    const siret = urlParams.get('siret');
    $('#siretEntite').val(siret);
    $('#siretEntite-selectize')[0].selectize.onSearchChange(siret);
  }

  const selecteurFormulaire = 'form#inscription';
  const action = (donnees) =>
    axios
      .post('/api/utilisateur', donnees)
      .then(() => (window.location = '/activation'));

  brancheSoumissionFormulaireUtilisateur(selecteurFormulaire, action);
});
