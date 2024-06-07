import brancheChampsMotDePasse from './modules/interactions/brancheChampsMotDePasse.mjs';
import { brancheValidation } from './modules/interactions/validation.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

$(() => {
  brancheValidation('.tiroir form');
  tableauDesServices.recupereServices();
  gestionnaireEvenements.brancheComportement();

  brancheChampsMotDePasse($('.conteneur-formulaire'));
});
