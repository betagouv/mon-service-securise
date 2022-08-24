import brancheSoumissionFormulaireUtilisateur from './modules/interactions/brancheSoumissionFormulaireUtilisateur.js';
import { brancheValidationPersonnalisee, declencheErreurPersonnalisee } from './modules/interactions/validation.js';

const TYPE_ERREUR_ENVOI_EMAIL = 'ERREUR_ENVOI_EMAIL';
const MESSAGE_ERREUR_ENVOI_EMAIL = "Cet e-mail n'existe pas ou est introuvable. Veuillez en saisir un autre ou nous contacter.";

$(() => {
  const selecteurFormulaire = 'form#inscription';
  const selecteurChampEmail = '#email';

  const action = (donnees) => axios.post('/api/utilisateur', donnees)
    .then(() => (window.location = '/activation'))
    .catch(({ response }) => {
      if (response.status === 424 && response.data.type === TYPE_ERREUR_ENVOI_EMAIL) {
        declencheErreurPersonnalisee(selecteurChampEmail, MESSAGE_ERREUR_ENVOI_EMAIL);
      }
    });

  brancheValidationPersonnalisee(selecteurChampEmail);
  brancheSoumissionFormulaireUtilisateur(selecteurFormulaire, action);
});
