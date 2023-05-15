import brancheComportemenFormulaireEtape from '../formulaireEtape.js';

$(() => {
  brancheComportemenFormulaireEtape((idService) => {
    const donnees = {
      nom: $('#nom-prenom').val(),
      fonction: $('#fonction').val(),
    };

    return axios.put(
      `/api/service/${idService}/homologation/autorite`,
      donnees
    );
  });
});
