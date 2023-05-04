import gestionnaireTirroir from './gestionnaireTirroir.mjs';
import tableauDesServices from './tableauDesServices.mjs';
import gestionnaireActionsTirroir from './gestionnaireActionsTirroir.mjs';

const gestionnaireEvenements = {
  brancheComportement: () => {
    $('#recherche-service').on('input', (e) => {
      tableauDesServices.modifieRecherche($(e.target).val());
    });

    $('.tableau-services thead th:not(:first):not(:last)').on('click', (e) => {
      const colonne = $(e.target).data('colonne');
      tableauDesServices.modifieTri(colonne);
    });

    $('.tableau-services').on('click', (e) => {
      const $elementClique = $(e.target);
      if ($elementClique.hasClass('selection-service')) {
        gestionnaireEvenements.selectionneService($elementClique);
      } else if ($elementClique.hasClass('checkbox-selection-tous-services')) {
        gestionnaireEvenements.selectionneTousServices($elementClique);
      } else if ($elementClique.hasClass('texte-nombre-service')) {
        gestionnaireEvenements.afficheMenuAction($elementClique);
      } else if ($elementClique.hasClass('action')) {
        gestionnaireEvenements.afficheTiroirAction($elementClique);
      } else {
        gestionnaireEvenements.fermeMenuFlottant();
      }
    });

    $('.tirroir .fermeture-tirroir').on('click', () => {
      gestionnaireTirroir.basculeOuvert(false);
    });

    $('#action-duplication').on('click', () => {
      gestionnaireActionsTirroir.duplique();
    });
  },
  afficheTiroirAction: ($action) => {
    gestionnaireTirroir.afficheContenuAction($action.data('action'));
    gestionnaireEvenements.fermeMenuFlottant();
  },
  afficheMenuAction: ($bouton) => {
    if (tableauDesServices.servicesSelectionnes.size === 0) return;
    const doitOuvrirMenu = !$bouton.parents('.conteneur-selection-services').hasClass('actif');
    gestionnaireEvenements.fermeMenuFlottant();
    if (doitOuvrirMenu) {
      $bouton.parents('.conteneur-selection-services').addClass('actif');
      $('.menu-flotant.actions-services').removeClass('invisible');
    } else {
      $bouton.parents('.conteneur-selection-services').removeClass('actif');
      $('.menu-flotant.actions-services').addClass('invisible');
    }
  },
  selectionneService: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    const idService = $checkbox.parents('.ligne-service').data('id-service');
    tableauDesServices.basculeSelectionService(idService, selectionne);
    gestionnaireEvenements.fermeMenuFlottant();
    tableauDesServices.afficheEtatSelection();
    gestionnaireTirroir.basculeOuvert(false);
  },
  selectionneTousServices: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    $checkbox.removeClass('selection-partielle');

    $('.selection-service').each((_, input) => {
      const $checkboxService = $(input);
      tableauDesServices.basculeSelectionService($checkboxService.parents('.ligne-service').data('id-service'), selectionne);
      $checkboxService.prop('checked', selectionne);
    });

    gestionnaireEvenements.fermeMenuFlottant();
    tableauDesServices.afficheEtatSelection();
    gestionnaireTirroir.basculeOuvert(false);
  },
  fermeMenuFlottant: () => {
    $('.action-lien').removeClass('actif');
    $('.conteneur-selection-services').removeClass('actif');
    $('.menu-flotant').addClass('invisible');
  },
};

export default gestionnaireEvenements;
