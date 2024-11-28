import brancheComportemenFormulaireEtape from '../formulaireEtape.mjs';

$(() => {
  brancheComportemenFormulaireEtape((idService) => {
    const donnees = {
      dateHomologation: $('#date-homologation').val(),
      dureeValidite: $('input[name="dureeValidite"]:checked').val(),
    };

    return axios.put(
      `/api/service/${idService}/homologation/decision`,
      donnees
    );
  });
});
