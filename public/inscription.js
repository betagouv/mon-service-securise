import brancheSoumissionFormulaireUtilisateur from './modules/interactions/brancheSoumissionFormulaireUtilisateur.js';
import brancheMiseEnAvantSaisie from './modules/interactions/brancheMiseEnAvantSaisie.js';

$(() => {
  const $formulaire = $('form#inscription');
  const action = (donnees) => axios.post('/api/utilisateur', donnees)
    .then(() => (window.location = '/activation'));

  brancheMiseEnAvantSaisie();
  brancheSoumissionFormulaireUtilisateur($formulaire, action);
});
