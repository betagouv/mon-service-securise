import brancheSoumissionFormulaireUtilisateur from '../modules/interactions/brancheSoumissionFormulaireUtilisateur.js';

$(() => {
  const selecteurFormulaire = 'form.utilisateur#edition';
  const action = (donnees) =>
    axios
      .put('/api/utilisateur', donnees)
      .then(() => (window.location = '/tableauDeBord'));

  brancheSoumissionFormulaireUtilisateur(selecteurFormulaire, action);
});
