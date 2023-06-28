import gestionnaireBarreOutils from './gestionnaireBarreOutils.mjs';
import { gestionnaireTiroir } from './gestionnaireTiroir.mjs';
import registreDesActions from './registreActions.mjs';
import tableauDesServices, { ORDRE_DE_TRI } from './tableauDesServices.mjs';

const gestionnaireEvenements = {
  brancheComportement: () => {
    $('#recherche-service').on('input', (e) => {
      tableauDesServices.effaceSelection();
      tableauDesServices.modifieRecherche($(e.target).val());
    });

    const fermeMenusContextuelsSiClicEnDehors = (e) => {
      const $elementClique = $(e.target);
      const pasUnDeclencheur = !$elementClique.hasClass(
        'declencheur-menu-flottant'
      );
      const pasUnElementDuMenu =
        !$elementClique.parents('.declencheur-menu-flottant').length > 0;
      if (pasUnDeclencheur && pasUnElementDuMenu) {
        gestionnaireEvenements.fermeMenuFlottant();
      }
    };
    $(document).on('click', (e) => fermeMenusContextuelsSiClicEnDehors(e));

    $('.tableau-services thead th.triable').on('click', (e) => {
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
      } else if ($elementClique.hasClass('action')) {
        gestionnaireEvenements.afficheTiroirAction($elementClique);
      } else if ($elementClique.hasClass('contributeurs')) {
        const idService = $elementClique
          .parents('.ligne-service')
          .data('id-service');
        gestionnaireEvenements.afficheTiroirAction($elementClique, idService);
      } else if ($elementClique.hasClass('entete-contributeurs')) {
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

    $('.tiroir .fermeture-tiroir').on('click', () => {
      gestionnaireTiroir.basculeOuvert(false);
    });

    $('#action-duplication').on('click', () => {
      registreDesActions.duplication
        .execute()
        .then(() => gestionnaireTiroir.basculeOuvert(false))
        .catch(() => {});
    });

    $('#action-suppression').on('click', () => {
      registreDesActions.suppression
        .execute()
        .then(() => gestionnaireTiroir.basculeOuvert(false));
    });

    $('#action-invitation').on('click', () =>
      registreDesActions.invitation.execute()
    );

    $('#action-export-csv').on('click', () =>
      registreDesActions.export.execute()
    );

    $('#confirmation-suppression-contributeur').on('click', () =>
      registreDesActions.contributeurs.execute()
    );

    $('#retour-liste-contributeurs').on('click', () => {
      const idService = [...tableauDesServices.servicesSelectionnes][0];

      $('#barre-outils .action').removeClass('actif');
      gestionnaireTiroir.afficheContenuAction('contributeurs', idService);
      gestionnaireEvenements.fermeMenuFlottant();
    });

    $('#email-invitation-collaboration').on('input', () => {
      $('.message-erreur#invitation-deja-envoyee').hide();
    });
  },
  afficheTiroirAction: ($action, ...args) => {
    $('#barre-outils .action').removeClass('actif');
    $action.addClass('actif');
    gestionnaireTiroir.afficheContenuAction($action.data('action'), ...args);
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

      $('.entete-contributeurs')
        .attr('data-ordre', ordre)
        .attr('data-filtre-proprietaire', filtreEstProprietaire);

      tableauDesServices.appliqueTriContributeurs(ordre, filtreEstProprietaire);
    },
    bascule: () =>
      $('.entete-contributeurs .menu-flottant').toggleClass('invisible'),
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
