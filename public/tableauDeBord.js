import { brancheModale } from './modules/interactions/modale.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

$(() => {
  brancheModale('#nouveau-service', '#modale-nouveau-service');
  tableauDesServices.recupereServices();
  gestionnaireEvenements.brancheComportement();
});
