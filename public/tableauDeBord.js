import brancheChampsMotDePasse from './modules/interactions/brancheChampsMotDePasse.mjs';
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
      if (completudeProfil.champsNonRenseignes.includes('siret')) {
        $('#bandeau-siret').removeClass('invisible');
        return;
      }

      const autresChamps = {
        nom: { ancre: 'nom' },
        estimationNombreServices: { ancre: 'estimation-nombre-services' },
      };
      const premierChampManquant = completudeProfil.champsNonRenseignes.find(
        (c) => Object.keys(autresChamps).includes(c)
      );
      if (premierChampManquant) {
        const $bandeau = $('#bandeau-profil');
        const lien = $bandeau.attr('href');
        $bandeau.attr(
          'href',
          `${lien}#${autresChamps[premierChampManquant].ancre}`
        );
        $bandeau.removeClass('invisible');
      }
    });

$(() => {
  afficheBandeauMajProfil();
  brancheValidation('.tiroir form');
  tableauDesServices.recupereServices();
  gestionnaireEvenements.brancheComportement();

  brancheChampsMotDePasse($('.conteneur-formulaire'));
});
