import brancheComportemenFormulaireEtape from '../formulaireEtape.mjs';

$(() => {
  brancheComportemenFormulaireEtape((idService) =>
    axios.post(`/api/service/${idService}/homologation/finalise`)
  );
});
