import brancheComportemenFormulaireEtape from './formulaireEtape.js';

$(() => {
  brancheComportemenFormulaireEtape((idService) => axios
    .post(`/api/service/${idService}/dossier/finalise`));
});
