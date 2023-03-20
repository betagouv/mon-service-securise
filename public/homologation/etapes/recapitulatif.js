import brancheComportemenFormulaireEtape from './formulaireEtape.js';

$(() => {
  brancheComportemenFormulaireEtape((idService) => axios
    .put(`/api/service/${idService}/dossier`, { finalise: true }));
});
