import brancheChampsMotDePasse from './modules/interactions/brancheChampsMotDePasse.mjs';
import { brancheModale } from './modules/interactions/modale.mjs';
import { brancheValidation } from './modules/interactions/validation.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

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

  brancheChampsMotDePasse($('.conteneur-formulaire'));

  // document.body.dispatchEvent(
  //   new CustomEvent('svelte-recharge-decouverte-fonctionnalite', {
  //     detail: {
  //       cible: $('.bom')[0],
  //       etapes: [
  //         { texte: "C'est par ici pour découvrir notre petit robot" },
  //         {
  //           texte:
  //             'Vous pouvez cliquer dessus pour faire apparaître des choses',
  //           action: 'click',
  //           cibleAction: $('.bom-vignette')[0],
  //         },
  //       ],
  //     },
  //   })
  // );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-decouverte-fonctionnalite', {
      detail: {
        cible: $('label[for="recherche-service"]')[0],
        etapes: [
          { texte: 'On peut aussi montrer un autre élément de MSS' },
          {
            texte: 'Et intéragir avec',
            action: 'input',
            cibleAction: $('#recherche-service')[0],
            donneesAction: ['M', 'o', 'n'],
          },
        ],
      },
    })
  );
});
