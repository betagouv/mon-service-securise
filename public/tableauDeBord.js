import { brancheModale } from './modules/interactions/modale.mjs';
import gestionnaireTirroir from './modules/tableauDeBord/gestionnaireTirroir.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

const remplisCartesInformations = (resume) => {
  $('#nombre-services').text(resume.nombreServices);
  $('#nombre-services-homologues').text(resume.nombreServicesHomologues);
  $('#indice-cyber-moyen').text(resume.indiceCyberMoyen?.toFixed(1) ?? '-');
};

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

const afficheBandeauMajProfil = () => {
  $('.bandeau-maj-profil').removeClass('invisible');
};

const recupereServices = () => {
  axios.get('/api/utilisateurCourant')
    .then(({ data }) => data.utilisateur)
    .then((utilisateur) => {
      axios.get('/api/services')
        .then(({ data }) => {
          remplisCartesInformations(data.resume);
          tableauDesServices.nombreServices = data.resume.nombreServices;
          tableauDesServices.fixeDonnees(data.services);
          tableauDesServices.afficheDonnees();
        });

      if (!utilisateur.profilEstComplet) afficheBandeauMajProfil();
    });
};

const gestionnaireActions = {
  brancheComportements: () => {
    $('#action-duplication').on('click', () => {
      const $nombreCopie = $('#nombre-copie');
      if ($nombreCopie.is(':valid')) {
        $nombreCopie.prop('disabled', true);
        $('#action-duplication').prop('disabled', true);

        const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
        const promesses = [...tableauDesServices.servicesSelectionnes].map((idService) => (
          tableauDeLongueur(nombreCopies).reduce((acc) => acc.then(
            () => axios({ method: 'copy', url: `/api/service/${idService}` })
          ), Promise.resolve())
        ));
        Promise.all(promesses).then(() => {
          $nombreCopie.prop('disabled', false);
          $('#action-duplication').prop('disabled', false);
          gestionnaireTirroir.basculeOuvert(false);
          recupereServices();
        });
      }
    });
  },
};

$(() => {
  brancheModale('#nouveau-service', '#modale-nouveau-service');

  recupereServices();

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

  gestionnaireActions.brancheComportements();
});
