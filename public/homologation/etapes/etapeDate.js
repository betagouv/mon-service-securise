import brancheComportemenFormulaireEtape from './formulaireEtape.js';

$(() => {
  brancheComportemenFormulaireEtape((idService) => {
    const donnees = {
      dateHomologation: $('#date-homologation').val(),
      dureeValidite: $('input[name="dureeValidite"]:checked').val(),
    };

    return axios.put(`/api/service/${idService}/dossier/decision`, donnees);
  });
});
