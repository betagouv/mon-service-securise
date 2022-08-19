import brancheSoumissionFormulaireUtilisateur from './modules/interactions/brancheSoumissionFormulaireUtilisateur.js';

$(() => {
  const selecteurFormulaire = 'form#inscription';
  const action = (donnees) => axios.post('/api/utilisateur', donnees)
    .then(() => (window.location = '/activation'));

  brancheSoumissionFormulaireUtilisateur(selecteurFormulaire, action);
});
