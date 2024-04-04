import brancheChampsMotDePasse from './modules/interactions/brancheChampsMotDePasse.mjs';
import { brancheModale } from './modules/interactions/modale.mjs';
import { brancheValidation } from './modules/interactions/validation.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

const afficheBandeauMajProfil = () =>
  axios
    .get('/api/utilisateurCourant')
    .then(({ data }) => data.utilisateur.completudeProfil)
    .then((completudeProfil) => {
      if (completudeProfil.estComplet) {
        return;
      }
      if (completudeProfil.champsNonRenseignes.includes('nom')) {
        $('#bandeau-profil').removeClass('invisible');
      } else if (completudeProfil.champsNonRenseignes.includes('siret')) {
        $('#bandeau-siret').removeClass('invisible');
      }
    });

$(() => {
  brancheModale('#nouveau-service', '#modale-nouveau-service');
  afficheBandeauMajProfil();
  brancheValidation('.tiroir form');
  tableauDesServices.recupereServices();
  gestionnaireEvenements.brancheComportement();

  brancheChampsMotDePasse($('.conteneur-formulaire'));
});
