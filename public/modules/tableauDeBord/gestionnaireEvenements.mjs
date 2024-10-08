import gestionnaireBarreOutils from './gestionnaireBarreOutils.mjs';
import { gestionnaireTiroir } from './gestionnaireTiroir.mjs';
import registreDesActions from './registreActions.mjs';
import tableauDesServices, { ORDRE_DE_TRI } from './tableauDesServices.mjs';

const gestionnaireEvenements = {
  brancheComportement: () => {
    gestionnaireTiroir.brancheComportement();

    $(document.body).on('collaboratif-service-modifie', () => {
      tableauDesServices.recupereServices();
    });

    $('#recherche-service').on('input', (e) => {
      tableauDesServices.effaceSelection();
      tableauDesServices.modifieRecherche($(e.target).val());
    });

    const fermeMenusContextuelsSiClicEnDehors = (e) => {
      const $elementClique = $(e.target);
      const pasUnDeclencheur = !$elementClique.hasClass(
        'declencheur-menu-flottant'
      );
      const pasUnMenu = !$elementClique.hasClass('.menu-flottant');
      const pasUnElementDuMenu =
        !$elementClique.parents('.menu-flottant').length > 0;

      if (pasUnDeclencheur && pasUnMenu && pasUnElementDuMenu) {
        gestionnaireEvenements.fermeMenuFlottant();
      }
    };
    $(document).on('click', (e) => fermeMenusContextuelsSiClicEnDehors(e));

    $('.tableau-services thead .triable').on('click', (e) => {
      const colonne = $(e.target).data('colonne');
      tableauDesServices.modifieTri(colonne);
    });

    $('.contenu-tiroir form').on('submit', (e) => e.preventDefault());

    $('.tableau-services').on('click', (e) => {
      const $elementClique = $(e.target);
      if ($elementClique.hasClass('selection-service')) {
        gestionnaireEvenements.selectionneService($elementClique);
      } else if ($elementClique.hasClass('checkbox-selection-tous-services')) {
        gestionnaireEvenements.basculeSelectionTousServices($elementClique);
      } else if ($elementClique.hasClass('checkbox-tous-services')) {
        gestionnaireEvenements.basculeSelectionTousServices($elementClique);
      } else if ($elementClique.hasClass('ouvre-tiroir')) {
        gestionnaireEvenements.brancheTiroirAction($elementClique);
      } else if ($elementClique.hasClass('bouton-contributeurs')) {
        gestionnaireEvenements.triContributeurs.bascule();
      } else if ($elementClique.hasClass('tri-contributeur')) {
        gestionnaireEvenements.triContributeurs.applique();
      } else if ($elementClique.hasClass('filtre-contributeur')) {
        tableauDesServices.effaceSelection();
        gestionnaireEvenements.triContributeurs.applique();
      } else if ($elementClique.hasClass('efface-tri-contributeurs')) {
        $('input[name="tri-contributeur"]').prop('checked', false);
        gestionnaireEvenements.triContributeurs.applique();
      }
    });

    gestionnaireEvenements.brancheExecutionActions();
  },
  brancheTiroirAction: ($elementClique) => {
    if ($elementClique.hasClass('contributeurs')) {
      const idService = $elementClique
        .parents('.ligne-service')
        .data('id-service');
      gestionnaireEvenements.afficheTiroirAction($elementClique, {
        donneesServices: [tableauDesServices.donneesDuService(idService)],
      });
    } else if ($elementClique.data('action') === 'contributeurs') {
      const donneesServices = [...tableauDesServices.servicesSelectionnes].map(
        (idService) => tableauDesServices.donneesDuService(idService)
      );
      gestionnaireEvenements.afficheTiroirAction($elementClique, {
        donneesServices,
      });
    } else if ($elementClique.data('action') === 'telechargement') {
      const idService = tableauDesServices.idServiceSelectionne();
      gestionnaireEvenements.afficheTiroirAction($elementClique, {
        idService,
        donneesService: tableauDesServices.donneesDuService(idService),
      });
    } else if ($elementClique.data('action') === 'suppression') {
      const nbServicesSelectionnes =
        tableauDesServices.servicesSelectionnes.size;
      const nomDuService = tableauDesServices.nomDuService(
        tableauDesServices.idServiceSelectionne()
      );
      gestionnaireEvenements.afficheTiroirAction($elementClique, {
        nbServicesSelectionnes,
        nomDuService,
      });
    } else
      gestionnaireEvenements.afficheTiroirAction($elementClique, {
        idServices: [...tableauDesServices.servicesSelectionnes],
      });
  },
  brancheExecutionActions: () => {
    $('#action-duplication').on('click', () => {
      registreDesActions.duplication
        .execute({ idService: tableauDesServices.idServiceSelectionne() })
        .then(() => {
          tableauDesServices.recupereServices();
          gestionnaireTiroir.basculeOuvert(false);
        })
        .catch(() => {});
    });

    $('#action-suppression').on('click', () => {
      registreDesActions.suppression
        .execute({ idServices: [...tableauDesServices.servicesSelectionnes] })
        .then(() => {
          tableauDesServices.servicesSelectionnes.clear();
          tableauDesServices.recupereServices();
          gestionnaireTiroir.basculeOuvert(false);
        })
        .catch(() => {});
    });
  },
  afficheTiroirAction: ($action, ...args) => {
    $('#barre-outils .action').removeClass('actif');
    $action.addClass('actif');
    gestionnaireTiroir.afficheContenuAction(
      {
        action: registreDesActions[$action.data('action')],
        estSelectionMulitple: tableauDesServices.servicesSelectionnes.size > 1,
      },
      ...args
    );
    gestionnaireEvenements.fermeMenuFlottant();
  },
  triContributeurs: {
    applique: () => {
      const ordre = ORDRE_DE_TRI.depuisString(
        $('input[name="tri-contributeur"]:checked').val()
      );

      const filtreEstProprietaire = $(
        'input.filtre-proprietaire-contributeurs'
      ).is(':checked');

      $('.bouton-contributeurs')
        .attr('data-ordre', ordre)
        .attr('data-filtre-proprietaire', filtreEstProprietaire);

      tableauDesServices.appliqueTriContributeurs(ordre, filtreEstProprietaire);
    },
    bascule: () =>
      $('.bouton-contributeurs + .menu-flottant').toggleClass('invisible'),
  },
  selectionneService: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    const idService = $checkbox.parents('.ligne-service').data('id-service');
    tableauDesServices.basculeSelectionService(idService, selectionne);
    gestionnaireEvenements.fermeMenuFlottant();
    tableauDesServices.afficheEtatSelection();
    gestionnaireBarreOutils.afficheOutils();
    gestionnaireTiroir.basculeOuvert(false);
  },
  basculeSelectionTousServices: ($checkbox) => {
    $checkbox.removeClass('selection-partielle');

    const pasEncoreToutCoche =
      tableauDesServices.servicesSelectionnes.size !==
      tableauDesServices.donneesAffichees.length;

    const doitCocherTousService =
      $checkbox.is(':checked') && pasEncoreToutCoche;

    $('.selection-service').each((_, input) => {
      const $checkboxService = $(input);
      tableauDesServices.basculeSelectionService(
        $checkboxService.parents('.ligne-service').data('id-service'),
        doitCocherTousService
      );
      $checkboxService.prop('checked', doitCocherTousService);
    });

    gestionnaireEvenements.fermeMenuFlottant();
    tableauDesServices.afficheEtatSelection();
    gestionnaireBarreOutils.afficheOutils();
    gestionnaireTiroir.basculeOuvert(false);
  },
  fermeMenuFlottant: () => {
    $('.menu-flottant').addClass('invisible');
    $('.declencheur-menu-flottant').removeClass('actif');
  },
};

export default gestionnaireEvenements;
