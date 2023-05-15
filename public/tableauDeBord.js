import { brancheModale } from './modules/interactions/modale.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';
import { brancheValidation } from './modules/interactions/validation.mjs';

const afficheBandeauMajProfil = () =>
  axios
    .get('/api/utilisateurCourant')
    .then(({ data }) => data.utilisateur)
    .then((utilisateur) => {
      if (!utilisateur.profilEstComplet)
        $('.bandeau-maj-profil').removeClass('invisible');
    });

$(() => {
  brancheModale('#nouveau-service', '#modale-nouveau-service');
  afficheBandeauMajProfil();
  brancheValidation('.tiroir form');
  tableauDesServices.recupereServices();
  gestionnaireEvenements.brancheComportement();
});
