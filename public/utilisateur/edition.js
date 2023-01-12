import brancheSoumissionFormulaireUtilisateur from '../modules/interactions/brancheSoumissionFormulaireUtilisateur.js';

$(() => {
  const selecteurFormulaire = 'form.utilisateur#edition';
  const action = (donnees) => {
    const { motDePasse, cguAcceptees, ...resteDuProfil } = donnees;
    return axios.put('/api/motDePasse', { motDePasse, cguAcceptees })
      .then(() => axios.put('/api/utilisateur', resteDuProfil))
      .then(() => (window.location = '/espacePersonnel'));
  };

  brancheSoumissionFormulaireUtilisateur(selecteurFormulaire, action);
});
