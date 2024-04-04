import brancheSoumissionFormulaireUtilisateur from '../modules/interactions/brancheSoumissionFormulaireUtilisateur.js';

const afficheBanniereMiseAJourSiret = () => {
  const { completudeProfil } = JSON.parse($('#infos-completude-profil').text());
  if (
    completudeProfil.champsNonRenseignes.includes('siret') &&
    !completudeProfil.champsNonRenseignes.includes('nom')
  ) {
    $('.banniere-avertissement').removeClass('invisible');
  }
};

$(() => {
  afficheBanniereMiseAJourSiret();
  const selecteurFormulaire = 'form.utilisateur#edition';
  const action = (donnees) =>
    axios
      .put('/api/utilisateur', donnees)
      .then(() => (window.location = '/tableauDeBord'));

  brancheSoumissionFormulaireUtilisateur(selecteurFormulaire, action);
});
