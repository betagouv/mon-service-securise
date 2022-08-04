import brancheSoumissionFormulaireUtilisateur from '../modules/interactions/brancheSoumissionFormulaireUtilisateur.js';
import brancheMiseEnAvantSaisie from '../modules/interactions/brancheMiseEnAvantSaisie.js';

$(() => {
  const $formulaire = $('form.utilisateur#edition');
  const action = (donnees) => axios.put('/api/utilisateur', donnees)
    .then(() => (window.location = '/espacePersonnel'));

  brancheMiseEnAvantSaisie();
  brancheSoumissionFormulaireUtilisateur($formulaire, action);
});
