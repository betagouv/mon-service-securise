import gestionnaireTirroir from './gestionnaireTirroir.mjs';
import tableauDesServices from './tableauDesServices.mjs';

const gestionnaireEvenements = {
  gereAction: ($action) => {
    gestionnaireTirroir.afficheContenuAction($action.data('action'));
    gestionnaireEvenements.fermeToutMenuFlottant();
  },
  gereMenuAction: ($bouton) => {
    if (tableauDesServices.servicesSelectionnes.size === 0) return;
    const doitOuvrirMenu = !$bouton.parents('.conteneur-selection-services').hasClass('actif');
    gestionnaireEvenements.fermeToutMenuFlottant();
    if (doitOuvrirMenu) {
      $bouton.parents('.conteneur-selection-services').addClass('actif');
      $('.menu-flotant.actions-services').removeClass('invisible');
    } else {
      $bouton.parents('.conteneur-selection-services').removeClass('actif');
      $('.menu-flotant.actions-services').addClass('invisible');
    }
  },
  gereMenuFlotantLienService: ($bouton) => {
    const doitOuvrirMenu = !$bouton.hasClass('actif');
    gestionnaireEvenements.fermeToutMenuFlottant();
    if (doitOuvrirMenu) {
      const idService = $bouton.parents('.ligne-service').data('id-service');
      $bouton.addClass('actif');
      $(`.ligne-service[data-id-service='${idService}'] .menu-flotant.liens-services`).removeClass('invisible');
    }
  },
  gereSelectionService: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    const idService = $checkbox.parents('.ligne-service').data('id-service');
    tableauDesServices.basculeSelectionService(idService, selectionne);

    const nbServiceSelectionnes = tableauDesServices.servicesSelectionnes.size;
    const $checkboxTousServices = $('.checkbox-selection-tous-services');
    if (nbServiceSelectionnes === tableauDesServices.nombreServices) {
      $checkboxTousServices.removeClass('selection-partielle');
      $checkboxTousServices.prop('checked', true);
      $('.texte-nombre-service').text('Tous sélectionnés');
    } else if (nbServiceSelectionnes === 0) {
      $checkboxTousServices.removeClass('selection-partielle');
      $checkboxTousServices.prop('checked', false);
      $('.texte-nombre-service').text('0 sélectionné');
    } else {
      $checkboxTousServices.addClass('selection-partielle');
      $checkboxTousServices.prop('checked', false);
      $('.texte-nombre-service').text(`${nbServiceSelectionnes} sélectionné${nbServiceSelectionnes > 1 ? 's' : ''}`);
    }
    gestionnaireTirroir.basculeOuvert(false);
  },
  gereSelectionTousServices: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    $checkbox.removeClass('selection-partielle');

    $('.selection-service').each((_, input) => {
      const $checkboxService = $(input);
      tableauDesServices.basculeSelectionService($checkboxService.parents('.ligne-service').data('id-service'), selectionne);
      $checkboxService.prop('checked', selectionne);
    });
    $('.texte-nombre-service').text(selectionne ? 'Tous sélectionnés' : '0 sélectionné');
    gestionnaireTirroir.basculeOuvert(false);
  },
  fermeToutMenuFlottant: () => {
    $('.action-lien').removeClass('actif');
    $('.conteneur-selection-services').removeClass('actif');
    $('.menu-flotant').addClass('invisible');
  },
};

export default gestionnaireEvenements;
