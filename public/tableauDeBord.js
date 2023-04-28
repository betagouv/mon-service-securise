import { brancheModale } from './modules/interactions/modale.mjs';
import gestionnaireTirroir from './modules/tableauDeBord/gestionnaireTirroir.mjs';
import gestionnaireActionsTirroir from './modules/tableauDeBord/gestionnaireActionsTirroir.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

$(() => {
  brancheModale('#nouveau-service', '#modale-nouveau-service');

  tableauDesServices.recupereServices();

  $('#recherche-service').on('input', (e) => {
    tableauDesServices.modifieRecherche($(e.target).val());
  });

  $('.tableau-services thead th:not(:first):not(:last)').on('click', (e) => {
    const colonne = $(e.target).data('colonne');
    tableauDesServices.modifieTri(colonne);
  });

  $('.tableau-services').on('click', (e) => {
    const $elementClique = $(e.target);
    if ($elementClique.hasClass('action-liens-services')) {
      gestionnaireEvenements.gereMenuFlotantLienService($elementClique);
    } else if ($elementClique.hasClass('selection-service')) {
      gestionnaireEvenements.gereSelectionService($elementClique);
    } else if ($elementClique.hasClass('checkbox-selection-tous-services')) {
      gestionnaireEvenements.gereSelectionTousServices($elementClique);
    } else if ($elementClique.hasClass('texte-nombre-service')) {
      gestionnaireEvenements.gereMenuAction($elementClique);
    } else if ($elementClique.hasClass('action')) {
      gestionnaireEvenements.gereAction($elementClique);
    } else {
      gestionnaireEvenements.fermeToutMenuFlottant();
    }
  });

  $('.tirroir .fermeture-tirroir').on('click', () => {
    gestionnaireTirroir.basculeOuvert(false);
  });

  gestionnaireActionsTirroir.brancheComportements();
});
